<script lang="ts">
	import { goto } from '$app/navigation';
	import { budgetHelper } from '$lib/budgetHelpers.svelte';
	import { money } from '$lib/helpers/money';
	import { Query } from '$lib/query.svelte';
	import type { Category, Transaction } from '$lib/schema';
	import { get_cache } from '$lib/z.svelte';
	import ChevronToggle from './ChevronToggle.svelte';
	import CustomModal from './CustomModal.svelte';
	import { v4 } from 'uuid';
	const { userID } = $props();
	let cache = get_cache();
	let transactionQuery = cache.z.query.transaction.where('user_id', '=', userID.id);
	let transactions = new Query(transactionQuery);
	let categoryGroupQuery = cache.z.query.category_group.where('user_id', '=', userID.id);
	let categoriesQuery = cache.z.query.category.where('user_id', '=', userID.id);
	let categoryGroups = new Query(categoryGroupQuery);
	let categories = new Query(categoriesQuery);
	let selectedMonth = $derived(budgetHelper.selectedMonth);
	let transactionsGrouped = $derived(
		Map.groupBy(transactions.data, ({ category_id }) => category_id)
	);
	$inspect(transactionsGrouped);
	$inspect(transactions.data)
	let openCategories: number[] = $state([]);
	$effect(() => {
		openCategories = new Array(categoryGroups.data.length).fill(1);
	});
	$inspect(budgetHelper.selectedMonth);
	let open: boolean = $state(false);
	let openBudget: boolean = $state(false);
	let settingsType = $state('edit');
	let toggleEditName = $state(false);
	let addSubCategory = $state(false);
	let newCategoryName = $state('');
	function settingsChange(event: Event) {
		settingsType = (event.target as HTMLInputElement).value;
	}
	$inspect(selectedMonth);
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
	let newBudget = $state({ name: '', categoryId: '', currentBudget: '0', offset: 0 });
	function getCurrentMonthsOffset(categoryCreationDate: number) {
		let selectedMonthIndex = budgetHelper.selectedMonth.getMonth();
		let selectedYear = budgetHelper.selectedMonth.getFullYear();
		if (categoryCreationDate === undefined) return 0;
		let categoryCreationMonth = new Date(categoryCreationDate).getMonth();
		let categoryCreationYear = new Date(categoryCreationDate).getFullYear();
		let monthsDifference =
			(selectedYear - categoryCreationYear) * 12 - categoryCreationMonth + selectedMonthIndex;
		return monthsDifference;
	}
	function sumSubCategoryBudgets(categoryGroupId: string) {
		if (categoryGroupId === undefined) return 0;
		let sum = 0;
		categories.data.forEach((category) => {
			if (category.group_id === categoryGroupId) {
				sum += category?.budget[getCurrentMonthsOffset(category.creation_date)] || 0;
			}
		});
		return sum;
	}
	function getSubCategorySpent(categoryId: string) {
		if (categoryId === undefined) return 0;
		let sum = 0;
		transactionsGrouped.get(categoryId)?.forEach((transaction) => {
			let transactionDate = new Date(transaction.transaction_date);
			if (
				transaction.category_id === categoryId &&
				transactionDate.getMonth() === budgetHelper.selectedMonth.getMonth() &&
				transactionDate.getFullYear() === budgetHelper.selectedMonth.getFullYear()
			) {
				sum += transaction.transaction_amount;
			}
		});
		return sum;
	}
	function sumSubCategoriesSpent(categoryGroupId: string) {
		if (categoryGroupId === undefined) return 0;
		let sum = 0;
		categories.data.forEach((category) => {
			if (category.group_id === categoryGroupId) {
				sum += getSubCategorySpent(category.id);
			}
		});
		return sum;
	}
	function sumSubCategoriesBalance(categoryGroupId: string) {
		if (categoryGroupId === undefined) return 0;
		let sum = 0;
		categories.data.forEach((category) => {
			if (category.group_id === categoryGroupId) {
				sum += getSubCategoryBalance(category.id, category.creation_date, category.budget);
			}
		});
		return sum;
	}
	function getSubCategoryBalance(
		categoryId: string,
		creationDate: number,
		budget: Record<string, number>
	) {
		if (categoryId === undefined) return 0;
		let sum = 0;
		transactionsGrouped.get(categoryId)?.forEach((transaction) => {
			let transactionDate = new Date(transaction.transaction_date);
			if (
				transaction.category_id === categoryId &&
				(transactionDate < budgetHelper.selectedMonth ||
					(transactionDate.getMonth() === budgetHelper.selectedMonth.getMonth() &&
						transactionDate.getFullYear() === budgetHelper.selectedMonth.getFullYear()))
			) {
				sum += transaction.transaction_amount;
			}
		});
		if (creationDate === undefined || budget === undefined) return 0;
		let offset = getCurrentMonthsOffset(creationDate);
		Object.keys(budget).forEach((key: string) => {
			if (parseInt(key) <= offset) {
				sum += budget[parseInt(key)];
			}
		});
		return sum;
	}
	function setBudget() {
		let categoryBudget = Object.assign(
			{},
			categories.data.find((category) => category.id === newBudget.categoryId)?.budget
		);
		if (categoryBudget === undefined) {
			alert('Please select a category to set a budget');
			return;
		}
		categoryBudget[newBudget.offset] = parseInt(newBudget.currentBudget);
		cache.z.mutate.category.update({ id: newBudget.categoryId, budget: categoryBudget });
		newBudget = { name: '', categoryId: '', currentBudget: '0', offset: 0 };
		openBudget = false;
	}
	function getTotalBalance() {
		let total = 0;
		if (!categories) return 0;
		if (!categoryGroups.data) return 0;
		if (!transactionsGrouped) return 0;
		let IncomeId = categoryGroups.data.find((group) => group.name === 'Income')?.id;
		if (IncomeId === undefined) return 0;
		let IncomeCategories = categories.data?.filter((category) => category.group_id === IncomeId);
		IncomeCategories.forEach((category) => {
			transactionsGrouped.get(category.id)?.forEach((transaction) => {
				let transactionDate = new Date(transaction.transaction_date);
				if (
					transaction.category_id === category.id &&
					(transactionDate < budgetHelper.selectedMonth ||
						(transactionDate.getMonth() === budgetHelper.selectedMonth.getMonth() &&
							transactionDate.getFullYear() === budgetHelper.selectedMonth.getFullYear()))
				) {
					total += transaction.transaction_amount;
				}
			});
		});
		categories.data.forEach((category) => {
			if (category.group_id !== IncomeId) {
				let spent = 0;
				transactionsGrouped.get(category.id)?.forEach((transaction) => {
					let transactionDate = new Date(transaction.transaction_date);
					if (
						transaction.category_id === category.id &&
						(transactionDate < budgetHelper.selectedMonth ||
							(transactionDate.getMonth() === budgetHelper.selectedMonth.getMonth() &&
								transactionDate.getFullYear() === budgetHelper.selectedMonth.getFullYear()))
					) {
						spent += transaction.transaction_amount;
					}
				});
				let offset = getCurrentMonthsOffset(category.creation_date);
				let budgeted = 0;
				Object.keys(category.budget).forEach((key: string) => {
					if (parseInt(key) <= offset) {
						budgeted += category.budget[parseInt(key)];
					}
				});
				if (budgeted > -1 * spent) total -= budgeted;
				else total += spent;
			}
		});
		return total;
	}
	$effect(() => {
		if (categories.data.length > 0 && transactionsGrouped !== undefined)
			budgetHelper.leftOverBalance = getTotalBalance();
	});
</script>

{#snippet budgetDialog()}
	<div class="budget-modal">
		<div class="modal-header">
			<h1>{newBudget.name}</h1>
			<button onclick={() => (openBudget = false)}>×</button>
		</div>
		<div class="modal-body">
			<label>
				Budget Amount <br /><input
					inputmode="decimal"
					type="text"
					bind:value={newBudget.currentBudget}
				/>
			</label>
			<br />
			<button onclick={setBudget}>Save</button>
		</div>
	</div>
{/snippet}

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
								placeholder={categories.data.find((cat: Category) => cat.id === subCategoryId)
									?.name}
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
	<CustomModal open={openBudget} dialogContent={budgetDialog} />
	<div class="caption">
		<span></span>
		<span> </span>
		<button class="settings" onclick={() => goto("/budget/settings")}> Settings </button>
	</div>
	<table>
		<colgroup><col width="30%" /><col width="30%" /><col width="20%" /><col width="20%" /></colgroup
		>
		<thead>
			<tr>
				<td>Name</td>
				<td>Budgeted</td>
				<td>Spent</td>
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
			{#key budgetHelper.selectedMonth}
				{#each categoryGroups.data as categoryGroup, index}
					{#if categoryGroup.name !== 'Income'}
						<tr class="table-header">
							<td
								class="classToggle"
								onclick={() => {
									openCategories[index] = openCategories[index] ? 0 : 1;
								}}
							>
								<ChevronToggle direction={openCategories[index]} />
								<span>{categoryGroup.name}</span>
							</td>
							<td class="center">{money.format(sumSubCategoryBudgets(categoryGroup.id))}</td>
							<td class="center">{money.format(sumSubCategoriesSpent(categoryGroup.id))}</td>
							<td
								class={sumSubCategoriesBalance(categoryGroup.id) <= 0
									? 'red center'
									: 'green center'}>{money.format(sumSubCategoriesBalance(categoryGroup.id))}</td
							>
						</tr>
						{#if openCategories[index]}
							{#each categories.data as category}
								{#if category.group_id === categoryGroup.id}
									<tr>
										<td>
											<span>{category.name}</span>
										</td>
										<td class="center"
											><button
												class={`budget-button`}
												onclick={() => {
													let offset = getCurrentMonthsOffset(category.creation_date);
													newBudget = {
														name: category.name,
														categoryId: category.id,
														currentBudget: `${category.budget[offset] || 0}`,
														offset: offset
													};
													openBudget = true;
												}}
												>{money.format(
													category.budget[getCurrentMonthsOffset(category.creation_date)] || 0
												)}</button
											></td
										>
										<td class="center">{money.format(getSubCategorySpent(category.id))}</td>
										<td
											class={getSubCategoryBalance(
												category.id,
												category.creation_date,
												category.budget
											) < 0
												? 'red center'
												: 'green center'}
											>{money.format(
												getSubCategoryBalance(category.id, category.creation_date, category.budget)
											)}</td
										>
									</tr>
								{/if}
							{/each}
						{/if}
					{/if}
				{/each}
			{/key}
		</tbody>
	</table>
	{#each categoryGroups.data as categoryGroup}
		{#if categoryGroup.name === 'Income'}
			<h2>Income</h2>
			<table class="income">
				<colgroup><col /><col /></colgroup>
				<thead>
					<tr>
						<td>Name</td>
						<td>Total</td>
					</tr>
				</thead>
				<tbody>
					{#each categories.data as category}
						{#if category.group_id === categoryGroup.id}
							<tr>
								<td>
									<span>{category.name}</span>
								</td>
								<td>{money.format(getSubCategorySpent(category.id))}</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		{/if}
	{/each}
</div>

<style>
	.red {
		color: red !important;
	}
	.green {
		color: green !important;
	}

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
	}
	.budget-modal {
		display: flex;
		flex-direction: column;
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
		.modal-body {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			label {
				font-size: 1.25rem;
				text-align: center;
				input {
					margin-top: 0.5rem;
					font-size: 1rem;
					padding: 0.5rem;
					background-color: var(---background);
					border: 1px solid var(---text);
					border-radius: 5px;
				}
			}
			button {
				padding: 0.5rem;
				background-color: var(---background);
				border: 1px solid var(---text);
				border-radius: 5px;
				margin-top: 1rem;
				box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5);
				&:active {
					box-shadow: none;
				}
			}
		}
	}
	.table-header {
		background: var(---background-accent);
		color: var(---text);
		font-weight: bold;
	}
	.classToggle {
		cursor: pointer;
	}
	.budgetTable {
		display: flex;
		flex-direction: column;
		width: 100%;
		align-items: center;
		padding-bottom: 5rem;
		min-height: 100dvh;
		table {
			border: 2px solid var(---text);
			border-collapse: collapse;
			.center {
				text-align: center;
			}
		}
	}
	.caption {
		color: var(---text);
		padding: 0.5rem;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
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
	.budget-button {
		background-color: var(---background);
		font-size: 1em;
		border: 1px solid var(---text);
		border-radius: 4px;
		padding: 0.25 rem;
		cursor: pointer;
	}
	@media only screen and (max-width: 700px) {
		.budgetTable {
			table {
				width: 95%;
				table-layout: fixed;
				:is(td) {
					padding: 0.5rem;
					border: 1px solid var(---text);
					font-size: 0.75rem;
				}
			}
			.caption {
				width: 95%;
				.date-selection {
					width: 9rem;
					.date {
						font-size: 0.75rem;
					}
				}
			}
		}
	}
	@media only screen and (min-width: 701px) {
		.budgetTable {
			table {
				width: 75%;
				.center {
					text-align: center;
				}
				:is(td) {
					padding: 0.75rem;
					border: 2px solid var(---text);
					font-size: 1rem;
				}
			}
			.caption {
				width: 75%;
			}
		}
	}
</style>
