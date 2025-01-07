<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { budgetHelper } from '$lib/budgetHelpers.svelte';
	import BudgetTable from '$lib/components/BudgetTable.svelte';
	import CustomModal from '$lib/components/CustomModal.svelte';
	import TransactionDialog from '$lib/components/TransactionDialog.svelte';
	import { money } from '$lib/helpers/money';
	import { get_cache, ZCache } from '$lib/z.svelte';

	new ZCache();
	let cache = get_cache();

	let { children } = $props();
	let y = $state(0);
	let headerClasses = $derived(`header ${y > 0 ? 'scrolled' : ''}`);
	let openTransaction = $state(false);
	// let budgetHelper = new BudgetHelper();
	$inspect(budgetHelper.selectedMonth);
</script>

<div class="budget-wrapper">
	<div class={headerClasses}>
		<div class={'row'}>
			<span>Envelope</span>
			<a class={page.url.pathname === '/budget' ? 'current' : ''} href="/budget">Home</a>
			<form method="post" action="?/logout" use:enhance>
				<button>Sign out</button>
			</form>
		</div>
		<div class="table-content">
			<span class={budgetHelper.leftOverBalance <= 0 ? 'red' : 'green'}
				>{money.format(budgetHelper.leftOverBalance)}</span
			>
			<span class="date-selection">
				<button
					onclick={() => {
						if (budgetHelper.selectedMonth.getMonth() === 0) {
							budgetHelper.selectedMonth = new Date(
								budgetHelper.selectedMonth.getFullYear() - 1,
								11
							);
						} else {
							budgetHelper.selectedMonth = new Date(
								budgetHelper.selectedMonth.getFullYear(),
								budgetHelper.selectedMonth.getMonth() - 1
							);
						}
					}}>{'<'}</button
				>
				<span class="date"
					>{`${budgetHelper.selectedMonth.toLocaleDateString('default', { month: 'long' })} ${budgetHelper.selectedMonth.getFullYear()}`}</span
				>
				<button
					onclick={() => {
						if (budgetHelper.selectedMonth.getMonth() === 11) {
							budgetHelper.selectedMonth = new Date(
								budgetHelper.selectedMonth.getFullYear() + 1,
								0
							);
						} else {
							budgetHelper.selectedMonth = new Date(
								budgetHelper.selectedMonth.getFullYear(),
								budgetHelper.selectedMonth.getMonth() + 1
							);
						}
					}}>{'>'}</button
				>
			</span>
			<span></span>
		</div>
	</div>
	{#key cache.zUser}
		{@render children()}
	{/key}
</div>
<TransactionDialog />
<svelte:window bind:scrollY={y} />

<style>
	.budget-wrapper {
		/* height: 100dvh; */
		background-color: var(---background);
	}
	.header {
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: column;
		background-color: var(---background);
		color: var(---text);
		a,
		span {
			font-size: 1.25rem;
			font-weight: bold;
			text-decoration: none;
			color: var(---text);
		}
		.current {
			text-decoration: underline !important;
			font-weight: bolder;
		}
		.red {
			color: red;
		}
		.green {
			color: green;
		}
		.date-selection {
			width: 12rem;
			display: flex;
			justify-content: space-between;
			align-items: center;
			button {
				font-size: 1rem;
				border: 1px solid var(---text);
				border-radius: 2rem;
				cursor: pointer;
				background: none;
				box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5);
				&:active {
					box-shadow: none;
				}
			}
			.date {
				width: 10rem;
				text-align: center;
			}
		}
		form {
			margin-left: auto;
			button {
				border: none;
				background: none;
				color: var(---text);
				font-size: 1.25rem;
				font-weight: bold;
				&:hover {
					cursor: pointer;
				}
				&:active {
					font-size: 1.1rem;
				}
			}
		}
		.row {
			display: flex;
			direction: row;
			justify-content: flex-start;
			padding: 1rem;
			gap: 2rem;
		}
		.table-content {
			display: flex;
			justify-content: space-evenly;
			padding: 0.5rem;
		}
	}
	.scrolled {
		box-shadow: 0px 3px 8px 1px rgba(0, 0, 0, 0.4);
	}
	@media (max-width: 700px) {
		.header {
			padding: 1rem;
			gap: 1rem;
			a,
			span {
				font-size: 1rem;
			}
			form {
				button {
					font-size: 1rem;
				}
			}
		}
	}
</style>
