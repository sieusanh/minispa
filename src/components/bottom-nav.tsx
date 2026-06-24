'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem } from '@/types/ui';
import { cn } from '@/utils/common';

export default function BottomNav({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card/95 backdrop-blur-md">
      {nav.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
