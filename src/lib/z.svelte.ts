import { PUBLIC_SERVER } from '$env/static/public';
import { Zero } from '@rocicorp/zero';
import { getContext, setContext } from 'svelte';
import { schema } from './schema';

// This is the state of the Zero instance
// You can reset it on login or logout
export class ZCache {
	z: Zero<typeof schema> = $state(null!);
	zUser: string = $state('anon');
	

	constructor() {
		this.build();
		setContext('z', this);
	}

	getCurrentUserID() {
		return this.zUser;
	}

	build() {
		// Get jwt and decode it
		const options = get_z_options("anon");
		console.log("Building Zero instance with options: ", options);
		// Create new Zero instance
		this.z = new Zero(options);
		console.log("Zero instance created: ", this.z);
		this.z.query
	}

	// Reset the Zero instance
	reset() {
		// First close
		// Should this be this tied to the cache itself?
		this.zUser = 'anon';
		this.z?.close();
		this.build();
	}
	setUser(userID: string) {
		this.zUser = userID;
		this.z?.close();
		this.build();
	}
}

export function get_cache() {
	return getContext<ZCache>('z');
}

export function get_z_options(userID: string) {
	if (userID) {
		return {
			userID: userID,
			server: PUBLIC_SERVER,
			schema,
			auth: undefined
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
