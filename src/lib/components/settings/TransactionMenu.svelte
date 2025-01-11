<script lang="ts">
	import { updated } from '$app/state';
	import { Query } from '$lib/query.svelte';
	import type { Category } from '$lib/schema';
	import { get_cache } from '$lib/z.svelte';
 import {money} from "$lib/helpers/money"
	let { userID } = $props();

	let cache = get_cache();
	let categoryGroupQuery = cache.z.query.category_group.where('user_id', '=', userID.id);
	let categoriesQuery = cache.z.query.category.where('user_id', '=', userID.id);
    let payeeQuery = cache.z.query.payee.where('user_id', '=', userID.id);
    let selectedCategory: undefined | Category = $state(undefined);
    let transactionQuery = $state(cache.z.query.transaction.where('user_id', '=', userID.id).related("category").related("payee"))
	let categoryGroups = new Query(categoryGroupQuery);
	let categories = new Query(categoriesQuery);
    let payees = new Query(payeeQuery);
    let transactions = new Query(transactionQuery);
	let updatedTransaction: { id: string; category_id: string; payee_id: string; transaction_amount: number; transaction_date: string; } = $state({
		id: '',
		category_id: '',
        payee_id: '',
        transaction_amount: 0,
        transaction_date: new Date().toISOString()
	});
    let filteredTransactions = $derived.by(() => {
        if (selectedCategory !== undefined && selectedCategory !== null && Object.keys(selectedCategory).length > 0) {
            // @ts-ignore
            return transactions.data.filter(transaction => transaction.category[0].id === selectedCategory?.id);
        } else {
            return transactions.data;
        }
    })
    let selectedTransaction = $state({ id: '', category_id: '', payee_id: '', transaction_amount: 0, transaction_date: 0 });
	$inspect(updatedTransaction);
	function updateTransaction() {
		cache.z.mutate.transaction.update({
			id: updatedTransaction.id,
			category_id: updateTransaction.name,
            payee_id: updatedTransaction.payee_id,
            transaction_amount: updatedTransaction.transaction_amount,
            transaction_date: new Date(updatedTransaction.transaction_date).getTime()
		});
		selectedCategory = undefined;
	}
    $effect(() => {
        if (selectedTransaction.id !== '') {
            updatedTransaction.id = selectedTransaction.id;
            updatedTransaction.category_id = selectedTransaction.category_id;
            updatedTransaction.payee_id = selectedTransaction.payee_id;
            updatedTransaction.transaction_amount = selectedTransaction.transaction_amount;
            updatedTransaction.transaction_date = new Date(selectedTransaction.transaction_date).toISOString().split('T')[0];
        } else {
            updatedTransaction.id = '';
            updatedTransaction.category_id = '';
            updatedTransaction.payee_id = '';
            updatedTransaction.transaction_amount = 0;
            updatedTransaction.transaction_date = new Date().toISOString().split('T')[0];
        }
        confirmDelete = false;
    })
    let confirmDelete = $state(false);
    function deleteTransaction() {
        if(confirmDelete) {
            cache.z.mutate.transaction.delete({ id: selectedTransaction.id });
        } else {
            confirmDelete = true;
        }
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
        <div class="transaction-selection">
            <table>
                <thead>
                    <tr>
                        <th>Payee</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Category Group</th>
                    </tr>
                <tbody>
                    {#each filteredTransactions as transaction}
                        <tr class={`transaction ${transaction.id === selectedTransaction.id ? 'selected': ''}`} onclick={() => {
                            selectedTransaction.id = transaction.id;
                            selectedTransaction.category_id = transaction.category[0].id;
                            selectedTransaction.payee_id = transaction.payee[0].id;
                            selectedTransaction.transaction_amount = transaction.transaction_amount;
                            selectedTransaction.transaction_date = transaction.transaction_date;
                        }}>
                            <td>{transaction.payee[0].name}</td>
                            <td>{money.format(transaction.transaction_amount)}</td>
                            <td>{new Date(transaction.transaction_date).toISOString().split('T')[0]}</td>
                            <td>{transaction.category[0].name}</td>
                            <td></td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        {#if selectedTransaction.id !== ''}
            <div class="transaction-update">
                <div>
                    <span>Payee:</span>
                    <select bind:value={updatedTransaction.payee_id}>
                        {#each payees.data as payee}
                            <option value={payee.id}>{payee.name}</option>
                        {/each}
                    </select>
                </div>
                <div>
                    <span>Category:</span>
                    <select bind:value={updatedTransaction.category_id}>
                        {#each categories.data as category}
                            <option value={category.id}>{category.name}</option>
                        {/each}
                    </select>
                </div>
                <div>
                    <span>Amount:</span>
                    <input type="number" bind:value={updatedTransaction.transaction_amount} />
                </div>
                <div>
                    <span>Date:</span>
                    <input type="date" bind:value={updatedTransaction.transaction_date} />
                </div>
                <div>

                    <button onclick={updateTransaction}>Save</button>
                    {#if !confirmDelete}
                    <button class="delete" onclick={deleteTransaction}>Delete</button>
                    {/if}
                    {#if confirmDelete}
                    <button class="confirm" onclick={deleteTransaction}>Are you sure?</button>
                    {/if}
                </div>
            </div>
        {/if}
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
        .transaction-selection {
            max-height: 10rem;
            overflow: scroll;
            border: 2px solid var(---text);
            table {
                border-collapse: collapse;
                width: 100%;
                tr, th {
                    text-align: center;
                    border: 1px solid var(---text);
                    td {
                        border: 1px solid var(---text);
                        padding: 0.5rem;
                    }
                }
                .transaction {
                    cursor: pointer;
                    &:hover {
                        background-color: var(---background-accent);
                        color: var(---text);
                    }
                }
                .selected {
                    background-color: var(---primary);
                    color: var(---background)
                }
            }
        }
        .transaction-update {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin: 1rem;
            div {
                display: flex;
                gap: 1rem;
                span {
                    width: 8rem;
                }
                select, input {
                    width: 20rem;
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                }
            }
            button {
                width: 25%;
                padding: 0.5rem;
                border-radius: 0.5rem;
                background-color: var(---primary);
                color: var(---background);
                cursor: pointer;
            }
            .delete {
                background-color: var(---delete);
                color: var(---text)
            }
            .confirm {
                background-color: var(---primary);
                color: var(---background)
            }
        }
	}
    @media (max-width: 768px) {
        .wrap {
            .select-category {
                flex-direction: row;
                font-size: 0.8rem;
                select {
                    font-size: 0.8rem;
                }
            }
            .transaction-selection {
                height: 20rem;
                font-size: 0.75rem;
            }
        }
    }
    @media (max-width: 500px) {
        .wrap {
            .select-category {
                select {
                    width: 100%;
                }
            }
            .transaction-selection {
                height: 30rem;
                font-size: 0.5rem;
            }
        }
    }
</style>
