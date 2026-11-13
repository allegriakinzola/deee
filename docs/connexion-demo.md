# Connexion — identifiants en vigueur

La liste complète, avec le rôle, le shop, le code et le parcours, est dans `docs/Identifiants-demonstration-DEEE.docx`.

Adresse locale : la valeur de `NEXT_PUBLIC_SITE_URL` dans `.env`.  
Adresse déployée : https://deee.nexttechnologies.site

L’administrateur GVB `gvb.admin@deee.local` est inchangé. Son mot de passe reste celui de `GVB_ADMIN_PASSWORD`.

Les autres anciens comptes ont été retirés. Les nouveaux e-mails suivent l’entreprise : `partenaire@rawbank.deee.local`, `gombe@vodacom.deee.local`, `lemba@airtel.deee.local`, etc. Ce ne sont pas des boîtes réelles.

| Niveau | E-mail | Mot de passe | Espace |
|---|---|---|---|
| Citoyen | `citoyen@deee.local` | `Citoyen-Kinshasa-2026` | `/compte` |
| Collecteur GVB | `collecteur@gvb.deee.local` | `Collecteur-Gvb-2026` | page « accès non ouvert » |
| Partenaire Rawbank | `partenaire@rawbank.deee.local` | `Partenaire-Rawbank-2026` | `/partenaire` |
| Shop Rawbank Gombe | `gombe@rawbank.deee.local` | `Shop-Rawbank-Gombe-2026` | `/shop` · code `DEMO01` |
| Partenaire Vodacom | `partenaire@vodacom.deee.local` | `Partenaire-Vodacom-2026` | `/partenaire` |
| Shop Vodacom Gombe | `gombe@vodacom.deee.local` | `Shop-Vodacom-Gombe-2026` | `/shop` · code `KBPLLW` |
| Partenaire airtel | `partenaire@airtel.deee.local` | `Partenaire-Airtel-2026` | `/partenaire` |
| Shop Lemba (airtel) | `lemba@airtel.deee.local` | `Shop-Airtel-Lemba-2026` | `/shop` · code `KB9A1E` |
| Partenaire equity | `partenaire@equity.deee.local` | `Partenaire-Equity-2026` | `/partenaire` |
| Shop equity Gombe | `gombe@equity.deee.local` | `Shop-Equity-Gombe-2026` | `/shop` · code `DEMO02` |

Le shop « vodacom lemba2 » appartient à airtel. Son e-mail est donc chez airtel.

`DEMO_SEED=1 npm run db:demo` retire tous les comptes sauf l’administrateur GVB, puis recrée les utilisateurs de ce tableau, avec un dépôt confirmé et un échange confirmé pour le citoyen.
