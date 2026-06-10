export function getSellerStatus(isFraud: boolean, probability: number) {
  if (isFraud && probability >= 0.75) {
    return {
      title: 'Transaksi berisiko tinggi',
      badge: 'Berisiko',
      color: '#dc2626',
      bg: '#fee2e2',
      suggestion: 'Tahan proses pesanan sementara. Periksa ulang alamat, metode pembayaran, dan pola pesanan sebelum mengirim barang.',
      meaning: 'SIGAP menemukan pola yang sangat mirip dengan pesanan berisiko.',
    };
  }

  if (isFraud) {
    return {
      title: 'Transaksi perlu ditinjau ulang',
      badge: 'Perlu Dicek',
      color: '#d97706',
      bg: '#fef3c7',
      suggestion: 'Periksa ulang alamat, metode pembayaran, dan pola pesanan sebelum memproses pesanan.',
      meaning: 'Ada sinyal yang tidak biasa, sehingga pesanan sebaiknya dicek ulang.',
    };
  }

  return {
    title: 'Transaksi terindikasi aman',
    badge: 'Aman',
    color: '#16a34a',
    bg: '#dcfce7',
    suggestion: 'Pesanan terlihat aman berdasarkan data yang diisi, tetapi tetap cek detail pesanan seperti biasa.',
    meaning: 'Data pesanan tidak menunjukkan sinyal risiko yang kuat.',
  };
}
