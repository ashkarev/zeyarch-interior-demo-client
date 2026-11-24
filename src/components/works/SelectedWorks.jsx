import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import project1Img from '../../assets/our selected work/decc7272ce0f9a6828293fffc88c41cc (1).jpg';
import project2Img from '../../assets/our selected work/e0dff06d2e3e0891f605b2f4724b1d81.jpg';
import project3Img from '../../assets/our selected work/8b0398ab087974722e1880d92acdee03.jpg';
import './SelectedWorks.css';

gsap.registerPlugin(ScrollTrigger);

export const PROJECT_SUITES = [
  {
    id: 'suite-01',
    num: '01',
    title: 'Kitchen Sanctuary',
    src: project1Img,
    alt: 'Ajeesh Residence Kakkanad — Kitchen Sanctuary',
  },
  {
    id: 'suite-02',
    num: '02',
    title: 'Dining & Vitrine Suite',
    src: project2Img,
    alt: 'Ajeesh Residence Kakkanad — Dining & Vitrine Suite',
  },
  {
    id: 'suite-03',
    num: '03',
    title: 'Basalt Bath Sanctuary',
    src: project3Img,
    alt: 'Ajeesh Residence Kakkanad — Basalt Bath Sanctuary',
  },
];

export default function SelectedWorks({ isLoaderActive }) {
  const sectionRef = useRef(null);
  const pinContainerRef = useRef(null);
  const photosRef = useRef([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);

  useEffect(() => {
    if (isLoaderActive) return;

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 350);

    const ctx = gsap.context(() => {
      const isDesktop = window.innerWidth >= 1024;
      if (!isDesktop) return;

      const section = sectionRef.current;
      const pinContainer = pinContainerRef.current;
      const photos = photosRef.current.filter(Boolean);

      if (!section || !pinContainer || photos.length < 3) return;

      // Pin the section for 350vh scroll scrub distance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: pinContainer,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            let idx = 0;
            if (p < 0.38) {
              idx = 0;
            } else if (p < 0.72) {
              idx = 1;
            } else {
              idx = 2;
            }
            if (idx !== activeIdxRef.current) {
              activeIdxRef.current = idx;
              setActiveIdx(idx);

              // Proactively preload next project suite image
              const nextSuite = PROJECT_SUITES[idx + 1];
              if (nextSuite?.src) {
                const preloadImg = new Image();
                preloadImg.src = nextSuite.src;
              }
            }
          },
        },
      });

      // Left information panel entrance reveal
      gsap.fromTo(
        '.works-left-inner',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );

      // Left secondary thumbnail frame architectural curtain reveal
      gsap.fromTo(
        '.works-secondary-frame',
        { clipPath: 'inset(0% 100% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.85,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );

      // Right photos horizontal architectural curtain reveals in exact synchronization with scroll
      gsap.set(photos[0], { opacity: 1, zIndex: 1, clipPath: 'inset(0% 100% 0% 0%)' });
      gsap.set(photos[1], { opacity: 1, zIndex: 2, clipPath: 'inset(0% 100% 0% 0%)' });
      gsap.set(photos[2], { opacity: 1, zIndex: 3, clipPath: 'inset(0% 100% 0% 0%)' });

      // Photo 0 initial architectural curtain entrance
      gsap.to(photos[0], {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.95,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play reverse play reverse',
        },
      });

      // Photo 0 -> Photo 1 architectural curtain reveal on scrub
      tl.to(
        photos[1],
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 0.6 },
        0.4
      );

      // Photo 1 -> Photo 2 architectural curtain reveal on scrub
      tl.to(
        photos[2],
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 0.6 },
        1.4
      );
      // Mobile Cards Architectural Curtain Reveals (< 1024px)
      if (!isDesktop) {
        const mobileCards = section.querySelectorAll('.works-mobile-card');
        mobileCards.forEach((card) => {
          const mImg = card.querySelector('.works-mobile-img');
          if (mImg) {
            gsap.fromTo(
              mImg,
              { clipPath: 'inset(0% 100% 0% 0%)' },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 0.85,
                ease: 'power3.inOut',
                scrollTrigger: {
                  trigger: card,
                  start: 'top 88%',
                  toggleActions: 'play reverse play reverse',
                },
              }
            );
          }
        });
      }
    }, sectionRef);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [isLoaderActive]);

  // Subtle synchronized text transition when switching project suites
  useEffect(() => {
    gsap.fromTo(
      ['.works-room-title', '.works-label-text', '.works-room-num'],
      { opacity: 0.3, y: 6 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [activeIdx]);

  const currentSuite = PROJECT_SUITES[activeIdx];

  return (
    <section id="works" className="works-section" ref={sectionRef}>
      {/* Desktop Pinned 100vh Split-Screen Stage */}
      <div className="works-pin-stage" ref={pinContainerRef}>
        {/* Left Information Panel (50vw width, Exact Section 02 #f7f5f0 Background) */}
        <div className="works-left-col">
          <div className="works-left-inner">
            {/* Project Title (Refined Serif Typography) */}
            <h2 className="works-title">Ajeesh Residence</h2>

            {/* Location & Category Metadata */}
            <div className="works-meta-block">
              <p className="works-location">Kakkanad, Kochi, Kerala</p>
              <span className="works-meta-divider" aria-hidden="true">&bull;</span>
              <p className="works-category">Residential &middot; Interior Design &middot; Design &amp; Build</p>
            </div>

            {/* Project Description (Readable Sentence Case, Comfortable Line Height) */}
            <p className="works-description">
              Located in Kakkanad, Ajeesh Residence brings together contemporary
              refinement and regional identity. Delivered as a full design and
              build project, the residence balances minimalism, craftsmanship
              and thoughtful detailing.
            </p>

            {/* Secondary Project Photograph Showcase (Clean Position Below Text, Zero Overlap) */}
            <div className="works-secondary-wrap">
              <div className="works-secondary-frame">
                {PROJECT_SUITES.map((item, idx) => (
                  <img
                    key={item.id}
                    src={item.src}
                    alt={item.alt}
                    className={`works-secondary-img ${idx === activeIdx ? 'active' : ''}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                ))}
              </div>
              <div className="works-secondary-meta">
                <span className="works-room-title">{currentSuite.title}</span>
                <span className="works-room-num">0{activeIdx + 1} &mdash; 03</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Architectural Photograph (50vw width, Full-Bleed 100vh) */}
        <div className="works-right-col">
          {PROJECT_SUITES.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => (photosRef.current[idx] = el)}
              className="works-photo-layer"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="works-full-photo"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Editorial View (< 1024px) */}
      <div className="works-mobile-view">
        <div className="works-mobile-inner">
          <h2 className="works-title">Ajeesh Residence</h2>

          <div className="works-meta-block">
            <p className="works-location">Kakkanad, Kochi, Kerala</p>
            <p className="works-category">Residential &middot; Interior Design &middot; Design &amp; Build</p>
          </div>

          <p className="works-description">
            Located in Kakkanad, Ajeesh Residence brings together contemporary
            refinement and regional identity. Delivered as a full design and
            build project, the residence balances minimalism, craftsmanship
            and thoughtful detailing.
          </p>

          <div className="works-mobile-gallery">
            {PROJECT_SUITES.map((item, idx) => (
              <div key={item.id} className="works-mobile-card">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="works-mobile-img"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
                <div className="works-mobile-meta">
                  <span className="works-room-title">{item.title}</span>
                  <span className="works-room-num">0{idx + 1} &mdash; 03</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
