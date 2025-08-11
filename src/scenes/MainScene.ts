import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private titleText?: Phaser.GameObjects.Text;
  private infoText?: Phaser.GameObjects.Text;

  constructor() {
    super('MainScene');
  }

  preload(): void {
    // Preload assets here when needed
  }

  create(): void {
    const { width, height } = this.scale;

    this.titleText = this.add.text(width / 2, height / 2 - 40, 'AsherE', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      fontSize: '48px',
      color: '#111827',
    }).setOrigin(0.5, 0.5);

    this.infoText = this.add.text(width / 2, height / 2 + 20, 'Educational game starter (Phaser + Vite + TS)', {
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      fontSize: '18px',
      color: '#6B7280',
    }).setOrigin(0.5, 0.5);

    this.add.text(width / 2, height - 20, 'Use arrow keys to move the square', {
      fontSize: '14px',
      color: '#94a3b8',
    }).setOrigin(0.5, 1);

    const player = this.add.rectangle(width / 2, height / 2 + 80, 40, 40, 0x4F46E5);
    this.physics.add.existing(player);
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const speed = 200;
      body.setVelocity(0);

      if (event.key === 'ArrowLeft') body.setVelocityX(-speed);
      if (event.key === 'ArrowRight') body.setVelocityX(speed);
      if (event.key === 'ArrowUp') body.setVelocityY(-speed);
      if (event.key === 'ArrowDown') body.setVelocityY(speed);
    });

    this.input.keyboard?.on('keyup', () => {
      body.setVelocity(0);
    });
  }
}


