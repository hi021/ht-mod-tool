<script lang="ts">
	import { parsePackageName } from "./util";

   export let res: App.BaseResearch;
   export let img: string | undefined = undefined; //package image name
   export let isMod = false; //whether is a part of a mod

   let y = res.y;
   const x = res.x - 1;
   const size = 84; //excluding 2px border | original sizes are: box - 73, img - 41, fullSize - 90px
   const fullSize = size + 18; //spacing
   const pad = 24; //padding inside bg container
   const parsedName = parsePackageName(res.name);

   //small research name
   const displayName = 
         parsedName ? parsedName.packageName + parsedName.numPins
                    : res.category == "Clock" ? res.name.split(" max clock ")[0] /*e.g. 2.4GHz, is split later*/
                    : res.category; 

   //set row according to category
   if(y <= 0) {
      switch(res.category) {
         case "CPU": {
            y = 1; break;
         }
         case "DIP": {
            y = 1; break;
         }
         case "Clock": {
            y = 2; break;
         }
         case "PLCC": {
            y = 3; break;
         }
         case "PGA": {
            y = 1; break;
         }
         case "Core": {
            y = 4; break;
         }
         default: {
            y = 4; break;
         }
      }
   }
   --y; //decrease x and y for in-game positioning
   
   //set image
   //is a user package with provided image
   if(img) img = `/package/${img}.png`;
   //is a game research 
   else {
      //is a default package
      if(parsedName) {
         if(parsedName.packageType == "DIP") {
            const pins = Math.min(parsedName.numPins, 56);
            img = `/package/DIP${pins}.png`;
         }
         else if(parsedName.packageType == "PLCC") {
            const pins = Math.min(parsedName.numPins, 64);
            img = `/package/PLCC${pins}.png`;
         }
         else if(parsedName.packageType == "PGA") {
            if(parsedName.numPins > 754) img = "/package/PGAModern.png";
            else if(parsedName.numPins > 282) img = "/package/PGANew.png";
            else if(parsedName.numPins > 112) img = "/package/PGAGold.png";
            else img = "/package/PGA.png";
         }
         else {
            //unknown package
            img = "/package/LGA.png";
         }
      }
      else if(res.category == "CPU") {
         img = "/RD/cpu.png";
      }
      else if(res.category == "Core") {
         //tri and quad core
         if(res.year >= 2005) img = "/RD/cpu_quad.png";
         else img = "/RD/cpu_dual.png";
      }
      //otherwise is clock research
   }
</script>

<div class="box column-center tooltip tooltip-abs" class:tooltip-bottom={y == 0} class:mod-research={isMod}
     style="top: {pad + fullSize*y}px; left: {pad + fullSize*x}px; min-width: {size}px; min-height: {size}px;"
data-tooltip="{res.name}
Cost: ${res.cost}
Research needed: {res.resPoints}
X {res.x}, Y {res.y}
Min. {res.xp} xp, Y{res.year}">

   {#if img}
      <img class="image unselectable" src={img} alt="">
      <small class="res-name" class:res-name-long={displayName.length >= 8} class:res-name-longer={displayName.length >= 12}>
         {displayName}
      </small>
   {:else}
      <!-- Clock speed research -->
      <div class="unselectable column-center">
         <strong style="font-size: 30px; margin: 0; line-height: 1;">{displayName.slice(0, displayName.length - 3)}</strong>
         <span style="font-size: 24px; line-height: 1;">{displayName.slice(displayName.length - 3)}</span>
      </div>
   {/if}
</div>

<style>
   .box {
      position: absolute;
      background-color: #fff;
      border: 2px solid #bbb;
   }
   .mod-research {
      border-color: rgb(10, 90, 45);
   }
   .image {
      width: 46px;
      height: 46px;
   }
   
   .res-name {
      position: absolute;
      bottom: 1px;
      right: 2px;
      width: 100%;
      color: #777;
      font-weight: 500;
      font-size: 16px;
      text-align: right;
      margin: 0;
      padding: 0;
      cursor: default;
      overflow: hidden;
   }
   .res-name-long {
      font-size: 14px;
   }
   .res-name-longer {
      font-size: 11px;
   }
</style>