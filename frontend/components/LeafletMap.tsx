'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface LeafletMapProps {
  className?: string
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
}

interface Casa {
  id: string
  title: string
  description: string
  address: string
  city: string
  latitude: number
  longitude: number
  startDate: string
  endDate: string
  categories: string[]
  owner: {
    name: string | null
    email: string
  }
}

// Custom hook for fetching casas
const useCasas = () => {
  const [casas, setCasas] = useState<Casa[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchCasas = useCallback(async () => {
    setIsLoading(true)
    try {
      console.log('Fetching casas...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/casa/all`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      if (response.ok) {
        const text = await response.text();
        console.log('Raw response:', text);
        try {
          const data = JSON.parse(text);
          console.log('Parsed casas:', data);
          setCasas(data)
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          console.error('Invalid JSON:', text);
          setCasas([])
        }
      } else {
        console.error('Failed to fetch casas')
        setCasas([])
      }
    } catch (error) {
      console.error('Error fetching casas:', error)
      setCasas([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCasas()
  }, [fetchCasas])

  return { casas, refetchCasas: fetchCasas, isLoading }
}

// Add this helper function at the top of your file, outside the component
function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const startFormatted = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  const endFormatted = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  
  return `${startFormatted} - ${endFormatted}, ${diffDays} days`;
}

export function LeafletMap({ className = '' }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState<SearchResult[]>([])
  const [selectedCasa, setSelectedCasa] = useState<Casa | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [hoveredCasa, setHoveredCasa] = useState<Casa | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { casas, refetchCasas, isLoading } = useCasas()

  // Updated categories array with distinct colors
  const categories = [
    { name: "Books", emoji: "📚", color: "bg-blue-500" },
    { name: "Furniture", emoji: "🪑", color: "bg-green-500" },
    { name: "Garden", emoji: "🌻", color: "bg-yellow-500" },
    { name: "Art", emoji: "🎨", color: "bg-purple-500" },
    { name: "Electronics", emoji: "🖥️", color: "bg-gray-500" },
    { name: "Clothes", emoji: "👚", color: "bg-pink-500" },
    { name: "Toys", emoji: "🧸", color: "bg-red-500" },
    { name: "Sports", emoji: "⚽", color: "bg-orange-500" },
    { name: "Music", emoji: "🎵", color: "bg-indigo-500" },
    { name: "Kitchen", emoji: "🍳", color: "bg-yellow-600" },
    { name: "Pets", emoji: "🐾", color: "bg-green-600" },
    { name: "Tools", emoji: "🔧", color: "bg-blue-600" }
  ];

  const filteredCasas = casas.filter(casa => 
    selectedCategories.length === 0 || 
    casa.categories.some(category => selectedCategories.includes(category))
  )

  const addCasasToMap = useCallback((casasData: Casa[]) => {
    console.log('Adding casas to map:', casasData);
    if (!mapRef.current || !markersLayerRef.current) {
      console.error('Map or markers layer not initialized');
      return;
    }

    markersLayerRef.current.clearLayers();

    const blackIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    casasData.forEach(casa => {
      console.log(`Adding marker for casa: ${casa.title} at ${casa.latitude}, ${casa.longitude}`);
      try {
        const marker = L.marker([casa.latitude, casa.longitude], { icon: blackIcon })
          .addTo(markersLayerRef.current!)
        
        const markerElement = marker.getElement();
        
        markerElement.addEventListener('mouseenter', (e) => {
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
          setHoveredCasa(casa);
          const point = mapRef.current!.latLngToContainerPoint(marker.getLatLng());
          setHoverPosition({ x: point.x, y: point.y });
        });

        markerElement.addEventListener('mouseleave', () => {
          hoverTimeoutRef.current = setTimeout(() => {
            setHoveredCasa(null);
          }, 100); // Small delay to prevent flickering
        });

        marker.on('click', () => {
          setSelectedCasa(casa);
        });

        console.log(`Marker added for casa: ${casa.title}`);
      } catch (error) {
        console.error(`Error adding marker for casa ${casa.title}:`, error);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [46.603354, 1.888334], // Center of France
        zoom: 6,
        zoomControl: false,
        scrollWheelZoom: true,
        maxBounds: L.latLngBounds(
          L.latLng(41.333, -5.225),
          L.latLng(51.2, 9.55)
        ),
        minZoom: 5,
        maxZoom: 18
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current)

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)
      L.control.scale({ position: 'bottomleft', imperial: false }).addTo(mapRef.current)

      markersLayerRef.current = L.layerGroup().addTo(mapRef.current)

      // Add a subtle outline of France
      fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/france-metropolitan.geojson')
        .then(response => response.json())
        .then(data => {
          L.geoJSON(data, {
            style: {
              color: '#3b82f6',
              weight: 2,
              fillColor: '#3b82f6',
              fillOpacity: 0.1
            }
          }).addTo(mapRef.current!)
        })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mapRef.current && markersLayerRef.current) {
      addCasasToMap(filteredCasas)
    }
  }, [filteredCasas, addCasasToMap])

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length < 3) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=fr&limit=5`);
      const data = await response.json();
      const uniqueCities = data.reduce((acc: SearchResult[], curr: SearchResult) => {
        const cityName = curr.display_name.split(',')[0].trim();
        if (!acc.some(item => item.display_name.split(',')[0].trim() === cityName)) {
          acc.push({ ...curr, display_name: cityName });
        }
        return acc;
      }, []);
      setSearchSuggestions(uniqueCities);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
    }
  };

  const handleSelectCity = (result: SearchResult) => {
    const { lat, lon, display_name } = result;
    mapRef.current?.setView([parseFloat(lat), parseFloat(lon)], 12);
    setSearchTerm(display_name);
    setSearchSuggestions([]);
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName]
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-4 left-4 z-[1000] bg-white p-2 rounded-md shadow-md">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search for a city in France"
          className="p-2 border rounded-md w-64 mb-2"
        />
        {searchSuggestions.length > 0 && (
          <ul className="mt-2 bg-white border rounded-md max-h-40 overflow-y-auto">
            {searchSuggestions.map((result, index) => (
              <li
                key={index}
                onClick={() => handleSelectCity(result)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2">
          <h3 className="font-semibold mb-1">Filter by Category:</h3>
          <div className="grid grid-cols-2 gap-2"> {/* Changed from grid-cols-3 to grid-cols-2 */}
            {categories.map(category => (
              <Button
                key={category.name}
                variant={selectedCategories.includes(category.name) ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryToggle(category.name)}
                className="flex items-center justify-start space-x-1 h-9 px-2"
              >
                <span>{category.emoji}</span>
                <span className="truncate">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div ref={mapContainerRef} className="h-full shadow-lg rounded-lg overflow-hidden" />
      {hoveredCasa && (
        <div 
          className="absolute z-[1000] w-64 bg-black text-white rounded-lg overflow-hidden shadow-lg"
          style={{
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}
        >
          <div className="p-4">
            <h3 className="text-xl font-bold mb-1">{hoveredCasa.title}</h3>
            <p className="text-sm mb-2">{hoveredCasa.description}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {hoveredCasa.categories.map((category, index) => {
                const categoryInfo = categories.find(c => c.name === category);
                return (
                  <span 
                    key={index} 
                    className={`px-2 py-1 text-xs rounded-full ${categoryInfo?.color || 'bg-gray-700'} text-white`}
                  >
                    {categoryInfo?.emoji} {category}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="bg-gray-800 p-4 text-sm">
            <div className="flex items-center mb-2">
              <span className="mr-2">🗓️</span>
              <span>{formatDateRange(hoveredCasa.startDate, hoveredCasa.endDate)}</span>
            </div>
            <div className="flex items-center mb-2">
              <span className="mr-2">📍</span>
              <span>{hoveredCasa.city}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">👤</span>
              <span>{hoveredCasa.owner.name || hoveredCasa.owner.email}</span>
            </div>
          </div>
          <div className="bg-gray-700 p-4 flex justify-between items-center">
            <span className="text-green-400 font-semibold">Active</span>
            <button 
              className="px-3 py-1 bg-white text-black rounded-md text-sm font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCasa(hoveredCasa);
              }}
            >
              View Details
            </button>
          </div>
        </div>
      )}
      <Dialog open={!!selectedCasa} onOpenChange={() => setSelectedCasa(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCasa?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-lg mb-4">{selectedCasa?.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Address</h4>
                <p>{selectedCasa?.address}</p>
                <p>{selectedCasa?.city}</p>
              </div>
              <div>
                <h4 className="font-semibold">Dates</h4>
                <p>{new Date(selectedCasa?.startDate ?? '').toLocaleDateString()} - {new Date(selectedCasa?.endDate ?? '').toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="font-semibold">Owner</h4>
                <p>{selectedCasa?.owner.name || selectedCasa?.owner.email}</p>
              </div>
              <div>
                <h4 className="font-semibold">Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedCasa?.categories.map((category, index) => {
                    const categoryInfo = categories.find(c => c.name === category);
                    return (
                      <span 
                        key={index} 
                        className={`px-2 py-1 text-xs rounded-full ${categoryInfo?.color || 'bg-gray-700'} text-white`}
                      >
                        {categoryInfo?.emoji} {category}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <button 
        onClick={refetchCasas} 
        className="absolute bottom-4 right-4 z-[1000] bg-blue-500 text-white p-2 rounded-md shadow-md hover:bg-blue-600 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? 'Refreshing...' : 'Refresh Casas'}
      </button>
    </div>
  )
}
