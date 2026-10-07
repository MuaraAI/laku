// Halaman Upload: pilih channel → pilih CSV/XLSX → skeleton loader →
// preview ringkasan → Konfirmasi. (MVP: parsing disimulasikan di frontend.)

import { useRef, useState, useEffect } from 'react';
import { apiFetch, apiUpload, validateUploadFile } from '@/lib/api';
import { dashboard } from '@/constants/id';
import { CHANNELS, mockPreview, fmtNum, fmtNum1, type Channel, type UploadPreview } from '../data';
import { Num } from '../components';
import { IconFile, IconUpload, IconWarning } from '../icons';

type Phase = 'idle' | 'loading' | 'preview' | 'done';

interface LiveUploadResponse {
  import_batch_id: string;
  rows_read?: number;
  new?: number;
  problem_rows?: number;
  sku_fill_rate?: number | null;
}

export function UploadPage({ mode = 'demo', onUploaded }: { mode?: 'demo' | 'live'; onUploaded?: () => void }) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [fileName, setFileName] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [preview, setPreview] = useState<UploadPreview | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const navTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => { window.clearTimeout(timerRef.current); window.clearTimeout(navTimerRef.current); }, []);

  // a failed attempt must leave the picker empty, otherwise choosing the same (fixed) file again fires no change event
  function failUpload(msg: string) {
    setUploadError(msg);
    setPhase('idle');
    if (fileRef.current) fileRef.current.value = '';
  }

  function pickFile() {
    if (!channel) return;
    fileRef.current?.click();
  }

  async function onFile(file: File | undefined) {
    if (!channel || !file) return;
    // cek di browser dulu (A14) — tidak perlu nunggu upload 10 MB untuk tahu file salah
    const invalid = validateUploadFile(file);
    if (invalid) return failUpload(invalid);
    const name = file.name;
    setFileName(name);
    setPhase('loading');
    setPreview(null);
    setUploadError(null);

    if (mode === 'live') {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('channel', channel === 'Shopee' ? 'shopee' : channel === 'TikTok Shop' ? 'tiktok_shop' : 'tokopedia');
      const res = await apiUpload<LiveUploadResponse>('/v1/imports', formData);
      if (res.error || !res.data) return failUpload(res.error ?? dashboard.upload.defaultActionNote);
      const data = res.data;
      // respons upload hanya membawa JUMLAH baris bermasalah; daftarnya ada di /problems
      let problems: UploadPreview['problems'] = [];
      if ((data.problem_rows ?? 0) > 0) {
        const pr = await apiFetch<{ problems?: { row?: number; column?: string; reason?: string }[] }>(
          `/v1/imports/${data.import_batch_id}/problems`,
        );
        problems = (pr.data?.problems ?? []).slice(0, 50).map((p) => ({
          row: typeof p.row === 'number' ? p.row : 0,
          issue: String(p.reason || 'Baris bermasalah'),
          action: dashboard.upload.defaultActionNote,
        }));
      }
      setBatchId(data.import_batch_id);
      setPreview({
        channel,
        fileName: name,
        rowsRead: data.rows_read ?? 0,
        rowsNew: data.new ?? 0,
        skuFillRate: data.sku_fill_rate != null ? Math.round(data.sku_fill_rate * 1000) / 10 : 100,
        problems,
      });
      setPhase('preview');
      return;
    }

    // Default Demo Simulation
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setPreview(mockPreview(channel, name));
      setPhase('preview');
    }, 1400);
  }

  async function confirm() {
    if (mode === 'live' && batchId) {
      setConfirming(true);
      setUploadError(null);
      const res = await apiFetch(`/v1/imports/${batchId}/confirm`, { method: 'POST' });
      setConfirming(false);
      if (res.error) return setUploadError(res.error);
    }
    setPhase('done');
    if (onUploaded) {
      navTimerRef.current = window.setTimeout(onUploaded, 1800);
    }
  }

  function reset() {
    window.clearTimeout(timerRef.current);
    window.clearTimeout(navTimerRef.current);
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
            <h2 className="step-title">{dashboard.upload.step1Title}</h2>
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
            <h2 className="step-title">{dashboard.upload.step2Title}</h2>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" className="visually-hidden"
              onChange={(e) => onFile(e.target.files?.[0])} />
            <button className="dropzone" onClick={pickFile} disabled={!channel}>
              <IconUpload size={20} />
              <span>{channel ? dashboard.upload.pickPrompt : dashboard.upload.pickWait}</span>
              <small>{fileName || dashboard.upload.pickHint}</small>
            </button>
            {!channel && <p className="form-hint">{dashboard.upload.pickWarn}</p>}
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
              <h2 className="step-title">{dashboard.upload.step3Loading}</h2>
              {/* rute + paket ala landing: ceritakan pipeline, bukan spinner */}
              <div className="route" aria-hidden="true">
                <span className="pin"><IconFile size={16} /> {fileName || 'CSV / XLSX'}</span>
                <span className="track"><span className="packet" /></span>
                <span className="pin to">{dashboard.upload.step3Target}</span>
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
              <h2 className="step-title">{dashboard.upload.previewTitle}</h2>
              <p className="preview-file"><IconFile size={15} /> <span className="num num-left">{preview.fileName}</span> · {preview.channel}</p>
              <div className="kpi-strip kpi-compact">
                <div className="kpi"><span className="kpi-label">{dashboard.upload.kpiRowsRead}</span><Num strong>{fmtNum(preview.rowsRead)}</Num></div>
                <div className="kpi"><span className="kpi-label">{dashboard.upload.kpiRowsNew}</span><Num strong>{fmtNum(preview.rowsNew)}</Num></div>
                <div className="kpi"><span className="kpi-label">{dashboard.upload.kpiSkuFillRate}</span><Num strong>{fmtNum1(preview.skuFillRate)}%</Num></div>
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
                <button className="btn btn-primary" onClick={confirm} disabled={confirming} aria-busy={confirming}>{confirming ? dashboard.common.saving : dashboard.upload.confirmBtn}</button>
                <button className="btn btn-ghost" onClick={reset}>{dashboard.upload.cancelBtn}</button>
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
