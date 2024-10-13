import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/casa/all`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch casas: ${response.status} ${response.statusText}. Error: ${errorText}`);
            return NextResponse.json({ error: 'Failed to fetch casas' }, { status: response.status });
        }

        const casas = await response.json();
        console.log(`Fetched ${casas.length} casas in API route:`, JSON.stringify(casas, null, 2));
        return NextResponse.json(casas);
    } catch (error) {
        console.error('Error fetching casas:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
