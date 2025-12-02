import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import MyGarden from "./Mygarden.jsx"; 
import { useNotification } from "./NotificationContext";
import "./styles.css";

function Profile() {

  const { showNotification } = useNotification();
  const [user, setUser] = useState(null); // Estado que guarda os dados do utilizador autenticado
  const navigate = useNavigate(); 

  // Verifica se o utilizador está autenticado
  useEffect(() => {
    
    const unsub = onAuthStateChanged(auth, (currentUser) => { // onAuthStateChanged fica sempre à escuta das mudanças de autenticação
      if (!currentUser) { // Se não estiver logado, redireciona para o login
        navigate("/login");
      } else {
        setUser(currentUser); // Se estiver logado, guarda o utilizador no estado
      }
    });

    return () => unsub();
  }, [navigate]);

  // Função para terminar sessão
  async function handleLogout() {
  try {
    await signOut(auth); // Termina sessão no Firebase
    navigate("/login"); // Redireciona para a página de login    
    showNotification("Logout successful!", "success"); // Mostra notificação de logout bem-sucedido
  } catch (err) {
    console.error("Erro ao terminar sessão:", err);
    showNotification("Could not log out. Try again.", "error");
  }
}


  // Se ainda não tiver informação do utilizador, não renderiza nada
  if (!user) return null;

  return (
    <div className="profile-container">
      
      <div className="profile-infos">
        <h1>Good to see you, {user.displayName || "User"}!</h1>
        <h5>Keep blooming, keep building your vision.</h5>

        <p className="mt-4">
          {user.displayName || "No name set"} | {user.email}
        </p>
      </div>

      <div style={{ marginTop: "40px" }}>
        <MyGarden />
      </div>

      <button className="logout-button" type="button" onClick={handleLogout}>
        Log out
      </button>

    </div>
  );
}

export default Profile;
