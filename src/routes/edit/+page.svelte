<script lang="ts">
	import { goto } from '$app/navigation';
	import PackageEdit from '$lib/PackageEdit.svelte';
	import { GAME_RESEARCH, LEN_AUTHOR, LEN_NAME, LEN_VERSION, findResearch, formatNumber, parsePackageName } from '$lib/util';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
    import { save } from '@tauri-apps/api/dialog';
    import { writeTextFile } from '@tauri-apps/api/fs';
	import MetadataEdit from '$lib/MetadataEdit.svelte';
	import RdPreview from '$lib/RDPreview.svelte';
	import { slide } from 'svelte/transition';
	import { getVersion } from '@tauri-apps/api/app';
	import Notification from '$lib/Notification.svelte';

    let errorText = "";
    let notifText = "";
    const MOD: Writable<App.ModData> = getContext('MOD');
    let packagesSorted: App.Package[] = JSON.parse(JSON.stringify($MOD?.packages ?? []));
    let sortedBy = "default"; //field name or package no. as default
    let sortedAsc = false;

    function sortPackages() {
        if(sortedBy == "default") {
            packagesSorted = JSON.parse(JSON.stringify($MOD.packages));
            if(sortedAsc) packagesSorted = packagesSorted.reverse();
            return;
        }
        packagesSorted = packagesSorted.sort((a: Record<string, any>, b: Record<string, any>) =>
                            a[sortedBy] < b[sortedBy] ? sortedAsc ? 1 : -1 : sortedAsc ? -1 : 1);
    }
    
    function setSortedBy(field: string) {
        if(sortedBy == field) {
            sortedAsc = !sortedAsc;
            return;
        }
        sortedAsc = false;
        sortedBy = field;
    }

    $: sortedBy, sortedAsc, sortPackages();
    
    let lastScroll = 0; //used to set scroll back to last position after editing
    let editingIndex: number | null = null;
    let editingPackage: App.Package | null = null; //deep copies so you can cancel editing
    let editingResearch: App.Research | null = null;
    let editingMeta: App.ModMetadata | null = null;
    let STATE: "editPackage" | "editMeta" | "preview" | null = null;
    let lastDeleted: {pckg: App.Package, id: number, res?: App.Research} | null = null; //last deleted package so you can undo
    let lastDeletedTimeout: ReturnType<typeof setTimeout> | null = null;

    let asideExpanded = false; //is mouse in aside bar

    function exitEdit() {
        editingIndex = editingPackage = editingResearch = editingMeta = null;
        STATE = null;
        setTimeout(() => window.scroll({top: lastScroll}), 0); //gay hacky thing waiting for table to render
    }

    function onPackageEditSave() {
        if(editingIndex == null) {
            exitEdit();
            return;
        }

        const oldPckg = $MOD.packages[editingIndex];
        const oldRes = findResearch($MOD.research, oldPckg.name);

        //check for invalid name
        if(!editingPackage!.name.length || editingPackage!.name.length > 21 || !parsePackageName(editingPackage!.name) || editingPackage!.name.includes("|") || editingPackage!.name.includes(";")) {
            notifText = "The package name is invalid!<br>It may only contain alphanumeric characters, () brackets, and '!' '@' '#' '$' '%' '^' '&' '*' '-' '_' '=' '+' '.' ',' '?' '/' symbols."
            return;
        }
        //check for duplicates
        const duplicateNameIndex = $MOD.packages.findIndex((p) => p.name == editingPackage!.name);
        const duplicateNameIndexGame = GAME_RESEARCH.findIndex((r) => r.name == editingPackage!.name && r.tab == "CPU");
        if((duplicateNameIndex != -1 && duplicateNameIndex != editingIndex) || duplicateNameIndexGame != -1) {
            notifText = "A package with the same name already exists."
            notifText = editingIndex + "      " + $MOD.packages.findIndex((p) => p.name == editingPackage!.name) //TODO
            return;
        }
        
        if(editingPackage!.res < 1) {
            //has research
            editingResearch!.name = editingPackage!.name; //edit research name in case it was changed
            if(!$MOD.research) $MOD.research = [];
            if(!oldRes) $MOD.research.push(editingResearch as App.Research); //add new research
            else $MOD.research[oldRes.id] = editingResearch as App.Research; //edit existing research
        } else {
            //doesn't have research anymore
            if(oldRes && $MOD.research?.length)
                $MOD.research = $MOD.research.filter((r, i) => i != oldRes.id) //remove research
        }

        $MOD.packages[editingIndex] = editingPackage as App.Package;
        packagesSorted = JSON.parse(JSON.stringify($MOD.packages));
        sortPackages();

        exitEdit();
    }

    async function onMetaEditSave() {
        if(editingMeta) {
            editingMeta.name = editingMeta.name.trim().replaceAll("[", "").replaceAll("]", "").slice(0, LEN_NAME);
            editingMeta.author = editingMeta.author.trim().replaceAll("[", "").replaceAll("]", "").slice(0, LEN_AUTHOR);
            editingMeta.version = editingMeta.version.trim().replaceAll("[", "").replaceAll("]", "").slice(0, LEN_VERSION);

            const toolVersion = await getVersion();
            if(toolVersion) editingMeta.toolVersion = toolVersion.replaceAll("[", "").replaceAll("]", "");

            if(editingMeta.name.length && editingMeta.author.length && editingMeta.version.length) $MOD.meta = editingMeta;
        }
        exitEdit();
    }

    function edit(id: number) {
        lastScroll = window.scrollY;
        const originalId = $MOD.packages.findIndex((p) => p.name == packagesSorted[id].name);
        editingPackage = JSON.parse(JSON.stringify($MOD.packages[originalId]));
        if(!editingPackage) return;
        editingIndex = originalId;
        
        if(editingPackage.res < 1)
            editingResearch = JSON.parse(JSON.stringify(findResearch($MOD.research, editingPackage.name)?.res ?? null));

        STATE = "editPackage";
    }

    function editMeta() {
        if(STATE == "editMeta") {
            STATE = null;
            return;
        }

        editingMeta = JSON.parse(JSON.stringify($MOD.meta));
        STATE = "editMeta";
    }
    
    function removeResearch(id: number) {
        $MOD.research?.splice(id, 1);
    }

    function removePackage(id: number) {
        let deletedResearch;

        const pckg = packagesSorted[id];
        if(pckg.res < 2) {
            const res = findResearch($MOD.research, pckg.name);
            if(res?.id != null) {
                deletedResearch = JSON.parse(JSON.stringify(res.res));
                removeResearch(res.id);
            }
        }

        const originalId = $MOD.packages.findIndex((p) => p.name == pckg.name);
        packagesSorted.splice(id, 1);
        lastDeleted = {pckg: $MOD.packages.splice(originalId, 1)[0], id, res: deletedResearch};
        lastDeletedTimeout = setTimeout(() => lastDeleted = null, 10000);

        $MOD = $MOD;
        packagesSorted = packagesSorted;
    }

    function undoRemovePackage() {
        if(!lastDeleted) return;

        $MOD.packages.splice(lastDeleted.id, 0, lastDeleted.pckg);
        if(lastDeleted.res) $MOD.research?.push(lastDeleted.res);

        $MOD = $MOD;
        packagesSorted = JSON.parse(JSON.stringify($MOD.packages));
        sortPackages();
        lastDeleted = null;
        if(lastDeletedTimeout) clearTimeout(lastDeletedTimeout);
    }

    function addPackage() {
        $MOD.packages.push(
            {build: 0, cost: 1000, img: "DIP14", maxClock: 5000, maxCore: "0", name: "14 pin DIP", perf: 0, res: 1, stab: 0, time: 5, unit: 10}
        )
        sortPackages();
        edit($MOD.packages.length - 1);
    }

    const formatPackage = (p: App.Package) =>
        `${p.name}|${p.cost}|${p.time}|${p.unit}|${p.perf}|${p.stab}|${p.build}|${p.res}|${p.maxClock}|${p.maxCore}|${p.img};`

    //join entire research object using "|" and replace the last one with ";"
    const formatResearch = (r: App.Research) => {let s = ""; for(let i in r) s += (r as Record<string,any>)[i] + "|"; return s.replace(/.$/,";");}

    function formatHtMod(mod: App.ModData) {
        let string = `[Author: ${mod.meta.author}][Name: ${mod.meta.name}][Mod Version: ${mod.meta.version}][Supported Version: ${mod.meta.gameVersion}][Tool Version: ${mod.meta.toolVersion}]\n`
        string += "--Generated by Hardware Tycoon Mod Tool by Haxor--";

        if(mod.packages?.length) {
            string += "\nPackages{";
            for(const p of mod.packages) string += "\n" + formatPackage(p);
            string += "}";
        }
        if(mod.research?.length) {
            string += "\nResearch{";
            for(const r of mod.research) string += "\n" + formatResearch(r);
            string += "}";
        }

        return string;
    }

    async function saveMod() {
        try {
            const path = await save({
                filters: [{name: 'Mod file', extensions: ['htmod']}], 
                title: "Save " + $MOD.meta.name + " " + $MOD.meta.version})

            if(!path) return; //canceled
            await writeTextFile(path, formatHtMod($MOD));
        } catch(e) {
            errorText = e instanceof Error ? e.message : String(e);
        }
    }
</script>

<div class="main-container column">
{#if $MOD}
    <h2 class="row-center">
        <span>{$MOD.meta?.name}</span>
        <small>[{$MOD.meta?.version}]</small>
    </h2>
{/if}
{#if errorText}
    <p class="error-p">{errorText}</p>
{/if}
{#if notifText}
   <Notification onOk={() => {notifText = "";}}>
      {@html notifText}
   </Notification>
{/if}

<main class="row flex-fill">
{#if STATE == "editPackage" && editingPackage}
    <PackageEdit bind:editing={editingPackage} bind:research={editingResearch} onCancel={exitEdit} onSave={onPackageEditSave}/>
{:else if $MOD}
    {#if lastDeleted}
        <footer class="bottom-notif row-center unselectable" transition:slide={{duration: 200, axis: "y"}}>
            <p>
                Removed <strong style="font-weight: 500;">{lastDeleted.pckg.name}</strong>
                <button class="btn-menu-rect" on:click={undoRemovePackage}>Undo</button>
            </p>
        </footer>
    {/if}
    <div class="table-wrapper flex-fill">
    <aside class="column" class:aside-expand={asideExpanded} on:mouseenter={() => asideExpanded = true} on:mouseleave={() => asideExpanded = false}>
        <ul>
            <li class="row">
                <button class="aside-btn btn-none" on:click={() => STATE = STATE == "preview" ? null : "preview"}>
                    <icon style="background-image: url('/icons/preview.svg');" class="btn-menu" class:aside-active={STATE == "preview"}/>
                    <span class="btn-menu-text">Preview R&D</span>
                </button>
            </li>
    
            <li class="row">
                <button class="aside-btn btn-none" on:click={editMeta}>
                    <icon style="background-image: url('/icons/toc.svg');" class="btn-menu" class:aside-active={STATE == "editMeta"}/>
                    <span class="btn-menu-text">Mod settings</span>
                </button>
            </li>
    
            <li class="row">
                <button class="aside-btn btn-none" on:click={saveMod}>
                    <icon style="background-image: url('/icons/save.svg');" class="btn-menu"/>
                    <span class="btn-menu-text">Save mod file</span>
                </button>
            </li>
    
            <li class="row">
                <button class="aside-btn btn-none" on:click={() => goto("/")}>
                    <icon style="background-image: url('/icons/arrow-back.svg');" class="btn-menu"/>
                    <span class="btn-menu-text">Back to menu</span>
                </button>
            </li>
        </ul>
        </aside>

        {#if STATE == "preview"}
            <RdPreview onExit={() => STATE = null}/>
        {:else if STATE == "editMeta" && editingMeta}
            <MetadataEdit bind:meta={editingMeta} onCancel={exitEdit} onSave={onMetaEditSave}/>
        {:else if STATE != "editPackage"}
            <table class="package-table" style="{packagesSorted.length ? "" : "width: 55%; --radius: 0;"}">
                {#if packagesSorted.length}
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                        <th class="sortable" class:sorted={sortedBy == "name"} class:sortedAsc={sortedAsc} on:click={() => setSortedBy("name")}>Package</th>
                        <th class="sortable" class:sorted={sortedBy == "cost"} class:sortedAsc={sortedAsc} on:click={() => setSortedBy("cost")}>Cost</th>
                        <th class="sortable" class:sorted={sortedBy == "time"} class:sortedAsc={sortedAsc} on:click={() => setSortedBy("time")}>Time</th>
                        <th class="sortable" class:sorted={sortedBy == "unit"} class:sortedAsc={sortedAsc} on:click={() => setSortedBy("unit")}>Unit</th>
                        <th class="sortable" class:sorted={sortedBy == "perf"} class:sortedAsc={sortedAsc} on:click={() => setSortedBy("perf")}>Perf.</th>
                        <th class="sortable" class:sorted={sortedBy == "stab"} class:sortedAsc={sortedAsc} on:click={() => setSortedBy("stab")}>Stability</th>
                        <th class="sortable" class:sorted={sortedBy == "build"} class:sortedAsc={sortedAsc} on:click={() => setSortedBy("build")}>Build</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each packagesSorted as pckg, id}
                    <tr class="package-item" on:click={() => edit(id)}>
                        <td style="font-size: 67.5%;">#{id + 1}</td>
                        <td class="row"><img class="package-img" src="/package/{pckg.img}.png" alt=""></td>
                        <td>{pckg.name}</td>
                        <td>${formatNumber(Math.round(pckg.cost))}</td>
                        <td>{pckg.time}D</td>
                        <td>${Math.round(pckg.unit*100)/100}</td>
                        <td>{formatNumber(pckg.perf)}</td>
                        <td>{formatNumber(pckg.stab)}</td>
                        <td>{formatNumber(pckg.build)}</td>
                        <td>
                            {#if pckg.res < 1}
                            <icon class="tooltip" data-tooltip="Has associated research" style="background-image: url('/icons/science.svg');"/>
                            {/if}
                        </td>
                        <td>
                            <button class="btn-none btn-hover-highlight" on:click|stopPropagation={() => removePackage(id)}>
                                <icon style="background-image: url('/icons/delete.svg');"/>
                            </button>
                        </td>
                    </tr>
                    {/each}
                </tbody>
                {/if}
                <tr>
                    <td class="package-add-item" colspan="11">
                        <button type="button" on:click={addPackage} style="{$MOD.packages.length ? "" : "margin-top: 0;"}">
                            <icon style="background-image: url('/icons/add-circle-outline.svg');"/>
                        </button>
                    </td>
                </tr>
            </table>
        {/if}
    </div>
{:else}
<div class="column" style="margin: auto;">
    <h1>Uh oh!</h1>
    <p style="text-align: center;">
        Looks like the mod was loaded incorrectly.<br>
        Please reload the editor.
    </p>
    <button class="btn-blue" style="color: #eee;" on:click={() => goto('/')}>Back</button>
</div>
{/if}
</main>
</div>

<style>
    h2 {
        font-weight: 400;
        background-color: var(--color-ht-primary);
    }
    h2 small {
        font-size: 1rem;
        margin-left: 10px;
    }
    
    .main-container {
        min-height: 100vh;
    }
    main {
        min-height: auto;
    }
    .table-wrapper {
        position: relative;
    }

    .package-table {
        padding: 0;
        margin: 14px auto;
        height: fit-content;
        background-color: rgba(255, 255, 255, 0.75);
        border-collapse: collapse;
        text-align: center;
        --radius: 12px;
        border-top-right-radius: var(--radius);
        border-top-left-radius: var(--radius);
    }
    .package-table td {
        padding: 2px 8px;
        padding-right: 18px;
    }
    .package-table td:last-child {
        padding-right: 8px;
    }
    .package-table th {
        padding: 8px 10px;
        user-select: none;
        background-color: var(--color-ht-primary);
    }
    .package-table th:first-child {
        border-top-left-radius: var(--radius);
    }
    .package-table th:last-child {
        border-top-right-radius: var(--radius);
    }
    .sortable:hover,
    .sortable:focus {
        cursor: pointer;
        background-color: var(--color-highlight-blue);
    }
    .sorted {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .sorted::after {
        content: "";
        display: inline-block;
        height: 1.125em;
        width: 1.125em;
        margin-left: 2px;
        background-image: url('/icons/arrow-drop-up.svg');
        background-size: cover;
        background-repeat: no-repeat;
        background-origin: content-box;
    }
    .sortedAsc.sorted::after {
        transform: rotate(180deg);
    }

    .package-item {
        font-size: 1.25rem;
    }
    .package-item:hover {
        background-color: var(--color-highlight-blue);
        cursor: pointer;
    }
    .package-item button {
        font-size: 1.25rem;
    }
    .package-img {
        width: 48px;
        height: 48px;
    }

    .package-add-item {
        padding: 0 !important;
    }
    .package-add-item > button {
        width: 100%;
        background-color: rgba(174, 213, 129, 0.5);
        font-size: 1.5rem;
        padding: 6px;
        border: none;
        border-radius: 0;
        margin-top: 8px;
    }
    .package-add-item > button:hover {
        background-color: rgba(174, 213, 129, 1);
    }

    aside {
        position: absolute;
        top: 0;
        left: 0;
        align-items: flex-start;
        background-color: rgba(255, 255, 255, 0.5);
        height: 100%;
        user-select: none;
        box-shadow: 3px 0 2px rgba(0,0,0, 0.25);
        transition: background 0.2s ease-out;
        z-index: 3;
    }
    aside > ul {
        list-style: none;
        padding: 0;
        margin: 0;
        padding-top: 20px;
        position: sticky;
        top: 20px;
    }
    .aside-btn {
        width: 100%;
        padding: 6px 12px;
        margin-bottom: 8px;
        border-radius: 0;
        justify-content: left;
    }
    .aside-btn:focus,
    .aside-btn:hover {
        box-shadow: none;
        background-color: var(--color-ht-secondary);
    }
    .aside-active {
        background-color: var(--color-ht-secondary);
    }
    .btn-menu-text {
        max-width: 0;
        margin-left: 6px;
        font-size: 1.25rem;
        text-wrap: nowrap;
        line-height: 2;
        overflow: hidden;
        transition: max-width 0.2s ease-out;
    }
    .aside-expand {
        background-color: rgba(255, 255, 255, 0.8);
    }
    .aside-expand .btn-menu:not(.aside-active) {
        background-color: rgba(255, 255, 255, 1);
    }
    .aside-expand .btn-menu-text {
        max-width: 16ch;
    }

    .bottom-notif {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 100%;
        font-size: 1.125rem;
        z-index: 2;
    }
    .bottom-notif > p {
        margin: 0 auto;
        padding: 7px 20px;
        background-color: rgba(255, 255, 255, 0.8);
    }
    .bottom-notif .btn-menu-rect {
        margin-left: 8px;
        background-color: var(--color-ht-secondary);
    }
    .bottom-notif .btn-menu-rect:hover {
        background-color: var(--color-highlight-blue);
    }

    .error-p {
        position: sticky;
        top: 0;
        margin: 0;
    }
</style>