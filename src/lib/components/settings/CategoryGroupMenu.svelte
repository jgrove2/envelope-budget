<script lang="ts">
	import { updated } from '$app/state';
	import { Query } from '$lib/query.svelte';
	import type { Category, CategoryGroup } from '$lib/schema';
	import { get_cache } from '$lib/z.svelte';
	let { userID } = $props();

	let cache = get_cache();
	let categoryGroupQuery = cache.z.query.category_group.where('user_id', '=', userID.id);
	let categoriesQuery = cache.z.query.category.where('user_id', '=', userID.id);
	let categoryGroups = new Query(categoryGroupQuery);
	let categories = new Query(categoriesQuery);
	let selectedCategoryGroup: undefined | CategoryGroup = $state(undefined);
	let updatedCategoryGroup: { id: string; name: string; } = $state({
		id: '',
		name: '',
	});
	$effect(() => {
		if (selectedCategoryGroup !== undefined) {
			// @ts-ignore
			updatedCategoryGroup.id = selectedCategoryGroup.id;
			// @ts-ignore
			updatedCategoryGroup.name = selectedCategoryGroup.name;
		} else {
			updatedCategoryGroup.id = '';
            updatedCategoryGroup.name = '';
		}
	});
	$inspect(selectedCategoryGroup);
	function updateCategory() {
		cache.z.mutate.category_group.update({
			id: updatedCategoryGroup.id,
			name: updatedCategoryGroup.name,
		});
		selectedCategoryGroup = undefined;
	}
</script>

<div class="wrap">
	<div class="select-category">
		<span>Category: </span>
		<select bind:value={selectedCategoryGroup}>
			{#each categoryGroups.data as categoryGroup}
				<option value={{ ...categoryGroup }}>{categoryGroup.name}</option>
			{/each}
		</select>
	</div>
	{#if selectedCategoryGroup !== undefined && selectedCategoryGroup !== null && Object.keys(selectedCategoryGroup).length > 0}
		<div class="category-settings">
			<div>
				<span>Category Name: </span>
				<input bind:value={updatedCategoryGroup.name} />
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
