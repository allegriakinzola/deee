# Guide d’administration

Les changements se font dans l’application. Il n’y a pas d’accès direct à la base.

## Créer un partenaire

1. Connectez-vous avec un compte administrateur GVB.
2. Ouvrez **Partenaires**.
3. Choisissez **Créer un partenaire**.
4. Indiquez le nom, le nom court, le secteur (télécom, banque ou produits) et la récompense (forfait, produit physique ou service).
5. Le logo est facultatif. L’administrateur du partenaire aussi : vous pourrez l’inviter plus tard.
6. Validez. Un télécom reçoit par défaut « Forfait data » et « Forfait appels ». Les autres reçoivent « T-shirt », « Képi » et « Powerbank », sauf si vous avez choisi un service.

## Créer ou modifier une offre

1. Le partenaire se connecte et ouvre **Offres**.
2. Pour ajouter : saisissez le libellé (par exemple « Forfait data 1 Go » ou « Powerbank ») puis **Ajouter**.
3. Pour modifier : ouvrez le crayon, changez le libellé, enregistrez. Les échanges déjà envoyés gardent l’ancien libellé.
4. Pour retirer : ouvrez la corbeille et confirmez. L’offre ne revient pas toute seule.
5. Le citoyen voit uniquement les offres actives de ce partenaire, après avoir saisi le code du shop.

## Modifier le barème

1. **Matériels** : ajoutez, renommez ou retirez un appareil, et changez ses points. Les dépôts déjà envoyés gardent les points figés au moment de la préparation.
2. **Paramètres** : la valeur d’un bon est globale. Par défaut, 1 bon = 10 USD. Avec 0,04 USD le point, un bon vaut 250 points.
3. Ces deux écrans mettent à jour les données utilisées par les dépôts et les échanges. Aucune requête SQL n’est nécessaire.

## Mise en production

1. `npm run db:deploy` applique les migrations.
2. `npm run build` prépare l’application.
3. `npm start` lance le site. Le temps réel passe par `GET /api/v1/live`, une requête HTTP que `next start` sait servir. L’adresse socket `/live` répondait 404, parce que Next ne l’expose pas.
4. `DATABASE_URL` est la seule adresse de la base, pour l’application et les migrations.
5. L’image Docker ne contient aucune variable. Au démarrage sur le VPS, le conteneur lit le `.env` : `DATABASE_URL` vers `127.0.0.1` et `NEXT_PUBLIC_SITE_URL=https://deee.nexttechnologies.site`.
6. Les nouveaux logos sont enregistrés en base et restent après un déploiement. Un logo déjà stocké dans `public/uploads` et absent du serveur s’affiche par le nom : il faut le renvoyer.
