# Modules métier

Chaque dossier est un **contexte**. Importer uniquement `index.ts` (sauf le seed : voir `docs/conventions.md`).

| Dossier | Fait aujourd’hui |
|---|---|
| `identity` | Normaliser / parser un identifiant, le retrouver en base |
| `users` | Compte, rôle, statut ; inviter les opérateurs GVB ; inscription citoyenne |
| `auth` | Mot de passe, session, login, logout, utilisateur courant |
| `access` | Chemin d’atterrissage et droits d’entrée par rôle |
| `partners` | Entreprises partenaires ; équipe d’administrateurs d’entreprise |
| `shops` | Points de dépôt ; un login et un code par boutique ; tableau de bord shop |
| `notify` | E-mail SMTP (invitation d’activation) |
| `catalog` | Conversion points ↔ USD / bons |
| `settings` | Valeur d’un bon (1 bon = 10 USD par défaut) |
| `materials` | Matériels DEEE (catégorie, nom, points) |
| `deposits` | Brouillon citoyen, envoi au shop (code), confirmation / refus |
| `redeems` | Échange de bons : envoi au shop (code), confirmation / refus, débit |
| `ledger` | Solde citoyen = somme des écritures ; crédit à la confirmation ; débit à l’échange |

À ouvrir ensuite : `collections`.
