import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Process.css';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 190;
const ASPECT_RATIO = 1920 / 1080;

const STAGES = [
  {
    id: 'plan',
    num: '01',
    name: 'PLAN',
    stageLabel: '01 / PLAN',
    quote: 'Every space begins with intention.',
    desc: 'Understanding the site, the people, and the way a space should live through blueprint precision.',
  },
  {
    id: 'design',
    num: '02',
    name: 'DESIGN',
    stageLabel: '02 / DESIGN',
    quote: 'Turning ideas into space.',
    desc: 'Blueprint lines evolve into architectural volume, structural grid, and spatial proportion.',
  },
  {
    id: 'build',
    num: '03',
    name: 'BUILD',
    stageLabel: '03 / BUILD',
    quote: 'Every detail takes shape.',
    desc: 'Framing, masonry, and architectural finishes construct the physical sanctuary.',
  },
  {
    id: 'complete',
    num: '04',
    name: 'COMPLETE',
    stageLabel: '04 / COMPLETE',
    quote: 'A vision made real.',
    desc: 'A considered architectural villa with terracotta roofs and lush landscaping, ready to call home.',
  },
];

const getFrameUrl = (index) => {
  const pad = String(index).padStart(6, '0');
  return `/assets/section-2-frames/frame-${pad}.webp`;
};

export default function Process({ isLoaderActive }) {
  const containerRef = useRef(null);
  const pinRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const timelineRef = useRef(null);

  const [activeStage, setActiveStage] = useState(0);
  const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState(false);

  // High-performance image array and frame state tracking
  const imagesRef = useRef(new Array(TOTAL_FRAMES));
  const targetFrameRef = useRef(1);
  const renderedFrameRef = useRef(-1);
  const activeStageRef = useRef(0);
  const rafIdRef = useRef(null);

  // Render a specific frame onto the canvas
  const renderFrame = (targetIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    targetFrameRef.current = targetIdx;

    let img = imagesRef.current[targetIdx - 1];

    // If exact target frame isn't loaded yet, search outward for nearest loaded adjacent frame
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prevIdx = targetIdx - 1 - offset;
        if (prevIdx >= 0) {
          const candidate = imagesRef.current[prevIdx];
          if (candidate && candidate.complete && candidate.naturalWidth > 0) {
            img = candidate;
            break;
          }
        }
        const nextIdx = targetIdx - 1 + offset;
        if (nextIdx < TOTAL_FRAMES) {
          const candidate = imagesRef.current[nextIdx];
          if (candidate && candidate.complete && candidate.naturalWidth > 0) {
            img = candidate;
            break;
          }
        }
      }
    }

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      renderedFrameRef.current = targetIdx;
    }
  };

  // rAF-throttled render request for buttery 60 FPS canvas scrubbing
  const requestRender = (targetIdx) => {
    targetFrameRef.current = targetIdx;
    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      renderFrame(targetFrameRef.current);
    });
  };

  // Resize canvas to fit viewport container while maintaining 16:9 aspect ratio
  const resizeCanvas = () => {
    const container = canvasWrapperRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const cW = container.clientWidth;
    const cH = container.clientHeight;
    if (cW <= 0 || cH <= 0) return;

    let drawW = cW;
    let drawH = cW / ASPECT_RATIO;

    if (drawH > cH) {
      drawH = cH;
      drawW = cH * ASPECT_RATIO;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(drawW * dpr);
    canvas.height = Math.round(drawH * dpr);
    canvas.style.width = `${Math.round(drawW)}px`;
    canvas.style.height = `${Math.round(drawH)}px`;

    renderFrame(targetFrameRef.current);
  };

  // Preloading & Canvas Setup
  useEffect(() => {
    let isCancelled = false;

    const loadSingleFrame = (idx) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = getFrameUrl(idx);
        img.onload = () => {
          if (isCancelled) return resolve(null);
          imagesRef.current[idx - 1] = img;

          if (idx === 1) {
            setIsFirstFrameLoaded(true);
            resizeCanvas();
          }

          // If the viewport is waiting for this specific frame, draw it immediately
          if (targetFrameRef.current === idx) {
            renderFrame(idx);
          }

          resolve(img);
        };
        img.onerror = () => {
          resolve(null);
        };
      });
    };

    // 1. Immediately preload the initial blueprint buffer (frames 1-6)
    const initialBuffer = [];
    for (let i = 1; i <= Math.min(6, TOTAL_FRAMES); i++) {
      initialBuffer.push(loadSingleFrame(i));
    }

    Promise.all(initialBuffer).then(() => {
      if (isCancelled) return;

      // 2. Progressively stream remaining frames when Section 02 approaches the viewport
      let hasStartedStream = false;
      const streamRemaining = async () => {
        if (hasStartedStream || isCancelled) return;
        hasStartedStream = true;

        for (let i = 7; i <= TOTAL_FRAMES; i += 12) {
          if (isCancelled) break;
          const batch = [];
          for (let j = 0; j < 12 && i + j <= TOTAL_FRAMES; j++) {
            batch.push(loadSingleFrame(i + j));
          }
          await Promise.all(batch);
        }
      };

      const sectionEl = containerRef.current;
      if (sectionEl) {
        const approachObserver = new IntersectionObserver(
          (entries) => {
            if (entries[0]?.isIntersecting) {
              streamRemaining();
              approachObserver.disconnect();
            }
          },
          { rootMargin: '600px 0px' }
        );
        approachObserver.observe(sectionEl);
      } else {
        streamRemaining();
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvasWrapperRef.current) {
      resizeObserver.observe(canvasWrapperRef.current);
    }
    window.addEventListener('resize', resizeCanvas);

    return () => {
      isCancelled = true;
      resizeObserver.disconnect();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // GSAP ScrollTrigger Setup
  useEffect(() => {
    if (isLoaderActive) return;

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
      resizeCanvas();
      if (timelineRef.current) {
        const p = timelineRef.current.progress;
        const targetIdx = Math.min(
          TOTAL_FRAMES,
          Math.max(1, Math.round(1 + p * (TOTAL_FRAMES - 1)))
        );
        renderFrame(targetIdx);
      }
    }, 250);

    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(['.process-header', '.process-footer'], { opacity: 1, y: 0 });
      } else {
        // Section 02 Editorial Header entrance on scroll arrival
        gsap.fromTo(
          '.process-header',
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
              toggleActions: 'play reverse play reverse',
            },
          }
        );

        // Section 02 Footer stage details entrance
        gsap.fromTo(
          '.process-footer',
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              toggleActions: 'play reverse play reverse',
            },
          }
        );
      }

      const playhead = { frame: 0 };

      const tween = gsap.to(playhead, {
        frame: TOTAL_FRAMES - 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          pin: pinRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;

            // Stage mapping according to overall scroll progress:
            // 0–25%: PLAN
            // 25–50%: DESIGN
            // 50–75%: BUILD
            // 75–100%: COMPLETE
            let stage = 0;
            if (p < 0.25) {
              stage = 0;
            } else if (p < 0.50) {
              stage = 1;
            } else if (p < 0.75) {
              stage = 2;
            } else {
              stage = 3;
            }

            if (stage !== activeStageRef.current) {
              activeStageRef.current = stage;
              setActiveStage(stage);
            }
          },
        },
        // rAF-synced render for 60 FPS smooth forward/backward scrub
        onUpdate: () => {
          const targetIdx = Math.min(
            TOTAL_FRAMES,
            Math.max(1, Math.round(playhead.frame) + 1)
          );

          if (targetIdx !== renderedFrameRef.current) {
            requestRender(targetIdx);
          }
        },
      });

      timelineRef.current = tween.scrollTrigger;
    }, containerRef);

    return () => {
      clearTimeout(timer);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      ctx.revert();
    };
  }, [isLoaderActive]);

  // Click to jump to specific stage
  const handleStageClick = (index) => {
    if (!containerRef.current || !timelineRef.current) return;
    const trigger = timelineRef.current;
    const total = trigger.end - trigger.start;
    const targets = [0.0, 0.33, 0.63, 0.98];
    const targetScroll = trigger.start + total * targets[index];
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  };

  const current = STAGES[activeStage];

  return (
    <section
      ref={containerRef}
      id="process"
      className="process-section"
      aria-label="Architectural Transformation Sequence"
    >
      <div ref={pinRef} className="process-pin-container">
        {/* Editorial Section Header */}
        <header className="process-header">
          <div className="process-header-left">
            <h2 className="process-headline">From vision to reality.</h2>
          </div>
          <p className="process-subheading">
            A thoughtful journey from the first idea to a space brought to life.
          </p>
        </header>

        {/* Central High-Quality Architectural Sequence Canvas */}
        <div ref={canvasWrapperRef} className="process-canvas-viewport">
          <canvas ref={canvasRef} className="process-sequence-canvas" />

          {/* Clean minimal fallback during initial load */}
          {!isFirstFrameLoaded && (
            <div className="process-loading-scrim">
              <div className="process-loading-pulse" />
            </div>
          )}
        </div>

        {/* Editorial Stage Information & Minimal Progress Indicator */}
        <footer className="process-footer">
          {/* Active Stage Details */}
          <div className="process-stage-meta">
            <div className="stage-title-wrap">
              <span className="stage-label-badge">{current.stageLabel}</span>
              <h3 className="stage-quote">&ldquo;{current.quote}&rdquo;</h3>
            </div>
            <p className="stage-description">{current.desc}</p>
          </div>

          {/* Minimal 4-Step Progress Indicator */}
          <div
            className="process-progress-strip"
            role="tablist"
            aria-label="Process stages"
          >
            {STAGES.map((s, idx) => {
              const isActive = idx === activeStage;
              const isPast = idx < activeStage;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`progress-step ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
                  onClick={() => handleStageClick(idx)}
                >
                  <span className="step-bar">
                    <span className="step-fill" />
                  </span>
                  <span className="step-label">
                    <span className="step-num">{s.num}</span>
                    <span className="step-name">{s.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </footer>
      </div>
    </section>
  );
}
