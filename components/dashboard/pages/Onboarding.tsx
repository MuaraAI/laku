// Halaman Onboarding (first time user): wizard langkah demi langkah —
// pilih channel → panduan upload per channel → upload awal → konfirmasi
// lead time (badge "asumsi") → saldo awal stok (opsional, bisa skip) → dashboard.

import Image from 'next/image';
import { useRef, useState } from 'react';
import { CHANNELS, UPLOAD_GUIDE, DEFAULT_LEAD_TIME_DAYS, fmtNum, type Channel } from '../data';
import { AssumsiBadge } from '../components';
import { IconChevron, IconUpload } from '../icons';

const STEP_TITLES = ['Channel', 'Panduan upload', 'Upload awal', 'Lead time', 'Saldo awal stok', 'Selesai'];

export function OnboardingPage({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [leadTime, setLeadTime] = useState(DEFAULT_LEAD_TIME_DAYS);
  const [confirmed, setConfirmed] = useState(false);
  const [stockDraft, setStockDraft] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function simulateUpload(name: string) {
    setFileName(name);
    setUploading(true);
    window.setTimeout(() => { setUploading(false); setUploaded(true); }, 1200);
  }

  return (
    <div className="page onboarding">
      <header className="page-head" data-reveal>
        <p className="kicker">Setup awal</p>
        <h1 className="page-title">Kenalkan, ini Laku</h1>
        <p className="page-sub">Lima langkah singkat supaya Laku bisa mulai menyarankan restock dari data penjualanmu.</p>
      </header>

      <nav className="wizard-dots" aria-label="Langkah onboarding">
        {STEP_TITLES.map((t, i) => (
          <span key={t} className={`dot${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
            aria-current={i === step ? 'step' : undefined} title={t} />
        ))}
        <span className="dot-label">Langkah <span className="num">{step + 1}</span> dari <span className="num">{STEP_TITLES.length}</span> — {STEP_TITLES[step]}</span>
      </nav>

      <div className="wizard-card" key={step}>
        {step === 0 && (
          <section>
            <h2 className="step-title">Jualan di mana saja?</h2>
            <p className="step-sub">Pilih channel utama dulu — channel lain bisa ditambah lewat halaman Upload nanti.</p>
            <div className="channel-picker">
              {CHANNELS.map((c) => (
                <button key={c} className={`channel-opt${channel === c ? ' active' : ''}`} onClick={() => setChannel(c)}>{c}</button>
              ))}
            </div>
            <div className="wizard-actions">
              <button className="btn btn-primary" disabled={!channel} onClick={() => setStep(1)}>
                Lanjut <IconChevron size={15} />
              </button>
            </div>
          </section>
        )}

        {step === 1 && channel && (
          <section>
            <h2 className="step-title">Cara ambil laporan dari {channel}</h2>
            <ol className="guide-list">
              {UPLOAD_GUIDE[channel].map((g) => <li key={g}>{g}</li>)}
            </ol>
            <div className="wizard-actions">
              <button className="btn btn-ghost" onClick={() => setStep(0)}>Kembali</button>
              <button className="btn btn-primary" onClick={() => setStep(2)}>Sudah punya filenya <IconChevron size={15} /></button>
            </div>
          </section>
        )}

        {step === 2 && channel && (
          <section>
            <h2 className="step-title">Upload laporan pertama</h2>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" className="visually-hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) simulateUpload(f.name); }} />
            {uploading ? (
              <div className="skeleton-block" aria-busy="true" aria-live="polite">
                <div className="sk sk-line w60" />
                <div className="sk sk-row" />
                <div className="sk sk-row short" />
              </div>
            ) : uploaded ? (
              <p className="done-note"><span className="num num-left">{fileName}</span> terbaca. Preview lengkap bisa dicek di halaman Upload.</p>
            ) : (
              <button className="dropzone" onClick={() => fileRef.current?.click()}>
                <IconUpload size={20} />
                <span>Pilih file CSV / XLSX dari {channel}</span>
                <small>Maksimal 90 hari riwayat pesanan</small>
              </button>
            )}
            <div className="wizard-actions">
              <button className="btn btn-ghost" onClick={() => setStep(3)}>Lewati dulu</button>
              <button className="btn btn-primary" disabled={!uploaded} onClick={() => setStep(3)}>
                Lanjut <IconChevron size={15} />
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="step-title">Konfirmasi lead time supplier</h2>
            <p className="step-sub">
              Lead time = lama barang tiba setelah kamu pesan ke supplier. Laku memakai angka ini untuk
              menghitung titik pesan ulang (ROP).
            </p>
            <div className="leadtime-box">
              <label className="field">
                <span className="field-label">Lead time (hari) {!confirmed && <AssumsiBadge />}</span>
                <input type="number" min={1} max={60} value={leadTime}
                  onChange={(e) => setLeadTime(Math.max(1, Number(e.target.value) || DEFAULT_LEAD_TIME_DAYS))}
                  className="input num" aria-describedby="lt-hint" />
              </label>
              <p id="lt-hint" className="form-hint">
                Default <span className="num">{DEFAULT_LEAD_TIME_DAYS}</span> hari adalah asumsi bawaan.
                Ganti sesuai kenyataan supplier-mu, lalu konfirmasi.
              </p>
            </div>
            <div className="wizard-actions">
              <button className="btn btn-ghost" onClick={() => { setConfirmed(false); setStep(4); }}>Pakai asumsi dulu</button>
              <button className="btn btn-primary" onClick={() => { setConfirmed(true); setStep(4); }}>
                Konfirmasi <span className="num">{fmtNum(leadTime)}</span> hari <IconChevron size={15} />
              </button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <h2 className="step-title">Saldo awal stok <span className="chip chip-opsional">opsional</span></h2>
            <p className="step-sub">
              Kalau kamu tahu stok fisik barang terlaris sekarang, isi di sini supaya saran restock
              langsung akurat. Bisa di-skip dan diisi belakangan.
            </p>
            <label className="field">
              <span className="field-label">Contoh: stok SKU terlaris (unit)</span>
              <input type="number" min={0} value={stockDraft} placeholder="0"
                onChange={(e) => setStockDraft(e.target.value)} className="input num" />
            </label>
            <div className="wizard-actions">
              <button className="btn btn-ghost" onClick={() => setStep(5)}>Skip, isi nanti</button>
              <button className="btn btn-primary" onClick={() => setStep(5)}>Simpan &amp; lanjut <IconChevron size={15} /></button>
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="wizard-finish">
            <Image className="crate-mini" src="/illustrations/stock-crates.svg" alt="" width={110} height={121} unoptimized />
            <h2 className="step-title">Siap. Dashboard restock-mu sudah menunggu.</h2>
            <p className="step-sub">
              Laku akan menandai barang yang harus <em>segera dipesan</em>, yang masih <em>aman</em>,
              dan yang sebaiknya <em>berhenti dibeli</em>. Unggah laporan rutin supaya angkanya tetap segar.
            </p>
            <div className="wizard-actions">
              <button className="btn btn-primary btn-lg" onClick={onFinish}>Masuk ke Dashboard</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
