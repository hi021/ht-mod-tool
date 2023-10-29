<script lang="ts">
   export let editing: App.Package;
   export let onSave: () => void;
   export let onCancel: () => void;
</script>

<div class="bg column">
   <label>
      Design cost
      <input type="number" min="0" step="1" bind:value={editing.cost}>
   </label>
   <label>
      Design time
      <input type="number" min="0" step="1" max="9999" bind:value={editing.time}>
   </label>
   <label>
      Unit cost
      <input type="number" min="0" step="0.01" max="1000" bind:value={editing.unit}>
   </label>

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
   .bg {
      margin: auto;
      margin-top: 36px;
      background-color: #eee;
      border-radius: 12px;
      padding: 14px;
   }

   .btn-row {
      justify-content: space-between;
      margin-top: 8px;
   }
</style>