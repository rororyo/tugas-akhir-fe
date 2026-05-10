import { User } from 'lucide-react';
import { CONTRIBUTORS } from '@/lib/constants';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export function ContributorSection() {
  const { ref, isVisible } = useScrollReveal(0.15);
  return (
    <>
      <section
        id="contributors"
        ref={ref}
        style={{
          backgroundColor: '#ffffff',
          padding: '120px 80px 100px',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <style>{`
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .contributor-reveal {
            opacity: 0;
          }
          .contributor-reveal.visible {
            animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
          .contributor-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .contributor-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
            border-color: #2563eb !important;
            background-color: #ffffff !important;
          }
          .avatar-container {
            transition: all 0.4s ease;
          }
          .contributor-card:hover .avatar-container {
            border-color: #2563eb !important;
            background-color: #eff6ff !important;
            transform: rotate(3deg);
          }
        `}</style>

        <h2
          className={`contributor-reveal ${isVisible ? 'visible' : ''}`}
          style={{
            fontSize: '48px',
            fontWeight: '800',
            color: '#111827',
            textAlign: 'center',
            marginBottom: '64px',
            letterSpacing: '-0.5px',
          }}
        >
          Kontributor
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}
        >
          {CONTRIBUTORS.map((contributor, idx) => (
            <div
              key={idx}
              className={`contributor-reveal contributor-card ${isVisible ? 'visible' : ''}`}
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #f1f5f9',
                borderRadius: '24px',
                padding: '48px 32px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              {/* Avatar placeholder */}
              <div
                className="avatar-container"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '24px',
                  border: '2px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                }}
              >
                <User size={40} color="#2563eb" strokeWidth={1.5} />
              </div>

              <h3
                style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#111827',
                  marginBottom: '8px',
                  lineHeight: '1.2',
                }}
              >
                {contributor.name}
              </h3>

              {(contributor as any).nrp && (
                <div style={{ display: 'inline-block', backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>
                  NRP: {(contributor as any).nrp}
                </div>
              )}

              <p
                style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#475569',
                  marginBottom: contributor.description ? '12px' : '0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {contributor.role}
              </p>

              {contributor.description && (
                <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                  {contributor.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#111827',
          padding: '40px 80px',
          fontFamily: "'Inter', sans-serif",
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
          SIGAP Detection Service
        </p>
        <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>
          © 2026 All Rights Reserved
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0',
            borderTop: '1px solid #374151',
            paddingTop: '24px',
          }}
        >
          {['Contact', 'Privacy Policy', 'Terms of Service'].map((item, i) => (
            <span key={item} style={{ display: 'flex', alignItems: 'center' }}>
              <a
                href="#"
                style={{
                  fontSize: '13px',
                  color: '#9ca3af',
                  textDecoration: 'none',
                  padding: '0 20px',
                }}
              >
                {item}
              </a>
              {i < 2 && (
                <span style={{ color: '#4b5563', fontSize: '13px' }}>|</span>
              )}
            </span>
          ))}
        </div>
      </footer>
    </>
  );
}