'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Casa {
    id: string;
    title: string;
    address: string;
    city: string;
    latitude: string;
    longitude: string;
}

interface LeafletMapProps {
    casas: Casa[];
    center: [number, number];
    zoom: number;
}

export default function LeafletMap({ casas, center, zoom }: LeafletMapProps) {
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('background-map').setView(center, zoom);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            }).addTo(mapRef.current);
        } else {
            mapRef.current.setView(center, zoom);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [center, zoom]);

    useEffect(() => {
        if (mapRef.current) {
            console.log(`Processing ${casas.length} casas for map markers`);

            // Clear existing markers
            mapRef.current.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    mapRef.current!.removeLayer(layer);
                }
            });

            // Add new markers
            casas.forEach(casa => {
                if (casa.latitude && casa.longitude) {
                    const lat = parseFloat(casa.latitude);
                    const lng = parseFloat(casa.longitude);
                    console.log('Adding marker for casa:', casa.title, 'at', lat, lng);

                    const blackIcon = new L.Icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });

                    L.marker([lat, lng], { icon: blackIcon })
                        .addTo(mapRef.current!)
                        .bindPopup(`<b>${casa.title}</b><br>${casa.address}, ${casa.city}`);
                } else {
                    console.warn('Casa missing latitude or longitude:', casa);
                }
            });
        }
    }, [casas]);

    return <div id="background-map" className="absolute inset-0 z-0" />;
}
