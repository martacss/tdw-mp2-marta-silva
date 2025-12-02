import React, { createContext, useState, useContext } from "react";
import "./styles.css";

const NotificationContext = createContext(); // Cria Contexto

// Hook personalizado para usar o contexto. Facilita aceder ao contexto sem precisar de usar sempre useContext(NotificationContext)
function useNotification() {
  return useContext(NotificationContext);
}

// Componente Provider que vai envolver a app e mostrar a notificação
function NotificationProvider({ children }) {

  const [notification, setNotification] = useState(null); // Cria estado para a notificação e começa a null, ou seja, sem notificação

  // Função que mostra a notificação
  function showNotification(message, type = "info") {
    setNotification({ message, type }); // Atualiza o estado
    setTimeout(() => setNotification(null), 3000); // Faz a notificação desaparecer 3s depois
  }

  return ( 
    
    // Disponibiliza a função showNotification para todos os filhos do Provider
    <NotificationContext.Provider value={{ showNotification }}>

      {children}

      {notification && ( /* Se houver uma notificação ativa, mostra a notificação */

        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>

      )}
    </NotificationContext.Provider>
  );
}

export { NotificationProvider, useNotification };
