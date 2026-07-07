'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  Download,
  Info,
  Loader2,
  Search,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { DETECTION_FEATURES, MERCHANT_CATEGORIES, CHANNELS, COUNTRIES } from '@/lib/constants';
import type { InputMethod, SelectedFeatures, FormData } from '@/types';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { HelpPopover } from '@/components/ui/HelpPopover';
import { useToast } from '@/components/ui/ToastProvider';

interface DetectionSectionProps {
  inputMethod: InputMethod;
  setInputMethod: (method: InputMethod) => void;
  selectedFeatures: SelectedFeatures;
  onFeatureToggle: (feature: keyof SelectedFeatures) => void;
  uploadedFile: File | null;
  parsedData: Record<string, unknown>[] | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formData: FormData;
  onFormChange: (field: keyof FormData, value: string) => void;
  onDetection: () => Promise<void>;
  onDownloadTemplate: (format: 'csv' | 'xlsx') => void;
  isLoading: boolean;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  color: '#111827',
  backgroundColor: '#ffffff',
  boxSizing: 'border-box' as const,
};

const selectStyle = {
  ...inputStyle,
  paddingRight: '48px',
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%231f2937' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  backgroundSize: '18px 18px',
};

const labelStyle = {
  display: 'block' as const,
  fontSize: '14px',
  fontWeight: 700 as const,
  color: '#374151',
  marginBottom: '6px',
};

const helperTextStyle = {
  color: '#64748b',
  fontSize: '13px',
  lineHeight: 1.5,
  margin: '-2px 0 8px',
};

const errorTextStyle = {
  color: '#b91c1c',
  fontSize: '13px',
  lineHeight: 1.4,
  margin: '8px 0 0',
  fontWeight: 600 as const,
};

const formatUsd = (value: string) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Belum diisi';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const EXAMPLE_TRANSACTION: FormData = {
  user_id: '240817',
  amount: '249.00',
  merchant_category: 'fashion',
  channel: 'app',
  account_age_days: '428',
  shipping_distance_km: '18.5',
  avs_match: '1',
  cvv_result: '1',
  three_ds_flag: '1',
  promo_used: '1',
  country: 'US',
  bin_country: 'US',
  transaction_time: '2026-05-21T14:35',
};

const SECURITY_FIELDS = [
  {
    field: 'avs_match' as keyof FormData,
    label: 'Kecocokan Alamat Pembayaran (AVS)',
    helper: 'Apakah alamat pembayaran cocok dengan data kartu atau pembayaran?',
    helpTitle: 'Tentang Kecocokan Alamat',
    helpLabel: 'Lihat penjelasan kecocokan alamat pembayaran',
    help: 'AVS adalah pengecekan alamat pembayaran dengan data bank. Untuk seller, anggap ini seperti tanda apakah alamat pembayaran terlihat sesuai.',
    options: [
      { value: '',  label: 'Tidak tahu' },
      { value: '1', label: 'Alamat cocok' },
      { value: '0', label: 'Alamat tidak cocok' },
    ],
  },
  {
    field: 'cvv_result' as keyof FormData,
    label: 'Validasi Kode Keamanan Kartu (CVV)',
    helper: 'Apakah kode keamanan kartu berhasil dicek?',
    helpTitle: 'Tentang Kode Keamanan Kartu',
    helpLabel: 'Lihat penjelasan kode keamanan kartu',
    help: 'CVV adalah kode keamanan pada kartu. Jika tidak valid, pembayaran sebaiknya ditinjau ulang sebelum pesanan diproses.',
    options: [
      { value: '',  label: 'Tidak tahu' },
      { value: '1', label: 'Valid' },
      { value: '0', label: 'Tidak valid' },
    ],
  },
  {
    field: 'three_ds_flag' as keyof FormData,
    label: 'Verifikasi Tambahan/OTP (3DS)',
    helper: 'Apakah pembeli melewati verifikasi tambahan seperti OTP?',
    helpTitle: 'Tentang Verifikasi Tambahan',
    helpLabel: 'Lihat penjelasan verifikasi tambahan OTP',
    help: '3DS adalah verifikasi tambahan dari bank, misalnya OTP atau persetujuan aplikasi. Jika tidak ada OTP, pesanan tetap bisa sah tetapi perlu dilihat bersama sinyal lain.',
    options: [
      { value: '',  label: 'Tidak tahu' },
      { value: '1', label: 'Ya, menggunakan 3DS/OTP' },
      { value: '0', label: 'Tidak menggunakan 3DS/OTP' },
    ],
  },
  {
    field: 'promo_used' as keyof FormData,
    label: 'Promo/Voucher Digunakan',
    helper: 'Apakah pesanan memakai voucher, diskon, gratis ongkir, atau promo toko?',
    helpTitle: 'Tentang Promo/Voucher',
    helpLabel: 'Lihat penjelasan promo atau voucher',
    help: 'Promo mencakup voucher toko, diskon platform, kupon, atau gratis ongkir. Pilih ya jika potongan harga benar-benar digunakan.',
    options: [
      { value: '',  label: 'Tidak tahu' },
      { value: '1', label: 'Ya, menggunakan promo/voucher' },
      { value: '0', label: 'Tidak menggunakan promo/voucher' },
    ],
  },
];

const FIELD_HELP = {
  user_id: {
    helper: 'Nomor atau ID pembeli jika tersedia; boleh dikosongkan.',
    title: 'Tentang ID Pembeli',
    label: 'Lihat penjelasan ID pembeli',
    text: 'Gunakan ID pembeli dari sistem toko jika ada. Jika kosong, SIGAP tetap bisa mengecek risiko pesanan.',
  },
  amount: {
    helper: 'Total nilai pesanan yang dibayar pembeli, tanpa simbol mata uang.',
    title: 'Tentang Total Pesanan',
    label: 'Lihat penjelasan total pesanan',
    text: 'Masukkan angka USD saja tanpa simbol mata uang. Contoh: 249.00.',
  },
  merchant_category: {
    helper: 'Pilih kategori toko atau jenis produk yang dijual.',
    title: 'Tentang Kategori Toko',
    label: 'Lihat penjelasan kategori toko',
    text: 'Pilih kategori yang paling mendekati pesanan, misalnya fashion, elektronik, makanan/kebutuhan harian, travel, atau gaming.',
  },
  channel: {
    helper: 'Pilih dari mana pesanan masuk: website atau aplikasi marketplace.',
    title: 'Tentang Channel Penjualan',
    label: 'Lihat penjelasan channel penjualan',
    text: 'Pilih website jika pesanan berasal dari browser. Pilih aplikasi jika pesanan berasal dari aplikasi marketplace seperti Shopee, Tokopedia, TikTok Shop, atau Lazada.',
  },
  account_age_days: {
    helper: 'Perkiraan lama akun pembeli aktif di toko atau marketplace.',
    title: 'Tentang Usia Akun Pembeli',
    label: 'Lihat penjelasan usia akun pembeli',
    text: 'Akun pembeli yang sangat baru kadang perlu dicek lebih teliti. Jika tidak tahu, field ini boleh dikosongkan.',
  },
  shipping_distance_km: {
    helper: 'Perkiraan jarak dari toko atau gudang ke alamat pembeli.',
    title: 'Tentang Jarak Pengiriman',
    label: 'Lihat penjelasan jarak pengiriman',
    text: 'Masukkan estimasi dalam kilometer. Jarak yang sangat jauh atau tidak biasa bisa menjadi sinyal untuk mengecek pesanan lebih teliti.',
  },
  country: {
    helper: 'Negara lokasi transaksi jika informasi ini tersedia.',
    title: 'Tentang Lokasi Transaksi',
    label: 'Lihat penjelasan lokasi transaksi',
    text: 'Pilih negara yang paling mewakili lokasi pesanan. Jika tidak tersedia, gunakan pilihan bawaan yang paling sesuai dengan data Anda.',
  },
  bin_country: {
    helper: 'Negara asal kartu berdasarkan informasi awal kartu.',
    title: 'Tentang Negara Asal Kartu',
    label: 'Lihat penjelasan negara asal kartu',
    text: 'BIN adalah informasi awal kartu yang menunjukkan negara penerbit kartu. Jika negara kartu berbeda jauh dari lokasi pesanan, seller bisa mengecek ulang.',
  },
  transaction_time: {
    helper: 'Tanggal dan jam pesanan dibuat atau dibayar.',
    title: 'Tentang Waktu Pesanan',
    label: 'Lihat penjelasan waktu pesanan',
    text: 'Gunakan waktu pesanan dibuat atau pembayaran diterima. Waktu transaksi membantu membaca pola pesanan yang tidak biasa.',
  },
} as const;

const UPLOAD_FEATURE_HELP: Record<keyof SelectedFeatures, { title: string; text: string }> = {
  amount: {
    title: 'Jumlah Transaksi (USD)',
    text: 'Kolom wajib berisi total nilai pesanan dalam USD, tanpa simbol mata uang. Contoh: 249.00 atau 84.75.',
  },
  merchant_category: {
    title: 'Kategori Toko',
    text: 'Kolom wajib untuk jenis toko atau produk. Nilai valid: electronics, travel, grocery, gaming, fashion.',
  },
  transaction_time: {
    title: 'Waktu Pesanan',
    text: 'Tanggal dan jam pesanan dibuat atau dibayar. Gunakan format tanggal yang konsisten seperti ISO 8601 jika tersedia.',
  },
  channel: {
    title: 'Channel Penjualan',
    text: 'Sumber pesanan dari website atau aplikasi. Nilai valid: web, app.',
  },
  account_age_days: {
    title: 'Usia Akun Pembeli',
    text: 'Perkiraan lama akun pembeli aktif dalam hari. Contoh: 30, 120, atau 428.',
  },
  shipping_distance_km: {
    title: 'Jarak Pengiriman',
    text: 'Perkiraan jarak dari toko atau gudang ke alamat pembeli dalam kilometer. Contoh: 18.5.',
  },
  avs_match: {
    title: 'Kecocokan Alamat Pembayaran (AVS)',
    text: 'Menandai apakah alamat pembayaran cocok. Nilai valid: 1 untuk alamat cocok, 0 untuk alamat tidak cocok.',
  },
  cvv_result: {
    title: 'Validasi Kode Keamanan Kartu (CVV)',
    text: 'Menandai apakah kode keamanan kartu berhasil dicek. Nilai valid: 1 untuk valid, 0 untuk tidak valid.',
  },
  three_ds_flag: {
    title: 'Verifikasi Tambahan/OTP (3DS)',
    text: 'Menandai apakah pembeli melewati OTP atau verifikasi tambahan. Nilai valid: 1 untuk ya, 0 untuk tidak.',
  },
  promo_used: {
    title: 'Promo/Voucher Digunakan',
    text: 'Menandai apakah pesanan memakai voucher, diskon, atau promo. Nilai valid: 1 untuk ya, 0 untuk tidak.',
  },
  country: {
    title: 'Lokasi Transaksi',
    text: 'Negara lokasi transaksi. Nilai valid: US, GB, FR, NL, TR, PL, RO, DE, ES, IT.',
  },
  bin_country: {
    title: 'Negara Asal Kartu (BIN)',
    text: 'Negara asal kartu berdasarkan informasi BIN. Nilai valid: US, GB, FR, NL, TR, PL, RO, DE, ES, IT.',
  },
};

function FieldLabel({
  id,
  label,
  required,
  optional,
  help,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  help: { helper: string; title: string; label: string; text: string };
}) {
  return (
    <>
      <span className="manual-label-row">
        <label htmlFor={id} style={labelStyle}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          {optional && <span style={{ color: '#64748b', fontWeight: 500, fontSize: '13px' }}>(opsional)</span>}
        </label>
        <HelpPopover label={help.label} title={help.title}>
          {help.text}
        </HelpPopover>
      </span>
      <p id={`${id}-help`} className="manual-field__helper" style={helperTextStyle}>{help.helper}</p>
    </>
  );
}

function GuideModal({ open, mode, onClose }: { open: boolean; mode: InputMethod; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="guide-modal" role="presentation" onMouseDown={onClose}>
      <div
        className="guide-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="guide-modal__header">
          <h3 id="guide-modal-title">Panduan Cek Risiko Pesanan</h3>
          <button type="button" onClick={onClose} aria-label="Tutup panduan">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="guide-modal__content">
          <section>
            <h4>Tujuan SIGAP</h4>
            <p>SIGAP membantu seller memperkirakan risiko pesanan sebelum pesanan diproses atau dikirim.</p>
          </section>
          <section>
            <h4>{mode === 'file' ? 'Cara mengisi file upload' : 'Cara mengisi form'}</h4>
            <p>
              {mode === 'file'
                ? 'Unduh template, isi daftar pesanan sesuai kolom yang tersedia, lalu unggah file CSV atau XLSX.'
                : 'Isi seperti saat memeriksa pesanan di marketplace: total pesanan, kategori toko, pembeli, pembayaran, keamanan, dan pengiriman. Lalu, tekan tombol "Mulai Deteksi" di bagian bawah formulir untuk melihat hasil prediksi risiko.'}
            </p>
          </section>
          {mode === 'file' && (
            <section>
              <h4>Nilai valid kolom kategorikal</h4>
              <p><strong>merchant_category:</strong> electronics, travel, grocery, gaming, fashion.</p>
              <p><strong>channel:</strong> web, app.</p>
              <p><strong>country dan bin_country:</strong> US, GB, FR, NL, TR, PL, RO, DE, ES, IT.</p>
              <p><strong>avs_match, cvv_result, three_ds_flag, promo_used:</strong> gunakan 1 untuk ya/valid/cocok dan 0 untuk tidak.</p>
            </section>
          )}
          <section>
            <h4>Arti nilai 0 dan 1</h4>
            <p>Pada informasi keamanan, pilihan &quot;Ya&quot; biasanya berarti pengecekan terpenuhi, sedangkan &quot;Tidak&quot; berarti belum terpenuhi atau perlu dicek ulang.</p>
          </section>
          <section>
            <h4>Jika bingung dengan istilah</h4>
            <p>Jika Anda belum yakin bagian atau kolom tertentu, klik ikon bantuan (?) di samping judul bagian/kolom.  Ikon ini berisi penjelasan singkat tentang bagian/kolom tersebut.</p>
          </section>
          <section>
            <h4>Catatan hasil AI</h4>
            <p>Hasil deteksi adalah bantuan awal. Tetap periksa ulang alamat, pembayaran, dan pola pesanan sebelum mengambil keputusan.</p>
          </section>
          <section>
            <h4>Melihat dan mengunduh hasil</h4>
            <p>Setelah proses deteksi selesai, hasil dapat dilihat langsung pada halaman hasil deteksi dan juga diunduh dalam format CSV atau XLSX sesuai kebutuhan.</p>
          </section>
        </div>
        <button type="button" className="guide-modal__close" onClick={onClose}>Tutup</button>
      </div>
    </div>,
    document.body
  );
}

export function DetectionSection({
  inputMethod, setInputMethod,
  selectedFeatures, onFeatureToggle,
  uploadedFile, parsedData, onFileUpload,
  formData, onFormChange,
  onDetection, onDownloadTemplate,
  isLoading,
}: DetectionSectionProps) {
  const { ref, isVisible } = useScrollReveal(0.1);
  const { toast } = useToast();
  const selectedCount = Object.values(selectedFeatures).filter(Boolean).length;
  const totalCount = Object.keys(selectedFeatures).length;
  const isFormIncomplete = inputMethod === 'form' && (!formData.amount || !formData.merchant_category);
  const isDetectDisabled = isLoading || isFormIncomplete || (inputMethod === 'file' && (!parsedData || parsedData.length === 0));
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const detailSectionRef = useRef<HTMLDivElement>(null);

  const featureKeys = Object.keys(selectedFeatures) as (keyof SelectedFeatures)[];
  const col1 = featureKeys.slice(0, Math.ceil(featureKeys.length / 3));
  const col2 = featureKeys.slice(Math.ceil(featureKeys.length / 3), Math.ceil(featureKeys.length * 2 / 3));
  const col3 = featureKeys.slice(Math.ceil(featureKeys.length * 2 / 3));

  const isRequired = (k: keyof SelectedFeatures) => DETECTION_FEATURES.find(f => f.key === k)?.required === true;
  const handleSelectAll = () => featureKeys.filter(k => !isRequired(k) && !selectedFeatures[k]).forEach(k => onFeatureToggle(k));
  const handleDeselectAll = () => featureKeys.filter(k => !isRequired(k) && selectedFeatures[k]).forEach(k => onFeatureToggle(k));

  const updateForm = (field: keyof FormData, value: string) => {
    onFormChange(field, value);
    if (formErrors[field]) {
      setFormErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const scrollToDetailSection = () => {
    if (!detailSectionRef.current) return;

    const stickyOffset = window.innerWidth <= 900 ? 164 : 108;
    const top = detailSectionRef.current.getBoundingClientRect().top + window.pageYOffset - stickyOffset;

    window.scrollTo({
      top: Math.max(top, 0),
      behavior: 'smooth',
    });
  };

  const fillExample = () => {
    const alreadyFilled = (Object.entries(EXAMPLE_TRANSACTION) as [keyof FormData, string][])
      .every(([field, value]) => formData[field] === value);

    (Object.entries(EXAMPLE_TRANSACTION) as [keyof FormData, string][]).forEach(([field, value]) => {
      onFormChange(field, value);
    });
    setFormErrors({});

    window.requestAnimationFrame(() => {
      scrollToDetailSection();
    });

    if (alreadyFilled) {
      toast({
        type: 'info',
        title: 'Pesanan sudah diisi dengan nilai contoh',
        description: 'Form contoh tetap ditampilkan dan halaman diarahkan ke Detail Transaksi.',
      });
      return;
    }

    toast({
      type: 'success',
      title: 'Isi contoh pesanan berhasil',
      description: 'Form diisi otomatis dengan data contoh dan diarahkan ke Detail Transaksi.',
    });
  };

  const validateManualForm = () => {
    const errors: FormErrors = {};
    const amount = Number(formData.amount);
    const validCategories = new Set<string>(MERCHANT_CATEGORIES.map((item) => item.value).filter(Boolean));
    const validChannels = new Set<string>(CHANNELS.map((item) => item.value).filter(Boolean));

    if (!formData.amount) errors.amount = 'Total pesanan wajib diisi.';
    else if (!Number.isFinite(amount) || amount <= 0) errors.amount = 'Total pesanan harus lebih dari 0.';
    if (!validCategories.has(formData.merchant_category)) errors.merchant_category = 'Kategori toko belum sesuai. Pilih salah satu kategori yang tersedia.';
    if (formData.channel && !validChannels.has(formData.channel)) errors.channel = 'Channel penjualan belum sesuai. Pilih website atau aplikasi marketplace.';
    if (formData.account_age_days && Number(formData.account_age_days) < 0) errors.account_age_days = 'Usia akun pembeli harus berupa angka 0 atau lebih.';
    if (formData.shipping_distance_km && Number(formData.shipping_distance_km) < 0) errors.shipping_distance_km = 'Jarak pengiriman harus berupa angka 0 atau lebih.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDetectClick = async () => {
    if (inputMethod === 'form' && !validateManualForm()) return;
    await onDetection();
  };

  const renderError = (field: keyof FormData) => {
    if (!formErrors[field]) return null;
    return <p id={`${field}-error`} style={errorTextStyle}>{formErrors[field]}</p>;
  };

  const describedBy = (field: keyof FormData) => (
    formErrors[field] ? `${field}-help ${field}-error` : `${field}-help`
  );

  const findOptionLabel = (options: readonly { value: string; label: string }[], value: string) => (
    options.find((item) => item.value === value)?.label || 'Belum dipilih'
  );
  const securitySummaryLabel = (field: keyof FormData) => (
    SECURITY_FIELDS.find((item) => item.field === field)?.options.find((option) => option.value === formData[field])?.label || 'Belum dipilih'
  );
  const orderSummary = [
    { label: 'Total Pesanan', value: formData.amount ? formatUsd(formData.amount) : 'Belum diisi' },
    { label: 'Channel Penjualan', value: findOptionLabel(CHANNELS, formData.channel) },
    { label: 'Kategori Toko', value: findOptionLabel(MERCHANT_CATEGORIES, formData.merchant_category) },
    { label: 'Promo/Voucher', value: securitySummaryLabel('promo_used') },
    { label: 'Verifikasi Tambahan/OTP', value: securitySummaryLabel('three_ds_flag') },
    { label: 'Jarak Pengiriman', value: formData.shipping_distance_km ? `${formData.shipping_distance_km} km` : 'Belum diisi' },
  ];

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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        html, body { max-width: 100%; overflow-x: hidden; }
        #detection, #detection * { box-sizing: border-box; }
        .animate-section { opacity: 0; }
        .animate-section.visible { animation: fadeInScale 0.6s ease-out forwards; }
        .instruction-box { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .instruction-box:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .mode-button, .detect-button { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .detect-button:not(:disabled):hover {
          background-color: #15803d !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(22, 163, 74, 0.4);
        }
        .detect-button:not(:disabled):active { transform: translateY(0); }
        .file-mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
        .file-card { background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .download-format-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid #e5e7eb; }
        .feature-col { padding: 12px 16px 12px 0; border-right: 1px solid #e5e7eb; min-width: 0; }
        .feature-col:last-child { border-right: none; }
        .feature-col:not(:first-child) { padding-left: 16px; }
        .feature-option {
          display: grid;
          grid-template-columns: 20px minmax(0, 1fr) 44px;
          align-items: center;
          gap: 10px;
          min-height: 48px;
          padding: 6px 0;
          font-size: 14px;
          font-weight: 700;
          color: #334155;
        }
        .feature-option--disabled { color: #64748b; }
        .feature-option__text { min-width: 0; overflow-wrap: anywhere; }
        .upload-dropzone { border: 2px dashed #d1d5db; border-radius: 10px; padding: 40px 24px; text-align: center; background-color: #fafafa; }
        .manual-card { background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .manual-topbar { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 20px; }
        .manual-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
        .manual-actions-sticky { position: static; }
        .manual-secondary-button, .manual-guide-button {
          min-height: 44px;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Inter', sans-serif;
        }
        .manual-secondary-button { border: none; background: #2563eb; color: #ffffff; }
        .manual-guide-button { border: 1px solid #cbd5e1; background: #ffffff; color: #334155; }
        .manual-helper-panel {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 18px;
          color: #1e3a8a;
          font-size: 14px;
          line-height: 1.6;
        }
        .manual-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .manual-step {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.4;
        }
        .manual-section {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #ffffff;
          overflow: visible;
        }
        .manual-section + .manual-section { margin-top: 14px; }
        .manual-section__header {
          min-height: 56px;
          background: #f8fafc;
          color: #0f172a;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          font-weight: 800;
          font-family: 'Inter', sans-serif;
          border-bottom: 1px solid #e2e8f0;
        }
        .manual-section__content { padding: 20px; }
        .manual-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
        .manual-field { min-width: 0; }
        .manual-field__helper { min-height: 3.2em; }
        .manual-label-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
        .seller-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
        .seller-badge {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }
        .seller-badge--safe { background: #dcfce7; color: #166534; }
        .seller-badge--check { background: #fef3c7; color: #92400e; }
        .seller-badge--risk { background: #fee2e2; color: #991b1b; }
        .order-summary {
          margin-top: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #f8fafc;
          overflow: hidden;
        }
        .order-summary__header {
          padding: 16px 18px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .order-summary__title { margin: 0; color: #0f172a; font-size: 16px; font-weight: 800; }
        .order-summary__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; background: #e2e8f0; }
        .order-summary__item { background: #ffffff; padding: 14px 16px; min-width: 0; }
        .order-summary__label { display: block; color: #64748b; font-size: 12px; font-weight: 700; margin-bottom: 4px; }
        .order-summary__value { display: block; color: #0f172a; font-size: 14px; font-weight: 800; overflow-wrap: anywhere; }
        .help-popover { position: relative; display: inline-flex; flex: 0 0 auto; margin-top: -10px; }
        .help-popover__trigger {
          width: 44px;
          height: 44px;
          border: none;
          border-radius: 999px;
          background: transparent;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .help-popover__trigger:hover, .help-popover__trigger:focus-visible { background: #f1f5f9; color: #2563eb; outline: none; }
        .help-popover__tooltip {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: min(280px, calc(100vw - 48px));
          padding: 10px 12px;
          background: #0f172a;
          color: #f8fafc;
          border-radius: 10px;
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.2);
          font-size: 12px;
          line-height: 1.5;
          z-index: 50;
          white-space: normal;
        }
        .help-popover__tooltip::before {
          content: '';
          position: absolute;
          top: -6px;
          right: 14px;
          width: 12px;
          height: 12px;
          background: #0f172a;
          transform: rotate(45deg);
          border-radius: 2px;
        }
        .help-popover__panel {
          position: fixed;
          top: 50%;
          left: 50%;
          right: auto;
          transform: translate(-50%, -50%);
          width: min(360px, calc(100vw - 32px));
          max-height: min(70vh, 520px);
          overflow-y: auto;
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
          z-index: 80;
          box-shadow: 0 18px 38px rgba(15, 23, 42, 0.22);
          font-size: 13px;
          line-height: 1.55;
        }
        .help-popover__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 6px; }
        .help-popover__close {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 999px;
          background: #f1f5f9;
          color: #334155;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex: 0 0 auto;
        }
        .help-popover__body { display: block; color: #475569; }
        .help-popover__scrim {
          display: block;
          position: fixed;
          inset: 0;
          z-index: 70;
          background: rgba(15, 23, 42, 0.22);
        }
        .help-popover__mobile-close { display: none; }
        .guide-modal {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(15, 23, 42, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .guide-modal__panel {
          width: min(560px, 100%);
          max-height: min(720px, 86vh);
          overflow: hidden;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
          display: flex;
          flex-direction: column;
        }
        .guide-modal__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 22px;
          border-bottom: 1px solid #e2e8f0;
        }
        .guide-modal__header h3 { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
        .guide-modal__header button {
          width: 44px;
          height: 44px;
          border: none;
          border-radius: 999px;
          background: #f1f5f9;
          color: #334155;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .guide-modal__content { overflow-y: auto; padding: 20px 22px; color: #475569; font-size: 14px; line-height: 1.7; }
        .guide-modal__content section + section { margin-top: 16px; }
        .guide-modal__content h4 { margin: 0 0 6px; color: #0f172a; font-size: 15px; font-weight: 800; }
        .guide-modal__content p { margin: 0; }
        .guide-modal__close {
          min-height: 48px;
          margin: 0 22px 20px;
          border: none;
          border-radius: 12px;
          background: #2563eb;
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
        }
        @media (max-width: 900px) {
          #detection { width: 100%; max-width: 100vw; overflow-x: hidden; padding: 72px 16px 96px !important; }
          .file-mode-grid { grid-template-columns: 1fr; }
          .file-card { padding: 20px; border-radius: 18px; width: 100%; max-width: 100%; }
          .download-format-grid { grid-template-columns: 1fr; }
          .feature-grid { grid-template-columns: 1fr; border-top: 1px solid #e5e7eb; }
          .feature-col, .feature-col:not(:first-child) {
            padding: 10px 0;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }
          .feature-col:last-child { border-bottom: none; }
          .upload-dropzone { padding: 32px 16px; }
          .manual-card { width: 100%; max-width: 100%; }
          .manual-card { padding: 20px; border-radius: 18px; }
          .manual-topbar { flex-direction: column; }
          .manual-actions-sticky {
            position: sticky;
            top: 76px;
            z-index: 25;
            width: 100%;
            margin: -4px 0 12px;
            padding: 10px 0 0;
            background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 78%, rgba(255,255,255,0) 100%);
          }
          .manual-actions { width: 100%; justify-content: stretch; }
          .manual-secondary-button, .manual-guide-button { width: 100%; }
          .manual-steps { grid-template-columns: 1fr; gap: 8px; }
          .manual-step { padding: 9px 10px; }
          .manual-grid { grid-template-columns: 1fr; }
          .manual-field__helper { min-height: 0; }
          .order-summary__grid { grid-template-columns: 1fr; }
          .manual-section__content { padding: 16px; }
          .help-popover__panel {
            position: fixed;
            left: 50%;
            right: auto;
            bottom: auto;
            top: 50%;
            transform: translate(-50%, -50%);
            width: calc(100vw - 32px);
            max-height: 70vh;
            overflow-y: auto;
            background: #ffffff;
            color: #0f172a;
            border: 1px solid #e2e8f0;
            box-shadow: 0 20px 45px rgba(15, 23, 42, 0.24);
            z-index: 90;
          }
          .help-popover__tooltip {
            right: auto;
            left: 50%;
            transform: translateX(-50%);
            width: min(260px, calc(100vw - 32px));
          }
          .help-popover__tooltip::before {
            right: auto;
            left: calc(50% - 6px);
          }
          .help-popover__body { color: #475569; }
          .help-popover__close { background: #f1f5f9; color: #334155; }
          .help-popover__mobile-close {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            min-height: 44px;
            margin-top: 12px;
            border: none;
            border-radius: 10px;
            background: #2563eb;
            color: #ffffff;
            font-weight: 800;
          }
          .manual-action-sticky {
            position: sticky;
            bottom: 12px;
            z-index: 30;
            width: 100%;
            max-width: 100vw !important;
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid #e2e8f0;
            padding: 12px;
            border-radius: 18px;
            box-shadow: 0 14px 30px rgba(15, 23, 42, 0.10);
            backdrop-filter: blur(10px);
          }
          .manual-action-sticky .detect-button { border-radius: 12px !important; padding: 16px !important; font-size: 16px !important; }
          .guide-modal { align-items: center; justify-content: center; padding: 16px; }
          .guide-modal__panel {
            width: min(100%, 420px);
            border-radius: 18px;
            max-height: min(82vh, 640px);
          }
        }
        @media (max-width: 560px) {
          #detection h2 { font-size: 34px !important; margin-bottom: 30px !important; }
          .mode-button { padding: 10px 18px !important; }
          .manual-card h3 { font-size: 22px !important; }
        }
      `}</style>

      <h2 className={`animate-section ${isVisible ? 'visible' : ''}`} style={{ fontSize: '48px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px', letterSpacing: 0 }}>
        Deteksi Transaksi
      </h2>

      <div className={`animate-section ${isVisible ? 'visible' : ''}`} style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '16px', padding: '18px 24px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', animationDelay: '0.1s' }}>
        <div style={{ backgroundColor: '#ffedd5', borderRadius: '50%', padding: '8px', display: 'flex', flex: '0 0 auto' }}>
          <Info size={22} color="#ea580c" />
        </div>
        <p style={{ fontSize: '15px', color: '#9a3412', margin: 0, fontWeight: '500', lineHeight: 1.6 }}>
          <strong>Penting:</strong> Hasil prediksi SIGAP berbasis AI dan bisa mengalami kekeliruan. Harap lakukan verifikasi manual untuk keputusan krusial.
        </p>
      </div>

      <div className={`animate-section ${isVisible ? 'visible' : ''}`} style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px', animationDelay: '0.2s' }}>
        <div style={{ display: 'inline-flex', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          {(['file', 'form'] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setInputMethod(method)}
              className="mode-button"
              style={{
                padding: '10px 28px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '15px',
                fontWeight: inputMethod === method ? 700 : 500,
                cursor: 'pointer',
                backgroundColor: inputMethod === method ? '#ffffff' : 'transparent',
                color: inputMethod === method ? '#2563EB' : '#64748b',
                boxShadow: inputMethod === method ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {method === 'file' ? 'Upload File' : 'Input Manual'}
            </button>
          ))}
        </div>
      </div>

      {inputMethod === 'file' ? (
        <div className={`animate-section ${isVisible ? 'visible' : ''}`} style={{ maxWidth: '980px', margin: '0 auto 32px', animationDelay: '0.3s' }}>
          <div className="manual-card">
            <div className="manual-topbar">
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 6px' }}>Cek Banyak Pesanan</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Unggah file pesanan marketplace untuk mengecek beberapa transaksi sekaligus.</p>
              </div>
              <div className="manual-actions-sticky">
                <div className="manual-actions">
                  <button type="button" className="manual-guide-button" onClick={() => setIsGuideOpen(true)}>
                    <BookOpen size={18} aria-hidden="true" /> Lihat Panduan Singkat
                  </button>
                </div>
              </div>
            </div>

            <div className="manual-helper-panel">
              <strong>Gunakan format seperti daftar pesanan toko.</strong> Unduh template, isi data pesanan, lalu unggah kembali untuk memulai deteksi.
              <div style={{ color: '#475569', fontSize: '13px', marginTop: '4px' }}>Kolom wajib: ID Pembeli, Total Pesanan, dan Kategori Toko.</div>
            </div>

            <div className="manual-steps" aria-label="Langkah upload file">
              <div className="manual-step">Step 1: Unduh template</div>
              <div className="manual-step">Step 2: Isi daftar pesanan</div>
              <div className="manual-step">Step 3: Unggah & mulai deteksi</div>
            </div>

            <div style={{ paddingBottom: '24px' }}>
              <div className="manual-section">
                <div className="manual-section__header">
                  <span>Unduh Template Pesanan</span>
                  <HelpPopover label="Lihat penjelasan template pesanan" title="Template Pesanan">
                    Template berisi kolom yang dibutuhkan SIGAP agar data pesanan terbaca rapi. XLSX disarankan untuk responden yang memakai spreadsheet.
                  </HelpPopover>
                </div>
                <div className="manual-section__content">
                  <p style={helperTextStyle}>Gunakan template resmi agar nama kolom sesuai dan file mudah diproses.</p>
                  <div className="download-format-grid">
                    {(['xlsx', 'csv'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => onDownloadTemplate(fmt)}
                        style={{ backgroundColor: '#2563EB', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}
                      >
                        <Download size={20} /> Template {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="manual-section">
                <div className="manual-section__header">
                  <span>Pilih Data yang Dipakai</span>
                  <HelpPopover label="Lihat penjelasan pilihan data" title="Pilihan Data">
                    Biarkan semua data aktif jika Anda ragu. Matikan hanya kolom opsional yang memang tidak tersedia di file pesanan.
                  </HelpPopover>
                </div>
                <div className="manual-section__content">
                  <p style={helperTextStyle}>Kolom wajib tetap dipakai. Anda bisa mematikan data opsional yang tidak ada di file.</p>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {[['Pilih Semua', handleSelectAll], ['Kosongkan Opsional', handleDeselectAll]].map(([lbl, fn]) => (
                      <button
                        key={lbl as string}
                        type="button"
                        onClick={fn as () => void}
                        style={{ minHeight: '40px', padding: '8px 16px', borderRadius: '10px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: '#374151', fontFamily: "'Inter', sans-serif" }}
                      >
                        {lbl as string}
                      </button>
                    ))}
                  </div>
                  <div className="feature-grid">
                    {[col1, col2, col3].map((col, ci) => (
                      <div key={ci} className="feature-col">
                        {col.map((key) => {
                          const feat = DETECTION_FEATURES.find(f => f.key === key);
                          const required = feat?.required === true;
                          return (
                            <div key={key} className={`feature-option ${required ? 'feature-option--disabled' : ''}`}>
                              <input
                                id={`feature-${key}`}
                                type="checkbox"
                                checked={required ? true : !!selectedFeatures[key]}
                                disabled={required}
                                onChange={() => onFeatureToggle(key)}
                                style={{ accentColor: '#2563EB', width: '18px', height: '18px', cursor: required ? 'not-allowed' : 'pointer' }}
                              />
                              <label htmlFor={`feature-${key}`} className="feature-option__text" style={{ cursor: required ? 'not-allowed' : 'pointer' }}>
                                {feat?.label ?? String(key)}
                                {required && <span style={{ color: '#dc2626', fontWeight: 800, marginLeft: '4px' }}>*</span>}
                              </label>
                              <HelpPopover label={`Lihat penjelasan ${feat?.label ?? String(key)}`} title={UPLOAD_FEATURE_HELP[key].title}>
                                {UPLOAD_FEATURE_HELP[key].text}
                              </HelpPopover>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '13px', color: '#2563EB', marginTop: '12px', fontWeight: '700' }}>
                    {selectedCount} dari {totalCount} data dipakai
                  </p>
                </div>
              </div>

              <div className="manual-section">
                <div className="manual-section__header">
                  <span>Unggah File Pesanan</span>
                  <HelpPopover label="Lihat penjelasan unggah file pesanan" title="Unggah File Pesanan">
                    Pilih file CSV atau XLSX yang sudah mengikuti template. Data hanya digunakan untuk proses deteksi dan tidak disimpan di browser.
                  </HelpPopover>
                </div>
                <div className="manual-section__content">
                  <div className="upload-dropzone">
                    <input type="file" accept=".csv,.xlsx,.xls" onChange={onFileUpload} className="hidden" id="file-upload" disabled={isLoading} />
                    <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                      {isLoading ? (
                        <Loader2 size={32} color="#2563EB" style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
                      ) : uploadedFile ? (
                        <>
                          <Upload size={32} color="#16a34a" style={{ margin: '0 auto 12px', display: 'block' }} />
                          <p style={{ fontSize: '14px', color: '#16a34a', fontWeight: '700', margin: '0 0 4px', overflowWrap: 'anywhere' }}>{uploadedFile.name}</p>
                          {parsedData && <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{parsedData.length} pesanan berhasil dibaca</p>}
                        </>
                      ) : (
                        <>
                          <Upload size={32} color="#9ca3af" style={{ margin: '0 auto 12px', display: 'block' }} />
                          <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 4px', fontWeight: 700 }}>Ketuk untuk memilih file pesanan</p>
                          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Format CSV atau XLSX</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <GuideModal open={isGuideOpen} mode="file" onClose={() => setIsGuideOpen(false)} />
        </div>
      ) : (
        <div className={`animate-section ${isVisible ? 'visible' : ''}`} style={{ maxWidth: '980px', margin: '0 auto 32px', animationDelay: '0.3s' }}>
          <div className="manual-card">
            <div className="manual-topbar">
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 6px' }}>Cek Risiko Pesanan</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Masukkan data seperti saat Anda memeriksa pesanan di dashboard marketplace.</p>
              </div>
              <div className="manual-actions-sticky">
                <div className="manual-actions">
                  <button type="button" className="manual-guide-button" onClick={() => setIsGuideOpen(true)}>
                    <BookOpen size={18} aria-hidden="true" /> Lihat Panduan Singkat
                  </button>
                  <button type="button" className="manual-secondary-button" onClick={fillExample}>
                    <Sparkles size={18} aria-hidden="true" /> Isi Contoh Pesanan
                  </button>
                </div>
              </div>
            </div>

            <div className="manual-helper-panel">
              <strong>Isi data seperti saat Anda memeriksa pesanan di marketplace.</strong> Jika tidak memiliki data asli, gunakan tombol Isi Contoh Pesanan untuk mencoba SIGAP.
              <div style={{ color: '#475569', fontSize: '13px', marginTop: '4px' }}>Data hanya digunakan untuk proses deteksi dan tidak disimpan.</div>
            </div>

            <div className="seller-badges" aria-label="Contoh status risiko">
              <span className="seller-badge seller-badge--safe">Aman</span>
              <span className="seller-badge seller-badge--risk">Berisiko</span>
            </div>

            <div className="manual-steps" aria-label="Langkah input manual">
              <div className="manual-step">Step 1: Isi detail pesanan</div>
              <div className="manual-step">Step 2: Cek pembayaran & keamanan</div>
              <div className="manual-step">Step 3: Cek risiko transaksi</div>
            </div>

            <div style={{ paddingBottom: '24px' }}>
              <div className="manual-section" ref={detailSectionRef}>
                <div className="manual-section__header">Detail Transaksi</div>
                <div className="manual-section__content">
                  <div className="manual-grid">
                    <div className="manual-field">
                      <FieldLabel id="amount" label="Total Pesanan" required help={FIELD_HELP.amount} />
                      <input id="amount" type="number" step="0.01" value={formData.amount} onChange={e => updateForm('amount', e.target.value)} placeholder="Contoh: 249.00" style={inputStyle} aria-invalid={!!formErrors.amount} aria-describedby={describedBy('amount')} />
                      {renderError('amount')}
                    </div>
                    <div className="manual-field">
                      <FieldLabel id="merchant_category" label="Kategori Toko" required help={FIELD_HELP.merchant_category} />
                      <select id="merchant_category" value={formData.merchant_category} onChange={e => updateForm('merchant_category', e.target.value)} style={selectStyle} aria-invalid={!!formErrors.merchant_category} aria-describedby={describedBy('merchant_category')}>
                        {MERCHANT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      {renderError('merchant_category')}
                    </div>
                    <div className="manual-field">
                      <FieldLabel id="transaction_time" label="Waktu Pesanan" help={FIELD_HELP.transaction_time} />
                      <input id="transaction_time" type="datetime-local" value={formData.transaction_time} onChange={e => updateForm('transaction_time', e.target.value)} style={inputStyle} aria-describedby={describedBy('transaction_time')} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="manual-section">
                <div className="manual-section__header">Informasi Pembeli</div>
                <div className="manual-section__content">
                  <div className="manual-grid">
                    <div className="manual-field">
                      <FieldLabel id="user_id" label="ID Pembeli" optional help={FIELD_HELP.user_id} />
                      <input id="user_id" type="number" min={1} value={formData.user_id} onChange={e => updateForm('user_id', e.target.value)} placeholder="Contoh: 240817" style={inputStyle} aria-describedby={describedBy('user_id')} />
                    </div>
                    <div className="manual-field">
                      <FieldLabel id="account_age_days" label="Usia Akun Pembeli (Hari)" help={FIELD_HELP.account_age_days} />
                      <input id="account_age_days" type="number" min={0} value={formData.account_age_days} onChange={e => updateForm('account_age_days', e.target.value)} placeholder="Contoh: 428" style={inputStyle} aria-invalid={!!formErrors.account_age_days} aria-describedby={describedBy('account_age_days')} />
                      {renderError('account_age_days')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="manual-section">
                <div className="manual-section__header">Informasi Pembayaran</div>
                <div className="manual-section__content">
                  <div className="manual-grid">
                    <div className="manual-field">
                      <FieldLabel id="channel" label="Channel Penjualan" help={FIELD_HELP.channel} />
                      <select id="channel" value={formData.channel} onChange={e => updateForm('channel', e.target.value)} style={selectStyle} aria-invalid={!!formErrors.channel} aria-describedby={describedBy('channel')}>
                        {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      {renderError('channel')}
                    </div>
                    <div className="manual-field">
                      <FieldLabel id="country" label="Lokasi Transaksi (Negara)" help={FIELD_HELP.country} />
                      <select id="country" value={formData.country} onChange={e => updateForm('country', e.target.value)} style={selectStyle} aria-describedby={describedBy('country')}>
                        {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div className="manual-field">
                      <FieldLabel id="bin_country" label="Negara Asal Kartu (BIN)" help={FIELD_HELP.bin_country} />
                      <select id="bin_country" value={formData.bin_country} onChange={e => updateForm('bin_country', e.target.value)} style={selectStyle} aria-describedby={describedBy('bin_country')}>
                        {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    {SECURITY_FIELDS.filter(({ field }) => field === 'promo_used').map(({ field, label, helper, helpTitle, helpLabel, help, options }) => (
                      <div className="manual-field" key={field}>
                        <span className="manual-label-row">
                          <label htmlFor={field} style={labelStyle}>{label}</label>
                          <HelpPopover label={helpLabel} title={helpTitle}>{help}</HelpPopover>
                        </span>
                        <p id={`${field}-help`} className="manual-field__helper" style={helperTextStyle}>{helper}</p>
                        <select id={field} value={formData[field]} onChange={e => updateForm(field, e.target.value)} style={selectStyle} aria-describedby={describedBy(field)}>
                          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="manual-section">
                <div className="manual-section__header">Pengiriman & Perangkat</div>
                <div className="manual-section__content">
                  <div className="manual-grid">
                    <div className="manual-field">
                      <FieldLabel id="shipping_distance_km" label="Jarak Pengiriman (km)" help={FIELD_HELP.shipping_distance_km} />
                      <input id="shipping_distance_km" type="number" min={0} step="0.1" value={formData.shipping_distance_km} onChange={e => updateForm('shipping_distance_km', e.target.value)} placeholder="Contoh: 18.5" style={inputStyle} aria-invalid={!!formErrors.shipping_distance_km} aria-describedby={describedBy('shipping_distance_km')} />
                      {renderError('shipping_distance_km')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="manual-section">
                <div className="manual-section__header">Informasi Keamanan</div>
                <div className="manual-section__content">
                  <div className="manual-grid">
                    {SECURITY_FIELDS.filter(({ field }) => field !== 'promo_used').map(({ field, label, helper, helpTitle, helpLabel, help, options }) => (
                      <div className="manual-field" key={field}>
                        <span className="manual-label-row">
                          <label htmlFor={field} style={labelStyle}>{label}</label>
                          <HelpPopover label={helpLabel} title={helpTitle}>{help}</HelpPopover>
                        </span>
                        <p id={`${field}-help`} className="manual-field__helper" style={helperTextStyle}>{helper}</p>
                        <select id={field} value={formData[field]} onChange={e => updateForm(field, e.target.value)} style={selectStyle} aria-describedby={describedBy(field)}>
                          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="order-summary" aria-label="Ringkasan pesanan sebelum cek risiko">
              <div className="order-summary__header">
                <p className="order-summary__title">Ringkasan Pesanan</p>
                <span className="seller-badge seller-badge--safe">Cek sebelum proses</span>
              </div>
              <div className="order-summary__grid">
                {orderSummary.map((item) => (
                  <div className="order-summary__item" key={item.label}>
                    <span className="order-summary__label">{item.label}</span>
                    <span className="order-summary__value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`manual-action-sticky animate-section ${isVisible ? 'visible' : ''}`} style={{ marginTop: '16px', animationDelay: '0.4s' }}>
              <button
                type="button"
                onClick={handleDetectClick}
                disabled={isDetectDisabled}
                className="detect-button"
                style={{
                  width: '100%',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '24px',
                  fontSize: '20px',
                  fontWeight: '800',
                  cursor: isDetectDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDetectDisabled ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '14px',
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              >
                {isLoading
                  ? <><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />Memproses Data...</>
                  : <><Search size={24} />Mulai Deteksi</>
                }
              </button>
            </div>
          </div>
          <GuideModal open={isGuideOpen} mode="form" onClose={() => setIsGuideOpen(false)} />
        </div>
      )}

      {inputMethod === 'file' && (
        <div className={`animate-section manual-action-sticky ${isVisible ? 'visible' : ''}`} style={{ maxWidth: '980px', margin: '0 auto', animationDelay: '0.4s' }}>
          <button
            type="button"
            onClick={handleDetectClick}
            disabled={isDetectDisabled}
            className="detect-button"
            style={{
              width: '100%',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '24px',
              fontSize: '20px',
              fontWeight: '800',
              cursor: isDetectDisabled ? 'not-allowed' : 'pointer',
              opacity: isDetectDisabled ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
          >
            {isLoading
              ? <><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />Memproses Data...</>
              : <><Search size={24} />Mulai Deteksi</>
            }
          </button>
        </div>
      )}
    </section>
  );
}
