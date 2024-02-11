<script lang="ts">
	import { LEN_AUTHOR, LEN_NAME, LEN_VERSION } from "./util";

   export let meta: App.ModMetadata;
   export let onSave: () => void;
   export let onCancel: () => void;
</script>

<div class="form column-center">
   <label class="label-long">
      Mod name
      <input type="text" maxlength="{LEN_NAME}" bind:value={meta.name}>
      <small class="text-length">{meta.name.length}/{LEN_NAME}</small>
   </label>

   <label class="label-long">
      Mod authors' names
      <input type="text" maxlength="{LEN_AUTHOR}" bind:value={meta.author}>
      <small class="text-length">{meta.author.length}/{LEN_AUTHOR}</small>
   </label>

   <label>
      Mod version
      <input type="text" maxlength="{LEN_VERSION}" bind:value={meta.version}>
   </label>

   <p style="text-align: center;">
      Supported game version<br>
      {meta.gameVersion}
   </p>

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