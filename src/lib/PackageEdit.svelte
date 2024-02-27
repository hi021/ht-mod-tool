<script lang="ts">
	import { MAX_RES_X, MAX_RES_Y, parsePackageName } from "./util";

   export let editing: App.Package;
   export let research: App.Research | null;
   export let onSave: () => void;
   export let onCancel: () => void;
   export let notifText: string;

   const Len_PackageName = 10; //package type max length

   let packageType: "DIP" | "PLCC" | "PGA" | "Custom";
   let packageName: "DIP" | "PLCC" | "PGA" | string;
   let numPins: number;

   //Parse package name and pins
   $: editing.name = numPins + " pin " + packageName;

   const parsedName = parsePackageName(editing.name);
   if(!parsedName) {
      editing.name = "14 pin DIP";
      packageName = packageType = "DIP";
      numPins = 14;
   } else {
      packageName = parsedName.packageName;
      packageType = parsedName.packageType
      numPins = parsedName.numPins;
   }

   function onResearchedChange(e: Event) {
      if((e.target as HTMLInputElement).checked) {
         editing.res = 1; //no research, already unlocked
      }
      else {
         if(!research) research =
            {category: packageType, cost: 5000, name: packageName, reqRes: 1, res: 1, resPoints: 100, tab: "CPU", x: 0, xp: 100, y: 0, year: 1970}
         editing.res = 0; //needs research
      }
   }

   function onSaveClick() {
      if(!editing.res && research) {
         if(research.x > MAX_RES_X) {
            notifText = `The maximum <strong>X position</strong> in this version of Hardware Tycoon is <strong>${MAX_RES_X}</strong>.<br>No research beyond that point will show up in the game.`;
            return;
         }
         if(research.y > MAX_RES_Y) {
            notifText = `The maximum <strong>Y position</strong> in this version of Hardware Tycoon is <strong>${MAX_RES_Y}</strong>.<br>No research beyond that point will show up in the game.`;
            return;
         }

         if(research.x < 1) research.x = 1;
      }

      if(editing.maxClock < 200) editing.maxClock = 200;
      if(Number(editing.maxCore) < 0) editing.maxCore = "0";
      if(editing.time < 0) editing.time = 0;

      if(numPins < 2 || numPins > 9999) {
         notifText = "Pin count must be between <strong>2</strong> and <strong>9999</strong>!"
         return;
      }
      if(packageName.length < 1) {
         notifText = "Package name must not be blank!"
         return;
      }

      onSave();
   }
</script>

<form class="form" class:notif-visible={notifText}>
   <h3>{editing.name}</h3>

   <div class="row" style="justify-content: space-around; width: 100%;">
      <div class="row">
         <label>
            Package type
            <select bind:value={packageType} disabled={!!notifText}
                     on:change={() => {if(packageType == "Custom") return; packageName = packageType;}}>
               <option>DIP</option>
               <option>PLCC</option>
               <option>PGA</option>
               <option>Custom</option>
            </select>

            <input type="text" name="customPackageName" maxlength={Len_PackageName} spellcheck="false" disabled={!!notifText}
                  bind:value={packageName} style="margin-top: 4px; visibility: {packageType == "Custom" ? "visible" : "hidden"};">
         </label>
         <label>
            Pin count
            <input type="number" min="2" max="9999" step="1" placeholder="2-9999" bind:value={numPins} disabled={!!notifText}>
         </label>
      </div>

      <div class="row-center">
         <label class="tooltip" data-tooltip="The appearance of any CPU using this package">
            Image
            <select bind:value={editing.img} disabled={!!notifText}>
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
   </div>

   <div class="row main-columns">
      <fieldset class="column" disabled={!!notifText}>
      <legend>Stats</legend>
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

         <span>{Math.floor((editing.perf + editing.stab + editing.build) * 100)/100} total</span>
      </fieldset>

      <fieldset class="column" disabled={!!notifText}>
      <legend>Basics</legend>
         <label>
            Design cost
            <input type="number" min="0" max="1000000000" step="1" placeholder="in $" bind:value={editing.cost}>
         </label>
         <label>
            Design time
            <input type="number" min="0" step="1" max="9999" placeholder="in days" bind:value={editing.time}>
         </label>
         <label>
            Unit cost
            <input type="number" min="0" step="0.01" max="1000" placeholder="in $" bind:value={editing.unit}>
         </label>

         <span><strong>{Math.round((editing.perf + editing.stab + editing.build) / editing.unit*100)/100}</strong> score/cost</span>
      </fieldset>

      <div class="column" style="width: {editing.res < 1 ? "auto" : "286.89px"};">
         {#if research && editing.res < 1}
            <fieldset class="column research-fieldset" disabled={!!notifText}>
            <legend>Research</legend>
               <div class="row">
                  <label class="tooltip" data-tooltip="Fixed one-time cost at the beginning of the research">
                     Research cost
                     <input type="number" min="0" max="1000000000" step="1" placeholder="in $" bind:value={research.cost}>
                  </label>
                  <label class="tooltip" data-tooltip="Research points necessary to finish researching the technology">
                     Research points
                     <input type="number" min="0" max="1000000" step="1" bind:value={research.resPoints}>
                  </label>
               </div>
               <div class="row">
                  <label class="tooltip" data-tooltip="CPU experience required to unlock the research (100 exp = 1 level)">
                     Required exp
                     <input type="number" min="0" max="1000000" step="1" bind:value={research.xp}>
                  </label>
                  <label class="tooltip" data-tooltip="Earliest year the package can be researched">
                     Unlock year
                     <input type="number" min="0" max="10000" step="1" bind:value={research.year}>
                  </label>
               </div>
               <div class="row">
                  <label class="tooltip" data-tooltip="Horizontal R&D Position
1 = width of one research box plus margin
(1-{MAX_RES_X})">
                     X position
                     <input type="number" min="0" max="200" step="0.01" bind:value={research.x}>
                  </label>
                  <label class="tooltip" data-tooltip="Vertical R&D Position
1 = height of one research box plus margin
(0-{MAX_RES_Y}, 0 = default row based on package type)">
                     Y position
                     <input type="number" min="0" max="100" step="0.01" bind:value={research.y}>
                  </label>
               </div>
            </fieldset>
         {/if}

         <label class="row-center" style="height: fit-content; margin-top: auto;">
            Researched
            <input type="checkbox" style="margin-left: 5px;" checked={editing.res >= 1} on:change={onResearchedChange}>
         </label>
      </div>
   </div>

   <fieldset class="row" style="margin-top: 4px;" disabled={!!notifText}>
      <legend>Limitations</legend>
         <label class="tooltip tooltip-center" data-tooltip="Highest supported clock speed in kHz">
            Max clock
            <input type="number" min="200" max="1000000000000" step="1" placeholder="in kHz" bind:value={editing.maxClock}>
            <small>
               {#if editing.maxClock >= 1000000000000}
                  TOO MUCH
               {:else if editing.maxClock > 100000}
                  {Math.floor(editing.maxClock/10000)/100} GHz
               {/if}
   
               {#if editing.maxClock < 100000000}
                  {Math.floor(editing.maxClock/10)/100} MHz
               {/if}
            </small>
         </label>
         <label class="tooltip tooltip-center" data-tooltip="Highest supported CPU core configuration">
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
   </fieldset>

   <div class="row btn-row">
      <button class="btn-menu btn-menu-cancel" type="button" on:click={onCancel} disabled={!!notifText}>
         <icon style="background-image: url('/icons/clear.svg');"/>
      </button>
      <button class="btn-menu btn-menu-confirm" type="submit" on:click={onSaveClick} disabled={!!notifText}>
         <icon style="background-image: url('/icons/check.svg');"/>
      </button>
   </div>
</form>

<style>
   .form {
      align-items: center;
      width: 82%;
   }
   .form.notif-visible input {
      visibility: hidden;
   }

   h3 {
      text-align: center;
      font-size: 2rem;
      margin-top: 0;
      margin-bottom: 6px;
   }

   .main-columns > fieldset {
      margin-right: 10px;
   }

   .research-fieldset label {
      margin-bottom: 5px;
   }

   img {
      width: 108px;
      height: 108px;
      padding: 0 3px;
      margin: 5px;
      background-color: rgba(255,255,255, 0.2);
      border-radius: 4px;
   }
</style>