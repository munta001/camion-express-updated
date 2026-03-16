import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/23058519491?text=Hello%2C%20I%20would%20like%20to%20enquire%20about%20your%20lorry%20services."
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
    aria-label="Chat on WhatsApp"
  >
    <FaWhatsapp className="h-6 w-6" />
  </a>
);

export default WhatsAppButton;
