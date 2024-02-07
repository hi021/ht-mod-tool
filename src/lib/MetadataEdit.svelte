<script lang="ts">
   export let meta: App.ModMetadata;
   export let onSave: () => void;
   export let onCancel: () => void;

   console.log(meta);
</script>

<div class="bg form">
   <label>
      Mod name
      <input type="text" maxlength="30" bind:value={meta.name}>
   </label>

   <label>
      Mod authors
      <input type="text" maxlength="24" bind:value={meta.author}>
   </label>

   <label>
      Mod version
      <input type="text" maxlength="10" bind:value={meta.version}>
   </label>

   <div class="row btn-row">
      <button class="btn-none btn-menu btn-menu-cancel" on:click={onCancel}>
         <iconify-icon icon="ic:baseline-clear"/>
      </button>
      <button class="btn-none btn-menu btn-menu-confirm" on:click={onSave}>
         <iconify-icon icon="ic:baseline-check"/>
      </button>
   </div>
</div>

<style>
</style>