<script lang="ts">
	import ColorPicker from 'svelte-awesome-color-picker';
	export let hex: string;
</script>

<ColorPicker label="Pick Color" bind:hex />
