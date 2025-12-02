import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNotification } from "./NotificationContext";

function MyGarden() {
  const [favorites, setFavorites] = useState([]); // Estado para guardar as plantas favoritas do utilizador
  const [loading, setLoading] = useState(true); // Estado para controlar o loading
  const [editingId, setEditingId] = useState(null); // Estado para controlar qual planta está a ser editada
  const [tempName, setTempName] = useState(""); // Estado temporário para guardar o nome editado

  const { showNotification } = useNotification();

  useEffect(() => {
    async function fetchFavorites() {
      if (!auth.currentUser) {
        // Se o utilizador não estiver logado, termina o loading
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", auth.currentUser.uid); // Referência ao documento do utilizador

      try {
        const docSnap = await getDoc(userRef); // Procura o documento do Firestore
        if (docSnap.exists()) {
          setFavorites(docSnap.data().favorites || []); // Guarda favoritos se existirem
        } else {
          setFavorites([]); // Se não existir documento, array vazio
        }
      } catch (err) {
        console.error("Erro ao buscar favoritos:", err);
        showNotification("Unable to load your garden.", "error");
      } finally {
        setLoading(false); // Termina o loading
      }
    }

    fetchFavorites(); // Chama a função para procurar os favoritos
  }, []);

  // Função para remover uma planta dos favoritos
  async function handleRemoveFavorite(plantId) {
    if (!auth.currentUser) return; // Se não estiver logado, return

    const userRef = doc(db, "users", auth.currentUser.uid);
    const updatedFavorites = favorites.filter((plant) => plant.id !== plantId); // Remove a planta com o id igual a "plantId" e cria um array atualizado.
    try {
      await updateDoc(userRef, { favorites: updatedFavorites }); // Atualiza Firestore
      setFavorites(updatedFavorites); // Atualiza estado local com o array atualizado
      showNotification("Plant removed from your garden!", "success");
    } catch (err) {
      console.error("Erro ao remover favorito:", err);
      showNotification("Failed to remove the plant.", "error");
    }
  }

  // Começar a editar o nome de uma planta
  function handleStartEdit(plant) {
    setEditingId(plant.id); // Atualiza o estado com o ID da planta em edição
    setTempName(plant.custom_name || plant.common_name || ""); // Preenche input com nome atual
  }

  // Cancelar edição
  function cancelEdit() {
    setEditingId(null);
    setTempName("");
  }

  // Guardar nome editado
  async function saveEdit(plantId) {
    if (!auth.currentUser) return; // Se não estiver logado, return

    const userRef = doc(db, "users", auth.currentUser.uid);

    // Cria um novo array com o nome atualizado
    const updatedFavorites = favorites.map(
      (
        plant // Cria um novo array de favoritos, atualizando apenas a planta com id igual a "plantId"
      ) => (plant.id === plantId ? { ...plant, custom_name: tempName } : plant)
    );

    try {
      await updateDoc(userRef, { favorites: updatedFavorites }); // Atualiza Firestore
      setFavorites(updatedFavorites); // Atualiza o estado local
      setEditingId(null);
      setTempName("");
      showNotification("Plant name updated!", "success");
    } catch (err) {
      console.error("Erro ao atualizar nome:", err);
      showNotification("Failed to update plant name.", "error");
    }
  }

  if (loading) {
    return <p>Loading your garden...</p>;
  }

  // Mostra mensagem caso não hajam favoritos
  if (favorites.length === 0) {
    return (
      <div className="empty-garden-state">
        <h5>Your garden is empty</h5>
        <p>Start exploring and adding plants to grow your Bloomly garden.</p>
      </div>
    );
  }

  // Mostra a lista de plantas favoritas
  return (
    <div>
      <h5 className="title-mygarden">Seeds I’ve Saved.</h5>
      <p className="text-center">Your garden grows from here.</p>
      <div className="plants-container">
        {favorites.map((plant) => {
          const displayName =
            plant.custom_name || plant.common_name || "Unnamed Plant";

          return (
            <div key={plant.id} className="plants-card">
              <img
                src={plant.image || "https://via.placeholder.com/150"}
                alt={plant.common_name || plant.scientific_name}
              />

              {editingId === plant.id ? (
                <input
                  className="plant-name-input"
                  type="text"
                  autoFocus
                  value={tempName} // Valor do input temporário
                  onChange={(e) => setTempName(e.target.value)} // Atualiza input
                  onBlur={() => saveEdit(plant.id)} // Salva ao sair do campo
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(plant.id); // Guarda ao clicar Enter
                    if (e.key === "Escape") cancelEdit(); // Cancela ao clicar Esc
                  }}
                />
              ) : (
                <h5
                  className="plant-name-clickable"
                  onClick={() => handleStartEdit(plant)} // Ativa edição ao clicar
                  title="Click to rename"
                >
                  {displayName}
                </h5>
              )}

              <p className="sci-name">{plant.scientific_name}</p>

              <div className="card-buttons">
                <button className="details-button" type="button">
                  More Details
                </button>

                <button
                  className="remove-button"
                  type="button"
                  onClick={() => handleRemoveFavorite(plant.id)} // Remove planta
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyGarden;
