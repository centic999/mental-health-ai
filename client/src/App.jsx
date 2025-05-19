import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Chat from './Chat';

function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  const createNewChat = () => {
    const id = Date.now().toString();
    const newChat = {
      id,
      title: "New Chat",
      messages: []
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);
  };

  const deleteChat = (id) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (activeChatId === id) setActiveChatId(null);
  };
  
  const renameChat = (id, newTitle) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, title: newTitle } : chat
      )
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

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
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

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
              HelpMeAi
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
