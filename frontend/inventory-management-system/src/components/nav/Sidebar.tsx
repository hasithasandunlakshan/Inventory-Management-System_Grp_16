'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { navItems } from './navItems';
import { Menu, ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type SidebarProps = Readonly<{
  title?: string;
}>;

export default function Sidebar({ title = 'IMS' }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onToggleSidebar = () => setOpen(true);
    
    window.addEventListener('keydown', onKey);
    document.addEventListener('toggleSidebar', onToggleSidebar);
    
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('toggleSidebar', onToggleSidebar);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const isActive = (item: any) => {
    if (item.href) {
      return pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
    }
    if (item.children) {
      return item.children.some((child: any) => isActive(child));
    }
    return false;
  };

  return (
    <>
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-60 md:flex-col md:border-r md:bg-background">
        <div className="h-14 border-b px-4 flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">{title}</div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const { href, label, icon: Icon, children } = item;
            const itemIsActive = isActive(item);
            const isExpanded = expandedItems.has(label);

            if (children) {
              return (
                <div key={label} className="space-y-1">
                  <button
                    onClick={() => toggleExpanded(label)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                      itemIsActive && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="ml-4 space-y-1">
                      {children.map((child) => {
                        const childIsActive = isActive(child);
                        return (
                          <Link key={child.href} href={child.href!} className="block">
                            <div
                              className={cn(
                                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                                childIsActive && 'bg-accent text-accent-foreground'
                              )}
                            >
                              <child.icon className="h-4 w-4" />
                              <span>{child.label}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link key={href} href={href!} className="block">
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                    itemIsActive && 'bg-accent text-accent-foreground'
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
              {navItems.map((item) => {
                const { href, label, icon: Icon, children } = item;
                const itemIsActive = isActive(item);
                const isExpanded = expandedItems.has(label);

                if (children) {
                  return (
                    <div key={label} className="space-y-1">
                      <button
                        onClick={() => toggleExpanded(label)}
                        className={cn(
                          'w-full flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                          itemIsActive && 'bg-accent text-accent-foreground'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="ml-4 space-y-1">
                          {children.map((child) => {
                            const childIsActive = isActive(child);
                            return (
                              <Link key={child.href} href={child.href!} className="block" onClick={() => setOpen(false)}>
                                <div
                                  className={cn(
                                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                                    childIsActive && 'bg-accent text-accent-foreground'
                                  )}
                                >
                                  <child.icon className="h-4 w-4" />
                                  <span>{child.label}</span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link key={href} href={href!} className="block" onClick={() => setOpen(false)}>
                    <div
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                        itemIsActive && 'bg-accent text-accent-foreground'
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


