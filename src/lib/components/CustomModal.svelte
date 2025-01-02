<script lang="ts">
	import { onMount } from "svelte";

    let {open = $bindable(), dialogContent } = $props();
    let dialog: HTMLDialogElement | null = $state(null);
    onMount(() => {
        dialog = dialog || document.querySelector('dialog');
    })
</script>
<dialog open={open}>
    {@render dialogContent()}
</dialog>

<style>
    dialog {
        position: fixed;
        top: 10%;
        left: 0;
        width: 50%;
        height: 40%;
        border: 2px solid var(---text);
        background-color: var(---background);
    }
    dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.5);
        animation: fade-in 1s;
    }
	@media only screen and (max-width: 700px) {
        dialog {
            width: 90%;
            height: 50%;
        }
    }
</style>