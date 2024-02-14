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
         <button class="btn-menu btn-menu-confirm" on:click={onOk}>
            <icon style="background-image: url('/icons/check.svg');"/>
         </button>
      </div>
   </div>
</div>

<style>
   .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.125);
   }
   .form {
      background-color: #eee;
      font-size: 1.5rem;
   }
</style>