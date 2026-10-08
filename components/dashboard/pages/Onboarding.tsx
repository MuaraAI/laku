// Halaman Onboarding (first time user): wizard langkah demi langkah —
// pilih channel → panduan upload per channel → upload awal → konfirmasi
// lead time (badge "asumsi") → saldo awal stok (opsional, bisa skip) → dashboard.

import { useRef, useState } from 'react';
import { apiFetch, apiUpload, validateUploadFile } from '@/lib/api';
import { dashboard } from '@/constants/id';
import { CHANNELS, UPLOAD_GUIDE, DEFAULT_LEAD_TIME_DAYS, type Channel } from '../data';
import { AssumsiBadge } from '../components';
import { IconChevron, IconUpload, IconWarning, IconCheck } from '../icons';

const STEP_TITLES = dashboard.onboarding.stepTitles;

export function OnboardingPage({ onFinish, mode = 'demo' }: { onFinish: () => void; mode?: 'demo' | 'live' }) {
  const [step, setStep] = useState(0);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // kept as text while typing so the field can be cleared; parsed and clamped to 1–60 on confirm
  const [leadTimeDraft, setLeadTimeDraft] = useState(String(DEFAULT_LEAD_TIME_DAYS));
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [stockSku, setStockSku] = useState('');
  const [stockName, setStockName] = useState('');
  const [stockDraft, setStockDraft] = useState('');
  const leadTimeNum = Number.parseInt(leadTimeDraft, 10);
  const leadTimeValid = Number.isFinite(leadTimeNum) && leadTimeNum >= 1 && leadTimeNum <= 60;
  const leadTime = leadTimeValid ? leadTimeNum : DEFAULT_LEAD_TIME_DAYS;
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    const invalid = validateUploadFile(file);
    if (invalid) {
      setUploadError(invalid);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setFileName(file.name);
    setUploading(true);
    setUploadError(null);

    if (mode === 'live') {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('channel', channel === 'Shopee' ? 'shopee' : channel === 'TikTok Shop' ? 'tiktok_shop' : 'tokopedia');
      const res = await apiUpload<{ import_batch_id: string }>('/v1/imports', formData);
      // the file is only in the store once the batch is confirmed; a failed confirm is not a success
      const confirmRes = res.data
        ? await apiFetch(`/v1/imports/${res.data.import_batch_id}/confirm`, { method: 'POST' })
        : null;
      setUploading(false);
      const error = res.error ?? confirmRes?.error ?? null;
      if (error) {
        setUploadError(error);
        if (fileRef.current) fileRef.current.value = '';
        return;
      }
      setUploaded(true);
      return;
    }

    // mode === 'demo'
    window.setTimeout(() => {
      setUploading(false);
      setUploaded(true);
    }, 1200);
  }

  // "Pakai asumsi dulu" keeps the default and saves nothing; only an explicit confirm writes the seller's lead time
  async function handleConfirmLeadTime(isConfirmed: boolean) {
    setStepError(null);
    if (isConfirmed && !leadTimeValid) return setStepError(dashboard.onboarding.step4.errRange);
    if (isConfirmed && mode === 'live') {
      setSaving(true);
      const res = await apiFetch('/v1/me/settings', {
        method: 'POST',
        body: JSON.stringify({ lead_time_days: leadTime }),
      });
      setSaving(false);
      if (res.error) return setStepError(`Lead time belum tersimpan: ${res.error}`);
    }
    if (!isConfirmed) setLeadTimeDraft(String(DEFAULT_LEAD_TIME_DAYS));
    setConfirmed(isConfirmed);
    setStep(4);
  }

  // opening stock belongs to a real SKU the seller names; never a placeholder product
  async function handleConfirmStock() {
    setStepError(null);
    const qty = Number.parseInt(stockDraft, 10);
    const sku = stockSku.trim();
    const name = stockName.trim() || sku;
    if (!sku || !Number.isFinite(qty) || qty < 0) return setStepError(dashboard.onboarding.step5.errValidation);
    if (mode === 'live') {
      setSaving(true);
      const res = await apiFetch('/v1/stock/opening', {
        method: 'POST',
        body: JSON.stringify({ name, sku, qty }),
      });
      setSaving(false);
      if (res.error) return setStepError(`Saldo awal belum tersimpan: ${res.error}`);
    }
    setStep(5);
  }

  const stepErrorNote = stepError && (
    <p className="negative-note onb-error" role="alert">
      <IconWarning size={15} />
      <span>{stepError}</span>
    </p>
  );

  return (
    <div className="page onboarding">
      <header className="page-head" data-reveal>
        <p className="kicker"><b>Setup awal</b></p>
        <h1 className="page-title">{dashboard.onboarding.title}</h1>
        <p className="page-sub">{dashboard.onboarding.sub}</p>
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
            <h2 className="step-title">{dashboard.onboarding.step1.title}</h2>
            <p className="step-sub">{dashboard.onboarding.step1.sub}</p>
            <div className="channel-picker">
              {CHANNELS.map((c) => (
                <button key={c} className={`channel-opt${channel === c ? ' active' : ''}`} onClick={() => setChannel(c)}>{c}</button>
              ))}
            </div>
            <div className="wizard-actions">
              <button className="btn btn-primary" disabled={!channel} onClick={() => setStep(1)}>
                {dashboard.onboarding.step3.continue} <IconChevron size={15} />
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
              <button className="btn btn-ghost" onClick={() => setStep(0)}>{dashboard.common.back}</button>
              <button className="btn btn-primary" onClick={() => setStep(2)}>Sudah punya filenya <IconChevron size={15} /></button>
            </div>
          </section>
        )}

        {step === 2 && channel && (
          <section>
            <h2 className="step-title">{dashboard.onboarding.step3.title}</h2>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" className="visually-hidden"
              aria-label={dashboard.onboarding.step3.title}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
            {uploading ? (
              <div className="skeleton-block" aria-busy="true" aria-live="polite">
                <div className="sk sk-line w60" />
                <div className="sk sk-row" />
                <div className="sk sk-row short" />
              </div>
            ) : uploaded ? (
              <p className="done-note"><span className="num num-left">{fileName}</span> {mode === 'live' ? dashboard.onboarding.step3.doneLive(fileName) : dashboard.onboarding.step3.doneDemo(fileName)}</p>
            ) : (
              <button className="dropzone" onClick={() => fileRef.current?.click()}>
                <IconUpload size={20} />
                <span>{dashboard.onboarding.step3.pickTitle(channel)}</span>
                <small>{dashboard.onboarding.step3.maxHint}</small>
              </button>
            )}
            {uploadError && (
              <p className="negative-note" style={{ marginTop: '10px', color: 'var(--critical)', background: 'var(--critical-bg)', padding: '10px 14px', borderRadius: 'var(--r-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }} role="alert">
                <IconWarning size={15} />
                <span>{uploadError}</span>
              </p>
            )}
            <div className="wizard-actions">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>{dashboard.common.back}</button>
              <button className="btn btn-ghost" onClick={() => setStep(3)}>{dashboard.onboarding.step3.skip}</button>
              <button className="btn btn-primary" disabled={!uploaded} onClick={() => setStep(3)}>
                {dashboard.onboarding.step3.continue} <IconChevron size={15} />
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="step-title">{dashboard.onboarding.step4.title}</h2>
            <p className="step-sub">
              {dashboard.onboarding.step4.sub}
            </p>
            <div className="leadtime-box">
              <label className="field">
                <span className="field-label">{dashboard.onboarding.step4.label} {!confirmed && <AssumsiBadge />}</span>
                <input type="number" inputMode="numeric" min={1} max={60} value={leadTimeDraft}
                  onChange={(e) => { setLeadTimeDraft(e.target.value); setStepError(null); }}
                  className="input num" aria-describedby="lt-hint" aria-invalid={!leadTimeValid} />
              </label>
              <p id="lt-hint" className="form-hint">
                {dashboard.onboarding.step4.hint(DEFAULT_LEAD_TIME_DAYS)}
              </p>
            </div>
            {stepErrorNote}
            <div className="wizard-actions">
              <button className="btn btn-ghost" onClick={() => { setStepError(null); setStep(2); }}>{dashboard.common.back}</button>
              <button className="btn btn-ghost" onClick={() => handleConfirmLeadTime(false)} disabled={saving}>{dashboard.onboarding.step4.assumeBtn}</button>
              <button className="btn btn-primary" onClick={() => handleConfirmLeadTime(true)} disabled={saving || !leadTimeValid} aria-busy={saving}>
                {saving ? dashboard.common.saving : <>{dashboard.onboarding.step4.confirmBtn(leadTime)} <IconChevron size={15} /></>}
              </button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <h2 className="step-title">{dashboard.onboarding.step5.title} <span className="chip chip-opsional">{dashboard.onboarding.step5.optionalChip}</span></h2>
            <p className="step-sub">
              {dashboard.onboarding.step5.sub}
            </p>
            <div className="onb-stock-fields">
              <label className="field">
                <span className="field-label">{dashboard.onboarding.step5.skuLabel}</span>
                <input type="text" value={stockSku} placeholder={dashboard.onboarding.step5.skuPlaceholder} autoCapitalize="characters" spellCheck={false}
                  onChange={(e) => { setStockSku(e.target.value); setStepError(null); }} className="input num" />
              </label>
              <label className="field">
                <span className="field-label">{dashboard.onboarding.step5.nameLabel} <span className="chip chip-opsional">{dashboard.onboarding.step5.optionalChip}</span></span>
                <input type="text" value={stockName} placeholder={dashboard.onboarding.step5.namePlaceholder}
                  onChange={(e) => setStockName(e.target.value)} className="input" />
              </label>
              <label className="field">
                <span className="field-label">{dashboard.onboarding.step5.qtyLabel}</span>
                <input type="number" inputMode="numeric" min={0} value={stockDraft} placeholder="0"
                  onChange={(e) => { setStockDraft(e.target.value); setStepError(null); }} className="input num" />
              </label>
            </div>
            {stepErrorNote}
            <div className="wizard-actions">
              <button className="btn btn-ghost" onClick={() => { setStepError(null); setStep(3); }}>{dashboard.common.back}</button>
              <button className="btn btn-ghost" onClick={() => { setStepError(null); setStep(5); }}>{dashboard.onboarding.step5.skipBtn}</button>
              <button className="btn btn-primary" onClick={handleConfirmStock} disabled={saving} aria-busy={saving}>
                {saving ? dashboard.common.saving : <>{dashboard.onboarding.step5.saveBtn} <IconChevron size={15} /></>}
              </button>
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="wizard-finish">
            <div className="finish-icon" aria-hidden="true">
              <IconCheck size={40} />
            </div>
            <h2 className="step-title">{dashboard.onboarding.step6.title}</h2>
            <p className="step-sub">
              {dashboard.onboarding.step6.sub}
            </p>
            <div className="wizard-actions">
              <button className="btn btn-primary btn-lg" onClick={onFinish}>{dashboard.onboarding.step6.finishBtn}</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
