export function getSellerStatus(isFraud: boolean) {
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
