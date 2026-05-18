function createGoombas() {
    this.goombasGroup = this.add.group();
    const numGoombas = Math.trunc(worldWidth / 960);

    for (let i = 0; i < numGoombas; i++) {
        const x = generateRandomCoordinate(true);
        const goomba = createGoomba.call(this, x);

        this.goombasGroup.add(goomba);
        setupGoombaCollisions.call(this, goomba);
    }

    setupGroupCollisions.call(this);
    setInterval(clearGoombas.bind(this), 250);
}

function createGoomba(x) {
    const goomba = this.physics.add.sprite(x, screenHeight - platformHeight, 'goomba')
        .setOrigin(0.5, 1)
        .setBounce(1, 0)
        .setScale(screenHeight / 376);

    goomba.anims.play('goomba-walk', true);
    goomba.smoothed = true;
    goomba.depth = 2;
    goomba.setVelocityX(Phaser.Math.Between(0, 10) <= 4 ? goombasVelocityX : -goombasVelocityX);
    goomba.setMaxVelocity(goombasVelocityX, levelGravity);

    return goomba;
}

function setupGoombaCollisions(goomba) {
    const platformPieces = this.platformGroup.getChildren();
    const blocks = this.blocksGroup.getChildren();
    const misteryBlocks = this.misteryBlocksGroup.getChildren();
    const goombas = this.goombasGroup.getChildren();

    this.physics.add.collider(goomba, platformPieces);
    this.physics.add.collider(goomba, blocks);
    this.physics.add.collider(goomba, misteryBlocks);
    this.physics.add.collider(goomba, goombas);
    this.physics.add.collider(goomba, this.finalFlagMast);
    this.physics.add.overlap(player, goomba, checkGoombaCollision, null, this);
}

function setupGroupCollisions() {
    const goombas = this.goombasGroup.getChildren();
    const immovableBlocks = this.immovableBlocksGroup.getChildren();
    const fallProtection = this.fallProtectionGroup.getChildren();

    this.physics.add.collider(goombas, immovableBlocks);
    this.physics.add.collider(goombas, fallProtection);
    this.physics.add.collider(goombas, this.finalTrigger);
}

function checkGoombaCollision(player, goomba) {
    if (goomba.dead || flagRaised) return;

    const goombaBeingStomped = player.body.touching.down && goomba.body.touching.up;

    if (playerInvulnerable && !goombaBeingStomped) return;

    if (goombaBeingStomped) {
        stompGoomba.call(this, goomba, player);
    } else {
        decreasePlayerState.call(this);
    }
}

function stompGoomba(goomba, player) {
    goomba.anims.play('goomba-hurt', true);
    goomba.body.enable = false;
    this.goombasGroup.remove(goomba);
    this.goombaStompSound.play();
    player.setVelocityY(-velocityY / 1.5);
    addToScore.call(this, 100, goomba);

    setTimeout(() => {
        this.tweens.add({ targets: goomba, duration: 300, alpha: 0 });
    }, 200);
    setTimeout(() => {
        goomba.destroy();
    }, 500);
}

function clearGoombas() {
    const goombas = this.goombasGroup.getChildren();

    for (const goomba of goombas) {
        const velocityX = goomba.body.velocity.x;
        if (velocityX === 0 || Math.abs(velocityX) !== goombasVelocityX) {
            this.goombasGroup.remove(goomba);
            goomba.destroy();
        }
    }
}
