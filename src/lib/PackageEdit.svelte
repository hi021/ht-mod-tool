<script lang="ts">
   export let editing: App.Package;
   export let onExit: () => void;
</script>

<div class="bg column">
   <label>
      Performance
      <input type="number" bind:value={editing.perf}>
   </label>
   <button class="btn-green" on:click={onExit}>save</button>
</div>

<style>
   .bg {
      margin: auto;
      background-color: #eee;
      border-radius: 12px;
      padding: 14px;
   }
</style>