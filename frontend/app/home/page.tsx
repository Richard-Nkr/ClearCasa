'use client'

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Sidebar } from "@/components/Sidebar";
import dynamic from "next/dynamic";
import { Suspense, useState, useCallback } from "react";
import CasaForm from "@/components/CasaForm";

const LeafletMap = dynamic(() => import('@/components/LeafletMap').then(mod => mod.LeafletMap), {
  ssr: false,
});

export default function HomePage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleCasaCreated = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar className="w-64 border-r bg-white" />
            <main className="flex-1 p-6 overflow-hidden relative">
                <div className="h-[calc(100vh-3rem)]">
                    <Suspense fallback={<div className="h-full flex items-center justify-center bg-gray-200 rounded-lg">Loading map...</div>}>
                        <LeafletMap className="w-full h-full" key={refreshTrigger} />
                    </Suspense>
                </div>
                <div className="absolute top-8 right-8 z-[1001]">
                    <CasaForm onCasaCreated={handleCasaCreated} />
                </div>
            </main>
        </div>
    );
}
