// Shell aplikasi Laku: sidebar (desktop) / bottom tabs ≤5 ikon (mobile <768px),
// routing internal berbasis state (preview statis tanpa server rewrite).

import { useEffect, useState, useMemo } from 'react';
import { dashboard } from '@/constants/id';
import RevealObserver from '@/components/landing/RevealObserver';
import { RestockPage } from './pages/Restock';
import { PenjualanPage } from './pages/Penjualan';
import { UploadPage } from './pages/Upload';
import { OnboardingPage } from './pages/Onboarding';
import { IconRestock, IconSales, IconUpload, IconSetup, IconLock } from './icons';

type PageKey = 'restock' | 'penjualan' | 'upload' | 'setup';

const ONBOARDED_KEY_PREFIX = 'laku-onboarded-';
const DEMO_ONBOARDED_KEY = 'laku-onboarded-demo';

export default function App() {
  const [page, setPage] = useState<PageKey>('restock');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [mode, setMode] = useState<'demo' | 'live'>('demo');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [liveOnboarded, setLiveOnboarded] = useState<boolean>(true);
  const [demoOnboarded, setDemoOnboarded] = useState<boolean>(true);
  // live mode waits for the session check so pages never call the API without a token
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlMode = urlParams.get('mode');
        if (urlMode === 'live' || urlMode === 'demo') {
          setMode(urlMode);
        }
        const isDemoDone = localStorage.getItem(DEMO_ONBOARDED_KEY) === '1';
        setDemoOnboarded(isDemoDone);
      }
    } catch {
      /* abaikan */
    }
  }, []);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let redirecting = false;
    async function loadUser() {
      try {
        const { supabaseBrowser } = await import('@/lib/supabase/client');
        const supabase = supabaseBrowser();
        const wantsLive = new URLSearchParams(window.location.search).get('mode') === 'live';
        if (!supabase) {
          // login is not configured here, so "Toko Saya" cannot exist: stay on the demo
          if (wantsLive) setMode('demo');
          return;
        }
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          const email = data.session?.user?.email ?? null;
          if (!email && wantsLive) {
            // /dashboard?mode=live while logged out: sign in first, then come back to the live store
            redirecting = true;
            window.location.replace(`/login?next=${encodeURIComponent('/dashboard?mode=live')}`);
            return;
          }
          setUserEmail(email);

          if (email) {
            const isDone = localStorage.getItem(`${ONBOARDED_KEY_PREFIX}${email}`) === '1';
            setLiveOnboarded(isDone);
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('mode') !== 'demo') {
              setMode('live');
            }
          }

          const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            const sEmail = session?.user?.email ?? null;
            setUserEmail(sEmail);
            if (sEmail) {
              const isDone = localStorage.getItem(`${ONBOARDED_KEY_PREFIX}${sEmail}`) === '1';
              setLiveOnboarded(isDone);
              if (new URLSearchParams(window.location.search).get('mode') !== 'demo') {
                setMode('live');
              }
            }
          });
          unsub = () => authListener?.subscription?.unsubscribe();
        }
      } catch {
        /* abaikan */
      } finally {
        if (!redirecting) setAuthChecked(true);
      }
    }
    loadUser();
    return () => {
      unsub?.();
    };
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
      if (typeof window !== 'undefined') {
        if (mode === 'demo') {
          localStorage.setItem(DEMO_ONBOARDED_KEY, '1');
          setDemoOnboarded(true);
        } else {
          if (userEmail) localStorage.setItem(`${ONBOARDED_KEY_PREFIX}${userEmail}`, '1');
          setLiveOnboarded(true);
        }
      }
    } catch {
      /* abaikan */
    }
    setPage('restock');
  }

  const isLocked = mode === 'demo' ? !demoOnboarded : !liveOnboarded;

  // keep ?mode= in the address bar in step with the toggle, so a reload opens the same store
  function switchMode(next: 'demo' | 'live') {
    setMode(next);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', next);
      window.history.replaceState(null, '', url);
    } catch {
      /* abaikan */
    }
  }

  const navItems = useMemo(() => {
    if (mode === 'demo') {
      // Di Demo: menu Setup SELALU ADA di navigasi ("di demo, seharusnya ya ada").
      // Jika belum wizard (!demoOnboarded), tab lain terkunci.
      return [
        { key: 'setup' as PageKey, label: dashboard.sidebar.nav.setup, icon: (p: { size?: number }) => <IconSetup {...p} />, locked: false },
        { key: 'restock' as PageKey, label: dashboard.sidebar.nav.restock, icon: (p: { size?: number }) => <IconRestock {...p} />, locked: !demoOnboarded },
        { key: 'penjualan' as PageKey, label: dashboard.sidebar.nav.penjualan, icon: (p: { size?: number }) => <IconSales {...p} />, locked: !demoOnboarded },
        { key: 'upload' as PageKey, label: dashboard.sidebar.nav.upload, icon: (p: { size?: number }) => <IconUpload {...p} />, locked: !demoOnboarded },
      ];
    }

    // Di Live (Toko Saya):
    // Jika belum selesai setup (!liveOnboarded), tab lain terkunci.
    if (!liveOnboarded) {
      return [
        { key: 'setup' as PageKey, label: dashboard.sidebar.nav.setup, icon: (p: { size?: number }) => <IconSetup {...p} />, locked: false },
        { key: 'restock' as PageKey, label: dashboard.sidebar.nav.restock, icon: (p: { size?: number }) => <IconRestock {...p} />, locked: true },
        { key: 'penjualan' as PageKey, label: dashboard.sidebar.nav.penjualan, icon: (p: { size?: number }) => <IconSales {...p} />, locked: true },
        { key: 'upload' as PageKey, label: dashboard.sidebar.nav.upload, icon: (p: { size?: number }) => <IconUpload {...p} />, locked: true },
      ];
    }

    // Khusus yang sudah login: setelah setup, tab Setup HILANG!
    return [
      { key: 'restock' as PageKey, label: dashboard.sidebar.nav.restock, icon: (p: { size?: number }) => <IconRestock {...p} />, locked: false },
      { key: 'penjualan' as PageKey, label: dashboard.sidebar.nav.penjualan, icon: (p: { size?: number }) => <IconSales {...p} />, locked: false },
      { key: 'upload' as PageKey, label: dashboard.sidebar.nav.upload, icon: (p: { size?: number }) => <IconUpload {...p} />, locked: false },
    ];
  }, [mode, demoOnboarded, liveOnboarded]);

  // a page that is not in this mode's menu (e.g. Setup, opened in Demo, after switching to an onboarded
  // live store where Setup is hidden) falls back to Restock instead of rendering with no tab selected
  const pageAvailable = navItems.some((n) => n.key === page && !n.locked);
  const currentPage: PageKey = isLocked ? 'setup' : pageAvailable ? page : 'restock';

  const storeName = mode === 'demo'
    ? dashboard.sidebar.demoStoreName
    : userEmail
    ? `Toko ${userEmail.split('@')[0]}`
    : dashboard.sidebar.defaultLiveName;

  const body = mode === 'live' && !authChecked ? (
    <p className="page-loading" role="status">{dashboard.common.loadingSession}</p>
  ) : currentPage === 'setup' ? (
    <OnboardingPage onFinish={finishOnboarding} mode={mode} />
  ) : currentPage === 'penjualan' ? (
    <PenjualanPage mode={mode} />
  ) : currentPage === 'upload' ? (
    <UploadPage mode={mode} onUploaded={() => setPage('restock')} />
  ) : (
    <RestockPage mode={mode} onGoUpload={() => setPage('upload')} />
  );

  return (
    <div className="app-shell">
      {/* observer reveal ala landing — key berganti per halaman supaya elemen
          halaman aktif yang dipindai ulang (elemen baru tidak diamati observer lama) */}
      <RevealObserver key={`${page}`} />
      <aside className="sidebar">
        <a className="wordmark" href="#top" onClick={(e) => { e.preventDefault(); setPage('restock'); }}>
          {/* Mark Laku (oktagon, L rak, kotak stok) — salinan dari components/landing/primitives.tsx */}
          <svg className="mark" viewBox="0 0 64 64" aria-hidden="true">
            <path className="m-oct" d="M19.8 2H44.2L62 19.8V44.2L44.2 62H19.8L2 44.2V19.8Z" />
            <rect className="m-ghost" x="24" y="14" width="14" height="14" rx="2" />
            <rect className="m-stock" x="24" y="33" width="14" height="14" rx="2" />
            <path className="m-l" d="M17 17V50H48" />
          </svg>
          <span className="wordmark-text">LAKU<small>Restock yuk!</small></span>
        </a>

        <nav className="side-nav" aria-label="Navigasi utama" onMouseLeave={() => setHoverIdx(null)}>
          {hoverIdx !== null && (
            <span className="side-pill" style={{ transform: `translateY(${hoverIdx * 46}px)` }} aria-hidden="true" />
          )}
          {navItems.map((n, i) => (
            <button key={n.key}
              className={`side-link${currentPage === n.key ? ' active' : ''}${n.locked ? ' locked' : ''}`}
              onClick={() => {
                if (!n.locked) setPage(n.key);
              }}
              onMouseEnter={() => setHoverIdx(i)}
              disabled={n.locked}
              title={n.locked ? 'Selesaikan setup awal terlebih dahulu' : undefined}
            >
              {n.icon({ size: 19 })}
              <span>{n.label}</span>
              {n.locked && (
                <span className="side-lock-icon" title="Terkunci">
                  <IconLock size={14} />
                </span>
              )}
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
                {dashboard.sidebar.logoutBtn}
              </button>
            </div>
          ) : (
            <div className="side-user demo-user">
              <span className="user-email">{dashboard.sidebar.demoModeGuest}</span>
              <a className="user-logout user-login-link" href="/login">
                {dashboard.sidebar.loginBtn}
              </a>
            </div>
          )}
        </div>
      </aside>

      <main className="content" id="top">
        <div className="content-inner">
          <header className="dash-topbar" aria-label="Pengaturan Toko dan Mode">
            <div className="mode-switcher-top">
              <span className={`store-badge ${mode === 'live' ? 'live' : ''}`}>
                {mode === 'demo' ? 'DEMO' : 'LIVE'}
              </span>
              <span className="store-name" title={storeName}>
                {storeName}
              </span>
              <div className="mode-toggle-group" role="radiogroup" aria-label="Pilih mode data">
                <button
                  className={`mode-btn ${mode === 'demo' ? 'active' : ''}`}
                  onClick={() => switchMode('demo')}
                  type="button"
                  role="radio"
                  aria-checked={mode === 'demo'}
                >
                  {dashboard.sidebar.toggleDemo}
                </button>
                <button
                  className={`mode-btn ${mode === 'live' ? 'active' : ''}`}
                  onClick={() => {
                    if (!userEmail) {
                      window.location.href = `/login?next=${encodeURIComponent('/dashboard?mode=live')}`;
                    } else {
                      switchMode('live');
                    }
                  }}
                  title={!userEmail ? dashboard.sidebar.loginRequiredTitle : dashboard.sidebar.switchToLiveTitle}
                  type="button"
                  role="radio"
                  aria-checked={mode === 'live'}
                >
                  Toko Saya
                </button>
              </div>
            </div>
          </header>
          {body}
        </div>
      </main>

      <nav className="bottom-tabs" aria-label="Navigasi utama mobile">
        {navItems.map((n) => (
          <button key={n.key}
            className={`tab${currentPage === n.key ? ' active' : ''}${n.locked ? ' locked' : ''}`}
            onClick={() => {
              if (!n.locked) setPage(n.key);
            }}
            disabled={n.locked}
            aria-label={n.label}
          >
            {n.locked ? <IconLock size={20} /> : n.icon({ size: 21 })}
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
