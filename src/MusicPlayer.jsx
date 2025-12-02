// src/MusicPlayer.jsx
import React, { useEffect, useState, useRef } from "react";

function MusicPlayer() {
  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [showList, setShowList] = useState(false);

  const audioRef = useRef(null);

  const clientId = import.meta.env.VITE_JAMENDO_KEY; // Chave da API no .env

  useEffect(() => {
    async function fetchTracks() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=20&tags=nature&audioformat=mp31`
        );

        if (!response.ok) throw new Error("Erro na resposta da API");

        const data = await response.json();
        setTracks(data.results || []);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar as músicas.");
      } finally {
        setLoading(false);
      }
    }

    fetchTracks();
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  if (loading || error || tracks.length === 0) return null;

  const currentTrack = tracks[currentTrackIndex];

  function handleSelectTrack(index) {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  }

  function handleNext() {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  }

  function handlePrev() {
    setCurrentTrackIndex((prev) =>
      prev === 0 ? tracks.length - 1 : prev - 1
    );
    setIsPlaying(true);
  }

  function handleTogglePlay() {
    setIsPlaying((prev) => !prev);
  }

  function handleToggleList() {
    setShowList((prev) => !prev);
  }

  return (
    <>
      {showList && (
        <div className="music-list-container">
          <h4>Botanic Soundscapes</h4>
          <div className="music-list">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                type="button"
                className={
                  index === currentTrackIndex
                    ? "music-list-item active"
                    : "music-list-item"
                }
                onClick={() => handleSelectTrack(index)}
              >
                <span className="music-list-title">{track.name}</span>
                <span className="music-list-artist">
                  {track.artist_name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="music-widget-container">
        <div className="music-left">
          <div className="music-dot" />
          <div className="music-text">
            <span className="music-nowplaying">Now playing</span>
            <span className="music-title">{currentTrack.name}</span>
            <span className="music-artist">
              {currentTrack.artist_name}
            </span>
          </div>
        </div>

        <div className="music-middle">
          <button
            type="button"
            className="music-icon-button"
            onClick={handlePrev}
          >
            ⏮
          </button>
          <button
            type="button"
            className="music-icon-button play-button"
            onClick={handleTogglePlay}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            type="button"
            className="music-icon-button"
            onClick={handleNext}
          >
            ⏭
          </button>
        </div>

        <button
          type="button"
          className="music-icon-button playlist-button"
          onClick={handleToggleList}
        >
          ♪
        </button>

        <audio
          ref={audioRef}
          src={currentTrack.audio}
          onEnded={handleNext}
        />
      </div>
    </>
  );
}

export default MusicPlayer;
