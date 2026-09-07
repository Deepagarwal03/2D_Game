// Entry point for Palmetto Shores '86
import Phaser from 'phaser';
import { MainScene } from './scenes/mainScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  pixelArt: false,
  roundPixels: true,
  antialias: true,
  backgroundColor: '#0d0c1d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MainScene]
};

// Initialize Game
window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(config);
  window.__GAME_INSTANCE__ = game;
});
