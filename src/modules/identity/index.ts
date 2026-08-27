/**
 * Identity — comment on reconnaît une personne.
 *
 * Aujourd’hui : e-mail. Demain : téléphone. Le reste de l’app parle
 * d’« identifiant », pas d’e-mail en dur.
 */
export { normalizeEmail } from "./normalize"
export { parseIdentifier } from "./parse-identifier"
export { findUserByIdentifier } from "./repository"
export type { ParsedIdentifier } from "./parse-identifier"
