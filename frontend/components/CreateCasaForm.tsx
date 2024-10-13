'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCasaForm() {
    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/casa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, address, city, latitude, longitude }),
        });

        if (response.ok) {
            const newCasa = await response.json();
            // Dispatch the custom event with the new casa data
            window.dispatchEvent(new CustomEvent('newCasaCreated', { detail: newCasa }));
            router.push('/home'); // or wherever you want to redirect after creation
        } else {
            // Handle error
            console.error('Failed to create casa');
        }
    };

    // ... rest of the component (form inputs, etc.)
}
