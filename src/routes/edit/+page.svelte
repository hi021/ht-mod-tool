<script lang="ts">
	import { goto } from '$app/navigation';
	import PackageEdit from '$lib/PackageEdit.svelte';
	import { formatNumber } from '$lib/util';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
    import { save } from '@tauri-apps/api/dialog';
    import { writeTextFile } from '@tauri-apps/api/fs';

    let error = "";
    const MOD: Writable<App.ModData> = getContext('MOD');
    console.log($MOD);
    
    let lastScroll = 0; //used to set scroll back to last position after editing
    let editingIndex: number | null = null;
    let editingPackage: App.Package | null = null;
    let editingMeta = false;

    function exitEdit() {
        editingIndex = null;
        editingPackage = null;
        setTimeout(() => window.scroll({top: lastScroll}), 0); //gay hacky thing waiting for table to render
    }

    function onEditSave() {
        if(editingIndex != null) $MOD.packages[editingIndex] = editingPackage as App.Package;
        exitEdit();
    }

    function edit(id: number) {
        lastScroll = window.scrollY;
        console.log(lastScroll);
        editingIndex = id;
        editingPackage = JSON.parse(JSON.stringify($MOD.packages[id]));
    }
    
    function findResearch(name: string) {
        if(!$MOD?.research?.length) return null;

        const id = $MOD.research.findIndex((a) => a.name === name);
        if(id < 0) return null;
        const res = $MOD.research[id];

        return {id, res};
    }
    
    function removeResearch(id: number) {
        $MOD.research?.splice(id, 1);
    }

    function removePackage(id: number) {
        const pckg = $MOD.packages[id];
        if(pckg.res < 2) {
            const res = findResearch(pckg.name);
            if(res?.id != null) removeResearch(res.id);
        }

        $MOD.packages.splice(id, 1);
        console.log($MOD);
    }

    function addPackage() {
        $MOD.packages.push(
            {build: 0, cost: 100, img: "DIP14", maxClock: 5000, maxCore: 0, name: "", perf: 0, res: 2, stab: 0, time: 5, unit: 10}
        )
        edit($MOD.packages.length - 1);
    }

    function formatHtMod(mod: App.ModData) {
        return mod.meta.author;
    }

    async function saveMod() {
        try {
            const path = await save({
                filters: [{name: 'Mod file', extensions: ['htmod']}], 
                title: $MOD.meta.name + " " + $MOD.meta.version})
                
            if(!path) throw new Error("Unable to save to current path");

            await writeTextFile(path, formatHtMod($MOD));
        } catch(e) {
            error = e instanceof Error ? e.message : String(e);
        }
    }
</script>

<h2 class="row-center">
    <span>{$MOD.meta.name}</span>
    <small>[{$MOD.meta.version}]</small>
</h2>
{#if editingIndex == null}
    <header class="row">
        <button class="btn-none btn-menu" on:click={() => goto("/")}>
            <iconify-icon icon="ic:baseline-arrow-back"/>
        </button>
        <button class="btn-none btn-menu" on:click={() => goto("/")}>
            <iconify-icon icon="ic:baseline-toc"/>
        </button>
        <button class="btn-none btn-menu" on:click={() => goto("/")}>
            <iconify-icon icon="ic:baseline-preview"/>
        </button>
        <button class="btn-none btn-menu" on:click={saveMod}>
            <iconify-icon icon="ic:baseline-save"/>
        </button>
    </header>
{/if}
{#if error}
    <p class="error-p">{error}</p>
{/if}

<main class="column">
{#if editingPackage != null}
    <PackageEdit bind:editing={editingPackage} onCancel={exitEdit} onSave={onEditSave}/>
{:else if $MOD}
    <div class="table-wrapper flex-fill">
        <table class="package-table">
            {#if $MOD.packages?.length}
            <thead>
                <tr>
                    <th></th>
                    <th></th>
                    <th>Package</th>
                    <th>Cost</th>
                    <th>Time</th>
                    <th>Unit</th>
                    <th>Perf.</th>
                    <th>Stability</th>
                    <th>Build</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each $MOD.packages as pckg, id}
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
                        {#if pckg.res < 2}
                        <iconify-icon icon="ic:baseline-science" title="Has associated research" style="opacity: 0.7;"/>
                        {/if}
                    </td>
                    <td>
                        <button class="btn-none btn-hover-highlight" on:click|stopPropagation={() => removePackage(id)}>
                            <iconify-icon icon="ic:baseline-delete"/>
                        </button>
                    </td>
                </tr>
                {/each}
            </tbody>
            {/if}
            <tr>
                <td class="package-add-item" colspan="11">
                    <button type="button" on:click={addPackage}>
                        <iconify-icon icon="ic:baseline-add-circle-outline"/>
                    </button>
                </td>
            </tr>
        </table>
    </div>
{/if}
</main>


<style>
    main {
        min-height: auto;
    }

    h2 {
        text-align: center;
        user-select: none;
        margin: 0;
        padding: 10px 0;
        font-weight: 400;
        font-size: 1.75rem;
        background-color: var(--color-ht-primary);
    }
    h2 small {
        font-size: 1rem;
        margin-left: 10px;
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
        cursor: default;
        padding: 8px 10px;
        background-color: var(--color-ht-primary);
    }
    .package-table th:first-child {
        border-top-left-radius: var(--radius);
    }
    .package-table th:last-child {
        border-top-right-radius: var(--radius);
    }

    .package-item {
        font-size: 1.25rem;
    }
    .package-item:hover {
        background-color: var(--color-highlight-blue);
        cursor: pointer;
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
        margin-top: 10px;
    }
    .package-add-item > button:hover {
        background-color: rgba(174, 213, 129, 1);
    }

    header {
        position: sticky;
        top: 0;
        justify-content: space-between;
        background-color: rgba(0, 0, 0, 0.33);
        padding: 6px 12px;
    }
    .error-p {
        position: sticky;
        top: 0;
    }
</style>