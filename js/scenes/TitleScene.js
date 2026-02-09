class TitleScene extends Phaser.Scene {
    constructor() {
        super('Title');
    }

    create() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;

        // Scrolling starfield background
        this.bgSpace = this.add.tileSprite(0, 0, 480, 640, 'bg-space')
            .setOrigin(0).setScale(480 / 272, 640 / 160);
        this.bgStars = this.add.tileSprite(0, 0, 480, 640, 'bg-stars')
            .setOrigin(0).setScale(480 / 272, 640 / 160);

        // Title
        this.add.text(cx, cy - 80, 'SPACE SHOOTER', {
            fontSize: '36px',
            fontFamily: 'monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(cx, cy - 40, 'A Retro Arcade Game', {
            fontSize: '14px',
            fontFamily: 'monospace',
            color: '#888888'
        }).setOrigin(0.5);

        // Show a ship preview
        this.shipPreview = this.add.sprite(cx, cy + 30, 'ship', 0).setScale(4);
        this.shipPreview.play('ship-idle');

        // Start prompt (blinking)
        this.startText = this.add.text(cx, cy + 120, 'PRESS ENTER TO START', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffff00'
        }).setOrigin(0.5);

        // Controls hint
        this.add.text(cx, cy + 180, 'ARROW KEYS / WASD - Move\nSPACE - Fire', {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#666666',
            align: 'center'
        }).setOrigin(0.5);

        // Blink effect
        this.time.addEvent({
            delay: 500,
            callback: () => {
                this.startText.visible = !this.startText.visible;
            },
            loop: true
        });

        // Input
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        // Scroll stars
        this.bgStars.tilePositionY -= 0.3;

        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.scene.start('Game');
        }
    }
}
