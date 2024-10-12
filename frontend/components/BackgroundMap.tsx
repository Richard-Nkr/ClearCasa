'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function BackgroundMap() {
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!mapRef.current) {
                mapRef.current = L.map('background-map', {
                    center: [48.8566, 2.3522], // Paris coordinates
                    zoom: 13,
                    zoomControl: true,
                    attributionControl: true,
                    dragging: true,
                    scrollWheelZoom: true,
                });

                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                }).addTo(mapRef.current);
            }
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return <div id="background-map" className="absolute inset-0 z-0" style={{ height: '100%', width: '100%' }} />;
}
