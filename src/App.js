import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import birdImage from './assets/bird.svg';

const BIRD_HEIGHT = 30;
const BIRD_WIDTH = 40;
const GAME_HEIGHT = 500;
const GAME_WIDTH = 500;
const GRAVITY = 6;
const JUMP_HEIGHT = 100;
const OBSTACLE_WIDTH = 60;
const OBSTACLE_GAP = 200;

function App() {
  const [birdPosition, setBirdPosition] = useState(250);
  const [gameStarted, setGameStarted] = useState(false);
  const [obstacleHeight, setObstacleHeight] = useState(200);
  const [obstacleLeft, setObstacleLeft] = useState(GAME_WIDTH);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const bottomObstacleHeight = GAME_HEIGHT - OBSTACLE_GAP - obstacleHeight;

  const resetGame = () => {
    setBirdPosition(250);
    setGameStarted(false);
    setObstacleHeight(200);
    setObstacleLeft(GAME_WIDTH);
    setScore(0);
    setGameOver(false);
  };

  const handleClick = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (!gameOver) {
      setBirdPosition(position => position - JUMP_HEIGHT);
      const bird = document.querySelector('.bird');
      bird.style.transform = 'rotate(-20deg)';
      setTimeout(() => {
        bird.style.transform = 'rotate(0deg)';
      }, 200);
    }
  }, [gameOver, gameStarted]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleClick();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleClick]);

  useEffect(() => {
    let timeId;
    if (gameStarted && !gameOver) {
      timeId = setInterval(() => {
        setBirdPosition(position => {
          const newPosition = position + GRAVITY;
          if (newPosition >= GAME_HEIGHT - BIRD_HEIGHT || newPosition <= 0) {
            setGameOver(true);
            return position;
          }
          return newPosition;
        });
      }, 24);
    }
    return () => clearInterval(timeId);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    let obstacleId;
    if (gameStarted && !gameOver) {
      obstacleId = setInterval(() => {
        setObstacleLeft(left => {
          if (left <= -OBSTACLE_WIDTH) {
            setScore(score => score + 1);
            setObstacleHeight(Math.floor(Math.random() * (GAME_HEIGHT - OBSTACLE_GAP)));
            return GAME_WIDTH;
          }
          return left - 5;
        });
      }, 24);

      return () => clearInterval(obstacleId);
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const hasCollidedWithTopObstacle = 
      birdPosition >= 0 && 
      birdPosition <= obstacleHeight &&
      obstacleLeft >= 0 && 
      obstacleLeft <= BIRD_WIDTH;

    const hasCollidedWithBottomObstacle = 
      birdPosition <= GAME_HEIGHT &&
      birdPosition >= GAME_HEIGHT - bottomObstacleHeight &&
      obstacleLeft >= 0 && 
      obstacleLeft <= BIRD_WIDTH;

    if (hasCollidedWithTopObstacle || hasCollidedWithBottomObstacle) {
      setGameOver(true);
    }
  }, [birdPosition, obstacleHeight, obstacleLeft, bottomObstacleHeight]);

  return (
    <div className="App">
      <div className="game-container" onClick={handleClick}>
        {!gameStarted && <div className="start-message">Press Space or Click to Start</div>}
        {gameOver && (
          <div className="game-over">
            <div>Game Over! Score: {score}</div>
            <button className="restart-button" onClick={(e) => {
              e.stopPropagation();
              resetGame();
            }}>
              Restart Game
            </button>
          </div>
        )}
        <div
          className="bird"
          style={{
            top: birdPosition,
            left: 100,
            width: BIRD_WIDTH,
            height: BIRD_HEIGHT,
            backgroundImage: `url(${birdImage})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'transparent',
          }}
        />
        <div
          className="obstacle"
          style={{
            top: 0,
            left: obstacleLeft,
            width: OBSTACLE_WIDTH,
            height: obstacleHeight,
          }}
        />
        <div
          className="obstacle"
          style={{
            top: GAME_HEIGHT - bottomObstacleHeight,
            left: obstacleLeft,
            width: OBSTACLE_WIDTH,
            height: bottomObstacleHeight,
          }}
        />
        {gameStarted && !gameOver && <div className="score">Score: {score}</div>}
      </div>
    </div>
  );
}

export default App;
