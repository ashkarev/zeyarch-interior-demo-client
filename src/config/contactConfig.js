/**
 * ZEYARCH Central Contact & Lead Generation Configuration
 *
 * Centralizes all verified contact details, WhatsApp direct messaging URLs,
 * mailto link builders, and form submission endpoints across the entire website.
 */

const env = import.meta.env || {};

export const CONTACT_CONFIG = {
  // Official Business WhatsApp Number (international format, digits only, e.g. "919876543210")
  whatsappNumber: (env.VITE_ZEYARCH_WHATSAPP_NUMBER || '').replace(/[^0-9]/g, ''),

  // Prefilled WhatsApp message
  whatsappDefaultMessage:
    'Hello ZEYARCH! I visited your website and would like to discuss a project. Could you please guide me?',

  // Official Studio Contact Email
  contactEmail: env.VITE_ZEYARCH_CONTACT_EMAIL || 'contact@zeyarch.com',

  // Default Email Subject for direct mailto links
  defaultEmailSubject: 'Project Enquiry - ZEYARCH',

  // Optional backend API / form service endpoint (e.g. Formspree, Resend, or custom API)
  formEndpoint: env.VITE_CONTACT_FORM_ENDPOINT || '',

  // Studio physical coordinates
  studioLocation: 'Kakkanad, Kochi, Kerala, India',

  // Status Checkers
  isWhatsAppConfigured() {
    return Boolean(this.whatsappNumber && this.whatsappNumber.length >= 7);
  },

  isEmailConfigured() {
    return Boolean(this.contactEmail && this.contactEmail.includes('@'));
  },

  isFormEndpointConfigured() {
    return Boolean(this.formEndpoint && this.formEndpoint.startsWith('http'));
  },

  // WhatsApp Link Builder
  getWhatsAppUrl(customMessage) {
    if (!this.isWhatsAppConfigured()) return null;
    const msg = customMessage || this.whatsappDefaultMessage;
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  },

  // Mailto Link Builder
  getMailtoUrl(subject, body) {
    if (!this.isEmailConfigured()) return '#';
    const subj = subject || this.defaultEmailSubject;
    let url = `mailto:${this.contactEmail}?subject=${encodeURIComponent(subj)}`;
    if (body) {
      url += `&body=${encodeURIComponent(body)}`;
    }
    return url;
  },
};
