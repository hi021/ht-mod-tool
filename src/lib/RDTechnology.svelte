<script lang="ts">
	import { parsePackageName } from "./util";

   export let res: App.BaseResearch;
   export let img: string | undefined = undefined; //package image name

   const x = res.x;
   let y = res.y;
   const size = 128;
   const parsedName = parsePackageName(res.name);

   if(!y) {
      //set according to category
      switch(res.category) {
         case "CPU": {
            y = 1; break;
         }
      }
   }
</script>

<div class="box column" style="top: {size*y}px; left: {size*x}px;">
   {#if img}
      <img src="/package/{img}.png" alt="">
   {:else if parsedName}
      <img src="/package/DIP40.png" alt="">
   {:else}
      <img src="/package/LGA.png" alt="">
   {/if}

   <small>{res.name}</small>
</div>

<style>
   .box {
      position: relative;
      background-color: #ccc;
      padding: 3px;
      height: fit-content;
      width: fit-content;
   }

   small {
      text-align: right;
   }
</style>