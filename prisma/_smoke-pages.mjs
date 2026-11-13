import { config } from "dotenv"

config({ path: ".env", override: true })

const base = "http://localhost:3000"

async function login(identifier, password) {
  const res = await fetch(`${base}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  })
  const cookie = (res.headers.getSetCookie?.() || [])
    .map((item) => item.split(";")[0])
    .join("; ")
  const body = await res.json()
  if (res.status !== 200) {
    throw new Error(`${identifier} ${res.status} ${body.error?.message || ""}`)
  }
  return cookie
}

async function check(path, cookie) {
  const res = await fetch(base + path, { headers: { cookie }, redirect: "manual" })
  const html = await res.text()
  const bad =
    html.includes("TruckIcon") ||
    html.includes("ReferenceError") ||
    html.includes("is not defined") ||
    html.includes("Application error")
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""
  console.log(
    `${res.status} ${path} ${bad ? "ERROR" : "ok"} ${title}`
  )
  return res.status >= 500 || bad
}

const admin = await login(
  "gvb.admin@deee.local",
  process.env.GVB_ADMIN_PASSWORD
)
const partner = await login(
  "partenaire@rawbank.deee.local",
  "Partenaire-Rawbank-2026"
)
const shop = await login("gombe@vodacom.deee.local", "Shop-Vodacom-Gombe-2026")
const citizen = await login("citoyen@deee.local", "Citoyen-Kinshasa-2026")

const plan = [
  [admin, ["/admin", "/admin/utilisateurs", "/admin/partenaires", "/admin/shops", "/admin/materiels", "/admin/depots", "/admin/echanges", "/admin/parametres", "/admin/collectes"]],
  [partner, ["/partenaire", "/partenaire/utilisateurs", "/partenaire/shops", "/partenaire/offres", "/partenaire/depots", "/partenaire/echanges"]],
  [shop, ["/shop", "/shop/depots", "/shop/echanges"]],
  [citizen, ["/compte", "/compte/depot", "/compte/echange", "/compte/shops", "/compte/profil", "/compte/catalogue"]],
]

let failed = false
for (const [cookie, paths] of plan) {
  for (const path of paths) {
    if (await check(path, cookie)) failed = true
  }
}

const home = await fetch(base + "/")
console.log(`${home.status} / ${home.ok ? "ok" : "ERROR"}`)
if (!home.ok) failed = true
if (failed) process.exit(1)
