import React, { useState } from "react";
import {
  Menu,
  X,
  Tractor,
  MapPin,
  MessageSquare,
  CreditCard,
  Zap, Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HelloFarmersLogo } from "./Logo";
import homepageFarmImage from "../assets/homepage-farm.jpg";

export default function HomePage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Easy Payment",
      description: "Secure and flexible payment options with multiple methods",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Booking",
      description: "Book equipment in seconds with just a few clicks",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Daily Rentals",
      description: "Rent equipment for any duration that suits your needs",
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Location Tracking",
      description: "Real-time tracking of equipment location and availability",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Easy Chatting",
      description: "Direct messaging with equipment owners",
    },
    {
      icon: <Tractor className="w-8 h-8" />,
      title: "Wide Selection",
      description: "Access to thousands of farming equipment",
    },
  ];

  const stats = [
    { number: "10K+", label: "Equipment Available" },
    { number: "5K+", label: "Active Farmers" },
    { number: "99%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support" },
  ];

  const typingTexts = [
    "Easy to Rent",
    "Easy to Buy",
    "Easy to Return",
    "All-in-One Platform",
    "AgriRent",
  ];

  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (charIndex < typingTexts[textIndex].length) {
        setDisplayText((prev) => prev + typingTexts[textIndex][charIndex]);
        setCharIndex(charIndex + 1);
      } else {
        setTimeout(() => {
          setDisplayText("");
          setCharIndex(0);
          setTextIndex((textIndex + 1) % typingTexts.length);
        }, 1500);
      }
    }, 120);

    return () => clearTimeout(timeout);
  }, [charIndex, textIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-light via-white to-agri-light">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-md shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <HelloFarmersLogo size={40}></HelloFarmersLogo>
              <span className="text-2xl font-bold text-agri-dark">
                AgriRent
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-agri-dark transition"
              >
                Features
              </a>
              <a
                href="#stats"
                className="text-gray-700 hover:text-agri-dark transition"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-agri-dark transition"
              >
                Contact
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 text-agri-dark border-2 border-agri-dark rounded-lg hover:bg-agri-light transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-2 bg-agri-dark text-white rounded-lg hover:bg-agri-green transition animate-pulse-glow"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 animate-slideInUp">
              <a href="#features" className="block py-2 text-gray-700">
                Features
              </a>
              <a href="#stats" className="block py-2 text-gray-700">
                About
              </a>
              <a href="#contact" className="block py-2 text-gray-700">
                Contact
              </a>
              <div className="flex flex-col space-y-2 mt-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-agri-dark border-2 border-agri-dark rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 bg-agri-dark text-white rounded-lg"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="h-screen w-full bg-cover bg-center relative flex items-center justify-center"
        style={{
          backgroundImage: `url(${homepageFarmImage})`,
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 animate-fadeIn">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-wide">
            <span className="border-r-4 border-white pr-3 animate-blink">
              {displayText}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-10">
            Rent, buy, and manage agricultural equipment effortlessly — designed
            for modern farmers.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="px-10 py-4 bg-agri-green text-white rounded-xl text-lg font-semibold hover:scale-105 transition shadow-xl"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-10 py-4 bg-white/20 border border-white text-white rounded-xl text-lg font-semibold hover:bg-white/30 transition"
            >
              Browse Equipment
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slideInUp">
            <h2 className="text-4xl md:text-5xl font-bold text-agri-dark mb-4">
              Why Choose AgriRent?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for hassle-free equipment rental
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-gradient-to-br from-agri-light to-white rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-2 animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-agri-dark/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-agri-dark">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-agri-dark mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats"
        className="py-20 px-4 bg-gradient-to-r from-agri-dark to-agri-green text-white"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-slideInUp">
            Our Impact
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-slideInUp"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <p className="text-5xl font-bold mb-2">{stat.number}</p>
                <p className="text-xl opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-agri-dark text-center mb-16 animate-slideInUp">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-agri-accent to-transparent"></div>

            {[
              {
                step: 1,
                title: "Browse",
                desc: "Explore available equipment in your area",
              },
              {
                step: 2,
                title: "Book",
                desc: "Select dates and complete instant booking",
              },
              {
                step: 3,
                title: "Connect",
                desc: "Chat with owner for pickup details",
              },
              {
                step: 4,
                title: "Enjoy",
                desc: "Use equipment and track its location",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-gradient-to-br from-agri-dark to-agri-green text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg transition-transform duration-300 hover:scale-110 cursor-pointer">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-agri-dark mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="contact"
        className="py-20 px-4 bg-gradient-to-br from-agri-dark/10 to-agri-accent/10"
      >
        <div className="max-w-4xl mx-auto text-center animate-slideInUp">
          <h2 className="text-4xl md:text-5xl font-bold text-agri-dark mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of farmers transforming agricultural equipment rental
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-agri-dark text-white rounded-lg text-lg font-semibold hover:bg-agri-green transition transform hover:scale-105 animate-pulse-glow"
            >
              Create Account
            </button>
            <button className="px-8 py-4 border-2 border-agri-dark text-agri-dark rounded-lg text-lg font-semibold hover:bg-agri-light transition">
              Browse Equipment
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-agri-dark to-agri-green text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <HelloFarmersLogo size={32} />
                <span className="text-xl font-bold">HelloFarmers</span>
              </div>
              <p className="text-gray-400">
                Connecting farmers and equipment owners
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            {/* <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div> */}
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>
              &copy; 2026 AgriRent. All rights reserved. Made by Keyboard
              Smashers with ❤️.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
