
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import Navbar from "./Menu.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Profile from "./Profile.jsx";
import Home from "./Home.jsx";
import MusicPlayer from "./MusicPlayer.jsx";


import "./styles.css";

function App() {

  const [user, setUser] = useState(null);

  // ouvir login/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // null se não estiver logado
    });
    return () => unsubscribe();
  }, []);

  function handleLogout() {
    signOut(auth);
  }

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={user ? <Navigate to="/profile" /> : <Login />}
        />

        <Route
          path="/register"
          element={user ? <Navigate to="/profile" /> : <Signup />}
        />

        
        <Route
          path="/profile"
          element={
            user ? (
              <Profile user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />


        
      </Routes>

      <MusicPlayer/>

      

    </Router>
  );
}

export default App;
