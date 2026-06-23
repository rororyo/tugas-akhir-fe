'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import type { DetectionResult, SelectedFeatures, InputMethod, Transaction, FormData, SingleResult } from '@/types';
import { parseFile } from '@/lib/utils/fileParser';
import { getSellerStatus } from '@/lib/utils/sellerStatus';
import { useToast } from '@/components/ui/ToastProvider';


const API_URL = process.env.NEXT_PUBLIC_API_URL;

const NUMERIC_COLS = [
  'amount', 'account_age_days', 'total_transactions_user',
  'avg_amount_user', 'shipping_distance_km',
  'avs_match', 'cvv_result', 'three_ds_flag', 'promo_used', 'user_id',
];

// All template columns — fixed regardless of feature checkbox state
const TEMPLATE_COLUMNS = [
  'user_id', 'amount', 'merchant_category', 'channel', 'country',
  'bin_country', 'account_age_days', 'shipping_distance_km',
  'promo_used', 'avs_match', 'cvv_result', 'three_ds_flag', 'transaction_time',
];

export function useDetection() {
  const { toast } = useToast();
  const [results, setResults] = useState<DetectionResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, unknown>[] | null>(null);
  const [inputMethod, setInputMethod] = useState<InputMethod>('form');
  // Locked to the mode used at submission time — never changes while results are shown
  const [submittedInputMethod, setSubmittedInputMethod] = useState<InputMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeatures>({
    amount: true,
    merchant_category: true,
    transaction_time: true,
    channel: true,
    account_age_days: true,
    shipping_distance_km: true,
    avs_match: true,
    cvv_result: true,
    three_ds_flag: true,
    promo_used: true,
    country: true,
    bin_country: true,
  });

  const [formData, setFormData] = useState<FormData>({
    user_id: '',
    amount: '',
    merchant_category: '',
    channel: 'web',
    account_age_days: '',
    shipping_distance_km: '',
    avs_match: '1',
    cvv_result: '1',
    three_ds_flag: '1',
    promo_used: '0',
    country: 'US',
    bin_country: 'US',
    transaction_time: new Date().toISOString().slice(0, 16),
  });

  const handleFeatureToggle = (feature: keyof SelectedFeatures) => {
    setSelectedFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    const isSupportedFile = extension === 'csv' || extension === 'xlsx' || extension === 'xls';

    if (!isSupportedFile) {
      e.currentTarget.value = '';
      setUploadedFile(null);
      setParsedData(null);
      setError(null);
      toast({
        type: 'error',
        title: 'Format file tidak didukung',
        description: 'Unggah file dengan format CSV atau XLSX.',
      });
      return;
    }

    setError(null);
    try {
      setIsLoading(true);
      const data = await parseFile(file);
      setUploadedFile(file);
      setParsedData(data);
      toast({
        type: 'success',
        title: 'File berhasil dibaca',
        description: `${data.length} transaksi siap dianalisis.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memproses file';
      e.currentTarget.value = '';
      setUploadedFile(null);
      setParsedData(null);
      setError(message);
      toast({
        type: 'error',
        title: 'Gagal memproses file',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDetection = async () => {
    setIsLoading(true);
    setError(null);

    // Capture the mode at submission time before any async work
    const modeAtSubmission = inputMethod;

    try {
      let response: Response;

      if (inputMethod === 'file') {
        if (!parsedData || parsedData.length === 0) {
          throw new Error('Tidak ada data untuk diproses');
        }

        // Required columns are always passed through
        const REQUIRED_UPLOAD = new Set(['user_id', 'amount', 'merchant_category']);

        // Build the set of columns that should carry real values.
        // Deselected feature columns are omitted entirely so the backend
        // applies its imputation defaults for those fields.
        const allowedCols = new Set<string>(REQUIRED_UPLOAD);
        (Object.entries(selectedFeatures) as [string, boolean][]).forEach(([key, enabled]) => {
          if (enabled) allowedCols.add(key);
        });

        const transactions: Transaction[] = parsedData.map((row) => {
          const tx: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(row)) {
            if (k === 'is_fraud') continue;
            if (!allowedCols.has(k)) continue; // omit → backend will impute
            tx[k] = v;
          }
          for (const col of NUMERIC_COLS) {
            if (tx[col] !== undefined && tx[col] !== '') {
              tx[col] = Number(tx[col]);
            }
          }
          return tx as unknown as Transaction;
        });

        response = await fetch(`${API_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions }),
        });
      } else {
        // Singular form — POST to /api/predict/single
        const body: Transaction = {
          transaction_time: formData.transaction_time || new Date().toISOString(),
          amount:            Number(formData.amount),
          merchant_category: formData.merchant_category,
          channel:           formData.channel,
          avs_match:         Number(formData.avs_match),
          cvv_result:        Number(formData.cvv_result),
          three_ds_flag:     Number(formData.three_ds_flag),
          promo_used:        Number(formData.promo_used),
        };
        if (formData.account_age_days)     body.account_age_days     = Number(formData.account_age_days);
        if (formData.shipping_distance_km) body.shipping_distance_km = Number(formData.shipping_distance_km);
        if (formData.country)              body.country               = formData.country;
        if (formData.bin_country)          body.bin_country           = formData.bin_country;
        if (formData.user_id)              body.user_id               = Number(formData.user_id);

        response = await fetch(`${API_URL}/api/predict/single`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch((): Record<string, unknown> => ({}));
        const apiMessage = typeof errorData.error === 'string' ? errorData.error : `API Error: ${response.statusText}`;
        throw new Error(apiMessage);
      }

      const data = await response.json();

      // Normalise single-result response to DetectionResult shape
      const result: DetectionResult = inputMethod === 'form'
        ? _singleToDetectionResult(data)
        : data as DetectionResult;

      // Lock the display layout to the mode used at submission time
      setSubmittedInputMethod(modeAtSubmission);
      setResults(result);
      toast({
        type: 'success',
        title: 'Deteksi selesai',
        description: `${result.batch_summary.processed} transaksi berhasil diproses.`,
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal melakukan deteksi';
      setError(message);
      toast({
        type: 'error',
        title: 'Deteksi gagal',
        description: message,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = (format: 'csv' | 'xlsx') => {
    // The template always contains all columns regardless of which feature
    // checkboxes are currently selected. Feature checkboxes only control which
    // columns are sent to the model during inference — not what appears in the template.
    const allRows = [
      {
        user_id: 1,
        amount: 84.75,
        merchant_category: 'travel',
        channel: 'web',
        country: 'FR',
        bin_country: 'FR',
        account_age_days: 141,
        shipping_distance_km: 370.95,
        promo_used: 0,
        avs_match: 1,
        cvv_result: 1,
        three_ds_flag: 1,
        transaction_time: '2024-01-06T04:09:39Z',
      },
      {
        user_id: 1,
        amount: 107.90,
        merchant_category: 'travel',
        channel: 'web',
        country: 'FR',
        bin_country: 'FR',
        account_age_days: 141,
        shipping_distance_km: 149.62,
        promo_used: 0,
        avs_match: 0,
        cvv_result: 0,
        three_ds_flag: 0,
        transaction_time: '2024-01-09T20:13:47Z',
      },
      {
        user_id: 2,
        amount: 215.00,
        merchant_category: 'electronics',
        channel: 'app',
        country: 'US',
        bin_country: 'US',
        account_age_days: 730,
        shipping_distance_km: 50.0,
        promo_used: 1,
        avs_match: 1,
        cvv_result: 1,
        three_ds_flag: 0,
        transaction_time: '2024-02-14T10:22:00Z',
      },
    ];

    // Ensure column order matches TEMPLATE_COLUMNS
    const orderedRows = allRows.map(row =>
      Object.fromEntries(TEMPLATE_COLUMNS.map(col => [col, (row as Record<string, unknown>)[col]]))
    );

    if (format === 'csv') {
      _downloadSheet(orderedRows, 'template_transaksi.csv', 'csv');
      toast({
        type: 'success',
        title: 'Template CSV diunduh',
        description: 'Template transaksi siap diisi.',
      });
      return;
    }

    // XLSX: main sheet = Data, plus reference sheets
    const wb = XLSX.utils.book_new();

    // Sheet 1: Data
    const wsData = XLSX.utils.json_to_sheet(orderedRows);
    // Bold the header row
    const range = XLSX.utils.decode_range(wsData['!ref'] ?? 'A1');
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = wsData[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) cell.s = { font: { bold: true } };
    }
    XLSX.utils.book_append_sheet(wb, wsData, 'Data');

    // Sheet 2: Petunjuk (all columns — always the complete guide)
    const fieldGuide = [
      { kolom: 'user_id',                  wajib: 'Ya',       tipe: 'Integer',  keterangan: 'ID unik pengguna (angka bulat)' },
      { kolom: 'amount',                   wajib: 'Ya',       tipe: 'Desimal',  keterangan: 'Jumlah transaksi dalam USD' },
      { kolom: 'merchant_category',        wajib: 'Ya',       tipe: 'Teks',     keterangan: 'Kategori merchant — lihat sheet Merchant Category' },
      { kolom: 'transaction_time',         wajib: 'Tidak',    tipe: 'Teks',     keterangan: 'Format ISO 8601: YYYY-MM-DDTHH:MM:SSZ  Contoh: 2024-01-06T04:09:39Z' },
      { kolom: 'channel',                  wajib: 'Tidak',    tipe: 'Teks',     keterangan: 'Kanal transaksi — lihat sheet Channel' },
      { kolom: 'country',                  wajib: 'Tidak',    tipe: 'Teks',     keterangan: 'Negara tempat transaksi (kode 2 huruf) — lihat sheet Country & BIN Country' },
      { kolom: 'bin_country',              wajib: 'Tidak',    tipe: 'Teks',     keterangan: 'Negara penerbit kartu/BIN (kode 2 huruf) — jika kosong, diisi dari country' },
      { kolom: 'account_age_days',         wajib: 'Tidak',    tipe: 'Integer',  keterangan: 'Usia akun dalam hari. Default: 973' },
      { kolom: 'shipping_distance_km',     wajib: 'Tidak',    tipe: 'Desimal',  keterangan: 'Jarak pengiriman dalam km. Default: 356.9' },
      { kolom: 'avs_match',                wajib: 'Tidak',    tipe: '0 atau 1', keterangan: 'Alamat tagihan cocok dengan data bank: 1=Ya, 0=Tidak. Default: 1' },
      { kolom: 'cvv_result',               wajib: 'Tidak',    tipe: '0 atau 1', keterangan: 'Kode CVV kartu valid: 1=Valid, 0=Tidak Valid. Default: 1' },
      { kolom: 'three_ds_flag',            wajib: 'Tidak',    tipe: '0 atau 1', keterangan: 'Autentikasi 3D Secure berhasil: 1=Ya, 0=Tidak. Default: 1' },
      { kolom: 'promo_used',               wajib: 'Tidak',    tipe: '0 atau 1', keterangan: 'Menggunakan promo/diskon: 1=Ya, 0=Tidak. Default: 0' },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fieldGuide), 'Petunjuk Kolom');

    // Sheet 3: merchant_category
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { nilai: 'electronics', keterangan: 'Elektronik (hp, laptop, dll)' },
      { nilai: 'travel',      keterangan: 'Perjalanan (tiket, hotel, dll)' },
      { nilai: 'grocery',     keterangan: 'Kebutuhan sehari-hari / supermarket' },
      { nilai: 'gaming',      keterangan: 'Game dan hiburan digital' },
      { nilai: 'fashion',     keterangan: 'Pakaian dan aksesoris' },
    ]), 'Merchant Category');

    // Sheet 4: channel
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { nilai: 'web', keterangan: 'Transaksi melalui website' },
      { nilai: 'app', keterangan: 'Transaksi melalui aplikasi mobile' },
    ]), 'Channel');

    // Sheet 5: country & bin_country (same values)
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { kode: 'US', negara: 'Amerika Serikat', digunakan_untuk: 'country, bin_country' },
      { kode: 'GB', negara: 'Inggris',         digunakan_untuk: 'country, bin_country' },
      { kode: 'FR', negara: 'Prancis',         digunakan_untuk: 'country, bin_country' },
      { kode: 'NL', negara: 'Belanda',         digunakan_untuk: 'country, bin_country' },
      { kode: 'TR', negara: 'Turki',           digunakan_untuk: 'country, bin_country' },
      { kode: 'PL', negara: 'Polandia',        digunakan_untuk: 'country, bin_country' },
      { kode: 'RO', negara: 'Rumania',         digunakan_untuk: 'country, bin_country' },
      { kode: 'DE', negara: 'Jerman',          digunakan_untuk: 'country, bin_country' },
      { kode: 'ES', negara: 'Spanyol',         digunakan_untuk: 'country, bin_country' },
      { kode: 'IT', negara: 'Italia',          digunakan_untuk: 'country, bin_country' },
    ]), 'Country & BIN Country');

    XLSX.writeFile(wb, 'template_transaksi.xlsx');
    toast({
      type: 'success',
      title: 'Template XLSX diunduh',
      description: 'Template transaksi siap diisi.',
    });
  };

  const downloadResults = (format: 'csv' | 'xlsx') => {
    if (!results) {
      toast({
        type: 'error',
        title: 'Belum ada hasil',
        description: 'Jalankan deteksi sebelum mengunduh hasil.',
      });
      return;
    }

    const rows = results.predictions.map((p, i) => {
      // Merge original input row (by position) with prediction columns
      const input = parsedData?.[i] ?? (submittedInputMethod === 'form' ? formData : {});
      // Keep only template columns, in template order
      const inputCols = Object.fromEntries(
        TEMPLATE_COLUMNS
          .filter(col => col in input)
          .map(col => [col, (input as Record<string, unknown>)[col]])
      );
      const status = getSellerStatus(p.is_fraud);
      return {
        ...inputCols,
        hasil:             status.badge,
        confidence_score:  p.fraud_probability,
        arti_untuk_seller: status.meaning,
        saran_tindakan:    status.suggestion,
      };
    });

    _downloadSheet(rows, `hasil_deteksi_${Date.now()}.${format}`, format);
    toast({
      type: 'success',
      title: 'Hasil diunduh',
      description: `File ${format.toUpperCase()} berhasil dibuat.`,
    });
  };

  const resetDetection = () => {
    setResults(null);
    setSubmittedInputMethod(null);
    setUploadedFile(null);
    setParsedData(null);
    setError(null);
    setFormData({
      user_id: '',
      amount: '',
      merchant_category: '',
      channel: 'web',
      account_age_days: '',
      shipping_distance_km: '',
      avs_match: '1',
      cvv_result: '1',
      three_ds_flag: '1',
      promo_used: '0',
      country: 'US',
      bin_country: 'US',
      transaction_time: new Date().toISOString().slice(0, 16),
    });
    toast({
      type: 'info',
      title: 'Form deteksi direset',
      description: 'Silakan mulai analisis transaksi baru.',
    });
  };

  return {
    results, uploadedFile, parsedData, inputMethod, submittedInputMethod,
    selectedFeatures, formData, isLoading, error,
    setInputMethod, handleFeatureToggle, handleFileUpload, handleFormChange,
    handleDetection, downloadTemplate, downloadResults, resetDetection,
  };
}

// ── Shared download helper ────────────────────────────────────────────────────

function _downloadSheet(rows: Record<string, unknown>[], filename: string, format: 'csv' | 'xlsx') {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  if (format === 'xlsx') {
    XLSX.writeFile(wb, filename);
  } else {
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

// Convert /api/predict/single response to DetectionResult shape
function _singleToDetectionResult(single: SingleResult): DetectionResult {
  const pred = {
    transaction_id:    single.transaction_id,
    user_id:           single.user_id,
    is_fraud:          single.is_fraud,
    fraud_probability: single.fraud_probability,
  };
  return {
    predictions:   [pred],
    skipped:       [],
    batch_summary: {
      total: 1, processed: 1, skipped: 0,
      flagged: single.is_fraud ? 1 : 0,
      fraud_rate: single.is_fraud ? 1 : 0,
    },
    model_info:       { model_name: single.model_used, f1: 0 },
    imputed_fields:   single.imputed_fields ?? [],
    warning:          single.warning ?? null,
    model_used:       single.model_used,
    threshold:        single.threshold,
    processing_time_ms: single.processing_time_ms,
    timestamp:        single.timestamp,
  };
}
