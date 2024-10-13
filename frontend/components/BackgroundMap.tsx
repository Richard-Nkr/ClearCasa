'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import debounce from 'lodash/debounce';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import Leaflet with no SSR
const LeafletMap = dynamic(() => import('./LeafletMap'), {
    ssr: false,
});

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

interface CityAutocomplete {
    display_name: string;
    lat: string;
    lon: string;
}

interface BackgroundMapProps {
    initialCasas: Casa[];
}

export default function BackgroundMap({ initialCasas }: BackgroundMapProps) {
    const [casas, setCasas] = useState<Casa[]>(initialCasas);
    const [filteredCasas, setFilteredCasas] = useState<Casa[]>(initialCasas);
    const [city, setCity] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
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
            console.log('Fetching all casas in BackgroundMap');
            const response = await fetch('/api/casa/all', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            if (response.ok) {
                const data: Casa[] = await response.json();
                console.log(`Fetched ${data.length} casas in BackgroundMap:`, JSON.stringify(data, null, 2));
                setCasas(data);
                setFilteredCasas(filterCasasByDate(data, startDate));
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch all casas:', response.status, response.statusText, errorText);
            }
        } catch (error) {
            console.error('Error fetching all casas:', error);
        }
    }, [startDate]);

    useEffect(() => {
        fetchCasas();
    }, [fetchCasas]);

    useEffect(() => {
        const handleNewCasa = (event: CustomEvent<Casa>) => {
            setCasas(prevCasas => {
                const newCasas = [...prevCasas, event.detail];
                setFilteredCasas(filterCasasByDate(newCasas, startDate));
                return newCasas;
            });
        };
        window.addEventListener('newCasaCreated', handleNewCasa as EventListener);
        return () => {
            window.removeEventListener('newCasaCreated', handleNewCasa as EventListener);
        };
    }, [startDate]);

    useEffect(() => {
        setFilteredCasas(filterCasasByDate(casas, startDate));
    }, [casas, startDate]);

    useEffect(() => {
        console.log('Filtered casas:', filteredCasas);
    }, [filteredCasas]);

    const filterCasasByDate = (casasToFilter: Casa[], date: Date | undefined) => {
        if (!date) return casasToFilter;
        return casasToFilter.filter(casa => {
            const casaDate = new Date(casa.startDate);
            return casaDate >= date;
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
            <LeafletMap 
                casas={filteredCasas} 
                center={mapCenter} 
                zoom={mapZoom} 
                renderTooltip={(casa) => (
                    <Card className="w-48 max-w-xs border-none shadow-lg text-xs">
                        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg p-2">
                            <CardTitle className="text-sm font-semibold">{casa.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 space-y-1">
                            <p className="italic line-clamp-2">{casa.description}</p>
                            <p><strong>📍</strong> {casa.city}</p>
                            <p><strong>🗓️</strong> {format(new Date(casa.startDate), 'PP')} - {format(new Date(casa.endDate), 'PP')}</p>
                            <p><strong>👤</strong> {casa.owner.name}</p>
                        </CardContent>
                    </Card>
                )}
            />
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-md max-w-sm w-full"
            >
                <div className="flex flex-col space-y-4">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Enter a city"
                            value={city}
                            onChange={handleCityChange}
                            className="pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    <AnimatePresence>
                        {autocompleteResults.length > 0 && (
                            <motion.ul 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white border border-gray-200 rounded-md shadow-sm"
                            >
                                {autocompleteResults.map((result, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                                        onClick={() => {
                                            setCity(result.display_name);
                                            handleCitySubmit(result.display_name);
                                        }}
                                    >
                                        {result.display_name}
                                    </motion.li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {startDate && (
                        <Button
                            variant="ghost"
                            onClick={() => setStartDate(undefined)}
                            className="w-full"
                        >
                            Clear Date
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
