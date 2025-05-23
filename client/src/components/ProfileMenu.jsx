import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

function ProfileMenu() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState(null); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (authMode && e.key === 'Escape') closeModal();
      if (authMode && e.key === 'Enter') handleAuthSubmit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authMode, email, password]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleAuthSubmit = async () => {
    setFeedback('');
    if (!email || !password) return setFeedback('Email and password required');

    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        if (error.message.includes("already registered")) {
          return setFeedback("⚠️ An account already exists with that email.");
        }
        return setFeedback(error.message);
      }
      setFeedback('✅ Check your email to confirm sign up.');
    }

    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setFeedback(error.message);
      window.location.reload();
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href }
    });
    if (error) console.error('Google Sign-in error:', error.message);
  };

  const closeModal = () => {
    setAuthMode(null);
    setEmail('');
    setPassword('');
    setFeedback('');
  };

  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    const initial = user?.email?.[0]?.toUpperCase() || 'U';
    return `https://ui-avatars.com/api/?name=${initial}`;
  };

  return (
    <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 9999 }}>
      {user ? (
        <>
          <img
            src={getAvatarUrl()}
            onClick={() => setShowDropdown(!showDropdown)}
            alt="avatar"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              cursor: 'pointer',
              border: '2px solid white',
            }}
          />
          {showDropdown && (
            <div style={{
              marginTop: 8,
              background: '#222',
              padding: '12px',
              borderRadius: '8px',
              color: '#fff',
              minWidth: '180px',
              position: 'absolute',
              right: 0,
              top: 45,
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              zIndex: 9999
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '10px' }}>{user.email}</div>
              <div
                onClick={handleLogout}
                style={{
                  cursor: 'pointer',
                  color: '#ff4d4d',
                  fontWeight: 'bold'
                }}
              >
                Log Out
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setAuthMode('signup')}
            style={{
              padding: '0.5rem 1rem',
              background: '#72ffaf',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Sign Up
          </button>
          <button
            onClick={() => setAuthMode('login')}
            style={{
              padding: '0.5rem 1rem',
              background: '#2c2c2c',
              color: 'white',
              border: '1px solid #72ffaf',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Log In
          </button>
        </div>
      )}

      {authMode && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 10000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
            style={{
              background: '#1e1e1e',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(114, 255, 175, 0.3)',
              width: '90%',
              maxWidth: '400px',
              animation: 'fadeSlideUp 0.4s ease-out'
            }}
          >
            <h2 style={{ color: '#72ffaf', textAlign: 'center', marginBottom: '1rem' }}>
              {authMode === 'signup' ? 'Sign Up' : 'Log In'}
            </h2>

            <input
              type="email"
              value={email}
              placeholder="Email"
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '0.6rem',
                marginBottom: '0.8rem', borderRadius: '8px',
                border: '1px solid #444', background: '#2c2c2c', color: '#fff'
              }}
            />
            <input
              type="password"
              value={password}
              placeholder="Password"
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '0.6rem',
                marginBottom: '1rem', borderRadius: '8px',
                border: '1px solid #444', background: '#2c2c2c', color: '#fff'
              }}
            />

            {feedback && (
              <div style={{ color: '#72ffaf', marginBottom: '0.8rem', fontSize: '0.95rem', textAlign: 'center' }}>
                {feedback}
              </div>
            )}

            <button
              onClick={handleAuthSubmit}
              style={{
                width: '100%', padding: '0.7rem',
                background: '#4caf50', color: 'white',
                border: 'none', borderRadius: '8px',
                fontWeight: 'bold', fontSize: '1rem'
              }}
            >
              {authMode === 'signup' ? 'Sign Up' : 'Log In'}
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ccc',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>

            <hr style={{ margin: '1.5rem 0', borderColor: '#444' }} />

            <button
              onClick={signInWithGoogle}
              style={{
                width: '100%',
                padding: '0.7rem',
                background: '#000',
                color: '#fff',
                border: '1px solid #888',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '0.5rem'
              }}
            >
              <img src="/google-icon.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
              {authMode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
            </button>
          </div>

          <style>
            {`
              @keyframes fadeSlideUp {
                0% { opacity: 0; transform: translateY(40px); }
                100% { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
