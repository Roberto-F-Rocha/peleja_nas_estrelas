import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [rocketPosition, setRocketPosition] = useState({ x: window.innerWidth / 2 - 15, y: window.innerHeight - 100 });
  const [bullets, setBullets] = useState([]);
  const [asteroids, setAsteroids] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Movimento do foguete e atirar
  const handleKeyDown = (e) => {
    if (isPaused || isGameOver) return;
    if (e.key === 'ArrowLeft' && rocketPosition.x > 0) {
      setRocketPosition((prev) => ({ ...prev, x: prev.x - 20 }));
    }
    if (e.key === 'ArrowRight' && rocketPosition.x < window.innerWidth - 50) {
      setRocketPosition((prev) => ({ ...prev, x: prev.x + 20 }));
    }
    if (e.key === ' ') {
      shootBullet();
    }
    if (e.key === 'p') {
      togglePause();
    }
  };

  const togglePause = () => setIsPaused((prev) => !prev);

  const shootBullet = () => {
    setBullets((prev) => [...prev, { x: rocketPosition.x + 20, y: rocketPosition.y }]);
    playSound('/shoot.mp3');
  };

  // Atualizações do jogo
  useEffect(() => {
    if (isPaused || isGameOver) return;

    const updateGame = () => {
      // Atualizar posição das balas
      setBullets((prev) =>
        prev.map((bullet) => ({ ...bullet, y: bullet.y - 10 })).filter((bullet) => bullet.y > 0)
      );

      // Atualizar posição dos asteroides
      setAsteroids((prev) =>
        prev.map((asteroid) => ({ ...asteroid, y: asteroid.y + level * 2 })).filter((asteroid) => asteroid.y < window.innerHeight)
      );

      // Atualizar posição dos power-ups
      setPowerUps((prev) =>
        prev.map((powerUp) => ({ ...powerUp, y: powerUp.y + 2 })).filter((powerUp) => powerUp.y < window.innerHeight)
      );

      requestAnimationFrame(updateGame);
    };

    requestAnimationFrame(updateGame);
  }, [isPaused, level, isGameOver]);

  // Gerar asteroides e power-ups
  useEffect(() => {
    const asteroidInterval = setInterval(() => {
      if (!isPaused && !isGameOver) {
        setAsteroids((prev) => [
          ...prev,
          { x: Math.random() * (window.innerWidth - 50), y: 0 },
        ]);
      }
    }, 1000 / level);

    const powerUpInterval = setInterval(() => {
      if (!isPaused && !isGameOver && Math.random() > 0.8) {
        setPowerUps((prev) => [
          ...prev,
          { x: Math.random() * (window.innerWidth - 30), y: 0 },
        ]);
      }
    }, 10000);

    return () => {
      clearInterval(asteroidInterval);
      clearInterval(powerUpInterval);
    };
  }, [isPaused, level, isGameOver]);

  // Detectar colisões
  useEffect(() => {
    bullets.forEach((bullet) => {
      asteroids.forEach((asteroid) => {
        if (
          bullet.x > asteroid.x &&
          bullet.x < asteroid.x + 40 &&
          bullet.y > asteroid.y &&
          bullet.y < asteroid.y + 40
        ) {
          setAsteroids((prev) => prev.filter((a) => a !== asteroid));
          setBullets((prev) => prev.filter((b) => b !== bullet));
          setScore((prev) => prev + 1);
          playSound('/explosion.mp3');
        }
      });
    });

    asteroids.forEach((asteroid) => {
      if (
        rocketPosition.x < asteroid.x + 40 &&
        rocketPosition.x + 40 > asteroid.x &&
        rocketPosition.y < asteroid.y + 40 &&
        rocketPosition.y + 60 > asteroid.y
      ) {
        setLives((prev) => prev - 1);
        setAsteroids((prev) => prev.filter((a) => a !== asteroid));
        if (lives <= 1) setIsGameOver(true);
      }
    });

    powerUps.forEach((powerUp) => {
      if (
        rocketPosition.x < powerUp.x + 30 &&
        rocketPosition.x + 40 > powerUp.x &&
        rocketPosition.y < powerUp.y + 30 &&
        rocketPosition.y + 60 > powerUp.y
      ) {
        setLives((prev) => prev + 1);
        setPowerUps((prev) => prev.filter((p) => p !== powerUp));
        playSound('/powerup.mp3');
      }
    });
  }, [bullets, asteroids, powerUps, rocketPosition, lives]);

  // Subir de nível
  useEffect(() => {
    setLevel(Math.floor(score / 10) + 1);
  }, [score]);

  const restartGame = () => {
    setRocketPosition({ x: window.innerWidth / 2 - 15, y: window.innerHeight - 100 });
    setBullets([]);
    setAsteroids([]);
    setPowerUps([]);
    setScore(0);
    setLives(3);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
  };

  const playSound = (url) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div
      className="game-container"
      tabIndex="0"
      onKeyDown={handleKeyDown}
    >
      <h1 className="score">Score: {score}</h1>
      <h3 className="lives">Vidas: {lives}</h3>
      <h3 className="level">Nível: {level}</h3>

      {isGameOver && (
        <div className="game-over">
          <h2>Game Over</h2>
          <button onClick={restartGame}>Reiniciar</button>
        </div>
      )}

      <img
        src="/rocket.png"
        alt="Foguete"
        className="rocket"
        style={{
          left: rocketPosition.x,
          top: rocketPosition.y,
        }}
      />

      {bullets.map((bullet, index) => (
        <img
          key={index}
          src="/bullet.png"
          alt="Bala"
          className="bullet"
          style={{
            left: bullet.x,
            top: bullet.y,
          }}
        />
      ))}

      {asteroids.map((asteroid, index) => (
        <img
          key={index}
          src="/asteroid.png"
          alt="Asteroide"
          className="asteroid"
          style={{
            left: asteroid.x,
            top: asteroid.y,
          }}
        />
      ))}

      {powerUps.map((powerUp, index) => (
        <img
          key={index}
          src="/powerup.png"
          alt="Power-Up"
          className="power-up"
          style={{
            left: powerUp.x,
            top: powerUp.y,
          }}
        />
      ))}
    </div>
  );
}

export default App;
