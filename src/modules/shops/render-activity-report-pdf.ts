import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib"

import { formatUsd } from "@/lib/money"

import type { ShopDashboard } from "./get-shop-dashboard"

const PAGE = { width: 595.28, height: 841.89 }
const MARGIN = 48
const WIDTH = PAGE.width - MARGIN * 2
const FOOTER = 32

const INK = rgb(0.12, 0.14, 0.16)
const MUTED = rgb(0.4, 0.42, 0.44)
const LINE = rgb(0.86, 0.88, 0.89)
const EMERALD = rgb(0.02, 0.35, 0.27)
const BAND = rgb(0.93, 0.96, 0.94)
const ROW = rgb(0.97, 0.98, 0.97)
const DEPOSIT = rgb(0.05, 0.45, 0.34)
const REDEEM = rgb(0.55, 0.57, 0.59)

export type ShopActivityReportInput = {
  shopName: string
  shopCode: string
  shopArea: string
  shopStatus: string
  partnerName: string
  generatedBy: string
  generatedAt: string
  periodStart: string
  periodEnd: string
  data: ShopDashboard
}

export async function renderShopActivityReportPdf(
  input: ShopActivityReportInput
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(`Rapport d'activité - ${winAnsi(input.shopName)}`)
  pdf.setAuthor("DEEE Kinshasa")
  pdf.setCreator("DEEE Kinshasa")
  pdf.setSubject("Activité shop, 30 derniers jours")

  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const writer = new ReportWriter(pdf, font, bold)

  writer.cover(input)
  writer.kpis(input.data)
  writer.chart(input.data)
  writer.daily(input.data)
  writer.table(
    "Matériels les plus déposés",
    ["Article", "Qté", "Points"],
    [260, 80, 80],
    ["left", "right", "right"],
    input.data.topMaterials.map((item) => [
      item.name,
      String(item.quantity),
      String(item.points),
    ]),
    "Aucun dépôt confirmé sur la période."
  )
  writer.table(
    "Objets d'échange remis",
    ["Objet", "Nb", "Bons", "USD"],
    [220, 60, 70, 70],
    ["left", "right", "right", "right"],
    input.data.rewards.map((item) => [
      item.label,
      String(item.count),
      String(item.bons),
      formatUsd(item.usd),
    ]),
    "Aucun échange confirmé sur la période."
  )
  writer.table(
    "Dernières opérations",
    ["Citoyen", "Opération", "Points", "Statut"],
    [150, 150, 60, 60],
    ["left", "left", "right", "right"],
    input.data.recent.map((item) => [
      item.citizenName,
      item.title,
      String(item.points),
      item.status === "CONFIRMED" ? "Confirmé" : "Refusé",
    ]),
    "Pas encore d'historique sur 30 jours."
  )
  writer.note(
    "Les points sont crédités au citoyen à la confirmation du dépôt. Le shop n'est pas crédité. Un bon vaut 10 USD."
  )
  writer.stampFooters(input)

  return pdf.save()
}

class ReportWriter {
  private page: PDFPage
  private y: number

  constructor(
    private readonly pdf: PDFDocument,
    private readonly font: PDFFont,
    private readonly bold: PDFFont
  ) {
    this.page = this.pdf.addPage([PAGE.width, PAGE.height])
    this.y = PAGE.height - MARGIN
  }

  cover(input: ShopActivityReportInput) {
    this.page.drawRectangle({
      x: 0,
      y: PAGE.height - 92,
      width: PAGE.width,
      height: 92,
      color: EMERALD,
    })
    this.text("DEEE KINSHASA", MARGIN, PAGE.height - 42, 10, this.bold, rgb(1, 1, 1))
    this.text(
      "Rapport d'activité du shop",
      MARGIN,
      PAGE.height - 64,
      18,
      this.bold,
      rgb(1, 1, 1)
    )
    this.y = PAGE.height - 120

    this.text(input.shopName, MARGIN, this.y, 16, this.bold, INK)
    this.y -= 18
    this.text(
      [
        input.partnerName,
        input.shopArea,
        `Code ${input.shopCode}`,
        input.shopStatus,
      ].join("  ·  "),
      MARGIN,
      this.y,
      10,
      this.font,
      MUTED
    )
    this.y -= 16
    this.text(
      `Période : ${input.periodStart}  -  ${input.periodEnd}`,
      MARGIN,
      this.y,
      10,
      this.font,
      INK
    )
    this.y -= 14
    this.text(
      `Émis le ${input.generatedAt} par ${input.generatedBy}`,
      MARGIN,
      this.y,
      9,
      this.font,
      MUTED
    )
    this.y -= 22
    this.rule()
  }

  kpis(data: ShopDashboard) {
    this.heading("Indicateurs (30 jours)")
    const rows: Array<[string, string, string]> = [
      ["Dépôts en attente", String(data.pendingDeposits), "À valider au comptoir"],
      [
        "Échanges en attente",
        String(data.pendingRedeems),
        "À valider au comptoir",
      ],
      [
        "Dépôts confirmés",
        String(data.confirmedDeposits30),
        `${data.pointsCredited30} pts crédités`,
      ],
      ["Dépôts refusés", String(data.rejectedDeposits30), ""],
      [
        "Échanges confirmés",
        String(data.confirmedRedeems30),
        `${data.bons30} bon${data.bons30 === 1 ? "" : "s"}  ·  ${formatUsd(data.usd30)}`,
      ],
      ["Échanges refusés", String(data.rejectedRedeems30), ""],
      ["Points débités", String(data.pointsDebited30), "Sur échanges confirmés"],
    ]
    this.table(
      null,
      ["Indicateur", "Valeur", "Détail"],
      [200, 70, 150],
      ["left", "right", "left"],
      rows,
      null
    )
  }

  chart(data: ShopDashboard) {
    const slice = data.daily.slice(-14)
    const max = Math.max(
      1,
      ...slice.map((item) => Math.max(item.deposits, item.redeems))
    )
    const height = 78
    this.heading("Activité confirmée (14 derniers jours)")
    this.ensure(height + 36)
    const top = this.y
    const bottom = top - height
    const gap = WIDTH / slice.length

    slice.forEach((item, index) => {
      const x = MARGIN + index * gap + gap * 0.22
      const barW = Math.max(3, gap * 0.22)
      const depH = (item.deposits / max) * height
      const redH = (item.redeems / max) * height
      this.page.drawRectangle({
        x,
        y: bottom,
        width: barW,
        height: Math.max(depH, 0.6),
        color: DEPOSIT,
      })
      this.page.drawRectangle({
        x: x + barW + 1.5,
        y: bottom,
        width: barW,
        height: Math.max(redH, 0.6),
        color: REDEEM,
      })
      this.text(
        item.date.slice(8, 10),
        x,
        bottom - 12,
        7,
        this.font,
        MUTED
      )
    })

    this.y = bottom - 28
    this.text("Dépôts confirmés", MARGIN + 12, this.y, 8, this.font, MUTED)
    this.page.drawRectangle({
      x: MARGIN,
      y: this.y - 1,
      width: 8,
      height: 8,
      color: DEPOSIT,
    })
    this.text("Échanges confirmés", MARGIN + 122, this.y, 8, this.font, MUTED)
    this.page.drawRectangle({
      x: MARGIN + 110,
      y: this.y - 1,
      width: 8,
      height: 8,
      color: REDEEM,
    })
    this.y -= 22
  }

  daily(data: ShopDashboard) {
    const active = data.daily.filter(
      (item) => item.deposits > 0 || item.redeems > 0
    )
    this.table(
      "Jours avec opérations confirmées",
      ["Date", "Dépôts", "Pts in", "Échanges", "Pts out"],
      [90, 70, 70, 80, 70],
      ["left", "right", "right", "right", "right"],
      active.map((item) => [
        `${item.date.slice(8, 10)}/${item.date.slice(5, 7)}`,
        String(item.deposits),
        String(item.pointsIn),
        String(item.redeems),
        String(item.pointsOut),
      ]),
      "Aucune opération confirmée sur la période."
    )
  }

  table(
    title: string | null,
    headers: string[],
    widths: number[],
    aligns: Array<"left" | "right">,
    rows: string[][],
    empty: string | null
  ) {
    if (title) {
      this.heading(title)
    }
    if (rows.length === 0 && empty) {
      this.ensure(18)
      this.text(empty, MARGIN, this.y, 10, this.font, MUTED)
      this.y -= 22
      return
    }

    const rowH = 18
    this.ensure(rowH + 4)
    this.drawRow(headers, widths, aligns, this.y, true)
    this.y -= rowH

    rows.forEach((row, index) => {
      this.ensure(rowH)
      if (index % 2 === 0) {
        this.page.drawRectangle({
          x: MARGIN,
          y: this.y - 12,
          width: WIDTH,
          height: rowH,
          color: ROW,
        })
      }
      this.drawRow(row, widths, aligns, this.y, false)
      this.y -= rowH
    })
    this.y -= 14
  }

  note(value: string) {
    this.ensure(28)
    this.rule()
    const lines = wrap(value, this.font, 8, WIDTH)
    for (const line of lines) {
      this.ensure(12)
      this.text(line, MARGIN, this.y, 8, this.font, MUTED)
      this.y -= 11
    }
  }

  stampFooters(input: ShopActivityReportInput) {
    const pages = this.pdf.getPages()
    pages.forEach((page, index) => {
      const label = `DEEE Kinshasa  ·  ${input.shopName}  ·  page ${index + 1}/${pages.length}`
      page.drawText(winAnsi(label), {
        x: MARGIN,
        y: 22,
        size: 8,
        font: this.font,
        color: MUTED,
      })
    })
  }

  private heading(title: string) {
    this.ensure(28)
    this.text(title, MARGIN, this.y, 11, this.bold, EMERALD)
    this.y -= 16
  }

  private rule() {
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE.width - MARGIN, y: this.y },
      thickness: 0.6,
      color: LINE,
    })
    this.y -= 14
  }

  private drawRow(
    cells: string[],
    widths: number[],
    aligns: Array<"left" | "right">,
    y: number,
    header: boolean
  ) {
    if (header) {
      this.page.drawRectangle({
        x: MARGIN,
        y: y - 12,
        width: WIDTH,
        height: 18,
        color: BAND,
      })
    }
    let x = MARGIN + 6
    cells.forEach((cell, index) => {
      const width = widths[index] ?? 80
      const size = header ? 8 : 9
      const face = header ? this.bold : this.font
      const label = ellipsis(cell, face, size, width - 8)
      const textW = face.widthOfTextAtSize(winAnsi(label), size)
      const tx = aligns[index] === "right" ? x + width - 8 - textW : x
      this.text(label, tx, y, size, face, header ? EMERALD : INK)
      x += width
    })
  }

  private text(
    value: string,
    x: number,
    y: number,
    size: number,
    font: PDFFont,
    color: RGB
  ) {
    this.page.drawText(winAnsi(value), { x, y, size, font, color })
  }

  private ensure(needed: number) {
    if (this.y - needed > FOOTER + 16) {
      return
    }
    this.page = this.pdf.addPage([PAGE.width, PAGE.height])
    this.y = PAGE.height - MARGIN
  }
}

function wrap(value: string, font: PDFFont, size: number, max: number): string[] {
  const words = winAnsi(value).split(/\s+/)
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(next, size) <= max) {
      current = next
    } else {
      if (current) {
        lines.push(current)
      }
      current = word
    }
  }
  if (current) {
    lines.push(current)
  }
  return lines
}

function ellipsis(
  value: string,
  font: PDFFont,
  size: number,
  max: number
): string {
  const text = winAnsi(value)
  if (font.widthOfTextAtSize(text, size) <= max) {
    return text
  }
  let cut = text
  while (cut.length > 1 && font.widthOfTextAtSize(`${cut}...`, size) > max) {
    cut = cut.slice(0, -1)
  }
  return `${cut}...`
}

function winAnsi(value: string): string {
  return [...value]
    .map((char) => {
      const code = char.charCodeAt(0)
      if (code <= 255 && code !== 0x8d && code !== 0x9d) {
        return char
      }
      return (
        {
          "\u2018": "'",
          "\u2019": "'",
          "\u201C": '"',
          "\u201D": '"',
          "\u2013": "-",
          "\u2014": "-",
          "\u2026": "...",
          "\u0153": "oe",
          "\u0152": "OE",
          "\u20ac": "EUR",
        }[char] ?? "?"
      )
    })
    .join("")
}
