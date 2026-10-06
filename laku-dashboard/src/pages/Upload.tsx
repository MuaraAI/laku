// Halaman Upload: pilih channel → pilih CSV/XLSX → skeleton loader →
// preview ringkasan → Konfirmasi. (MVP: parsing disimulasikan di frontend.)

import { useRef, useState } from 'react';
import { CHANNELS, mockPreview, fmtNum, fmtNum1, type Channel, type UploadPreview } from '../data';
import { Num } from '../components';
import { IconFile, IconUpload } from '../icons';

type Phase = 'idle' | 'loading' | 'preview' | 'done';

export function UploadPage() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [fileName, setFileName] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [preview, setPreview] = useState<UploadPreview | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile() {
    if (!channel) return;
    fileRef.current?.click();
  }

  function onFile(name: string) {
    if (!channel || !name) return;
    setFileName(name);
    setPhase('loading');
    setPreview(null);
    // Simulasi baca file di server mock — skeleton tampil, bukan spinner.
    window.setTimeout(() => {
      setPreview(mockPreview(channel, name));
      setPhase('preview');
    }, 1400);
  }

  function confirm() {
    setPhase('done');
  }

  function reset() {
    setPhase('idle'); setPreview(null); setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">Sinkron data</p>
        <h1 className="page-title">Upload</h1>
        <p className="page-sub">Unggah laporan penjualan per channel. Data pembeli (nama, HP, alamat) tidak pernah disimpan Laku.</p>
      </header>

      <ol className="upload-steps">
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
          </div>
        </li>

        {phase === 'loading' && (
          <li className="step active" aria-busy="true" aria-live="polite">
            <span className="step-no num">3</span>
            <div className="skeleton-block">
              <h2 className="step-title">Membaca file…</h2>
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
                <button className="btn btn-primary" onClick={confirm}>Konfirmasi &amp; simpan</button>
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
