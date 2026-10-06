// Halaman Penjualan (Recap): period selector 7/30/90 hari, trend chart,
// ringkasan omzet, dan Coverage Banner untuk data usang/parsial.

import { useMemo, useState } from 'react';
import { SALES, CHANNEL_SPLIT, DATA_FRESHNESS, fmtIDR, fmtNum, fmtNum1 } from '../data';
import { Num, SementaraChip } from '../components';
import { IconWarning } from '../icons';

type Period = 7 | 30 | 90;
const PERIODS: Period[] = [7, 30, 90];

function TrendChart({ period }: { period: Period }) {
  const data = SALES[period];
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 240, PL = 8, PR = 8, PT = 16, PB = 28;
  const max = Math.max(...data.map((d) => d.omzet));
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
      <svg viewBox={`0 0 ${W} ${H}`} className="trend-chart" role="img"
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
        <path d={line} className="chart-line" />
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
            <span className="chart-readout-sub"><Num>{fmtNum(hov.transaksi)}</Num> transaksi {hov.sementara && <SementaraChip />}</span>
          </>
        ) : (
          <span className="chart-readout-hint">Sentuh atau arahkan ke grafik untuk lihat angka harian.</span>
        )}
      </div>
    </div>
  );
}

export function PenjualanPage() {
  const [period, setPeriod] = useState<Period>(30);
  const data = SALES[period];
  const split = CHANNEL_SPLIT[period];

  const omzetKotor = data.reduce((s, d) => s + d.omzet, 0);
  const penjualanBersih = Math.round(omzetKotor * 0.934); // setelah potongan & retur
  const transaksi = data.reduce((s, d) => s + d.transaksi, 0);
  const rataHarian = omzetKotor / period;
  const staleChannels = DATA_FRESHNESS.filter((c) => c.daysAgo > 7);

  return (
    <div className="page">
      <header className="page-head" data-reveal>
        <p className="kicker"><b>Recap penjualan</b></p>
        <h1 className="page-title">Penjualan</h1>
        <div className="period-selector" role="tablist" aria-label="Pilih periode">
          {PERIODS.map((p) => (
            <button key={p} role="tab" aria-selected={period === p}
              className={`period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
              <span className="num">{p}</span> hari
            </button>
          ))}
        </div>
      </header>

      {/* Coverage Banner — wajib ada: peringatan data usang/parsial */}
      <div className="coverage-banner" role="status" data-reveal>
        <IconWarning size={18} />
        <div>
          {staleChannels.length > 0 && (
            <p>
              Data <strong>{staleChannels.map((c) => c.channel).join(', ')}</strong> usang
              {' '}<Num>{fmtNum(staleChannels[0].daysAgo)}</Num> hari — unggah ulang laporan supaya rekomendasi restock akurat.
            </p>
          )}
          <p>
            Transaksi <span className="num">7</span> hari terakhir masih <SementaraChip /> — angka bisa berubah
            karena pesanan belum selesai, retur, atau pembatalan.
          </p>
        </div>
      </div>

      <section className="kpi-strip" data-reveal="kids" aria-label="Ringkasan omzet">
        <div className="kpi">
          <span className="kpi-label">Omzet kotor</span>
          <Num strong>{fmtIDR(omzetKotor)}</Num>
          <span className="kpi-sub">{period} hari terakhir, semua channel</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Penjualan bersih</span>
          <Num strong>{fmtIDR(penjualanBersih)}</Num>
          <span className="kpi-sub">Setelah potongan platform &amp; retur</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Transaksi</span>
          <Num strong>{fmtNum(transaksi)}</Num>
          <span className="kpi-sub">Pesanan tercatat</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">Rata-rata harian</span>
          <Num strong>{fmtIDR(rataHarian)}</Num>
          <span className="kpi-sub">Omzet kotor per hari</span>
        </div>
      </section>

      <section aria-labelledby="tren">
        <h2 id="tren" className="section-title">Tren omzet kotor</h2>
        <TrendChart period={period} />
      </section>

      <section aria-labelledby="per-channel">
        <h2 id="per-channel" className="section-title">Per channel</h2>
        <ul className="channel-split" data-reveal="kids">
          {split.map((c) => (
            <li key={c.channel} className="channel-row">
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
    </div>
  );
}
