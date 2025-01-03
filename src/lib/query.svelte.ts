import type { Query as QueryParam, QueryType, Smash, TypedView } from '@rocicorp/zero';
import { type AdvancedQuery, type TableSchema } from '@rocicorp/zero/advanced';
import { get_cache } from './z.svelte';

// Editors Note:
// There is a lot of casting going on here. Much of which is based on zero-react.
// If you can solve some of these issues, please PR, but since it's how the Zero team is doing it
// I'm ok with it.
// - Scott
export type ResultType = 'unknown' | 'complete';

export type QueryResultDetails = {
	type: ResultType;
};

export type QueryResult<TReturn extends QueryType> = [Smash<TReturn>, QueryResultDetails];

const emptyArray: unknown[] = [];
const disabledSubscriber = () => () => {};

const defaultSnapshots = {
	singular: [undefined, { type: 'unknown' }] as const,
	plural: [emptyArray, { type: 'unknown' }] as const
};

function getDefaultSnapshot<TReturn extends QueryType>(singular: boolean): QueryResult<TReturn> {
	return (singular ? defaultSnapshots.singular : defaultSnapshots.plural) as QueryResult<TReturn>;
}

export class Query<TSchema extends TableSchema, TReturn extends QueryType> {
	#queryImpl: AdvancedQuery<TSchema, TReturn>;
	// I have to do this casting because I can't create $state in the constructor and otherwise TS
	// will think non-sigular might be undefined (where they will be an array);
	data = $state() as unknown as Smash<TReturn>;
	#onChangeCallback?: (snap: Smash<TReturn>) => void;
	client_id = $state(get_cache().z.userID);

	constructor(q: QueryParam<TSchema, TReturn>, enable: boolean = true) {
		this.#queryImpl = q as unknown as AdvancedQuery<TSchema, TReturn>;
		this.data = getDefaultSnapshot(this.#queryImpl.format.singular) as unknown as Smash<TReturn>;

		$effect(() => {
			const view: TypedView<Smash<TReturn>> | undefined = this.#queryImpl.materialize();
			const unsubscribe = view.addListener((snap) => {
				this.data = (snap === undefined ? snap : $state.snapshot(snap)) as Smash<TReturn>;
				if (this.#onChangeCallback) {
					this.#onChangeCallback(this.data);
				}
			});

			return () => {
				unsubscribe();
			};
		});

		this.data = getDefaultSnapshot(this.#queryImpl.format.singular) as unknown as Smash<TReturn>;
	}
	onChange(callback: (snap: Smash<TReturn>) => void) {
		this.#onChangeCallback = callback;
	}
}