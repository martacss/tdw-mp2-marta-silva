
import { useState } from "react";
import {createUserWithEmailAndPassword, updateProfile, signInWithPopup} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don’t match.");
      return;
    }

    try { // cria o utilizador no Firebase Auth

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { // guarda o nome no perfil do utilizador
        displayName: name,
      });
      navigate("/profile");
      
    } catch (err) {
      console.error("Erro no signup:", err);
      setError("Couldn’t create your account. Please try again.");
    }
  }

  async function handleGoogleSignup() {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      // Google já devolve nome, email, foto, etc.
      navigate("/profile");
    } catch (err) {
      console.error("Erro no Google signup:", err);
      setError("Couldn’t sign in with Google.");
    }
  }

  return (
    <div className="auth-container">
      <h2>Start your journey with Bloomly!</h2>
      <h5>Sign up and watch your creativity flourish.</h5>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <input
            type="password"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-button" type="submit">
          Sign up
        </button>

        <button
          className="google-button"
          type="button"
          onClick={handleGoogleSignup}
        >
          Continue with Google
        </button>

      </form>


      <div className="auth-switch">
          <span>Already have an account?</span>
          <Link to="/login" className="switch-link">
            Log in here!
          </Link>
        </div>
    </div>
  );
}

export default Signup;
