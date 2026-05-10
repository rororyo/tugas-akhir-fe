'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import type { DetectionResult, SelectedFeatures, InputMethod, Transaction, FormData } from '@/types';
import { parseFile } from '@/lib/utils/fileParser';


const API_URL = process.env.NEXT_PUBLIC_API_URL;

const NUMERIC_COLS = [
  'amount', 'account_age_days', 'total_transactions_user',
  'avg_amount_user', 'shipping_distance_km',
  'avs_match', 'cvv_result', 'three_ds_flag', 'promo_used', 'user_id',
];

export function useDetection() {
  const [results, setResults] = useState<DetectionResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [inputMethod, setInputMethod] = useState<InputMethod>('file');
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
    three_ds_flag: '0',
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
    setUploadedFile(file);
    setError(null);
    try {
      setIsLoading(true);
      const data = await parseFile(file);
      setParsedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses file');
      setParsedData(null);
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

    try {
      let response: Response;

      if (inputMethod === 'file') {
        if (!parsedData || parsedData.length === 0) {
          throw new Error('Tidak ada data untuk diproses');
        }

        const transactions: Transaction[] = parsedData.map((row: any) => {
          const tx: any = { ...row };
          delete tx['is_fraud'];
          for (const col of NUMERIC_COLS) {
            if (tx[col] !== undefined && tx[col] !== '') {
              tx[col] = Number(tx[col]);
            }
          }
          return tx as Transaction;
        });

        response = await fetch(`${API_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions }),
        });
      } else {
        // Singular form — POST to /api/predict/single
        const body: any = {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Normalise single-result response to DetectionResult shape
      const result: DetectionResult = inputMethod === 'form'
        ? _singleToDetectionResult(data)
        : data as DetectionResult;

      setResults(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal melakukan deteksi';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = (format: 'csv' | 'xlsx') => {
    // user_id, amount, merchant_category are always present — required fields
    // cannot be filtered out. Everything else follows selectedFeatures.
    const REQUIRED_ALWAYS = new Set(['user_id', 'amount', 'merchant_category']);

    const enabledCols = new Set<string>(REQUIRED_ALWAYS);
    (Object.entries(selectedFeatures) as [string, boolean][]).forEach(([key, enabled]) => {
      if (enabled) enabledCols.add(key);
    });

    // Filter a full row object down to only enabled columns
    const filterRow = (row: Record<string, unknown>) =>
      Object.fromEntries(Object.entries(row).filter(([k]) => enabledCols.has(k)));

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

    const dataRows = allRows.map(filterRow);

    if (format === 'csv') {
      _downloadSheet(dataRows, 'template_transaksi.csv', 'csv');
      return;
    }

    // XLSX: main sheet = Data, plus one sheet per categorical column
    const wb = XLSX.utils.book_new();

    // Sheet 1: Data
    const wsData = XLSX.utils.json_to_sheet(dataRows);
    // Bold the header row
    const range = XLSX.utils.decode_range(wsData['!ref'] ?? 'A1');
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = wsData[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) cell.s = { font: { bold: true } };
    }
    XLSX.utils.book_append_sheet(wb, wsData, 'Data');

    // Sheet 2: Petunjuk (field descriptions) — only for columns in this template
    const allFieldGuide = [
      { kolom: 'user_id',                  wajib: 'Ya',       tipe: 'Integer',  keterangan: 'ID unik pengguna (angka bulat)' },
      { kolom: 'amount',                   wajib: 'Ya',       tipe: 'Desimal',  keterangan: 'Jumlah transaksi dalam USD' },
      { kolom: 'merchant_category',        wajib: 'Ya',       tipe: 'Teks',     keterangan: 'Kategori merchant — lihat sheet Merchant Category' },
      { kolom: 'transaction_time',         wajib: 'Tidak',    tipe: 'Teks',     keterangan: 'Format ISO 8601: YYYY-MM-DDTHH:MM:SSZ  Contoh: 2024-01-06T04:09:39Z' },
      { kolom: 'channel',                  wajib: 'Tidak',    tipe: 'Teks',     keterangan: 'Kanal transaksi — lihat sheet Channel' },
      { kolom: 'country',                  wajib: 'Tidak',    tipe: 'Teks',     keterangan: 'Negara tempat transaksi (kode 2 huruf) — lihat sheet Country & BIN Country' },
      { kolom: 'bin_country',              wajib: 'Tidak',    tipe: 'Teks',     keterangan: 'Negara penerbit kartu/BIN (kode 2 huruf) — jika kosong, diisi dari country' },
      { kolom: 'account_age_days',         wajib: 'Tidak',    tipe: 'Integer',  keterangan: 'Usia akun dalam hari. Default: 365' },
      { kolom: 'shipping_distance_km',     wajib: 'Tidak',    tipe: 'Desimal',  keterangan: 'Jarak pengiriman dalam km. Default: 200' },
      { kolom: 'avs_match',                wajib: 'Tidak',    tipe: '0 atau 1', keterangan: 'Alamat tagihan cocok dengan data bank: 1=Ya, 0=Tidak. Default: 1' },
      { kolom: 'cvv_result',               wajib: 'Tidak',    tipe: '0 atau 1', keterangan: 'Kode CVV kartu valid: 1=Valid, 0=Tidak Valid. Default: 1' },
      { kolom: 'three_ds_flag',            wajib: 'Tidak',    tipe: '0 atau 1', keterangan: 'Autentikasi 3D Secure berhasil: 1=Ya, 0=Tidak. Default: 0' },
      { kolom: 'promo_used',               wajib: 'Tidak',    tipe: '0 atau 1', keterangan: 'Menggunakan promo/diskon: 1=Ya, 0=Tidak. Default: 0' },
    ];
    const fieldGuide = allFieldGuide.filter(r => enabledCols.has(r.kolom));
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
  };

  const downloadResults = (format: 'csv' | 'xlsx') => {
    if (!results) return;

    const rows = results.predictions.map((p, i) => {
      // Merge original input row (by position) with prediction columns
      const input: any = parsedData?.[i] ?? {};
      // Strip prediction columns and transaction_id that may have come from the file
      const { is_fraud: _a, fraud_probability: _b, risk_level: _c, confidence: _d, transaction_id: _e, ...inputCols } = input;
      return {
        ...inputCols,
        is_fraud:          p.is_fraud ? 'Yes' : 'No',
        fraud_probability: p.fraud_probability,
        risk_level:        p.risk_level,
        confidence:        p.confidence,
      };
    });

    _downloadSheet(rows, `hasil_deteksi_${Date.now()}.${format}`, format);
  };

  const resetDetection = () => {
    setResults(null);
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
      three_ds_flag: '0',
      promo_used: '0',
      country: 'US',
      bin_country: 'US',
      transaction_time: new Date().toISOString().slice(0, 16),
    });
  };

  return {
    results, uploadedFile, parsedData, inputMethod, selectedFeatures,
    formData, isLoading, error,
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
function _singleToDetectionResult(single: any): DetectionResult {
  const pred = {
    transaction_id:    single.transaction_id,
    user_id:           single.user_id,
    is_fraud:          single.is_fraud,
    fraud_probability: single.fraud_probability,
    confidence:        single.confidence,
    risk_level:        single.risk_level,
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
