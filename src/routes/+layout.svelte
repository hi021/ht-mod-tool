<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import '../app.css';

	const MOD: Writable<App.ModData> = writable();
	setContext('MOD', MOD);
	document.addEventListener('contextmenu', e => e.preventDefault());
	document.addEventListener('keydown', e => {
		if(e.key.startsWith("F") && e.key != "F3") {
			e.preventDefault();
			return;
		}
	});
</script>

<slot />
