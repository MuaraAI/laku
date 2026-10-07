// Halaman Upload: pilih channel → pilih CSV/XLSX → skeleton loader →
// preview ringkasan → Konfirmasi. (MVP: parsing disimulasikan di frontend.)

import { useRef, useState } from 'react';
import { CHANNELS, mockPreview, fmtNum, fmtNum1, type Channel, type UploadPreview } from '../data';
import { Num } from '../components';
import { IconFile, IconUpload, IconWarning } from '../icons';

type Phase = 'idle' | 'loading' | 'preview' | 'done';

export function UploadPage({ mode = 'demo', onUploaded }: { mode?: 'demo' | 'live'; onUploaded?: () => void }) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [fileName, setFileName] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [preview, setPreview] = useState<UploadPreview | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile() {
    if (!channel) return;
    fileRef.current?.click();
  }

  async function onFile(name: string) {
    if (!channel || !name) return;
    setFileName(name);
    setPhase('loading');
    setPreview(null);
    setUploadError(null);

    const file = fileRef.current?.files?.[0];
    if (mode === 'live' && file) {
      try {
        const { supabaseBrowser } = await import('@/lib/supabase/client');
        const supabase = supabaseBrowser();
        const session = (await supabase?.auth.getSession())?.data.session;
        const token = session?.access_token;

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
          setBatchId(data.import_batch_id);
          setPreview({
            channel,
            fileName: name,
            rowsRead: data.rows_read ?? 0,
            rowsNew: data.new ?? 0,
            skuFillRate: data.sku_fill_rate ? Math.round(data.sku_fill_rate * 100) : 100,
            problems: (data.problems || []).map((p: Record<string, unknown>) => ({
              row: typeof p.row === 'number' ? p.row : 0,
              issue: String(p.reason || p.problem || 'Baris bermasalah'),
              action: 'Periksa format baris dan unggah ulang.',
            })),
          });
          setPhase('preview');
          return;
        } else {
          const errData = await res.json().catch(() => null);
          const msg = errData?.detail?.error?.message || errData?.error?.message || 'Gagal membaca file di server backend.';
          setUploadError(msg);
          setPhase('idle');
          return;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Koneksi error';
        setUploadError('Koneksi ke backend gagal: ' + msg);
        setPhase('idle');
        return;
      }
    }

    // Default Demo Simulation
    window.setTimeout(() => {
      setPreview(mockPreview(channel, name));
      setPhase('preview');
    }, 1400);
  }

  async function confirm() {
    if (mode === 'live' && batchId) {
      setConfirming(true);
      try {
        const { supabaseBrowser } = await import('@/lib/supabase/client');
        const supabase = supabaseBrowser();
        const token = (await supabase?.auth.getSession())?.data.session?.access_token;
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.muaraai.com';
        const url = API_BASE.includes('api.muaraai.com')
          ? `${API_BASE}/v1/laku/v1/imports/${batchId}/confirm`
          : `${API_BASE}/v1/imports/${batchId}/confirm`;
        const res = await fetch(url, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          setUploadError(err?.detail?.error?.message || 'Gagal menyimpan data. Coba lagi.');
          setConfirming(false);
          return;
        }
      } catch {
        setUploadError('Koneksi ke server terputus saat menyimpan. Coba lagi.');
        setConfirming(false);
        return;
      }
      setConfirming(false);
    }
    setPhase('done');
    if (onUploaded) {
      window.setTimeout(onUploaded, 1800);
    }
  }

  function reset() {
    setPhase('idle'); setPreview(null); setFileName(''); setBatchId(null); setUploadError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="page">
      <header className="page-head" data-reveal>
        <p className="kicker"><b>Sinkron data</b></p>
        <h1 className="page-title">Upload</h1>
        <p className="page-sub">Unggah laporan penjualan per channel. Data pembeli (nama, HP, alamat) tidak pernah disimpan Laku.</p>
      </header>

      <ol className="upload-steps" data-reveal="kids">
        <li className={channel ? 'step done' : 'step active'}>
          <span className="step-no num">1</span>
          <div>
            <h2 className="step-title">Pilih channel</h2>
            <div className="channel-picker" role="radiogroup" aria-label="Pilih channel marketplace">
              {CHANNELS.map((c) => (
                <button key={c} role="radio" aria-checked={channel === c}
                  className={`channel-opt${channel === c ? ' active' : ''}`}
                  onClick={() => { setChannel(c); reset(); }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </li>

        <li className={phase !== 'idle' ? 'step done' : channel ? 'step active' : 'step'}>
          <span className="step-no num">2</span>
          <div>
            <h2 className="step-title">Pilih file CSV / XLSX</h2>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" className="visually-hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f.name); }} />
            <button className="dropzone" onClick={pickFile} disabled={!channel}>
              <IconUpload size={20} />
              <span>{channel ? 'Klik untuk pilih file laporan' : 'Pilih channel dulu di langkah 1'}</span>
              <small>{fileName || 'Maksimal 90 hari riwayat pesanan'}</small>
            </button>
            {!channel && <p className="form-hint">Pilih channel dulu supaya kolom file bisa dipetakan dengan benar.</p>}
            {uploadError && (
              <p className="negative-note" style={{ marginTop: '10px', color: 'var(--critical)', background: 'var(--critical-bg)', padding: '10px 14px', borderRadius: 'var(--r-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }} role="alert">
                <IconWarning size={15} />
                <span>{uploadError}</span>
              </p>
            )}
          </div>
        </li>

        {phase === 'loading' && (
          <li className="step active" aria-busy="true" aria-live="polite">
            <span className="step-no num">3</span>
            <div className="skeleton-block">
              <h2 className="step-title">Membaca file…</h2>
              {/* rute + paket ala landing: ceritakan pipeline, bukan spinner */}
              <div className="route" aria-hidden="true">
                <span className="pin"><IconFile size={16} /> {fileName || 'CSV / XLSX'}</span>
                <span className="track"><span className="packet" /></span>
                <span className="pin to">Saran restock</span>
              </div>
              <div className="sk sk-line w60" />
              <div className="sk sk-line w80" />
              <div className="sk sk-row" />
              <div className="sk sk-row" />
              <div className="sk sk-row short" />
            </div>
          </li>
        )}

        {phase === 'preview' && preview && (
          <li className="step active">
            <span className="step-no num">3</span>
            <div className="preview-block">
              <h2 className="step-title">Preview — cek dulu sebelum konfirmasi</h2>
              <p className="preview-file"><IconFile size={15} /> <span className="num num-left">{preview.fileName}</span> · {preview.channel}</p>
              <div className="kpi-strip kpi-compact">
                <div className="kpi"><span className="kpi-label">Baris dibaca</span><Num strong>{fmtNum(preview.rowsRead)}</Num></div>
                <div className="kpi"><span className="kpi-label">Baris baru</span><Num strong>{fmtNum(preview.rowsNew)}</Num></div>
                <div className="kpi"><span className="kpi-label">SKU fill rate</span><Num strong>{fmtNum1(preview.skuFillRate)}%</Num></div>
              </div>
              {preview.problems.length > 0 && (
                <div className="problem-table-wrap">
                  <h3 className="problem-title">Baris bermasalah (<span className="num">{preview.problems.length}</span>)</h3>
                  <table className="problem-table">
                    <thead><tr><th>Baris</th><th>Masalah</th><th>Yang bisa kamu lakukan</th></tr></thead>
                    <tbody>
                      {preview.problems.map((pr) => (
                        <tr key={pr.row}>
                          <td><Num>{fmtNum(pr.row)}</Num></td>
                          <td>{pr.issue}</td>
                          <td>{pr.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="preview-actions">
                <button className="btn btn-primary" onClick={confirm} disabled={confirming} aria-busy={confirming}>{confirming ? 'Menyimpan…' : 'Konfirmasi &amp; simpan'}</button>
                <button className="btn btn-ghost" onClick={reset}>Batal, ganti file</button>
              </div>
            </div>
          </li>
        )}

        {phase === 'done' && preview && (
          <li className="step done">
            <span className="step-no num">✓</span>
            <div>
              <h2 className="step-title">Tersimpan</h2>
              <p className="done-note">
                <Num>{fmtNum(preview.rowsNew)}</Num> baris baru dari {preview.channel} masuk ke hitungan.
                Rekomendasi restock sudah dihitung ulang — cek halaman Restock.
              </p>
              <button className="btn btn-ghost" onClick={reset}>Upload file lain</button>
            </div>
          </li>
        )}
      </ol>
    </div>
  );
}
