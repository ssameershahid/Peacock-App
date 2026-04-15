import React from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, Instagram, Twitter, Linkedin, MapPin, Mail, Phone } from 'lucide-react';
import { Container } from '@/components/peacock/Container';

const Footer = () => {
  return (
    <footer className="relative bg-black text-white overflow-hidden min-h-[90vh] flex flex-row flex-wrap justify-center">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60">
          <source src="/videos/footer.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%221%22/%3E%3C/svg%3E")' }} />
      </div>

      <Container className="relative z-10 pt-32 pb-12">
        {/* Top Section: Brand Statement & CTA */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-[84px] gap-12 border-t border-white/0 pt-[60px]">
          <div className="max-w-[800px] overflow-visible">
            <h2 className="font-display text-6xl md:text-[64px] lg:text-[96px] leading-[0.85] font-normal text-white mb-8 tracking-tighter overflow-visible h-[180px]">
              Witness Sri Lanka's <br />
              art of{" "}
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#E8A825] via-[#E6B772] to-[#E8A825] pr-2 inline-block h-[100px]">hospitality</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/70 font-light max-w-lg leading-relaxed font-sans border-l-2 border-[#E8A825]/30 pl-6">
              Curating exceptional journeys through the heart of Sri Lanka.
              Where luxury meets the untamed wilderness.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <Link href="/tours/custom">
              <button className="group relative px-10 py-5 bg-transparent overflow-hidden rounded-full border border-white/20 hover:border-[#E8A825]/60 transition-all duration-500">
                <div className="absolute inset-0 w-full h-full bg-white/5 group-hover:bg-[#E8A825]/10 transition-colors duration-500" />
                <span className="relative flex items-center gap-4 font-serif text-2xl text-white group-hover:text-[#E8A825] transition-colors">
                  Start Your Journey <ArrowUpRight className="h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </button>
            </Link>
          </div>
        </div>

        {/* Middle Section: Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 border-t border-b border-white/10 py-[30px] mb-12 relative bg-black/20 backdrop-blur-sm px-6 rounded-2xl border-x border-white/5">
          <div className="hidden md:block absolute top-8 bottom-8 left-1/4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="hidden md:block absolute top-8 bottom-8 left-2/4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="hidden md:block absolute top-8 bottom-8 left-3/4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          {/* Discover */}
          <div className="space-y-8 flex flex-col items-center text-center md:items-start md:text-left">
            <h4 className="text-xs font-medium uppercase tracking-[0.25em] text-[#E8A825]">Discover</h4>
            <ul className="space-y-4">
              <li><Link href="/tours" className="text-sm font-light text-white/70 hover:text-white transition-all hover:tracking-wide duration-300 block">Ready-to-Go Tours</Link></li>
              <li><Link href="/tours/custom" className="text-sm font-light text-white/70 hover:text-white transition-all hover:tracking-wide duration-300 block">Trip Wizard</Link></li>
              <li><Link href="/transfers" className="text-sm font-light text-white/70 hover:text-white transition-all hover:tracking-wide duration-300 block">Luxury Transfers</Link></li>
              <li><Link href="/tours" className="text-sm font-light text-white/70 hover:text-white transition-all hover:tracking-wide duration-300 block">Destinations</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-8 flex flex-col items-center text-center md:items-start md:text-left">
            <h4 className="text-xs font-medium uppercase tracking-[0.25em] text-[#E8A825]">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-sm font-light text-white/70 hover:text-white transition-all hover:tracking-wide duration-300 block">Our Story</Link></li>
              <li><Link href="/reviews" className="text-sm font-light text-white/70 hover:text-white transition-all hover:tracking-wide duration-300 block">Guest Reviews</Link></li>
              <li><Link href="/blog" className="text-sm font-light text-white/70 hover:text-white transition-all hover:tracking-wide duration-300 block">Field Notes</Link></li>
              <li><Link href="/contact" className="text-sm font-light text-white/70 hover:text-white transition-all hover:tracking-wide duration-300 block">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-8 flex flex-col items-center text-center md:items-start md:text-left">
            <h4 className="text-xs font-medium uppercase tracking-[0.25em] text-[#E8A825]">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-sm font-light text-white/70 hover:text-white transition-all hover:tracking-wide duration-300 block">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm font-light text-white/70 hover:text-white transition-all hover:tracking-wide duration-300 block">Terms of Service</Link></li>
              <li><Link href="/cancellation-policy" className="text-sm font-light text-white/70 hover:text-white transition-all hover:tracking-wide duration-300 block">Cancellation Policy</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-8 flex flex-col items-center text-center md:items-start md:text-left">
            <h4 className="text-xs font-medium uppercase tracking-[0.25em] text-[#E8A825]">Connect</h4>
            <div className="space-y-4 text-sm font-light text-white/70">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <MapPin className="h-4 w-4 text-[#E8A825]" />
                <span>Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Phone className="h-4 w-4 text-[#E8A825]" />
                <span>+94 77 123 4567</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Mail className="h-4 w-4 text-[#E8A825]" />
                <span>hello@peacock.lk</span>
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <a href="#" className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-[#E8A825] hover:border-[#E8A825] hover:bg-[#E8A825]/10 transition-all duration-300">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-[#E8A825] hover:border-[#E8A825] hover:bg-[#E8A825]/10 transition-all duration-300">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-[#E8A825] hover:border-[#E8A825] hover:bg-[#E8A825]/10 transition-all duration-300">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-white/30 uppercase tracking-[0.15em] font-medium font-sans">
          <div>© {new Date().getFullYear()} Peacock Drivers. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Designed for Sri Lanka</span>
            <div className="h-1 w-1 rounded-full bg-[#E8A825]" />
            <a href="https://www.artyreal.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">Designed by Artyreal</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
