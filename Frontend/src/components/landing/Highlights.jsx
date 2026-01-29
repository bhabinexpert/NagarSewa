import { useLanguage } from "../../contexts/language/useLanguage";


// CONTENT DATA - Translations for English and Nepali

const highlightsContent = {
  en: {
    title: "Critical Local Issues Needing Immediate Action",
    subtitle: "Real issues reported by citizens across Nepal's municipalities.",
    issues: [
      {
        icon: "🚧",
        title: "Road Safety & Potholes",
        desc: "Severe potholes and broken pavements are causing accidents and traffic delays.",
        tag: "Immediate Action",
        color: "text-red-600",
      },
      {
        icon: "💡",
        title: "Street Light Outages",
        desc: "Dark streets are increasing risk for pedestrians and late-night commuters.",
        tag: "Urgent Fix",
        color: "text-orange-600",
      },
      {
        icon: "🗑️",
        title: "Solid Waste Backlog",
        desc: "Irregular garbage pickup and unmanaged dumpsites are impacting health.",
        tag: "Strict Enforcement",
        color: "text-red-600",
      },
      {
        icon: "💧",
        title: "Water & Drainage",
        desc: "Seasonal flooding and clogged drains are damaging homes and roads.",
        tag: "Immediate Action",
        color: "text-red-600",
      },
      {
        icon: "🌫️",
        title: "Air Quality",
        desc: "High pollution levels demand stricter monitoring and mitigation.",
        tag: "Strict Action",
        color: "text-orange-600",
      },
      {
        icon: "🚑",
        title: "Emergency Access",
        desc: "Blocked alleys and poor signage delay ambulances and fire services.",
        tag: "Critical",
        color: "text-red-600",
      },
    ],
  },
  np: {
    title: "तत्काल कार्य आवश्यक स्थानीय समस्याहरू",
    subtitle: "नेपालका नगरपालिकाहरूमा नागरिकहरूले रिपोर्ट गरेका वास्तविक समस्याहरू।",
    issues: [
      {
        icon: "🚧",
        title: "सडक सुरक्षा र गड्ढा",
        desc: "गम्भीर गड्ढा र भत्किएका फुटपाथले दुर्घटना र जाम बढाइरहेका छन्।",
        tag: "तत्काल कार्य",
        color: "text-red-600",
      },
      {
        icon: "💡",
        title: "सडक बत्ती बन्द",
        desc: "अँध्यारा सडकले पैदल यात्री र राति यात्रुमा जोखिम बढाउँछ।",
        tag: "छिटो मर्मत",
        color: "text-orange-600",
      },
      {
        icon: "🗑️",
        title: "फोहोर व्यवस्थापन",
        desc: "अनियमित फोहोर उठान र डम्पसाइट व्यवस्थापनले स्वास्थ्य जोखिम बढाउँछ।",
        tag: "कडा कार्यान्वयन",
        color: "text-red-600",
      },
      {
        icon: "💧",
        title: "पानी र ढल निकास",
        desc: "मौसमी डुबान र ढल जामले घर र सडकमा क्षति पुर्‍याउँछ।",
        tag: "तत्काल कार्य",
        color: "text-red-600",
      },
      {
        icon: "🌫️",
        title: "वायु गुणस्तर",
        desc: "धुलो र प्रदूषण नियन्त्रणका लागि कडा निगरानी आवश्यक छ।",
        tag: "कडा कदम",
        color: "text-orange-600",
      },
      {
        icon: "🚑",
        title: "आपत्कालीन पहुँच",
        desc: "अवरुद्ध गल्ली र कमजोर संकेतले एम्बुलेन्स सेवा ढिलो गराउँछ।",
        tag: "अत्यावश्यक",
        color: "text-red-600",
      },
    ],
  },
};


// HIGHLIGHTS COMPONENT


/**
 * Highlights Component
 * Displays a grid of critical local issues that need immediate action.
 * Each issue card shows an icon, title, description, and priority tag.
 * Supports English and Nepali languages.
 * 
 * @returns {JSX.Element} The highlights section component
 */
export default function Highlights() {
  
  // STATE AND CONTEXT
 
  
  // Get language context without destructuring for clarity
  const languageContext = useLanguage();
  const language = languageContext.language;
  
  // Get content based on current language
  const content = highlightsContent[language];

  
  // HELPER FUNCTIONS FOR RENDERING
  

  // Gets the CSS classes for the issue tag based on the color
   
  function getTagClasses(color) {
    if (color === "text-red-600") {
      return "bg-red-100 text-red-700";
    } else {
      return "bg-orange-100 text-orange-700";
    }
  }

  // Renders the issue cards
  
  function renderIssueCards() {
    return content.issues.map(function(issue, index) {
      // Get the appropriate classes for the tag
      const tagClasses = getTagClasses(issue.color);
      
      return (
        <div
          key={index}
          className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 card-hover"
        >
          <div className="text-3xl mb-3">{issue.icon}</div>
          <h4 className="font-semibold text-lg mb-2 text-emerald-900">{issue.title}</h4>
          <p className="text-sm text-gray-600 mb-3">
            {issue.desc}
          </p>
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${tagClasses}`}>
            {issue.tag}
          </span>
        </div>
      );
    });
  }

  
  // COMPONENT RENDER
 
  
  return (
    <section id="issues" className="bg-emerald-50/50 py-20 w-full">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <h3 className="text-3xl font-bold text-center mb-4 text-emerald-900">
          {content.title}
        </h3>
        <p className="text-center text-emerald-700/80 mb-12 max-w-2xl mx-auto">
          {content.subtitle}
        </p>
        
        {/* Issues Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderIssueCards()}
        </div>
      </div>
    </section>
  );
}
