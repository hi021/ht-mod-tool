<script lang="ts">
	import { onMount } from "svelte";

   export let editing: App.Package;
   export let onSave: () => void;
   export let onCancel: () => void;

   const Len_PackageName = 10;

   let packageType: "DIP" | "PLCC" | "PGA" | "Custom";
   let packageName: "DIP" | "PLCC" | "PGA" | string; //may only contain letters
   let numPins: number;

   $: editing.name = packageName + " " + numPins;

   onMount(() => {
      const namePattern = new RegExp('(\\d+) pin ([A-Z]+)', 'i'); //e.g. 20 pin DIP
      const reg = namePattern.exec(editing.name);

      if(!reg?.[0]) {
         //invalid name
         editing.name = "14 pin DIP";
         packageName = packageType = "DIP";
         numPins = 14;
      } else {
         packageName = reg[2].slice(0, Len_PackageName);
         if(packageName == "DIP" || packageName == "PLCC" || packageName == "PGA") packageType = packageName;
         else packageType = "Custom";
         numPins = Math.min(Math.max(parseInt(reg[1]), 2), 9999); //2 - 9999
      }
   })
</script>

<div class="form">
   <h3>{editing.name}</h3>

   <div class="row">
      <label>
         Package type
         <select bind:value={packageType}>
            <option>DIP</option>
            <option>PLCC</option>
            <option>PGA</option>
            <option>Custom</option>
         </select>
         {#if packageType == "Custom"}
            <input type="text" name="customPackageName" maxlength={Len_PackageName} bind:value={packageName}>
         {/if}
      </label>
      <label>
         Num pins
         <input type="number" min="2" max="9999" step="1" placeholder="2-9999" bind:value={numPins}>
      </label>
      <label>
         Image
         <select bind:value={editing.img}>
            <option>DIP14</option>
            <option>DIP18</option>
            <option>DIP24</option>
            <option>DIP32</option>
            <option>DIP40</option>
            <option>DIP48</option>
            <option>DIP56</option>
            <option>PLCC24</option>
            <option>PLCC32</option>
            <option>PLCC48</option>
            <option>PLCC56</option>
            <option>PLCC64</option>
            <option>PGA</option>
            <option value="PGAGold">PGA Gold</option>
            <option value="PGANew">PGA New</option>
            <option value="PGAModern">PGA Modern</option>
            <option>LGA</option>
         </select>
      </label>

      <img class="unselectable" alt="Package" src="/package/{editing.img}.png">
   </div>

   <label>
      Max clock
      <input type="number" min="200" max="1000000000000" step="1" placeholder="in kHz" bind:value={editing.maxClock}>
      <small>
         {#if editing.maxClock < 100000000}
            {Math.floor(editing.maxClock/10)/100} MHz
         {/if}
         {#if editing.maxClock > 100000}
            {Math.floor(editing.maxClock/10000)/100} GHz
         {/if}
      </small>
   </label>
   <label>
      Researched
      <input type="checkbox">
   </label>
   <label>
      Supported core
      <select bind:value={editing.maxCore}>
         <option value="0">Single-core</option>
         <option value="1">Experimental dual-core</option>
         <option value="2">Basic dual-core</option>
         <option value="3">Dual-core</option>
         <option value="4">Triple-core</option>
         <option value="5">Quad-core</option>
      </select>
   </label>

   <div class="row">
      <div class="column">
         <label>
            Design cost
            <input type="number" min="0" max="1000000000" step="1" placeholder="in $" bind:value={editing.cost}>
         </label>
         <label>
            Design time
            <input type="number" min="0" step="1" max="9999" placeholder="in days" bind:value={editing.time}>
         </label>
         <label>
            Unit cost
            <input type="number" min="0" step="0.01" max="1000" placeholder="in $" bind:value={editing.unit}>
         </label>
      </div>
      <div class="column">
         <label>
            Performance
            <input type="number" step="0.01" bind:value={editing.perf}>
         </label>
         <label>
            Stability
            <input type="number" step="0.01" bind:value={editing.stab}>
         </label>
         <label>
            Build
            <input type="number" step="0.01" bind:value={editing.build}>
         </label>

         <span>{Math.floor((editing.perf + editing.stab + editing.build) * 100)/100} total</span>
         <span><strong>{Math.round((editing.perf + editing.stab + editing.build) / editing.unit*100)/100}</strong> score/cost</span>
      </div>
   </div>

   <div class="row btn-row">
      <button class="btn-menu btn-menu-cancel" on:click={onCancel}>
         <iconify-icon icon="ic:baseline-clear"/>
      </button>
      <button class="btn-menu btn-menu-confirm" on:click={onSave}>
         <iconify-icon icon="ic:baseline-check"/>
      </button>
   </div>
</div>

<style>
</style>