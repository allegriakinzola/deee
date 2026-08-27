# Architecture DEEE Kinshasa

Application **fullstack Next.js**. Une seule app : pages publiques, espaces métier, et API (`/api/v1`). Pas de backend séparé.

Point d’entrée pour un développeur qui rejoint le projet. Les règles du quotidien sont dans [`conventions.md`](./conventions.md).

## Carte des dossiers

```
frontend/
  prisma/                 Schéma et migrations (source de vérité persistée)
  docs/                   Décisions d’architecture
  src/
    app/                  Adaptateurs HTTP uniquement (pages + route handlers)
    proxy.ts              Gate Edge : cookie présent ? (pas d’autorisation métier)
    modules/              Capacités métier (un dossier = un contexte)
    platform/             Infra transversale (DB, env, erreurs, HTTP, fichiers)
    components/           UI
    lib/                  Helpers du site public + client HTTP mince
    generated/            Client Prisma — généré, ne pas éditer
```

## Règles (non négociables)

1. **`app/` ne contient pas de métier.** Un `route.ts` parse la requête, appelle un module, renvoie du JSON. Un `layout.tsx` charge l’utilisateur et applique une politique d’accès.
2. **Les autres modules n’importent un module que via son `index.ts`.** À l’intérieur d’un module, imports **relatifs**.
3. **Prisma ne sort pas de `platform/db` et des `repository.ts`.** Exception : `prisma/seed.ts` (script Node, voir conventions).
4. **La base est la source de vérité.** Pas de store client pour solde, rôle, session, ou statut de dépôt.
5. **`import "server-only"`** sur tout fichier qui touche la DB, les cookies, ou un secret.
6. **Identifiant ≠ User.** Un utilisateur a une ou plusieurs identités (`EMAIL` aujourd’hui, `PHONE` plus tard).
7. **Le proxy n’authentifie pas.** Il ne fait qu’un contrôle optimiste (cookie présent). L’autorisation réelle est dans le layout serveur (`getCurrentUser` + `canAccess…`).

## Couches d’un use case

```
UI (formulaire)  →  POST /api/v1/...  →  module (règle métier)  →  repository  →  Postgres
                                                                              ↓
UI (RSC / refresh)  ←  getCurrentUser() / lecture repository  ←  Postgres
```

Exemple actuel : `loginWithPassword` dans `modules/auth`. Le `route.ts` écrit ensuite le cookie (adaptateur HTTP).

## États

| Couche | Où ça vit | Exemples |
|---|---|---|
| Métier | Colonnes / enums Postgres | `UserStatus`, plus tard `DepositStatus` |
| Session | Cookie httpOnly + table `Session` | Connecté ou non, expiration |
| UI | `useState` local | Champ mot de passe, erreur de formulaire |

Un passage d’état métier se fait **dans une transaction SQL**, jamais dans React.

## Rôles et espaces

| Rôle | Espace | Statut |
|---|---|---|
| `GVB_ADMIN` | `/admin` | Ouvert |
| `GVB_COLLECTOR` | `/collecte` | Pas encore |
| `PARTNER_ADMIN` | `/partenaire` | Ouvert (accueil, utilisateurs, shops) |
| `SHOP_STAFF` | `/shop` | Ouvert (accueil) |
| `CITIZEN` | `/compte` | Ouvert (accueil, shops, profil) |

Un seul `/connexion`. Après login, `homePathFor(role)` envoie vers l’espace. Les espaces non ouverts tombent sur `/interdit`.

Les citoyens créent leur compte sur `/inscription` (nom + e-mail). L’activation se fait par le même lien e-mail que les invitations opérateurs, sur `/invitation/[token]`.

L’espace citoyen est **responsive**. Sur téléphone, c’est une app (barre d’onglets, cartes type hero). Sur ordinateur, c’est un layout normal (menu latéral, contenu large), pas un cadre iPhone.

La GVB n’est pas un partenaire. C’est l’opérateur de la plateforme. Un `GVB_ADMIN` n’appartient pas à un shop.

Les **partenaires** créent et gèrent leurs shops. Un shop = un login (`SHOP_STAFF`) ; le responsable ne gère pas d’utilisateurs. La GVB consulte le réseau (`/admin/shops`) sans action pour l’instant. La vitrine publique (`lib/shops.ts`) reste statique.

## API

- Préfixe : `/api/v1/<contexte>/...`
- Succès : `{ "data": { ... } }`
- Erreur : `{ "error": { "code": "INVALID_CREDENTIALS", "message": "..." } }`
- Auth navigateur : cookie `deee_session` (httpOnly, SameSite=Lax). Pas de JWT dans le JS.

## Modules prévus

| Module | Responsabilité |
|---|---|
| `identity` | Normaliser et retrouver EMAIL / PHONE |
| `users` | Compte, rôle, statut ; invitations ; inscription citoyenne |
| `auth` | Mot de passe, session, login / logout |
| `access` | Où chaque rôle atterrit, qui entre où |
| `partners` | Entreprises partenaires, équipe administrateurs |
| `shops` | Points de dépôt (créés par le partenaire ; GVB consulte) |
| `catalog` | Barème pièces (plus tard) |
| `deposits` | Demandes de dépôt + confirmation shop |
| `redeems` | Demandes d’échange + confirmation shop |
| `ledger` | Points, écritures, transactions SQL |
| `collections` | Tournées collecteur (plus tard) |
| `notify` | E-mail SMTP (invitations) ; SMS plus tard |

## Base de données

**Neon Postgres** (connexion dans `.env` / `.env.local`, jamais Git).

Les URLs viennent **telles quelles** de `.env` :

- App : `DATABASE_URL` (poolée)
- Migrations : `DIRECT_URL` (directe)
- Origine du site : `NEXT_PUBLIC_SITE_URL` — aucun `localhost` en dur dans le code. Un lien espace GVB se construit avec `absoluteUrl(homePathFor(role))`.

```bash
npx prisma generate
npm run db:deploy
npm run db:seed
```

Le seed crée (ou met à jour) l’administrateur GVB à partir de `GVB_ADMIN_EMAIL` et `GVB_ADMIN_PASSWORD`.

Un `docker-compose.yml` existe en repli local ; le projet se développe contre Neon.
