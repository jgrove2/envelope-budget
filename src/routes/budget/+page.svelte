<script lang="ts">
	import { enhance } from '$app/forms';
	import { Query } from 'zero-svelte';
	import type { PageServerData } from './$types';
	import { get_cache } from '$lib/z.svelte';
	let { data }: { data: PageServerData } = $props();
	let cache = get_cache();
	let userQuery = cache.z.query.user.where('id', '=', data.user.id);
	const users = new Query(userQuery);
</script>

<h1>Hi, {data.user.username}!</h1>
<p>Your user ID is {data.user.id}.</p>
{#each users.current as user}
	<p>Username: {user.username}</p>
	<p>Id: {user.id}</p>
{/each}
<form method="post" action="?/logout" use:enhance>
	<button>Sign out</button>
</form>

<style>

</style>