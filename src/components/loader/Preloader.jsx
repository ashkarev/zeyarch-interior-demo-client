import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { loaderImages } from '../../assets/loader';
import './Preloader.css';

/**
 * ZEYARCH Cinematic Preloader with Coordinated GSAP Transition
 *
 * Choreography:
 * - Stage A (0.0s – 0.7s): Centered Wordmark - Pure white background, centered ZEYARCH.
 * - Stage B (0.7s – 1.0s): Separation - GSAP animates "ZEY" to 35vw and "ARCH" to 65vw.
 *                         Central square and bottom statement appear.
 * - Stage C (1.0s – 3.5s): Continuous Image Sequence -
 *                         Two-layer crossfade through loaderImages (~200ms/img, 120ms fade).
 *                         All foreground elements stay stationary.
 * - Stage D (3.5s – 4.1s): GSAP Homepage Reveal -
 *                         White backdrop dissolves (1 -> 0), revealing real homepage hero & nav underneath.
 *                         Central square, split text, and bottom statement remain visible over background.
 * - Stage E (4.1s – 4.5s): GSAP Foreground Exit -
 *                         Foreground elements fade out smoothly.
 *                         Preloader unmounts and body scroll is restored.
 */
export default function Preloader({ onComplete }) {
  const [imagesReady, setImagesReady] = useState(false);
  const [activeImages, setActiveImages] = useState(loaderImages);

  // Two-layer crossfade indices for the central square
  const [currentIdx, setCurrentIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState(0);

  // Element Refs for GSAP
  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const leftTextRef = useRef(null);
  const rightTextRef = useRef(null);
  const squareRef = useRef(null);
  const statementRef = useRef(null);

  const timersRef = useRef([]);
  const cycleIntervalRef = useRef(null);
  const gsapTimelineRef = useRef(null);

  // Lock scroll while preloader is active & restore on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Preload and decode all images before starting Stage A
  useEffect(() => {
    let isMounted = true;

    const preloadSingle = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = async () => {
          if ('decode' in img) {
            try {
              await img.decode();
            } catch (_) {}
          }
          resolve(src);
        };
        img.onerror = () => {
          console.warn('Failed to load image asset:', src);
          resolve(null);
        };
      });
    };

    Promise.all(loaderImages.map(preloadSingle)).then((results) => {
      if (!isMounted) return;
      const loaded = results.filter(Boolean);
      if (loaded.length > 0) {
        setActiveImages(loaded);
      }
      setImagesReady(true);
    });

    const safetyTimeout = setTimeout(() => {
      if (isMounted) setImagesReady(true);
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Set initial GSAP styles as soon as elements mount
  useEffect(() => {
    if (!rootRef.current) return;

    gsap.set(backdropRef.current, { opacity: 1 });
    gsap.set(leftTextRef.current, { left: '50vw', xPercent: -100, yPercent: -50, opacity: 1 });
    gsap.set(rightTextRef.current, { left: '50vw', xPercent: 0, yPercent: -50, opacity: 1 });
    gsap.set(squareRef.current, { opacity: 0 });
    gsap.set(statementRef.current, { opacity: 0 });
  }, []);

  // Master Timeline Orchestration
  useEffect(() => {
    if (!imagesReady) return;

    const addTimer = (fn, delay) => {
      const t = setTimeout(fn, delay);
      timersRef.current.push(t);
      return t;
    };

    // Stage B: Separation at 0.7s (Duration: 0.3s)
    addTimer(() => {
      gsap.to(leftTextRef.current, {
        left: '35vw',
        xPercent: -50,
        duration: 0.3,
        ease: 'power2.inOut',
      });
      gsap.to(rightTextRef.current, {
        left: '65vw',
        xPercent: -50,
        duration: 0.3,
        ease: 'power2.inOut',
      });
      gsap.to(squareRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(statementRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        delay: 0.1,
      });
    }, 700);

    // Stage C: Image Showcase starts at 1.0s (Continues until 3.5s)
    addTimer(() => {
      const imgCount = activeImages.length;
      if (imgCount > 1) {
        let runningIdx = 0;
        cycleIntervalRef.current = setInterval(() => {
          const nextIdx = (runningIdx + 1) % imgCount;
          setPrevIdx(runningIdx);
          setCurrentIdx(nextIdx);
          runningIdx = nextIdx;
        }, 200);
      }
    }, 1000);

    // Stage D & E: Coordinated GSAP Final Transition (starts at 3.5s)
    addTimer(() => {
      // 1. Stop cycling interval - current image remains stable
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }

      // 2. Allow interaction with the emerging homepage underneath
      if (rootRef.current) {
        rootRef.current.classList.add('uninteractive');
      }

      // 3. One unified GSAP timeline for the final cinematic handoff
      const handoffTl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
          if (onComplete) onComplete();
        },
      });

      gsapTimelineRef.current = handoffTl;

      // Stage A (3.5s – 4.1s, duration 0.6s):
      // Gradually animate the white backdrop opacity from 1 to 0, revealing the homepage behind it.
      handoffTl.to(backdropRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut',
      });

      // Stage B (4.1s – 4.45s, duration 0.35s):
      // Fade out ZEY and ARCH wordmark, central square, and bottom statement smoothly.
      handoffTl.to(
        [leftTextRef.current, rightTextRef.current, squareRef.current, statementRef.current],
        {
          opacity: 0,
          duration: 0.35,
          ease: 'power2.inOut',
        },
        '-=0.1' // Subtle 100ms overlap for continuity
      );
    }, 3500);

    return () => {
      timersRef.current.forEach(clearTimeout);
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
      if (gsapTimelineRef.current) gsapTimelineRef.current.kill();
    };
  }, [imagesReady, activeImages, onComplete]);

  return (
    <div ref={rootRef} className="zeyarch-preloader-root">
      {/* 1. White Backdrop Layer: dissolved by GSAP during Stage D to reveal real homepage underneath */}
      <div ref={backdropRef} className="preloader-white-backdrop" />

      {/* 2. Foreground Stage */}
      <div className="preloader-foreground-stage">
        {/* Left Text: "ZEY" */}
        <div ref={leftTextRef} className="preloader-split-text left">
          ZEY
        </div>

        {/* Right Text: "ARCH" */}
        <div ref={rightTextRef} className="preloader-split-text right">
          ARCH
        </div>

        {/* Central Square Image Showcase (13vw desktop, 34vw mobile, 1:1 aspect ratio) */}
        <div ref={squareRef} className="preloader-center-square">
          {/* Base Layer: Previous/Current stable image (zIndex: 1, opacity: 1) */}
          {activeImages[prevIdx] && (
            <img
              src={activeImages[prevIdx]}
              alt="Zeyarch Interior Base"
              className="preloader-square-image"
              style={{ zIndex: 1, opacity: 1 }}
            />
          )}

          {/* Crossfade Layer: Incoming image fading in over base image (zIndex: 2, 120ms crossfade) */}
          {activeImages[currentIdx] && currentIdx !== prevIdx && (
            <img
              key={currentIdx}
              src={activeImages[currentIdx]}
              alt="Zeyarch Interior Incoming"
              className="preloader-square-image"
              style={{
                zIndex: 2,
                animation: 'crossfadeIn 120ms ease-in-out forwards',
              }}
            />
          )}
        </div>

        {/* Bottom Text Statement */}
        <div ref={statementRef} className="preloader-bottom-statement">
          <p>SPACES SHAPED WITH PRECISION,</p>
          <p>CHARACTER AND PURPOSE.</p>
        </div>
      </div>
    </div>
  );
}
