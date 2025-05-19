import React, { useState, useEffect, useRef } from 'react';

function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat }) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renameModal, setRenameModal] = useState({ open: false, chatId: null });
  const [renameInput, setRenameInput] = useState('');
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  // Close ⋯ menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus input
  useEffect(() => {
    if (renameModal.open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [renameModal.open]);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (renameModal.open && e.key === 'Escape') {
        setRenameModal({ open: false, chatId: null });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [renameModal]);

  const handleRenameSubmit = () => {
    if (renameInput.trim()) {
      onRenameChat(renameModal.chatId, renameInput.trim());
      setRenameModal({ open: false, chatId: null });
      setRenameInput('');
    }
  };

  return (
    <div style={{
      width: '250px',
      background: '#111',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem 0'
    }}>
      <h2 style={{ marginLeft: '1rem' }}>Chats</h2>
      <button style={{ margin: '0 1rem 1rem 1rem' }} onClick={onNewChat}>+ New Chat</button>

      <div style={{ flex: 1, overflowY: 'auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {chats.map((chat) => (
            <li key={chat.id} style={{ position: 'relative' }}>
              <button
                style={{
                  background: chat.id === activeChatId ? '#333' : 'transparent',
                  color: 'white',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => onSelectChat(chat.id)}
              >
                {chat.title}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
                }}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#ccc',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
              >
                ⋯
              </button>

              {menuOpenId === chat.id && (
                <div
                  ref={menuRef}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '100%',
                    marginTop: '6px',
                    background: '#222',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    zIndex: 100,
                    boxShadow: '0 0 8px rgba(0,0,0,0.3)'
                  }}
                >
                  <div
                    onClick={() => {
                      setRenameModal({ open: true, chatId: chat.id });
                      setRenameInput(chat.title);
                      setMenuOpenId(null);
                    }}
                    style={{
                      padding: '0.4rem 0.8rem',
                      cursor: 'pointer',
                      color: 'white',
                      borderBottom: '1px solid #444'
                    }}
                  >
                    Rename
                  </div>
                  <div
                    onClick={() => {
                      onDeleteChat(chat.id);
                      setMenuOpenId(null);
                    }}
                    style={{
                      padding: '0.4rem 0.8rem',
                      cursor: 'pointer',
                      color: 'red'
                    }}
                  >
                    Delete
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {renameModal.open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 200
        }}>
          <div style={{
            background: '#1e1e1e',
            padding: '2rem',
            borderRadius: '10px',
            color: 'white',
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <h3 style={{ margin: 0 }}>Rename Chat</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRenameSubmit();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <input
                ref={inputRef}
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #555',
                  background: '#2a2a2a',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setRenameModal({ open: false, chatId: null })}
                  style={{
                    background: '#555',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#4caf50',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
