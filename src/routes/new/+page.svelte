<script lang="ts">
	import { goto } from '$app/navigation';
	import { HT_VERSION, LEN_AUTHOR, LEN_NAME, LEN_VERSION } from '$lib/util';
	import { getVersion } from '@tauri-apps/api/app';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

    const MOD: Writable<App.ModData> = getContext('MOD');

    let name = "";
    let author = "";
    let version = "";
    let gameVersion = HT_VERSION;
    const errors: string[] = [];

    async function createMod() {
        errors.length = 0;

        name = name.trim().slice(0, LEN_NAME);
        author = author.trim().slice(0, LEN_AUTHOR);
        version = version.trim().slice(0, LEN_VERSION);

        if(name.includes('[') || name.includes(']')) errors.push('name');
        if(author.includes('[') || author.includes(']')) errors.push('author');
        if(version.includes('[') || version.includes(']')) errors.push('version');
        if(gameVersion != HT_VERSION) errors.push('gameVersion'); //only allow 0.2.12
        if(errors.length) return;

        MOD.set({meta: {name, author, version, gameVersion, toolVersion: await getVersion()}, packages: [], research: []});

        goto("/edit");
    }
</script>

<main>
    <h2>Create a New Mod</h2>
    <form class="form column-center">
        <label class="label-long">
            Mod name
            <input type="text" class:error={errors.includes('name')} id="mod_name" name="mod name" maxlength="{LEN_NAME}" spellcheck="false" bind:value={name}>
            <div class="bar-length" style="width: {name.length/LEN_NAME * 100}%;"></div>
            <small class="text-length">{name.length}/{LEN_NAME}</small>
        </label>
        <label class="label-long">
            Mod authors' names
            <input type="text" class:error={errors.includes('author')} id="mod_author" name="mod author" maxlength="{LEN_AUTHOR}" spellcheck="false" bind:value={author}>
            <div class="bar-length" style="width: {author.length/LEN_AUTHOR * 100}%;"></div>
            <small class="text-length">{author.length}/{LEN_AUTHOR}</small>
        </label>
        <label>
            Mod version
            <input type="text" class:error={errors.includes('version')} id="mod_version" name="mod version" autocomplete="new-password" maxlength="{LEN_VERSION}" spellcheck="false" bind:value={version}>
            <small class="text-length">{version.length}/{LEN_VERSION}</small>
        </label>
        <label>
            Hardware Tycoon version
            <select id="game_version" name="game version" bind:value={gameVersion}>
                <option>{HT_VERSION}</option>
            </select>
        </label>

        {#if errors.length}
            <p class="error-p">
                Names must not contain square brackets []!
            </p>
        {/if}

        <div class="row btn-row">
            <button class="btn-menu btn-menu-cancel" type="button" on:click={() => goto("/")}>
                <icon style="background-image: url('/icons/clear.svg');"/>
            </button>
            <button class="btn-menu btn-menu-confirm" type="submit" on:click={createMod}>
                <icon style="background-image: url('/icons/check.svg');"/>
            </button>
        </div>
    </form>
</main>

<style>
    h2 {
        font-size: 2rem;
    }

    .bar-length {
        background-color: var(--color-ht-primary);
        max-width: 100%;
        height: 5px;
    }

    input, select {
        border: none;
        background-color: rgba(255,255,255, 0.5);
        border-radius: 0;
    }
    
    .error {
        background-color: rgba(255, 20, 50, 0.5);
    }
</style>