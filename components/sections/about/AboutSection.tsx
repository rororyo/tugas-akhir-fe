import { Shield, Zap, Download } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function AboutSection() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const cards = [
    {
      icon: <Shield size={64} color="#2563EB" strokeWidth={1.5} />,
      title: 'Privasi Terjamin',
      desc: 'SIGAP tidak menyimpan data Anda, dan Anda memiliki kendali penuh untuk memilih fitur atau data yang ingin dibagikan.',
    },
    {
      icon: <Zap size={64} color="#2563EB" strokeWidth={1.5} />,
      title: 'Cepat & Akurat',
      desc: 'GNN membantu model membaca relasi secara lebih cerdas, memberikan akurasi yang lebih tinggi dengan respons yang tetap optimal.',
    },
    {
      icon: <Download size={64} color="#2563EB" strokeWidth={1.5} />,
      title: 'Kemudahan Export',
      desc: 'Hasil deteksi dapat diunduh dalam bentuk xlsx atau csv',
    },
  ];

  return (
    <section
      id="about"
      ref={ref}
      style={{
        backgroundColor: '#ffffff',
        padding: '120px 80px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal-item {
          opacity: 0;
        }
        .reveal-item.visible {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .about-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: default;
        }
        .about-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          background-color: #ffffff !important;
          border-color: #2563eb !important;
        }
        .icon-wrapper {
          transition: transform 0.4s ease;
        }
        .about-card:hover .icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }
      `}</style>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }} className={`reveal-item ${isVisible ? 'visible' : ''}`}>
        <h2
          style={{
            fontSize: '48px',
            fontWeight: '800',
            color: '#111827',
            letterSpacing: '-0.5px',
            marginBottom: '20px',
          }}
        >
          Tentang SIGAP
        </h2>
        <p
          style={{
            fontSize: '20px',
            color: '#374151',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontWeight: '400',
          }}
        >
          SIGAP adalah layanan deteksi penipuan e-commerce berbasis AI yang
          dirancang untuk meningkatkan keamanan transaksi secara cepat,
          akurat, dan tetap menjaga privasi pengguna.
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '32px',
          marginTop: '80px',
        }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className={`reveal-item about-card ${isVisible ? 'visible' : ''}`}
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '24px',
              padding: '48px 36px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              animationDelay: `${i * 0.15}s`,
            }}
          >
            <div className="icon-wrapper" style={{ marginBottom: '32px' }}>{card.icon}</div>
            <h3
              style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '16px',
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                fontSize: '16px',
                color: '#64748b',
                lineHeight: '1.7',
                fontWeight: '400',
              }}
            >
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}