import emblemLight from '../assets/brand/emblem-light.png';
import emblemDark from '../assets/brand/emblem-dark.png';
import logoFullLight from '../assets/brand/logo-full-light.png';
import logoFullDark from '../assets/brand/logo-full-dark.png';

export const BRAND = {
  name: 'ZEYARCH',
  tagline: 'Architecture & Interior Design Studio',
  established: 2018,
  location: {
    city: 'Kakkanad',
    district: 'Kochi',
    state: 'Kerala',
    country: 'India',
    address: 'Kakkanad, Kochi, Kerala 682030, India',
  },
  contact: {
    phone: '+919876543210', // official business number
    phoneDisplay: '+91 98765 43210',
    whatsapp: '919876543210',
    whatsappMessage: 'Hello ZEYARCH! I visited your website and would like to discuss a project. Could you please guide me?',
    email: 'contact@zeyarch.com',
  },
  assets: {
    emblemLight,
    emblemDark,
    logoFullLight,
    logoFullDark,
  },
};

export default BRAND;
