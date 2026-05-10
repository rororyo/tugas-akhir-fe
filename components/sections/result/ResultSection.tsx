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

export function ResultsSection({ results, inputMethod, onDownload, onReset }: ResultsSectionProps) {
  const [page, setPage] = useState(1);
  const perPage    = 5;
  const totalPages = Math.ceil(results.predictions.length / perPage);
  const paginated  = results.predictions.slice((page - 1) * perPage, page * perPage);

  const bs        = results.batch_summary;
  const pred0     = results.predictions[0];
  const hasImputed = (results.imputed_fields?.length ?? 0) > 0;

  return (
    <section
      id="results"
      style={{ backgroundColor: '#f3f4f6', padding: '72px 80px 80px', fontFamily: "'Inter', sans-serif" }}
    >
      <h2 style={{ fontSize: '48px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '40px', letterSpacing: '-0.5px' }}>
        Hasil Deteksi
      </h2>

      {/* Imputed-fields warning */}
      {hasImputed && (
        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', margin: '0 0 4px' }}>
              {results.warning ?? 'Beberapa fitur menggunakan nilai default.'}
            </p>
            <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>
              Fitur yang diimputasi: <strong>{results.imputed_fields.join(', ')}</strong>
            </p>
          </div>
        </div>
      )}

      {/* SINGULAR result card */}
      {inputMethod === 'form' && results.predictions.length === 1 ? (
        <div style={{ maxWidth: '720px', margin: '0 auto 32px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px 28px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <AlertCircle size={28} color={pred0.is_fraud ? '#dc2626' : '#16a34a'} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px', fontWeight: 500 }}>Hasil Deteksi Transaksi Tunggal</p>
            <p style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: '#111827' }}>
              Transaksi diprediksi{' '}
              <span style={{ color: pred0.is_fraud ? '#dc2626' : '#16a34a' }}>
                {pred0.is_fraud ? 'Fraud' : 'Normal'}
              </span>
            </p>
            <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>
              Probabilitas: <strong>{(pred0.fraud_probability * 100).toFixed(1)}%</strong>
              {' · '}Risiko: <strong>{pred0.risk_level}</strong>
              {' · '}Keyakinan: <strong>{pred0.confidence}</strong>
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* BATCH: summary stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {[
              { label: 'Total Transaksi',       value: bs.total,                border: '#2563EB' },
              { label: 'Transaksi Aman',         value: bs.processed - bs.flagged, border: '#16a34a' },
              { label: 'Transaksi Mencurigakan', value: bs.flagged,              border: '#dc2626' },
              { label: 'Dilewati (Tidak Valid)', value: bs.skipped,              border: '#9ca3af' },
            ].map(card => (
              <div key={card.label} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px 24px', border: '1px solid #e5e7eb', borderLeft: `4px solid ${card.border}` }}>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>{card.label}</p>
                <p style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0 }}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Results table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#2563EB' }}>
                  {['#', 'User ID', 'Prediksi', 'Probabilitas', 'Risiko'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((pred, idx) => {
                  const rowIdx = (page - 1) * perPage + idx;
                  return (
                    <tr key={idx} style={{ backgroundColor: rowIdx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                        {String(rowIdx + 1).padStart(3, '0')}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                        {pred.user_id ?? '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', backgroundColor: pred.is_fraud ? '#fee2e2' : '#dcfce7', color: pred.is_fraud ? '#dc2626' : '#16a34a' }}>
                          {pred.is_fraud ? 'Fraud' : 'Normal'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                        {pred.fraud_probability.toFixed(4)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>
                        {pred.risk_level}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                {(page - 1) * perPage + 1}–{Math.min(page * perPage, results.predictions.length)} dari {results.predictions.length}
              </span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={15} color="#374151" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: page === i + 1 ? '#2563EB' : '#ffffff', color: page === i + 1 ? '#ffffff' : '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}>
                  <ChevronRight size={15} color="#374151" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Download + Reset */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', maxWidth: '900px', margin: '0 auto' }}>
        {(['xlsx', 'csv'] as const).map(fmt => (
          <button key={fmt} onClick={() => onDownload(fmt)}
            style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '18px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'Inter', sans-serif" }}>
            <Download size={18} /> Download {fmt.toUpperCase()}
          </button>
        ))}
        <button onClick={onReset}
          style={{ backgroundColor: '#ffffff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '12px', padding: '18px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          Deteksi Baru
        </button>
      </div>
    </section>
  );
}
