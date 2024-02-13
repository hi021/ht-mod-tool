<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import '../app.css';

	const MOD: Writable<App.ModData> = writable();
	setContext('MOD', MOD);
</script>

<slot />
