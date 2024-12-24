// zero schemas

import { ANYONE_CAN, column, createSchema, createTableSchema, definePermissions, NOBODY_CAN, type ExpressionBuilder, type TableSchema } from "@rocicorp/zero"
const {json} = column;
const userSchema = createTableSchema({
	tableName: 'user',
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
		userId: 'string',
		name: 'string',
		creationDate: 'number'
	},
	primaryKey: 'id',
	relationships: {
		user: {
			sourceField: 'userId',
			destSchema: userSchema,
			destField: 'id'
		}
	}
})

const categoryGroupSchema = createTableSchema({
	tableName: 'category_group',
	columns: {
		id: 'string',
		userId: 'string',
		name: 'string'
	},
	primaryKey: 'id',
	relationships: {
		user: {
			sourceField: 'userId',
			destSchema: userSchema,
			destField: 'id'
		}
	}
})

const categorySchema = createTableSchema({
	tableName: 'category',
	columns: {
		id: 'string',
		userId: 'string',
		name: 'string',
		groupId: 'string',
		budget: json<{[key: number]: number}>(),
		creationDate: 'number'
	},
	primaryKey: 'id',
	relationships: {
		user: {
			sourceField: 'userId',
			destSchema: userSchema,
			destField: 'id'
		},
		group: {
			sourceField: 'groupId',
			destSchema: categoryGroupSchema,
			destField: 'id'
		}
	}
})

const transactionSchema = createTableSchema({
	tableName: 'transaction',
	columns: {
		id: 'string',
		userId: 'string',
		transactionAmount: 'number',
		payeeId: 'string',
		transactionDate: 'number'
	},
	primaryKey: 'id',
	relationships: {
		user: {
			sourceField: 'userId',
			destSchema: userSchema,
			destField: 'id'
		},
		payee: {
			sourceField: 'payeeId',
			destSchema: payeeSchema,
			destField: 'id'
		}
	}
})

export const schema = createSchema({
	version: 1,
	tables: {
		user: userSchema,
		payee: payeeSchema,
		category: categorySchema,
		category_group: categoryGroupSchema,
		transaction: transactionSchema
	},

})

export type User = typeof userSchema;
export type Payee = typeof payeeSchema;
export type Category = typeof categorySchema;
export type CategoryGroup = typeof categoryGroupSchema;
export type Transaction = typeof transactionSchema;
export type Schema = typeof schema;

type AuthData = {
    sub: string;
}

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
    const allowIfLoggedIn = (authData: AuthData, {cmpLit}:ExpressionBuilder<TableSchema>) => cmpLit(authData.sub, "IS NOT", null);
	const allowIfUser = (authData: AuthData, {cmp}: ExpressionBuilder<User>,) => cmp("id", "=", authData.sub)
    const allowIfTransactionCreator = (authData: AuthData, {cmp}: ExpressionBuilder<Transaction>,) => cmp('userId', '=', authData.sub);
    const allowIfPayeeCreator = (authData: AuthData, {cmp}: ExpressionBuilder<Payee>,) => cmp('userId', '=', authData.sub);
    const allowIfCategoryCreator = (authData: AuthData, {cmp}: ExpressionBuilder<Category>,) => cmp('userId', '=', authData.sub);
    const allowIfCategoryGroupCreator = (authData: AuthData, {cmp}: ExpressionBuilder<CategoryGroup>,) => cmp('userId', '=', authData.sub);
    return {
        user: {
            read: [allowIfUser],
            create: ANYONE_CAN,
            update: NOBODY_CAN,
            delete: NOBODY_CAN
        },
        payee: {
            read: [allowIfPayeeCreator],
            create: [allowIfLoggedIn],
            update: {
                preMutation: [allowIfPayeeCreator],
                postMutation: [allowIfPayeeCreator]
            },
            delete: [allowIfPayeeCreator]
        },
        category: {
            read: [allowIfCategoryCreator],
            create: [allowIfLoggedIn],
            update: {
                preMutation: [allowIfCategoryCreator],
                postMutation: [allowIfCategoryCreator]
            },
            delete: [allowIfCategoryCreator]
        },
        category_group: {
            read: [allowIfCategoryGroupCreator],
            create: [allowIfLoggedIn],
            update: {
                preMutation: [allowIfCategoryGroupCreator],
                postMutation: [allowIfCategoryGroupCreator]
            },
            delete: [allowIfCategoryGroupCreator]
        },
        transaction: {
            read: [allowIfTransactionCreator],
            create: [allowIfLoggedIn],
            update: {
                preMutation: [allowIfTransactionCreator],
                postMutation: [allowIfTransactionCreator]
            },
            delete: [allowIfTransactionCreator]
        }
    }
})