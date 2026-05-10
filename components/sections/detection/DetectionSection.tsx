'use client';
import { useState } from 'react';
import { Download, Upload, Search, AlertCircle, Loader2, Info, HelpCircle } from 'lucide-react';
import { DETECTION_FEATURES, MERCHANT_CATEGORIES, CHANNELS, COUNTRIES } from '@/lib/constants';
import type { InputMethod, SelectedFeatures, FormData } from '@/types';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface DetectionSectionProps {
  inputMethod: InputMethod;
  setInputMethod: (method: InputMethod) => void;
  selectedFeatures: SelectedFeatures;
  onFeatureToggle: (feature: keyof SelectedFeatures) => void;
  uploadedFile: File | null;
  parsedData: any[] | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formData: FormData;
  onFormChange: (field: keyof FormData, value: string) => void;
  onDetection: () => Promise<void>;
  onDownloadTemplate: (format: 'csv' | 'xlsx') => void;
  isLoading: boolean;
  error: string | null;
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  color: '#111827',
  backgroundColor: '#ffffff',
  boxSizing: 'border-box' as const,
};

const labelStyle = {
  display: 'block' as const,
  fontSize: '14px',
  fontWeight: 600 as const,
  color: '#374151',
  marginBottom: '4px',
};

// ── Tooltip component ────────────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '6px', verticalAlign: 'middle' }}>
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 1, display: 'flex' }}
        aria-label="Info"
      >
        <HelpCircle size={14} color="#9ca3af" />
      </button>
      {open && (
        <span style={{
          position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#1f2937', color: '#f9fafb', fontSize: '12px', lineHeight: '1.5',
          padding: '8px 10px', borderRadius: '8px', whiteSpace: 'pre-wrap', width: '220px',
          zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          pointerEvents: 'none',
        }}>
          {text}
          <span style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '5px', borderStyle: 'solid', borderColor: '#1f2937 transparent transparent transparent' }} />
        </span>
      )}
    </span>
  );
}

// ── Security flag definitions ────────────────────────────────────────────────
const SECURITY_FIELDS = [
  {
    field: 'avs_match' as keyof FormData,
    label: 'AVS Match',
    yes: 'Cocok', no: 'Tidak Cocok',
    tooltip: 'Address Verification System (AVS): memverifikasi apakah alamat tagihan yang dimasukkan pembeli cocok dengan data yang tercatat di bank penerbit kartu.\n\n1 = Cocok (aman)\n0 = Tidak cocok (berisiko)',
  },
  {
    field: 'cvv_result' as keyof FormData,
    label: 'CVV Result',
    yes: 'Valid', no: 'Tidak Valid',
    tooltip: 'Card Verification Value (CVV): kode 3–4 digit di belakang kartu untuk membuktikan kartu fisik ada di tangan pembeli.\n\n1 = CVV valid\n0 = CVV salah atau tidak ada',
  },
  {
    field: 'three_ds_flag' as keyof FormData,
    label: '3DS Authenticated',
    yes: 'Ya', no: 'Tidak',
    tooltip: '3D Secure (3DS): protokol autentikasi tambahan (seperti OTP dari bank) sebelum transaksi disetujui.\n\n1 = Autentikasi 3DS berhasil\n0 = Tidak melalui 3DS',
  },
  {
    field: 'promo_used' as keyof FormData,
    label: 'Promo Digunakan',
    yes: 'Ya', no: 'Tidak',
    tooltip: 'Apakah transaksi ini menggunakan kode promo atau diskon.\n\n1 = Menggunakan promo\n0 = Tidak menggunakan promo',
  },
];

export function DetectionSection({
  inputMethod, setInputMethod,
  selectedFeatures, onFeatureToggle,
  uploadedFile, parsedData, onFileUpload,
  formData, onFormChange,
  onDetection, onDownloadTemplate,
  isLoading, error,
}: DetectionSectionProps) {
  const { ref, isVisible } = useScrollReveal(0.1);
  const selectedCount = Object.values(selectedFeatures).filter(Boolean).length;
  const totalCount    = Object.keys(selectedFeatures).length;
  const isDetectDisabled =
    isLoading ||
    (inputMethod === 'file'
      ? !parsedData || parsedData.length === 0
      : !formData.amount || !formData.merchant_category);

  const featureKeys = Object.keys(selectedFeatures) as (keyof SelectedFeatures)[];
  const col1 = featureKeys.slice(0, Math.ceil(featureKeys.length / 3));
  const col2 = featureKeys.slice(Math.ceil(featureKeys.length / 3), Math.ceil(featureKeys.length * 2 / 3));
  const col3 = featureKeys.slice(Math.ceil(featureKeys.length * 2 / 3));

  const isRequired = (k: keyof SelectedFeatures) => DETECTION_FEATURES.find(f => f.key === k)?.required === true;
  const handleSelectAll   = () => featureKeys.filter(k => !isRequired(k) && !selectedFeatures[k]).forEach(k => onFeatureToggle(k));
  const handleDeselectAll = () => featureKeys.filter(k => !isRequired(k) &&  selectedFeatures[k]).forEach(k => onFeatureToggle(k));

  return (
    <section
      id="detection"
      ref={ref}
      style={{ backgroundColor: '#f8fafc', padding: '120px 80px', fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}
    >
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-section {
          opacity: 0;
        }
        .animate-section.visible {
          animation: fadeInScale 0.6s ease-out forwards;
        }
        .instruction-box {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .instruction-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .mode-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .detect-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .detect-button:not(:disabled):hover {
          background-color: #15803d !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(22, 163, 74, 0.4);
        }
        .detect-button:not(:disabled):active {
          transform: translateY(0);
        }
      `}</style>

      <h2 className={`animate-section ${isVisible ? 'visible' : ''}`} style={{ fontSize: '48px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px', letterSpacing: '-0.5px' }}>
        Deteksi Transaksi
      </h2>

      {/* Disclaimer */}
      <div className={`animate-section ${isVisible ? 'visible' : ''}`} style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '16px', padding: '18px 24px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', animationDelay: '0.1s' }}>
        <div style={{ backgroundColor: '#ffedd5', borderRadius: '50%', padding: '8px', display: 'flex' }}>
          <Info size={22} color="#ea580c" />
        </div>
        <p style={{ fontSize: '15px', color: '#9a3412', margin: 0, fontWeight: '500' }}>
          <strong>Penting:</strong> Hasil prediksi SIGAP berbasis AI dan bisa mengalami kekeliruan. Harap lakukan verifikasi manual untuk keputusan krusial.
        </p>
      </div>

      {error && (
        <div className={`animate-section ${isVisible ? 'visible' : ''}`} style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', padding: '18px 24px', marginBottom: '32px', display: 'flex', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <AlertCircle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '15px', color: '#991b1b', margin: 0, fontWeight: '500' }}>{error}</p>
        </div>
      )}

      {/* Mode toggle */}
      <div className={`animate-section ${isVisible ? 'visible' : ''}`} style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px', animationDelay: '0.2s' }}>
        <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          {(['file', 'form'] as const).map((method) => (
            <button key={method} onClick={() => setInputMethod(method)} className="mode-button" style={{
              padding: '10px 28px', borderRadius: '10px', border: 'none',
              fontSize: '15px', fontWeight: inputMethod === method ? 700 : 500, cursor: 'pointer',
              backgroundColor: inputMethod === method ? '#ffffff' : 'transparent',
              color: inputMethod === method ? '#2563EB' : '#64748b',
              boxShadow: inputMethod === method ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' : 'none',
            }}>
              {method === 'file' ? 'Upload File' : 'Input Manual'}
            </button>
          ))}
        </div>
      </div>

      {/* ── FILE MODE ── */}
      {inputMethod === 'file' ? (
        <div className={`animate-section ${isVisible ? 'visible' : ''}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px', animationDelay: '0.3s' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Guide */}
            <div className="instruction-box" style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <HelpCircle size={24} color="#2563EB" />
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0 }}>Panduan Batch</h3>
              </div>
              <ol style={{ paddingLeft: '24px', margin: '0 0 24px', color: '#475569', fontSize: '15px', lineHeight: '2', listStyleType: 'decimal' }}>
                <li>Unduh template <strong>XLSX</strong> (disarankan) atau <strong>CSV</strong>.</li>
                <li>Lengkapi data transaksi sesuai format yang tersedia.</li>
                <li>Pastikan kolom <code>user_id</code> terisi (angka bulat).</li>
                <li>Unggah file dan klik <strong>&quot;Mulai Deteksi&quot;</strong>.</li>
              </ol>

              {/* Required columns */}
              <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: '#0369a1', margin: '0 0 6px', fontWeight: 700 }}>Kolom Wajib:</p>
                <p style={{ fontSize: '14px', color: '#0369a1', margin: 0, lineHeight: 1.5 }}>
                  <code>user_id</code> · <code>amount</code> (USD) · <code>merchant_category</code>
                </p>
              </div>

              {/* Categorical values */}
              <div style={{ backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '16px' }}>
                <p style={{ fontSize: '14px', color: '#6d28d9', margin: '0 0 10px', fontWeight: 700 }}>Nilai Valid:</p>
                <table style={{ width: '100%', fontSize: '13px', color: '#5b21b6', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #ede9fe' }}>
                      <td style={{ padding: '8px 0', fontWeight: 600, width: '120px' }}>Category</td>
                      <td style={{ padding: '8px 0' }}>electronics, travel, grocery, gaming, fashion</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #ede9fe' }}>
                      <td style={{ padding: '8px 0', fontWeight: 600 }}>Channel</td>
                      <td style={{ padding: '8px 0' }}>web, app</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', fontWeight: 600 }}>Country</td>
                      <td style={{ padding: '8px 0' }}>US, GB, FR, NL, TR, PL, RO, DE, ES, IT</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Template download */}
            <div className="instruction-box" style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>1. Unduh Template</h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px' }}>
                Gunakan template resmi agar format data terbaca sempurna.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {(['xlsx', 'csv'] as const).map((fmt) => (
                  <button key={fmt} onClick={() => onDownloadTemplate(fmt)}
                    style={{ backgroundColor: '#2563EB', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563EB'}>
                    <Download size={20} /> {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Feature selection */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '28px 32px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>2. Pilih Fitur</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Uncheck fitur yang tidak relevan</p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[['Select All', handleSelectAll], ['Deselect All', handleDeselectAll]].map(([lbl, fn]) => (
                  <button key={lbl as string} onClick={fn as () => void}
                    style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', color: '#374151', fontFamily: "'Inter', sans-serif" }}>
                    {lbl as string}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid #e5e7eb' }}>
                {[col1, col2, col3].map((col, ci) => (
                  <div key={ci} style={{ padding: '12px 16px 12px 0', borderRight: ci < 2 ? '1px solid #e5e7eb' : 'none', paddingLeft: ci > 0 ? '16px' : '0' }}>
                    {col.map((key) => {
                      const feat = DETECTION_FEATURES.find(f => f.key === key);
                      const isRequired = feat?.required === true;
                      return (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: isRequired ? 'not-allowed' : 'pointer', fontSize: '13px', color: isRequired ? '#6b7280' : '#374151' }}>
                          <input
                            type="checkbox"
                            checked={isRequired ? true : !!selectedFeatures[key]}
                            disabled={isRequired}
                            onChange={() => onFeatureToggle(key)}
                            style={{ accentColor: '#2563EB', width: '14px', height: '14px', cursor: isRequired ? 'not-allowed' : 'pointer' }}
                          />
                          {feat?.label ?? String(key)}
                          {isRequired && <span style={{ color: '#dc2626', fontWeight: 700, marginLeft: '2px' }}>*</span>}
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '13px', color: '#2563EB', marginTop: '12px', fontWeight: '500' }}>
                {selectedCount} dari {totalCount} fitur terpilih
              </p>
            </div>

            {/* File upload */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '28px 32px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>3. Unggah File</h3>
              <div style={{ border: '2px dashed #d1d5db', borderRadius: '10px', padding: '40px 24px', textAlign: 'center', backgroundColor: '#fafafa' }}>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={onFileUpload}
                  className="hidden" id="file-upload" disabled={isLoading} />
                <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                  {isLoading ? (
                    <Loader2 size={32} color="#2563EB" style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
                  ) : uploadedFile ? (
                    <>
                      <Upload size={32} color="#16a34a" style={{ margin: '0 auto 12px', display: 'block' }} />
                      <p style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600', margin: '0 0 4px' }}>{uploadedFile.name}</p>
                      {parsedData && <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{parsedData.length} transaksi berhasil dibaca</p>}
                    </>
                  ) : (
                    <>
                      <Upload size={32} color="#9ca3af" style={{ margin: '0 auto 12px', display: 'block' }} />
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px' }}>Drag and drop atau klik untuk memilih file</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>CSV atau XLSX</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── MANUAL MODE ── */
        <div className={`animate-section ${isVisible ? 'visible' : ''}`} style={{ maxWidth: '980px', margin: '0 auto 32px', animationDelay: '0.3s' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>Input Manual</h3>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Info size={18} color="#2563EB" />
                <p style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: 700 }}>Panduan Pengisian</p>
              </div>
              <ol style={{ paddingLeft: '24px', margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.8' }}>
                <li>Masukkan data transaksi tunggal yang ingin dianalisis.</li>
                <li>Atribut dengan tanda <span style={{ color: '#ef4444', fontWeight: 700 }}>*</span> bersifat wajib.</li>
                <li>Gunakan nilai default (kosongkan) jika data tidak tersedia.</li>
              </ol>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Row 1: User ID + Amount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>
                    User ID <span style={{ color: '#64748b', fontWeight: 400, fontSize: '13px' }}>(opsional)</span>
                    <Tooltip text={'ID pengguna dalam sistem (integer).\nJika kosong, dianggap transaksi anonim/baru.'} />
                  </label>
                  <input type="number" min={1} value={formData.user_id}
                    onChange={e => onFormChange('user_id', e.target.value)}
                    placeholder="Contoh: 1042"
                    style={{ ...inputStyle, padding: '12px 14px' }} />
                </div>
                <div>
                  <label style={labelStyle}>
                    Jumlah Transaksi (USD) <span style={{ color: '#ef4444' }}>*</span>
                    <Tooltip text={'Nominal transaksi dalam US Dollar (desimal).\nContoh: 84.75'} />
                  </label>
                  <input type="number" step="0.01" value={formData.amount}
                    onChange={e => onFormChange('amount', e.target.value)}
                    placeholder="Contoh: 84.75"
                    style={{ ...inputStyle, padding: '12px 14px' }} />
                </div>
              </div>

              {/* Row 2: Merchant category + Channel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>
                    Kategori Merchant <span style={{ color: '#ef4444' }}>*</span>
                    <Tooltip text={'Jenis bisnis merchant.\nNilai: electronics, travel, grocery, gaming, fashion'} />
                  </label>
                  <select value={formData.merchant_category} onChange={e => onFormChange('merchant_category', e.target.value)} style={{ ...inputStyle, padding: '12px 14px' }}>
                    {MERCHANT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    Kanal Transaksi
                    <Tooltip text={'Media transaksi (web/app). Default: web'} />
                  </label>
                  <select value={formData.channel} onChange={e => onFormChange('channel', e.target.value)} style={{ ...inputStyle, padding: '12px 14px' }}>
                    {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 3: Account age + Shipping distance */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>
                    Usia Akun (Hari)
                    <Tooltip text={'Berapa hari akun pengguna sudah aktif.\nAkun baru (< 30 hari) lebih berisiko.\nDefault: 365 hari (1 tahun)'} />
                  </label>
                  <input type="number" min={0} value={formData.account_age_days}
                    onChange={e => onFormChange('account_age_days', e.target.value)}
                    placeholder="Default: 365 hari"
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>
                    Jarak Pengiriman (km)
                    <Tooltip text={'Jarak antara lokasi pengiriman dan lokasi penjual.\nJarak > 1000 km dianggap mencurigakan.\nDefault: 200 km'} />
                  </label>
                  <input type="number" min={0} step="0.1" value={formData.shipping_distance_km}
                    onChange={e => onFormChange('shipping_distance_km', e.target.value)}
                    placeholder="Default: 200 km"
                    style={inputStyle} />
                </div>
              </div>

              {/* Row 4: Country + BIN Country */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>
                    Negara
                    <Tooltip text={'Negara tempat transaksi dilakukan (kode 2 huruf).\nNilai: US, GB, FR, NL, TR, PL, RO, DE, ES, IT\nDefault: US'} />
                  </label>
                  <select value={formData.country} onChange={e => onFormChange('country', e.target.value)} style={inputStyle}>
                    {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    Negara Kartu (BIN)
                    <Tooltip text={'Negara penerbit kartu kredit/debit berdasarkan nomor BIN (Bank Identification Number).\nBiasanya sama dengan Negara transaksi.\nNilai: US, GB, FR, NL, TR, PL, RO, DE, ES, IT\nDefault: sama dengan Negara'} />
                  </label>
                  <select value={formData.bin_country} onChange={e => onFormChange('bin_country', e.target.value)} style={inputStyle}>
                    {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 5: Transaction time */}
              <div>
                <label style={labelStyle}>
                  Waktu Transaksi
                  <Tooltip text={'Tanggal dan jam transaksi.\nDefault: waktu saat ini.'} />
                </label>
                <input type="datetime-local" value={formData.transaction_time}
                  onChange={e => onFormChange('transaction_time', e.target.value)}
                  style={inputStyle} />
              </div>

              {/* Security flags */}
              <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginTop: '12px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 800, color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px' }}>Informasi Keamanan</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  {SECURITY_FIELDS.map(({ field, label, yes, no, tooltip }) => (
                    <div key={field}>
                      <label style={labelStyle}>
                        {label}
                        <Tooltip text={tooltip} />
                      </label>
                      <select value={formData[field]} onChange={e => onFormChange(field, e.target.value)} style={{ ...inputStyle, padding: '12px 14px', backgroundColor: '#ffffff' }}>
                        <option value="1">1 — {yes}</option>
                        <option value="0">0 — {no}</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detect button */}
      <div className={`animate-section ${isVisible ? 'visible' : ''}`} style={{ maxWidth: '980px', margin: '0 auto', animationDelay: '0.4s' }}>
        <button onClick={onDetection} disabled={isDetectDisabled} className="detect-button" style={{
          width: '100%', backgroundColor: '#16a34a', color: '#ffffff', border: 'none',
          borderRadius: '16px', padding: '24px', fontSize: '20px', fontWeight: '800',
          cursor: isDetectDisabled ? 'not-allowed' : 'pointer', opacity: isDetectDisabled ? 0.6 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px',
          fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}>
          {isLoading
            ? <><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />Memproses Data...</>
            : <><Search size={24} />Mulai Analisis Deteksi</>
          }
        </button>
      </div>
    </section>
  );
}
