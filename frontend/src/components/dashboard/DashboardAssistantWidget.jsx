import { useState } from "react";
import DashboardChatbot from "./DashboardChatbot";

const BloodDropIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
    <path d="M12 2.5c-1.1 1.8-2.5 3.5-3.7 5.2C6.1 11 5 12.8 5 15a7 7 0 0 0 14 0c0-2.2-1.1-4-3.3-7.3C14.5 6 13.1 4.3 12 2.5Zm0 18.1A5.6 5.6 0 0 1 6.4 15c0-1.7.9-3.2 3-6.1 1-1.4 2-2.8 2.6-3.8.6 1 1.6 2.4 2.6 3.8 2.1 2.9 3 4.4 3 6.1A5.6 5.6 0 0 1 12 20.6Z" />
  </svg>
);

const DashboardAssistantWidget = ({ className = "" }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`fixed bottom-5 left-5 z-50 ${className}`}>
      {open && (
        <div className="absolute bottom-16 left-0 w-[min(380px,calc(100vw-2rem))]">
          <DashboardChatbot />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close blood assistant" : "Open blood assistant"}
        className="group flex h-14 w-14 items-center justify-center rounded-full border border-rose-200 bg-rose-600 text-white shadow-[0_18px_40px_-18px_rgba(190,18,60,0.65)] transition hover:scale-105 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
      >
        <BloodDropIcon />
        <span className="sr-only">Blood assistant</span>
      </button>
    </div>
  );
};

export default DashboardAssistantWidget;
