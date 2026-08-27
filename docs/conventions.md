# Conventions — comment travailler dans ce dépôt

Lisez d’abord [`architecture.md`](./architecture.md). Ce fichier dit **où** coller du code, pour que le prochain développeur ne cherche pas.

## Où va une nouvelle fonctionnalité ?

1. La **règle** (qui a le droit, quel statut, quel effet sur les points) → `src/modules/<contexte>/`.
2. L’**I/O base** → `repository.ts` du même module, via `prisma` (`src/platform/db.ts`).
3. L’**HTTP** → `src/app/api/v1/<contexte>/.../route.ts` : parser, appeler le module, renvoyer JSON.
4. L’**écran** → `src/app/.../page.tsx` (serveur) + `src/components/...` (UI).
5. Un **secret**, un cookie, Postgres → `import "server-only"` en tête de fichier.

N’ouvrez pas un module « plus tard » trop tôt. L’ordre prévu est dans `src/modules/README.md`.

## Imports

| Depuis | Vers |
|---|---|
| `app/`, `components/`, `lib/` | Uniquement `@/modules/<nom>` (`index.ts`) |
| Un fichier **dans** un module | Fichiers cousins en **relatif** (`./password`) |
| Un module | Un autre module via `@/modules/<nom>` |
| N’importe où | `@/platform/<fichier>` (db, http, errors, …) |
| `platform/` | Jamais `modules/` |
| `src/proxy.ts` | Uniquement `@/platform/session` (Edge : pas de Prisma, pas de bcrypt) |

ESLint refuse les imports `@/modules/auth/login` depuis `app/` : c’est voulu.

Les Client Components n’importent **que des types** depuis un module (`import type { AuthUser }`). Les valeurs (login, prisma, cookies) casseraient le bundle.

## Seed Prisma

`prisma/seed.ts` tourne dans Node, pas dans Next. Le paquet `server-only` **lève une exception** hors runtime React Server.

Donc le seed :

- peut importer des helpers **sans** `server-only` (ex. `gvb-admin-profile.ts`, `platform/password.ts`) ;
- ne doit **pas** importer `platform/db.ts` ni un `repository.ts` ;
- ouvre sa propre connexion Prisma, puis se déconnecte.

## États

- Métier : colonne / enum Postgres, changée dans une **transaction**.
- Session : cookie httpOnly + table `Session`.
- Écran : `useState` local, puis `router.refresh()` après une mutation.

## Checklist d’une PR « nouveau contexte »

- [ ] Dossier `src/modules/<nom>/` avec `index.ts` commenté (une phrase : ce que le module *est*).
- [ ] Ligne ajoutée dans `src/modules/README.md`.
- [ ] Tables Prisma seulement si ce module en a besoin.
- [ ] Route `app/api/v1/...` sans logique métier inline.
- [ ] Aucun secret dans `.env.example` (placeholders uniquement).
