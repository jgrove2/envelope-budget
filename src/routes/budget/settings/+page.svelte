<script lang="ts">
	import CategoryGroupMenu from '$lib/components/settings/CategoryGroupMenu.svelte';
	import CategoryMenu from '$lib/components/settings/CategoryMenu.svelte';
	import NewCategory from '$lib/components/settings/NewCategory.svelte';
	import NewCategoryGroup from '$lib/components/settings/NewCategoryGroup.svelte';
	import TransactionMenu from '$lib/components/settings/TransactionMenu.svelte';
	import type { PageServerData } from './$types';

	let menu = $state('Categories');
	let { data }: { data: PageServerData } = $props();
</script>

<div class="settings-wrapper">
	<div class="leftNav">
		<div class="settings-links">
			<button
				class={`${menu === 'Categories' ? 'active' : ''}`}
				onclick={() => (menu = 'Categories')}>Categories</button
			>
			<button
				class={`${menu === 'Transactions' ? 'active' : ''}`}
				onclick={() => (menu = 'Transactions')}>Transactions</button
			>
			<button
				class={`${menu === 'Category Groups' ? 'active' : ''}`}
				onclick={() => (menu = 'Category Groups')}>Category Groups</button
			>
            <button
                class={`${menu === 'New Category' ? 'active' : ''}`}
                onclick={() => (menu = 'New Category')}>New Category</button>
            <button
                class={`${menu === 'New Group' ? 'active' : ''}`}
                onclick={() => (menu = 'New Group')}>New Group</button>
		</div>
	</div>
	<div class="rightBody">
		<h1>{menu}</h1>
		{#if menu === 'Categories'}
			<CategoryMenu userID={data.profile} />
		{/if}
		{#if menu === 'Category Groups'}
			<CategoryGroupMenu userID={data.profile} />
		{/if}
		{#if menu === 'Transactions'}
			<TransactionMenu userID={data.profile} />
		{/if}
        {#if menu === 'New Category'}
            <NewCategory userID={data.profile} />
        {/if}
        {#if menu === 'New Group'}
            <NewCategoryGroup userID={data.profile} />
        {/if}
	</div>
</div>

<style>
	.settings-wrapper {
		min-height: 100dvh;
		display: flex;
		text-align: center;
		flex-direction: row;
		.leftNav {
			border-right: 2px solid var(---text);
            border-bottom: 2px solid var(---text);
			display: flex;
			flex-direction: column;
			width: 15%;
            padding-left: 1rem;
			text-align: left;
			button {
				font-size: 1rem;
				border: none;
				background-color: none;
				cursor: pointer;
				&:hover {
					text-decoration: underline;
				}
			}
			.active {
				color: var(---primary);
				font-weight: bold;
			}
            .settings-links {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 1rem;
            }
		}
		.rightBody {
			width: 85%;
			display: flex;
			flex-direction: column;
			h1 {
				font-size: 2rem;
			}
		}
	}
	@media (max-width: 1000px) {
		.settings-wrapper {
			flex-direction: column;
			.leftNav {
				flex-direction: row;
				width: 100%;
                gap: 1rem;
                padding: 1rem;
                margin-bottom: 1rem;
                div {
                    display: flex;
                    flex-direction: row;
                    gap: 1rem;
                    justify-content: center;
                    button {
                        font-size: 0.8rem;
                    }
                }
			}
			.rightBody {
				width: 100%;
				h1 {
					font-size: 1.5rem;
					padding: none;
					margin: 0;
				}
			}
		}
	}
    @media (max-width: 400px) {
        .settings-wrapper {
            .leftNav {
                flex-direction: column;
            }
        }
    }
</style>
