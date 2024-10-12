'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export default function CasaForm() {
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
            latitude: suggestion.lat,
            longitude: suggestion.lon,
        }));
        setAddressSuggestions([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.email) {
            console.error('User not authenticated');
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
                    userEmail: session.user.email,
                }),
            });

            if (response.ok) {
                console.log('Casa created successfully');
                setOpen(false);
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
            } else {
                console.error('Failed to create Casa');
            }
        } catch (error) {
            console.error('Error creating Casa:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Plus size={20} className="mr-2" />
                    <span>Add New Casa</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
                    <Button type="submit">Create Casa</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
