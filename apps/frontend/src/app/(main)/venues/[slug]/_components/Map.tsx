"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

export function Map({ latitude, longitude }: { longitude: number; latitude: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/dapy0/cmtl6mkf200lo01sa5udw8nzl",
      center: [longitude, latitude],
      zoom: 15,
      bearing: -12.8,
      attributionControl: false,
      logoPosition: "bottom-right",
    });

    // Brand gold from DESIGN.md (--primary); mapbox needs a literal color.
    new mapboxgl.Marker({ color: "oklch(0.81 0.13 82)" })
      .setLngLat([longitude, latitude])
      .addTo(mapRef.current);

    // Mapbox requires visible attribution; the compact control keeps it small.
    mapRef.current.addControl(new mapboxgl.AttributionControl({ compact: true }));

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
