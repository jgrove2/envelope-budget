<script lang="ts">
	import { updated } from '$app/state';
	import { Query } from '$lib/query.svelte';
	import type { Category, CategoryGroup } from '$lib/schema';
	import { get_cache } from '$lib/z.svelte';
	import { v4 } from 'uuid';
	let { userID } = $props();

	let cache = get_cache();
	let categoryGroupQuery = cache.z.query.category_group.where('user_id', '=', userID.id);
	let categoriesQuery = cache.z.query.category.where('user_id', '=', userID.id);
	let categoryGroups = new Query(categoryGroupQuery);
	let categories = new Query(categoriesQuery);
	let selectedCategoryGroup: undefined | CategoryGroup = $state(undefined);
	let newCategory: { name: string; group_id: string } = $state({
		name: '',
		group_id: ''
	});
	function createNewCategory() {
        if(newCategory.name === '' || newCategory.group_id === '') return;
		cache.z.mutate.category.update({
			id: v4(),
			name: newCategory.name,
            user_id: userID.id,
			group_id: newCategory.group_id,
			creation_date: new Date().getTime()
		});
		newCategory = {
			name: '',
			group_id: ''
		};
	}
</script>

<div class="wrap">
	<div class="category-settings">
		<div class="form">
			<span>Category: </span>
			<select bind:value={newCategory.group_id}>
				{#each categoryGroups.data as categoryGroup}
					<option value={{ ...categoryGroup }}>{categoryGroup.name}</option>
				{/each}
			</select>
		</div>
		<div class="form">
			<span>Category Name: </span>
			<input bind:value={newCategory.name} />
		</div>
		<button
			disabled={newCategory.name === '' || newCategory.group_id === ''}
			onclick={createNewCategory}>Save</button
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
