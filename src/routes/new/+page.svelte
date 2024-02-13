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

    async function createMod() {
        //TODO VALIDATE AND FORBID [] CHARS
        name = name.trim().slice(0, LEN_NAME);
        author = author.trim().slice(0, LEN_AUTHOR);
        version = version.trim().slice(0, LEN_VERSION);

        MOD.set({meta: {name, author, version, gameVersion, toolVersion: await getVersion()}, packages: [], research: []});

        goto("/edit");
    }
</script>

<main>
    <h2>Create a New Mod</h2>
    <form class="form column-center">
        <label class="label-long">
            Mod name
            <input type="text" id="mod_name" name="mod name" maxlength="{LEN_NAME}" spellcheck="false" bind:value={name}>
            <div class="bar-length" style="width: {name.length/LEN_NAME * 100}%;"></div>
            <small class="text-length">{name.length}/{LEN_NAME}</small>
        </label>
        <label class="label-long">
            Mod authors' names
            <input type="text" id="mod_author" name="mod author" maxlength="{LEN_AUTHOR}" spellcheck="false" bind:value={author}>
            <div class="bar-length" style="width: {author.length/LEN_AUTHOR * 100}%;"></div>
            <small class="text-length">{author.length}/{LEN_AUTHOR}</small>
        </label>
        <label>
            Mod version
            <input type="text" id="mod_version" name="mod version" autocomplete="new-password" maxlength="{LEN_VERSION}" spellcheck="false" bind:value={version}>
            <small class="text-length">{version.length}/{LEN_VERSION}</small>
        </label>
        <label>
            Hardware Tycoon version
            <select id="game_version" name="game version" bind:value={gameVersion}>
                <option>{HT_VERSION}</option>
                <!-- 
                <option>0.2.12</option>
                <option>0.2.11</option>
                <option>0.2.10</option>
                <option>0.2.9</option>
                <option>0.2.8.3</option>
                <option>0.2.8.2</option>
                <option>0.2.8.1</option>
                <option>0.2.8</option> -->
        </select>
    </label>

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
</style>