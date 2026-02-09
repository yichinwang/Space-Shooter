class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Show loading progress
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const barW = 200;
        const barH = 16;
        const barX = (width - barW) / 2;
        const barY = height / 2;

        const bg = this.add.rectangle(barX, barY, barW, barH, 0x222222).setOrigin(0);
        const fill = this.add.rectangle(barX, barY, 0, barH, 0x00aaff).setOrigin(0);
        const loadText = this.add.text(width / 2, barY - 24, 'LOADING...', {
            fontSize: '14px', fontFamily: 'monospace', color: '#ffffff'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => { fill.width = barW * value; });
        this.load.on('complete', () => { bg.destroy(); fill.destroy(); loadText.destroy(); });

        // --- Player ---
        this.load.spritesheet('ship', 'assets/player/ship.png', { frameWidth: 16, frameHeight: 16 });

        // --- Enemies ---
        this.load.spritesheet('enemy-small', 'assets/enemies/JH_16x16.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemy-medium', 'assets/enemies/enemy-medium.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemy-big', 'assets/enemies/enemy-big.png', { frameWidth: 32, frameHeight: 32 });

        // --- Projectiles ---
        this.load.spritesheet('laser-bolts', 'assets/projectiles/laser-bolts.png', { frameWidth: 16, frameHeight: 16 });

        // --- Power-ups ---
        this.load.spritesheet('power-up', 'assets/powerups/power-up.png', { frameWidth: 16, frameHeight: 16 });

        // --- Explosions ---
        this.load.spritesheet('explosion-small', 'assets/explosions/explosion-small.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('explosion-a', 'assets/explosions/explosion-a.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('explosion-b', 'assets/explosions/explosion-b.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('explosion-c', 'assets/explosions/explosion-c.png', { frameWidth: 80, frameHeight: 80 });
        this.load.spritesheet('explosion-e', 'assets/explosions/explosion-e.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('explosion-f', 'assets/explosions/explosion-f.png', { frameWidth: 48, frameHeight: 48 });

        // --- Backgrounds ---
        this.load.image('bg-space', 'assets/backgrounds/space-bg.png');
        this.load.image('bg-stars', 'assets/backgrounds/space-stars.png');
        this.load.image('bg-far-planets', 'assets/backgrounds/space-far-planets.png');
        this.load.image('bg-ring-planet', 'assets/backgrounds/space-ring-planet.png');
        this.load.image('bg-big-planet', 'assets/backgrounds/space-big-planet.png');
    }

    create() {
        // --- Player animations ---
        this.anims.create({ key: 'ship-idle', frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 4 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'ship-left', frames: this.anims.generateFrameNumbers('ship', { start: 5, end: 9 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'ship-right', frames: this.anims.generateFrameNumbers('ship', { start: 10, end: 14 }), frameRate: 10, repeat: -1 });

        // --- Enemy animations ---
        this.anims.create({ key: 'enemy-small-fly', frames: this.anims.generateFrameNumbers('enemy-small', { start: 0, end: 1 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'enemy-medium-fly', frames: this.anims.generateFrameNumbers('enemy-medium', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'enemy-big-fly', frames: this.anims.generateFrameNumbers('enemy-big', { start: 0, end: 1 }), frameRate: 4, repeat: -1 });

        // --- Power-up animations ---
        this.anims.create({ key: 'powerup-blue', frames: this.anims.generateFrameNumbers('power-up', { frames: [0, 2] }), frameRate: 4, repeat: -1 });
        this.anims.create({ key: 'powerup-red', frames: this.anims.generateFrameNumbers('power-up', { frames: [1, 3] }), frameRate: 4, repeat: -1 });

        // --- Explosion animations ---
        this.anims.create({ key: 'explode-small', frames: this.anims.generateFrameNumbers('explosion-small', { start: 0, end: 4 }), frameRate: 15, repeat: 0 });
        this.anims.create({ key: 'explode-a', frames: this.anims.generateFrameNumbers('explosion-a', { start: 0, end: 7 }), frameRate: 15, repeat: 0 });
        this.anims.create({ key: 'explode-b', frames: this.anims.generateFrameNumbers('explosion-b', { start: 0, end: 7 }), frameRate: 12, repeat: 0 });
        this.anims.create({ key: 'explode-c', frames: this.anims.generateFrameNumbers('explosion-c', { start: 0, end: 15 }), frameRate: 20, repeat: 0 });
        this.anims.create({ key: 'explode-e', frames: this.anims.generateFrameNumbers('explosion-e', { start: 0, end: 21 }), frameRate: 24, repeat: 0 });
        this.anims.create({ key: 'explode-f', frames: this.anims.generateFrameNumbers('explosion-f', { start: 0, end: 7 }), frameRate: 18, repeat: 0 });

        this.scene.start('Title');
    }
}
