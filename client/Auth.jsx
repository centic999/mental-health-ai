import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Check your email to confirm!');
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login or Sign Up</h2>
      <input onChange={e => setEmail(e.target.value)} placeholder="email" /><br />
      <input onChange={e => setPassword(e.target.value)} placeholder="password" type="password" /><br />
      <button onClick={signUp}>Sign Up</button>
      <button onClick={signIn}>Login</button>
    </div>
  );
}
