import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { doc, updateDoc, setDoc, arrayUnion } from "firebase/firestore";
import { useNotification } from "./NotificationContext";
import SearchBar from "./Search.jsx";
import "./styles.css";

function PlantsList() {
  const [plants, setPlants] = useState([]); // Estado para guardar a lista de plantas da API
  const [loading, setLoading] = useState(false); // Estado para controlar o loading da página
  const [search, setSearch] = useState(""); // Estado para o input de pesquisa do utilizador
  const [query, setQuery] = useState(""); // Estado para guardar a pesquisa depois do submit
  const [pendingNotification, setPendingNotification] = useState(null); // Estado para notificação pendente (evita loops infinitos no render)
  const [error, setError] = useState(""); // Estado para guardar mensagens de erro

  const apiKey = import.meta.env.VITE_PERENUAL_KEY; // Chave da API Perenual no .env

  const navigate = useNavigate(); // Hook para navegação

  const { showNotification } = useNotification(); // Importa a função showNotification do Context

  useEffect(() => {
    // Dispara notificações apenas quando o estado muda
    if (pendingNotification) {
      showNotification(pendingNotification.msg, pendingNotification.type);
      setPendingNotification(null);
    }
  }, [pendingNotification, showNotification]);

  // Função para procurar plantas na API
  async function fetchPlants(queryText = "") {
    try {
      setLoading(true);
      setError("");

      // Constrói URL da API com base no input de pesquisa do utilizador
      const url = queryText
        ? `https://perenual.com/api/species-list?key=${apiKey}&q=${encodeURIComponent(
            queryText
          )}&page=1`
        : `https://perenual.com/api/species-list?key=${apiKey}&page=1`;

      const response = await fetch(url); // Faz o pedido à API

      if (!response.ok) throw new Error("Erro na resposta da API");

      const data = await response.json(); // Converte a resposta em JSON

      setPlants(data.data || []); // Atualiza o estado com a lista de plantas dada pela API

      // Caso não encontre plantas
      if ((data.data || []).length === 0) {
        setPendingNotification({
          msg: "No plants found for this search.",
          type: "warning",
        });
      }
    } catch (err) {
      console.error("Erro ao buscar plantas:", err);

      setError("Não foi possível carregar as plantas."); // Atualiza estado da mensagem de erro

      // Mostra a notificação (agora de forma segura)
      setPendingNotification({
        msg: "Could not load plants. Try again later.",
        type: "error",
      });

      setPlants([]); // Limpa o estado da lista de plantas
    } finally {
      setLoading(false);
    }
  }

  // Função chamada ao submeter a pesquisa
  function handleSearchSubmit(e) {
    e.preventDefault(); // Evita o reload da página
    if (!search.trim()) return; // Se input estiver vazio, não faz nada

    setQuery(search); // Guarda o termo pesquisado
    fetchPlants(search); // Chama API para procurar as plantas
  }

  // Função para adicionar uma planta aos favoritos do utilizador
  async function handleAddFavorite(plant) {
    if (!auth.currentUser) {
      // Verifica se utilizador está logado.
      // Se não estiver, notificação de erro.
      setPendingNotification({
        msg: "Please log in to add plants to your garden.",
        type: "error",
      });
      return;
    }

    const userRef = doc(db, "users", auth.currentUser.uid); // Referência ao documento do utilizador no Firestore

    try {
      // Tenta atualizar o array de favoritos (adiciona nova planta)
      await updateDoc(userRef, {
        favorites: arrayUnion({
          id: plant.id,
          common_name: plant.common_name,
          scientific_name: plant.scientific_name,
          image:
            plant.default_image?.medium_url || plant.default_image?.thumbnail,
          custom_name: plant.common_name || "",
        }),
      });

      // Mostra notificação de sucesso
      setPendingNotification({
        msg: `${
          plant.common_name || plant.scientific_name
        } added to your garden!`,
        type: "success",
      });
    } catch {
      // Se o documento do utilizador não existir, cria-o com a planta como favorito
      await setDoc(
        userRef,
        {
          favorites: [
            {
              id: plant.id,
              common_name: plant.common_name,
              scientific_name: plant.scientific_name,
              image:
                plant.default_image?.medium_url ||
                plant.default_image?.thumbnail,
              custom_name: plant.common_name || "",
            },
          ],
        },
        { merge: true } // Isto supostamente garante que outros campos do documento não são apagados
      );

      // Mostra notificação de sucesso
      setPendingNotification({
        msg: `${
          plant.common_name || plant.scientific_name
        } added to your garden!`,
        type: "success",
      });
    }
  }

  return (
    <div className="home-container">
      <SearchBar
        search={search}
        onSearchChange={setSearch} // Atualiza o estado do input à medida que o utilizador escreve
        onSubmit={handleSearchSubmit} // Função chamada no submit da pesquisa
      />

      {/* Loading sem chamar notificação no render */}
      {loading && <p className="loading-msg">Loading plants...</p>}

      {/* Caso não encontre plantas na API */}
      {!loading && !error && query && plants.length === 0 && (
        <p className="no-results-msg">No plants found.</p>
      )}

      {/* Mostra o termo pesquisado quando o loading terminar e houver resultados */}
      {!loading && plants.length > 0 && (
        <h5 className="query-info">
          Here’s what we found for <strong>{query}</strong>
        </h5>
      )}

      {query && plants.length > 0 && <div className="scroll-indicator" />}

      {/* Lista de plantas */}
      {query && plants.length > 0 && (
        <div className="plants-container">
          {plants.slice(0, 12).map((plant) => (
            <div key={plant.id} className="plants-card">
              <img
                src={
                  plant.default_image?.medium_url ||
                  plant.default_image?.thumbnail ||
                  "/default-plant.png"
                }
                alt={
                  plant.common_name || plant.scientific_name || "Plant image"
                }
                className="plant-image"
                onError={(e) => {
                  e.target.onerror = null; // Evita loop infinito
                  e.target.src = "/default-plant.png"; // Imagem padrão caso falhe
                }}
              />

              <h5>{plant.common_name || "Sem nome comum"}</h5>
              <p className="sci-name">{plant.scientific_name}</p>

              <div className="card-buttons">
                <button
                  className="fav-button"
                  type="button"
                  onClick={() => handleAddFavorite(plant)}
                >
                  Save to My Garden
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlantsList;
