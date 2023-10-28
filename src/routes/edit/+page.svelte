<script lang="ts">
	import { goto } from '$app/navigation';
	import PackageEdit from '$lib/PackageEdit.svelte';
	import { formatNumber } from '$lib/util';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

    const MOD: Writable<App.ModData> = getContext('MOD');
    console.log($MOD);

    let editingIndex: number | null = null;
    const onEditExit = () => editingIndex = null;
</script>

<h2>{$MOD.meta.name}</h2>
<header class="row">
    <button class="btn" on:click={() => goto("/")}>
        <iconify-icon icon="ic:baseline-arrow-back"/>
    </button>
    <button class="btn" on:click={() => goto("/")}>
        <iconify-icon icon="ic:baseline-save"/>
    </button>
</header>

<main class="column">
{#if editingIndex != null}
    <PackageEdit editing={$MOD.packages[editingIndex]} onExit={onEditExit}></PackageEdit>
{:else if $MOD}    
    <div class="table-wrapper flex-fill">
        <table class="package-table">
            {#if $MOD.packages?.length}
            <thead>
                <tr>
                    <th></th>
                    <th>Package</th>
                    <th>Cost</th>
                    <th>Time</th>
                    <th>Unit</th>
                    <th>Perf.</th>
                    <th>Stability</th>
                    <th>Build</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each $MOD.packages as pckg, id}
                <tr class="package-item" on:click={() => editingIndex = id}>
                    <td class="row"><img class="package-img" src="/package/{pckg.img}.png" alt=""></td>
                    <td>{pckg.name}</td>
                    <td>${formatNumber(pckg.cost)}</td>
                    <td>{pckg.time}D</td>
                    <td>${pckg.unit}</td>
                    <td>{formatNumber(pckg.perf)}</td>
                    <td>{formatNumber(pckg.stab)}</td>
                    <td>{formatNumber(pckg.build)}</td>
                    <td>
                        {#if pckg.res < 2}
                        <iconify-icon icon="ic:baseline-science" title="Has associated research" style="opacity: 0.8;"/>
                        {/if}
                    </td>
                </tr>
                {/each}
            </tbody>
            {/if}
            <tr>
                <td class="package-add-item" colspan="9">
                    <button type="button"><iconify-icon icon="ic:baseline-add-circle-outline"/></button>
                </td>
            </tr>
        </table>
    </div>
{/if}
</main>


<style>
    h2 {
        text-align: center;
        user-select: none;
        margin: 0;
        padding: 10px 0;
        font-weight: 400;
        font-size: 1.75rem;
        background-color: var(--color-ht-primary);
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

    .package-add-item > button {
        width: 100%;
    }

    header {
        position: sticky;
        top: 0;
        justify-content: space-between;
        background-color: rgba(0, 0, 0, 0.2);
        padding: 8px;
    }
</style>