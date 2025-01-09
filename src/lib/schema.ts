// zero schemas

import { ANYONE_CAN, column, createSchema, createTableSchema, definePermissions, NOBODY_CAN, type ExpressionBuilder, type TableSchema } from "@rocicorp/zero"
const {json} = column;
const profileSchema = createTableSchema({
	tableName: 'profile',
	columns: {
		id: 'string',
		username: 'string',
		passwordHash: 'string'
	},
	primaryKey: 'id'
})

const payeeSchema = createTableSchema({
	tableName: 'payee',
	columns: {
		id: 'string',
		user_id: 'string',
		name: 'string',
	},
	primaryKey: 'id',
	relationships: {
		profile: {
			sourceField: 'user_id',
			destSchema: profileSchema,
			destField: 'id'
		}
	}
})

const categoryGroupSchema = createTableSchema({
	tableName: 'category_group',
	columns: {
		id: 'string',
		user_id: 'string',
		name: 'string'
	},
	primaryKey: 'id',
	relationships: {
		profile: {
			sourceField: 'user_id',
			destSchema: profileSchema,
			destField: 'id'
		}
	}
})

const categorySchema = createTableSchema({
	tableName: 'category',
	columns: {
		id: 'string',
		user_id: 'string',
		name: 'string',
		group_id: 'string',
		budget: json<{[key: number]: number}>(),
		creation_date: 'number'
	},
	primaryKey: 'id',
	relationships: {
		profile: {
			sourceField: 'user_id',
			destSchema: profileSchema,
			destField: 'id'
		},
		group: {
			sourceField: 'group_id',
			destSchema: categoryGroupSchema,
			destField: 'id'
		}
	}
})

const transactionSchema = createTableSchema({
	tableName: 'transaction',
	columns: {
		id: 'string',
		user_id: 'string',
		transaction_amount: 'number',
		payee_id: 'string',
		transaction_date: 'number',
		category_id: 'string'
	},
	primaryKey: 'id',
	relationships: {
		profile: {
			sourceField: 'user_id',
			destSchema: profileSchema,
			destField: 'id'
		},
		payee: {
			sourceField: 'payee_id',
			destSchema: payeeSchema,
			destField: 'id'
		},
		category: {
			sourceField: 'category_id',
			destSchema: categorySchema,
			destField: 'id'
		}
	}
})

export const schema = createSchema({
	version: 1,
	tables: {
		profile: profileSchema,
		payee: payeeSchema,
		category: categorySchema,
		category_group: categoryGroupSchema,
		transaction: transactionSchema
	},

})

export type Profile = typeof profileSchema;
export type Payee = typeof payeeSchema;
export type Category = typeof categorySchema;
export type CategoryGroup = typeof categoryGroupSchema;
export type Transaction = typeof transactionSchema;
export type Schema = typeof schema;

type AuthData = {
    sub: string;
}

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
	return {
		profile: {
			
		},
		category: {
			
		},
		category_group: {
			
		},
		payee: {
		},
		transaction: {
		}
	}
})