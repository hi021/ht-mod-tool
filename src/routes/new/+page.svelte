<script lang="ts">
	import { goto } from '$app/navigation';

    let mod: App.ModData;
</script>

<main>
    <h2>Create new mod</h2>
    <form class="form">
        <input type="text" id="name" name="name">
        <input type="text" id="author" name="author">
        <input type="text" id="version" name="version">
        <select id="gameVersion" name="gameVersion">
            <option>0.2.12</option>
            <option>0.2.11</option>
            <option>0.2.10</option>
            <option>0.2.9</option>
            <option>0.2.8.3</option>
            <option>0.2.8.2</option>
            <option>0.2.8.1</option>
            <option>0.2.8</option>
        </select>
    </form>
    <button class="btn" type="button" on:click={() => goto("/")}>Back</button>
    <button class="btn-blue" type="submit" on:click={() => goto("/edit")}>Next</button>
</main>

<style>

</style>