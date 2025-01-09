<script lang="ts">
	import { page } from '$app/stores';
	import { Query } from '$lib/query.svelte';
	import { get_cache } from '$lib/z.svelte';
	import type { PageServerData } from '../$types';
	const url = $page.url;
	let cache = get_cache();
	let { data }: { data: PageServerData } = $props();
	$inspect(url);
	let selected = $state(null);
	let categories = $derived(new Query(cache.z.query.category.where('user_id', '=', data.profile.id)));
	let transactions = $derived(
		new Query(cache.z.query.transaction.where('user_id', '=', data.profile.id).related('payee'))
	);
	$inspect(transactions.data);
	let userID = $state(data.user.id);
	$effect(() => {
		if (cache.getCurrentUserID() !== userID) {
			cache.setUser(userID);
		}
	});
</script>

<select bind:value={selected}>
	{#each categories.data as category}
		<option value={category.id}>{category.name}</option>
	{/each}
</select>
<table>
	<thead>
		<tr>
			<th>Payee</th>
			<th>Amount</th>
			<th>Date</th>
			<th>Options</th>
		</tr>
	</thead>
	<tbody>
		{#each transactions.data as transaction}
			{#if selected === null || transaction.category_id === selected}
				<tr>
					<td>{transaction.payee ? transaction.payee[0].name : 'Undefined'}</td>
					<td>{transaction.transaction_amount}</td>
					<td
						>{new Date(transaction.transaction_date).toLocaleDateString(undefined, {
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						})}</td
					>
					<td>
						<button onclick={() => cache.z.mutate.transaction.delete({ id: transaction.id })}
							>Delete</button
						>
					</td>
				</tr>
			{/if}
		{/each}
	</tbody>
</table>
