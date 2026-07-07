// Maps UI labels (Indonesian) to backend field names (actual training schema)
export const DETECTION_FEATURES = [
  { key: 'amount',              label: 'Jumlah Transaksi (USD)', backendField: 'amount',              required: true,  defaultValue: 150.0    },
  { key: 'merchant_category',   label: 'Kategori Merchant',      backendField: 'merchant_category',   required: true,  defaultValue: 'general' },
  { key: 'transaction_time',    label: 'Waktu Transaksi',        backendField: 'transaction_time',    required: false, defaultValue: ''       },
  { key: 'channel',             label: 'Kanal Transaksi',        backendField: 'channel',             required: false, defaultValue: 'web'    },
  { key: 'account_age_days',    label: 'Usia Akun (Hari)',       backendField: 'account_age_days',    required: false, defaultValue: 973      },
  { key: 'shipping_distance_km',label: 'Jarak Pengiriman (km)',  backendField: 'shipping_distance_km',required: false, defaultValue: 356.9    },
  { key: 'avs_match',           label: 'AVS Match',              backendField: 'avs_match',           required: false, defaultValue: 1        },
  { key: 'cvv_result',          label: 'CVV Result',             backendField: 'cvv_result',          required: false, defaultValue: 1        },
  { key: 'three_ds_flag',       label: '3DS Flag',               backendField: 'three_ds_flag',       required: false, defaultValue: 1        },
  { key: 'promo_used',          label: 'Promo Digunakan',        backendField: 'promo_used',          required: false, defaultValue: 0        },
  { key: 'country',             label: 'Negara',                 backendField: 'country',             required: false, defaultValue: 'US'     },
  { key: 'bin_country',         label: 'Negara Kartu (BIN)',     backendField: 'bin_country',         required: false, defaultValue: 'US'     },
] as const;

// Values from actual training dataset
export const MERCHANT_CATEGORIES = [
  { value: '',            label: 'Pilih Kategori Toko' },
  { value: 'electronics', label: 'Elektronik' },
  { value: 'travel',      label: 'Travel & Tiket' },
  { value: 'grocery',     label: 'Makanan & Kebutuhan Harian' },
  { value: 'gaming',      label: 'Gaming & Digital' },
  { value: 'fashion',     label: 'Fashion' },
] as const;

export const CHANNELS = [
  { value: '',    label: 'Tidak tahu' },
  { value: 'web', label: 'Marketplace via Website' },
  { value: 'app', label: 'Aplikasi Marketplace' },
] as const;

// country / bin_country values from training dataset
export const COUNTRIES = [
  { value: '',   label: 'Tidak tahu' },
  { value: 'US', label: 'Amerika Serikat (US)' },
  { value: 'GB', label: 'Inggris (GB)' },
  { value: 'FR', label: 'Prancis (FR)' },
  { value: 'NL', label: 'Belanda (NL)' },
  { value: 'TR', label: 'Turki (TR)' },
  { value: 'PL', label: 'Polandia (PL)' },
  { value: 'RO', label: 'Rumania (RO)' },
  { value: 'DE', label: 'Jerman (DE)' },
  { value: 'ES', label: 'Spanyol (ES)' },
  { value: 'IT', label: 'Italia (IT)' },
] as const;

export const CONTRIBUTORS = [
  {
    name: 'Nathaniel Ryo Kurniadi',
    role: 'Judul Tugas Akhir',
    description: 'DETEKSI PENIPUAN TRANSAKSI E-COMMERCE MENGGUNAKAN METODE GNN DAN PENDEKATAN MACHINE LEARNING'
  },
  {
    name: 'Dr. Sarwosri, S.Kom. M.T',
    role: 'Dosen Pembimbing',
    description: ''
  },
  {
    name: 'Bintang Nuralamsyah, S.Kom, M.Kom',
    role: 'Dosen Ko-pembimbing',
    description: ''
  }
] as const;
