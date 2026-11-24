import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from 'react';
import gsap from 'gsap';
import './NavShutterOverlay.css';

const STRIP_COUNT = 10;

const NavShutterOverlay = forwardRef(function NavShutterOverlay(props, ref) {
  const containerRef = useRef(null);
  const stripsRef = useRef([]);
  const fadeLayerRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const timelineRef = useRef(null);

  // Handle browser back/forward buttons safely
  useEffect(() => {
    const handlePopState = () => {
      if (isTransitioningRef.current && timelineRef.current) {
        timelineRef.current.kill();
        if (containerRef.current) {
          gsap.set(containerRef.current, { visibility: 'hidden', pointerEvents: 'none' });
        }
        if (stripsRef.current.length > 0) {
          gsap.set(stripsRef.current, { xPercent: 100 });
        }
        if (fadeLayerRef.current) {
          gsap.set(fadeLayerRef.current, { opacity: 0 });
        }
        isTransitioningRef.current = false;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (timelineRef.current) timelineRef.current.kill();
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      transitionTo: (targetId, onCovered, onComplete) => {
        if (isTransitioningRef.current) return false;

        const container = containerRef.current;
        const strips = stripsRef.current.filter(Boolean);
        const fadeLayer = fadeLayerRef.current;
        if (!container || strips.length === 0) return false;

        isTransitioningRef.current = true;

        if (timelineRef.current) timelineRef.current.kill();

        // 1. Initial State: strips off-screen to the right
        gsap.set(container, { visibility: 'visible', pointerEvents: 'all' });
        gsap.set(strips, { xPercent: 100, visibility: 'visible' });

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(container, { visibility: 'hidden', pointerEvents: 'none' });
            gsap.set(strips, { xPercent: 100 });
            isTransitioningRef.current = false;
            if (onComplete) onComplete();
          },
        });
        timelineRef.current = tl;

        // 2. Closing Phase: strips sweep in from right to left (100% -> 0%)
        tl.to(strips, {
          xPercent: 0,
          duration: 0.52,
          stagger: {
            each: 0.028,
            from: 'start',
          },
          ease: 'power3.inOut',
        });

        // 3. Apex: Screen is 100% covered. Execute instant navigation & DOM updates
        tl.add(() => {
          if (onCovered) onCovered();
        });

        // 4. Opening Phase: strips sweep away to the left (0% -> -100%)
        tl.to(strips, {
          xPercent: -100,
          duration: 0.52,
          stagger: {
            each: 0.028,
            from: 'start',
          },
          ease: 'power3.inOut',
        });

        return true;
      },
      isTransitioning: () => isTransitioningRef.current,
    }),
    []
  );

  return (
    <div
      ref={containerRef}
      className="nav-shutter-overlay"
      aria-hidden="true"
    >
      {/* 10 Horizontal Shutter Strips */}
      <div className="nav-shutter-strips-layer">
        {Array.from({ length: STRIP_COUNT }).map((_, idx) => {
          const heightPercent = 100 / STRIP_COUNT;
          const topPercent = idx * heightPercent;
          return (
            <div
              key={idx}
              ref={(el) => (stripsRef.current[idx] = el)}
              className="nav-shutter-strip"
              style={{
                top: `${topPercent}%`,
                height: `calc(${heightPercent}% + 1.5px)`,
              }}
            >
              {/* Leading Edge Warm Ivory / Brand Red Glow */}
              <div className="nav-shutter-strip-glow" />
              {/* Trailing Edge Glow for Opening Phase */}
              <div className="nav-shutter-strip-glow-trail" />
            </div>
          );
        })}
      </div>

      {/* Reduced Motion Fade Layer */}
      <div ref={fadeLayerRef} className="nav-shutter-fade-layer" />
    </div>
  );
});

export default NavShutterOverlay;
