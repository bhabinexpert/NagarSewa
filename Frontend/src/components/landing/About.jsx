import { FaFlag, FaUsers, FaLandmark, FaShieldAlt } from "react-icons/fa";
import { useLanguage } from "../../contexts/language/useLanguage";


// CONTENT DATA - Translations for English and Nepali

const aboutContent = {
  en: {
    title: "About NagarSewa",
    lead: "NagarSewa is a national civic platform that amplifies citizen voices and connects them directly with local authorities for swift action.",
    body: "Built for Nepal’s municipalities, NagarSewa helps residents report community problems, request services, and follow official updates with transparency and accountability. Every report becomes a verified civic signal—bridging the gap between people and public offices.",
    pillars: [
      {
        title: "Citizen Voice",
        desc: "Give every ward a reliable channel to speak up and be heard.",
        icon: FaUsers,
      },
      {
        title: "National Service",
        desc: "Strengthen civic responsibility and pride across Nepal’s communities.",
        icon: FaFlag,
      },
      {
        title: "Local Authority Link",
        desc: "Route reports and requests directly to responsible offices.",
        icon: FaLandmark,
      },
      {
        title: "Transparent Action",
        desc: "Track progress and ensure issues are resolved with integrity.",
        icon: FaShieldAlt,
      },
    ],
  },
  np: {
    title: "नगरसेवा बारेमा",
    lead: "नगरसेवा राष्ट्रिय नागरिक प्लेटफर्म हो जसले नागरिकको आवाजलाई सशक्त बनाउँदै स्थानीय निकायसँग प्रत्यक्ष जोड्छ।",
    body: "नेपालका नगरपालिकाका लागि निर्माण गरिएको नगरसेवाले समुदायका समस्या रिपोर्ट गर्न, सेवा अनुरोध गर्न र आधिकारिक अपडेटहरू पारदर्शितासहित पाउन सहयोग गर्छ। प्रत्येक रिपोर्ट जिम्मेवार निकायमा पुग्ने विश्वासिलो नागरिक सन्देश हो।",
    pillars: [
      {
        title: "नागरिकको आवाज",
        desc: "हरेक वडाको आवाज सुन्ने भरपर्दो माध्यम।",
        icon: FaUsers,
      },
      {
        title: "राष्ट्रिय सेवा",
        desc: "नेपालभर नागरिक जिम्मेवारी र गौरव सुदृढ गर्नुहोस्।",
        icon: FaFlag,
      },
      {
        title: "स्थानीय निकायसँग जोड",
        desc: "समस्या र अनुरोध जिम्मेवार कार्यालयमै पुर्‍याउनुहोस्।",
        icon: FaLandmark,
      },
      {
        title: "पारदर्शी कार्यान्वयन",
        desc: "समस्या समाधानको प्रगति ट्र्याक गर्दै विश्वास बढाउनुहोस्।",
        icon: FaShieldAlt,
      },
    ],
  },
};


// ABOUT COMPONENT


/**
 * About Component
 * Displays the about section with information about NagarSewa
 * and the four core pillars of the platform.
 * Supports English and Nepali languages.
 * 
 * @returns {JSX.Element} The about section component
 */
export default function About() {
 
  // STATE AND CONTEXT

  
  // Get language context without destructuring for clarity
  const languageContext = useLanguage();
  const language = languageContext.language;
  
  // Get content based on current language
  const content = aboutContent[language];

  // RENDERING HELPERS
    function renderPillarCards() {
    return content.pillars.map(function(pillar) {
      const PillarIcon = pillar.icon;
      return (
        <div
          key={pillar.title}
          className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 card-hover"
        >
          <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 text-xl">
            <PillarIcon />
          </div>
          <h4 className="font-semibold text-lg mb-2 text-emerald-900">{pillar.title}</h4>
          <p className="text-sm text-gray-600">{pillar.desc}</p>
        </div>
      );
    });
  }

 
  // COMPONENT RENDER
 
  
  return (
    <section id="about" className="bg-emerald-50/50 py-20 w-full">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h3 className="text-3xl font-bold mb-4 text-emerald-900">{content.title}</h3>
          <p className="text-emerald-700 font-semibold">{content.lead}</p>
          <p className="text-gray-600 leading-relaxed mt-4">
            {content.body}
          </p>
        </div>
        
        {/* Pillars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderPillarCards()}
        </div>
      </div>
    </section>
  );
}
