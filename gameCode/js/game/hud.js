function createHUD() {
    let posY = screenWidth / 23;
    let fontSize = screenWidth / 65;

    this.scoreText = this.add.text(screenWidth / 40, posY, '', { fontFamily: 'pixel_nums', fontSize: fontSize, align: 'left' })
        .setScrollFactor(0).setDepth(5);

    this.highScoreText = this.add.text(screenWidth / 2, posY, 'HIGH SCORE\n 000000', { fontFamily: 'pixel_nums', fontSize: fontSize, align: 'center' })
        .setOrigin(0.5, 0).setScrollFactor(0).setDepth(5);

    this.timeLeftText = this.add.text(screenWidth * 0.925, posY, 'TIME\n' + timeLeft.toString().padStart(3, '0'), 
        { fontFamily: 'pixel_nums', fontSize: fontSize, align: 'right' }).setScrollFactor(0).setDepth(5);

    let localHighScore = localStorage.getItem('high-score');
    if (localHighScore !== null) {
        this.highScoreText.setText('HIGH SCORE\n' + localHighScore.toString().padStart(6, '0'));
    }

    updateScore.call(this);
}

function updateScore() {
    if (!this.scoreText) return;
    this.scoreText.setText('MARIO\n' + score.toString().padStart(6, '0'));
}

function updateTimer() {
    if (!this.timeLeftText || timeLeft <= 0 || this.timeLeftText.stopped || playerBlocked) return;

    if (timeLeft == 100) {
        this.overworldSound.stop();
        this.undergroundSound.stop();
        this.timeWarningSound.play();
        setTimeout(() => this.hurryUpSound.play(), 2400);
    }

    if (!this.timeLeftText.stopped) {
        timeLeft--;
        this.timeLeftText.setText('TIME\n' + timeLeft.toString().padStart(3, '0'));
    }

    setTimeout(() => updateTimer.call(this), 500);
}

function addToScore(num, originObject) {
    for (let i = 1; i <= num; i++) {
        setTimeout(() => {
            score++;
            updateScore.call(this);
        }, i);
    }

    if (!originObject) return;

    const textEffect = this.add.text(originObject.getBounds().x, originObject.getBounds().y, num, {
        fontFamily: 'pixel_nums',
        fontSize: screenWidth / 150,
        align: 'center'
    }).setOrigin(0).setDepth(5);

    this.tweens.add({
        targets: textEffect,
        duration: 600,
        y: textEffect.y - screenHeight / 6.5,
        onComplete: () => {
            this.tweens.add({
                targets: textEffect,
                duration: 100,
                alpha: 0,
                onComplete: () => textEffect.destroy()
            });
        }
    });
}

function gameOverScreen(outOfTime = false) {
    let highScore = localStorage.getItem('high-score');
    if (highScore === null || score > highScore) {
        localStorage.setItem('high-score', score);
        this.highScoreText.setText('NEW HIGH SCORE!\n' + score.toString().padStart(6, '0'));
    }

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    let gameOverScreen = this.add.rectangle(0, screenHeight / 2, worldWidth, screenHeight, 0x000000)
        .setScrollFactor(0).setAlpha(0).setDepth(4);

    this.tweens.add({ targets: gameOverScreen, duration: 200, alpha: 1 });

    this.add.bitmapText(screenCenterX, screenHeight / 3, 'carrier_command', outOfTime ? 'TIME UP' : 'GAME OVER', screenWidth / 30)
        .setOrigin(0.5).setDepth(5);
    this.add.bitmapText(screenCenterX, screenHeight / 2, 'carrier_command', '> PLAY AGAIN', screenWidth / 50)
        .setOrigin(0.5).setInteractive().on('pointerdown', () => location.reload()).setDepth(5);
    this.add.bitmapText(screenCenterX, screenHeight / 1.7, 'carrier_command', '> SCREENSHOT', screenWidth / 50)
        .setOrigin(0.5).setInteractive().on('pointerdown', () => getScreenshot()).setDepth(5);
}

function gameOverFunc() {
    this.timeLeftText.stopped = true;
    player.anims.play('hurt', true);
    player.body.enable = false;
    this.finalFlagMast.body.enable = false;

    [
        ...this.goombasGroup.getChildren(), 
        ...this.slimesGroup.getChildren(),
        ...this.platformGroup.getChildren(), 
        ...this.blocksGroup.getChildren(), 
        ...this.misteryBlocksGroupCoin.getChildren(), 
        ...this.misteryBlocksGroupMushroom.getChildren(), 
        ...this.misteryBlocksGroupFireflower.getChildren(), 
        ...this.immovableBlocksGroup.getChildren(), 
        ...this.constructionBlocksGroup.getChildren()  ]
        .forEach(obj => { obj.anims?.stop(); obj.body.enable = false; });

    player.body.setSize(16, 16).setOffset(0).setVelocityX(0);
    setTimeout(() => {
        player.body.enable = true;
        player.setVelocityY(-velocityY * 1.1);
    }, 500);

    this.overworldSound.stop();
    this.undergroundSound.stop();
    this.hurryUpSound.stop();
    this.gameOverSound.play();

    setTimeout(() => {
        player.depth = 0;
        gameOverScreen.call(this, timeLeft <= 0);
        this.physics.pause();
    }, 3000);
}

function winScreen() {
    let highScore = localStorage.getItem('high-score');
    if (highScore === null || score > highScore) {
        localStorage.setItem('high-score', score);
        this.highScoreText.setText('NEW HIGH SCORE!\n' + score.toString().padStart(6, '0'));
    }

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    let winScreen = this.add.rectangle(0, screenHeight / 2, worldWidth, screenHeight, 0x000000)
        .setScrollFactor(0).setAlpha(0).setDepth(4);

    this.tweens.add({ targets: winScreen, duration: 300, alpha: 1 });

    this.add.bitmapText(screenCenterX, screenHeight / 3, 'carrier_command', 'YOU WON!', screenWidth / 30)
        .setOrigin(0.5).setDepth(5);
    this.add.bitmapText(screenCenterX, screenHeight / 2, 'carrier_command', '> PLAY AGAIN', screenWidth / 50)
        .setOrigin(0.5).setInteractive().on('pointerdown', () => location.reload()).setDepth(5);
    this.add.bitmapText(screenCenterX, screenHeight / 1.7, 'carrier_command', '> SCREENSHOT', screenWidth / 50)
        .setOrigin(0.5).setInteractive().on('pointerdown', () => getScreenshot()).setDepth(5);
}
