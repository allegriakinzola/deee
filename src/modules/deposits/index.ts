/**
 * Deposits — présélection citoyen, envoi au shop, confirmation, crédit de points.
 */
export type { DirectoryDeposit, DirectoryDepositLine } from "./contract"
export { getCitizenDraft } from "./get-citizen-draft"
export { setDraftLine } from "./set-draft-line"
export { sendDraftToShop } from "./send-draft"
export { cancelCitizenDeposit } from "./cancel-deposit"
export { listCitizenDepositHistory } from "./list-citizen"
export { listShopInbox } from "./list-shop"
export { summarizeDeposits, summarizeShopDeposits } from "./summarize-shop"
export type { CitizenDashboard } from "./get-citizen-dashboard"
export { getCitizenDashboard } from "./get-citizen-dashboard"
export { getShopDeposit } from "./get-shop-deposit"
export { confirmShopDeposit } from "./confirm-deposit"
export { rejectShopDeposit } from "./reject-deposit"
