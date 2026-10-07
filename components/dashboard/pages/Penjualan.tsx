// Halaman Penjualan (Recap): period selector 7/30/90 hari, trend chart,
// ringkasan omzet, dan Coverage Banner untuk data usang/parsial.

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { dashboard } from '@/constants/id';
import { SALES, CHANNEL_SPLIT, DATA_FRESHNESS, fmtIDR, fmtNum, fmtNum1, type Channel } from '../data';
import { Num, SementaraChip, ApiErrorNote } from '../components';
import { IconWarning } from '../icons';

type Period = 7 | 30 | 90;
const PERIODS: Period[] = [7, 30, 90];

type TrendPoint = { day: string; omzet: number; transaksi: number | null; sementara?: boolean };

// live data is passed in as `customData`; demo numbers are only used when no live series was given at all
function TrendChart({ period, customData }: { period: Period; customData?: TrendPoint[] | null }) {
  const data: TrendPoint[] = customData ?? SALES[period];
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 240, PL = 8, PR = 8, PT = 16, PB = 28;
  // floor of 1 keeps an all-zero series from dividing by zero (NaN path)
  const max = Math.max(1, ...data.map((d) => d.omzet));
  const x = (i: number) => PL + (i / (data.length - 1)) * (W - PL - PR);
  const y = (v: number) => PT + (1 - v / max) * (H - PT - PB);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.omzet).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1).toFixed(1)},${H - PB} L${x(0).toFixed(1)},${H - PB} Z`;
  // Titik potong zona "sementara" (7 hari terakhir).
  const splitX = x(Math.max(0, data.length - 7));
  const hov = hover != null ? data[hover] : null;

  const labels = useMemo(() => {
    const step = Math.ceil(data.length / 6);
    return data.map((d, i) => (i % step === 0 || i === data.length - 1 ? { i, label: d.day } : null)).filter(Boolean) as { i: number; label: string }[];
  }, [data]);

  return (
    <div className="chart-wrap" data-reveal>
      <svg key={period} viewBox={`0 0 ${W} ${H}`} className="trend-chart" role="img"
        aria-label={`Tren omzet ${period} hari terakhir`}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round(((px - PL) / (W - PL - PR)) * (data.length - 1));
          setHover(Math.min(data.length - 1, Math.max(0, i)));
        }}
        onTouchStart={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const t = e.touches[0];
          const px = ((t.clientX - rect.left) / rect.width) * W;
          const i = Math.round(((px - PL) / (W - PL - PR)) * (data.length - 1));
          setHover(Math.min(data.length - 1, Math.max(0, i)));
        }}
      >
        <rect x={splitX} y={PT - 8} width={W - PR - splitX} height={H - PT - PB + 8} className="chart-sementara-zone" rx="6" />
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={PL} x2={W - PR} y1={y(max * f)} y2={y(max * f)} className="chart-grid" />
        ))}
        <path d={area} className="chart-area" />
        <path d={line} className="chart-line" pathLength={1} />
        {labels.map((l) => (
          <text key={l.i} x={x(l.i)} y={H - 8} className="chart-tick"
            textAnchor={l.i === 0 ? 'start' : l.i === data.length - 1 ? 'end' : 'middle'}>{l.label}</text>
        ))}
        {hov && hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PT - 4} y2={H - PB} className="chart-cursor" />
            <circle cx={x(hover)} cy={y(hov.omzet)} r={4.5} className="chart-dot" />
          </g>
        )}
      </svg>
      <div className="chart-readout" aria-live="polite">
        {hov ? (
          <>
            <span className="num num-left">{hov.day}</span>
            <Num strong>{fmtIDR(hov.omzet)}</Num>
            <span className="chart-readout-sub">
              {hov.transaksi != null && <><Num>{fmtNum(hov.transaksi)}</Num> transaksi </>}
              {hov.sementara && <SementaraChip />}
            </span>
          </>
        ) : (
          <span className="chart-readout-hint">Sentuh atau arahkan ke grafik untuk lihat angka harian.</span>
        )}
      </div>
    </div>
  );
}

// kontrak = backend/app/services/recap.py compute_recap (fixture: backend/mock/fixtures/recap.json).
// Dulu dibaca sebagai orders_count / share_pct / trend[].day → transaksi selalu 0 (halaman Live
// selalu "belum ada transaksi"), bar channel NaN%, dan t.day.length membuat halaman crash.
interface LiveRecapResponse {
  totals?: {
    gross_rp?: number;
    net_rp?: number;
    orders?: number;
  };
  per_channel?: {
    channel: string;
    gross_rp: number;
    net_rp: number;
    share: number; // pecahan 0–1 dari penjualan bersih
  }[];
  trend?: {
    date: string; // YYYY-MM-DD (tanggal WIB)
    net_rp: number;
  }[];
  warnings?: { channel?: string; type: string; message: string }[];
}

const CHANNEL_LABEL: Record<string, Channel> = { shopee: 'Shopee', tiktok_shop: 'TikTok Shop', tokopedia: 'Tokopedia' };
const shortDay = (iso: string) => {
  const d = new Date(`${iso}T00:00:00+07:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', timeZone: 'Asia/Jakarta' });
};

export function PenjualanPage({ mode = 'demo' }: { mode?: 'demo' | 'live' }) {
  const [period, setPeriod] = useState<Period>(30);
  const [liveRecap, setLiveRecap] = useState<LiveRecapResponse | null>(null);
  const [recapError, setRecapError] = useState<string | null>(null);

  const isLive = mode === 'live';
  // switching 7 → 30 → 90 quickly must not let an older, slower response overwrite the newer period
  const reqId = useRef(0);

  const fetchRecap = useCallback(() => {
    setRecapError(null);
    const id = ++reqId.current;
    apiFetch<LiveRecapResponse>(`/v1/recap?days=${period}`)
      .then((res) => {
        if (id !== reqId.current) return;
        if (res.data) {
          setLiveRecap(res.data);
          setRecapError(null);
        } else if (res.error) {
          setRecapError(res.error);
        }
      });
  }, [period]);

  useEffect(() => {
    if (isLive) {
      fetchRecap();
    } else {
      setLiveRecap(null);
      setRecapError(null);
    }
  }, [isLive, fetchRecap]);

  const data = SALES[period];
  const split = CHANNEL_SPLIT[period];

  const liveSplit = useMemo(() => {
    if (!liveRecap?.per_channel?.length) return [];
    return liveRecap.per_channel.map((c) => ({
      channel: CHANNEL_LABEL[c.channel] ?? (c.channel as Channel),
      omzet: Math.round(Number(c.gross_rp) || 0),
      share: Math.round((Number(c.share) || 0) * 1000) / 10,
    }));
  }, [liveRecap]);

  // the recap API has no per-day order count, so the readout shows none instead of a made-up "1 transaksi"
  const liveTrendData = useMemo<TrendPoint[]>(() => {
    if (!liveRecap?.trend?.length) return [];
    return liveRecap.trend.map((t) => ({
      day: shortDay(String(t.date ?? '')),
      omzet: Number(t.net_rp || 0),
      transaksi: null,
      sementara: false,
    }));
  }, [liveRecap]);

  // live never borrows the demo store's numbers (AGENTS.md rule 4: business numbers come from the DB only)
  const activeSplit = isLive ? liveSplit : split;

  const omzetKotor = isLive
    ? Number(liveRecap?.totals?.gross_rp ?? 0)
    : data.reduce((s, d) => s + d.omzet, 0);
  const penjualanBersih = isLive
    ? Number(liveRecap?.totals?.net_rp ?? 0)
    : Math.round(omzetKotor * 0.934);
  const transaksi = isLive
    ? Number(liveRecap?.totals?.orders ?? 0)
    : data.reduce((s, d) => s + d.transaksi, 0);
  const rataHarian = omzetKotor / period;
  const staleChannels = isLive ? [] : DATA_FRESHNESS.filter((c) => c.daysAgo > 7);
  // Live: peringatan stale/partial dari backend (sebelumnya tidak pernah ditampilkan)
  const liveWarnings = isLive ? (liveRecap?.warnings ?? []).map((w) => w.message).filter(Boolean) : [];

  return (
    <div className="page">
      <header className="page-head" data-reveal>
        <p className="kicker"><b>{dashboard.sales.kicker}</b></p>
        <h1 className="page-title">{dashboard.sales.title}</h1>
        <div className="period-selector" role="tablist" aria-label="Pilih periode">
          {PERIODS.map((p) => (
            <button key={p} role="tab" aria-selected={period === p}
              className={`period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
              <span className="num">{p}</span> hari
            </button>
          ))}
        </div>
      </header>

      {/* Coverage Banner — hanya jika ada data atau di mode demo */}
      {(!isLive || transaksi > 0) && (
        <div className="coverage-banner" role="status" data-reveal>
          <IconWarning size={18} />
          <div>
            {staleChannels.length > 0 && (
              <p>
                {dashboard.sales.coverageStale(staleChannels.map((c) => c.channel).join(', '), staleChannels[0].daysAgo)}
              </p>
            )}
            {liveWarnings.map((m) => <p key={m}>{m}</p>)}
            <p>
              {dashboard.sales.coverageTemp}
            </p>
          </div>
        </div>
      )}

      <section className="kpi-strip" data-reveal="kids" aria-label="Ringkasan omzet">
        <div className="kpi">
          <span className="kpi-label">{dashboard.sales.kpi.gross}</span>
          <Num strong key={period}>{fmtIDR(omzetKotor)}</Num>
          <span className="kpi-sub">{dashboard.sales.kpi.grossSub(period)}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{dashboard.sales.kpi.net}</span>
          <Num strong key={period}>{fmtIDR(penjualanBersih)}</Num>
          <span className="kpi-sub">{dashboard.sales.kpi.netSub}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{dashboard.sales.kpi.orders}</span>
          <Num strong key={period}>{fmtNum(transaksi)}</Num>
          <span className="kpi-sub">{dashboard.sales.kpi.ordersSub}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{dashboard.sales.kpi.dailyAvg}</span>
          <Num strong key={period}>{fmtIDR(rataHarian)}</Num>
          <span className="kpi-sub">{dashboard.sales.kpi.dailyAvgSub}</span>
        </div>
      </section>

      {recapError ? (
        <ApiErrorNote text={dashboard.sales.errorTitle(recapError)} message={recapError} onRetry={fetchRecap}
          retryLabel={dashboard.common.retry} style={{ marginTop: '14px' }} />
      ) : isLive && transaksi === 0 ? (
        <div className="stock-empty" data-reveal style={{ marginTop: '14px' }}>
          <p>{dashboard.sales.emptyLiveTitle(period)}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {dashboard.sales.emptyLiveDesc}
          </p>
        </div>
      ) : (
        <>
          <section aria-labelledby="tren">
            <h2 id="tren" className="section-title">{dashboard.sales.trendTitle}</h2>
            {isLive && liveTrendData.length < 2 ? (
              <p className="stock-empty">{dashboard.sales.trendEmpty}</p>
            ) : (
              <TrendChart period={period} customData={isLive ? liveTrendData : null} />
            )}
          </section>

          <section aria-labelledby="per-channel">
            <h2 id="per-channel" className="section-title">{dashboard.sales.channelTitle}</h2>
            {activeSplit.length === 0 && (
              <p className="stock-empty">{dashboard.sales.channelEmpty}</p>
            )}
            <ul className="channel-split" data-reveal="kids">
              {activeSplit.map((c) => (
                <li key={`${period}-${c.channel}`} className="channel-row">
                  <span className="channel-name">{c.channel}</span>
                  <span className="channel-bar" aria-hidden="true">
                    <span className="channel-bar-fill" style={{ width: `${c.share}%` }} />
                  </span>
                  <span className="channel-figs">
                    <Num strong>{fmtIDR(c.omzet)}</Num>
                    <Num>{fmtNum1(c.share)}%</Num>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
