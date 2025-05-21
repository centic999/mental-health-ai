import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ProfileMenu() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleLogin = () => window.location.href = "/auth?mode=login";
  const handleSignup = () => window.location.href = "/auth?mode=signup";

  return (
    <div style={{ position: 'absolute', top: 20, right: 20 }}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <img
          src={user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=U'}
          alt="profile"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '2px solid white'
          }}
        />
      </button>

      {menuOpen && (
        <div style={{
          marginTop: 10, background: '#222', color: '#fff',
          borderRadius: 8, padding: 10, minWidth: 180, position: 'absolute', right: 0,
          boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        }}>
          {user ? (
            <>
              <div style={{ fontSize: '0.9rem', marginBottom: 8 }}>{user.email}</div>
              <div onClick={handleLogout} style={{ cursor: 'pointer', color: '#ff4d4d' }}>Log Out</div>
            </>
          ) : (
            <>
              <div onClick={handleLogin} style={{ cursor: 'pointer', marginBottom: 6 }}>Log In</div>
              <div onClick={handleSignup} style={{ cursor: 'pointer' }}>Sign Up</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
