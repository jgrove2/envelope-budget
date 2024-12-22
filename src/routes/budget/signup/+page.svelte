<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="signin">
	<h1>Signup</h1>
	<form method="post" action="?/login" use:enhance>
		<label>
			<span>Username</span>
			<input name="username" />
		</label>
		<label>
			<span>Password</span>
			<input type="password" name="password" />
		</label>
		<span class="form-buttons">
			<button formaction="?/register">Register</button>
			<button onclick={() => goto("/")}>Cancel</button>
		</span>
	</form>
	<p style="color: red">{form?.message ?? ''}</p>
</div>

<style>
	.signin {
		display: flex;
		height: 100vh;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		h1 {
			color: var(---text);
			font-size: 3rem;
		}
		form {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			.form-buttons {
				display: flex;
				flex-direction: row;
				gap: 1rem;
				width: 24rem;
				button {
					color: var(---background);
					background-color: var(---text);
					border: 0;
					width: calc(50% - 0.5rem);
					height: 2rem;
					font-size: 1rem;
				}
			}
			label {
				display: flex;
				flex-direction: row;
				align-items: center;
				width: 24rem;
				input {
					width: 65%;
					height: 2rem;
					padding-left: 0.5rem;
					border: 2px solid var(---text);
					color: var(---text);
					background-color: var(---background);
				}
				span {
					width: 35%;
					font-size: 1rem;
					color: var(---text);
				}
			}
		}
	}
</style>
