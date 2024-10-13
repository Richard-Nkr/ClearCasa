'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import debounce from 'lodash/debounce';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Dynamically import Leaflet with no SSR
const LeafletMap = dynamic(() => import('./LeafletMap'), {
    ssr: false,
});

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
    const [casas, setCasas] = useState<Casa[]>([]);
    const [city, setCity] = useState('');
    const [autocompleteResults, setAutocompleteResults] = useState<CityAutocomplete[]>([]);
    const [mapCenter, setMapCenter] = useState<[number, number]>(() => {
        if (typeof window !== 'undefined') {
            const savedCenter = localStorage.getItem('mapCenter');
            return savedCenter ? JSON.parse(savedCenter) : [46.2276, 2.2137];
        }
        return [46.2276, 2.2137];
    });
    const [mapZoom, setMapZoom] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedZoom = localStorage.getItem('mapZoom');
            return savedZoom ? parseInt(savedZoom, 10) : 6;
        }
        return 6;
    });

    const fetchCasas = useCallback(async () => {
        try {
            console.log('Fetching casas in BackgroundMap');
            const response = await fetch('/api/casa', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log(`Fetched ${data.length} casas in BackgroundMap:`, JSON.stringify(data, null, 2));
                setCasas(data);
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch casas:', response.status, response.statusText, errorText);
            }
        } catch (error) {
            console.error('Error fetching casas:', error);
        }
    }, []);

    useEffect(() => {
        fetchCasas();
    }, [fetchCasas]);

    // Add an event listener for custom casa creation event
    useEffect(() => {
        const handleNewCasa = () => {
            fetchCasas();
        };
        window.addEventListener('newCasaCreated', handleNewCasa);
        return () => {
            window.removeEventListener('newCasaCreated', handleNewCasa);
        };
    }, [fetchCasas]);

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

            const uniqueCities = new Set();
            const processedData = data
                .map((item: CityAutocomplete) => ({
                    ...item,
                    display_name: item.display_name.split(',')[0].trim()
                }))
                .filter((item: CityAutocomplete) => {
                    if (!uniqueCities.has(item.display_name)) {
                        uniqueCities.add(item.display_name);
                        return true;
                    }
                    return false;
                });

            setAutocompleteResults(processedData);
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
                const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
                setMapCenter(newCenter);
                setMapZoom(12);
                localStorage.setItem('mapCenter', JSON.stringify(newCenter));
                localStorage.setItem('mapZoom', '12');
                localStorage.setItem('lastSearchedCity', selectedCity);
                setAutocompleteResults([]);
                // Don't fetch casas here, as it's not necessary and may cause issues
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
            <LeafletMap casas={casas} center={mapCenter} zoom={mapZoom} />
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white p-2 rounded shadow-md">
                <form onSubmit={(e) => { e.preventDefault(); handleCitySubmit(); }} className="flex items-center">
                    <div className="relative">
                        <Input
                            type="text"
                            value={city}
                            onChange={handleCityChange}
                            placeholder="Enter city"
                            className="pr-10 w-64"
                        />
                        {autocompleteResults.length > 0 && (
                            <ul className="absolute z-20 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                                {autocompleteResults.map((result, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setCity(result.display_name);
                                            handleCitySubmit(result.display_name);
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
