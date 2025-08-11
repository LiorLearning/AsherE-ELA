import Phaser from 'phaser';
import { MainScene } from '../scenes/MainScene';

let gameSingleton: Phaser.Game | null = null;
let parentElementId: string | null = null;

export function attachToParent(element: HTMLElement | null): string {
  if (!element) {
    parentElementId = 'game-root';
    return parentElementId;
  }
  if (!element.id) {
    element.id = 'game-root';
  }
  parentElementId = element.id;
  return parentElementId;
}

export function detachGameFromParent(): void {
  parentElementId = null;
}

export function createOrGetGame(parentId?: string): Phaser.Game {
  if (gameSingleton) return gameSingleton;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#1e2746',
    parent: parentId ?? parentElementId ?? 'game-root',
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: '100%',
      height: '100%'
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [MainScene],
  };

  gameSingleton = new Phaser.Game(config);
  return gameSingleton;
}


