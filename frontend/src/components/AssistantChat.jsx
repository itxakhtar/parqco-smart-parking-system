import { useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api/client.js';
import './ChatAssistant.css';

// If your backend routes differ, change these two lines.
const STREAM_ENDPOINT = '/assistant/chat/stream';
const CHAT_ENDPOINT = '/assistant/chat';

// How many previous messages are sent so the assistant understands follow-ups.
const HISTORY_LIMIT = 8;

const DEFAULT_SUGGESTIONS = ['Which slots are free?', 'Which slot is best?', 'Where is my vehicle?', 'How do I book?'];

export default function ChatAssistant({ userName = '' }) {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hi${userName ? ` ${userName}` : ''}! How can I help you today?` },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, busy]);

  // Typing dots only until the first words arrive
  const waiting = busy && messages[messages.length - 1]?.role === 'user';

  async function send(text) {
    const question = text.trim();
    if (!question || busy) return;

    // Take the history BEFORE adding the new question (the backend gets the question separately).
    const history = messages
      .slice(-HISTORY_LIMIT)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text }));

    setMessages((list) => [...list, { role: 'user', text: question }]);
    setInput('');
    setSuggestions([]);
    setBusy(true);

    let answer = '';
    let started = false; // has the bot message been added yet?
    let done = null;
    let handled = 0; // characters of the stream already processed

    // First call adds the bot message, later calls update it
    const show = (value) => {
      if (!started) {
        started = true;
        setMessages((list) => [...list, { role: 'bot', text: value }]);
      } else {
        setMessages((list) => [...list.slice(0, -1), { role: 'bot', text: value }]);
      }
    };

    try {
      await api.post(
        STREAM_ENDPOINT,
        { question, history },
        {
          responseType: 'text',
          transformResponse: [(raw) => raw], // keep the raw text, do not parse it as JSON
          onDownloadProgress: (event) => {
            const full = event?.event?.target?.responseText ?? event?.target?.responseText ?? '';
            const fresh = full.slice(handled);
            const end = fresh.lastIndexOf('\n');
            if (end < 0) return; // wait for a complete line
            handled += end + 1;

            for (const line of fresh.slice(0, end).split('\n')) {
              if (!line.trim()) continue;
              let part;
              try {
                part = JSON.parse(line);
              } catch {
                continue;
              }
              if (part.type === 'delta') {
                answer += part.text;
                show(answer);
              } else if (part.type === 'done') {
                done = part;
              }
            }
          },
        }
      );

      if (!answer) throw new Error('Empty stream');
      setSuggestions(Array.isArray(done?.suggestions) ? done.suggestions.slice(0, 3) : []);
    } catch (err) {
      if (!answer) {
        // Streaming did not work: use the normal request instead
        try {
          const { data } = await api.post(CHAT_ENDPOINT, { question, history });
          show(data.answer || data.reply || data.message || 'I could not find an answer.');
          setSuggestions(Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : []);
        } catch (err2) {
          const reason = err2.response?.data?.message || err2.message;
          show(`Sorry, I could not answer that. ${reason}`);
          setSuggestions(DEFAULT_SUGGESTIONS.slice(0, 3));
        }
      }
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
              <div className="chat__brand-text">
                <span>Parking Assistant</span>
                <span className="chat__status">Online</span>
              </div>
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
            {waiting && (
              <div className="chat__hint" aria-label="Assistant is typing">
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={endRef} />
          </div>

          {!busy && suggestions.length > 0 && (
            <div className="chat__chips">
              {suggestions.map((s) => (
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