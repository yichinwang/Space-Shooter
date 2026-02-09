class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        // ── Core State ──
        this.score = 0;
        this.lives = 3;
        this.isInvincible = false;
        this.gameOver = false;

        // ── Weapon State ──
        this.weaponLevel = 0;
        this.hasShield = false;

        // ── Wave State ──
        this.currentWave = 1;
        this.wavePhase = 'announce'; // announce | enemies | boss | complete | transition
        this.waveTimer = 0;
        this.waveSpawnIndex = 0;
        this.bossActive = false;
        this.boss = null;

        // ── Parallax Background ──
        const scaleX = 480 / 272;
        const scaleY = 640 / 160;
        this.bgSpace = this.add.tileSprite(0, 0, 480, 640, 'bg-space').setOrigin(0).setScale(scaleX, scaleY);
        this.bgStars = this.add.tileSprite(0, 0, 480, 640, 'bg-stars').setOrigin(0).setScale(scaleX, scaleY);
        this.bgFarPlanets = this.add.tileSprite(0, 0, 480, 640, 'bg-far-planets').setOrigin(0).setScale(scaleX, scaleY);
        this.ringPlanet = this.add.image(360, -60, 'bg-ring-planet').setScale(3).setAlpha(0.6);
        this.bigPlanet = this.add.image(100, -200, 'bg-big-planet').setScale(2.5).setAlpha(0.5);

        // ── Player ──
        this.player = this.physics.add.sprite(240, 560, 'ship', 0);
        this.player.setScale(3).setCollideWorldBounds(true);
        this.player.body.setSize(10, 10);
        this.player.play('ship-idle');

        // ── Shield visual ──
        this.shieldGfx = this.add.circle(0, 0, 28, 0x00aaff, 0.25);
        this.shieldGfx.setStrokeStyle(2, 0x00aaff, 0.6).setVisible(false);

        // ── Groups ──
        this.playerBullets = this.physics.add.group({ defaultKey: 'laser-bolts', maxSize: 50 });
        this.enemyBullets = this.physics.add.group({ defaultKey: 'laser-bolts', maxSize: 60 });
        this.enemies = this.physics.add.group();
        this.powerups = this.physics.add.group();

        // ── Input ──
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // ── Auto-fire ──
        this.lastFired = 0;

        // ── Collisions ──
        this.physics.add.overlap(this.playerBullets, this.enemies, this.onBulletHitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.onEnemyHitPlayer, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.onEnemyBulletHitPlayer, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.onCollectPowerup, null, this);

        // ── HUD ──
        this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
            fontSize: '16px', fontFamily: 'monospace', color: '#ffffff'
        }).setDepth(100);
        this.livesText = this.add.text(464, 16, '', {
            fontSize: '16px', fontFamily: 'monospace', color: '#ffffff'
        }).setOrigin(1, 0).setDepth(100);
        this.updateLivesDisplay();

        this.weaponText = this.add.text(16, 36, '', {
            fontSize: '12px', fontFamily: 'monospace', color: '#00aaff'
        }).setDepth(100);

        this.waveText = this.add.text(240, 16, '', {
            fontSize: '12px', fontFamily: 'monospace', color: '#aaaaaa'
        }).setOrigin(0.5, 0).setDepth(100);

        // Boss HP bar
        this.bossHpBg = this.add.rectangle(240, 50, 200, 10, 0x333333).setVisible(false).setDepth(100);
        this.bossHpFill = this.add.rectangle(240, 50, 200, 10, 0xff0000).setVisible(false).setDepth(100);
        this.bossNameText = this.add.text(240, 38, '', {
            fontSize: '10px', fontFamily: 'monospace', color: '#ff6666'
        }).setOrigin(0.5).setVisible(false).setDepth(100);

        // Announcement text
        this.announceText = this.add.text(240, 300, '', {
            fontSize: '32px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0).setDepth(100);

        // ── Start Wave 1 ──
        this.startWave();
    }

    // ════════════════════════════════════════════
    // WAVE SYSTEM
    // ════════════════════════════════════════════

    startWave() {
        this.wavePhase = 'announce';
        this.waveSpawnIndex = 0;
        this.bossActive = false;
        this.boss = null;
        this.buildWaveSchedule();

        this.waveText.setText('WAVE ' + this.currentWave);

        // Clear remaining enemy bullets between waves
        this.enemyBullets.getChildren().forEach(b => {
            b.setActive(false).setVisible(false);
            if (b.body) b.body.stop();
        });

        this.announceText.setText('WAVE ' + this.currentWave);
        this.announceText.setFontSize(32);
        this.announceText.setColor('#ffffff');
        this.announceText.setAlpha(1);
        this.tweens.add({
            targets: this.announceText,
            alpha: 0,
            duration: 500,
            delay: 1500,
            onComplete: () => {
                this.wavePhase = 'enemies';
                this.waveTimer = this.time.now;
            }
        });
    }

    buildWaveSchedule() {
        this.spawnSchedule = [];
        let t = 0;

        if (this.currentWave === 1) {
            // Phase A: Simple lines (0-12s)
            for (let i = 0; i < 4; i++) {
                const baseX = Phaser.Math.Between(80, 400);
                for (let j = 0; j < 3; j++) {
                    this.spawnSchedule.push({ time: t + j * 400, type: 'small', x: baseX + (j - 1) * 50 });
                }
                t += 2500;
            }
            // Phase B: V-formations (12-26s)
            for (let i = 0; i < 3; i++) {
                const cx = Phaser.Math.Between(120, 360);
                this.spawnSchedule.push({ time: t, type: 'small', x: cx });
                this.spawnSchedule.push({ time: t + 200, type: 'small', x: cx - 40 });
                this.spawnSchedule.push({ time: t + 200, type: 'small', x: cx + 40 });
                this.spawnSchedule.push({ time: t + 400, type: 'small', x: cx - 80 });
                this.spawnSchedule.push({ time: t + 400, type: 'small', x: cx + 80 });
                t += 3500;
            }
            // Phase C: Mixed (26-50s)
            for (let i = 0; i < 4; i++) {
                const cx = Phaser.Math.Between(100, 380);
                this.spawnSchedule.push({ time: t, type: 'medium', x: cx });
                this.spawnSchedule.push({ time: t + 300, type: 'small', x: cx - 60 });
                this.spawnSchedule.push({ time: t + 300, type: 'small', x: cx + 60 });
                for (let j = 0; j < 2; j++) {
                    this.spawnSchedule.push({ time: t + 1500 + j * 300, type: 'small', x: Phaser.Math.Between(40, 440) });
                }
                t += 4000;
            }
        } else if (this.currentWave === 2) {
            // Zigzag swoops
            for (let i = 0; i < 4; i++) {
                const startX = i % 2 === 0 ? 60 : 420;
                for (let j = 0; j < 4; j++) {
                    this.spawnSchedule.push({ time: t + j * 350, type: 'small', x: startX, pattern: 'zigzag' });
                }
                t += 2500;
            }
            // Diagonal sweeps with mediums
            for (let i = 0; i < 3; i++) {
                const fromLeft = i % 2 === 0;
                this.spawnSchedule.push({ time: t, type: 'medium', x: fromLeft ? 60 : 420, pattern: 'diagonal', dir: fromLeft ? 1 : -1 });
                this.spawnSchedule.push({ time: t + 300, type: 'small', x: fromLeft ? 100 : 380, pattern: 'diagonal', dir: fromLeft ? 1 : -1 });
                this.spawnSchedule.push({ time: t + 600, type: 'small', x: fromLeft ? 140 : 340, pattern: 'diagonal', dir: fromLeft ? 1 : -1 });
                t += 3000;
            }
            // Cluster formations
            for (let i = 0; i < 4; i++) {
                const cx = Phaser.Math.Between(120, 360);
                this.spawnSchedule.push({ time: t, type: 'medium', x: cx });
                this.spawnSchedule.push({ time: t, type: 'small', x: cx - 40 });
                this.spawnSchedule.push({ time: t, type: 'small', x: cx + 40 });
                this.spawnSchedule.push({ time: t + 200, type: 'small', x: cx - 20 });
                this.spawnSchedule.push({ time: t + 200, type: 'small', x: cx + 20 });
                t += 3500;
            }
            // Final swarm
            for (let i = 0; i < 6; i++) {
                this.spawnSchedule.push({ time: t + i * 250, type: 'small', x: Phaser.Math.Between(40, 440) });
            }
            t += 3000;
        } else if (this.currentWave === 3) {
            // Pincer attacks
            for (let i = 0; i < 3; i++) {
                this.spawnSchedule.push({ time: t, type: 'medium', x: 60, pattern: 'diagonal', dir: 1 });
                this.spawnSchedule.push({ time: t, type: 'medium', x: 420, pattern: 'diagonal', dir: -1 });
                this.spawnSchedule.push({ time: t + 400, type: 'small', x: 100, pattern: 'diagonal', dir: 1 });
                this.spawnSchedule.push({ time: t + 400, type: 'small', x: 380, pattern: 'diagonal', dir: -1 });
                t += 3000;
            }
            // Dense mixed formations
            for (let i = 0; i < 4; i++) {
                const cx = Phaser.Math.Between(100, 380);
                this.spawnSchedule.push({ time: t, type: 'medium', x: cx });
                this.spawnSchedule.push({ time: t, type: 'medium', x: cx - 50 });
                this.spawnSchedule.push({ time: t + 200, type: 'small', x: cx + 50 });
                this.spawnSchedule.push({ time: t + 200, type: 'small', x: cx - 80 });
                this.spawnSchedule.push({ time: t + 200, type: 'small', x: cx + 80 });
                t += 3500;
            }
            // Small enemy swarms
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 6; j++) {
                    this.spawnSchedule.push({ time: t + j * 200, type: 'small', x: Phaser.Math.Between(40, 440) });
                }
                // Medium flankers
                this.spawnSchedule.push({ time: t + 500, type: 'medium', x: 80 });
                this.spawnSchedule.push({ time: t + 500, type: 'medium', x: 400 });
                t += 3000;
            }
            // Final rush
            for (let i = 0; i < 4; i++) {
                this.spawnSchedule.push({ time: t + i * 300, type: 'medium', x: Phaser.Math.Between(80, 400) });
            }
            for (let i = 0; i < 8; i++) {
                this.spawnSchedule.push({ time: t + 1200 + i * 200, type: 'small', x: Phaser.Math.Between(40, 440) });
            }
            t += 4000;
        }
    }

    updateWave(time) {
        if (this.wavePhase === 'enemies') {
            const elapsed = time - this.waveTimer;
            while (this.waveSpawnIndex < this.spawnSchedule.length) {
                const entry = this.spawnSchedule[this.waveSpawnIndex];
                if (elapsed >= entry.time) {
                    this.spawnEnemy(entry.type, entry.x, entry.pattern, entry.dir);
                    this.waveSpawnIndex++;
                } else {
                    break;
                }
            }
            if (this.waveSpawnIndex >= this.spawnSchedule.length && this.enemies.countActive() === 0) {
                this.startBoss();
            }
        } else if (this.wavePhase === 'boss') {
            this.updateBoss(time);
        }
    }

    // ════════════════════════════════════════════
    // ENEMY SPAWNING
    // ════════════════════════════════════════════

    spawnEnemy(type, x, pattern, dir) {
        if (this.gameOver) return;
        x = Phaser.Math.Clamp(x, 30, 450);

        let enemy;
        if (type === 'small') {
            enemy = this.enemies.create(x, -20, 'enemy-small');
            enemy.setScale(3).play('enemy-small-fly');
            enemy.body.setSize(12, 12);
            enemy.setData('type', 'small');
            enemy.setData('hp', 1);
            enemy.setData('score', 100);
            enemy.setData('fireRate', 2500 - (this.currentWave - 1) * 300);
        } else if (type === 'medium') {
            enemy = this.enemies.create(x, -20, 'enemy-medium');
            enemy.setScale(3).play('enemy-medium-fly');
            enemy.body.setSize(14, 14);
            enemy.setData('type', 'medium');
            enemy.setData('hp', 3);
            enemy.setData('score', 250);
            enemy.setData('fireRate', 1800 - (this.currentWave - 1) * 200);
        }

        enemy.setData('lastShot', 0);

        // Movement patterns
        const speedMult = 1 + (this.currentWave - 1) * 0.15; // 15% faster per wave
        if (pattern === 'zigzag') {
            enemy.setVelocity(0, 100 * speedMult);
            enemy.setData('zigzag', true);
            enemy.setData('zigTimer', 0);
            enemy.setData('zigDir', dir || (Math.random() < 0.5 ? 1 : -1));
        } else if (pattern === 'diagonal') {
            const d = dir || 1;
            enemy.setVelocity(d * 60 * speedMult, 90 * speedMult);
        } else {
            const speedY = Phaser.Math.Between(70, 130) * speedMult;
            const speedX = Phaser.Math.Between(-25, 25);
            enemy.setVelocity(speedX, speedY);
        }
    }

    // ════════════════════════════════════════════
    // BOSS SYSTEM
    // ════════════════════════════════════════════

    getBossConfig() {
        const configs = {
            1: { hp: 15, fireRate: 800, speed: 100, name: 'SCOUT COMMANDER', pattern: 'aimed' },
            2: { hp: 25, fireRate: 600, speed: 130, name: 'FLEET CAPTAIN', pattern: 'spread' },
            3: { hp: 40, fireRate: 500, speed: 150, name: 'DARK OVERLORD', pattern: 'multi' }
        };
        return configs[this.currentWave];
    }

    startBoss() {
        this.wavePhase = 'boss';
        this.bossActive = true;
        const cfg = this.getBossConfig();

        // Warning flash
        this.announceText.setText('WARNING');
        this.announceText.setColor('#ff0000');
        this.announceText.setFontSize(32);
        this.announceText.setAlpha(1);
        this.tweens.add({
            targets: this.announceText,
            alpha: { from: 1, to: 0.2 },
            duration: 300, repeat: 4, yoyo: true,
            onComplete: () => {
                this.announceText.setAlpha(0);
                this.announceText.setColor('#ffffff');
            }
        });

        // Spawn boss
        this.boss = this.physics.add.sprite(240, -60, 'enemy-big');
        this.boss.setScale(3 + (this.currentWave - 1) * 0.3); // Slightly bigger each wave
        this.boss.play('enemy-big-fly');
        this.boss.body.setSize(28, 28);
        this.boss.setData('type', 'boss');
        this.boss.setData('hp', cfg.hp);
        this.boss.setData('maxHp', cfg.hp);
        this.boss.setData('score', 1000);
        this.boss.setData('lastShot', 0);
        this.boss.setData('fireRate', cfg.fireRate);
        this.boss.setData('moveDir', 1);
        this.boss.setData('moveSpeed', cfg.speed);
        this.boss.setData('pattern', cfg.pattern);
        this.boss.setData('phase', 1);
        this.boss.setData('attackCycle', 0);
        this.enemies.add(this.boss);

        this.tweens.add({
            targets: this.boss,
            y: 80,
            duration: 2000,
            ease: 'Sine.easeOut',
            onComplete: () => { if (this.boss && this.boss.active) this.boss.setData('ready', true); }
        });

        // Show HP bar
        this.bossHpBg.setVisible(true);
        this.bossHpFill.setVisible(true);
        this.bossHpFill.scaleX = 1;
        this.bossNameText.setText(cfg.name).setVisible(true);
    }

    updateBoss(time) {
        if (!this.boss || !this.boss.active || !this.boss.getData('ready')) return;

        // Left-right sweep
        const dir = this.boss.getData('moveDir');
        const spd = this.boss.getData('moveSpeed');
        this.boss.setVelocityX(dir * spd);
        this.boss.setVelocityY(0);
        if (this.boss.x > 400) this.boss.setData('moveDir', -1);
        if (this.boss.x < 80) this.boss.setData('moveDir', 1);

        // Firing pattern
        if (time > this.boss.getData('lastShot') + this.boss.getData('fireRate')) {
            const pattern = this.boss.getData('pattern');
            const phase = this.boss.getData('phase');

            if (pattern === 'aimed') {
                this.bossFireAimed();
            } else if (pattern === 'spread') {
                this.bossFireSpread();
            } else if (pattern === 'multi') {
                if (phase === 1) {
                    // Alternate between aimed and spread
                    const cycle = this.boss.getData('attackCycle');
                    if (cycle % 3 === 0) this.bossFireSpread();
                    else this.bossFireAimed();
                    this.boss.setData('attackCycle', cycle + 1);
                } else {
                    // Phase 2: all attacks + ring
                    const cycle = this.boss.getData('attackCycle');
                    if (cycle % 4 === 0) this.bossFireRing();
                    else if (cycle % 4 === 1) this.bossFireSpread();
                    else this.bossFireAimed();
                    this.boss.setData('attackCycle', cycle + 1);
                }
            }
            this.boss.setData('lastShot', time);
        }

        // Update HP bar
        const hp = this.boss.getData('hp');
        const maxHp = this.boss.getData('maxHp');
        this.bossHpFill.scaleX = Math.max(0, hp / maxHp);

        // Wave 3 boss phase transition at 50%
        if (this.currentWave === 3 && this.boss.getData('phase') === 1 && hp <= maxHp * 0.5) {
            this.bossPhaseTwoTransition();
        }
    }

    bossPhaseTwoTransition() {
        this.boss.setData('phase', 2);
        this.boss.setData('fireRate', 400);
        this.boss.setData('moveSpeed', 180);
        this.boss.setData('attackCycle', 0);
        this.boss.setTint(0xff4444); // Red tint to show rage

        // Phase transition explosion
        this.spawnExplosionB(this.boss.x, this.boss.y);
        this.screenShake(8, 300);

        this.announceText.setText('PHASE 2');
        this.announceText.setColor('#ff4444');
        this.announceText.setAlpha(1);
        this.tweens.add({
            targets: this.announceText,
            alpha: 0, duration: 800, delay: 800,
            onComplete: () => { this.announceText.setColor('#ffffff'); }
        });
    }

    bossFireAimed() {
        if (!this.boss || this.gameOver || !this.player.active) return;
        this.enemyFire(this.boss, true, 220 + this.currentWave * 15);
    }

    bossFireSpread() {
        if (!this.boss || this.gameOver) return;
        const bx = this.boss.x;
        const by = this.boss.y + 20;
        const speed = 180 + this.currentWave * 10;
        const angles = [-0.4, -0.2, 0, 0.2, 0.4]; // 5 bullets in a fan
        for (const offset of angles) {
            const angle = Math.PI / 2 + offset; // Downward + spread
            this.spawnEnemyBullet(bx, by, Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
    }

    bossFireRing() {
        if (!this.boss || this.gameOver) return;
        const bx = this.boss.x;
        const by = this.boss.y;
        const speed = 140;
        const count = 12;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            this.spawnEnemyBullet(bx, by, Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
    }

    onBossDefeated() {
        if (!this.bossActive || !this.boss) return; // Prevent double-defeat

        this.bossActive = false;
        this.bossHpBg.setVisible(false);
        this.bossHpFill.setVisible(false);
        this.bossNameText.setVisible(false);

        const bx = this.boss.x;
        const by = this.boss.y;
        this.boss.body.enable = false; // Prevent further physics overlaps
        this.boss.setActive(false).setVisible(false);
        this.boss.destroy();
        this.boss = null;

        // Chain explosions
        for (let i = 0; i < 6; i++) {
            this.time.delayedCall(i * 150, () => {
                const ox = Phaser.Math.Between(-40, 40);
                const oy = Phaser.Math.Between(-40, 40);
                this.spawnExplosionC(bx + ox, by + oy);
            });
        }
        this.screenShake(10, 500);

        this.score += 1000;
        this.scoreText.setText('SCORE: ' + this.score);

        // Clear enemy bullets
        this.enemyBullets.getChildren().forEach(b => {
            if (b.active) {
                this.spawnExplosionF(b.x, b.y);
                b.setActive(false).setVisible(false);
                b.body.stop();
            }
        });

        this.wavePhase = 'complete';
        this.time.delayedCall(1500, () => {
            this.announceText.setText('WAVE ' + this.currentWave + ' CLEAR!');
            this.announceText.setColor('#00ff00');
            this.announceText.setFontSize(28);
            this.announceText.setAlpha(1);
            this.tweens.add({
                targets: this.announceText,
                alpha: 0, duration: 500, delay: 2000,
                onComplete: () => {
                    this.announceText.setColor('#ffffff');
                    if (this.currentWave < 3) {
                        this.transitionToNextWave();
                    } else {
                        this.onVictory();
                    }
                }
            });
        });
    }

    transitionToNextWave() {
        this.wavePhase = 'transition';
        this.currentWave++;
        this.time.delayedCall(1000, () => {
            this.startWave();
        });
    }

    onVictory() {
        this.time.delayedCall(500, () => {
            this.scene.start('Victory', { score: this.score });
        });
    }

    // ════════════════════════════════════════════
    // ENEMY FIRING
    // ════════════════════════════════════════════

    enemyFire(enemy, aimed, speed) {
        if (this.gameOver || !this.player.active) return;
        speed = speed || 200;
        const bx = enemy.x;
        const by = enemy.y + 16;

        if (aimed) {
            const angle = Phaser.Math.Angle.Between(bx, by, this.player.x, this.player.y);
            this.spawnEnemyBullet(bx, by, Math.cos(angle) * speed, Math.sin(angle) * speed);
        } else {
            this.spawnEnemyBullet(bx, by, 0, speed);
        }
    }

    spawnEnemyBullet(x, y, vx, vy) {
        const bullet = this.enemyBullets.get(x, y);
        if (!bullet) return;
        bullet.setActive(true).setVisible(true);
        bullet.setFrame(1); // Pink
        bullet.setScale(3);
        bullet.body.setSize(4, 14);
        bullet.body.reset(x, y);
        bullet.setVelocity(vx, vy);
    }

    updateEnemyFiring(time) {
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active || !enemy.scene || enemy.getData('type') === 'boss') return;
            if (enemy.y < 20 || enemy.y > 600) return;

            const lastShot = enemy.getData('lastShot') || 0;
            const fireRate = enemy.getData('fireRate') || 2000;

            if (time > lastShot + fireRate) {
                const aimed = enemy.getData('type') === 'medium';
                this.enemyFire(enemy, aimed);
                enemy.setData('lastShot', time);
            }
        });
    }

    // ════════════════════════════════════════════
    // ZIGZAG MOVEMENT UPDATE
    // ════════════════════════════════════════════

    updateZigzag(time) {
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active || !enemy.scene || !enemy.getData('zigzag')) return;
            const elapsed = time - (enemy.getData('zigTimer') || time);
            if (elapsed === 0) { enemy.setData('zigTimer', time); return; }
            // Switch direction every 600ms
            if (Math.floor(elapsed / 600) % 2 === 0) {
                enemy.setVelocityX(80 * enemy.getData('zigDir'));
            } else {
                enemy.setVelocityX(-80 * enemy.getData('zigDir'));
            }
        });
    }

    // ════════════════════════════════════════════
    // POWER-UPS
    // ════════════════════════════════════════════

    tryDropPowerup(x, y) {
        if (Math.random() > 0.15) return;
        const isBlue = Math.random() < 0.6;
        const pu = this.powerups.create(x, y, 'power-up');
        pu.setScale(3);
        pu.setData('type', isBlue ? 'weapon' : 'shield');
        pu.play(isBlue ? 'powerup-blue' : 'powerup-red');
        pu.setVelocityY(80);
        pu.body.setSize(12, 12);
    }

    onCollectPowerup(player, pu) {
        const type = pu.getData('type');
        pu.destroy();
        this.score += 50;
        this.scoreText.setText('SCORE: ' + this.score);

        if (type === 'weapon') {
            if (this.weaponLevel < 3) {
                this.weaponLevel++;
                this.showPickupText('WEAPON UP!', '#00aaff');
            }
        } else {
            if (!this.hasShield) {
                this.hasShield = true;
                this.shieldGfx.setVisible(true);
                this.showPickupText('SHIELD!', '#00ff00');
            } else {
                this.lives++;
                this.updateLivesDisplay();
                this.showPickupText('+1 LIFE!', '#ff00ff');
            }
        }
        this.updateWeaponDisplay();
    }

    showPickupText(text, color) {
        const t = this.add.text(this.player.x, this.player.y - 40, text, {
            fontSize: '14px', fontFamily: 'monospace', color: color, fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);
        this.tweens.add({
            targets: t, y: t.y - 40, alpha: 0, duration: 800,
            onComplete: () => t.destroy()
        });
    }

    // ════════════════════════════════════════════
    // PLAYER FIRING
    // ════════════════════════════════════════════

    getFireRate() {
        return this.weaponLevel >= 1 ? 130 : 200;
    }

    fireBullet() {
        const px = this.player.x;
        const py = this.player.y - 20;

        if (this.weaponLevel <= 1) {
            this.spawnPlayerBullet(px, py, 0, -400);
        } else if (this.weaponLevel === 2) {
            this.spawnPlayerBullet(px - 10, py, 0, -400);
            this.spawnPlayerBullet(px + 10, py, 0, -400);
        } else {
            this.spawnPlayerBullet(px, py, 0, -400);
            this.spawnPlayerBullet(px - 8, py, -60, -380);
            this.spawnPlayerBullet(px + 8, py, 60, -380);
        }
    }

    spawnPlayerBullet(x, y, vx, vy) {
        const bullet = this.playerBullets.get(x, y);
        if (!bullet) return;
        bullet.setActive(true).setVisible(true);
        bullet.setFrame(0);
        bullet.setScale(3);
        bullet.body.setSize(4, 14);
        bullet.body.reset(x, y);
        bullet.setVelocity(vx, vy);
    }

    // ════════════════════════════════════════════
    // COLLISION HANDLERS
    // ════════════════════════════════════════════

    onBulletHitEnemy(bullet, enemy) {
        // Guard against destroyed sprites (multiple bullets can overlap in same physics step)
        try { if (!bullet.active || !enemy.active || !enemy.body) return; } catch(e) { return; }

        bullet.setActive(false).setVisible(false);
        bullet.body.stop();

        // Impact spark
        this.spawnExplosionF(bullet.x, bullet.y);

        let hp = (enemy.getData('hp') || 0) - 1;
        enemy.setData('hp', hp);

        if (hp <= 0) {
            const type = enemy.getData('type');
            const scoreVal = enemy.getData('score') || 0;
            const ex = enemy.x;
            const ey = enemy.y;

            if (type === 'boss') {
                this.onBossDefeated();
                return;
            } else if (type === 'medium') {
                this.spawnExplosionA(ex, ey);
            } else {
                this.spawnExplosion(ex, ey);
            }

            this.tryDropPowerup(ex, ey);
            enemy.destroy();
            this.score += scoreVal;
            this.scoreText.setText('SCORE: ' + this.score);
        } else {
            enemy.setTint(0xffffff);
            this.time.delayedCall(60, () => { if (enemy.active && enemy.scene) enemy.clearTint(); });

            // Screen shake on boss hit
            if (enemy.getData('type') === 'boss') {
                this.screenShake(2, 50);
            }
        }
    }

    onEnemyHitPlayer(player, enemy) {
        if (this.isInvincible || !enemy.active) return;
        this.spawnExplosion(enemy.x, enemy.y);
        if (enemy.getData('type') !== 'boss') enemy.destroy();
        this.handlePlayerHit();
    }

    onEnemyBulletHitPlayer(player, bullet) {
        if (this.isInvincible) return;
        this.spawnExplosionF(bullet.x, bullet.y);
        bullet.setActive(false).setVisible(false);
        bullet.body.stop();
        this.handlePlayerHit();
    }

    handlePlayerHit() {
        if (this.hasShield) {
            this.hasShield = false;
            this.shieldGfx.setVisible(false);
            this.startInvincibility();
            this.showPickupText('SHIELD BROKEN!', '#ff6600');
            this.screenShake(3, 100);
            return;
        }

        this.lives--;
        this.weaponLevel = 0;
        this.updateWeaponDisplay();
        this.updateLivesDisplay();
        this.screenShake(5, 200);

        if (this.lives <= 0) {
            this.playerDeath();
        } else {
            this.startInvincibility();
        }
    }

    // ════════════════════════════════════════════
    // UPDATE LOOP
    // ════════════════════════════════════════════

    update(time) {
        if (this.gameOver) return;

        // Parallax scrolling
        this.bgStars.tilePositionY -= 0.5;
        this.bgFarPlanets.tilePositionY -= 0.3;
        this.ringPlanet.y += 0.4;
        this.bigPlanet.y += 0.25;
        if (this.ringPlanet.y > 700) this.ringPlanet.y = -120;
        if (this.bigPlanet.y > 700) this.bigPlanet.y = -200;

        // Player movement
        const speed = 200;
        let vx = 0, vy = 0;
        if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;
        if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;
        this.player.setVelocity(vx, vy);

        if (vx < 0) this.player.play('ship-left', true);
        else if (vx > 0) this.player.play('ship-right', true);
        else this.player.play('ship-idle', true);

        // Shield follows player
        if (this.hasShield) this.shieldGfx.setPosition(this.player.x, this.player.y);

        // Auto-fire
        if (time > this.lastFired + this.getFireRate()) {
            this.fireBullet();
            this.lastFired = time;
        }

        // Wave system
        this.updateWave(time);
        this.updateEnemyFiring(time);
        this.updateZigzag(time);

        // Cleanup
        this.playerBullets.getChildren().forEach(b => {
            if (b.active && (b.y < -16 || b.x < -16 || b.x > 496)) {
                b.setActive(false).setVisible(false); b.body.stop();
            }
        });
        this.enemyBullets.getChildren().forEach(b => {
            if (b.active && (b.y > 660 || b.y < -20 || b.x < -20 || b.x > 500)) {
                b.setActive(false).setVisible(false); b.body.stop();
            }
        });
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.active && enemy.y > 680 && enemy.getData('type') !== 'boss') {
                enemy.destroy();
            }
        });
        this.powerups.getChildren().forEach(pu => {
            if (pu.active && pu.y > 660) pu.destroy();
        });
    }

    // ════════════════════════════════════════════
    // EFFECTS
    // ════════════════════════════════════════════

    spawnExplosion(x, y) {
        const exp = this.add.sprite(x, y, 'explosion-small', 0).setScale(3);
        exp.play('explode-small');
        exp.once('animationcomplete', () => exp.destroy());
    }

    spawnExplosionA(x, y) {
        const exp = this.add.sprite(x, y, 'explosion-a', 0).setScale(2.5);
        exp.play('explode-a');
        exp.once('animationcomplete', () => exp.destroy());
    }

    spawnExplosionB(x, y) {
        const exp = this.add.sprite(x, y, 'explosion-b', 0).setScale(1.5);
        exp.play('explode-b');
        exp.once('animationcomplete', () => exp.destroy());
    }

    spawnExplosionC(x, y) {
        const exp = this.add.sprite(x, y, 'explosion-c', 0).setScale(1.5);
        exp.play('explode-c');
        exp.once('animationcomplete', () => exp.destroy());
    }

    spawnExplosionE(x, y) {
        const exp = this.add.sprite(x, y, 'explosion-e', 0).setScale(0.8);
        exp.play('explode-e');
        exp.once('animationcomplete', () => exp.destroy());
    }

    spawnExplosionF(x, y) {
        const exp = this.add.sprite(x, y, 'explosion-f', 0).setScale(1);
        exp.play('explode-f');
        exp.once('animationcomplete', () => exp.destroy());
    }

    screenShake(intensity, duration) {
        this.cameras.main.shake(duration, intensity / 1000);
    }

    startInvincibility() {
        this.isInvincible = true;
        this.tweens.add({
            targets: this.player,
            alpha: { from: 0.2, to: 1 },
            duration: 100, repeat: 15,
            onComplete: () => {
                this.player.alpha = 1;
                this.isInvincible = false;
            }
        });
    }

    playerDeath() {
        this.gameOver = true;
        // Player death uses shockwave explosion (explosion-e)
        this.spawnExplosionE(this.player.x, this.player.y);
        this.screenShake(10, 500);
        this.player.setVisible(false);
        this.player.body.enable = false;
        this.shieldGfx.setVisible(false);

        this.time.delayedCall(1500, () => {
            this.scene.start('GameOver', { score: this.score });
        });
    }

    updateLivesDisplay() {
        let txt = '';
        for (let i = 0; i < this.lives; i++) txt += '♥ ';
        this.livesText.setText(txt.trim());
    }

    updateWeaponDisplay() {
        if (this.weaponLevel === 0) {
            this.weaponText.setText('');
        } else {
            const labels = ['', 'RAPID FIRE', 'DOUBLE SHOT', 'TRIPLE SHOT'];
            this.weaponText.setText(labels[this.weaponLevel]);
        }
    }
}
