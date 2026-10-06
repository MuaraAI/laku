// Shell aplikasi Laku: sidebar (desktop) / bottom tabs ≤5 ikon (mobile <768px),
// routing internal berbasis state (preview statis tanpa server rewrite).

import { useEffect, useState } from 'react';
import RevealObserver from '@/components/landing/RevealObserver';
import { RestockPage } from './pages/Restock';
import { PenjualanPage } from './pages/Penjualan';
import { UploadPage } from './pages/Upload';
import { OnboardingPage } from './pages/Onboarding';
import { IconRestock, IconSales, IconUpload, IconSetup } from './icons';

type PageKey = 'restock' | 'penjualan' | 'upload' | 'setup';

const NAV: { key: PageKey; label: string; icon: (p: { size?: number }) => React.ReactNode }[] = [
  { key: 'restock', label: 'Restock', icon: (p) => <IconRestock {...p} /> },
  { key: 'penjualan', label: 'Penjualan', icon: (p) => <IconSales {...p} /> },
  { key: 'upload', label: 'Upload', icon: (p) => <IconUpload {...p} /> },
  { key: 'setup', label: 'Setup', icon: (p) => <IconSetup {...p} /> },
];

const ONBOARDED_KEY = 'laku-onboarded';

export default function App() {
  const [onboarded, setOnboarded] = useState<boolean>(false);
  const [page, setPage] = useState<PageKey>('restock');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(ONBOARDED_KEY) === '1') {
        setOnboarded(true);
      }
    } catch {
      /* abaikan */
    }
  }, []);

  useEffect(() => {
    async function loadUser() {
      try {
        const { supabaseBrowser } = await import('@/lib/supabase/client');
        const supabase = supabaseBrowser();
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user?.email) {
            setUserEmail(data.session.user.email);
          }
          supabase.auth.onAuthStateChange((_event, session) => {
            setUserEmail(session?.user?.email ?? null);
          });
        }
      } catch {
        /* abaikan */
      }
    }
    loadUser();
  }, []);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [page]);

  async function handleLogout() {
    try {
      const { supabaseBrowser } = await import('@/lib/supabase/client');
      const supabase = supabaseBrowser();
      if (supabase) {
        await supabase.auth.signOut();
      }
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  }

  function finishOnboarding() {
    try {
      if (typeof window !== 'undefined') localStorage.setItem(ONBOARDED_KEY, '1');
    } catch {
      /* abaikan */
    }
    setOnboarded(true);
    setPage('restock');
  }

  const body = !onboarded || page === 'setup' ? (
    <OnboardingPage onFinish={finishOnboarding} />
  ) : page === 'penjualan' ? (
    <PenjualanPage />
  ) : page === 'upload' ? (
    <UploadPage />
  ) : (
    <RestockPage />
  );

  return (
    <div className="app-shell">
      {/* observer reveal ala landing — key berganti per halaman supaya elemen
          halaman aktif yang dipindai ulang (elemen baru tidak diamati observer lama) */}
      <RevealObserver key={`${onboarded}-${page}`} />
      <aside className="sidebar">
        <a className="wordmark" href="#top" onClick={(e) => { e.preventDefault(); if (onboarded) setPage('restock'); }}>
          {/* Mark Laku (oktagon, L rak, kotak stok) — salinan dari components/landing/primitives.tsx */}
          <svg className="mark" viewBox="0 0 64 64" aria-hidden="true">
            <path className="m-oct" d="M19.8 2H44.2L62 19.8V44.2L44.2 62H19.8L2 44.2V19.8Z" />
            <rect className="m-ghost" x="24" y="14" width="14" height="14" rx="2" />
            <rect className="m-stock" x="24" y="33" width="14" height="14" rx="2" />
            <path className="m-l" d="M17 17V50H48" />
          </svg>
          <span className="wordmark-text">LAKU<small>MuaraAI · MVP</small></span>
        </a>
        <nav className="side-nav" aria-label="Navigasi utama" onMouseLeave={() => setHoverIdx(null)}>
          {hoverIdx !== null && (
            <span className="side-pill" style={{ transform: `translateY(${hoverIdx * 46}px)` }} aria-hidden="true" />
          )}
          {NAV.map((n, i) => (
            <button key={n.key}
              className={`side-link${(!onboarded ? n.key === 'setup' : page === n.key) ? ' active' : ''}`}
              onClick={() => setPage(n.key)}
              onMouseEnter={() => setHoverIdx(i)}>
              {n.icon({ size: 19 })}
              <span>{n.label}</span>
              <span className="side-no num">0{i + 1}</span>
            </button>
          ))}
        </nav>
        <div className="side-foot">
          {userEmail ? (
            <div className="side-user">
              <span className="user-email" title={userEmail}>
                {userEmail}
              </span>
              <button className="user-logout" onClick={handleLogout}>
                Keluar
              </button>
            </div>
          ) : (
            <div className="side-user demo-user">
              <span className="user-email">Mode Demo (Tamu)</span>
              <a className="user-logout user-login-link" href="/login">
                Masuk
              </a>
            </div>
          )}
          <p className="side-note"><span className="demo-chip">Data demo</span> Disimpan hanya di browser ini.</p>
          <p className="side-note num num-left">SIFEST 2026 · MuaraAI</p>
        </div>
      </aside>

      <main className="content" id="top">
        <div className="content-inner">{body}</div>
      </main>

      <nav className="bottom-tabs" aria-label="Navigasi utama mobile">
        {NAV.map((n) => (
          <button key={n.key}
            className={`tab${(!onboarded ? n.key === 'setup' : page === n.key) ? ' active' : ''}`}
            onClick={() => setPage(n.key)} aria-label={n.label}>
            {n.icon({ size: 21 })}
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
