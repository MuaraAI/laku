// Halaman Onboarding (first time user): wizard langkah demi langkah —
// pilih channel → panduan upload per channel → upload awal → konfirmasi
// lead time (badge "asumsi") → saldo awal stok (opsional, bisa skip) → dashboard.

import Image from 'next/image';
import { useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { CHANNELS, UPLOAD_GUIDE, DEFAULT_LEAD_TIME_DAYS, fmtNum, type Channel } from '../data';
import { AssumsiBadge } from '../components';
import { IconChevron, IconUpload, IconWarning } from '../icons';

const STEP_TITLES = ['Channel', 'Panduan upload', 'Upload awal', 'Lead time', 'Saldo awal stok', 'Selesai'];

export function OnboardingPage({ onFinish, mode = 'demo' }: { onFinish: () => void; mode?: 'demo' | 'live' }) {
  const [step, setStep] = useState(0);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [leadTime, setLeadTime] = useState(DEFAULT_LEAD_TIME_DAYS);
  const [confirmed, setConfirmed] = useState(false);
  const [stockDraft, setStockDraft] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    setFileName(file.name);
    setUploading(true);
    setUploadError(null);

    if (mode === 'live') {
      try {
        const { supabaseBrowser } = await import('@/lib/supabase/client');
        const supabase = supabaseBrowser();
        const token = (await supabase?.auth.getSession())?.data.session?.access_token;
        const formData = new FormData();
        formData.append('file', file);
        const chKey = channel === 'Shopee' ? 'shopee' : channel === 'TikTok Shop' ? 'tiktok_shop' : 'tokopedia';
        formData.append('channel', chKey);

        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.muaraai.com';
        const url = API_BASE.includes('api.muaraai.com')
          ? `${API_BASE}/v1/laku/v1/imports`
          : `${API_BASE}/v1/imports`;

        const res = await fetch(url, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          const confirmUrl = API_BASE.includes('api.muaraai.com')
            ? `${API_BASE}/v1/laku/v1/imports/${data.import_batch_id}/confirm`
            : `${API_BASE}/v1/imports/${data.import_batch_id}/confirm`;
          await fetch(confirmUrl, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setUploaded(true);
        } else {
          const errData = await res.json().catch(() => null);
          setUploadError(errData?.detail?.error?.message || 'Gagal membaca file di server.');
        }
      } catch {
        setUploadError('Koneksi ke backend gagal.');
      } finally {
        setUploading(false);
      }
      return;
    }

    // mode === 'demo'
    window.setTimeout(() => {
      setUploading(false);
      setUploaded(true);
    }, 1200);
  }

  function handleConfirmLeadTime(isConfirmed: boolean) {
    setConfirmed(isConfirmed);
    if (mode === 'live') {
      apiFetch('/v1/me/settings', {
        method: 'POST',
        body: JSON.stringify({ lead_time_days: leadTime }),
      });
    }
    setStep(4);
  }

  function handleConfirmStock() {
    if (mode === 'live' && stockDraft.trim()) {
      const qty = parseInt(stockDraft, 10);
      if (!isNaN(qty) && qty > 0) {
        apiFetch('/v1/stock/opening', {
          method: 'POST',
          body: JSON.stringify({ name: 'Produk Utama', sku: 'SKU-01', qty }),
        });
      }
    }
    setStep(5);
  }

  return (
    <div className="page onboarding">
      <header className="page-head" data-reveal>
        <p className="kicker"><b>Setup awal</b></p>
        <h1 className="page-title">Kenalkan, ini Laku</h1>
        <p className="page-sub">Enam langkah singkat supaya Laku bisa mulai menyarankan restock dari data penjualanmu.</p>
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
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
            {uploading ? (
              <div className="skeleton-block" aria-busy="true" aria-live="polite">
                <div className="sk sk-line w60" />
                <div className="sk sk-row" />
                <div className="sk sk-row short" />
              </div>
            ) : uploaded ? (
              <p className="done-note"><span className="num num-left">{fileName}</span> {mode === 'live' ? 'berhasil diimpor ke tokomu.' : 'terbaca. Preview lengkap bisa dicek di halaman Upload.'}</p>
            ) : (
              <button className="dropzone" onClick={() => fileRef.current?.click()}>
                <IconUpload size={20} />
                <span>Pilih file CSV / XLSX dari {channel}</span>
                <small>Maksimal 90 hari riwayat pesanan</small>
              </button>
            )}
            {uploadError && (
              <p className="negative-note" style={{ marginTop: '10px', color: 'var(--critical)', background: 'var(--critical-bg)', padding: '10px 14px', borderRadius: 'var(--r-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }} role="alert">
                <IconWarning size={15} />
                <span>{uploadError}</span>
              </p>
            )}
            <div className="wizard-actions">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>Kembali</button>
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
              <button className="btn btn-ghost" onClick={() => setStep(2)}>Kembali</button>
              <button className="btn btn-ghost" onClick={() => handleConfirmLeadTime(false)}>Pakai asumsi dulu</button>
              <button className="btn btn-primary" onClick={() => handleConfirmLeadTime(true)}>
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
              <button className="btn btn-ghost" onClick={() => setStep(3)}>Kembali</button>
              <button className="btn btn-ghost" onClick={() => setStep(5)}>Skip, isi nanti</button>
              <button className="btn btn-primary" onClick={handleConfirmStock}>Simpan &amp; lanjut <IconChevron size={15} /></button>
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
