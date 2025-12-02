import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { useNotification } from "./NotificationContext";

function Login() {
  const [email, setEmail] = useState(""); // Estado para input no email
  const [password, setPassword] = useState(""); //Estado para input na password
  const [error, setError] = useState(""); // Estado para erros
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Função chamada ao submeter o formulário de login
  async function handleSubmit(e) {

    e.preventDefault();
    setError(""); 

    try { // Autenticação com email e password
      
      await signInWithEmailAndPassword(auth, email, password);
      showNotification("Login feito com sucesso!", "success");
      navigate("/profile");

    } catch (err) {
      showNotification("Email ou password inválidos", "error");
    }
  }

  // Função chamada ao clicar no botão "Continue with Google"
  async function handleGoogleLogin() {

    setError(""); // limpa erros anteriores

    try { // Autenticação com Google

      await signInWithPopup(auth, googleProvider);
      showNotification("Autenticado com Google!", "success"); 
      navigate("/profile");

    } catch (err) { // Se não der:

      console.error("Erro no login com Google:", err);
      setError("Não foi possível entrar com Google.");
      showNotification("Erro ao entrar com Google", "error");
    }
  }

  return (
    <div className="auth-container">
      <h2>Welcome back to Bloomly</h2>
      <h5>Reconnect with your ideas and let them flourish again.</h5>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // atualiza estado do email
            required
          />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // atualiza estado da password
            required
          />
        </div>

        <button className="auth-button" type="submit">
          Login
        </button>

        <button className="google-button" onClick={handleGoogleLogin}>
          Continue with Google
        </button>

        <div className="auth-switch">
          <span>Don’t have an account? </span>
          <Link to="/register" className="switch-link">
            Sign up here!
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;

