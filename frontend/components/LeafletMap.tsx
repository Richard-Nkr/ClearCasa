'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createRoot } from 'react-dom/client';

interface Casa {
    id: string;
    title: string;
    description: string;
    address: string;
    city: string;
    startDate: string;
    endDate: string;
    latitude: string;
    longitude: string;
    owner: {
        name: string;
        email: string;
    };
}

interface LeafletMapProps {
    casas: Casa[];
    center: [number, number];
    zoom: number;
    renderTooltip: (casa: Casa) => React.ReactNode;
}

export default function LeafletMap({ casas, center, zoom, renderTooltip }: LeafletMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('map', {
                center: center,
                zoom: zoom,
                zoomControl: false,
                attributionControl: false
            });

            // Custom white map style
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(mapRef.current);

            // Apply custom CSS to make the map white
            const mapContainer = mapRef.current.getContainer();
            mapContainer.style.filter = 'grayscale(100%) brightness(105%)';
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
        if (!mapRef.current) return;

        // Remove existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Custom icon SVG
        const svgIcon = L.divIcon({
            html: `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C7.58 0 4 3.58 4 8C4 13.54 12 24 12 24C12 24 20 13.54 20 8C20 3.58 16.42 0 12 0ZM12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11Z" fill="#4A5568"/>
                </svg>
            `,
            className: 'svg-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 24],
        });

        // Add new markers
        casas.forEach(casa => {
            const lat = parseFloat(casa.latitude);
            const lng = parseFloat(casa.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                const marker = L.marker([lat, lng], { icon: svgIcon }).addTo(mapRef.current!);
                
                // Create a container for the React component
                const container = L.DomUtil.create('div');
                const root = createRoot(container);
                root.render(renderTooltip(casa));

                // Bind the container to the marker with custom options
                marker.bindPopup(container, {
                    maxWidth: 200,
                    minWidth: 200,
                    className: 'custom-popup'
                });
                
                markersRef.current.push(marker);
            }
        });
    }, [casas, renderTooltip]);

    return <div id="map" style={{ height: '100%', width: '100%' }} />;
}
