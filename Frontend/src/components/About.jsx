import { useLanguage } from "../context/useLanguage";

const aboutContent = {
  en: {
    title: "About NagarSewa",
    desc: "NagarSewa is a digital public service platform that connects citizens with local authorities to report issues, request services, and stay informed through a secure citizen account.",
  },
  np: {
    title: "नगरसेवा बारेमा",
    desc: "नगरसेवा डिजिटल सार्वजनिक सेवा प्लेटफर्म हो जसले नागरिकलाई स्थानीय निकायसँग जोडेर समस्या रिपोर्ट गर्न, सेवा अनुरोध गर्न, र सुरक्षित नागरिक खातामार्फत अपडेटहरू प्राप्त गर्न सक्षम बनाउँछ।",
  },
};

export default function About() {
  const { language } = useLanguage();
  const content = aboutContent[language];

  return (
    <section id="about" className="bg-gray-100 py-20">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h3 className="text-3xl font-bold mb-6">{content.title}</h3>
        <p className="text-gray-700 leading-relaxed">
          {content.desc}
        </p>
      </div>
    </section>
  );
}
