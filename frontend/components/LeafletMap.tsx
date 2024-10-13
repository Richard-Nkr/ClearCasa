'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createRoot } from 'react-dom/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, UserIcon } from "lucide-react";
import { format } from "date-fns";

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
}

export default function LeafletMap({ casas, center, zoom }: LeafletMapProps) {
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

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(mapRef.current);

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

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

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

        casas.forEach(casa => {
            const lat = parseFloat(casa.latitude);
            const lng = parseFloat(casa.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                const marker = L.marker([lat, lng], { icon: svgIcon }).addTo(mapRef.current!);
                
                const container = L.DomUtil.create('div');
                const root = createRoot(container);
                root.render(
                    <Card className="w-64 p-0 shadow-lg">
                        <CardHeader className="bg-black text-white p-3">
                            <CardTitle className="text-lg font-semibold">{casa.title}</CardTitle>
                            <p className="text-sm">{casa.description}</p>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2">
                            <div className="flex items-center text-sm">
                                <MapPinIcon className="w-4 h-4 mr-2" />
                                <span>{casa.city}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                <span>{format(new Date(casa.startDate), 'MMM d, yyyy')} - {format(new Date(casa.endDate), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <UserIcon className="w-4 h-4 mr-2" />
                                <span>{casa.owner.name}</span>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                                <Badge variant="secondary" className="bg-gray-200 text-gray-800">
                                    {new Date(casa.startDate) > new Date() ? 'Active' : 'Active'}
                                </Badge>
                                <Button variant="outline" size="sm">
                                    View Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );

                marker.bindPopup(container, {
                    maxWidth: 300,
                    minWidth: 300,
                    className: 'custom-popup'
                });
                
                markersRef.current.push(marker);
            }
        });
    }, [casas]);

    return (
        <>
            <div id="map" style={{ height: '100%', width: '100%' }} />
            <style jsx global>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    padding: 0;
                    overflow: hidden;
                    border-radius: 0.5rem;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0;
                    width: 100% !important;
                }
                .custom-popup .leaflet-popup-tip-container {
                    display: none;
                }
            `}</style>
        </>
    );
}
