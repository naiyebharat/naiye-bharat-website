"use client";

function LogoSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#1a1a1a" stroke="#d4af37" strokeWidth="2" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="3,2" />
      <rect x="47" y="25" width="6" height="45" fill="#d4af37" />
      <rect x="40" y="65" width="20" height="8" rx="4" fill="#d4af37" />
      <rect x="44" y="20" width="12" height="6" rx="3" fill="#d4af37" />
      <rect x="30" y="35" width="40" height="3" fill="#d4af37" />
      <circle cx="38" cy="40" r="2" fill="#d4af37" />
      <line x1="38" y1="42" x2="38" y2="55" stroke="#d4af37" strokeWidth="1" />
      <line x1="38" y1="42" x2="32" y2="48" stroke="#d4af37" strokeWidth="1" />
      <line x1="38" y1="42" x2="44" y2="48" stroke="#d4af37" strokeWidth="1" />
      <path d="M 30 48 Q 38 55 46 48 L 46 52 Q 38 59 30 52 Z" fill="#d4af37" />
      <circle cx="62" cy="40" r="2" fill="#d4af37" />
      <line x1="62" y1="42" x2="62" y2="55" stroke="#d4af37" strokeWidth="1" />
      <line x1="62" y1="42" x2="56" y2="48" stroke="#d4af37" strokeWidth="1" />
      <line x1="62" y1="42" x2="68" y2="48" stroke="#d4af37" strokeWidth="1" />
      <path d="M 54 48 Q 62 55 70 48 L 70 52 Q 62 59 54 52 Z" fill="#d4af37" />
    </svg>
  );
}

const quickLinks = [
  { href: "#home",     label: "Home" },
  { href: "#about",    label: "About Us" },
  { href: "#services", label: "Services" },
  { href: "#Contact",  label: "Contact" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/naiyebharat?igsh=MXBhZ2FiOGUwcHp5aw==",
    icon: "fab fa-instagram",
    label: "Instagram",
    hoverClass: "hover:bg-gray-700",
  },
  {
    href: "",
    icon: "fab fa-linkedin-in",
    label: "LinkedIn",
    hoverClass: "hover:bg-gray-700",
  },
  {
    href: "https://youtube.com/@naiyebharat?si=H0rfBIn6X6KHed-o",
    icon: "fab fa-youtube",
    label: "YouTube",
    hoverClass: "hover:bg-gray-700",
  },
  {
    href: "https://wa.me/918512005097",
    icon: "fab fa-whatsapp",
    label: "WhatsApp",
    hoverClass: "hover:bg-green-600",
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10"><LogoSVG /></div>
              <h3 className="text-2xl font-bold">NaiyeBharat</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Your trusted legal partner for over two decades, providing comprehensive legal
              solutions with integrity and expertise.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map(({ href, label }) => (
                <li key={label}>
                  <a href={href} className="text-gray-400 hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              {socialLinks.map(({ href, icon, label, hoverClass }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white ${hoverClass} transition-all`}
                >
                  <i className={icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-gray-400">
              <p>Chamber number-701, Saket District Court, New Delhi</p>
              <p>+91 85120 05097</p>
              <p>naiyebharat@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            &copy; 2026 NaiyeBharat. All rights reserved. | Designed with excellence for justice.
          </p>
        </div>
      </div>
    </footer>
  );
}