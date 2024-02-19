<script lang="ts">
   import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import RdTechnology from "./RDTechnology.svelte";
	import { GAME_RESEARCH, findResearch } from './util';

   export let onExit: () => void;

   const MOD: Writable<App.ModData> = getContext('MOD');

   //assume all unresearched packages have associated research
   const userResearchPackages = $MOD.packages.filter((p) => !p.res);
   const userResearch: {[packageName: string]: App.Research} = {};
   for(const i in userResearchPackages)
      userResearch[userResearchPackages[i].name] = findResearch($MOD.research, userResearchPackages[i].name)!.res;
</script>

<div class="wrapper column">
   <div class="top-bg row unselectable">
      <button class="btn-none btn-circle" on:click={onExit}>
         <icon style="background-image: url('/icons/clear.svg');"/>
      </button>
      <span>Research & Development</span>
   </div>
   <div class="bg row">
      {#each GAME_RESEARCH as res}
         {#if res.tab == "CPU"}
            <RdTechnology {res}/>
         {/if}
      {/each}
            
      {#if userResearchPackages}
         {#each userResearchPackages as pckg}
            <RdTechnology res={userResearch[pckg.name]} img={pckg.img}/>
         {/each}
      {/if}
   </div>
</div>

<style>
   .wrapper {
      width: 78vw;
      height: 80vh;
      margin: auto;
   }
   .top-bg {
      background-color: var(--color-ht-primary);
      align-items: center;
      padding: 12px;
      font-size: 1.5rem;
      color: #fff;
   }
   .bg {
      position: relative;
      padding: 24px;
      overflow: auto;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
	   background-color: rgba(255, 255, 255, 0.42);
      scroll-behavior: smooth;
      height: 100%;
   }

   .btn-circle {
      padding: 8px;
      border-radius: 50%;
      margin-right: 12px;
      filter: invert(1);
   }
   .btn-circle:hover,
   .btn-circle:focus {
      background-color: rgba(0,0,0, 0.25);
      box-shadow: none;
   }
</style>