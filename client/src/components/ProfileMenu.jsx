import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

function ProfileMenu() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const signInWithGoogle = async () => {
    setFeedback("Redirecting to Google...");
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
    } catch (err) {
      setFeedback("❌ Google sign-in failed.");
    }
  };

  const closeModal = () => {
    setAuthOpen(false);
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
        <button
          onClick={() => setAuthOpen(true)}
          style={{
            padding: '0.5rem 1rem',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      )}

      {authOpen && (
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
              Log In
            </h2>

            {feedback && (
              <div style={{ color: '#72ffaf', marginBottom: '1rem', fontSize: '0.95rem', textAlign: 'center' }}>
                {feedback}
              </div>
            )}

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
                marginBottom: '1rem'
              }}
            >
              <img src="/google-icon.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
              Continue with Google
            </button>

            <p style={{ fontSize: '0.85rem', textAlign: 'center', color: '#aaa', marginTop: '1rem' }}>
              Google will automatically create a new account or sign you in if one exists. Confirmation may be required via email.
            </p>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
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
