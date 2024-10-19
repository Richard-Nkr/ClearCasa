'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface AddressSuggestion {
    display_name: string;
    lat: string;
    lon: string;
    address: {
        house_number?: string;
        road?: string;
        postcode?: string;
        city?: string;
        town?: string;
        village?: string;
        state?: string;
    };
}

interface Category {
    name: string;
    emoji: string;
}

export default function CasaForm({ onCasaCreated }: { onCasaCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        city: '',
        startDate: '',
        endDate: '',
        latitude: '',
        longitude: '',
    });
    const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
    const [categories, setCategories] = useState<Category[]>([
        { name: "Books", emoji: "📚" },
        { name: "Furniture", emoji: "🪑" },
        { name: "Garden", emoji: "🌻" },
        { name: "Art", emoji: "🎨" },
        { name: "Electronics", emoji: "🖥️" },
        { name: "Clothes", emoji: "👚" },
        { name: "Toys", emoji: "🧸" },
        { name: "Sports", emoji: "⚽" },
        { name: "Music", emoji: "🎵" },
        { name: "Kitchen", emoji: "🍳" },
        { name: "Pets", emoji: "🐾" },
        { name: "Tools", emoji: "🔧" }
    ]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'address') {
            fetchAddressSuggestions(value);
        }
    };

    const fetchAddressSuggestions = async (query: string) => {
        if (query.length < 3) {
            setAddressSuggestions([]);
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=fr&limit=5&addressdetails=1`);
            const data = await response.json();
            setAddressSuggestions(data);
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
        }
    };

    const handleSuggestionClick = (suggestion: AddressSuggestion) => {
        const streetAddress = `${suggestion.address.house_number || ''} ${suggestion.address.road || ''}`.trim();
        setFormData(prev => ({
            ...prev,
            address: streetAddress,
            city: suggestion.address.city || suggestion.address.town || suggestion.address.village || suggestion.address.state || '',
            latitude: parseFloat(suggestion.lat),  // Parse to float
            longitude: parseFloat(suggestion.lon), // Parse to float
        }));
        setAddressSuggestions([]);
    };

    const handleCategoryToggle = (categoryName: string) => {
        setSelectedCategories(prev => 
            prev.includes(categoryName)
                ? prev.filter(name => name !== categoryName)
                : [...prev, categoryName]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.email) {
            console.error('User not authenticated');
            return;
        }

        // Check if all required fields are filled
        const requiredFields = ['title', 'description', 'address', 'city', 'startDate', 'endDate', 'latitude', 'longitude'];
        const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            // You can show an error message to the user here
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/casa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    userEmail: session.user.email,
                    categories: selectedCategories,
                }),
            });

            if (response.ok) {
                const newCasa = await response.json();
                console.log('New Casa created:', newCasa);
                // Reset form after submission
                setFormData({
                    title: '',
                    description: '',
                    address: '',
                    city: '',
                    startDate: '',
                    endDate: '',
                    latitude: '',
                    longitude: '',
                });
                setSelectedCategories([]);
                onCasaCreated(); // Trigger refresh of casas
            } else {
                const errorData = await response.json();
                console.error('Failed to create Casa:', errorData);
                // You can show an error message to the user here
            }
        } catch (error) {
            console.error('Error creating Casa:', error);
            // You can show an error message to the user here
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" className="w-full">
                    <Plus size={20} className="mr-2" />
                    <span>Add New Casa</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] z-[1002]">
                <DialogHeader>
                    <DialogTitle>Add New Casa</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                    <Textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                    <div className="relative">
                        <Input
                            name="address"
                            placeholder="Address (France only)"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                        {addressSuggestions.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg">
                                {addressSuggestions.map((suggestion, index) => {
                                    const streetAddress = `${suggestion.address.house_number || ''} ${suggestion.address.road || ''}`.trim();
                                    return (
                                        <li
                                            key={index}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            {streetAddress}, {suggestion.address.postcode} {suggestion.address.city || suggestion.address.town || suggestion.address.village}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                    <Input
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        name="startDate"
                        type="date"
                        placeholder="Start Date"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        name="endDate"
                        type="date"
                        placeholder="End Date"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                    />
                    
                    <div className="space-y-2">
                        <Label>Categories</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {categories.map(category => (
                                <Button
                                    key={category.name}
                                    type="button"
                                    size="sm"
                                    variant={selectedCategories.includes(category.name) ? "default" : "outline"}
                                    onClick={() => handleCategoryToggle(category.name)}
                                    className="flex items-center justify-start space-x-1 h-9 px-2"
                                >
                                    <span>{category.emoji}</span>
                                    <span className="truncate">{category.name}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Button type="submit">Create Casa</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
