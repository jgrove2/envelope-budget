<script lang="ts">
	import { Query } from '$lib/query.svelte';
	import ChevronDown from '$lib/svg/ChevronDown.svelte';
	import ChevronUp from '$lib/svg/ChevronUp.svelte';
	import { get_cache } from '$lib/z.svelte';
	import ChevronToggle from './ChevronToggle.svelte';
	import CustomModal from './CustomModal.svelte';
	import { v4 } from 'uuid';
	const { userID } = $props();
	let cache = get_cache();
	$inspect(userID);
	let categoryGroupQuery = cache.z.query.category_group.where('user_id', '=', userID.id);
	let categoriesQuery = cache.z.query.category.where('user_id', '=', userID.id);
	let transactionsQuery = cache.z.query.transaction.where('user_id', '=', userID.id);
	let categoryGroups = new Query(categoryGroupQuery);
	let categories = new Query(categoriesQuery);
	let transactions = new Query(transactionsQuery);
	let openCategories: number[] = $state([]);
	$effect(() => {
		openCategories = new Array(categoryGroups.data.length).fill(0);
	})
	let open: boolean = $state(false);
	let settingsType = $state('edit');
	let toggleEditName = $state(false);
	let addSubCategory = $state(false);
	let newCategoryName = $state('');
	function settingsChange(event: Event) {
		settingsType = (event.target as HTMLInputElement).value;
	}
	let newCategoryGroup = $state('');
	function deleteCategoryGroup() {
		if (editSelection === '') {
			alert('Please select a category group to delete');
			return;
		}
		if (editSelection) {
			if (
				categories.data.length > 0 &&
				categories.data.some((category) => category.group_id === editSelection)
			) {
				alert('Please delete all categories in this group before deleting the group');
				return;
			} else {
				let isDelete = confirm('Are you sure you want to delete this category group?');
				if (isDelete) {
					cache.z.mutate.category_group.delete({ id: editSelection });
				}
			}
		}
	}
	function deleteSubCategory() {
		toggleEditCategoryName = false;
		if (subCategoryId === '') {
			alert('Please select a category to delete');
			return;
		}
		if (editSelection) {
			if (transactions.data.length > 0) {
				alert('Please delete all categories in this group before deleting the group');
				return;
			} else {
				let isDelete = confirm('Are you sure you want to delete this category?');
				if (isDelete) {
					cache.z.mutate.category.delete({ id: subCategoryId });
				}
			}
		}
	}
	function addNewCategory() {
		if (newCategoryGroup === '') {
			alert('Please enter a category group name');
			return;
		}
		let id = v4();
		let categoryGroup = {
			id: id,
			user_id: userID.id,
			name: newCategoryGroup,
			creation_date: new Date()
		};
		cache.z.mutate.category_group.insert(categoryGroup);
		newCategoryGroup = '';
	}
	function updateCategoryGroupName() {
		if (newCategoryGroup === '') {
			alert('Please enter valid category group name');
			return;
		}
		cache.z.mutate.category_group.update({ id: editSelection, name: newCategoryGroup });
		newCategoryGroup = '';
		toggleEditName = false;
	}
	function updateSubCategoryName() {
		if (newCategoryGroup === '') {
			alert('Please enter valid category name');
			return;
		}
		cache.z.mutate.category.update({ id: subCategoryId, name: newCategoryGroup });
		newCategoryGroup = '';
		toggleEditCategoryName = false;
	}
	let editSelection = $state('');
	function createNewSubCategory() {
		if (newCategoryName === '') {
			alert('Please enter a valid category name');
			return;
		}
		let id = v4();
		let category = {
			id: id,
			user_id: userID.id as string,
			group_id: editSelection,
			name: newCategoryName,
			creation_date: new Date().getTime(),
			budget: { 0: 0 }
		} as const;
		cache.z.mutate.category.insert(category);
		newCategoryName = '';
	}
	let editSubCategories = $state(false);
	let subCategoryId = $state('');
	let toggleEditCategoryName = $state(false);
</script>

{#snippet dialogContent()}
	<div class="settings-modal">
		<div class="modal-header">
			<h1>Settings</h1>
			<button onclick={() => (open = false)}>×</button>
		</div>
		<div class="categoryGroup">
			<h4>Manage Category Groups</h4>
			<span>
				<label>
					<input
						checked={settingsType === 'add'}
						onchange={settingsChange}
						type="radio"
						value="add"
					/> Add
				</label>
				<label>
					<input
						checked={settingsType === 'edit'}
						onchange={settingsChange}
						type="radio"
						value="edit"
					/> Edit
				</label>
			</span>
			{#if settingsType === 'add'}
				<div class="add">
					<label>
						New category group name: <input
							type="text"
							placeholder="Category Group Name"
							bind:value={newCategoryGroup}
						/>
					</label>
					<button onclick={addNewCategory}>Add Category Group</button>
				</div>
			{/if}
			{#if settingsType === 'edit'}
				<div class="edit">
					<select bind:value={editSelection}>
						{#each categoryGroups.data as categoryGroup}
							<option value={categoryGroup.id}>{categoryGroup.name}</option>
						{/each}
					</select>
					{#if editSelection !== ''}
						<button onclick={deleteCategoryGroup}>Delete</button>
						<button
							onclick={() => {
								toggleEditName = !toggleEditName;
								addSubCategory = false;
								editSubCategories = false;
								subCategoryId = '';
							}}>Edit Name</button
						>
						<button
							onclick={() => {
								addSubCategory = !addSubCategory;
								toggleEditName = false;
								editSubCategories = false;
								subCategoryId = '';
							}}>Add Sub Category</button
						>
						<button
							onclick={() => {
								editSubCategories = !editSubCategories;
								addSubCategory = false;
								toggleEditName = false;
								subCategoryId = '';
							}}>Edit Sub Categories</button
						>
						<br />
						<span>
							{#if toggleEditName}
								<label>
									Update Category Group Name: <input
										type="text"
										placeholder={categoryGroups.data.find((group) => group.id === editSelection)
											?.name}
										bind:value={newCategoryGroup}
									/>
								</label>
								<button onclick={updateCategoryGroupName}>Save</button>
								<button onclick={() => (toggleEditName = false)}>Cancel</button>
							{/if}
							{#if addSubCategory}
								<label>
									New category name: <input
										type="text"
										placeholder="Category Name"
										bind:value={newCategoryName}
									/>
								</label>
								<button onclick={createNewSubCategory}>Add Category</button>
							{/if}
							{#if editSubCategories}
								<select bind:value={subCategoryId}>
									{#each categories.data as category}
										{#if category.group_id === editSelection}
											<option value={category.id}>{category.name}</option>
										{/if}
									{/each}
								</select>
								{#if subCategoryId !== ''}
									<button onclick={deleteSubCategory}>Delete</button>
									<button
										onclick={() => {
											toggleEditCategoryName = !toggleEditCategoryName;
											addSubCategory = false;
										}}>Edit Name</button
									>
								{/if}
							{/if}
						</span>
					{/if}
					<br />
					{#if toggleEditCategoryName}
						<label>
							Update Category Name: <input
								type="text"
								placeholder={categories.data.find((cat) => cat.id === subCategoryId)?.name}
								bind:value={newCategoryGroup}
							/>
						</label>
						<button onclick={updateSubCategoryName}>Save</button>
						<button onclick={() => (toggleEditCategoryName = false)}>Cancel</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/snippet}

<div class="budgetTable">
	<CustomModal {open} {dialogContent} />
	<table>
		<caption>
			<button class="settings" onclick={() => (open = true)}> Settings </button>
		</caption>
		<colgroup><col /><col /><col /><col /></colgroup>
		<thead>
			<tr>
				<td>Name</td>
				<td>Spent</td>
				<td>Budgeted</td>
				<td>Balance</td>
			</tr>
		</thead>
		<tbody>
			{#if categoryGroups.data.length <= 0}
				<tr>
					<td colspan={5}>
						<span>No categories found</span>
					</td>
				</tr>
			{/if}
			{#each categoryGroups.data as categoryGroup, index}
				<tr>
					<td class="classToggle" onclick={() => {
						openCategories[index] = openCategories[index] ? 0 : 1;
					}}>
						 <ChevronToggle direction={openCategories[index]}/>
						<span>{categoryGroup.name}</span>
					</td>
					<td>$0.00</td>
					<td>$0.00</td>
					<td>$0.00</td>
				</tr>
				{#if openCategories[index]}
					{#each categories.data as category}
						{#if category.group_id === categoryGroup.id}
							<tr>
								<td>
									<span>{category.name}</span>
								</td>
								<td>$0.00</td>
								<td>$0.00</td>
								<td>$0.00</td>
							</tr>
						{/if}
					{/each}
				{/if}
			{/each}
		</tbody>
	</table>
</div>

<style>
	.settings-modal {
		.modal-header {
			display: flex;
			justify-content: space-between;
			button {
				font-size: 2rem;
				background: none;
				border: none;
				cursor: pointer;
				line-height: 2rem;
				height: 2rem;
			}
		}
		.categoryGroup {
			display: flex;
			flex-direction: column;
			h4 {
				font-size: 1.25rem;
				font-weight: bold;
			}
			select {
				margin: 0.5rem 0;
				padding: 0.25rem;
				border: 1px solid var(---text);
				border-radius: 5px;
				font-size: 1rem;
				width: 10rem;
			}
		}
		.add {
		}
	}
	.classToggle {
		cursor: pointer;
	}
	.budgetTable {
		display: flex;
		width: 100%;
		justify-content: center;
		table {
			border: 2px solid var(---text);
			border-collapse: collapse;
			caption {
				color: var(---text);
				text-align: right;
				padding: 0.5rem;
				.settings {
					font-size: 0.75rem;
					padding: 0.25rem;
					background: var(---background);
					border: 1px solid var(---text);
					border-radius: 5px;
					cursor: pointer;
					box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5);
				}
				.settings:active {
					box-shadow: none;
				}
			}
		}
	}
	@media only screen and (max-width: 700px) {
		.budgetTable {
			table {
				width: 95%;
				:is(td) {
					padding: 0.5rem;
					border: 1px solid var(---text);
					font-size: 0.75rem;
				}
			}
		}
	}
	@media only screen and (min-width: 701px) {
		.budgetTable {
			table {
				width: 75%;
				:is(td) {
					padding: 0.75rem;
					border: 2px solid var(---text);
					font-size: 1rem;
				}
			}
		}
	}
</style>
