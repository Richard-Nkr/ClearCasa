'use client';

import Link from 'next/link';
import { Home, CheckSquare, Calendar, Settings, LogOut, Menu, Plus } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CasaForm from './CasaForm';

export default function Sidebar() {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);

    if (!session) return null;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center space-x-4 mb-6 pt-4 px-4">
                <Avatar className="h-12 w-12 border-2 border-primary">
                    <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || 'User'} />
                    <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(session.user?.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold text-primary">{session.user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                </div>
            </div>
            <nav className="flex-1 px-4">
                <ul className="space-y-1">
                    <SidebarItem href="/settings" icon={<Settings size={20} />} text="Settings" />
                    <li>
                        <CasaForm />
                    </li>
                </ul>
            </nav>
            <div className="mt-auto pt-4 px-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={() => signOut()}
                >
                    <LogOut size={20} className="mr-2" />
                    <span>Sign out</span>
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
                    <Button variant="outline" size="icon">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[350px] bg-background border-r p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
            <aside className="hidden md:flex bg-background border-r w-64 flex-col h-screen">
                <SidebarContent />
            </aside>
        </>
    );
}

interface SidebarItemProps {
    href: string;
    icon: React.ReactNode;
    text: string;
}

function SidebarItem({ href, icon, text }: SidebarItemProps) {
    return (
        <li>
            <Button variant="ghost" asChild className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/10">
                <Link href={href} className="flex items-center py-2 px-4 rounded-md transition-colors duration-200">
                    {icon}
                    <span className="ml-3">{text}</span>
                </Link>
            </Button>
        </li>
    );
}

function getInitials(name: string | null | undefined): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
