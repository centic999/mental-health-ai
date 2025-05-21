import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ProfileMenu() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState(null); // "login" | "signup" | null
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');

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

  const handleAuthSubmit = async () => {
    setFeedback('');
    if (!email || !password) return setFeedback('Email and password required');

    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return setFeedback(error.message);
      setFeedback('✅ Check your email to confirm sign up.');
    }

    if (authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setFeedback(error.message);
      window.location.reload(); // pulls session and refreshes UI
    }
  };

  const closeModal = () => {
    setAuthMode(null);
    setEmail('');
    setPassword('');
    setFeedback('');
  };

  return (
    <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 9999 }}>
      {user ? (
        <>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: '1px solid #72ffaf',
              color: '#72ffaf',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Log Out ({user.email})
          </button>
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
        <div style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#1e1e1e',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(114, 255, 175, 0.3)',
            width: '90%',
            maxWidth: '400px',
            animation: 'fadeSlideUp 0.4s ease-out'
          }}>
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

            <div style={{
              marginTop: '1rem', textAlign: 'center'
            }}>
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
          </div>

          <style>
            {`
              @keyframes fadeSlideUp {
                0% {
                  opacity: 0;
                  transform: translateY(40px);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
