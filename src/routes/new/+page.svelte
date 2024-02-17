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
    let errors = {name: false, author: false, version: false, gameVersion: false};
    let errorMsg = "";

    async function createMod() {
        errors = {name: false, author: false, version: false, gameVersion: false};

        name = name.trim().slice(0, LEN_NAME);
        author = author.trim().slice(0, LEN_AUTHOR);
        version = version.trim().slice(0, LEN_VERSION);

        if(!name.length) {
            errors.name = true;
            errorMsg = "All fields must be filled in!"
        }
        if(!author.length) {
            errors.author = true;
            errorMsg = "All fields must be filled in!"
        }
        if(!version.length) {
            errors.version = true;
            errorMsg = "All fields must be filled in!"
        }

        if(name.includes('[') || name.includes(']')) {
            errors.name = true;
            errorMsg = "Names must not contain square brackets []!"
        }
        if(author.includes('[') || author.includes(']')) {
            errors.author = true;
            errorMsg = "Names must not contain square brackets []!"
        }
        if(version.includes('[') || version.includes(']')) {
            errors.version = true;
            errorMsg = "Names must not contain square brackets []!"
        }
        if(gameVersion != HT_VERSION) {
            errors.gameVersion = true;
            errorMsg = "Invalid Hardware Tycoon version!"
        }
        if(errorMsg) return;

        MOD.set({meta: {name, author, version, gameVersion, toolVersion: await getVersion()}, packages: [], research: []});

        goto("/edit");
    }
</script>

<main>
    <h2>Create a New Mod</h2>
    <form class="form column-center">
        <label class="label-long">
            Mod name
            <input type="text" class:error={errors.name} id="mod_name" name="mod name" on:change={() => errors.name = false}
                    maxlength="{LEN_NAME}" spellcheck="false" bind:value={name}>
            <div class="bar-length" style="width: {name.length/LEN_NAME * 100}%;"></div>
            <small class="text-length">{name.length}/{LEN_NAME}</small>
        </label>
        <label class="label-long">
            Mod authors' names
            <input type="text" class:error={errors.author} id="mod_author" name="mod author" on:change={() => errors.author = false}
                    maxlength="{LEN_AUTHOR}" spellcheck="false" bind:value={author}>
            <div class="bar-length" style="width: {author.length/LEN_AUTHOR * 100}%;"></div>
            <small class="text-length">{author.length}/{LEN_AUTHOR}</small>
        </label>
        <label>
            Mod version
            <input type="text" class:error={errors.version} id="mod_version" name="mod version" on:change={() => errors.version = false}
                    autocomplete="new-password" maxlength="{LEN_VERSION}" spellcheck="false" bind:value={version}>
            <small class="text-length">{version.length}/{LEN_VERSION}</small>
        </label>
        <label>
            Hardware Tycoon version
            <select id="game_version" class:error={errors.gameVersion} name="game version" on:change={() => errors.gameVersion = false}
                    bind:value={gameVersion}>
                <option>{HT_VERSION}</option>
            </select>
        </label>

        {#if errorMsg}
            <p class="error-p">{errorMsg}</p>
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