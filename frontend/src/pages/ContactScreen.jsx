import React, { useState } from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const ContactScreen = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert('Thank you for your message! We will get back to you shortly.');
      e.target.reset();
    }, 1500);
  };

  return (
    // 👇 FIX: Main Background & Text Variable
    <div className="bg-[var(--bg-grad-1)] text-[var(--text-main)] min-h-screen p-4 sm:p-8">
      {/* 👇 FIX: Card Background & Border */}
      <div className="max-w-6xl mx-auto bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-lg overflow-hidden md:grid md:grid-cols-2">
        
        {/* Left Column: Contact Info & Map */}
        {/* 👇 FIX: Sidebar Background (using bg-grad-2 for contrast) */}
        <div className="p-8 sm:p-12 bg-[var(--bg-grad-2)]">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          {/* 👇 FIX: Muted Text Variable */}
          <p className="text-[var(--text-muted)] mb-8">
            We'd love to hear from you. Whether you have a question about our products, pricing, or anything else, our team is ready to answer all your questions.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <FaMapMarkerAlt className="text-primary-500 text-2xl" />
              <span className="text-[var(--text-main)]">123 Fashion Ave, Coimbatore, TN, India</span>
            </div>
            <div className="flex items-center gap-4">
              <FaEnvelope className="text-primary-500 text-2xl" />
              <span className="text-[var(--text-main)]">support@fitforge.com</span>
            </div>
            <div className="flex items-center gap-4">
              <FaPhone className="text-primary-500 text-2xl" />
              <span className="text-[var(--text-main)]">(+91) 987 654 3210</span>
            </div>
          </div>
          
          <div className="mt-12 flex space-x-6">
            <a href="#" className="text-[var(--text-muted)] hover:text-primary-500 transition-colors text-2xl"><FaFacebook /></a>
            <a href="#" className="text-[var(--text-muted)] hover:text-primary-500 transition-colors text-2xl"><FaTwitter /></a>
            <a href="#" className="text-[var(--text-muted)] hover:text-primary-500 transition-colors text-2xl"><FaInstagram /></a>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="p-8 sm:p-12">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--text-muted)] mb-2">Your Name</label>
              <input 
                type="text" 
                id="name"
                placeholder="John Doe" 
                required 
                // 👇 FIX: Input Background, Text, & Border
                className="w-full p-3 bg-[var(--input-bg)] text-[var(--text-main)] rounded-lg border border-[var(--input-border)] focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition placeholder-[var(--text-muted)]" 
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-muted)] mb-2">Your Email</label>
              <input 
                type="email" 
                id="email"
                placeholder="you@example.com" 
                required 
                // 👇 FIX: Input Background, Text, & Border
                className="w-full p-3 bg-[var(--input-bg)] text-[var(--text-main)] rounded-lg border border-[var(--input-border)] focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition placeholder-[var(--text-muted)]" 
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[var(--text-muted)] mb-2">Your Message</label>
              <textarea 
                id="message"
                placeholder="Let us know how we can help..." 
                required 
                rows="5"
                // 👇 FIX: Input Background, Text, & Border
                className="w-full p-3 bg-[var(--input-bg)] text-[var(--text-main)] rounded-lg border border-[var(--input-border)] focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition placeholder-[var(--text-muted)]"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="py-3 px-6 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-800 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ContactScreen;