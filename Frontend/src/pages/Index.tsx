import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "../../assets/logo.png"; // adjust path if needed

const Index = () => {
  // Refs for each section
  const homeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to section handler
  const handleScroll = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav
  className="py-4 sticky top-0 z-50"
  style={{
    backgroundColor: "#06071B", // Updated navbar color to match your request
  }}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
    <div className="flex items-center gap-4">
      <img
        src={logo}
        alt="Arogya-Vritti Logo"
        className="h-24 w-auto" // Increased logo size
        style={{ maxHeight: "96px" }} // Ensures it fits nicely
      />
    </div>
    <div className="flex items-center gap-8">
      <button
        className="text-white font-medium hover:text-blue-200 transition"
        onClick={() => handleScroll(homeRef)}
      >
        Home
      </button>
      <button
        className="text-white font-medium hover:text-blue-200 transition"
        onClick={() => handleScroll(aboutRef)}
      >
        About Us
      </button>
      <button
        className="text-white font-medium hover:text-blue-200 transition"
        onClick={() => handleScroll(servicesRef)}
      >
        Services
      </button>
      <button
        className="text-white font-medium hover:text-blue-200 transition"
        onClick={() => handleScroll(testimonialsRef)}
      >
        Testimonials
      </button>
      <button
        className="text-white font-medium hover:text-blue-200 transition"
        onClick={() => handleScroll(contactRef)}
      >
        Contact Us
      </button>
      <Link to="/auth">
        <Button
          variant="outline"
          size="sm"
          className="border-white text-black hover:bg-blue-200 hover:text-[#06071B] bg-white"
          style={{ borderColor: "#fff" }}
        >
          Sign In
        </Button>
      </Link>
      <Link to="/auth">
        <Button
          size="sm"
          className="bg-white text-[#06071B] hover:bg-blue-200 hover:text-[#06071B]"
        >
          Get Started
        </Button>
      </Link>
    </div>
  </div>
</nav>
      
      {/* Hero Section */}
      <section ref={homeRef} className="bg-gradient-to-br from-blue-50 to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                Access Healthcare Anywhere, Anytime
              </h2>
              <p className="mt-6 text-lg text-gray-600">
                Instant health consultations, real-time monitoring, and personalized care from the comfort of your home.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Book a Consultation
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline">
                    Try Our AI Chat Assistant
                  </Button>
                </Link>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  onClick={() => navigate("/doctors")}
                >
                  View Doctors
                </Button>
              </div>
            </div>
            <div>
              <img src="https://img.freepik.com/premium-vector/cartoon-characters-online-doctor-consulting-his-patient-via-video-call_776652-1359.jpg" alt="Telehealth Interface Preview" className="rounded-lg shadow-lg p-0 flex items-center justify-center" />
            </div>
          </div>
        </div>
      </section>
      
      {/* About Us */}
      <section ref={aboutRef} className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center">
      <h2 className="text-4xl font-bold text-blue-700 flex items-center justify-center gap-2 mb-2">
        <span role="img" aria-label="stethoscope">🩺</span> Welcome to CureLink
      </h2>
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">
        Your Health. Anywhere. Anytime.
      </h3>
      <p className="mt-2 text-lg text-gray-700 max-w-2xl mx-auto mb-8">
        CureLink is a complete telehealth platform designed to make healthcare accessible, efficient, and effortless for everyone — no matter where you are.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
        <div className="bg-blue-50 rounded-lg p-6 flex flex-col items-center shadow hover:shadow-md transition">
          <span className="text-3xl mb-3 text-blue-600">📅</span>
          <p className="font-semibold text-gray-800 text-center">Book appointments<br />with certified doctors</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 flex flex-col items-center shadow hover:shadow-md transition">
          <span className="text-3xl mb-3 text-blue-600">🎥</span>
          <p className="font-semibold text-gray-800 text-center">Video call with healthcare<br />professionals in real-time</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 flex flex-col items-center shadow hover:shadow-md transition">
          <span className="text-3xl mb-3 text-blue-600">🗂️</span>
          <p className="font-semibold text-gray-800 text-center">Upload & manage your<br />health reports securely</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 flex flex-col items-center shadow hover:shadow-md transition">
          <span className="text-3xl mb-3 text-blue-600">📊</span>
          <p className="font-semibold text-gray-800 text-center">Track your health status<br />with smart, easy-to-use tools</p>
        </div>
      </div>
      <p className="text-lg text-gray-700 max-w-2xl mx-auto">
        We combine secure video consultations, AI-powered health support, and real-time monitoring to bring the clinic to your screen — making quality healthcare just a click away.
      </p>
    </div>
  </div>
</section>
      
      {/* Core Services */}
      <section ref={servicesRef} className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Core Services</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Appointments</h3>
              <p className="text-gray-600">
                Easily schedule virtual consultations with healthcare specialists.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Emergency Services</h3>
              <p className="text-gray-600">
                Access nearby hospitals and urgent medical care without leaving your home.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Health Assistant</h3>
              <p className="text-gray-600">
                Get quick answers to common health questions from our AI assistant.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalised Dashboard</h3>
              <p className="text-gray-600">
                Track your health insights and appointments in one place with a tailored dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonial */}
      <section ref={testimonialsRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Patient Testimonials</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Card 1 - existing */}
            <div className="bg-blue-50 p-8 rounded-lg relative">
              <svg className="absolute top-0 left-0 transform -translate-x-3 -translate-y-3 h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <p className="text-lg text-gray-700 mb-6">
                "CureLink has been a lifesaver for me. As someone with chronic conditions who lives in a rural area, 
                having access to specialists without driving for hours has made managing my health so much easier."
              </p>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-600">
                  <span className="font-bold">CS</span>
                </div>
                <div className="ml-4">
                  <p className="font-medium">Chirag Sinha</p>
                  <p className="text-sm text-gray-500">Patient since last few days</p>
                </div>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-blue-50 p-8 rounded-lg relative">
              <svg className="absolute top-0 left-0 transform -translate-x-3 -translate-y-3 h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <p className="text-lg text-gray-700 mb-6">
                "This platform changed my life! The personalized plans and expert guidance helped me reach my health goals naturally."
              </p>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-600">
                  <span className="font-bold">RS</span>
                </div>
                <div className="ml-4">
                  <p className="font-medium">Riya S.</p>
                  <p className="text-sm text-gray-500">Delhi</p>
                </div>
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-blue-50 p-8 rounded-lg relative">
              <svg className="absolute top-0 left-0 transform -translate-x-3 -translate-y-3 h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <p className="text-lg text-gray-700 mb-6">
                "Simple, practical, and effective. The advice I got here made a real difference in my daily life."
              </p>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-600">
                  <span className="font-bold">RP</span>
                </div>
                <div className="ml-4">
                  <p className="font-medium">Ravi P.</p>
                  <p className="text-sm text-gray-500">Chennai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer / Contact Us */}
      <footer ref={contactRef} className="bg-[#06071B] text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src={logo} alt="CureLink Logo" className="h-24 w-auto mb-2" style={{ maxHeight: "120px" }} />
              <p className="text-blue-200">
                Access to quality healthcare from anywhere, anytime.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => handleScroll(homeRef)} className="text-blue-200 hover:text-white">Home</button>
                </li>
                <li>
                  <button onClick={() => handleScroll(aboutRef)} className="text-blue-200 hover:text-white">About Us</button>
                </li>
                <li>
                  <button onClick={() => handleScroll(servicesRef)} className="text-blue-200 hover:text-white">Services</button>
                </li>
                <li>
                  <button onClick={() => handleScroll(testimonialsRef)} className="text-blue-200 hover:text-white">Testimonials</button>
                </li>
                <li>
                  <button onClick={() => handleScroll(contactRef)} className="text-blue-200 hover:text-white">Contact Us</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect with Creators</h4>
              <ul className="space-y-2">
                <li>
                  <a href="www.linkedin.com/in/sakshi-653626259" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    Sakshi
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/pratham282/" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    Pratham Bisht
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/prabhav-pushker-47b073301?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    Prabhav Pushker
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/supriya-pandey22/" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    Chunnilal
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2">
                <li className="text-blue-200">Email: support@curelink.com</li>
                <li className="text-blue-200">Phone: +1 (555) 123-4567</li>
              </ul>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-blue-200 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-blue-200 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-blue-200 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-blue-800 text-center text-blue-300 text-sm">
            <p>© 2025 CureLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
