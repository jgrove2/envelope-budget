// export class BudgetHelper {
// 	#selectedMonth: {state: Date} = $state({state: new Date()});
//     get selectedMonth() {
//         return this.#selectedMonth.state;
//     }
//     set selectedMonth(date: Date) {
//         this.#selectedMonth = {state: date};
//     }
//     #leftOverBalance: number = $state(0);
//     get leftOverBalance() {
//         return this.#leftOverBalance;
//     }
//     set leftOverBalance(newBalance: number) {
//         this.#leftOverBalance = newBalance;
//     }
// }

export const budgetHelper = $state({selectedMonth: new Date(), leftOverBalance: 0});