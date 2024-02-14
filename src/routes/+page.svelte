<script lang="ts">
	import { goto } from "$app/navigation";
   import { getVersion } from '@tauri-apps/api/app';
	import { getContext, onMount } from "svelte";
   import { open } from '@tauri-apps/api/dialog';
   import { readTextFile } from '@tauri-apps/api/fs';
	import { HT_VERSION, parseMod } from "$lib/util";
	import type { Writable } from "svelte/store";
	import Notification from "$lib/Notification.svelte";

   const MOD: Writable<App.ModData> = getContext('MOD');
   let error = "";
   let notif = "";
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
            if(modParsed.meta.gameVersion != HT_VERSION) {
               notif = "OTHER_GAMEVER";
               return;
            } 

            goto('/edit');
         }
      } catch(e) {
         error = e instanceof Error ? e.message : String(e);
      }
   }
</script>

<main class="column">
   {#if notif == "OTHER_GAMEVER"}
      <Notification onOk={() => {notif = ""; goto('/edit');}}>
         This mod was created for a version of Hardware Tycoon other than <strong>{HT_VERSION}</strong>.<br>
         This version of the tool only supports {HT_VERSION}, meaning there may be inconsistencies between what you see here and in the game.<br><br>
         You can change the mod's supported game version in the settings after making sure it works to get rid of this warning.
      </Notification>
   {/if}
   <h1>Hardware Tycoon Mod Tool</h1>
   <h2>for Hardware Tycoon {HT_VERSION}</h2>
   
   <div class="btn-container column flex-fill">
      {#if $MOD?.meta}
         <button class="main-menu-btn" on:click={() => goto("/edit")}>Continue Editing {$MOD.meta.name}</button>
      {/if}
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
   h1 {
      margin: 0;
      margin-top: 16px;
      font-weight: 600;
      font-size: 2.5rem;
   }
   h2 {
      padding: 0;
      margin-bottom: 70px;
      margin-left: 50%;
      font-weight: 400;
      font-size: 1.75rem;
      text-align: left;
   }
   
   .btn-container {
      gap: 16px;
   }
   .main-menu-btn {
      background: none;
      width: 100%;
      font-size: 2rem;
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
      background-color: var(--color-ht-primary);
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
   }
</style>