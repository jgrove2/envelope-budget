import * as auth from '$lib/server/auth';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './signin/lucia/$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return { user: undefined}
	}
	return redirect(302, '/budget/');
};