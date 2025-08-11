import React, { useEffect, useRef, useState } from 'react';

type Message = { role: 'user' | 'assistant' | 'system'; content: string };
type Props = { onGenerateImage?: (userText: string) => void };

export function ChatPanel({ onGenerateImage }: Props): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'You are a friendly story guide for kids. Be conversational and helpful.' },
    { role: 'assistant', content: "What happens next in Captain Asher's adventure? Type a short line and press Enter." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(): Promise<void> {
    if (!input.trim() || loading) return;
    const newMessages = [...messages, { role: 'user', content: input.trim() } as Message];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply ?? 'Sorry, no response.' }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: 'There was an error contacting the AI.' }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr auto', color: '#111827' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
        <div>
          <div style={{ fontWeight: 700 }}>Chat</div>
              <div style={{ color: '#6B7280', fontSize: 12 }}>Describe the next moment in the story.</div>
        </div>
      </div>

      <div style={{ overflowY: 'auto', padding: '16px' }}>
        {messages.filter(m => m.role !== 'system').map((m, idx) => (
          <div key={idx} style={{
            background: m.role === 'assistant' ? '#F3F4F6' : '#EEF2FF',
            padding: 12,
            borderRadius: 12,
            margin: '12px 0',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ color: '#6B7280', fontSize: 12, marginBottom: 4 }}>{m.role}</div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{m.content}</div>
          </div>
        ))}
        <div ref={listEndRef} />
      </div>

      <div style={{ padding: 16, borderTop: '1px solid #E5E7EB', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={loading ? 'Thinking…' : 'Type your message and press Enter'}
            rows={3}
            style={{ flex: 1, resize: 'none', background: '#FFFFFF', color: '#111827', borderRadius: 12, border: '1px solid #E5E7EB', padding: 12 }}
          />
          <button onClick={() => void send()} disabled={loading} style={{
            padding: '0 16px',
            borderRadius: 12,
            background: '#4F46E5',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
            height: 44
          }}>Send</button>
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              const lastUser = [...messages].reverse().find(m => m.role === 'user');
              const text = lastUser?.content?.trim();
              if (text) onGenerateImage?.(text);
            }}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: '#059669',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >Create Image</button>
        </div>
      </div>
    </div>
  );
}


