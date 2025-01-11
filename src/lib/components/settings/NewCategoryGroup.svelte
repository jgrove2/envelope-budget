<script lang="ts">
	import { get_cache } from '$lib/z.svelte';
	import { v4 } from 'uuid';
	let { userID } = $props();

	let cache = get_cache();
	let newCategoryGroup: { name: string; } = $state({
		name: '',
	});
	function createNewCategoryGroup() {
        if(newCategoryGroup.name === '' ) return;
		cache.z.mutate.category_group.update({
			id: v4(),
			user_id: userID.id,
			name: newCategoryGroup.name,
		});
		newCategoryGroup = {
			name: '',
		};
	}
</script>

<div class="wrap">
	<div class="category-settings">
		<div class="form">
			<span>Group Name: </span>
			<input bind:value={newCategoryGroup.name} />
		</div>
		<button
			disabled={newCategoryGroup.name === ''}
			onclick={createNewCategoryGroup}>Save</button
		>
	</div>
</div>

<style>
	.wrap {
        display: flex;
        justify-content: left;
        .form {
            display: flex;
            margin: 1rem;
            span {
                margin-right: 1rem;
                width: 8rem;
                text-align: left;
                justify-content: space-evenly;
            }
            input {
                width: 20rem;
                padding: 0.5rem;
                margin: 0;
                border-radius: 0.5rem;
            }
            select {
                width: 20rem;
                padding: 0.5rem;
                margin: 0;
                border-radius: 0.5rem;
            }
        }
		button {
			width: 20rem;
			padding: 0.5rem;
			border-radius: 0.5rem;
			background-color: var(--primary);
			color: var(--background);
			cursor: pointer;
			&:disabled {
                cursor: not-allowed;
				background-color: grey;
				color: var(---background);
			}
            &:active {
                background-color: var(--background);
                color: var(--primary);
            }
		}
	}
</style>
