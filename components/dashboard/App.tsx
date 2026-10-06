// Shell aplikasi Laku: sidebar (desktop) / bottom tabs ≤5 ikon (mobile <768px),
// routing internal berbasis state (preview statis tanpa server rewrite).

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(ONBOARDED_KEY) === '1') {
        setOnboarded(true);
      }
    } catch {
      /* abaikan */
    }
  }, []);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [page]);

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
      <aside className="sidebar">
        <a className="wordmark" href="#top" onClick={(e) => { e.preventDefault(); if (onboarded) setPage('restock'); }}>
          <span className="logo-mark" aria-hidden="true">◈</span>
          <span className="wordmark-text">LAKU<small>MuaraAI · MVP</small></span>
        </a>
        <nav className="side-nav" aria-label="Navigasi utama">
          {NAV.map((n, i) => (
            <button key={n.key}
              className={`side-link${(!onboarded ? n.key === 'setup' : page === n.key) ? ' active' : ''}`}
              onClick={() => setPage(n.key)}>
              {n.icon({ size: 19 })}
              <span>{n.label}</span>
              <span className="side-no num">0{i + 1}</span>
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <p className="side-note">Data demo hackathon — disimpan hanya di browser ini.</p>
          <p className="side-note num num-left">Deadline MVP · 08 Okt 2026</p>
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
