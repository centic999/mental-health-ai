import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { supabase } from './supabaseClient';


const saveChat = async (chatTitle, messagesArray) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return alert('Not logged in');

  const { error } = await supabase.from('chats').upsert({
    id: chatId, 
    user_id: user.id,
    title: chatTitle,
    messages: messagesArray,
  });  

  if (error) console.error('Error saving chat:', error.message);
};

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

function Chat({ chat, updateChat }) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const newMessages = [...chat.messages, { role: "user", content: input }];
    updateChat(chat.id, newMessages);
    setIsTyping(true);
    setInput('');
  
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
  
      if (!user) {
        alert('Not logged in');
        setIsTyping(false);
        return;
      }
  
      const res = await axios.post('https://mental-health-ai-wivn.onrender.com/chat', {
        messages: newMessages,
        user_id: user.id
      });
  
      console.log("Full AI API response:", res.data);
  
      const reply = res.data?.response || "Sorry, I didn’t get that. Try again.";
      const updatedMessages = [...newMessages, { role: "assistant", content: reply }];
      updateChat(chat.id, updatedMessages);
  
      await saveChat(chat.title, updatedMessages);
    } catch (error) {
      console.error("Error during AI chat:", error);
      updateChat(chat.id, [...newMessages, {
        role: "assistant",
        content: "Sorry, something went wrong."
      }]);
    }
  
    setIsTyping(false);
  };
  

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, isTyping]);

  return (
    <div
      className="chat-container-fade"
      style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Title */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: '#1e1e1e',
        padding: '1rem 2rem',
        borderBottom: '1px solid #333',
        textAlign: 'center',
        zIndex: 10
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {chat.title}
        </h1>
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2rem', marginBottom: '1rem' }}>
        {chat.messages.map((msg, i) => (
          <div key={i} style={{ width: '100%' }}>
            <div
              className="message-bubble"
              style={{
                width: '100%',
                background: msg.role === 'user' ? '#2c2c2c' : '#1e3d2f',
                borderRadius: '16px',
                padding: '1.25rem',
                margin: '1.25rem 0',
                boxSizing: 'border-box',
                color: msg.role === 'assistant' ? '#caffd4' : '#e0e0e0',
                fontSize: '1.1rem',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                boxShadow: msg.role === 'assistant' ? '0 0 12px #1e3d2f' : '0 0 6px #222',
                animation: 'fadeInUp 0.4s ease-in-out'
              }}
            >
              <strong style={{ color: msg.role === 'user' ? '#73b1ff' : '#72ffaf' }}>
                {msg.role === 'user' ? 'You' : 'SafeCoach'}:
              </strong>
              <div style={{ marginTop: '0.5rem' }}>
                {msg.role === 'assistant' ? formatAiMessage(msg.content) : msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{
            marginTop: '1.25rem',
            marginBottom: '1rem',
            padding: '1.25rem',
            background: '#1e3d2f',
            borderRadius: '16px',
            fontSize: '1.2rem',
            lineHeight: 1.6,
            color: '#caffd4',
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

      {/* Input box */}
      <div style={{ padding: '1rem 2rem', borderTop: '1px solid #333', display: 'flex', gap: '10px' }}>
        <textarea
          rows={2}
          value={input}
          placeholder="Type how you're feeling..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{
            flex: 1,
            fontSize: '1rem',
            padding: '0.75rem',
            fontFamily: 'inherit',
            background: '#2a2a2a',
            color: 'white',
            border: '1px solid #555',
            borderRadius: '10px',
            resize: 'none',
            lineHeight: 1.5
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
