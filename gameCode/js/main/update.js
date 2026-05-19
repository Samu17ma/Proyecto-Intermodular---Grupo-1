function update(delta) {
    if (gameOver || gameWinned) return;

    updatePlayer.call(this, delta);

    const playerVelocityX = player.body.velocity.x;
    const camera = this.cameras.main;

    if (playerVelocityX > 0 && shouldFollowPlayer(camera)) {
        camera.startFollow(player, true, 0.1, 0.05);
        camera.isFollowing = true;
    }

    if (playerVelocityX < 0 && shouldStopFollowingPlayer(camera)) {
        furthestPlayerPos = player.x;
        camera.setBounds(camera.worldView.x, 0, worldWidth, screenHeight);
        camera.stopFollow();
        camera.isFollowing = false;
    }

    if (shouldStopFollowingAtEnd(camera)) {
        reachedLevelEnd = true;
        camera.stopFollow();
    }
}

function shouldFollowPlayer(camera) {
    return levelStarted && !reachedLevelEnd && !camera.isFollowing &&
           player.x >= screenWidth * 1.5 &&
           player.x >= (camera.worldView.x + camera.width / 2);
}

function shouldStopFollowingPlayer(camera) {
    return furthestPlayerPos < player.x && levelStarted && !reachedLevelEnd && camera.isFollowing;
}

function shouldStopFollowingAtEnd(camera) {
    return !reachedLevelEnd && !isLevelOverworld && camera.isFollowing &&
           player.x >= worldWidth - screenWidth * 1.5;
}

// Function to start the level
function startLevel(player, trigger) {
    if (!player.body.blocked.right && !trigger.body.blocked.left) return;

    this.powerDownSound.play();
    this.physics.world.setBounds(screenWidth, 0, worldWidth, screenHeight);
    applyPlayerInvulnerability.call(this, 4000);

    playerBlocked = true;
    player.setVelocityX(5);
    player.anims.play('run', true).flipX = false;

    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.hereWeGoSound.play();

    setTimeout(() => {
        if (!isLevelOverworld) {
            player.y = screenHeight / 5;
            this.overworldSound.stop();
            this.undergroundSound.play({ loop: -1 });
        }

        player.x = screenWidth * 1.1;
        this.cameras.main.pan(screenWidth * 1.5, 0, 0);
        playerBlocked = false;
        this.cameras.main.fadeIn(500, 0, 0, 0);
        createHUD.call(this);
        updateTimer.call(this);
        this.startScreenTrigger.destroy();
        levelStarted = true;
        if (this.settingsMenuOpen) hideSettings.call(this);
    }, 1100);
}

// Function to teleport the player to the level end
function teleportToLevelEnd(player, trigger) {
    if (!player.body.blocked.right && !trigger.body.blocked.left) return;

    playerBlocked = true;
    this.cameras.main.stopFollow();
    this.powerDownSound.play();

    this.tweens.add({
        targets: player,
        duration: 75,
        alpha: 0
    });

    this.cameras.main.fadeOut(450, 0, 0, 0);
    player.anims.play(playerState > 0 ? (playerState == 1 ? 'grown-mario-run' : 'fire-mario-run') : 'run', true).flipX = false;

    this.undergroundRoof.destroy();

    setTimeout(() => {
        this.physics.world.setBounds(worldWidth - screenWidth, 0, worldWidth, screenHeight);
        this.tpTube = this.add.tileSprite(worldWidth - screenWidth / 1.089, screenHeight - platformHeight, 32, 32, 'vertical-medium-tube')
            .setScale(screenHeight / 345)
            .setOrigin(1)
            .setDepth(4);

        this.physics.add.existing(this.tpTube);
        this.tpTube.body.allowGravity = false;
        this.tpTube.body.immovable = true;
        this.physics.add.collider(player, this.tpTube);

        this.add.rectangle(worldWidth - screenWidth, 0, worldWidth, screenHeight, 0x8585FF)
            .setOrigin(0)
            .setDepth(-1);

        this.add.tileSprite(worldWidth - screenWidth, screenHeight, screenWidth, platformHeight, 'start-floor-bricks')
            .setScale(2)
            .setOrigin(0, 0.5)
            .setDepth(2);
    }, 500);

    setTimeout(() => {
        player.alpha = 1;
        player.x = worldWidth - screenWidth / 1.08;
        this.cameras.main.pan(worldWidth - screenWidth / 2, 0, 0);
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.powerDownSound.play();
        this.finalTrigger.destroy();

        this.tweens.add({
            targets: player,
            duration: 500,
            y: this.tpTube.getBounds().y
        });

        setTimeout(() => {
            playerBlocked = false;
        }, 500);
    }, 1100);
}

// Function to raise the flag at the end of the level
function raiseFlag() {
    if (flagRaised) return false;

    this.cameras.main.stopFollow();
    this.timeLeftText.stopped = true;
    this.overworldSound.stop();
    this.undergroundSound.stop();
    this.hurryUpSound.stop();
    this.flagpoleSound.play();

    this.tweens.add({
        targets: this.finalFlag,
        duration: 1000,
        y: screenHeight / 2.2
    });

    setTimeout(() => {
        this.winSound.play();
    }, 1000);

    flagRaised = true;
    playerBlocked = true;
    addToScore.call(this, 2000, player);

    return false;
}

// Function to handle consuming a mushroom power-up
function consumeMushroom(player, mushroom) {
    if (gameOver || gameWinned) return;

    this.consumePowerUpSound.play();
    addToScore.call(this, 1000, mushroom);
    mushroom.destroy();

    if (playerState > 0) return;

    playerBlocked = true;
    this.anims.pauseAll();
    this.physics.pause();
    player.setTint(0xfefefe).anims.play('grown-mario-idle');
    player.body.setSize(14, 32).setOffset(2, 0);

    let i = 0;
    let interval = setInterval(() => {
        i++;
        player.anims.play(i % 2 === 0 ? 'grown-mario-idle' : 'idle');
        if (i > 5) {
            clearInterval(interval);
            player.clearTint();
        }
    }, 100);

    setTimeout(() => { 
        this.physics.resume();
        this.anims.resumeAll();
        playerBlocked = false;
        playerState = 1;
        updateTimer.call(this);
    }, 1000);
}

// Function to handle consuming a fireflower power-up
function consumeFireflower(player, fireFlower) {
    if (gameOver || gameWinned) return;

    this.consumePowerUpSound.play();
    addToScore.call(this, 1000, fireFlower);
    fireFlower.destroy();

    if (playerState > 1) return;

    let anim = playerState > 0 ? 'grown-mario-idle' : 'idle';
    playerBlocked = true;
    this.anims.pauseAll();
    this.physics.pause();

    player.setTint(0xfefefe).anims.play('fire-mario-idle');
    player.body.setSize(14, 32).setOffset(2, 0);

    let i = 0;
    let interval = setInterval(() => {
        i++;
        player.anims.play(i % 2 === 0 ? 'fire-mario-idle' : anim);
        if (i > 5) {
            clearInterval(interval);
            player.clearTint();
        }
    }, 100);

    setTimeout(() => { 
        this.physics.resume();
        this.anims.resumeAll();
        playerBlocked = false;
        playerState = 2;
        updateTimer.call(this);
    }, 1000);
}

// Function to handle collecting a coin
function collectCoin(player, coin) {
    this.coinSound.play();
    addToScore.call(this, 200);
    coin.destroy();
}
