<script lang="ts">
	import { Query } from 'zero-svelte';
	import type { PageServerData } from './$types';
	import { get_cache } from '$lib/z.svelte';
	import BudgetTable from '$lib/components/BudgetTable.svelte';
	let cache = get_cache();
	let { data }: { data: PageServerData } = $props();
	let userID = $state(data.user.id);
	$effect(() => {
		if(cache.getCurrentUserID() !== userID) {
			cache.setUser(userID);
		}
	})
	let userQuery = cache.z.query.user.where('id', '=', data.user.id);
</script>

<BudgetTable userID={data.user}/>