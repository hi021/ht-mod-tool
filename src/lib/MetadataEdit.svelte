<script lang="ts">
	import { HT_VERSION, LEN_AUTHOR, LEN_NAME, LEN_VERSION } from "./util";

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
      <small class="text-length">{meta.version.length}/{LEN_VERSION}</small>
   </label>

   <p style="text-align: center; margin: 0; margin-bottom: 6px;">
      Supported game version<br>
      {meta.gameVersion}
   </p>
   {#if meta.gameVersion != HT_VERSION}
      <button class="btn-menu-rect" on:click={() => meta.gameVersion = HT_VERSION}>
         <icon style="background-image: url('/icons/arrow-circle-up.svg'); margin-right: 3px;"/>
         Set to {HT_VERSION}
      </button>
   {/if}

   <div class="row btn-row">
      <button class="btn-none btn-menu btn-menu-cancel" on:click={onCancel}>
         <icon style="background-image: url('/icons/clear.svg');"/>
      </button>
      <button class="btn-none btn-menu btn-menu-confirm" on:click={onSave}>
         <icon style="background-image: url('/icons/check.svg');"/>
      </button>
   </div>
</div>