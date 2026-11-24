import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONTACT_CONFIG } from '../../config/contactConfig';
import './ContactFooter.css';

gsap.registerPlugin(ScrollTrigger);

const COUNTRY_CODES = [
  { code: '+91', label: 'IN (+91)' },
  { code: '+971', label: 'UAE (+971)' },
  { code: '+1', label: 'US (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+65', label: 'SG (+65)' },
];

export default function ContactFooter({ isLoaderActive }) {
  const containerRef = useRef(null);
  const headingRef = useRef(null);
  const formRef = useRef(null);
  const giantBrandRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    company: '',
    details: '',
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'submitting' | 'ready_notice' | 'error'
  const [statusMessage, setStatusMessage] = useState('');

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Please provide your name';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Please provide your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.details.trim()) {
      newErrors.details = 'Please share a brief note about your project';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitStatus === 'submitting') return;

    if (!validateForm()) {
      setSubmitStatus('error');
      setStatusMessage('Please complete all required fields.');
      return;
    }

    setSubmitStatus('submitting');
    setStatusMessage('');

    // If an external endpoint is configured via VITE_CONTACT_FORM_ENDPOINT
    if (CONTACT_CONFIG.isFormEndpointConfigured()) {
      try {
        const response = await fetch(CONTACT_CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setSubmitStatus('ready_notice');
          setStatusMessage(
            'Thank you. Your project enquiry has been delivered directly to our design team.'
          );
        } else {
          setSubmitStatus('error');
          setStatusMessage(
            'Submission could not be completed. Please reach our studio directly via email.'
          );
        }
      } catch (err) {
        setSubmitStatus('error');
        setStatusMessage(
          'Network connection interrupted. Please try again or email us directly.'
        );
      }
      return;
    }

    // Authentic Client Verification Delay (when no backend endpoint is configured)
    setTimeout(() => {
      setSubmitStatus('ready_notice');
      setStatusMessage(
        'Validation passed. Studio endpoint is staged for integration. You may also dispatch this brief directly via email.'
      );
    }, 600);
  };

  // Smooth Navigation Link Helper
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      const container = containerRef.current;
      if (!container) return;

      if (prefersReducedMotion) {
        gsap.set(
          [headingRef.current, formRef.current, giantBrandRef.current],
          { opacity: 1 }
        );
        return;
      }

      // Contact Heading Reveal with refined line-by-line typography entrance
      const headingLines = headingRef.current ? headingRef.current.querySelectorAll('.contact-heading span') : [];
      const labelRow = headingRef.current ? headingRef.current.querySelector('.contact-label-row') : null;
      const metaGroup = headingRef.current ? headingRef.current.querySelector('.contact-meta-group') : null;

      const headingTl = gsap.timeline({
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 85%',
          toggleActions: 'play reverse play reverse',
        },
      });

      if (labelRow) {
        headingTl.fromTo(
          labelRow,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
      }

      if (headingLines.length > 0) {
        headingTl.fromTo(
          headingLines,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out' },
          '-=0.4'
        );
      }

      if (metaGroup) {
        headingTl.fromTo(
          metaGroup,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          '-=0.4'
        );
      }

      // Contact Form Reveal with subtle field cascade
      const formFields = formRef.current ? formRef.current.querySelectorAll('.contact-field, .contact-btn-wrap') : [];
      gsap.fromTo(
        formFields.length > 0 ? formFields : formRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 85%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );

      // Giant Typography Footer Reveal
      gsap.fromTo(
        giantBrandRef.current,
        { opacity: 0, y: 40, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: giantBrandRef.current,
            start: 'top 92%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );
    }, containerRef);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [isLoaderActive]);

  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="contact-footer-section" ref={containerRef}>
      {/* ================= 1. CONTACT SECTION ================= */}
      <div className="contact-container">
        {/* Left Column — Dramatic Editorial Typography */}
        <div className="contact-left-col" ref={headingRef}>
          <div className="contact-label-row">
            <span className="contact-label-dot" aria-hidden="true" />
            <span className="contact-label-text">WRITE US</span>
          </div>

          <h2 className="contact-heading">
            <span>GREAT INTERIORS</span>
            <span>BEGIN WITH A</span>
            <span>CONVERSATION</span>
          </h2>

          <div className="contact-meta-group">
            <div className="contact-meta-block">
              <span className="contact-meta-label">DIRECT ENQUIRIES</span>
              <a
                href={CONTACT_CONFIG.getMailtoUrl()}
                className="contact-meta-link"
              >
                {CONTACT_CONFIG.contactEmail}
              </a>
            </div>

            <div className="contact-meta-block">
              <span className="contact-meta-label">STUDIO LOCATION</span>
              <p className="contact-meta-text">
                {CONTACT_CONFIG.studioLocation}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column — Minimal Architectural Form */}
        <div className="contact-right-col" ref={formRef}>
          <form
            className="contact-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Studio Project Enquiry Form"
          >
            {/* Field 1: Name */}
            <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="contact-name" className="field-label">
                NAME <span className="field-req">*</span>
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                className="field-input"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
              {errors.name && (
                <span className="field-error-msg">{errors.name}</span>
              )}
            </div>

            {/* Field 2: Email */}
            <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="contact-email" className="field-label">
                EMAIL <span className="field-req">*</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                className="field-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
              {errors.email && (
                <span className="field-error-msg">{errors.email}</span>
              )}
            </div>

            {/* Field 3: Phone Number with Country Selector */}
            <div className="form-field phone-field">
              <label htmlFor="contact-phone" className="field-label">
                PHONE NUMBER
              </label>
              <div className="phone-input-wrap">
                <select
                  name="countryCode"
                  className="country-select"
                  value={formData.countryCode}
                  onChange={handleChange}
                  aria-label="Country Dial Code"
                >
                  {COUNTRY_CODES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  className="field-input phone-text-input"
                  placeholder="98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Field 4: Company */}
            <div className="form-field">
              <label htmlFor="contact-company" className="field-label">
                COMPANY
              </label>
              <input
                id="contact-company"
                name="company"
                type="text"
                className="field-input"
                placeholder="Company / Residence name"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            {/* Field 5: Details About Your Project */}
            <div className={`form-field ${errors.details ? 'has-error' : ''}`}>
              <label htmlFor="contact-details" className="field-label">
                DETAILS ABOUT YOUR PROJECT <span className="field-req">*</span>
              </label>
              <textarea
                id="contact-details"
                name="details"
                rows="3"
                className="field-input field-textarea"
                placeholder="Tell us about the site location, scope of architecture, interior styling, or expected timeline..."
                value={formData.details}
                onChange={handleChange}
                required
              />
              {errors.details && (
                <span className="field-error-msg">{errors.details}</span>
              )}
            </div>

            {/* Status Feedback Notice */}
            {submitStatus === 'ready_notice' && (
              <div
                className="form-notice-box notice-staged"
                role="status"
                aria-live="polite"
              >
                <span className="notice-icon">&#x2713;</span>
                <div className="notice-inner-content">
                  <p className="notice-text">{statusMessage}</p>
                  {CONTACT_CONFIG.isEmailConfigured() && (
                    <a
                      href={CONTACT_CONFIG.getMailtoUrl(
                        `Project Enquiry - ${formData.name}`,
                        `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.countryCode} ${formData.phone}\nCompany: ${formData.company}\n\nProject Details:\n${formData.details}`
                      )}
                      className="notice-mailto-link"
                    >
                      Open in Mail App &rarr;
                    </a>
                  )}
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div
                className="form-notice-box notice-alert"
                role="alert"
                aria-live="polite"
              >
                <span className="notice-icon">&#x21;</span>
                <p className="notice-text">{statusMessage}</p>
              </div>
            )}

            {/* Form Footer with SEND Control */}
            <div className="form-submit-row">
              <span className="form-privacy-note">
                Strict confidentiality assured for all private architectural
                commissions.
              </span>

              <button
                type="submit"
                className="contact-submit-btn"
                disabled={submitStatus === 'submitting'}
              >
                <span className="btn-text">
                  {submitStatus === 'submitting' ? 'VERIFYING...' : 'SEND'}
                </span>
                <span className="btn-arrow" aria-hidden="true">↗</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================= 2. GIANT TYPOGRAPHIC FOOTER ================= */}
      <div className="footer-giant-canvas">
        {/* Massive Signature Wordmark */}
        <div
          className="giant-wordmark-container"
          ref={giantBrandRef}
          aria-label="ZEYARCH Architectural Studio Signature"
        >
          <span className="giant-wordmark-text">ZEYARCH</span>
          <span className="giant-wordmark-period">.</span>
        </div>

        {/* Compact Navigation Area Beneath Giant Wordmark */}
        <div className="footer-nav-bar">
          <nav aria-label="Footer Quick Navigation" className="footer-nav-list">
            <a
              href="#studio"
              className="footer-nav-link"
              onClick={(e) => handleNavClick(e, 'studio')}
            >
              ABOUT / STUDIO
            </a>
            <span className="footer-nav-sep" aria-hidden="true">&bull;</span>

            <a
              href="#process"
              className="footer-nav-link"
              onClick={(e) => handleNavClick(e, 'process')}
            >
              OUR PROCESS
            </a>
            <span className="footer-nav-sep" aria-hidden="true">&bull;</span>

            <a
              href="#works"
              className="footer-nav-link"
              onClick={(e) => handleNavClick(e, 'works')}
            >
              PROJECTS
            </a>
            <span className="footer-nav-sep" aria-hidden="true">&bull;</span>

            <a
              href="#contact"
              className="footer-nav-link"
              onClick={(e) => handleNavClick(e, 'contact')}
            >
              CONTACT
            </a>
          </nav>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="footer-meta-bar">
          <p className="footer-copyright">
            &copy; {currentYear} ZEYARCH ARCHITECTURE &amp; INTERIORS. ALL RIGHTS
            RESERVED.
          </p>

          <p className="footer-studio-tagline">
            KOCHI &bull; CONTEMPORARY ARCHITECTURAL SANCTUARY
          </p>
        </div>
      </div>
    </footer>
  );
}
