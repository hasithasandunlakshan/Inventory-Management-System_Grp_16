'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getNavItemsForRole } from '@/lib/rbac/navItems';
import { Menu, ChevronDown, ChevronRight, LogOut, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type SidebarProps = Readonly<{
  title?: string;
}>;

export default function Sidebar({ title = 'IMS' }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { user, logout } = useAuth();

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

  const isActive = (item: {
    href?: string;
    children?: Array<{ href: string }>;
  }): boolean => {
    if (item.href) {
      return (
        pathname === item.href ||
        (item.href !== '/' && pathname?.startsWith(item.href))
      );
    }
    if (item.children) {
      return item.children.some((child: { href: string }) => isActive(child));
    }
    return false;
  };

  // Get navigation items based on user role
  const navItems = user?.role ? getNavItemsForRole(user.role) : [];
  const filteredNavItems = navItems;

  return (
    <>
      <aside className='hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-60 md:flex-col md:border-r md:bg-background'>
        <div className='h-16 px-6 flex items-center justify-between bg-brand-gradient shadow-lg'>
          <div className='flex items-center space-x-3'>
            <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm'>
              <span className='text-white font-bold text-sm'>S</span>
            </div>
            <div className='text-xl font-bold tracking-tight text-white'>
              {title}
            </div>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setOpen(true)}
            className='md:hidden text-white hover:bg-white/20 rounded-lg transition-colors duration-200'
          >
            <Menu className='h-5 w-5' />
          </Button>
        </div>
        <nav className='flex-1 overflow-y-auto p-2'>
          {filteredNavItems.map(item => {
            const { href, label, icon: Icon, children } = item;
            const itemIsActive = isActive(item);
            const isExpanded = expandedItems.has(label);

            if (children) {
              return (
                <div key={label} className='space-y-1'>
                  <button
                    onClick={() => toggleExpanded(label)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary',
                      itemIsActive && 'bg-primary/15 text-primary font-medium'
                    )}
                  >
                    <div className='flex items-center gap-3'>
                      <Icon className='h-4 w-4' />
                      <span>{label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className='h-4 w-4' />
                    ) : (
                      <ChevronRight className='h-4 w-4' />
                    )}
                  </button>
                  {isExpanded && (
                    <div className='ml-4 space-y-1'>
                      {children.map(
                        (child: {
                          href: string;
                          label: string;
                          icon: React.ComponentType<{ className?: string }>;
                        }) => {
                          const childIsActive = isActive(child);
                          return (
                            <Link
                              key={child.href}
                              href={child.href!}
                              className='block'
                            >
                              <div
                                className={cn(
                                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary',
                                  childIsActive &&
                                    'bg-primary/15 text-primary font-medium'
                                )}
                              >
                                <child.icon className='h-4 w-4' />
                                <span>{child.label}</span>
                              </div>
                            </Link>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link key={href} href={href!} className='block'>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary',
                    itemIsActive && 'bg-primary/15 text-primary font-medium'
                  )}
                >
                  <Icon className='h-4 w-4' />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Info and Logout */}
        {user && (
          <div className='border-t p-4'>
            <Link href='/profile' className='block mb-3'>
              <div className='flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer'>
                <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium'>
                  {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-foreground truncate'>
                    {user.fullName || user.username}
                  </p>
                  <p className='text-xs text-muted-foreground truncate'>
                    {user.role}
                  </p>
                </div>
                <User className='h-4 w-4 text-muted-foreground' />
              </div>
            </Link>
            <Button
              variant='ghost'
              size='sm'
              onClick={logout}
              className='w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-lg'
            >
              <LogOut className='h-4 w-4 mr-2' />
              Logout
            </Button>
          </div>
        )}
      </aside>

      {open && (
        <dialog open className='fixed inset-0 z-50 md:hidden bg-transparent'>
          <button
            className='absolute inset-0 bg-black/40'
            onClick={() => setOpen(false)}
            aria-label='Close menu overlay'
          />
          <div
            ref={panelRef}
            className='absolute inset-y-0 left-0 w-72 translate-x-0 transform bg-background shadow-xl transition-transform'
          >
            <div className='h-16 px-6 flex items-center bg-brand-gradient shadow-lg'>
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm'>
                  <span className='text-white font-bold text-sm'>S</span>
                </div>
                <div className='text-xl font-bold tracking-tight text-white'>
                  {title}
                </div>
              </div>
            </div>
            <nav className='mt-2 space-y-1 p-2'>
              {filteredNavItems.map(item => {
                const { href, label, icon: Icon, children } = item;
                const itemIsActive = isActive(item);
                const isExpanded = expandedItems.has(label);

                if (children) {
                  return (
                    <div key={label} className='space-y-1'>
                      <button
                        onClick={() => toggleExpanded(label)}
                        className={cn(
                          'w-full flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary',
                          itemIsActive &&
                            'bg-primary/15 text-primary font-medium'
                        )}
                      >
                        <div className='flex items-center gap-3'>
                          <Icon className='h-4 w-4' />
                          <span>{label}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className='h-4 w-4' />
                        ) : (
                          <ChevronRight className='h-4 w-4' />
                        )}
                      </button>
                      {isExpanded && (
                        <div className='ml-4 space-y-1'>
                          {children.map(
                            (child: {
                              href: string;
                              label: string;
                              icon: React.ComponentType<{ className?: string }>;
                            }) => {
                              const childIsActive = isActive(child);
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href!}
                                  className='block'
                                  onClick={() => setOpen(false)}
                                >
                                  <div
                                    className={cn(
                                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary',
                                      childIsActive &&
                                        'bg-primary/15 text-primary font-medium'
                                    )}
                                  >
                                    <child.icon className='h-4 w-4' />
                                    <span>{child.label}</span>
                                  </div>
                                </Link>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={href}
                    href={href!}
                    className='block'
                    onClick={() => setOpen(false)}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary',
                        itemIsActive && 'bg-primary/15 text-primary font-medium'
                      )}
                    >
                      <Icon className='h-4 w-4' />
                      <span>{label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Info and Logout */}
            {user && (
              <div className='border-t p-4 mt-4'>
                <Link
                  href='/profile'
                  className='block mb-3'
                  onClick={() => setOpen(false)}
                >
                  <div className='flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer'>
                    <div className='w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium'>
                      {user.fullName?.charAt(0) ||
                        user.username?.charAt(0) ||
                        'U'}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-foreground truncate'>
                        {user.fullName || user.username}
                      </p>
                      <p className='text-xs text-muted-foreground truncate'>
                        {user.role}
                      </p>
                    </div>
                    <User className='h-4 w-4 text-muted-foreground' />
                  </div>
                </Link>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={logout}
                  className='w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 rounded-lg'
                >
                  <LogOut className='h-4 w-4 mr-2' />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </dialog>
      )}
    </>
  );
}
