import Link from 'next/link';
import ThemeToggle from './theme-toggle';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center h-14 px-4 md:px-6 border-b border-border bg-card/80 backdrop-blur-md">
      <Link
        href="/bookings"
        className="font-semibold text-sm tracking-tight text-foreground mr-auto flex items-center gap-2"
      >
        <span className="text-primary text-base">✦</span>
        <span>Tiệm Gội Đầu Dưỡng Sinh</span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="size-8 rounded-full flex items-center justify-center text-xs font-semibold bg-primary text-primary-foreground">
          AD
        </div>
      </div>
    </header>
  );
}
