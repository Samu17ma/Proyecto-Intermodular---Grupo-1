const specialCharMap = { 8: 'BACKSPACE', 9: 'TAB', 13: 'ENTER', 16: 'SHIFT', 17: 'CTRL', 18: 'ALT', 20: 'CAPS', 27: 'ESCAPE', 32: 'SPACE', 33: 'PAGE UP', 34: 'PAGE DOWN', 35: 'END', 36: 'HOME', 37: '←', 38: '↑', 39: '→', 40: '↓', 45: 'INSERT', 46: 'DELETE', 112: 'F1', 113: 'F2', 114: 'F3', 115: 'F4', 116: 'F5', 117: 'F6', 118: 'F7', 119: 'F8', 120: 'F9', 121: 'F10', 122: 'F11', 123: 'F12', 192: 'Ñ', 219: '?', 220: '¿' };
const displayChar = charCode => specialCharMap[charCode] || String.fromCharCode(charCode);

let keydownHandler;

function showSettings() {
    if (!this.settingsMenuOpen) {
        this.settingsMenuOpen = true;
        player.anims.play('idle', true);
        playerBlocked = true;
        player.setVelocityX(0);
        this.overworldSound.pause();
        this.pauseSound.play();
        drawSettingsMenu.call(this);
    }
}

function hideSettings() {
    this.settingsMenuObjects.getChildren().forEach(obj => obj.visible = false);
    this.overworldSound.resume();
    playerBlocked = false;
    applySettings.call(this);
    this.settingsMenuOpen = false;
}

function drawSettingsMenu() {
    if (this.settingsMenuCreated) {
        this.settingsMenuObjects.getChildren().forEach(obj => obj.visible = true);
        return;
    }

    this.settingsMenuCreated = true;
    this.settingsMenuObjects = this.add.group();

    const settingsBackground = this.add.rectangle(0, screenHeight / 2, worldWidth, screenHeight, 0x171717, 0.95).setScrollFactor(0);
    settingsBackground.depth = 4;
    this.settingsMenuObjects.add(settingsBackground);

    const createTextButton = (x, y, text, fontSize, callback) => {
        let button = this.add.text(x, y, text, { fontFamily: 'pixel_nums', fontSize: fontSize, align: 'center' }).setInteractive();
        button.depth = 5;
        if (callback) button.on('pointerdown', callback);
        this.settingsMenuObjects.add(button);
    };

    createTextButton.call(this, screenWidth * 0.94, screenHeight * 0.1, 'x', screenWidth / 50, () => hideSettings.call(this));
    createTextButton.call(this, screenWidth / 6, screenHeight * 0.15, 'Settings', screenWidth / 45, null);

    const createCheckbox = (x, y, label, settingKey) => {
        const checkbox = this.add.rexCheckbox(x, y, screenWidth / 40, screenWidth / 40, {
            color: 0x323232,
            checked: localStorage.getItem(settingKey) === 'true',
            animationDuration: 150
        });
        checkbox.depth = 5;
        this.settingsMenuObjects.add(checkbox);
        checkbox.on('valuechange', () => localStorage.setItem(settingKey, checkbox.checked));
        createTextButton.call(this, x + screenWidth / 15, y, label, screenWidth / 55, () => checkbox.toggleChecked());
    };

    createCheckbox.call(this, screenWidth / 10, screenHeight / 2.9, 'Music', 'music-enabled');
    createCheckbox.call(this, screenWidth / 10, screenHeight / 2.3, 'Effects', 'effects-enabled');

    const sliderDot = this.add.circle(screenWidth / 5.15, screenHeight / 1.6, screenWidth / 115, 0xffffff, 0.75);
    sliderDot.slider = this.plugins.get('rexsliderplugin').add(sliderDot, {
        endPoints: [{ x: sliderDot.x - screenWidth / 9.5, y: sliderDot.y }, { x: sliderDot.x + screenWidth / 9.5, y: sliderDot.y }],
        value: localStorage.getItem('volume') ? localStorage.getItem('volume') / 100 : 0.69
    });
    sliderDot.depth = 5;
    this.settingsMenuObjects.add(sliderDot);

    const sliderBar = this.add.graphics();
    sliderBar.lineStyle(5, 0x373737, 1).strokePoints(sliderDot.slider.endPoints).depth = 4;
    this.settingsMenuObjects.add(sliderBar);

    createTextButton.call(this, screenWidth / 5.15, screenHeight / 1.85, 'General volume', screenWidth / 60, null);
    const sliderPercentageText = this.add.text(screenWidth / 5.15, screenHeight / 1.5, Math.trunc(sliderDot.slider.value * 100), { fontFamily: 'pixel_nums', fontSize: screenWidth / 80, align: 'center' }).setOrigin(0.5, 0);
    sliderPercentageText.depth = 5;
    this.settingsMenuObjects.add(sliderPercentageText);

    sliderDot.slider.on('valuechange', () => {
        sliderPercentageText.setText(Math.trunc(sliderDot.slider.value * 100));
        localStorage.setItem('volume', Math.trunc(sliderDot.slider.value * 100));
    });

    const createControlButton = (x, y, label, control, animation) => {
        const controlText = this.add.text(x, y, displayChar(controlKeys[control].keyCode), { fontFamily: 'pixel_nums', fontSize: screenWidth / 55, align: 'center' }).setInteractive().setOrigin(0.5, 0.4).setDepth(5);
        const controlIcon = this.add.sprite(x, y + screenHeight / 25, label).setScale(screenHeight / 500).setOrigin(0.5).anims.play(animation, true).setDepth(5);
        this.settingsMenuObjects.add(controlText);
        this.settingsMenuObjects.add(controlIcon);

        controlText.on('pointerdown', () => {
            controlText.setText('...');
            keydownHandler = event => {
                document.removeEventListener('keydown', keydownHandler);
                let key = event.keyCode;
                if (Object.values(controlKeys).some(({ keyCode }) => keyCode === key)) {
                    alert('Key is already in use!');
                    controlText.setText(displayChar(controlKeys[control].keyCode));
                    return;
                }
                controlKeys[control] = this.input.keyboard.addKey(key);
                controlText.setText(displayChar(controlKeys[control].keyCode));
                localStorage.setItem(control, controlKeys[control].keyCode);
            };
            document.addEventListener('keydown', keydownHandler);
        });
    };

    createControlButton.call(this, screenWidth / 1.37, screenHeight / 2.25, 'mario', 'JUMP', 'jump');
    createControlButton.call(this, screenWidth / 1.37, screenHeight / 1.75, 'mario-grown', 'DOWN', 'grown-mario-crouch');
    createControlButton.call(this, screenWidth / 1.5, screenHeight / 1.75, 'mario', 'LEFT', 'idle');
    createControlButton.call(this, screenWidth / 1.26, screenHeight / 1.75, 'mario', 'RIGHT', 'idle');
    createControlButton.call(this, screenWidth / 1.65, screenHeight / 2.5, 'fireball', 'FIRE', 'fireball-right-down');
}

function applySettings() {
    this.sound.volume = localStorage.getItem('volume') ? localStorage.getItem('volume') / 100 : 0.69;

    const applyMute = (group, key) => {
        const isMuted = localStorage.getItem(key) === 'false';
        group.getChildren().forEach(elem => elem.setMute(isMuted));
    };

    //applyMute(this.musicGroup, 'music-enabled');
    //applyMute(this.effectsGroup, 'effects-enabled');
}
