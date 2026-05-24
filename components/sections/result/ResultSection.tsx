'use client';

import { Download, ChevronLeft, ChevronRight, AlertCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { DetectionResult, InputMethod } from '@/types';

interface ResultsSectionProps {
  results: DetectionResult;
  inputMethod: InputMethod;
  onDownload: (format: 'csv' | 'xlsx') => void;
  onReset: () => void;
}

function getSellerStatus(isFraud: boolean) {
  if (isFraud) {
    return {
      title: 'Transaksi berisiko',
      badge: 'Berisiko',
      color: '#dc2626',
      bg: '#fee2e2',
      meaning: 'SIGAP menemukan pola yang sangat mirip dengan pesanan berisiko.',
      suggestion: 'Tahan proses pesanan sementara. Periksa ulang alamat, metode pembayaran, dan pola pesanan sebelum mengirim barang.',
    };
  }
  return {
    title: 'Transaksi terindikasi aman',
    badge: 'Aman',
    color: '#16a34a',
    bg: '#dcfce7',
    meaning: 'Data pesanan tidak menunjukkan sinyal risiko yang kuat.',
    suggestion: 'Pesanan terlihat aman berdasarkan data yang diisi, tetapi tetap cek detail pesanan seperti biasa.',
  };
}

export function ResultsSection({ results, inputMethod, onDownload, onReset }: ResultsSectionProps) {
  const [page, setPage] = useState(1);
  const perPage = 5;
  const totalPages = Math.ceil(results.predictions.length / perPage);
  const paginated = results.predictions.slice((page - 1) * perPage, page * perPage);

  const bs = results.batch_summary;
  const pred0 = results.predictions[0];
  const hasImputed = (results.imputed_fields?.length ?? 0) > 0;
  const singleStatus = pred0 ? getSellerStatus(pred0.is_fraud) : null;

  return (
    <section
      id="results"
      style={{ backgroundColor: '#f3f4f6', padding: '72px 80px 80px', fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        .results-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .results-table-wrap { overflow-x: auto; }
        .results-actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .results-download-section {
          max-width: 980px;
          margin: 0 auto 24px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 18px 20px;
        }
        .results-download-title {
          margin: 0 0 8px;
          color: #111827;
          font-size: 18px;
          font-weight: 800;
        }
        .results-download-text {
          margin: 0;
          color: #334155;
          font-size: 14px;
          line-height: 1.7;
          margin-bottom: 18px;
        }
        .results-reset-button {
          background-color: #ffffff;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 18px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        @media (max-width: 900px) {
          #results { padding: 56px 18px 96px !important; }
          #results h2 { font-size: 34px !important; }
          .results-stat-grid { grid-template-columns: 1fr; }
          .results-download-section { padding: 16px 18px; }
          .results-actions { grid-template-columns: 1fr; }
        }
      `}</style>

      <h2 style={{ fontSize: '48px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '40px', letterSpacing: 0 }}>
        Hasil Cek Risiko
      </h2>

      {hasImputed && (
        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', margin: '0 0 4px' }}>
              {results.warning ?? 'Beberapa data pesanan memakai nilai bawaan.'}
            </p>
            <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>
              Data yang dilengkapi otomatis: <strong>{results.imputed_fields.join(', ')}</strong>
            </p>
          </div>
        </div>
      )}

      {inputMethod === 'form' && results.predictions.length === 1 && singleStatus ? (
        <div style={{ maxWidth: '760px', margin: '0 auto 32px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px 28px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <AlertCircle size={28} color={singleStatus.color} style={{ flex: '0 0 auto', marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 10px', fontWeight: 700 }}>Ringkasan risiko pesanan</p>
            <span style={{ display: 'inline-flex', padding: '6px 16px', borderRadius: '999px', fontSize: '14px', fontWeight: 800, backgroundColor: singleStatus.bg, color: singleStatus.color, marginBottom: '12px' }}>
              {singleStatus.badge}
            </span>
            <p style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px', color: '#111827' }}>
              {singleStatus.title}
            </p>
            <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 10px', lineHeight: 1.6 }}>
              {singleStatus.meaning}
            </p>
            <p style={{ fontSize: '14px', color: '#334155', margin: 0, lineHeight: 1.6, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
              {singleStatus.suggestion}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="results-stat-grid">
            {[
              { label: 'Total Pesanan', value: bs.total, border: '#2563EB' },
              { label: 'Terindikasi Aman', value: bs.processed - bs.flagged, border: '#16a34a' },
              { label: 'Terindikasi Berisiko', value: bs.flagged, border: '#dc2626' },
              { label: 'Dilewati', value: bs.skipped, border: '#9ca3af' },
            ].map(card => (
              <div key={card.label} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px 24px', border: '1px solid #e5e7eb', borderLeft: `4px solid ${card.border}` }}>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>{card.label}</p>
                <p style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0 }}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="results-table-wrap" style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
            <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#2563EB' }}>
                  {['#', 'ID Pembeli', 'Status', 'Arti untuk Seller', 'Saran Tindakan'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((pred, idx) => {
                  const rowIdx = (page - 1) * perPage + idx;
                  const status = getSellerStatus(pred.is_fraud);
                  return (
                    <tr key={idx} style={{ backgroundColor: rowIdx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                        {String(rowIdx + 1).padStart(3, '0')}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                        {pred.user_id ?? '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', backgroundColor: status.bg, color: status.color }}>
                          {status.badge}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', lineHeight: 1.55 }}>
                        {status.meaning}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', lineHeight: 1.55 }}>
                        {status.suggestion}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                {(page - 1) * perPage + 1}-{Math.min(page * perPage, results.predictions.length)} dari {results.predictions.length}
              </span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={15} color="#374151" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setPage(i + 1)}
                    style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: page === i + 1 ? '#2563EB' : '#ffffff', color: page === i + 1 ? '#ffffff' : '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                    {i + 1}
                  </button>
                ))}
                <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}>
                  <ChevronRight size={15} color="#374151" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="results-download-section">
        <p className="results-download-title">Download Hasil Deteksi</p>
        <p className="results-download-text">
          Gunakan tombol download di bawah untuk menyimpan hasil deteksi. Format
          <strong> XLSX </strong>
          cocok untuk dibuka di Excel atau spreadsheet, sedangkan
          <strong> CSV </strong>
          cocok untuk ekspor data yang lebih ringan dan sederhana.
        </p>
        <div className="results-actions">
          <button type="button" onClick={() => onDownload('xlsx')}
            style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '18px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'Inter', sans-serif" }}>
            <Download size={18} /> Download XLSX
          </button>
          <button type="button" onClick={() => onDownload('csv')}
            style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '18px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'Inter', sans-serif" }}>
            <Download size={18} /> Download CSV
          </button>
          <button type="button" onClick={onReset} className="results-reset-button">
            Cek Pesanan Baru
          </button>
        </div>
      </div>
    </section>
  );
}
