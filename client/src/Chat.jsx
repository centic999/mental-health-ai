import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { supabase } from './supabaseClient';

const formatAiMessage = (text) => {
  const lines = text.split(/(\d+\.\s+)/).filter(Boolean);
  if (lines.length < 3) return text;
  const formatted = [];
  for (let i = 0; i < lines.length; i += 2) {
    const bullet = `${lines[i]}${lines[i + 1] || ''}`.trim();
    formatted.push(<li key={i}>{bullet}</li>);
  }
  return <ul style={{ paddingLeft: '1.5rem' }}>{formatted}</ul>;
};

// 1. Massive Crisis Phrase Library
const crisisKeywords = [
  'suicide', 'kill myself', 'want to die', 'self harm', 'self-harm',
  'cutting', 'cut myself', 'bleed', 'can’t go on', 'i give up',
  'end my life', 'overdose', 'jump off', 'end it all', 'depressed',
  'hopeless', 'no reason to live', 'i’m done', 'life is meaningless',
  'hang myself', 'drown myself', 'shoot myself', 'drink bleach',
  'thinking of dying', 'dark thoughts', 'hurting myself', 'pain won’t stop',
  'can’t handle it', 'nothing matters', 'wish i was dead', 'ending myself',
  'exit bag', 'gun to my head', 'pill bottle', 'want the pain to stop',
  'i’m broken', 'harming myself', 'ending it', 'give up on life'
];

const isCrisisMessage = (message) => {
  const lower = message.toLowerCase();
  return crisisKeywords.some(keyword => lower.includes(keyword));
};

function Chat({ chat, updateChat }) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [suppressWarning, setSuppressWarning] = useState(false);
  const chatEndRef = useRef(null);

  const saveChat = async (chatId, chatTitle, messagesArray) => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return;
    await supabase.from('chats').upsert({
      id: chatId,
      user_id: user.id,
      title: chatTitle,
      messages: messagesArray
    });
  };

  const handleSend = async () => {
    if (isTyping || !input.trim()) return;

    const newMessages = [...chat.messages, { role: 'user', content: input }];
    updateChat(chat.id, newMessages);
    setIsTyping(true);
    setInput('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user && !suppressWarning) {
        setShowGuestWarning(true);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            setShowGuestWarning(false);
            setFadeOut(false);
          }, 400);
        }, 4600);
      }

      // 2. CRISIS DETECTION
      if (isCrisisMessage(input)) {
        const warningMsg = `🚨 It sounds like you may be going through something serious. Please don’t go through this alone.

📞 **United States** – 988 (Suicide & Crisis Lifeline)  
📞 **United Kingdom** – 0800 689 5652 (Samaritans)  
📞 **Canada** – 1-833-456-4566  
📞 **India** – 91-9152987821 (iCall)

Please reach out to one of these numbers or talk to someone you trust. You're not alone. ❤️`;

        const crisisResponse = [...newMessages, { role: 'assistant', content: warningMsg }];
        updateChat(chat.id, crisisResponse);
        setIsTyping(false);
        return;
      }

      const res = await axios.post('https://mental-health-ai-wivn.onrender.com/chat', {
        messages: newMessages,
        user_id: user?.id || null
      });

      const reply = res.data?.response || "Sorry, I didn’t get that. Try again.";
      const updatedMessages = [...newMessages, { role: 'assistant', content: reply }];
      updateChat(chat.id, updatedMessages);

      if (user) await saveChat(chat.id, chat.title, updatedMessages);
    } catch (error) {
      console.error("AI error:", error);
      updateChat(chat.id, [...chat.messages, {
        role: "assistant", content: "Sorry, something went wrong."
      }]);
    }

    setIsTyping(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, isTyping]);

  return (
    <div className="chat-container-fade" style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showGuestWarning && (
        <div style={{
          position: 'absolute', top: 60, left: 'calc(50% - 200px)',
          width: '400px', background: '#ffcc00', padding: '1rem 1.5rem',
          color: '#000', borderRadius: '10px', fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)', zIndex: 9999,
          textAlign: 'center',
          animation: fadeOut ? 'fadeOut 0.4s ease-in' : 'fadeSlideIn 0.4s ease-out'
        }}>
          ⚠️ You are not logged in. Your chats won’t be saved.<br />
          <label style={{ marginTop: '0.5rem', display: 'block', fontWeight: 'normal' }}>
            <input
              type="checkbox"
              onChange={(e) => setSuppressWarning(e.target.checked)}
            /> Don’t show this again
          </label>
        </div>
      )}

      <style>
        {`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
          }
        `}
      </style>

      {/* Title */}
      <div style={{
        position: 'sticky', top: 0, background: '#1e1e1e',
        padding: '1rem 2rem', borderBottom: '1px solid #333',
        textAlign: 'center', zIndex: 10
      }}>
        <h1 style={{
          fontSize: '1.5rem', margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {chat.title}
        </h1>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2rem', marginBottom: '1rem' }}>
        {chat.messages.map((msg, i) => (
          <div key={i} style={{ width: '100%' }}>
            <div style={{
              width: '100%', background: msg.role === 'user' ? '#2c2c2c' : '#1e3d2f',
              borderRadius: '16px', padding: '1.25rem', margin: '1.25rem 0',
              boxSizing: 'border-box', color: msg.role === 'assistant' ? '#caffd4' : '#e0e0e0',
              fontSize: '1.1rem', lineHeight: 1.7, whiteSpace: 'pre-wrap',
              boxShadow: msg.role === 'assistant' ? '0 0 12px #1e3d2f' : '0 0 6px #222',
              animation: 'fadeInUp 0.4s ease-in-out'
            }}>
              <strong style={{ color: msg.role === 'user' ? '#73b1ff' : '#72ffaf' }}>
                {msg.role === 'user' ? 'You' : 'SafeCoach'}:
              </strong>
              <div style={{ marginTop: '0.5rem' }}>
                {msg.role === 'assistant' ? formatAiMessage(msg.content) : msg.content}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{
            marginTop: '1.25rem', marginBottom: '1rem', padding: '1.25rem',
            background: '#1e3d2f', borderRadius: '16px',
            fontSize: '1.2rem', lineHeight: 1.6, color: '#caffd4',
            animation: 'fadeInUp 0.4s ease-in-out'
          }}>
            <strong>SafeCoach:</strong>
            <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', letterSpacing: '2px' }}>
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '1rem 2rem', borderTop: '1px solid #333', display: 'flex', gap: '10px' }}>
        <textarea
          rows={2}
          value={input}
          placeholder="Type how you're feeling..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!isTyping) handleSend();
            }
          }}
          style={{
            flex: 1, fontSize: '1rem', padding: '0.75rem', fontFamily: 'inherit',
            background: '#2a2a2a', color: 'white', border: '1px solid #555',
            borderRadius: '10px', resize: 'none', lineHeight: 1.5
          }}
        />
        <button
          onClick={handleSend}
          disabled={isTyping}
          style={{
            padding: '0.75rem 1.5rem', background: isTyping ? '#888' : '#4caf50',
            color: 'white', border: 'none', borderRadius: '10px',
            fontWeight: 'bold', cursor: isTyping ? 'not-allowed' : 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
