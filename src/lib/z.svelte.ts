import { PUBLIC_SERVER } from '$env/static/public';
import { Zero } from '@rocicorp/zero';
import { getContext, setContext } from 'svelte';
import { schema } from './zSchema';

// This is the state of the Zero instance
// You can reset it on login or logout
export class ZCache {
	z: Zero<typeof schema> = $state(null!);

	constructor() {
		this.build();
		setContext('z', this);
	}

	build() {
		// Get jwt and decode it
		const options = get_z_options();
		// Create new Zero instance
		this.z = new Zero(options);
	}

	// Reset the Zero instance
	reset() {
		// First close
		// Should this be this tied to the cache itself?
		this.z?.close();
		this.build();
	}
}

export function get_cache() {
	return getContext<ZCache>('z');
}

export function get_z_options() {
	let userID = localStorage.getItem('user');
	console.log(localStorage);
	if (userID) {
		return {
			userID: userID ?? 'anon',
			server: PUBLIC_SERVER,
			schema,
			auth: userID ?? undefined
		} as const;
	} else {
        return {
            userID: 'anon',
            server: PUBLIC_SERVER,
            schema,
			auth: undefined
        } as const;
    }
}
