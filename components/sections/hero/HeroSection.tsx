import { Shield, ShieldCheck, BarChart2, Share2 } from 'lucide-react';

export function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 88;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .hero-title { animation: slideInLeft 0.8s ease-out forwards; }
        .hero-desc { animation: slideInLeft 0.8s ease-out 0.2s forwards; opacity: 0; }
        .hero-btn { animation: slideInLeft 0.8s ease-out 0.4s forwards; opacity: 0; }
        .hero-img { animation: slideInRight 1s ease-out forwards; }
        .hero-logo { animation: fadeIn 1s ease-out 0.6s forwards; opacity: 0; }

        .hero-shell {
          padding: 72px 24px 80px;
        }
        .hero-layout {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .hero-col {
          width: 100%;
        }
        .hero-logo-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          row-gap: 24px;
        }
        @media (min-width: 768px) {
          .hero-shell {
            padding: 96px 80px 80px;
          }
          .hero-layout {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
            gap: 72px;
          }
          .hero-col {
            flex: 0 0 50%;
            max-width: 50%;
          }
          .hero-image-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .hero-logo-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>

      <div
        style={{
          background:
            'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
          paddingTop: '72px',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="hero-shell" style={{ width: '100%' }}>
          <div className="hero-layout">
            {/* Left: Text */}
            <div className="hero-col" style={{ maxWidth: 560 }}>
              <h1
                className="hero-title"
                style={{
                  fontSize: 'clamp(36px, 5vw, 60px)',
                  fontWeight: '800',
                  color: '#ffffff',
                  lineHeight: '1.15',
                  marginBottom: '20px',
                  letterSpacing: '-1px',
                }}
              >
                Smart Intelligence for
                <br />
                Guarding and
                <br />
                Analyzing Payments
              </h1>
              <p
                className="hero-desc"
                style={{
                  fontSize: 'clamp(18px, 1.6vw, 22px)',
                  color: 'white',
                  opacity: 0.9,
                  marginBottom: '40px',
                  fontWeight: '400',
                  lineHeight: '1.6',
                }}
              >
                Melindungi ekosistem e-commerce Anda dengan deteksi penipuan berbasis Graph Neural Networks (GNN) yang mutakhir.
              </p>
              <button
                className="hero-btn"
                onClick={() => scrollToSection('detection')}
                style={{
                  background: '#ffffff',
                  color: '#2563eb',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '18px 48px',
                  fontSize: 'clamp(16px, 1.4vw, 18px)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.2)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Mulai Deteksi Sekarang
              </button>
            </div>

            {/* Right: Hero image (50%) */}
            <div
              className="hero-col hero-image-wrapper hero-img"
              style={{
                borderRadius: '16px',
                alignSelf: 'center',
              }}
            >
              <img
                src="/images/hero/hero.png"
                alt="SIGAP Dashboard Preview"
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  height: 'auto',
                  display: 'block',
                  filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.3))',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logo bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '28px 80px',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <div
          className="hero-logo-grid"
          style={{ alignItems: 'center' }}
        >
          {[
            { src: '/images/hero/its.svg', alt: 'Institut Teknologi Sepuluh Nopember' },
            { src: '/images/hero/if.svg', alt: 'Informatika ITS' },
            { src: '/images/hero/rpl.svg', alt: 'Software Engineering' },
            { src: '/images/hero/dikti.svg', alt: 'Diktisaintek Berdampak' },
          ].map((logo, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 24px',
                borderRight: i < 3 ? '1px solid #e5e7eb' : 'none',
              }}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                style={{ maxWidth: '120px', width: '100%', height: 'auto' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}