import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "DEEE Kinshasa — Déchets d’équipements électriques et électroniques",
  description:
    "Avec DEEE Kinshasa, déposez vos déchets d’équipements électriques et électroniques dans un shop, gagnez des points, et contribuez au recyclage.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${sans.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
