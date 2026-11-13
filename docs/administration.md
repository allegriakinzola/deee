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
3. `npm start` lance le site et le socket `/live`. Le citoyen et le shop reçoivent alors la confirmation d’un dépôt ou d’un échange sans recharger la page.
4. `DATABASE_URL` doit être l’adresse poolée Neon. `DIRECT_URL` sert aux migrations.
5. `NEXT_PUBLIC_SITE_URL` est l’adresse publique, sans slash final, par exemple `https://deee.nexttechnologies.site`.
6. Le dossier `public/uploads` n’est pas dans git. Il faut le conserver sur le serveur : ce sont les logos et les photos des matériels.
