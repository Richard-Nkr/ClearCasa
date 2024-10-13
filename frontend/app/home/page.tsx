import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import BackgroundMap from "@/components/BackgroundMap";
import { authOptions } from "../api/auth/[...nextauth]/route";

async function getCasas() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    try {
        const res = await fetch(`${apiUrl}/api/casa/all`, { 
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('Failed to fetch all casas:', res.status, res.statusText, errorText);
            return []; // Return an empty array instead of throwing an error
        }
        
        const data = await res.json();
        console.log('Fetched all casas:', data);
        return data;
    } catch (error) {
        console.error('Error fetching all casas:', error);
        return []; // Return an empty array in case of network errors
    }
}

export default async function HomePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/");
    }

    const allCasas = await getCasas();

    return (
        <AuthenticatedLayout>
            <BackgroundMap initialCasas={allCasas} />
        </AuthenticatedLayout>
    );
}
