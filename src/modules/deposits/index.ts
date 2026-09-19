/**
 * Deposits — présélection citoyen, envoi au shop, confirmation, crédit de points.
 */
export type { DirectoryDeposit, DirectoryDepositLine } from "./contract"
export { getCitizenDraft } from "./get-citizen-draft"
export { setDraftLine } from "./set-draft-line"
export { sendDraftToShop } from "./send-draft"
export { listCitizenDepositHistory } from "./list-citizen"
export { listShopInbox } from "./list-shop"
export { getShopDeposit } from "./get-shop-deposit"
export { confirmShopDeposit } from "./confirm-deposit"
export { rejectShopDeposit } from "./reject-deposit"
