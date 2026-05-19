function createGoombas() {
    this.goombasGroup = this.add.group();
    const numGoombas = Math.trunc(worldWidth / 550);

    for (let i = 0; i < numGoombas; i++) {
        const x = generateRandomCoordinate(true);
        const goomba = createGoomba.call(this, x);

        this.goombasGroup.add(goomba);
        setupGoombaCollisions.call(this, goomba);
    }

    setInterval(clearGoombas.bind(this), 250);
}

function createSlimes() {
    this.slimesGroup = this.add.group();
    const numSlimes = Math.trunc(worldWidth / 700);

    for (let i = 0; i < numSlimes; i++) {
        const x = generateRandomCoordinate(true);
        const slime = createSlime.call(this, x);

        this.slimesGroup.add(slime);
        setupSlimeCollisions.call(this, slime);
    }

    setupGroupCollisions.call(this);
    setInterval(clearSlimes.bind(this), 250);
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

function createSlime(x) {
    const slime = this.physics.add.sprite(x, screenHeight - platformHeight, 'Slime')
        .setOrigin(0.5, 4)
        .setBounce(1, 1)
        .setScale(screenHeight / 376);

    slime.anims.play('slime-walk', true);
    slime.smoothed = true;
    slime.depth = 2;
    slime.setVelocityX(Phaser.Math.Between(0, 10) <= 4 ? slimesVelocityX : -slimesVelocityX);
    slime.setMaxVelocity(slimesVelocityX, levelGravity);

    return slime;
}

function setupGoombaCollisions(goomba) {
    const platformPieces = this.platformGroup.getChildren();
    const blocks = this.blocksGroup.getChildren();
    const misteryBlocksCoin = this.misteryBlocksGroupCoin.getChildren();
    const misteryBlocksMushroom = this.misteryBlocksGroupMushroom.getChildren();
    const misteryBlocksFireflower = this.misteryBlocksGroupFireflower.getChildren();
    const goombas = this.goombasGroup.getChildren();

    this.physics.add.collider(goomba, platformPieces);
    this.physics.add.collider(goomba, blocks);
    this.physics.add.collider(goomba, misteryBlocksCoin);
    this.physics.add.collider(goomba, misteryBlocksMushroom);
    this.physics.add.collider(goomba, misteryBlocksFireflower);
    this.physics.add.collider(goomba, goombas);
    this.physics.add.collider(goomba, this.finalFlagMast);
    this.physics.add.overlap(player, goomba, checkGoombaCollision, null, this);
}

function setupSlimeCollisions(slime) {
    const platformPieces = this.platformGroup.getChildren();
    const blocks = this.blocksGroup.getChildren();
    const misteryBlocksCoin = this.misteryBlocksGroupCoin.getChildren();
    const misteryBlocksMushroom = this.misteryBlocksGroupMushroom.getChildren();
    const misteryBlocksFireflower = this.misteryBlocksGroupFireflower.getChildren();
    const slimes = this.slimesGroup.getChildren();

    this.physics.add.collider(slime, platformPieces);
    this.physics.add.collider(slime, blocks);
    this.physics.add.collider(slime, misteryBlocksCoin);
    this.physics.add.collider(slime, misteryBlocksMushroom);
    this.physics.add.collider(slime, misteryBlocksFireflower);
    this.physics.add.collider(slime, slimes);
    this.physics.add.collider(slime, this.finalFlagMast);
    this.physics.add.overlap(player, slime, checkSlimeCollision, null, this);
}

function setupGroupCollisions() {
    const goombas = this.goombasGroup.getChildren();
    const slimes = this.slimesGroup.getChildren();
    const immovableBlocks = this.immovableBlocksGroup.getChildren();
    const fallProtection = this.fallProtectionGroup.getChildren();

    this.physics.add.collider(goombas, immovableBlocks);
    this.physics.add.collider(slimes, immovableBlocks);
    this.physics.add.collider(goombas, fallProtection);
    this.physics.add.collider(slimes, fallProtection);
    this.physics.add.collider(goombas, this.finalTrigger);
    this.physics.add.collider(slimes, this.finalTrigger);
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

function checkSlimeCollision(player, slime) {
    if (slime.dead || flagRaised) return;

    const slimeBeingStomped = player.body.touching.down && slime.body.touching.up;

    if (playerInvulnerable && !slimeBeingStomped) return;

    if (slimeBeingStomped) {
        stompSlime.call(this, slime, player);
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

function stompSlime(slime, player) {
    slime.anims.play('slime-hurt', true);
    slime.body.enable = false;
    this.slimesGroup.remove(slime);

    player.setVelocityY(-velocityY / 1.5);
    addToScore.call(this, 150, slime);

    setTimeout(() => {
        this.tweens.add({ targets: slime, duration: 300, alpha: 0 });
    }, 200);
    setTimeout(() => {
        slime.destroy();
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

function clearSlimes() {
    const slimes = this.slimesGroup.getChildren();

    for (const slime of slimes) {
        const velocityX = slime.body.velocity.x;
        if (velocityX === 0 || Math.abs(velocityX) !== slimesVelocityX) {
            this.slimesGroup.remove(slime);
            slime.destroy();
        }
    }
}
