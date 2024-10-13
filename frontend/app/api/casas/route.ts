import { NextResponse } from 'next/server';

// This is a mock data array. Replace this with actual data fetching logic.
const casas = [
    { id: '1', name: 'Casa Paris', latitude: 48.8566, longitude: 2.3522 },
    { id: '2', name: 'Casa London', latitude: 51.5074, longitude: -0.1278 },
    { id: '3', name: 'Casa Berlin', latitude: 52.5200, longitude: 13.4050 },
    // Add more casa data as needed
];

export async function GET() {
    try {
        // In a real application, you would fetch this data from a database
        // For now, we're just returning the mock data
        return NextResponse.json(casas);
    } catch (error) {
        console.error('Error fetching casas:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
