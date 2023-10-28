<script lang="ts">
	import { goto } from "$app/navigation";
   import { getVersion } from '@tauri-apps/api/app';
	import { getContext, onMount } from "svelte";
   import { open } from '@tauri-apps/api/dialog';
   import { readTextFile } from '@tauri-apps/api/fs';
	import { parseMod } from "$lib/util";
	import type { Writable } from "svelte/store";

   const MOD: Writable<App.ModData> = getContext('MOD');
   let error = "";
   let appVersion: string;
   onMount(async () => {
      appVersion = await getVersion();
   })

   async function loadMod() {
      error = "";

      try {
         //selected file path
         const selected = await open({
            multiple: false,
            filters: [{name: 'Mod file', extensions: ['htmod']}]
         });
         
         if(selected) {
            const modRaw = await readTextFile(String(selected));
            if(!modRaw) throw new Error("Given file is empty.");
            const modParsed = parseMod(modRaw.split('\n'));
            if(!modParsed) throw new Error("Given mod file is empty or invalid.");

            MOD.set(modParsed);
            goto('/edit');
         }
      } catch(e) {
         error = e instanceof Error ? e.message : String(e);
      }
   }
</script>

<main class="column">
   <h1>Hardware Tycoon Mod Tool</h1>
   <h2>for Hardware Tycoon 0.2.12</h2>
   
   <div class="btn-container column flex-fill">
      <button class="main-menu-btn" on:click={() => goto("/new")}>New Modification</button>
      <button class="main-menu-btn" on:click={loadMod}>Load Modification</button>
      {#if error}
         <p class="error-p">{error}</p>
      {/if}
   </div>

   <footer class="row">
      <a href="https://haxor1337.itch.io/hardware-tycoon" target="_blank">v{appVersion} by Haxor on itch.io</a>
      <a href="https://hardware-tycoon.fandom.com/wiki/Modding_Guide" target="_blank">Guide</a>
   </footer>
</main>

<style>
   h1, h2 {
      margin: 0;
      text-align: center;
      user-select: none;
   }
   h1 {
      margin-top: 16px;
      font-weight: 500;
      font-size: 2.5rem;
   }
   h2 {
      margin-bottom: 40px;
      margin-left: 50%;
      font-weight: 400;
      font-size: 1.75rem;
   }
   
   .btn-container {
      gap: 16px;
   }
   .main-menu-btn {
      background: none;
      width: 100%;
      font-size: 1.75rem;
      border: none;
      border-radius: 0;
      padding: 12px 4px;
   }
   .main-menu-btn:hover,
   .main-menu-btn:focus {
      background-color: var(--color-ht-primary);
      color: var(--color-lightest);
      box-shadow: none;
      outline: none;
   }

   a {
      color: inherit;
      text-decoration: none;
   }
   a:hover,
   a:focus {
      color: var(--color-lightest);
   }

   footer {
      padding: 6px 12px;
      justify-content: space-between;
      background-color: rgba(0, 0, 0, 0.2);
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
   }
</style>