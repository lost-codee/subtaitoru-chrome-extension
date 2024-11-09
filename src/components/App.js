import React from 'react';
import { auth } from '../utils/firebase';
import Auth from './Auth';

const App = () => {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });
  }, []);

  return user ? <div>You are signed in</div> : <Auth />;
}

export default App;