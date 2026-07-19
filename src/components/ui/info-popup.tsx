'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function InfoPopup({ isOpen, onClose, title, children }: PopupProps) {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Popup Content */}
      <div className="relative z-10 w-full max-w-md p-6 bg-popover text-popover-foreground rounded-2xl shadow-xl animate-scale-in border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg font-semibold text-foreground"
            style={{ color: '#f59e0b' }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground transition-colors rounded-lg hover:bg-secondary hover:text-foreground"
            aria-label="Close popup"
            style={{ cursor: 'pointer' }}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="text-sm text-muted-foreground">{children}</div>
      </div>
    </div>,
    document.body
  );
}
