<script>
	import { get_cache, ZCache } from '$lib/z.svelte';

	new ZCache();
	let cache = get_cache();

	let { children } = $props();
</script>
<div class="budget-wrapper">
    {#key cache.z.userID}
	{@render children()}
    {/key}
</div>

<style>
    .budget-wrapper {
        height: 100dvh;
        background-color: var(---background);
    }
</style>