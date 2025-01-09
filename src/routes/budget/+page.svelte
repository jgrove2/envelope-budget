<script lang="ts">
	import type { PageServerData } from './$types';
	import { get_cache } from '$lib/z.svelte';
	import BudgetTable from '$lib/components/BudgetTable.svelte';
	let cache = get_cache();
	let { data }: { data: PageServerData } = $props();
	let userID = $state(data.profile.id);
	$effect(() => {
		if(cache.getCurrentUserID() !== userID) {
			cache.setUser(userID);
		}
	})
</script>

<BudgetTable userID={data.profile}/>