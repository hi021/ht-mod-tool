<script lang="ts">
	import { goto } from '$app/navigation';
	import { LEN_AUTHOR, LEN_NAME, LEN_VERSION } from '$lib/util';
	import { getVersion } from '@tauri-apps/api/app';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

    const MOD: Writable<App.ModData> = getContext('MOD');

    let name = "";
    let author = "";
    let version = "";
    let gameVersion = "0.2.12";

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
            <small class="text-length">{name.length}/{LEN_NAME}</small>
        </label>
        <label class="label-long">
            Mod authors' names
            <input type="text" id="mod_author" name="mod author" maxlength="{LEN_AUTHOR}" spellcheck="false" bind:value={author}>
            <small class="text-length">{author.length}/{LEN_AUTHOR}</small>
        </label>
        <label>
            Mod version
            <input type="text" id="mod_version" name="mod version" autocomplete="new-password" maxlength="{LEN_VERSION}" spellcheck="false" bind:value={version}>
        </label>
        <label>
            Hardware Tycoon version
            <select id="game_version" name="game version" bind:value={gameVersion}>
                <option>0.2.12</option>
                <!-- <option>0.2.11</option>
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
            <iconify-icon icon="ic:baseline-clear"/>
        </button>
        <button class="btn-menu btn-menu-confirm" type="submit" on:click={createMod}>
            <iconify-icon icon="ic:baseline-check"/>
        </button>
    </div>
</form>

</main>

<style>
</style>