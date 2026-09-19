import { access, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const OUT_DIR = path.join("d:/recyclage/frontend/public/materials")

const UA =
  "DEEEKinshasaMaterialCatalog/1.0 (https://deee.cd; educational reference photos)"

function wiki(file: string) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=800`
}

function unsplash(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&h=800&q=80`
}

const ITEMS: Array<{ slug: string; urls: string[] }> = [
  {
    slug: "smartphone-tactile",
    urls: [
      wiki("Blackview A60 Smartphone Android mobile phone front face logged in screen.jpg"),
      unsplash("photo-1511707171634-5f897ff02aa9"),
    ],
  },
  {
    slug: "telephone-a-touches",
    urls: [
      wiki("Nokia_3310_Blue.jpg"),
      wiki("Nokia_3310.jpg"),
      unsplash("photo-1580910051074-3eb694886505"),
    ],
  },
  {
    slug: "tablette",
    urls: [wiki("IPad_Air.png"), unsplash("photo-1544244015-0df4b3ffc6b0")],
  },
  {
    slug: "ordinateur-portable",
    urls: [
      wiki("MacBook_Pro.jpg"),
      unsplash("photo-1496181133206-80ce9b88a853"),
    ],
  },
  {
    slug: "ordinateur-de-bureau",
    urls: [
      wiki("Desktop_computer.jpg"),
      unsplash("photo-1593640408182-31c70c8268f5"),
    ],
  },
  {
    slug: "clavier",
    urls: [
      wiki("Computer-keyboard.jpg"),
      unsplash("photo-1587829741301-dc798b83add3"),
    ],
  },
  {
    slug: "souris",
    urls: [
      wiki("3-Tastenmaus_Microsoft.jpg"),
      unsplash("photo-1527864550417-7fd91fc51a46"),
    ],
  },
  {
    slug: "imprimante",
    urls: [
      wiki("Inkjet_printer.jpg"),
      unsplash("photo-1612815154858-60aa4c59eaa6"),
    ],
  },
  {
    slug: "disque-dur",
    urls: [wiki("Hard_disk.jpg"), wiki("HDD_opened.jpg")],
  },
  {
    slug: "ssd",
    urls: [
      wiki("Samsung 980 PRO PCIe 4.0 NVMe SSD 1TB-top PNr°0915.jpg"),
      wiki("2017 Dysk SSD Plextor M8Pe(Y) 256GB.jpg"),
    ],
  },
  {
    slug: "routeur",
    urls: [wiki("Wireless_router.jpg"), wiki("Adsl_modem_router.jpg")],
  },
  {
    slug: "box",
    urls: [
      wiki("Livebox 6 - Devant & Coté droit - IMG 0056.jpg"),
      wiki("Livebox sagem.jpg"),
    ],
  },
  {
    slug: "modem",
    urls: [
      wiki("ARRIS CM820B DOCSIS Cable Modem.jpg"),
      wiki("Arris TG2482 cable modem.jpg"),
    ],
  },
  {
    slug: "batterie-lithium-ion",
    urls: [
      wiki("18650 and 21700 lithium ion battery cell.jpg"),
      wiki("Pentax Optio P70 - Lithium-Ion Battery D-LI88-7555.jpg"),
    ],
  },
  {
    slug: "batterie-plomb-acide",
    urls: [
      wiki("Photo-CarBattery.jpg"),
      wiki("Car_battery.jpg"),
    ],
  },
  {
    slug: "pile-alcaline",
    urls: [
      wiki("AA VARTA battery-side PNr°0782.jpg"),
      wiki("Golden Power Power Plus AA alkaline batteries.jpg"),
    ],
  },
  {
    slug: "chargeur",
    urls: [
      wiki("Phone charger 2026.jpg"),
      wiki("Apple 5W USB Power Adapter (4935).jpg"),
    ],
  },
  {
    slug: "adaptateur",
    urls: [
      wiki("Notebook-Computer-AC-Adapter.jpg"),
      wiki("Wall-Wart-AC-Adapter.jpg"),
    ],
  },
  {
    slug: "fer-a-repasser",
    urls: [wiki("Electric_iron.jpg"), wiki("Steam_iron.jpg")],
  },
  {
    slug: "ventilateur",
    urls: [wiki("Electric_fan.jpg"), wiki("Pedestal_fan.jpg")],
  },
  {
    slug: "radio",
    urls: [
      wiki("RCA Victor Co. -Transistor Radio Pockette 1-TP-2E.jpg"),
      wiki("Radio_receiver.jpg"),
    ],
  },
  {
    slug: "lecteur-cd",
    urls: [
      wiki("Portable_CD_player.jpg"),
      wiki("Discman.jpg"),
    ],
  },
  {
    slug: "grille-pain",
    urls: [wiki("Toaster.jpg"), wiki("Pop-up_toaster.jpg")],
  },
  {
    slug: "cafetiere",
    urls: [
      wiki("Filter_coffee_machine.jpg"),
      wiki("Coffee_maker.jpg"),
    ],
  },
  {
    slug: "decodeur-tv",
    urls: [
      wiki("Set-top Box, 2013.png"),
      wiki("Digital-tv-box från Nokia.jpg"),
    ],
  },
  {
    slug: "carte-bancaire-expiree",
    urls: [
      wiki("Credit-cards.jpg"),
      wiki("Payment_cards.jpg"),
    ],
  },
]

function isRaster(bytes: Buffer) {
  if (bytes.length < 12) return false
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return true
  }
  if (
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return true
  }
  return false
}

async function download(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*" },
    redirect: "follow",
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${url}`)
  }
  const bytes = Buffer.from(await response.arrayBuffer())
  if (!isRaster(bytes)) {
    throw new Error(`not raster ${url}`)
  }
  if (bytes.length > 2 * 1024 * 1024) {
    throw new Error(`too big ${bytes.length} ${url}`)
  }
  return bytes
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const failed: string[] = []
  for (const item of ITEMS) {
    const dest = path.join(OUT_DIR, `${item.slug}.jpg`)
    try {
      await access(dest)
      console.log(`skip ${item.slug}`)
      continue
    } catch {
      // not yet downloaded
    }
    let saved = false
    for (const url of item.urls) {
      try {
        const bytes = await download(url)
        const dest = path.join(OUT_DIR, `${item.slug}.jpg`)
        await writeFile(dest, bytes)
        console.log(`ok ${item.slug} (${bytes.length} bytes)`)
        saved = true
        break
      } catch (error) {
        console.log(`fail ${item.slug}: ${(error as Error).message}`)
      }
    }
    if (!saved) {
      failed.push(item.slug)
    }
  }
  if (failed.length > 0) {
    console.error("FAILED", failed.join(", "))
    process.exit(1)
  }
}

main()
