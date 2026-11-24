import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { loaderImages } from '../../assets/loader';
import './Hero.css';

/**
 * ZEYARCH Section 01 (HOME / HERO) — Cinematic Landscape Video
 *
 * Requirements:
 * - Full-screen cinematic video hero: 100% width, 100svh / 100vh height.
 * - Video source: /home-hero.mp4 (autoplay, muted, loop, playsInline).
 * - High-resolution architectural poster fallback (loaderImages).
 * - Restrained architectural gradient scrim for typography legibility.
 *
 * Content:
 * - Eyebrow: "INTERIOR ARCHITECTURE · SPACES · EXPERIENCES"
 * - Headline: "Spaces designed around the way you live."
 * - Description: "Thoughtfully designed spaces shaped by light, material, form and the people who inhabit them."
 * - CTA: "Explore our projects ↗"
 * - Scroll Indicator: "SCROLL TO EXPLORE ↓"
 *
 * Preloader Integration:
 * - Video streams behind preloader from initial mount.
 * - Coordinated GSAP reveal on handoff with zero flash or layout shift.
 */
export default function Hero({ isLoaderActive }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Element Refs for GSAP and Video
  const heroRootRef = useRef(null);
  const videoRef = useRef(null);
  const kickerRef = useRef(null);
  const headlineRef = useRef(null);
  const descRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const footerRef = useRef(null);
  const animTimelineRef = useRef(null);

  // Landscape video asset in public folder & architectural poster fallback
  const videoSrc = '/home-hero.mp4';
  const posterImage = loaderImages[2] || loaderImages[0];

  // 1. Ensure video attempts autoplay smoothly on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsVideoLoaded(true);
        })
        .catch((err) => {
          console.warn('[ZEYARCH Hero] Video autoplay deferred by browser policy:', err.message);
        });
    }
  }, []);

  // 2. Coordinated GSAP Reveal Sequence on Preloader Handoff
  useEffect(() => {
    if (isLoaderActive) {
      // Keep hero text elements prepared but invisible while preloader is active
      gsap.set(
        [
          kickerRef.current,
          headlineRef.current,
          descRef.current,
          ctaRef.current,
          scrollIndicatorRef.current,
          footerRef.current,
        ],
        { opacity: 0 }
      );
      return;
    }

    if (animTimelineRef.current) {
      animTimelineRef.current.kill();
    }

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReducedMotion) {
      gsap.set(
        [
          kickerRef.current,
          headlineRef.current,
          descRef.current,
          ctaRef.current,
          scrollIndicatorRef.current,
          footerRef.current,
        ],
        { opacity: 1, y: 0 }
      );
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
    });
    animTimelineRef.current = tl;

    // 1. Headline reveals with subtle upward ease
    tl.fromTo(
      headlineRef.current,
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0 }
    )
      // 2. Supporting eyebrow appears
      .fromTo(
        kickerRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75 },
        '-=0.7'
      )
      // 3. Architectural description fades in
      .fromTo(
        descRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75 },
        '-=0.55'
      )
      // 4. Minimal CTA appears
      .fromTo(
        ctaRef.current,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        '-=0.45'
      )
      // 5. Scroll indicator & metadata strip fade in
      .fromTo(
        [scrollIndicatorRef.current, footerRef.current],
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        '-=0.4'
      );

    return () => {
      if (animTimelineRef.current) animTimelineRef.current.kill();
    };
  }, [isLoaderActive]);

  // Smooth scroll to projects section with fixed navbar offset
  const handleScrollToWorks = (e) => {
    e.preventDefault();
    const worksSection = document.getElementById('works');
    if (worksSection) {
      const navOffset = 96;
      const targetPos = worksSection.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, targetPos - navOffset),
        behavior: 'smooth',
      });
    }
  };

  return (
    <section ref={heroRootRef} className="hero-section" aria-label="Hero Introduction">
      {/* Full-Screen Landscape Video Background Layer */}
      <div className="hero-video-wrapper">
        {!videoError && (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterImage}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className={`hero-bg-video ${isVideoLoaded ? 'loaded' : ''}`}
            onCanPlay={() => setIsVideoLoaded(true)}
            onPlaying={() => setIsVideoLoaded(true)}
            onError={() => {
              console.warn('[ZEYARCH Hero] Video failed to load, falling back to architectural poster.');
              setVideoError(true);
            }}
          />
        )}

        {/* High-Resolution Architectural Poster (shown while video loads or as fallback) */}
        <img
          src={posterImage}
          alt="Zeyarch Architectural Sanctuary"
          className={`hero-fallback-poster ${isVideoLoaded && !videoError ? 'video-playing' : ''}`}
        />

        {/* Subtle Architectural Scrim ensuring text legibility without obscuring natural lighting */}
        <div className="hero-scrim" />
      </div>

      {/* Spacer for Fixed Transparent Header */}
      <div className="hero-nav-spacer" />

      {/* Hero Content — Positioned in the lower-left area */}
      <div className="hero-content">
        {/* Eyebrow / Supporting Label */}
        <div ref={kickerRef} className="hero-kicker">
          <span className="kicker-line" aria-hidden="true" />
          <span className="kicker-text">INTERIOR ARCHITECTURE &middot; SPACES &middot; EXPERIENCES</span>
        </div>

        {/* Main Editorial Headline */}
        <h1 ref={headlineRef} className="hero-headline">
          Spaces designed around the way you live.
        </h1>

        {/* Supporting Architectural Description */}
        <p ref={descRef} className="hero-description">
          Thoughtfully designed spaces shaped by light, material, form and the people who inhabit them.
        </p>

        {/* Understated Minimal CTA */}
        <div ref={ctaRef} className="hero-cta-wrapper">
          <a
            href="#works"
            className="hero-cta-link"
            onClick={handleScrollToWorks}
            aria-label="Explore our architectural and interior projects"
          >
            <span className="cta-text">Explore our projects</span>
            <span className="cta-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      {/* Architectural Metadata Footer Strip & Scroll Indicator */}
      <footer ref={footerRef} className="hero-footer">
        <div className="meta-block">
          <span className="meta-label">Location</span>
          <span className="meta-value">Kakkanad kochi</span>
        </div>

        <div className="meta-block">
          <span className="meta-label">Discipline</span>
          <span className="meta-value">Interior Architecture</span>
        </div>

        <div className="meta-block">
          <span className="meta-label">Materials</span>
          <span className="meta-value">Limestone, Oak, Travertine</span>
        </div>

        <div className="meta-block">
          <span className="meta-label">Year</span>
          <span className="meta-value">2026</span>
        </div>

        {/* Subtle Scroll Indicator */}
        <a
          ref={scrollIndicatorRef}
          href="#works"
          className="hero-scroll-indicator"
          onClick={handleScrollToWorks}
          aria-label="Scroll to explore projects"
        >
         
          
        </a>
      </footer>
    </section>
  );
}
