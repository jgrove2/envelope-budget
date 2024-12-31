<script>
	import ChevronDown from "$lib/svg/ChevronDown.svelte";
	import ChevronUp from "$lib/svg/ChevronUp.svelte";

    let { direction } = $props();
</script>
{#if direction === 1}
    <ChevronDown/>
{:else}
    <ChevronUp />
{/if}