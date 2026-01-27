// ============================================================
// IMPORTS
// ============================================================
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaClock,
  FaBullhorn,
} from "react-icons/fa";
import { useLanguage } from "../context/useLanguage";

// ============================================================
// CONTENT DATA - Translations for English and Nepali
// ============================================================
const footerContent = {
  en: {
    tagline: "Digital public services that elevate citizen voices and strengthen national civic pride.",
    resources: "Resources",
    resourcesList: ["Privacy Policy", "Terms of Service", "Help Center"],
    contact: "Contact",
    email: "support@nagarsewa.org",
    phone: "+977-1-5970000",
    address: "Kathmandu, Nepal",
    hours: "Sun–Fri: 10:00 AM – 6:00 PM",
    citizenVoice: "Citizen Voice Desk",
    citizenVoiceDesc:
      "A direct channel for local communities to reach municipal authorities with verified reports.",
    copyright: "© 2026 NagarSewa. All rights reserved.",
  },
  np: {
    tagline: "नागरिकको आवाजलाई माथि उठाउँदै राष्ट्रिय गौरव जोड्ने डिजिटल सार्वजनिक सेवाहरू।",
    resources: "संसाधनहरू",
    resourcesList: ["गोपनीयता नीति", "सेवा सर्तहरू", "सहायता केन्द्र"],
    contact: "संपर्क",
    email: "support@nagarsewa.org",
    phone: "+977-1-5970000",
    address: "काठमाडौँ, नेपाल",
    hours: "आइत–शुक्र: १०:०० बिहान – ६:०० बेलुका",
    citizenVoice: "नागरिक आवाज डेस्क",
    citizenVoiceDesc:
      "स्थानीय समुदायका प्रमाणित रिपोर्टलाई नगरपालिका निकायसम्म पुर्‍याउने प्रत्यक्ष माध्यम।",
    copyright: "© 2026 नगरसेवा। सर्वाधिकार सुरक्षित।",
  },
};

// ============================================================
// FOOTER COMPONENT
// ============================================================

/**
 * Footer Component
 * Displays the page footer with company info, resources links,
 * contact information, and the Citizen Voice Desk section.
 * Supports English and Nepali languages.
 * 
 * @returns {JSX.Element} The footer component
 */
export default function Footer() {
  // ============================================================
  // STATE AND CONTEXT
  // ============================================================
  
  // Get language context without destructuring for clarity
  const languageContext = useLanguage();
  const language = languageContext.language;
  
  // Get content based on current language
  const content = footerContent[language];

  // ============================================================
  // HELPER FUNCTIONS FOR RENDERING
  // ============================================================

  /**
   * Renders the list of resource links
   * Uses a for loop instead of .map() for beginner clarity
   * 
   * @returns {JSX.Element[]} Array of resource list item elements
   */
  function renderResourcesList() {
    const resourceItems = [];
    const resourcesList = content.resourcesList;
    
    for (let i = 0; i < resourcesList.length; i++) {
      const item = resourcesList[i];
      const listItem = (
        <li key={i} className="hover:text-emerald-200 transition-colors">
          {item}
        </li>
      );
      resourceItems.push(listItem);
    }
    
    return resourceItems;
  }

  // ============================================================
  // COMPONENT RENDER
  // ============================================================
  
  return (
    <footer id="contact" className="bg-slate-950 text-gray-300 w-full">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {/* Brand Section */}
        <div>
          <h4 className="font-semibold text-white mb-2">NagarSewa</h4>
          <p className="text-sm text-gray-300">
            {content.tagline}
          </p>
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-emerald-200 font-semibold">
              <FaBullhorn />
              {content.citizenVoice}
            </div>
            <p className="text-xs text-emerald-100/80 mt-2">
              {content.citizenVoiceDesc}
            </p>
          </div>
        </div>
        
        {/* Resources Section */}
        <div>
          <h4 className="font-semibold text-white mb-2">{content.resources}</h4>
          <ul className="text-sm space-y-2">
            {renderResourcesList()}
          </ul>
        </div>
        
        {/* Contact Section */}
        <div>
          <h4 className="font-semibold text-white mb-2">{content.contact}</h4>
          <ul className="text-sm space-y-3">
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-emerald-200" />
              {content.email}
            </li>
            <li className="flex items-center gap-2">
              <FaPhoneAlt className="text-emerald-200" />
              {content.phone}
            </li>
            <li className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-emerald-200" />
              {content.address}
            </li>
            <li className="flex items-center gap-2">
              <FaClock className="text-emerald-200" />
              {content.hours}
            </li>
          </ul>
        </div>
      </div>
      
      {/* Copyright Section */}
      <div className="text-center text-xs border-t border-white/10 py-4">
        {content.copyright}
      </div>
    </footer>
  );
}
