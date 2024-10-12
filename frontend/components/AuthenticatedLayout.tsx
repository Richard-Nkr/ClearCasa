import React from 'react';
import Sidebar from './Sidebar';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar />
            <main className="flex-1 p-8 md:ml-64">
                {children}
            </main>
        </div>
    );
}
