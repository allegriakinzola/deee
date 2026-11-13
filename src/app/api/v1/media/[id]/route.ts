import { prisma } from "@/platform/db"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const file = await prisma.storedFile.findUnique({
    where: { id },
    select: { mime: true, bytes: true },
  })
  if (!file) {
    return new Response("Fichier introuvable", { status: 404 })
  }

  return new Response(Uint8Array.from(file.bytes), {
    headers: {
      "Content-Type": file.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
