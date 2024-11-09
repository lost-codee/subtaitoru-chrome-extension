import React from 'react';
import { auth } from '../utils/firebase';

const Auth = () => {
  const signInWithGoogle = () => {
    const provider = new auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign In with Google</button>
  );
}

export default Auth;