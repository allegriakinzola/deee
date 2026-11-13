# Période de test

Deux semaines, avant le lancement, sur le site de démonstration.

## Périmètre

- Un shop télécom, pour un forfait data ou appels.
- Un shop non télécom, pour un goodie (t-shirt, képi ou powerbank).
- Un citoyen pilote, un responsable de shop, un administrateur partenaire, un administrateur GVB.

## Scénarios

1. Le citoyen prépare un dépôt et l’envoie avec le code du shop.
2. Le shop ajuste les quantités, puis confirme. Les points arrivent sur le compte. Le socket met l’écran à jour sans rechargement.
3. Le shop refuse un second dépôt. Aucun point n’est crédité.
4. Le citoyen échange un bon contre une offre de ce partenaire.
5. Le shop confirme l’échange, puis en refuse un autre. Le solde ne bouge qu’à la confirmation.
6. Le partenaire ajoute une offre, en modifie une, en retire une. Le citoyen ne voit que la liste à jour.

## Données fictives

`DEMO_SEED=1 npm run db:demo` ajoute, si elles manquent, un shop de démonstration par partenaire sans shop, un citoyen `demo.citoyen@deee.local`, un dépôt confirmé et un échange confirmé. Le mot de passe du citoyen est celui de `DEMO_CITIZEN_PASSWORD`, ou un mot de passe affiché une fois dans le terminal.

Ne lancez cette commande sur la base de production que si cette base sert encore à la démonstration.
