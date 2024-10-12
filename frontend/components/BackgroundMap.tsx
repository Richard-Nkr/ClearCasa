'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import debounce from 'lodash/debounce';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Casa {
    id: string;
    title: string;
    address: string;
    city: string;
    latitude: string;
    longitude: string;
}

interface CityAutocomplete {
    display_name: string;
    lat: string;
    lon: string;
}

export default function BackgroundMap() {
    const mapRef = useRef<L.Map | null>(null);
    const [casas, setCasas] = useState<Casa[]>([]);
    const [city, setCity] = useState('');
    const [autocompleteResults, setAutocompleteResults] = useState<CityAutocomplete[]>([]);

    useEffect(() => {
        const lastSearchedCity = localStorage.getItem('lastSearchedCity');
        if (lastSearchedCity) {
            setCity(lastSearchedCity);
            handleCitySubmit(lastSearchedCity);
        }
    }, []);

    useEffect(() => {
        const fetchCasas = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/casa`);
                if (response.ok) {
                    const data = await response.json();
                    setCasas(data);
                } else {
                    console.error('Failed to fetch casas');
                }
            } catch (error) {
                console.error('Error fetching casas:', error);
            }
        };

        fetchCasas();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!mapRef.current) {
                mapRef.current = L.map('background-map', {
                    center: [46.2276, 2.2137], // Center of France
                    zoom: 6,
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

            updateMarkers();
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [casas]);

    const updateMarkers = () => {
        if (!mapRef.current) return;

        // Clear existing markers
        mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                mapRef.current!.removeLayer(layer);
            }
        });

        // Add markers for each casa
        casas.forEach(casa => {
            if (casa.latitude && casa.longitude) {
                const lat = parseFloat(casa.latitude);
                const lng = parseFloat(casa.longitude);

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
            }
        });
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCity(e.target.value);
        debouncedFetchAutocomplete(e.target.value);
    };

    const fetchAutocomplete = async (query: string) => {
        if (query.length < 3) {
            setAutocompleteResults([]);
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)},France&limit=5`);
            const data = await response.json();
            setAutocompleteResults(data);
        } catch (error) {
            console.error('Error fetching autocomplete results:', error);
        }
    };

    const debouncedFetchAutocomplete = useCallback(
        debounce(fetchAutocomplete, 300),
        []
    );

    const handleCitySubmit = async (selectedCity: string = city) => {
        if (!selectedCity) return;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(selectedCity)},France&limit=1`);
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon } = data[0];
                mapRef.current?.setView([parseFloat(lat), parseFloat(lon)], 12);
                localStorage.setItem('lastSearchedCity', selectedCity);
                setAutocompleteResults([]);
            } else {
                console.log("City not found. Please try a different city name.");
            }
        } catch (error) {
            console.error('Error geocoding city:', error);
            console.log("An error occurred while searching for the city.");
        }
    };

    return (
        <div className="relative w-full h-full">
            <div id="background-map" className="absolute inset-0 z-0" />
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white p-2 rounded shadow-md">
                <form onSubmit={(e) => { e.preventDefault(); handleCitySubmit(); }} className="flex items-center">
                    <div className="relative">
                        <Input
                            type="text"
                            value={city}
                            onChange={handleCityChange}
                            placeholder="Enter city"
                            className="pr-10 w-64" // Increased width for better visibility
                        />
                        {autocompleteResults.length > 0 && (
                            <ul className="absolute z-20 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                                {autocompleteResults.map((result, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setCity(result.display_name.split(',')[0]);
                                            handleCitySubmit(result.display_name.split(',')[0]);
                                        }}
                                    >
                                        {result.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <Button type="submit" className="ml-2">
                        Center Map
                    </Button>
                </form>
            </div>
        </div>
    );
}
