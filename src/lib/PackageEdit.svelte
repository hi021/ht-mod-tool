<script lang="ts">
   export let editing: App.Package;
   export let onSave: () => void;
   export let onCancel: () => void;
</script>

<div class="bg form row">
   <div class="row">
      <label>
         Package type
         <select>
            <option>DIP</option>
            <option>PLCC</option>
            <option>PGA</option>
            <option>Custom</option>
         </select>
      </label>
      <label>
         Num pins
         <input type="number" min="2" max="9999" step="1" placeholder="2-9999">
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
      <input type="number" min="200" step="1" placeholder="in kHz" bind:value={editing.maxClock}>
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
      <label>
         Design cost
         <input type="number" min="0" step="1" placeholder="in $" bind:value={editing.cost}>
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

   <div class="row">
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
   </div>

   <div class="row btn-row">
      <button class="btn-none btn-menu" on:click={onCancel}>
         <iconify-icon icon="ic:baseline-clear"/>
      </button>
      <button class="btn-none btn-menu" on:click={onSave}>
         <iconify-icon icon="ic:baseline-check"/>
      </button>
   </div>
</div>

<style>
   .btn-row {
      justify-content: space-between;
      margin-top: 8px;
   }
</style>