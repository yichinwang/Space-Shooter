class VictoryScene extends Phaser.Scene {
    constructor() {
        super('Victory');
    }

    create(data) {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        const score = data.score || 0;

        // Background
        this.bgSpace = this.add.tileSprite(0, 0, 480, 640, 'bg-space')
            .setOrigin(0).setScale(480 / 272, 640 / 160);
        this.bgStars = this.add.tileSprite(0, 0, 480, 640, 'bg-stars')
            .setOrigin(0).setScale(480 / 272, 640 / 160);

        // Victory text
        this.add.text(cx, cy - 100, 'YOU WIN!', {
            fontSize: '48px', fontFamily: 'monospace', color: '#00ff00', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(cx, cy - 50, 'ALL WAVES CLEARED', {
            fontSize: '16px', fontFamily: 'monospace', color: '#aaffaa'
        }).setOrigin(0.5);

        // Ship celebration
        this.ship = this.add.sprite(cx, cy + 10, 'ship', 0).setScale(4);
        this.ship.play('ship-idle');

        // Score
        this.add.text(cx, cy + 70, 'FINAL SCORE', {
            fontSize: '14px', fontFamily: 'monospace', color: '#888888'
        }).setOrigin(0.5);

        this.add.text(cx, cy + 95, '' + score, {
            fontSize: '32px', fontFamily: 'monospace', color: '#ffff00', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Play again prompt
        this.restartText = this.add.text(cx, cy + 160, 'PRESS ENTER TO PLAY AGAIN', {
            fontSize: '16px', fontFamily: 'monospace', color: '#ffff00'
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 500,
            callback: () => { this.restartText.visible = !this.restartText.visible; },
            loop: true
        });

        this.canRestart = false;
        this.time.delayedCall(1000, () => { this.canRestart = true; });

        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        // Spawn celebration explosions
        for (let i = 0; i < 8; i++) {
            this.time.delayedCall(i * 300, () => {
                const ex = Phaser.Math.Between(100, 380);
                const ey = Phaser.Math.Between(80, 560);
                const exp = this.add.sprite(ex, ey, 'explosion-c', 0).setScale(1);
                exp.play('explode-c');
                exp.once('animationcomplete', () => exp.destroy());
            });
        }
    }

    update() {
        this.bgStars.tilePositionY -= 0.3;
        if (this.canRestart && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.scene.start('Game');
        }
    }
}
