<script>
	import { onMount } from "svelte";

    async function detectSWUpdate() {
        const registration = await navigator.serviceWorker.ready;

        registration.addEventListener('updatefound', () => {
            const newSW = registration.installing;

            newSW?.addEventListener('statechange', () => {
                if (newSW?.state === 'installed') {
                    if(confirm('New version available! Confirm to update.')) {
                        newSW.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                    }
                }
            });
        });
    }
    onMount(() => {
        detectSWUpdate();
    });
</script>

<slot />

<svelte:head>
    <title>Budget</title>
</svelte:head>