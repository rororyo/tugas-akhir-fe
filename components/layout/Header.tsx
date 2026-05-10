'use client';
import { Shield, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Header() {
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'detection', 'contributors'];
      const scrollPosition = window.scrollY + 120;
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;

      if (isBottom) {
        setActiveSection('contributors');
        return;
      }

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'home', label: 'Beranda' },
    { id: 'about', label: 'Tentang' },
    { id: 'detection', label: 'Deteksi' },
    { id: 'contributors', label: 'Kontributor' },
  ];

  return (
    <>
      <style>{`
        .sigap-logo-text {
          font-size: clamp(24px, 3vw, 32px);
        }
        .sigap-nav-item {
          font-size: clamp(16px, 1.3vw, 22px);
        }
        @media (max-width: 767px) {
          .sigap-nav-desktop { display: none !important; }
          .sigap-burger { display: flex !important; }
          .sigap-logo-text { font-size: 22px !important; }
          .sigap-logo-icon { width: 28px !important; height: 28px !important; }
        }
        @media (min-width: 768px) {
          .sigap-nav-desktop { display: flex !important; }
          .sigap-burger { display: none !important; }
        }
      `}</style>

      <nav
        className="bg-white fixed w-full top-0 z-50"
        style={{
          height: '100px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            padding: '0 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <button
            onClick={() => scrollToSection('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Shield
              className="sigap-logo-icon"
              style={{ color: '#2563EB', width: '32px', height: '32px' }}
              strokeWidth={2.5}
            />
            <span
              className="sigap-logo-text"
              style={{
                fontSize: '22px',
                fontWeight: '800',
                color: '#111827',
                letterSpacing: '-0.3px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              SIGAP
            </span>
          </button>

          {/* Desktop nav */}
          <div
            className="sigap-nav-desktop"
            style={{ alignItems: 'center', gap: '40px' }}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="sigap-nav-item"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                  fontSize: 'clamp(16px, 1.3vw, 22px)',
                  fontWeight: activeSection === item.id ? '700' : '400',
                  color: '#111827',
                  fontFamily: "'Inter', sans-serif",
                  borderBottom:
                    activeSection === item.id
                      ? '2px solid #111827'
                      : '2px solid transparent',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Burger button (mobile only) */}
          <button
            className="sigap-burger"
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: 'none', // overridden by media query
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: '#111827',
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100px',
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              borderTop: '1px solid #f3f4f6',
              zIndex: 100,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '18px 48px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: activeSection === item.id ? '700' : '400',
                  color: activeSection === item.id ? '#2563EB' : '#111827',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}