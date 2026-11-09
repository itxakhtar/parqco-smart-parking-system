import { useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api/client.js';
import './ChatAssistant.css';

// If your backend route differs, change this one line.
const CHAT_ENDPOINT = '/assistant/chat';

// How many previous messages are sent so the assistant understands follow-ups.
const HISTORY_LIMIT = 6;

const SUGGESTIONS = [
  'Which slot should I park?',
  'Where is my vehicle?',
  'How much per hour?',
  'Is my payment paid?',
];

export default function ChatAssistant({ userName = '' }) {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hi${userName ? ` ${userName}` : ''}! How can I help you today?` },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, busy]);

  async function send(text) {
    const question = text.trim();
    if (!question || busy) return;

    // Take the history BEFORE adding the new question (the backend gets the question separately).
    const history = messages
      .slice(-HISTORY_LIMIT)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text }));

    setMessages((list) => [...list, { role: 'user', text: question }]);
    setInput('');
    setBusy(true);

    try {
      const { data } = await api.post(CHAT_ENDPOINT, { question, history });
      const reply = data.answer || data.reply || data.message || 'I could not find an answer.';
      setMessages((list) => [...list, { role: 'bot', text: reply }]);
    } catch (err) {
      const reason = err.response?.data?.message || err.message;
      setMessages((list) => [...list, { role: 'bot', text: `Sorry, I could not answer that. ${reason}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat">
      {open && (
        <section className="chat__panel" aria-label="Parking Assistant">
          <header className="chat__head">
            <div className="chat__brand">
              <span className="chat__logo">P</span>
              Parking Assistant
            </div>
            <button type="button" className="chat__close" onClick={() => setOpen(false)} aria-label="Close assistant">
              &times;
            </button>
          </header>

          <div className="chat__body">
            {messages.map((m, i) => (
              <div key={i} className={`chat__msg chat__msg--${m.role}`}>
                {m.role === 'user' ? m.text : <ReactMarkdown>{m.text}</ReactMarkdown>}
              </div>
            ))}
            {busy && <p className="chat__hint">Checking the lot...</p>}
            <div ref={endRef} />
          </div>

          {messages.length === 1 && (
            <div className="chat__chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chat__chip" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="chat__form">
            <input
              className="chat__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder="Ask about slots, prices, or your vehicle..."
            />
            <button type="button" className="chat__send" disabled={busy || !input.trim()} onClick={() => send(input)}>
              Send
            </button>
          </div>
        </section>
      )}

      <button
        type="button"
        className="chat__fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Hide assistant' : 'Open assistant'}
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
}