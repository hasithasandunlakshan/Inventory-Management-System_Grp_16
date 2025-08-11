'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { navItems } from './navItems';
import { Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type SidebarProps = Readonly<{
  title?: string;
}>;

export default function Sidebar({ title = 'IMS' }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="sticky top-0 left-0 w-screen z-40 flex h-14 items-center border-b bg-background px-4">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="ml-2 text-lg font-semibold tracking-tight">{title}</div>
      </div>

      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:border-r md:bg-background">
        <div className="h-14 border-b px-4 flex items-center text-lg font-semibold tracking-tight">
          {title}
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
            return (
              <Link key={href} href={href} className="block">
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {open && (
        <dialog open className="fixed inset-0 z-50 md:hidden bg-transparent">
          <button className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-label="Close menu overlay" />
          <div
            ref={panelRef}
            className="absolute inset-y-0 left-0 w-72 translate-x-0 transform bg-background p-2 shadow-xl transition-transform"
          >
            <div className="h-14 border-b px-3 flex items-center text-base font-semibold tracking-tight">
              {title}
            </div>
            <nav className="mt-2 space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
                return (
                  <Link key={href} href={href} className="block" onClick={() => setOpen(false)}>
                    <div
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                        isActive && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </dialog>
      )}
    </>
  );
}


