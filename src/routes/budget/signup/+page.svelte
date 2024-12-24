<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="signup">
	<h1>Signup</h1>
	<form method="post" action="?/register" use:enhance>
		<label>
			<span>Username</span>
			<input name="username" />
		</label>
		<label>
			<span>Password</span>
			<input type="password" name="password" />
		</label>
		<span class="form-buttons">
			<button>Register</button>
			<button formaction="?/cancel">Cancel</button>
		</span>
		<a href="/budget/signin">Signin to budget</a>
	</form>
	<p style="color: red">{form?.message ?? ''}</p>
</div>

<style>
	.signup {
		display: flex;
		height: 100dvh;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		h1 {
			color: var(---text);
		}
		form {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			.form-buttons {
				display: flex;
				flex-direction: row;
				gap: 1rem;
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
				input {
					width: 65%;
					height: 2rem;
					padding-left: 0.5rem;
					border: 2px solid var(---text);
					color: var(---text);
					background-color: var(---background);
					font-size: 1rem;
				}
				span {
					width: 35%;
					font-size: 1rem;
					color: var(---text);
				}
			}
			a {
				color: var(---text);
				text-align: center;
				&:visited {
					text-decoration: none;
				}
			}
		}
	}
	@media only screen and (max-width: 700px) {
		.signup {
			h1 {
				font-size: 2rem;
			}
			.form-buttons {
				width: 18rem;
			}
			label {
				width: 18rem;
			}
		}
	}
	@media only screen and (min-width: 701px) {
		.signup {
			h1 {
				font-size: 3rem;
			}
			.form-buttons {
				width: 24rem;
			}
			label {
				width: 24rem;
			}
		}
	}
</style>
