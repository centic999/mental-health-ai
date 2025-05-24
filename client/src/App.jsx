import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Chat from './Chat';
import { supabase } from './supabaseClient';
import ProfileMenu from './components/ProfileMenu';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [user, setUser] = useState(null);
  const [authFeedback, setAuthFeedback] = useState('');

  useEffect(() => {
    const fetchUserAndSession = async () => {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (error) {
        setAuthFeedback('This Google account isn’t linked yet.');
        setTimeout(() => setAuthFeedback(''), 5000);
        return;
      }

      if (session?.user) {
        setUser(session.user);

        if (!session.user.confirmed_at) {
          setAuthFeedback('Please check your email to confirm your account.');
        } else {
          setAuthFeedback('Welcome back!');
        }

        setTimeout(() => setAuthFeedback(''), 5000);
      }
    };

    fetchUserAndSession();
  }, []);

  useEffect(() => {
    const loadChats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn("Not logged in. Skipping chat load.");
        return;
      }

      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading chats:", error.message);
        return;
      }

      const normalizedChats = data.map((chat) => ({
        id: chat.id,
        title: chat.title || "New Chat",
        messages: Array.isArray(chat.messages) ? chat.messages : [],
      }));

      console.log("✅ Loaded and normalized chats:", normalizedChats);
      setChats(normalizedChats);
    };

    loadChats();
  }, []);

  const createNewChat = async () => {
    const id = uuidv4();
    const newChat = {
      id,
      title: "New Chat",
      messages: []
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('chats').upsert({
      id: id,
      user_id: user.id,
      title: newChat.title,
      messages: []
    });

    if (error) {
      console.error("❌ Failed to save new chat:", error.message);
    } else {
      console.log("✅ Chat saved to Supabase");
    }
  };

  const saveChat = async (chat) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('chats').upsert({
      id: chat.id,
      user_id: user.id,
      title: chat.title,
      messages: chat.messages || [],
    });

    if (error) console.error("Error saving chat:", error.message);
  };

  const deleteChat = async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('chats').delete().eq('id', id).eq('user_id', user.id);
      if (error) {
        console.error("❌ Failed to delete chat from Supabase:", error.message);
      }
    }

    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (activeChatId === id) setActiveChatId(null);
  };

  const renameChat = (id, newTitle) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === id) {
          const updated = { ...chat, title: newTitle };
          saveChat(updated);
          return updated;
        }
        return chat;
      })
    );
  };

  const selectChat = (id) => setActiveChatId(id);

  const updateChat = (id, messages) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id
          ? {
              ...chat,
              messages,
              title: chat.title === "New Chat" && messages.length > 0
                ? messages[0].content.slice(0, 30) + "..."
                : chat.title
            }
          : chat
      )
    );
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  if (!consentGiven) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to bottom right, #1e1e1e, #2c2c2c)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        animation: 'fadeSlideUp 0.8s ease-out'
      }}>
        <div style={{
          background: '#1e1e1e',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(114, 255, 175, 0.3)',
          textAlign: 'center',
          maxWidth: '90%',
          width: '400px',
          animation: 'fadeSlideUp 0.8s ease-out'
        }}>
          <h1 style={{ fontSize: '1.8rem', color: '#72ffaf', marginBottom: '1rem' }}>
            Welcome to HelpLineAI
          </h1>
          <p style={{ fontSize: '1rem', color: '#f0f0f0', marginBottom: '1.5rem' }}>
            This is a mental health support assistant. It does not replace professional help.
            All conversations are private and anonymous. By clicking "Agree", you understand and accept this.
          </p>
          <button
            onClick={() => setConsentGiven(true)}
            style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1.2rem',
              fontSize: '1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Agree and Continue
          </button>
        </div>

        <style>
          {`
            @keyframes fadeSlideUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <ProfileMenu />
      <div style={{ width: '250px', background: '#111' }}>
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={selectChat}
          onNewChat={createNewChat}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {authFeedback && (
          <div style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ffcc00',
            color: 'black',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            zIndex: 9999,
            animation: 'fadeSlideDown 0.3s ease-out'
          }}>
            {authFeedback}
          </div>
        )}

        {activeChat ? (
          <Chat chat={activeChat} updateChat={updateChat} />
        ) : (
          <div className="landing-fade" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem',
            color: '#f5f5f5',
            fontFamily: 'Segoe UI, sans-serif',
            background: 'linear-gradient(to bottom right, #1e1e1e, #2c2c2c)'
          }}>
            <h1 style={{
              fontSize: '2.8rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#72ffaf',
              textShadow: '0 0 10px rgba(114, 255, 175, 0.2)'
            }}>
              HelpLineAi
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.85 }}>
              Select or start a chat from the left to begin your journey toward feeling better.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
