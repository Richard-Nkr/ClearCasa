import React from 'react';
import Sidebar from './Sidebar';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-white">
            <Sidebar className="w-64 flex-shrink-0" />
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
        </div>
    );
}
