"use client"

import { useEffect } from "react"
import { HouseIcon } from "lucide-react"
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  useMap,
} from "@vis.gl/react-google-maps"

import {
  KINSHASA_CENTER,
  partnerName,
  type Shop,
} from "@/lib/shops"
import { cn } from "@/lib/utils"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""

export function ShopsMap({
  shops,
  selectedId,
  onSelect,
}: {
  shops: Shop[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const selected = shops.find((shop) => shop.id === selectedId) ?? null

  if (!API_KEY) {
    return <KinshasaEmbed shops={shops} selected={selected} />
  }

  return (
    <APIProvider
      apiKey={API_KEY}
      language="fr"
      region="CD"
      libraries={["marker"]}
    >
      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={KINSHASA_CENTER}
        defaultZoom={12}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl
        style={{ width: "100%", height: "100%" }}
      >
        <MapFocus shops={shops} selected={selected} />
        {shops.map((shop) => (
          <AdvancedMarker
            key={shop.id}
            position={{ lat: shop.lat, lng: shop.lng }}
            title={shop.name}
            onClick={() => onSelect(shop.id)}
          >
            <HousePin active={shop.id === selectedId} />
          </AdvancedMarker>
        ))}
        {selected ? (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            pixelOffset={[0, -36]}
            onCloseClick={() => onSelect(null)}
          >
            <div className="px-1 py-0.5">
              <p className="text-sm font-semibold text-zinc-900">
                {selected.name}
              </p>
              <p className="text-xs text-zinc-500">
                {partnerName(selected.partnerId)} · {selected.area}
              </p>
            </div>
          </InfoWindow>
        ) : null}
      </Map>
    </APIProvider>
  )
}

function HousePin({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-full ring-2 ring-white",
        active
          ? "bg-emerald-800 text-white"
          : "bg-primary text-primary-foreground"
      )}
    >
      <HouseIcon className="size-4" strokeWidth={2.2} />
    </div>
  )
}

function MapFocus({
  shops,
  selected,
}: {
  shops: Shop[]
  selected: Shop | null
}) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    if (selected) {
      map.panTo({ lat: selected.lat, lng: selected.lng })
      map.setZoom(14)
      return
    }

    if (shops.length === 0) return

    const bounds = new google.maps.LatLngBounds()
    for (const shop of shops) {
      bounds.extend({ lat: shop.lat, lng: shop.lng })
    }
    map.fitBounds(bounds, 56)
  }, [map, shops, selected])

  return null
}

function KinshasaEmbed({
  shops,
  selected,
}: {
  shops: Shop[]
  selected: Shop | null
}) {
  const query = selected
    ? `${selected.lat},${selected.lng}`
    : shops.length === 1
      ? `${shops[0].lat},${shops[0].lng}`
      : `${KINSHASA_CENTER.lat},${KINSHASA_CENTER.lng}`

  return (
    <iframe
      title="Carte des points de collecte à Kinshasa"
      src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${selected || shops.length === 1 ? 15 : 12}&hl=fr&output=embed`}
      className="h-full w-full border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}
