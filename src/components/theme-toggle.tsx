'use client';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

// export default function ThemeToggle() {
//   const { resolvedTheme, setTheme } = useTheme();
//   //   const [mounted, setMounted] = useState(false);
//   //   useEffect(() => setMounted(true), []);
//   const [mounted, setMounted] = useState(true);
//   if (!mounted) return <div className="size-9" />;

//   return (
//     <button
//       onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
//       className="size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
//       aria-label="Đổi giao diện"
//     >
//       {resolvedTheme === 'dark' ? (
//         <Sun className="size-4" />
//       ) : (
//         <Moon className="size-4" />
//       )}
//     </button>
//   );
// }

// export default function ThemeToggle() {
//   const { resolvedTheme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Render a fixed-size placeholder on server + first client paint
//   // to avoid layout shift, but no icon until theme is known
//   if (!mounted) {
//     return <div className="size-9 rounded-md" aria-hidden="true" />;
//   }

//   return (
//     <Button
//       variant="ghost"
//       size="icon"
//       className="size-9 rounded-md"
//       aria-label="Đổi giao diện"
//       onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
//     >
//       {resolvedTheme === 'dark' ? (
//         <Sun className="size-4" />
//       ) : (
//         <Moon className="size-4" />
//       )}
//     </Button>
//   );
// }

// export default function ThemeToggle() {
//   const { resolvedTheme, setTheme } = useTheme();
//   return (
//     <Button
//       variant="ghost"
//       size="icon"
//       className="size-9 rounded-md"
//       onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
//     >
//       <Sun className="size-4 hidden dark:block" />
//       <Moon className="size-4 block dark:hidden" />
//     </Button>
//   );
// }

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-9 rounded-md"
        aria-hidden="true"
      />
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9 rounded-md"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
