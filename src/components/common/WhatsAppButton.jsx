import React, { useState } from 'react';
import { CONTACT_CONFIG } from '../../config/contactConfig';
import './WhatsAppButton.css';

export default function WhatsAppButton() {
  const [showConfigNotice, setShowConfigNotice] = useState(false);
  const isConfigured = CONTACT_CONFIG.isWhatsAppConfigured();
  const whatsappUrl = CONTACT_CONFIG.getWhatsAppUrl();

  const handleClick = (e) => {
    if (!isConfigured) {
      e.preventDefault();
      setShowConfigNotice(true);
      setTimeout(() => setShowConfigNotice(false), 4500);
    }
  };

  return (
    <div className="whatsapp-floating-wrap">
      {/* Pending Configuration Toast if number is not yet in .env */}
      {showConfigNotice && (
        <div className="whatsapp-notice-toast" role="status" aria-live="polite">
          <p className="notice-toast-text">
            WhatsApp messaging is staged. Studio number pending in configuration.
          </p>
          <a
            href={CONTACT_CONFIG.getMailtoUrl()}
            className="notice-toast-link"
          >
            Email Studio &rarr;
          </a>
        </div>
      )}

      {/* Floating Button with Tooltip */}
      <a
        href={whatsappUrl || '#whatsapp-pending'}
        onClick={handleClick}
        target={isConfigured ? '_blank' : '_self'}
        rel={isConfigured ? 'noopener noreferrer' : undefined}
        className="whatsapp-btn"
        aria-label="Chat with ZEYARCH on WhatsApp"
      >
        <span className="whatsapp-tooltip">Chat with ZEYARCH</span>

        {/* Recognizable Clean WhatsApp SVG Icon */}
        <svg
          className="whatsapp-icon"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16 2C8.268 2 2 8.268 2 16c0 2.536.673 4.915 1.849 6.969L2.5 29.5l6.762-1.328A13.916 13.916 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm6.917 19.34c-.292.823-1.458 1.507-2.38 1.706-.633.136-1.46.246-4.24-.906-3.553-1.472-5.834-5.086-6.012-5.321-.173-.235-1.428-1.902-1.428-3.627 0-1.725.906-2.574 1.226-2.926.32-.352.697-.44.93-.44.232 0 .465.002.668.012.215.01.502-.082.785.597.292.703 1.002 2.443 1.09 2.62.088.177.147.382.029.617-.117.234-.176.38-.352.585-.176.205-.37.458-.528.616-.176.176-.36.368-.155.72.205.352.912 1.504 1.956 2.433 1.343 1.196 2.476 1.567 2.827 1.743.352.176.557.147.763-.088.205-.235.879-1.026 1.113-1.378.234-.352.469-.293.79-.176.323.118 2.052.968 2.404 1.144.352.176.586.264.674.41.088.147.088.852-.204 1.675z"
            fill="#FFFFFF"
          />
        </svg>
      </a>
    </div>
  );
}
