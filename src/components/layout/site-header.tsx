"use client"

import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { Logo } from "@/components/brand/logo"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#catalogue", label: "Catalogue" },
  { href: "#points", label: "Points" },
  { href: "#shops", label: "Shops" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="#shops"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
          >
            Trouver un shop
          </Link>
          <Link
            href="#comment-ca-marche"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Déposer un appareil
          </Link>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Ouvrir le menu"
              />
            }
          >
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100%,20rem)]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {NAV.map((item) => (
                <SheetClose
                  key={item.href}
                  render={
                    <Link
                      href={item.href}
                      className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted"
                    />
                  }
                >
                  {item.label}
                </SheetClose>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 px-4">
              <Link
                href="#shops"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" })
                )}
              >
                Trouver un shop
              </Link>
              <Link
                href="#comment-ca-marche"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Déposer un appareil
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
