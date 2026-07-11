'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ThemeToggle from './theme-toggle';
import { logoutAction } from '@/lib/data/staff';
import '@/styles/popup.css';

export default function AppHeader({
  isAuthenticated,
  username,
}: {
  isAuthenticated: boolean;
  username: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close if the click is outside the popup and the popup is open
      if (
        popupRef.current &&
        event.target instanceof Node &&
        !popupRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    // Attach listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Clean up listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center h-14 px-4 md:px-6 border-b border-border bg-card/80 backdrop-blur-md">
      <Link
        href="/bookings"
        className="font-semibold text-sm tracking-tight text-foreground mr-auto flex items-center gap-2"
      >
        <span className="text-primary text-base">✦</span>
        <span>Tiệm Gội Đầu Dưỡng Sinh</span>
      </Link>
      {isAuthenticated && (
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div
            className="size-8 rounded-full flex items-center justify-center text-xs font-semibold bg-primary text-primary-foreground"
            // onClick={() => setIsOpen((prev) => !prev)}
            onClick={() => setIsOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            {username.slice(0, 2)}
          </div>
          {isOpen && (
            <div ref={popupRef} className="popup-overlay">
              <div className="popup-content">
                <h2 style={{ color: 'Aquamarine' }}>Tài khoản</h2>
                <form
                  action={() => {
                    logoutAction();
                    setIsOpen(false);
                  }}
                >
                  <button
                    type="submit"
                    style={{ cursor: 'pointer', color: 'DarkTurquoise' }}
                  >
                    Đăng xuất
                  </button>
                </form>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    cursor: 'pointer',
                    color: 'grey',
                    marginTop: '20px',
                  }}
                >
                  X
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
