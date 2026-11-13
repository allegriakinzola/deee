"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { HouseIcon } from "lucide-react"
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  useMap,
} from "@vis.gl/react-google-maps"

import { KINSHASA_CENTER, type PublicShop } from "@/lib/public-directory"
import { cn } from "@/lib/utils"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""

export function ShopsMap({
  shops,
  selectedId,
  onSelect,
}: {
  shops: PublicShop[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const selected = shops.find((shop) => shop.id === selectedId) ?? null

  if (!API_KEY) {
    return (
      <ShopPinMap
        shops={shops}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    )
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
                {selected.partnerName} · {selected.area}
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
  shops: PublicShop[]
  selected: PublicShop | null
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

function project(lat: number, lng: number, zoom: number) {
  const scale = 2 ** zoom
  const x = ((lng + 180) / 360) * scale
  const rad = (lat * Math.PI) / 180
  const y =
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * scale
  return { x, y }
}

function ShopPinMap({
  shops,
  selectedId,
  onSelect,
}: {
  shops: PublicShop[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const frame = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(1)
  const zoom = useMemo(() => {
    if (shops.length === 0) return 12
    for (let level = 14; level >= 11; level -= 1) {
      const points = shops.map((shop) => project(shop.lat, shop.lng, level))
      const width =
        Math.max(...points.map((point) => point.x)) -
        Math.min(...points.map((point) => point.x))
      const height =
        Math.max(...points.map((point) => point.y)) -
        Math.min(...points.map((point) => point.y))
      if (width < 1.4 && height < 1.4) return level
    }
    return 11
  }, [shops])

  const layout = useMemo(() => {
    if (shops.length === 0) return null
    const points = shops.map((shop) => ({
      shop,
      ...project(shop.lat, shop.lng, zoom),
    }))
    const minX = Math.floor(Math.min(...points.map((point) => point.x)))
    const maxX = Math.floor(Math.max(...points.map((point) => point.x)))
    const minY = Math.floor(Math.min(...points.map((point) => point.y)))
    const maxY = Math.floor(Math.max(...points.map((point) => point.y)))
    const tiles = []
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        tiles.push({ x, y })
      }
    }
    return {
      points,
      minX,
      minY,
      tiles,
      mapWidth: (maxX - minX + 1) * 256,
      mapHeight: (maxY - minY + 1) * 256,
    }
  }, [shops, zoom])

  useEffect(() => {
    const element = frame.current
    if (!element || !layout) return
    const resize = () => {
      setFit(
        Math.min(
          element.clientWidth / layout.mapWidth,
          element.clientHeight / layout.mapHeight
        )
      )
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [layout])

  if (!layout) {
    return (
      <p className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        Aucun shop sur cette carte.
      </p>
    )
  }

  const { points, minX, minY, tiles, mapWidth, mapHeight } = layout

  return (
    <div ref={frame} className="relative h-full w-full overflow-hidden bg-[#e8eef2]">
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: mapWidth,
          height: mapHeight,
          transform: `translate(-50%, -50%) scale(${fit})`,
        }}
      >
        {tiles.map((tile) => (
          // Tuiles OpenStreetMap : pas de clé Google en production.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${tile.x}-${tile.y}`}
            alt=""
            src={`https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`}
            width={256}
            height={256}
            className="absolute"
            style={{
              left: (tile.x - minX) * 256,
              top: (tile.y - minY) * 256,
            }}
          />
        ))}
        {points.map((point) => (
          <button
            key={point.shop.id}
            type="button"
            title={`${point.shop.name} · ${point.shop.area}`}
            onClick={() => onSelect(point.shop.id)}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{
              left: (point.x - minX) * 256,
              top: (point.y - minY) * 256,
            }}
          >
            <HousePin active={point.shop.id === selectedId} />
          </button>
        ))}
      </div>
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        className="absolute right-2 bottom-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] text-zinc-600"
      >
        © OpenStreetMap
      </a>
    </div>
  )
}
