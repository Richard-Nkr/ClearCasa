import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        console.log('Fetching casas from:', `${apiUrl}/api/casa`);
        const response = await fetch(`${apiUrl}/api/casa`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch casas: ${response.status} ${response.statusText}. Error: ${errorText}`);
        }

        const casas = await response.json();
        console.log(`Fetched ${casas.length} casas in frontend API route:`, JSON.stringify(casas, null, 2));
        return NextResponse.json(casas);
    } catch (error) {
        console.error('Error fetching casas:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
