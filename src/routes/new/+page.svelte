<script lang="ts">
	import { goto } from '$app/navigation';
	import { getVersion } from '@tauri-apps/api/app';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';

    const MOD: Writable<App.ModData> = getContext('MOD');
    const Len_Name = 30;
    const Len_Author = 24;
    const Len_Version = 10;

    let name = "";
    let author = "";
    let version = "";
    let gameVersion = "0.2.12";

    async function createMod() {
        if(name.length > Len_Name) name.slice(0, Len_Name);
        if(author.length > Len_Author) author.slice(0, Len_Author);
        if(version.length > Len_Version) version.slice(0, Len_Version);

        MOD.set({meta: {name, author, version, gameVersion, toolVersion: await getVersion()}, packages: [], research: []});

        goto("/edit");
    }
</script>

<main>
    <h2>Create a New Mod</h2>
    <form class="form">
        <label>
            Mod name
            <input type="text" id="name" name="mod name" maxlength="{Len_Name}" bind:value={name}>
            <small class="text-length">{name.length}/{Len_Name}</small>
        </label>
        <label>
            Mod authors' names
            <input type="text" id="author" name="mod author" maxlength="{Len_Author}" bind:value={author}>
            <small class="text-length">{author.length}/{Len_Author}</small>
        </label>
        <label>
            Mod version
            <input type="text" id="version" name="mod version" maxlength="{Len_Version}" bind:value={version}>
        </label>
        <label>
            Hardware Tycoon version
            <select id="gameVersion" name="game version" bind:value={gameVersion}>
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