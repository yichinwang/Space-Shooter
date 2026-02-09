const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 640,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, TitleScene, GameScene, GameOverScene, VictoryScene]
};

const game = new Phaser.Game(config);
