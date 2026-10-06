// Ikon inline SVG (garis 1.8px, 24 viewBox) — pengganti Material Symbols
// agar seluruh aset tetap lokal sesuai standar template.

import type { JSX } from 'react';

type P = { size?: number; className?: string };
const S = ({ size = 18, className, children }: P & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
);

export const IconAlert = (p: P) => <S {...p}><path d="M12 3 2.5 20h19L12 3z" /><path d="M12 10v4" /><path d="M12 17.5h.01" /></S>;
export const IconBell = (p: P) => <S {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M13.7 20a2 2 0 0 1-3.4 0" /></S>;
export const IconCheck = (p: P) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="m8.5 12.2 2.4 2.4 4.6-5" /></S>;
export const IconBoxes = (p: P) => <S {...p}><path d="M3.5 7.5 8 5l4.5 2.5v5L8 15l-4.5-2.5v-5z" /><path d="M12.5 12.5 17 10l4.5 2.5v5L17 20l-4.5-2.5v-5z" /><path d="M8 10v5" /><path d="M17 15v5" /></S>;
export const IconMoon = (p: P) => <S {...p}><path d="M20 13.5A8.5 8.5 0 0 1 10.5 4 7 7 0 1 0 20 13.5z" /></S>;
export const IconHourglass = (p: P) => <S {...p}><path d="M6 3h12" /><path d="M6 21h12" /><path d="M7 3v3l5 4-5 4v4" /><path d="M17 3v3l-5 4 5 4v4" /></S>;

export const IconRestock = (p: P) => <S {...p}><path d="M3 7h13v10H3z" /><path d="M16 10h3l2 3v4h-5" /><circle cx="7" cy="17" r="1.6" /><circle cx="18" cy="17" r="1.6" /></S>;
export const IconSales = (p: P) => <S {...p}><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M2 20h20" /></S>;
export const IconUpload = (p: P) => <S {...p}><path d="M12 16V4" /><path d="m6 10 6-6 6 6" /><path d="M4 20h16" /></S>;
export const IconSetup = (p: P) => <S {...p}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" /></S>;
export const IconWhy = (p: P) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1 1-1.1 1.8" /><path d="M12 16.8h.01" /></S>;
export const IconClose = (p: P) => <S {...p}><path d="m5 5 14 14" /><path d="m19 5-14 14" /></S>;
export const IconChevron = (p: P) => <S {...p}><path d="m9 6 6 6-6 6" /></S>;
export const IconSync = (p: P) => <S {...p}><path d="M20 11A8 8 0 0 0 5.6 6.6L4 8" /><path d="M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14.4 4.4L20 16" /><path d="M20 20v-4h-4" /></S>;
export const IconWarning = (p: P) => <S {...p}><path d="M12 3 2.5 20h19L12 3z" /><path d="M12 10v4" /><path d="M12 17.5h.01" /></S>;
export const IconScale = (p: P) => <S {...p}><path d="M12 4v16" /><path d="M5 7h14" /><path d="m5 7-2.5 6a3 3 0 0 0 5 0L5 7z" /><path d="m19 7-2.5 6a3 3 0 0 0 5 0L19 7z" /></S>;
export const IconFile = (p: P) => <S {...p}><path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-6-6z" /><path d="M13 3v6h6" /></S>;

export function StatusIcon({ name, size }: { name: string; size?: number }): JSX.Element {
  switch (name) {
    case 'alert': return <IconAlert size={size} />;
    case 'bell': return <IconBell size={size} />;
    case 'check': return <IconCheck size={size} />;
    case 'boxes': return <IconBoxes size={size} />;
    case 'moon': return <IconMoon size={size} />;
    default: return <IconHourglass size={size} />;
  }
}
