# Modules métier

Chaque dossier est un **contexte**. Importer uniquement `index.ts` (sauf le seed : voir `docs/conventions.md`).

| Dossier | Fait aujourd’hui |
|---|---|
| `identity` | Normaliser / parser un identifiant, le retrouver en base |
| `users` | Compte, rôle, statut ; inviter les opérateurs GVB ; inscription citoyenne |
| `auth` | Mot de passe, session, login, logout, utilisateur courant |
| `access` | Chemin d’atterrissage et droits d’entrée par rôle |
| `partners` | Entreprises partenaires ; équipe d’administrateurs d’entreprise |
| `shops` | Points de dépôt ; un login par boutique ; consultation GVB |
| `notify` | E-mail SMTP (invitation d’activation) |

À ouvrir ensuite, dans cet ordre : `catalog` → `deposits` / `redeems` / `ledger` → `collections`.
