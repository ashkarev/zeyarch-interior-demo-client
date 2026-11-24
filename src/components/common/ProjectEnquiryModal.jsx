import React, { useState, useEffect, useRef } from 'react';
import { CONTACT_CONFIG } from '../../config/contactConfig';
import './ProjectEnquiryModal.css';

const COUNTRY_CODES = [
  { code: '+91', label: 'IN (+91)' },
  { code: '+971', label: 'UAE (+971)' },
  { code: '+1', label: 'US (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+65', label: 'SG (+65)' },
];

const PROJECT_TYPES = [
  'Architecture',
  'Interior Design',
  'Design & Build',
  'Other',
];

export default function ProjectEnquiryModal({ isLoaderActive, isNavMenuOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    projectType: 'Architecture',
    location: '',
    details: '',
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'submitting' | 'ready_notice' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const modalBoxRef = useRef(null);

  // 1. Scroll-Trigger Logic: Trigger after ~60% homepage scroll
  useEffect(() => {
    if (isLoaderActive) return;

    const now = Date.now();
    // Check session suppression (max once per session)
    const alreadyShownSession = sessionStorage.getItem('zeyarch_modal_session_shown');
    // Check 7-day dismissal suppression
    const dismissedUntil = localStorage.getItem('zeyarch_modal_dismissed_until');
    // Check 90-day submission suppression
    const submittedUntil = localStorage.getItem('zeyarch_modal_submitted_until');

    if (alreadyShownSession) return;
    if (dismissedUntil && now < parseInt(dismissedUntil, 10)) return;
    if (submittedUntil && now < parseInt(submittedUntil, 10)) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // If nav menu is currently open, do not trigger modal
          const navOverlay = document.querySelector('.split-menu-overlay');
          const isNavOpen = navOverlay && navOverlay.style.display !== 'none';
          if (isNavMenuOpen || isNavOpen) {
            ticking = false;
            return;
          }

          const docHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          if (docHeight > 0) {
            const scrollPercent = window.scrollY / docHeight;
            if (scrollPercent >= 0.60) {
              setIsOpen(true);
              sessionStorage.setItem('zeyarch_modal_session_shown', 'true');
              window.removeEventListener('scroll', handleScroll);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isLoaderActive, isNavMenuOpen]);

  // 2. Lock Body Scroll & Keyboard Escape Handling
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    // Suppress for 7 days upon dismissal
    const dismissedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('zeyarch_modal_dismissed_until', dismissedUntil.toString());
    sessionStorage.setItem('zeyarch_modal_session_shown', 'true');
  };

  const recordSubmission = () => {
    // Suppress for 90 days after submission
    const submittedUntil = Date.now() + 90 * 24 * 60 * 60 * 1000;
    localStorage.setItem('zeyarch_modal_submitted_until', submittedUntil.toString());
    sessionStorage.setItem('zeyarch_modal_submitted', 'true');
    sessionStorage.setItem('zeyarch_modal_session_shown', 'true');
  };

  const handleBackdropClick = (e) => {
    if (modalBoxRef.current && !modalBoxRef.current.contains(e.target)) {
      handleClose();
    }
  };

  // Form Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Please provide your full name';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Please provide your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please provide your contact phone number';
    }
    if (!formData.projectType) {
      newErrors.projectType = 'Please select a project type';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
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
          recordSubmission();
          setSubmitStatus('ready_notice');
          setStatusMessage(
            'Thank you. Your project enquiry has been delivered directly to our design team.'
          );
        } else {
          setSubmitStatus('error');
          setStatusMessage(
            'Submission could not be completed. Please reach us directly via email.'
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

    // When no backend endpoint is configured: state transparency cleanly
    setTimeout(() => {
      recordSubmission();
      setSubmitStatus('ready_notice');
      setStatusMessage(
        'Validation passed. Studio endpoint is staged for integration. You may also dispatch this brief directly via email.'
      );
    }, 550);
  };

  // Construct mailto for fallback
  const mailtoFallback = CONTACT_CONFIG.getMailtoUrl(
    `Project Enquiry - ${formData.projectType} (${formData.name})`,
    `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.countryCode} ${formData.phone}\nProject Type: ${formData.projectType}\nLocation: ${formData.location}\n\nDetails:\n${formData.details}`
  );

  if (!isOpen) return null;

  return (
    <div
      className="enquiry-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-enquiry-title"
    >
      <div className="enquiry-modal-box" ref={modalBoxRef}>
        {/* Close Button */}
        <button
          type="button"
          className="enquiry-close-btn"
          onClick={handleClose}
          aria-label="Close project enquiry modal"
        >
          <span className="close-symbol">&times;</span>
        </button>

        {/* Modal Header */}
        <div className="enquiry-header">
          <div className="enquiry-label">PROJECT ENQUIRY</div>
          <h3 id="modal-enquiry-title" className="enquiry-heading">
            Have a project in mind?
          </h3>
          <p className="enquiry-subheading">
            Tell us a little about your vision. We&apos;d love to hear what
            you&apos;re planning.
          </p>
        </div>

        {/* Modal Form */}
        <form
          className="enquiry-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label="Project Enquiry Form"
        >
          <div className="enquiry-form-grid">
            {/* Full Name */}
            <div
              className={`enquiry-field ${errors.name ? 'has-error' : ''}`}
            >
              <label htmlFor="modal-name" className="enquiry-label-text">
                FULL NAME <span className="req">*</span>
              </label>
              <input
                id="modal-name"
                name="name"
                type="text"
                className="enquiry-input"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && (
                <span className="enquiry-err">{errors.name}</span>
              )}
            </div>

            {/* Email Address */}
            <div
              className={`enquiry-field ${errors.email ? 'has-error' : ''}`}
            >
              <label htmlFor="modal-email" className="enquiry-label-text">
                EMAIL ADDRESS <span className="req">*</span>
              </label>
              <input
                id="modal-email"
                name="email"
                type="email"
                className="enquiry-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <span className="enquiry-err">{errors.email}</span>
              )}
            </div>

            {/* Phone Number with Country Code */}
            <div
              className={`enquiry-field ${errors.phone ? 'has-error' : ''}`}
            >
              <label htmlFor="modal-phone" className="enquiry-label-text">
                PHONE NUMBER <span className="req">*</span>
              </label>
              <div className="enquiry-phone-wrap">
                <select
                  name="countryCode"
                  className="enquiry-country-select"
                  value={formData.countryCode}
                  onChange={handleChange}
                  aria-label="Country Code"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  id="modal-phone"
                  name="phone"
                  type="tel"
                  className="enquiry-input phone-text"
                  placeholder="98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.phone && (
                <span className="enquiry-err">{errors.phone}</span>
              )}
            </div>

            {/* Project Type */}
            <div className="enquiry-field">
              <label htmlFor="modal-type" className="enquiry-label-text">
                PROJECT TYPE <span className="req">*</span>
              </label>
              <select
                id="modal-type"
                name="projectType"
                className="enquiry-select"
                value={formData.projectType}
                onChange={handleChange}
                required
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Location */}
            <div className="enquiry-field full-width">
              <label htmlFor="modal-loc" className="enquiry-label-text">
                PROJECT LOCATION
              </label>
              <input
                id="modal-loc"
                name="location"
                type="text"
                className="enquiry-input"
                placeholder="e.g. Kakkanad, Kochi / Dubai / Bangalore"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {/* Project Details */}
            <div className="enquiry-field full-width">
              <label htmlFor="modal-details" className="enquiry-label-text">
                PROJECT DETAILS
              </label>
              <textarea
                id="modal-details"
                name="details"
                rows="3"
                className="enquiry-input enquiry-textarea"
                placeholder="Scope, architectural aesthetic, approximate square footage, or target timeline..."
                value={formData.details}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Feedback Notice */}
          {submitStatus === 'ready_notice' && (
            <div className="enquiry-notice-card success-card" role="status">
              <p className="notice-lead-p">{statusMessage}</p>
              {CONTACT_CONFIG.isEmailConfigured() && (
                <a
                  href={mailtoFallback}
                  className="notice-mailto-btn"
                >
                  Send via Mail App &rarr;
                </a>
              )}
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="enquiry-notice-card error-card" role="alert">
              <p className="notice-lead-p">{statusMessage}</p>
            </div>
          )}

          {/* Modal Actions */}
          <div className="enquiry-action-row">
            <button
              type="submit"
              className="enquiry-submit-btn"
              disabled={submitStatus === 'submitting'}
            >
              <span>
                {submitStatus === 'submitting'
                  ? 'TRANSMITTING...'
                  : 'DISCUSS YOUR PROJECT ↗'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
