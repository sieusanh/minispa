'use client';
import Link from 'next/link';
import { NavItem } from '@/types/ui';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/common';

export default function Sidebar({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card fixed top-14 bottom-0 left-0 z-30">
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map((item) => {
          const isActive = pathname === item.href;
          //   <NavLink
          //     key={item.to}
          //     to={item.to}
          //     className={({ isActive }) =>
          //       cn(
          //         'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
          //         isActive
          //           ? 'bg-primary text-primary-foreground'
          //           : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          //       )
          //     }
          //   >
          //     {item.icon}
          //     {item.label}
          //   </NavLink>
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      {/* <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 text-sm">
          <div className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
            AD
          </div>
          <div>
            <p className="font-medium text-foreground leading-none">Admin</p>
            <p className="text-xs text-muted-foreground mt-0.5">Quản lý</p>
          </div>
        </div>
      </div> */}
    </aside>
  );
}
