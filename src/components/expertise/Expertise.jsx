import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Expertise.css';

gsap.registerPlugin(ScrollTrigger);

export const SERVICES = [
  {
    num: '01',
    title: 'Architecture',
    desc: 'Spaces shaped by context, form and purpose.',
  },
  {
    num: '02',
    title: 'Interior Design',
    desc: 'Materials, light and thoughtful details that shape everyday living.',
  },
  {
    num: '03',
    title: 'Design & Build',
    desc: 'One vision, from initial concept to completed execution.',
  },
  {
    num: '04',
    title: 'Landscape & Exterior',
    desc: 'Architecture connected to nature and its surroundings.',
  },
];

export default function Expertise({ isLoaderActive }) {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const listRef = useRef(null);

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
        gsap.set([headerRef.current, listRef.current], { opacity: 1, y: 0 });
        return;
      }

      // Smooth section header entrance
      gsap.fromTo(
        headerRef.current,
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

      // Staggered horizontal service rows entrance
      const rows = listRef.current?.querySelectorAll('.service-row') || [];
      gsap.fromTo(
        rows,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 78%',
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
    <section id="expertise" className="expertise-section" ref={sectionRef}>
      {/* Subtle top edge vignette for seamless transition from beige section */}
      <div className="expertise-transition-vignette" aria-hidden="true" />

      <div className="expertise-container">
        {/* Section Header */}
        <header className="expertise-header" ref={headerRef}>
          <div className="expertise-header-row">
            <div className="expertise-heading-wrap">
              <h2 className="expertise-headline">What we do.</h2>
            </div>
            <div className="expertise-intro-wrap">
              <span className="expertise-intro-rule" aria-hidden="true" />
              <p className="expertise-subheading">
                From architectural vision to thoughtful interiors and complete
                project execution.
              </p>
            </div>
          </div>
        </header>

        {/* Spacious Horizontal Service Rows */}
        <div
          className="service-index-list"
          ref={listRef}
          role="list"
          aria-label="ZEYARCH Architectural Services"
        >
          {SERVICES.map((item) => (
            <div
              key={item.num}
              className="service-row"
              role="listitem"
              tabIndex={0}
            >
              <div className="service-row-main">
                <span className="service-num">{item.num}</span>
                <span className="service-sep" aria-hidden="true" />
                <h3 className="service-title">{item.title}</h3>
              </div>

              <div className="service-row-desc">
                <p className="service-desc-text">{item.desc}</p>
              </div>

              <div className="service-row-action" aria-hidden="true">
                <span className="service-arrow">↗</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
