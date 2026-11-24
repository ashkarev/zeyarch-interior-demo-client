import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import studioMainImg from '../../assets/studio-main.jpg';
import studioDetailImg from '../../assets/studio-detail.jpg';
import archExteriorImg from '../../assets/expertise/arch-exterior.jpg';
import interiorLivingImg from '../../assets/expertise/interior-living.webp';
import designBuildImg from '../../assets/expertise/design-build.jpg';
import landscapeExteriorImg from '../../assets/expertise/landscape-exterior.jpg';
import ajeeshDetailImg from '../../assets/our selected work/8b0398ab087974722e1880d92acdee03.jpg';
import kitchenDetailImg from '../../assets/our selected work/decc7272ce0f9a6828293fffc88c41cc (1).jpg';
import vitrineDetailImg from '../../assets/our selected work/e0dff06d2e3e0891f605b2f4724b1d81.jpg';
import './Studio.css';

gsap.registerPlugin(ScrollTrigger);

// 5 Synchronized Authentic Architectural Slides (Main Photograph + Matching Architectural Detail)
export const STUDIO_SLIDES = [
  {
    id: 'studio-01',
    mainSrc: studioMainImg,
    detailSrc: studioDetailImg,
    title: 'ZEYARCH Design Studio',
    caption: 'Studio table, architectural blueprints & tropical light',
    detailAlt: 'Studio materiality, concrete textures & architectural daylight',
  },
  {
    id: 'studio-02',
    mainSrc: archExteriorImg,
    detailSrc: ajeeshDetailImg,
    title: 'Ajeesh Residence',
    caption: 'Contextual residential architecture & masonry form',
    detailAlt: 'Ajeesh Residence — Basalt stone and light well detail',
  },
  {
    id: 'studio-03',
    mainSrc: interiorLivingImg,
    detailSrc: vitrineDetailImg,
    title: 'Living Sanctuary',
    caption: 'Curated joinery, tactile materiality & atmospheric illumination',
    detailAlt: 'Interior joinery & illuminated vitrine detail',
  },
  {
    id: 'studio-04',
    mainSrc: designBuildImg,
    detailSrc: kitchenDetailImg,
    title: 'Kitchen & Dining Suite',
    caption: 'Turnkey execution with seamless marble & custom millwork',
    detailAlt: 'Turnkey kitchen millwork and seamless stone detail',
  },
  {
    id: 'studio-05',
    mainSrc: landscapeExteriorImg,
    detailSrc: landscapeExteriorImg,
    detailStyle: { objectPosition: '75% 25%', transform: 'scale(1.35)' },
    title: 'Bespoke Dining Vitrine',
    caption: 'Illuminated architectural cabinetry, custom millwork & tactile materiality',
    detailAlt: 'Illuminated vitrine joinery, chinaware & architectural millwork detail',
  },
];

const ETHOS_ITEMS = [
  {
    num: '01',
    title: 'Context',
    desc: 'Design begins with the place, its climate and the people who inhabit it.',
    icon: (
      <svg
        className="ethos-svg"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 7L32 13L20 19L8 13L20 7Z" />
        <path d="M8 18L20 24L32 18" />
        <path d="M8 23L20 29L32 23" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Craft',
    desc: 'Materials, proportion and detail are considered at every stage.',
    icon: (
      <svg
        className="ethos-svg"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 32V18C12 13.58 15.58 10 20 10C24.42 10 28 13.58 28 18V32" />
        <path d="M16 32V19C16 16.79 17.79 15 20 15C22.21 15 24 16.79 24 19V32" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Collaboration',
    desc: 'We work closely with clients to shape ideas into meaningful spaces.',
    icon: (
      <svg
        className="ethos-svg"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="16" cy="20" r="8" />
        <circle cx="24" cy="20" r="8" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Longevity',
    desc: 'Thoughtful spaces designed to remain relevant over time.',
    icon: (
      <svg
        className="ethos-svg"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 15C11.24 15 9 17.24 9 20C9 22.76 11.24 25 14 25C17.5 25 22.5 15 26 15C28.76 15 31 17.24 31 20C31 22.76 28.76 25 26 25C22.5 25 17.5 15 14 15Z" />
      </svg>
    ),
  },
];

export default function Studio({ isLoaderActive }) {
  const sectionRef = useRef(null);
  const headingGroupRef = useRef(null);
  const introColRef = useRef(null);
  const narrativeRef = useRef(null);
  const mainImageRef = useRef(null);
  const floatingImageRef = useRef(null);
  const archOutlineRef = useRef(null);
  const ethosListRef = useRef(null);

  // Slideshow States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  );

  const slideTimerRef = useRef(null);

  // Preload all 5 main and detail images on mount to eliminate blank flashes or shifts
  useEffect(() => {
    STUDIO_SLIDES.forEach((slide) => {
      const imgMain = new Image();
      imgMain.src = slide.mainSrc;
      const imgDetail = new Image();
      imgDetail.src = slide.detailSrc;
    });
  }, []);

  // Listen for tab visibility changes (pause when hidden, resume when active)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Viewport tracking: pause slideshow when Section 05 is out of view, resume when in view
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: '60px 0px' }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Preload next slide images ahead of time for instantaneous synchronized transitions
  useEffect(() => {
    const nextIdx = (currentSlide + 1) % STUDIO_SLIDES.length;
    const nextSlide = STUDIO_SLIDES[nextIdx];
    if (nextSlide) {
      if (nextSlide.mainSrc) {
        const img1 = new Image();
        img1.src = nextSlide.mainSrc;
      }
      if (nextSlide.detailSrc) {
        const img2 = new Image();
        img2.src = nextSlide.detailSrc;
      }
    }
  }, [currentSlide]);

  // Automatic 4.5-second slideshow timer with smart pause/resume
  const resetTimer = useCallback(() => {
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
      slideTimerRef.current = null;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const shouldRun =
      isSectionVisible &&
      isDocumentVisible &&
      !isHovered &&
      !isLoaderActive;

    if (shouldRun) {
      slideTimerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % STUDIO_SLIDES.length);
      }, 4500); // Exactly 4.5 seconds
    }
  }, [isSectionVisible, isDocumentVisible, isHovered, isLoaderActive]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [resetTimer]);

  // Controls with immediate transition + timer reset
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % STUDIO_SLIDES.length);
    resetTimer();
  }, [resetTimer]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + STUDIO_SLIDES.length) % STUDIO_SLIDES.length);
    resetTimer();
  }, [resetTimer]);

  const goToSlide = useCallback(
    (idx) => {
      setCurrentSlide(idx);
      resetTimer();
    },
    [resetTimer]
  );

  // GSAP Entrance Animations
  useEffect(() => {
    if (isLoaderActive) return;

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 350);

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      if (!section) return;

      if (prefersReducedMotion) {
        gsap.set(
          [
            headingGroupRef.current,
            introColRef.current,
            narrativeRef.current,
            mainImageRef.current,
            floatingImageRef.current,
            archOutlineRef.current,
            ethosListRef.current,
          ],
          { opacity: 1 }
        );
        return;
      }

      // Main Heading upward reveal
      gsap.fromTo(
        headingGroupRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );

      // Intro paragraph smooth reveal
      if (introColRef.current) {
        gsap.fromTo(
          introColRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            delay: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      }

      // Supporting Narrative Block
      if (narrativeRef.current) {
        gsap.fromTo(
          narrativeRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            delay: 0.22,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 72%',
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      }

      // Main Studio Slideshow Frame reveal with architectural horizontal curtain wipe
      if (mainImageRef.current) {
        gsap.fromTo(
          mainImageRef.current,
          { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0.9 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            duration: 1.05,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: mainImageRef.current,
              start: 'top 85%',
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      }

      // Floating Detail Image reveals slightly after main image
      if (floatingImageRef.current) {
        gsap.fromTo(
          floatingImageRef.current,
          { opacity: 0, x: 25 },
          {
            opacity: 1,
            x: 0,
            duration: 0.95,
            delay: 0.22,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: mainImageRef.current,
              start: 'top 85%',
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      }

      // Arch Outline stroke
      if (archOutlineRef.current) {
        gsap.fromTo(
          archOutlineRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.15,
            delay: 0.35,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: mainImageRef.current,
              start: 'top 85%',
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      }

      // Ethos Items gentle staggered reveal
      const items = ethosListRef.current
        ? ethosListRef.current.querySelectorAll('.studio-ethos-item')
        : [];

      gsap.fromTo(
        items,
        { opacity: 0, x: 22 },
        {
          opacity: 1,
          x: 0,
          duration: 0.75,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ethosListRef.current,
            start: 'top 80%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );
    }, sectionRef);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [isLoaderActive]);

  return (
    <section id="studio" className="studio-section" ref={sectionRef}>
      {/* Subtle organic ambient foliage shadow */}
      <div className="studio-foliage-shadow" aria-hidden="true" />

      <div className="studio-container">
        {/* ================= LEFT VISUAL & EDITORIAL COMPOSITION ================= */}
        <div className="studio-left-block">
          {/* Heading & Intro Row */}
          <div className="studio-top-intro-area">
            {/* Top Row: Oversized Heading + Side Introduction */}
            <div className="studio-header-intro-row">
              <div className="studio-heading-col" ref={headingGroupRef}>
                <h2 className="studio-heading">
                  <span>The</span>
                  <span>Studio</span>
                </h2>
              </div>

              <div className="studio-intro-col" ref={introColRef}>
                <span className="studio-intro-rule" aria-hidden="true" />
                <p className="studio-intro-text">
                  An architecture and interior design studio bringing thoughtful
                  design and execution together to shape meaningful spaces.
                </p>
              </div>
            </div>

            {/* Meaningful ZEYARCH Narrative Block */}
            <div className="studio-narrative-block" ref={narrativeRef}>
              <h3 className="studio-supporting-heading">
                Designed around people. Defined by detail.
              </h3>
              <p className="studio-narrative-desc">
                At ZEYARCH, every project begins with understanding the people,
                place and purpose behind it. From architectural planning and
                interior design to design and build, we bring ideas together
                through considered materials, thoughtful detailing and a
                collaborative approach.
              </p>
            </div>
          </div>

          {/* Architectural Imagery Area: Synchronized Main Slideshow + Floating Detail Photo */}
          <div
            className="studio-imagery-wrap"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
          >
            {/* Concentric Architectural Arch Stroke */}
            <div className="studio-arch-outline" ref={archOutlineRef} aria-hidden="true" />

            {/* Synchronized Floating Detail Photograph */}
            <div
              className="studio-floating-card"
              ref={floatingImageRef}
              aria-label="Synchronized architectural detail view"
            >
              <div className="studio-floating-track">
                {STUDIO_SLIDES.map((slide, idx) => (
                  <div
                    key={`detail-${slide.id}`}
                    className={`studio-floating-slide ${idx === currentSlide ? 'slide-active' : ''}`}
                    aria-hidden={idx !== currentSlide}
                  >
                    <img
                      src={slide.detailSrc}
                      alt={slide.detailAlt}
                      className="studio-floating-img"
                      style={slide.detailStyle || {}}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Main Studio Photography Slideshow (Arched Corner Mask) */}
            <div
              className="studio-main-frame"
              ref={mainImageRef}
              role="region"
              aria-label="ZEYARCH Architectural Project Slideshow"
            >
              {/* Stack of Preloaded Slides with Cinematic Crossfade & Clip Reveal */}
              <div className="studio-slideshow-track">
                {STUDIO_SLIDES.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`studio-slide-item ${idx === currentSlide ? 'slide-active' : ''}`}
                    aria-hidden={idx !== currentSlide}
                  >
                    <img
                      src={slide.mainSrc}
                      alt={slide.caption}
                      className="studio-slide-img"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                    <div className="studio-slide-caption-bar">
                      <span className="slide-cap-title">{slide.title}</span>
                      <span className="slide-cap-sep">&middot;</span>
                      <span className="slide-cap-desc">{slide.caption}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Minimal Architectural Previous / Next Controls */}
              <div className="studio-slideshow-controls">
                <button
                  type="button"
                  className="slideshow-arrow-btn prev-btn"
                  onClick={prevSlide}
                  aria-label="Previous architectural project slide"
                >
                  <span aria-hidden="true">&#x2190;</span>
                </button>
                <div className="slideshow-pagination">
                  <span className="pagination-current">0{currentSlide + 1}</span>
                  <span className="pagination-sep">/</span>
                  <span className="pagination-total">0{STUDIO_SLIDES.length}</span>
                </div>
                <button
                  type="button"
                  className="slideshow-arrow-btn next-btn"
                  onClick={nextSlide}
                  aria-label="Next architectural project slide"
                >
                  <span aria-hidden="true">&#x2192;</span>
                </button>
              </div>

              {/* Progress Indicator Dots */}
              <div
                className="studio-slideshow-dots"
                role="tablist"
                aria-label="Slideshow slide selectors"
              >
                {STUDIO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    className={`slideshow-dot ${idx === currentSlide ? 'active-dot' : ''}`}
                    onClick={() => goToSlide(idx)}
                    aria-selected={idx === currentSlide}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Official Brand Accent Block */}
              <div className="studio-terracotta-accent" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN — OUR DESIGN ETHOS ================= */}
        <div className="studio-right-block">
          <div className="studio-ethos-header">
            <h3 className="studio-ethos-heading">Our Design Ethos</h3>
            <span className="studio-ethos-rule" aria-hidden="true" />
          </div>

          <div className="studio-ethos-list" ref={ethosListRef}>
            {ETHOS_ITEMS.map((item) => (
              <div key={item.num} className="studio-ethos-item">
                <div className="ethos-icon-col">{item.icon}</div>
                <div className="ethos-content-col">
                  <h4 className="ethos-title">{item.title}</h4>
                  <p className="ethos-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
