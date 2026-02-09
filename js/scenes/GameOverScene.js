class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create(data) {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;
        const score = data.score || 0;

        // Background
        this.add.tileSprite(0, 0, 480, 640, 'bg-space')
            .setOrigin(0).setScale(480 / 272, 640 / 160);

        // Game Over text
        this.add.text(cx, cy - 60, 'GAME OVER', {
            fontSize: '40px',
            fontFamily: 'monospace',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Score
        this.add.text(cx, cy, 'FINAL SCORE: ' + score, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Restart prompt
        this.restartText = this.add.text(cx, cy + 80, 'PRESS ENTER TO RESTART', {
            fontSize: '16px',
            fontFamily: 'monospace',
            color: '#ffff00'
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 500,
            callback: () => {
                this.restartText.visible = !this.restartText.visible;
            },
            loop: true
        });

        // Delay input slightly so player doesn't accidentally skip
        this.canRestart = false;
        this.time.delayedCall(500, () => {
            this.canRestart = true;
        });

        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        if (this.canRestart && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.scene.start('Game');
        }
    }
}
