import { useRef, useEffect, useState } from 'react';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

import About from "../components/landing/About";
import Appointment from "../components/landing/Appointment";
import AuthModal from "../components/Auth/AuthModal";
import Footer from "../components/landing/Footer";
import Hc from "../components/landing/Hc";
import HomePage from "../components/landing/HomePage";
import Process from "../components/landing/Process";
import S2 from "../components/landing/S2";
import Testimonial from "../components/landing/Testimonial";
import Team from "../components/landing/Team";
import Services from "../components/landing/Services";

function LandingPage() {
  const containerRef = useRef(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const scroll = new LocomotiveScroll({
      el: containerRef.current,
      smooth: true,
    });

    return () => scroll.destroy();
  }, []);

  return (
    <>
      <button
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 1100,
          padding: "0.7rem 1.5rem",
          borderRadius: "5px",
          border: "none",
          background: "#007bff",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer"
        }}
        onClick={() => setAuthOpen(true)}
      >
        Sign In / Sign Up
      </button>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <div data-scroll-container ref={containerRef}>
        <section data-scroll-section id="home">
          <HomePage />
        </section>

        <section data-scroll-section id="about">
          <About />
        </section>

        <section data-scroll-section id="services">
          <Services />
        </section>

        <section data-scroll-section id="appointment">
          <Appointment />
        </section>

        <section data-scroll-section id="hc">
          <Hc />
        </section>

        <section data-scroll-section id="team">
          <Team />
        </section>

        <section data-scroll-section id="testimonial">
          <Testimonial />
        </section>

        <section data-scroll-section id="process">
          <Process />
        </section>

        <section data-scroll-section id="s2">
          <S2 />
        </section>

        <section data-scroll-section id="footer">
          <Footer />
        </section>
      </div>
    </>
  );
}

export default LandingPage; 