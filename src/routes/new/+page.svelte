<script lang="ts">
	import { goto } from '$app/navigation';

    let mod: App.ModData;
    const Len_Name = 30;
    const Len_Author = 24;
    const Len_Version = 10;

    let name = "";
    let author = "";
    let version = "";
</script>

<main>
    <h2>Create a New Mod</h2>
    <form class="form">
        <label>
            Mod name
            <input type="text" id="name" name="name" maxlength="{Len_Name}" bind:value={name}>
            <small class="text-length">{name.length}/{Len_Name}</small>
        </label>
        <label>
            Mod authors' names
            <input type="text" id="author" name="author" maxlength="{Len_Author}" bind:value={author}>
            <small class="text-length">{author.length}/{Len_Author}</small>
        </label>
        <label>
            Mod version
            <input type="text" id="version" name="version" maxlength="{Len_Version}" bind:value={version}>
        </label>
        <label>
            Hardware Tycoon version
            <select id="gameVersion" name="gameVersion">
                <option>0.2.12</option>
                <!-- <option>0.2.11</option>
            <option>0.2.10</option>
            <option>0.2.9</option>
            <option>0.2.8.3</option>
            <option>0.2.8.2</option>
            <option>0.2.8.1</option>
            <option>0.2.8</option> -->
        </select>
    </label>
    </form>

    <button class="btn" type="button" on:click={() => goto("/")}>Back</button>
    <button class="btn-blue" type="submit" on:click={() => goto("/edit")}>Next</button>
</main>

<style>

</style>