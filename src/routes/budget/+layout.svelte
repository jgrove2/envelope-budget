<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import BudgetTable from '$lib/components/BudgetTable.svelte';
	import CustomModal from '$lib/components/CustomModal.svelte';
	import TransactionDialog from '$lib/components/TransactionDialog.svelte';
	import { get_cache, ZCache } from '$lib/z.svelte';

	new ZCache();
	let cache = get_cache();

	let { children } = $props();
	let y = $state(0);
	let headerClasses = $derived(`header ${y > 0 ? 'scrolled' : ''}`);
	let openTransaction = $state(false);
</script>

<div class="budget-wrapper">
    <div class={headerClasses}>
        <span>Envelope</span>
		<span class={page.url.pathname === '/budget' ? 'current' : ''}>Home</span>
		<form method="post" action="?/logout" use:enhance>
			<button>Sign out</button>
		</form>
	</div>
	{#key cache.zUser}
		{@render children()}
	{/key}
</div>
<TransactionDialog />
<svelte:window bind:scrollY={y} />

<style>
	.budget-wrapper {
		height: 100dvh;
		background-color: var(---background);
	}
	.header {
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		padding: 1rem;
		gap: 2rem;
		background-color: var(---background);
		color: var(---text);
		span {
			font-size: 1.25rem;
			font-weight: bold;
		}
		.current {
			text-decoration: underline;
			font-weight: bolder;
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
	}
	.scrolled {
		box-shadow: 0px 3px 8px 1px rgba(0, 0, 0, 0.4);
	}
	.modal {
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
			padding: 1rem;
		}
	}
</style>
