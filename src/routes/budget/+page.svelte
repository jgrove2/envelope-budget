<script lang="ts">
	import { enhance } from '$app/forms';
	import { Query } from 'zero-svelte';
	import type { PageServerData } from './$types';
	import { zConstructor } from '$lib/z.svelte';
	let { data }: { data: PageServerData } = $props();
	const z = zConstructor(data.user.id)

	let userQuery = z.current.query.user.where('id', '=', data.user.id);
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
