<script lang="ts">
	import { updated } from '$app/state';
	import { Query } from '$lib/query.svelte';
	import type { Category } from '$lib/schema';
	import { get_cache } from '$lib/z.svelte';
	let { userID } = $props();

	let cache = get_cache();
	let categoryGroupQuery = cache.z.query.category_group.where('user_id', '=', userID.id);
	let categoriesQuery = cache.z.query.category.where('user_id', '=', userID.id);
	let categoryGroups = new Query(categoryGroupQuery);
	let categories = new Query(categoriesQuery);
	let selectedCategory: undefined | Category = $state(undefined);
	let updatedCategory: { id: string; name: string; group_id: string } = $state({
		id: '',
		name: '',
		group_id: ''
	});
	$effect(() => {
		if (selectedCategory !== undefined) {
			// @ts-ignore
			updatedCategory.id = selectedCategory.id;
			// @ts-ignore
			updatedCategory.name = selectedCategory.name;
			// @ts-ignore
			updatedCategory.group_id = selectedCategory.group_id;
		} else {
			updatedCategory.id = '';
            updatedCategory.name = '';
            updatedCategory.group_id = '';
		}
	});
	$inspect(selectedCategory);
	function updateCategory() {
		cache.z.mutate.category.update({
			id: updatedCategory.id,
			name: updatedCategory.name,
			group_id: updatedCategory.group_id
		});
		selectedCategory = undefined;
	}
</script>

<div class="wrap">
	<div class="select-category">
		<span>Category: </span>
		<select bind:value={selectedCategory}>
			{#each categories.data as category}
				<option value={{ ...category }}>{category.name}</option>
			{/each}
		</select>
	</div>
	{#if selectedCategory !== undefined && selectedCategory !== null && Object.keys(selectedCategory).length > 0}
		<div class="category-settings">
			<div>
				<span>Category Group:</span>
				<select bind:value={updatedCategory.group_id}>
					{#each categoryGroups.data as group}
						<option value={group.id}>{group.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<span>Category Name: </span>
				<input bind:value={updatedCategory.name} />
			</div>
			<button onclick={updateCategory}>Save</button>
		</div>
	{/if}
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		justify-content: left;
        text-align: left;
        font-size: 1rem;
        .select-category {
            display: flex;
            gap: 1rem;
            margin: 1rem;
            span {
                text-align: left;
                align-content: space-around;
                width: 8rem;
            }
            select {
                width: 20rem;
                padding: 0.5rem;
                border-radius: 0.5rem;
            }
        }
        .category-settings {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin: 1rem;
            div {
                display: flex;
                gap: 1rem;
                span {
                    text-align: left;
                    align-content: space-around;
                    width: 8rem;
                }
                select {
                    width: 20rem;
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                }
                input {
                    width: 20rem;
                    padding: 0.5rem;
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
                &:active {
                    background-color: var(---text);
                    color: var(---background);
                }
            }
        }
	}
</style>
