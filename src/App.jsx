import React, { useState } from 'react';
import Preloader from './components/loader/Preloader';
import Navbar from './components/nav/Navbar';
import Hero from './components/hero/Hero';
import Process from './components/process/Process';
import SelectedWorks from './components/works/SelectedWorks';
import Expertise from './components/expertise/Expertise';
import Studio from './components/studio/Studio';
import ContactFooter from './components/contact/ContactFooter';
import WhatsAppButton from './components/common/WhatsAppButton';
import ProjectEnquiryModal from './components/common/ProjectEnquiryModal';
import './App.css';

export default function App() {
  const [isLoaderActive, setIsLoaderActive] = useState(true);
  const [replayKey, setReplayKey] = useState(0);

  const handleLoaderComplete = () => {
    setIsLoaderActive(false);
  };

  const handleReplay = () => {
    setIsLoaderActive(true);
    setReplayKey((prev) => prev + 1);
  };

  return (
    <div className="zeyarch-app" id="top">
      {/* Reference-Accurate Cinematic Preloader */}
      {isLoaderActive && (
        <Preloader
          key={replayKey}
          onComplete={handleLoaderComplete}
        />
      )}

      {/* Premium Architectural Navigation Bar */}
      <Navbar onReplay={handleReplay} />

      {/* Cinematic Architectural Video Hero */}
      <Hero isLoaderActive={isLoaderActive} />

      {/* Section 02 — Minimal Editorial Architectural Process */}
      <Process isLoaderActive={isLoaderActive} />

      {/* Section 03 — ABVTEK-Inspired Selected Works Split-Screen Showcase */}
      <SelectedWorks isLoaderActive={isLoaderActive} />

      {/* Section 04 — Our Expertise */}
      <Expertise />

      {/* Section 05 — The Studio / About ZEYARCH */}
      <Studio isLoaderActive={isLoaderActive} />

      {/* Section 06 — Bold Architectural Contact & Giant Typographic Footer */}
      <ContactFooter isLoaderActive={isLoaderActive} />

      {/* Persistent Floating WhatsApp Contact Action */}
      <WhatsAppButton />

      {/* Project Enquiry Modal (~60% Scroll Trigger, Once Per Session) */}
      <ProjectEnquiryModal isLoaderActive={isLoaderActive} />
    </div>
  );
}
