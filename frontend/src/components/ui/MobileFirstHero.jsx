import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShimmerButton } from './shimmer-button';
import { PulsatingButton } from './pulsating-button';
import { RetroGrid } from './retro-grid';
import '../../assets/css/MobileFirst.css';
import '../../assets/css/animations.css';

const MobileFirstHero = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    { number: '5K+', label: 'Khách hàng tin tưởng', icon: '👥' },
    { number: '98%', label: 'Hài lòng', icon: '⭐' },
    { number: '100%', label: 'Bền vững', icon: '🌱' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-mobile-first">
      {/* Background với RetroGrid */}
      <div className="hero-background">
        <RetroGrid 
          cellSize={60} 
          opacity={0.15}
          lightLineColor="#5FB584"
          darkLineColor="#0A4B3E"
          className="hero-grid"
        />
        <div className="hero-gradient-overlay"></div>
      </div>

      <div className="container">
        <div className="hero-content">
          {/* Hero Title - Mobile Optimized */}
          <div className={`hero-title-container ${isVisible ? 'fade-in' : ''}`}>
            <h1 className="hero-title">
              <span className="hero-title-main">
                Thời trang
              </span>
              <span className="hero-title-accent animate-gradient">
                Bền vững
              </span>
              <span className="hero-title-sub">
                Cho tương lai
              </span>
            </h1>
          </div>

          {/* Hero Description */}
          <div className={`hero-description-container ${isVisible ? 'slide-up' : ''}`}>
            <p className="hero-description">
              Khám phá bộ sưu tập thời trang có ý thức sinh thái, 
              được thiết kế để bảo vệ hành tinh và thể hiện phong cách của bạn.
            </p>
          </div>

          {/* Statistics Carousel - Mobile Optimized */}
          <div className={`hero-stats-mobile ${isVisible ? 'fade-in' : ''}`}>
            <div className="stat-card-mobile">
              <div className="stat-icon">{stats[currentStat].icon}</div>
              <div className="stat-number animate-glow">{stats[currentStat].number}</div>
              <div className="stat-label">{stats[currentStat].label}</div>
            </div>
            
            {/* Stat Indicators */}
            <div className="stat-indicators">
              {stats.map((_, index) => (
                <div 
                  key={index}
                  className={`stat-dot ${index === currentStat ? 'active' : ''}`}
                  onClick={() => setCurrentStat(index)}
                />
              ))}
            </div>
          </div>

          {/* CTA Buttons - Mobile First */}
          <div className={`hero-actions ${isVisible ? 'zoom-in' : ''}`}>
            <ShimmerButton
              className="hero-cta-primary"
              shimmerColor="#D4AF37"
              background="linear-gradient(135deg, #5FB584 0%, #0A4B3E 100%)"
              onClick={() => navigate('/products')}
            >
              <span className="cta-text">Khám phá ngay</span>
              <span className="cta-icon">→</span>
            </ShimmerButton>

            <PulsatingButton
              className="hero-cta-secondary mobile-only"
              pulseColor="#5FB584"
              onClick={() => navigate('/about')}
            >
              <span className="cta-text">Tìm hiểu thêm</span>
            </PulsatingButton>
          </div>
        </div>

        {/* Hero Image - Mobile Optimized */}
        <div className={`hero-image-container tablet-up ${isVisible ? 'slide-left' : ''}`}>
          <div className="hero-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Thời trang bền vững GreenWeave"
              className="hero-image"
              loading="lazy"
            />
            <div className="hero-image-overlay"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-mobile-first {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding: var(--space-12) 0;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
        }

        .hero-grid {
          width: 100%;
          height: 100%;
        }

        .hero-gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(232, 245, 232, 0.8) 50%,
            rgba(255, 255, 255, 0.95) 100%
          );
        }

        .hero-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 100%;
        }

        /* Mobile-First Typography */
        .hero-title {
          font-family: var(--font-secondary);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: var(--space-6);
          letter-spacing: -0.02em;
        }

        .hero-title-main {
          display: block;
          font-size: 2.25rem;
          color: var(--gray-900);
        }

        .hero-title-accent {
          display: block;
          font-size: 3rem;
          background: linear-gradient(135deg, #5FB584 0%, #0A4B3E 70%, #D4AF37 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: var(--space-2) 0;
        }

        .hero-title-sub {
          display: block;
          font-size: 1.75rem;
          color: var(--gray-700);
        }

        .hero-description {
          font-size: var(--text-lg);
          color: var(--gray-600);
          line-height: 1.6;
          margin-bottom: var(--space-8);
          max-width: 28rem;
          margin-left: auto;
          margin-right: auto;
        }

        /* Mobile Stats Carousel */
        .hero-stats-mobile {
          margin-bottom: var(--space-8);
          text-align: center;
        }

        .stat-card-mobile {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-lg);
          margin-bottom: var(--space-4);
          border: 1px solid rgba(95, 181, 132, 0.2);
        }

        .stat-icon {
          font-size: 2rem;
          margin-bottom: var(--space-2);
        }

        .stat-number {
          font-family: var(--font-secondary);
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--green-secondary);
          display: block;
          margin-bottom: var(--space-1);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--gray-600);
          font-weight: 500;
        }

        .stat-indicators {
          display: flex;
          justify-content: center;
          gap: var(--space-2);
        }

        .stat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--gray-300);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .stat-dot.active {
          background: var(--green-primary);
          transform: scale(1.25);
        }

        /* CTA Buttons */
        .hero-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          align-items: center;
          margin-bottom: var(--space-6);
        }

        .hero-cta-primary {
          width: 100%;
          max-width: 280px;
          height: 56px;
          font-size: var(--text-lg);
          font-weight: 700;
          border-radius: var(--radius-xl);
        }

        .hero-cta-secondary {
          width: 100%;
          max-width: 280px;
          height: 48px;
          border: 2px solid var(--green-primary);
          background: transparent;
          color: var(--green-primary);
        }

        .cta-text {
          margin-right: var(--space-2);
        }

        .cta-icon {
          font-size: var(--text-xl);
          transition: transform var(--transition-fast);
        }

        .hero-cta-primary:hover .cta-icon {
          transform: translateX(4px);
        }

        /* Tablet and Desktop Responsive */
        @media (min-width: 768px) {
          .hero-mobile-first {
            padding: var(--space-16) 0;
          }

          .container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-12);
            align-items: center;
          }

          .hero-content {
            text-align: left;
          }

          .hero-title-main {
            font-size: 3rem;
          }

          .hero-title-accent {
            font-size: 4rem;
          }

          .hero-title-sub {
            font-size: 2.5rem;
          }

          .hero-actions {
            flex-direction: row;
            justify-content: flex-start;
          }

          .hero-cta-primary,
          .hero-cta-secondary {
            width: auto;
            min-width: 160px;
          }

          .hero-stats-mobile {
            display: none;
          }
        }

        @media (min-width: 1024px) {
          .hero-title-main {
            font-size: 3.5rem;
          }

          .hero-title-accent {
            font-size: 5rem;
          }

          .hero-title-sub {
            font-size: 3rem;
          }

          .hero-description {
            font-size: var(--text-xl);
            max-width: 32rem;
            margin-left: 0;
          }
        }

        /* Hero Image - Tablet+ */
        .hero-image-container {
          position: relative;
        }

        .hero-image-wrapper {
          position: relative;
          border-radius: var(--radius-2xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
        }

        .hero-image {
          width: 100%;
          height: auto;
          display: block;
        }

        .hero-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(95, 181, 132, 0.1) 0%,
            rgba(10, 75, 62, 0.2) 100%
          );
        }

        .slide-left {
          animation: slideLeft 0.8s ease-out 0.3s forwards;
          opacity: 0;
          transform: translateX(30px);
        }

        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
};

export default MobileFirstHero; 