import { useLanguage } from "../context/useLanguage";

const highlightsContent = {
  en: {
    title: "Highlighted Community Issues",
    issues: [
      {
        icon: "🚧",
        title: "Road Damage",
        desc: "Multiple potholes reported causing traffic congestion and accidents.",
        priority: "High Priority",
      },
      {
        icon: "💡",
        title: "Street Light Failure",
        desc: "Non-functional street lights increasing safety concerns at night.",
        priority: "Medium Priority",
      },
      {
        icon: "🗑️",
        title: "Waste Management",
        desc: "Irregular garbage collection reported by residents.",
        priority: "Under Review",
      },
    ],
  },
  np: {
    title: "समुदायका हाइलाइट गरिएका समस्याहरू",
    issues: [
      {
        icon: "🚧",
        title: "सडक क्षति",
        desc: "यातायातको भीड र दुर्घटना गराउने गडढाहरू रिपोर्ट गरिएका छन्।",
        priority: "उच्च प्राथमिकता",
      },
      {
        icon: "💡",
        title: "सडक बत्ती विफल",
        desc: "राता को समय सुरक्षा चिन्ता बढाउँने गैर-कार्यात्मक सडक बत्तीहरू।",
        priority: "मध्यम प्राथमिकता",
      },
      {
        icon: "🗑️",
        title: "फोहोर व्यवस्थापन",
        desc: "निवासीहरूद्वारा अनियमित फोहोर सङ्कलन रिपोर्ट गरिएको।",
        priority: "समीक्षाधीन",
      },
    ],
  },
};

export default function Highlights() {
  const { language } = useLanguage();
  const content = highlightsContent[language];

  return (
    <section id="issues" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-3xl font-bold text-center mb-12">
          {content.title}
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {content.issues.map((issue, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow">
              <h4 className="font-semibold text-lg mb-2">{issue.icon} {issue.title}</h4>
              <p className="text-sm text-gray-600">
                {issue.desc}
              </p>
              <span className={`text-xs font-medium ${
                issue.priority === "High Priority" || issue.priority === "उच्च प्राथमिकता"
                  ? "text-red-500"
                  : issue.priority === "Medium Priority" || issue.priority === "मध्यम प्राथमिकता"
                  ? "text-yellow-500"
                  : "text-green-600"
              }`}>
                {issue.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
