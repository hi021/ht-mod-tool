<script lang="ts">
   export let onOk: (() => void) | undefined = undefined;
</script>

<div class="overlay column-center">
   <div class="form">
      <p>
         <slot/>
      </p>

      <div class="row btn-row">
         <div/>
         <button class="btn-menu btn-menu-confirm" type="button" on:click={onOk}>
            <icon style="background-image: url('/icons/check.svg');"/>
         </button>
      </div>
   </div>
</div>

<style>
   .form {
      background-color: #fff;
      font-size: 1.5rem;
      width: auto;
      max-width: 80vw;
   }
</style>