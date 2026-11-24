import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { loaderImages } from '../../assets/loader';
import { BRAND } from '../../config/brandConfig';
import NavShutterOverlay from './NavShutterOverlay';
import './Navbar.css';

gsap.registerPlugin(ScrollTrigger);

// Helper to retrieve the active responsive header height token
const getHeaderHeight = () => {
  if (typeof window === 'undefined') return 96;
  const prop = getComputedStyle(document.documentElement)
    .getPropertyValue('--site-header-height')
    .trim();
  const parsed = parseFloat(prop);
  return !isNaN(parsed) && parsed > 0 ? parsed : (window.innerWidth <= 1024 ? 80 : 96);
};

/**
 * ZEYARCH Premium Navigation & ABVTEK-Style Horizontal Shutter System
 */
export default function Navbar({ onReplay }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [navTheme, setNavTheme] = useState('hero'); // 'hero' | 'light' | 'split'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);

  // Element Refs for GSAP
  const overlayRef = useRef(null);
  const leftPanelRef = useRef(null);
  const leftImageRef = useRef(null);
  const leftBrandRef = useRef(null);
  const rightPanelRef = useRef(null);
  const rightHeaderRef = useRef(null);
  const navLabelRef = useRef(null);
  const navLinksRef = useRef(null);
  const servicesSubmenuRef = useRef(null);
  const timelineRef = useRef(null);
  const shutterRef = useRef(null);

  // Handle Close with smooth GSAP exit
  const handleCloseMenu = () => {
    if (!overlayRef.current) return;

    document.body.style.overflow = '';

    const overlay = overlayRef.current;
    const rightPanel = rightPanelRef.current;
    const leftPanel = leftPanelRef.current;
    const navItems = navLinksRef.current
      ? navLinksRef.current.querySelectorAll('.split-nav-item')
      : [];
    const isDesktop = window.innerWidth > 1024;

    if (timelineRef.current) timelineRef.current.kill();

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { display: 'none', pointerEvents: 'none' });
        setIsMenuOpen(false);
        setIsServicesExpanded(false);
      },
    });

    timelineRef.current = tl;

    // Fast, elegant staggered exit
    tl.to(navItems, {
      opacity: 0,
      y: 10,
      duration: 0.15,
      stagger: 0.02,
      ease: 'power2.in',
    });

    if (isDesktop && rightPanel && leftPanel) {
      tl.to(
        rightPanel,
        {
          xPercent: 100,
          duration: 0.25,
          ease: 'power3.in',
        },
        '-=0.08'
      ).to(
        leftPanel,
        {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
        },
        '-=0.2'
      );
    } else {
      tl.to(overlay, {
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
      });
    }
  };

  // 1. Passive scroll listener for closed navbar appearance and theme detection
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const scrolled = scrollY > 80;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));

          const processEl = document.getElementById('process');
          const worksEl = document.getElementById('works');
          const expertiseEl = document.getElementById('expertise');
          const studioEl = document.getElementById('studio');
          const contactEl = document.getElementById('contact');

          const headerH = getHeaderHeight();
          let theme = 'hero';
          if (contactEl && contactEl.getBoundingClientRect().top <= headerH) {
            theme = 'hero';
          } else if (studioEl && studioEl.getBoundingClientRect().top <= headerH) {
            theme = 'light';
          } else if (expertiseEl && expertiseEl.getBoundingClientRect().top <= headerH) {
            theme = 'hero';
          } else if (worksEl && worksEl.getBoundingClientRect().top <= headerH) {
            theme = 'split';
          } else if (processEl && processEl.getBoundingClientRect().top <= headerH) {
            theme = 'light';
          } else {
            theme = 'hero';
          }
          setNavTheme((prev) => (prev !== theme ? theme : prev));

          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 2. Mobile menu scroll locking & Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        handleCloseMenu();
      }
    };

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // 3. GSAP Opening & Closing Animation Timeline
  useEffect(() => {
    if (!overlayRef.current) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const overlay = overlayRef.current;
    const leftPanel = leftPanelRef.current;
    const leftImage = leftImageRef.current;
    const leftBrand = leftBrandRef.current;
    const rightPanel = rightPanelRef.current;
    const rightHeader = rightHeaderRef.current;
    const navLabel = navLabelRef.current;
    const navItems = navLinksRef.current
      ? navLinksRef.current.querySelectorAll('.split-nav-item')
      : [];

    const isDesktop = window.innerWidth > 1024;

    if (isMenuOpen) {
      // Coordinated Opening Timeline (~750ms)
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });
      timelineRef.current = tl;

      // Initial state
      tl.set(overlay, { display: 'flex', opacity: 1, pointerEvents: 'all' });

      if (isDesktop) {
        // Desktop: Right panel enters from right, Left panel reveals via clip-path
        tl.set(rightPanel, { xPercent: 100 })
          .set(leftPanel, { clipPath: 'inset(0% 100% 0% 0%)' })
          .set(leftImage, { scale: 1.08, opacity: 0.8 })
          .set([leftBrand, rightHeader], { opacity: 0, y: -15 })
          .set(navLabel, { opacity: 0, y: 15 })
          .set(navItems, { opacity: 0, y: 30 })
          // Step 1: Right panel slides in
          .to(rightPanel, {
            xPercent: 0,
            duration: 0.65,
            ease: 'power3.inOut',
          })
          // Step 2: Left image panel reveals with architectural clip-path
          .to(
            leftPanel,
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 0.7,
              ease: 'power3.inOut',
            },
            '-=0.55'
          )
          .to(
            leftImage,
            {
              scale: 1,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
            },
            '-=0.7'
          )
          // Step 3: Header branding & controls appear
          .to(
            [leftBrand, rightHeader],
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
            },
            '-=0.35'
          )
          // Step 4: Small NAVIGATION label & vertical links stagger in
          .to(
            navLabel,
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
            },
            '-=0.25'
          )
          .to(
            navItems,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.07,
            },
            '-=0.3'
          );
      } else {
        // Mobile layout: Vertical split entrance
        tl.set(overlay, { opacity: 0, y: -10 })
          .set(navItems, { opacity: 0, y: 20 })
          .to(overlay, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
          })
          .to(
            navItems,
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.06,
            },
            '-=0.2'
          );
      }
    }

    return () => {
      if (timelineRef.current) timelineRef.current.kill();
    };
  }, [isMenuOpen]);

  // Toggle Services Submenu with smooth GSAP accordion animation
  const toggleServices = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const submenu = servicesSubmenuRef.current;
    if (!submenu) return;

    if (!isServicesExpanded) {
      setIsServicesExpanded(true);
      gsap.fromTo(
        submenu,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
        }
      );
    } else {
      gsap.to(submenu, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => setIsServicesExpanded(false),
      });
    }
  };

  // 4. Smooth Anchor Navigation with ABVTEK-Inspired Horizontal Shutter Transition
  const handleNavClick = (e, targetId) => {
    e.preventDefault();

    // Prevent double-triggering or overlapping navigation animations
    if (shutterRef.current?.isTransitioning()) return;

    const started = shutterRef.current?.transitionTo(
      targetId,
      // Callback executed at apex when screen is 100% covered by horizontal shutter strips
      () => {
        // 1. Instantly close the split-screen navigation menu behind the covered shutter
        if (overlayRef.current) {
          gsap.set(overlayRef.current, { display: 'none', pointerEvents: 'none' });
        }
        setIsMenuOpen(false);
        setIsServicesExpanded(false);
        document.body.style.overflow = '';

        // 2. Perform smooth instantaneous jump to destination section behind the shutter
        if (targetId === 'top') {
          window.scrollTo({ top: 0, behavior: 'instant' });
          try {
            history.replaceState(null, '', ' ');
          } catch (_) {}
        } else {
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            const navOffset = getHeaderHeight();
            const targetPos = targetEl.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
              top: Math.max(0, Math.round(targetPos - navOffset)),
              behavior: 'instant',
            });
            try {
              history.replaceState(null, '', `#${targetId}`);
            } catch (_) {}
          } else {
            console.warn(`[ZEYARCH Nav] Section #${targetId} is not in the DOM.`);
          }
        }

        // 3. Immediately refresh ScrollTrigger so triggers update their scroll positions
        ScrollTrigger.refresh();
      },
      // Callback executed when shutter strips have fully exited and destination is revealed
      () => {
        // Transition complete
      }
    );

    // Fallback if shutter overlay is not available
    if (!started) {
      handleCloseMenu();
      if (targetId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          const navOffset = getHeaderHeight();
          const targetPos = targetEl.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: Math.max(0, Math.round(targetPos - navOffset)),
            behavior: 'smooth',
          });
        }
      }
    }
  };

  // Architectural interior image for the 70% left panel
  const splitImage = loaderImages[1] || loaderImages[0];

  return (
    <>
      {/* ================= 1. CLOSED NAVBAR HEADER ================= */}
      <header
        className={`zeyarch-header ${isScrolled ? 'scrolled' : 'transparent'} theme-${navTheme}`}
        role="banner"
      >
        <div className="header-inner">
          {/* LEFT: ZEYARCH Wordmark (38–42px) */}
          <a
            href="#top"
            className="brand-link"
            onClick={(e) => handleNavClick(e, 'top')}
            aria-label="ZEYARCH Architecture & Interiors Homepage"
          >
            <span className="brand-text">ZEYARCH</span>
            <span className="brand-period" aria-hidden="true">.</span>
          </a>

          {/* RIGHT: CONTACT US + Custom Hamburger Icon */}
          <div className="header-right-group">
            <a
              href="#contact"
              className="header-contact-link"
              onClick={(e) => handleNavClick(e, 'contact')}
            >
              CONTACT US
            </a>

            {/* Official ZEYARCH Brand Emblem Action (Replay & Brand Touchpoint) */}
            <button
              type="button"
              className="header-brand-emblem-btn"
              onClick={onReplay}
              title="ZEYARCH — Replay intro"
              aria-label="ZEYARCH brand emblem"
            >
              <img
                src={navTheme === 'light' ? BRAND.assets.emblemDark : BRAND.assets.emblemLight}
                alt="ZEYARCH Emblem"
                className="brand-emblem-img"
              />
            </button>

            {/* Custom Hamburger Menu Icon (40–44px wide) */}
            <button
              type="button"
              className="hamburger-btn"
              onClick={() => setIsMenuOpen(true)}
              aria-expanded={isMenuOpen}
              aria-label="Open split-screen navigation menu"
            >
              <span className="ham-line ham-line-1" />
              <span className="ham-line ham-line-2" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= 2. OPEN SPLIT-SCREEN NAVIGATION OVERLAY ================= */}
      <div
        ref={overlayRef}
        className="split-menu-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Site Navigation Menu"
        style={{ display: 'none' }}
      >
        {/* LEFT PANEL: ARCHITECTURAL PHOTOGRAPH (~70% width) */}
        <div ref={leftPanelRef} className="split-left-panel">
          <div className="left-panel-media">
            <img
              ref={leftImageRef}
              src={splitImage}
              alt="Zeyarch Architectural Sanctuary"
              className="split-bg-image"
            />
            <div className="split-image-scrim" />
          </div>

          {/* ZEYARCH Wordmark positioned in upper-left corner over photograph */}
          <div ref={leftBrandRef} className="split-left-brand">
            <a
              href="#top"
              className="split-brand-anchor"
              onClick={(e) => handleNavClick(e, 'top')}
            >
              <span className="split-brand-text">ZEYARCH</span>
              <span className="split-brand-period">.</span>
            </a>
          </div>
        </div>

        {/* RIGHT PANEL: SOPHISTICATED WARM-GREY NAVIGATION (~30% width) */}
        <div ref={rightPanelRef} className="split-right-panel">
          {/* Top Area: CONTACT US + Close Icon */}
          <div ref={rightHeaderRef} className="split-right-header">
            <a
              href="#contact"
              className="split-right-contact"
              onClick={(e) => handleNavClick(e, 'contact')}
            >
              CONTACT US
            </a>

            <button
              type="button"
              className="split-close-btn"
              onClick={handleCloseMenu}
              aria-label="Close navigation menu"
            >
              <span className="close-line close-line-1" />
              <span className="close-line close-line-2" />
            </button>
          </div>

          {/* Navigation Body */}
          <div className="split-nav-body">
            {/* Small Section Label */}
            <div ref={navLabelRef} className="split-nav-label">
              NAVIGATION
            </div>

            {/* Vertical Main Navigation Links: All 6 Destinations Supported */}
            <nav aria-label="Split Navigation Links">
              <ul ref={navLinksRef} className="split-nav-list">
                {/* 1. HOME */}
                <li className="split-nav-item">
                  <a
                    href="#top"
                    className="split-nav-link"
                    onClick={(e) => handleNavClick(e, 'top')}
                  >
                    HOME
                  </a>
                </li>

                {/* 2. OUR PROCESS */}
                <li className="split-nav-item">
                  <a
                    href="#process"
                    className="split-nav-link"
                    onClick={(e) => handleNavClick(e, 'process')}
                  >
                    OUR PROCESS
                  </a>
                </li>

                {/* 3. SELECTED WORKS */}
                <li className="split-nav-item">
                  <a
                    href="#works"
                    className="split-nav-link"
                    onClick={(e) => handleNavClick(e, 'works')}
                  >
                    SELECTED WORKS
                  </a>
                </li>

                {/* 4. OUR EXPERTISE */}
                <li className="split-nav-item">
                  <a
                    href="#expertise"
                    className="split-nav-link"
                    onClick={(e) => handleNavClick(e, 'expertise')}
                  >
                    OUR EXPERTISE
                  </a>
                </li>

                {/* 5. THE STUDIO */}
                <li className="split-nav-item">
                  <a
                    href="#studio"
                    className="split-nav-link"
                    onClick={(e) => handleNavClick(e, 'studio')}
                  >
                    THE STUDIO
                  </a>
                </li>

                {/* 6. CONTACT */}
                <li className="split-nav-item">
                  <a
                    href="#contact"
                    className="split-nav-link"
                    onClick={(e) => handleNavClick(e, 'contact')}
                  >
                    CONTACT
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* ================= 3. ABVTEK-STYLE HORIZONTAL SHUTTER OVERLAY ================= */}
      <NavShutterOverlay ref={shutterRef} />
    </>
  );
}
