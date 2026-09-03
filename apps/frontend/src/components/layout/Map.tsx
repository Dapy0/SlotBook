'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

export function Map() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/dapy0/cmtl6mkf200lo01sa5udw8nzl',
      center: [21.0175, 52.2367],
      zoom: 15,
      bearing: -12.8,
      attributionControl: false,
      logoPosition: 'bottom-right',
    });

    new mapboxgl.Marker({color: 'oklch(0.555 0.163 48.998)'}).setLngLat([21.0175, 52.2367]).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
