import { Logo } from "@/components/brand/logo"
import { PARTNERS } from "@/lib/shops"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Collecte des déchets d’équipements électriques et électroniques à
            Kinshasa. Déposez vos appareils en shop, gagnez des points,
            contribuez au recyclage.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="font-medium">Parcours</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <a href="/#comment-ca-marche" className="hover:text-foreground">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="/#catalogue" className="hover:text-foreground">
                  Catalogue
                </a>
              </li>
              <li>
                <a href="/#shops" className="hover:text-foreground">
                  Shops
                </a>
              </li>
              <li>
                <a href="/#partenaires" className="hover:text-foreground">
                  Partenaires
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Compte</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <a href="/connexion" className="hover:text-foreground">
                  Connexion
                </a>
              </li>
              <li>
                <a href="/inscription" className="hover:text-foreground">
                  Créer un compte
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Partenaires</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              {PARTNERS.map((partner) => (
                <li key={partner.id}>{partner.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} DEEE Kinshasa
        </p>
      </div>
    </footer>
  )
}
