<script>
	import { goto } from '$app/navigation';
</script>

<div class="home-wrapper">
	<h1>Welcome</h1>
	<span>
		<button onclick={() => goto('/budget/signin')}>Signin</button>
		<button onclick={() => goto('/budget/signup')}>Signup</button>
	</span>
</div>

<style>
	.home-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		h1 {
			color: var(---text);
			font-size: 6rem;
		}
		button {
			color: var(---background);
			background-color: var(---text);
			border: 0;
			width: 8rem;
			height: 2rem;
			font-size: 1rem;
		}
		span {
			display: flex;
			flex-direction: row;
			gap: 1rem;
		}
	}
	@media only screen and (max-width: 700px) {
		.home-wrapper {
			h1 {
				font-size: 3rem;
			}
			button {
				width: 6rem;
				font-size: 1rem;
			}
		}
	}
</style>
