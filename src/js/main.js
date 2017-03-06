/**
 * Created by lenovo on 2016/8/10.
 */

var SCORESOUNDS_NUM = 19,
    HURTSOUNDS_NUM = 18,
    WINDOW_WIDTH = 480,
    WINDOW_HEIGHT = 700,
    SPEED = 390;

var GRAVITY = 2000,
    FLYSPEED = -500,
    XUEQIAN_WIDTH = 73,
    XUEQIAN_HEIGHT = 83,
    TITLE_WIDTH = 0,
    TITLE_HEIGHT = 0,
    GROUND_HEIGHT = 50,
    GAP = 250,
    PIPE_WIDTH = 52,
    PIPE_HEIGHT = 500,
    POSITION_MIN = GAP / 2 + 35,
    POSITION_MAX = WINDOW_HEIGHT - GAP / 2 - GROUND_HEIGHT - 50;

var TEXT_TIPS = '温馨提示：\n为了不浪费生命，请：\n打开音量，调到最大\n注意周围环境，这很丢脸！';
var TEXT_FONT = '"Segoe UI", "Microsoft YaHei", 宋体, sans-serif';
var TEXT_LOADING = 'Loading...\n\n进程：%s %';

var tipsText,
    loadingText;

var _baseUrl = '';

var currentScoreSound = null,
    currentHurtSound = null,
    scoreSounds = [],
    hurtSounds = [],
    flapSound;

var game = new Phaser.Game(WINDOW_WIDTH, WINDOW_HEIGHT, Phaser.AUTO, 'game'); // 实例化一个Phaser的游戏实例
game.States = {}; // 创建一个对象来存放要用到的state

// boot场景，用来做一些游戏启动前的准备

game.States.boot = function () {

    this.preload = function () {

        if (!game.device.desktop) { // 移动设备适应

            this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
            this.scale.forcePortrait = true;
            this.scale.refresh();

        }

    };

    this.create = function () {

        game.state.start('preload'); // 加载完成后调用preload场景

    };

};


function loadAudio(key, path) {

    game.load.audio(key, [path + '.ogg', path + '.mp3']);

}

function showLoadingText(percent) {

    loadingText.setText(TEXT_LOADING.replace('%s', percent));

}

function initLoadingText() {

    tipsText = game.add.text(
        game.world.width / 2,
        game.world.height / 3,
        TEXT_TIPS,
        {
            font: '16px' + TEXT_FONT,
            fill: '#fff',
            align: 'center'
        }
    );
    tipsText.anchor.setTo(0.5, 0.5);

    loadingText = game.add.text(
        game.world.width / 2,
        game.world.height / 2,
        '',
        {
            font: '24px' + TEXT_FONT,
            fill: '#f00',
            align: 'center'
        }
    );
    loadingText.anchor.setTo(0.5, 0.5);
    showLoadingText(0);

}

// preload场景，用来显示资源加载速度

game.States.preload = function () {

    this.preload = function () {

        initLoadingText();

        game.load.onFileComplete.add(showLoadingText);

        //以下为要加载的资源
        game.load.image('background', 'assets/background.jpg'); // 游戏背景
        game.load.image('ground', 'assets/ground.png'); // 地面
        game.load.image('title', 'assets/title.png'); // 游戏标题
        game.load.spritesheet('bird', 'assets/qian.png', XUEQIAN_WIDTH, XUEQIAN_HEIGHT); // 鸟
        game.load.image('startBtn', 'assets/start-button.png'); // 按钮
        game.load.image('replayBtn', 'assets/give-me-five.png');
        game.load.spritesheet('pipe', 'assets/pipes.png', PIPE_WIDTH, PIPE_HEIGHT, 2); // 管道
        game.load.bitmapFont('flappy_font',
            'assets/fonts/flappyfont/flappyfont.png',
            'assets/fonts/flappyfont/flappyfont.fnt'); // 显示分数的数字

        loadAudio('flap', _baseUrl + 'sounds/flap');

        for (var i = 1; i <= SCORESOUNDS_NUM; i++) {

            loadAudio('score' + i, _baseUrl + 'sounds/score' + i);

        }

        for (var i = 1; i <= HURTSOUNDS_NUM; i++) {

            loadAudio('hurt' + i, _baseUrl + 'sounds/hurt' + i);

        }

        game.load.image('ready_text', 'assets/get-ready.png'); // get ready图片
        game.load.image('play_tip', 'assets/instructions.png'); // 玩法提示图片
        game.load.image('game_over', 'assets/gameover.png'); // gameover图片
        game.load.image('score_board', 'assets/scoreboard.png'); // 得分板
    };

    this.create = function () {
        game.state.start('menu'); // 当以上所有资源都加载完成后就可以进入menu游戏菜单场景了
    }

};

// menu场景，游戏菜单

game.States.menu = function () {

    this.create = function () {

        game.add.tileSprite(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT, 'background').autoScroll(-10, 0); // 背景图
        game.add.tileSprite(0, WINDOW_HEIGHT - GROUND_HEIGHT, WINDOW_WIDTH, GROUND_HEIGHT, 'ground').autoScroll(-100, 0); // 地板

        var titleGroup = game.add.group(); // 创建存放标题的组
        var title = titleGroup.create(0, 0, 'title'); // 通过组的create方法创建标题图片并添加到组里
        var bird = titleGroup.create((title.width - XUEQIAN_WIDTH) / 2, title.height + 30, 'bird', 1); // 创建bird对象并添加到组里
        var titl_y = WINDOW_HEIGHT / 5;
        titleGroup.x = (WINDOW_WIDTH - title.width) / 2; // 调整组的水平位置
        titleGroup.y = titl_y; // 调整组的垂直位置
        game.add.tween(titleGroup).to({y: titl_y + 50}, 1000, null, true, 0, Number.MAX_VALUE, true); // 对这个组添加一个tween动画，让它不停的上下移动

        // 添加一个按钮

        var startBtn = game.add.button(WINDOW_WIDTH / 2, WINDOW_HEIGHT * 2 / 3, 'startBtn', function () {
            game.state.start('play'); // 点击按钮时跳转到play场景
        });

        startBtn.anchor.setTo(0.5, 0.5); // 设置按钮的中心点

    }
};

function initSounds(result, key, len, volume) {

    volume = volume || 1;

    for (var i = 1; i <= len; i++) {

        result.push(game.add.audio(key + i, volume));

    }

}

function randomPlaySound(list, sounds_num) {

    var sound;

    if (sounds_num == 1) {

        sound = list[0];

    } else if (sounds_num > 1) {

        sound = list[selectFrom(1, sounds_num) - 1];
        sound.play();

    }

    return sound;

}

function playScoreSound() {

    if (currentScoreSound) {

        currentScoreSound.stop();

    }

    currentScoreSound = randomPlaySound(scoreSounds, SCORESOUNDS_NUM);

    //console.log(currentScoreSound);

}

function playHurtSound() {

    if (currentScoreSound) {

        currentScoreSound.stop();

    }

    if (currentHurtSound) return;

    currentHurtSound = randomPlaySound(hurtSounds, HURTSOUNDS_NUM);

    //console.log(currentHurtSound);

}

function playFlapSound() {

    if (!flapSound.isPlaying) {

        flapSound.play();

    }

}

// play场景，正式的游戏部分

game.States.play = function () {

    this.create = function () {

        this.bg = game.add.tileSprite(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT, 'background'); // 背景图，这里先不用移动，等游戏开始后再移动。
        this.pipeGroup = game.add.group(); // 用于存放管道的组
        this.pipeGroup.enableBody = true;
        this.ground = game.add.tileSprite(0, WINDOW_HEIGHT - GROUND_HEIGHT, WINDOW_WIDTH, GROUND_HEIGHT, 'ground'); // 地板，这里先不用移动，游戏开始再动
        this.bird = game.add.sprite(150, 300, 'bird', 0); // 鸟
        this.bird.animations.add('bird', [0, 1, 2], 60); // 添加上升动画
        this.bird.anchor.setTo(0.5, 0.5); // 设置中心点
        game.physics.enable(this.bird, Phaser.Physics.ARCADE); // 开启鸟的物理系统
        this.bird.body.gravity.y = 0; // 鸟的重力，未开始游戏，先让重力为0，不然鸟会掉下来
        game.physics.enable(this.ground, Phaser.Physics.ARCADE); // 开启地面的物理系统
        this.ground.body.immovable = true; // 让地面在物理环境中固定不动

        flapSound = game.add.audio('flap', 0.2);

        initSounds(scoreSounds, 'score', SCORESOUNDS_NUM, 1);
        initSounds(hurtSounds, 'hurt', HURTSOUNDS_NUM, 1);

        this.readyText = game.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 5, 'ready_text'); // get ready文字
        this.playTip = game.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT * 2 / 3, 'play_tip'); // 提示点击屏幕的图片
        this.readyText.anchor.setTo(0.5, 0);
        this.playTip.anchor.setTo(0.5, 0);

        this.hasStarted = false; // 游戏是否开始
        game.time.events.loop(3500, this.generatePipes, this); // 利用时钟事件来循环产生管道
        game.time.events.stop(false); // 先不要启动时钟 ##########即使没调用start方法，它也会自动启用，去看一看这是不是一个bug##########
        game.input.onDown.addOnce(this.startGame, this); // 点击屏幕后正式开始游戏

    };

    this.update = function () { // 每一帧中都要执行的代码可以写在update方法中

        if (!this.hasStarted) return; // 游戏未开始，先不执行任何东西

        game.physics.arcade.collide(this.bird, this.ground, this.hitGround, null, this); // 检测与地面的碰撞
        game.physics.arcade.overlap(this.bird, this.pipeGroup, this.hitPipe, null, this); // 检测与管道的碰撞
        this.bird.body.collideWorldBounds = true;

        // 来一个夸张的下落
        if (this.gameIsOver) {

            this.bird.frame = 2;
            this.bird.angle = -30;

        } else if (this.bird.body.velocity.y > 0) {

            this.bird.frame = 0;
            this.bird.angle = 0;

        } else {

            this.bird.frame = 1;
            this.bird.angle = 0;

        }

        this.pipeGroup.forEachExists(this.checkScore, this); // 分数检测和更新

    };

    // 正式开始游戏

    this.startGame = function () {

        this.gameSpeed = SPEED; // 游戏速度
        this.gameIsOver = false; // 游戏是否已结束的标志
        this.hasHitGround = false; // 是否撞到地面的标志
        this.hasStarted = true; // 游戏是否已经开始的标志
        this.scoreText = game.add.bitmapText(WINDOW_WIDTH / 2, 30, 'flappy_font', '0', 36);
        this.score = 0; // 初始得分
        this.bg.autoScroll(-(this.gameSpeed / 10), 0); // 让背景开始移动
        this.ground.autoScroll(-this.gameSpeed, 0); // 让地面开始移动
        this.bird.body.gravity.y = GRAVITY; // 给鸟设一个重力
        this.readyText.destroy(); // 去除 'get ready'图片
        this.playTip.destroy(); // 去除'玩法提示' 图片
        game.input.onDown.add(this.fly, this); // 给鼠标按下事件绑定鸟的飞翔动作
        game.time.events.start(); // 启动时钟事件，开始制造管道
    };

    this.stopGame = function () {

        this.bg.stopScroll();
        this.ground.stopScroll();
        this.pipeGroup.forEachExists(function (pipe) {
            pipe.body.velocity.x = 0;
        }, this);
        //this.bird.animations.stop('fly', 0);
        game.input.onDown.remove(this.fly, this);
        game.time.events.stop(true);

    };

    // 鸟的飞翔动作

    this.fly = function () {

        this.bird.body.velocity.y = FLYSPEED; // 飞翔，实质上就是给鸟设一个向上的速度
        playFlapSound();

    };

    this.hitPipe = function () {

        if (this.gameIsOver) return; // ###################???
        //this.soundHitPipe.play();
        this.bird.body.gravity.y = 5 * GRAVITY;
        this.gameOver();

    };

    this.hitGround = function () {

        if (this.hasHitGround) return; // ##################???
        this.hasHitGround = true;
        this.gameOver(true);

    };

    this.gameOver = function (show_text) {

        playHurtSound();
        this.gameIsOver = true;
        this.stopGame();
        if (show_text) this.showGameOverText();

    };

    this.showGameOverText = function () {

        this.scoreText.destroy();
        game.bestScore = game.bestScore || 0;

        if (this.score > game.bestScore)  game.bestScore = this.score; // 最好分数

        this.gameOverGroup = game.add.group(); // 添加一个gameOverGroup组
        var gameOverText = this.gameOverGroup.create(WINDOW_WIDTH / 2, 0, 'game_over'); // game over 文字图片
        var scoreboard = this.gameOverGroup.create(WINDOW_WIDTH / 2, 100, 'score_board'); // 分数板
        var currentScoreText = game.add.bitmapText(WINDOW_WIDTH / 2 + 35, 305, 'flappy_font', this.score + ' ', 20, this.gameOverGroup);
        var bestScoreText = game.add.bitmapText(WINDOW_WIDTH / 2 + 35, 343, 'flappy_font', game.bestScore + ' ', 20, this.gameOverGroup);
        var replayBtn = game.add.button(WINDOW_WIDTH * 4 / 5, 90, 'replayBtn', function () { // 重玩按钮
            currentHurtSound.stop();
            currentHurtSound = null;
            game.state.start('play');
        }, this, null, null, null, null, this.gameOverGroup);
        gameOverText.anchor.setTo(0.5, 0);
        scoreboard.anchor.setTo(0.5, 0);
        replayBtn.anchor.setTo(0.5, 0);
        this.gameOverGroup.y = WINDOW_HEIGHT / 10;

    };

    // 管道的生成

    this.generatePipes = function (gap) {

        gap = gap || GAP; // 上下管道之间的间隙宽度

        var position = selectFrom(POSITION_MIN, POSITION_MAX);
        var topPipeY = position - (gap / 2 + PIPE_HEIGHT);
        var bottomPipeY = position + gap / 2;

        if (this.resetPipe(topPipeY, bottomPipeY)) return; // 如果有除了边界的管道，就给他们重新设定，然后再拿来用，不再制造芯的管道了（精妙啊！）

        var topPipe = game.add.sprite(WINDOW_WIDTH, topPipeY, 'pipe', 0, this.pipeGroup); // 上方的管道
        var bottomPipe = game.add.sprite(WINDOW_WIDTH, bottomPipeY, 'pipe', 1, this.pipeGroup); // 下方的管道
        this.pipeGroup.setAll('checkWorldBounds', true); // 边界检测
        this.pipeGroup.setAll('outOfBoundsKill', true); // 出边界后自动kill
        this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed); // 设置管道运动的速度

    };

    // 重置超出边界的管道，回收利用

    this.resetPipe = function (topPipeY, bottomPipeY) {

        var i = 0;
        this.pipeGroup.forEachDead(function (pipe) { // 对组调用forEachDead方法来获取那些已经出了边界，就是“死亡”了的对象

            if (pipe.y <= 0) { // 是上方的管道

                pipe.reset(WINDOW_WIDTH, topPipeY); // 重置到初始位置
                pipe.hasScored = false; // 重置为为得分

            } else {

                pipe.reset(WINDOW_WIDTH, bottomPipeY); // 重置到初始位置

            }

            pipe.body.velocity.x = -this.gameSpeed; // 设置管道速度
            i++;

        }, this);

        return i == 2; // 如果 i==2 代表有一组管道已经出了界

    }

    // 分数管理

    this.checkScore = function (pipe) { // 负责分数的检测和更新，pipe表示待检测的管道
        // pipe.hasScored 属性用来标识该管道是否已经得过分
        // pipe.y<0 是指一组管道中的上面那个管道，
        // 当管道的x坐标 加上管道的宽度小于鸟的x坐标时，就表示已经飞过了管道，可以得分了。

        if (!pipe.hasScored && pipe.y <= 0 && pipe.x <= this.bird.x - 17 - PIPE_WIDTH) {

            pipe.hasScored = true; // 标识为已经得分
            this.scoreText.text = ++this.score; // 更新分数的显示
            playScoreSound();
            //this.soundScore.play(); // 得分的音效（############就是“猴啊！”#######）
            return true;

        }

        return false;
    }

};

function selectFrom(lowValue, highValue) {

    var choice = highValue - lowValue + 1;

    return Math.floor(Math.random() * choice + lowValue);

}

// 把定义好的场景添加到游戏中
game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('menu', game.States.menu);
game.state.add('play', game.States.play);

// 调用boot场景来启动游戏
game.state.start('boot');
