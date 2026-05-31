import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { assistantService } from "../../services/chatService";

const defaultPrompts = [
  "Which blood groups are compatible with O-?",
  "Show blood supplied for A+ last month.",
  "What is the total blood supplied in the last month?",
];

const welcomeMessage = {
  role: "assistant",
  content:
    "Hi, I can help with blood compatibility, monthly supply totals, and quick operational questions. Ask me about a blood group or a time period and I’ll answer from dashboard data.",
};

const DashboardChatbot = ({
  title = "Operations Assistant",
  description = "Ask for blood similarity, supply totals, or inventory insights.",
  prompts = defaultPrompts,
}) => {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const appendMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const sendMessage = async (text) => {
    const trimmedText = text.trim();
    if (!trimmedText || sending) return;

    const userMessage = { role: "user", content: trimmedText };
    const history = messages.slice(-8).map((entry) => ({
      role: entry.role,
      content: entry.content,
    }));

    appendMessage(userMessage);
    setInput("");

    try {
      setSending(true);
      const result = await assistantService.chat({
        message: trimmedText,
        history,
      });

      appendMessage({
        role: "assistant",
        content: result.reply,
      });
    } catch (error) {
      const message = error?.response?.data?.message || "The assistant is unavailable right now.";
      toast.error(message);
      appendMessage({
        role: "assistant",
        content: message,
      });
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <section className="xl:sticky xl:top-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Chatbot</p>
            <h3 className="mt-2 text-xl font-extrabold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
            Ollama Cloud
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendMessage(prompt)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="max-h-[520px] space-y-4 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === "user"
                      ? "bg-rose-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                  Thinking with Ollama...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about blood similarity or supply totals..."
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default DashboardChatbot;
