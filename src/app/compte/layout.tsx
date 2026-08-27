import type { Metadata, Viewport } from "next"
import { redirect } from "next/navigation"

import { CitizenShell } from "@/components/citizen/citizen-shell"
import { canAccessCitizenSpace } from "@/modules/access"
import { getCurrentUser } from "@/modules/auth"

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: "DEEE Kinshasa",
    statusBarStyle: "default",
  },
}

export const viewport: Viewport = {
  themeColor: "#f3f5f7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default async function CitizenLayout({
  children,
}: LayoutProps<"/compte">) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/connexion?next=/compte")
  }
  if (!canAccessCitizenSpace(user.role)) {
    redirect("/interdit")
  }

  return <CitizenShell user={user}>{children}</CitizenShell>
}
