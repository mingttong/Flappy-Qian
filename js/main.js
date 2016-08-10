/**
 * Created by lenovo on 2016/8/10.
 */
var WINDOW_WIDTH = 320;
var WINDOW_HEIGHT = 505;

var game = new Phaser.Game(WINDOW_WIDTH, WINDOW_HEIGHT, Phaser.AUTO, 'game'); // 实例化一个Phaser的游戏实例

game.States = {}; // 创建一个对象来存放要用到的state

// boot场景，用来做一些游戏启动前的准备

game.States.boot = function () {

    this.preload = function () {

        game.load.image('loading', 'assets/preloader.gif'); // 加载进度条图片资源

    };

    this.create = function () {

        game.state.start('preload'); // 加载完成后调用preload场景

    };

};

// preload场景，用来显示资源加载速度

game.States.preload = function () {

    this.preload = function () {

        var preloadSprite = game.add.sprite( 50, game.height/2, 'loading'); // 创建显示loading进度的sprite
        game.load.setPreloadSprite(preloadSprite); // 用setpreloadSprite方法来实现动态进度条的效果

        //以下为要加载的资源
        game.load.image('background', 'assets/background.png'); // 游戏背景
        game.load.image('ground', 'assets/ground.png'); // 地面
        game.load.image('title', 'assets/title.png'); // 游戏标题
        game.load.spritesheet('bird', 'assets/bird.png', 34, 24, 3); // 鸟
        game.load.image('btn', 'assets/start-button.png'); // 按钮
        game.load.spritesheet('pipe', 'assets/pipes.png', 54, 320, 2); // 管道
        game.load.bitmapFont('flappy_font',
            'assets/fonts/flappyfont/flappyfont.png',
            'assets/fonts/flappyfont/flappyfont.fnt'); // 显示分数的数字
        game.load.audio('fly_sound', 'assets/flap.wav'); // 飞翔的音效（#######就是“耶耶！”#######）
        game.load.audio('score_sound', 'assets/score.wav'); // 得分的音效（##########就是最后的“你们啊！Naive!"########)
        game.load.audio('hit_pipe_sound', 'assets/pipe-hit.wav'); // 撞击管道的音效
        game.load.audio('hit_ground_sound', 'assets/ouch.wav'); // 撞击地面的音效
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

        game.add.tileSprite( 0, 0, game.width, game.height, 'background').autoScroll(-10, 0); // 背景图
        game.add.tileSprite(0, game.height - 112, game.width, 112, 'ground').autoScroll(-100, 0); // 地板

        var titleGroup = game.add.group(); // 创建存放标题的组
        titleGroup.create(0, 0, 'title'); // 通过组的create方法创建标题图片并添加到组里
        var bird = titleGroup.create( 190, 10, 'bird'); // 创建bird对象并添加到组里
        bird.animations.add('fly'); // 给鸟添加动画
        bird.animations.play('fly', 12, true); // 播放动画
        titleGroup.x = 35; // 调整组的水平位置
        titleGroup.y = 100; // 调整组的垂直位置
        game.add.tween(titleGroup).to({ y: 120}, 1000, null, true, 0, Number.MAX_VALUE, true); // 对这个组添加一个tween动画，让它不停的上下移动

        // 添加一个按钮

        var btn = game.add.button(game.width/2, game.height/2, 'btn', function(){
            game.state.start('play'); // 点击按钮时跳转到play场景
        });

        btn.anchor.setTo(0.5, 0.5); // 设置按钮的中心点

    }
};

// play场景，正式的游戏部分

game.States.play = function () {

    this.create = function () {

        this.bg = game.add.tileSprite(0, 0, game.width, game.height, 'background'); // 背景图，这里先不用移动，等游戏开始后再移动。
        this.pipeGroup = game.add.group(); // 用于存放管道的组
        this.pipeGroup.enableBody = true;
        this.ground = game.add.tileSprite(0, game.height - 112, game.width, 112, 'ground'); // 地板，这里先不用移动，游戏开始再动
        this.bird = game.add.sprite(50, 150, 'bird'); // 鸟
        this.bird.animations.add('fly'); // 添加动画
        this.bird.animations.play('fly', 12, true); // 播放动画
        this.bird.anchor.setTo(0.5, 0.5); // 设置中心点
        game.physics.enable(this.bird, Phaser.Physics.ARCADE); // 开启鸟的物理系统
        this.bird.body.gravity.y = 0; // 鸟的重力，未开始游戏，先让重力为0，不然鸟会掉下来
        game.physics.enable(this.ground, Phaser.Physics.ARCADE); // 开启地面的物理系统
        this.ground.body.immovable = true; // 让地面在物理环境中固定不动
        this.readyText = game.add.image(game.width/2, 40, 'ready_text'); // get ready文字
        this.playTip = game.add.image(game.width/2, 300, 'play_tip'); // 提示点击屏幕的图片
        this.readyText.anchor.setTo(0.5, 0);
        this.playTip.anchor.setTo(0.5, 0);

        this.hasStarted = false; // 游戏是否开始
        game.time.events.loop(900, this.generatePipes, this); // 利用时钟事件来循环产生管道
        game.time.events.stop(false); // 先不要启动时钟 ##########即使没调用start方法，它也会自动启用，去看一看这是不是一个bug##########
        game.input.onDown.addOnce(this.startGame, this); // 点击屏幕后正式开始游戏

    };

    // 正式开始游戏

    this.startGame = function() {

        this.gameSpeed = 200; // 游戏速度
        this.gameIsOver = false; // 游戏是否已结束的标志
        this.hasHitGround = false; // 是否撞到地面的标志
        this.hasStarted = true; // 游戏是否已经开始的标志
        this.score = 0; // 初始得分
        this.bg.autoScroll(-(this.gameSpeed / 10), 0); // 让背景开始移动
        this.ground.autoScroll(-this.gameSpeed, 0); // 让地面开始移动
        this.bird.body.gravity.y = 1150; // 给鸟设一个重力
        this.readyText.destroy(); // 去除 'get ready'图片
        this.playTip.destroy(); // 去除'玩法提示' 图片
        game.input.onDown.add(this.fly, this); // 给鼠标按下事件绑定鸟的飞翔动作
        game.time.events.start(); // 启动时钟事件，开始制造管道
    };

    // 鸟的飞翔动作

    this.fly = function () {

        this.bird.body.velocity.y = -350; // 飞翔，实质上就是给鸟设一个向上的速度
        game.add.tween(this.bird).to({angle: -30}, 100, null, true, 0, 0, false); // 上升时头朝上的动画
        this.soundFly.play(); // 播放飞翔的音效
    };

    // 管道的生成

    this.generatePipes = function (gap) {

        gap = gap || 100; // 上下管道之间的间隙宽度
        var position = (WINDOW_HEIGHT - WINDOW_WIDTH - gap) + Math.floor( (WINDOW_HEIGHT - 112 - 30 - gap - WINDOW_HEIGHT + WINDOW_WIDTH + gap) * Math.random()); // 计算出一个上下管道之间的间隙随机位置
        var topPipeY = position - 360; // 上方管道的位置
        var bottomPipeY = position + gap; // 下方管道的位置

        if ( this.resetPipe(topPipeY, bottomPipeY)) return; // 如果有除了边界的管道，就给他们重新设定，然后再拿来用，不再制造芯的管道了（精妙啊！）

        var topPipe = game.add.sprite( game.width, topPipeY, 'pipe', 0, this.pipeGroup); // 上方的管道
        var bottomPipe = game.add.sprite( game.width, bottomPipeY, 'pipe', 1, this.pipeGroup); // 下方的管道
        this.pipeGroup.setAll('checkWorldBounds', true); // 边界检测
        this.pipeGroup.setAll('outOfBoundsKill', true); // 出边界后自动kill
        this.pipeGroup.setAll('body.velocity.x', -this.gameSpeed); // 设置管道运动的速度

    }

    // 重置超出边界的管道，回收利用

    this.resetPipe = function (topPipeY, bottomPipeY) {

        var i = 0;
        this.pipeGroup.forEachDead( function (pipe) { // 对组调用forEachDead方法来获取那些已经出了边界，就是“死亡”了的对象

            if (pipe.y <= 0) { // 是上方的管道

                pipe.reset(game.width, topPipeY); // 重置到初始位置
                pipe.hasScored = false; // 重置为为得分

            } else {

                pipe.reset( game.width, bottomPipeY ); // 重置到初始位置

            }

            pipe.body.velocity.x = -this.gameSpeed; // 设置管道速度
            i++;

        }, this);

        return i == 2; // 如果 i==2 代表有一组管道已经出了界

    }

    this.update = function () { // 每一帧中都要执行的代码可以写在update方法中

        if (!this.hasStarted) return; // 游戏未开始，先不执行任何东西

        game.physics.arcade.collide( this.bird, this.ground, this.hitGround, null, this); // 检测与地面的碰撞
        game.physics.arcade.overlap(this.bird, this.pipeGroup, this.hitPipe, null, this); // 检测与管道的碰撞
        if (this.bird.angle < 90) this.bird.angle += 2.5; // 下降时鸟的头朝下
        this.pipeGroup.forEachExists(this.checkScore, this); // 分数检测和更新

    }

    // 分数管理

    this.checkScore = function (pipe) { // 负责分数的检测和更新，pipe表示待检测的管道
        // pipe.hasScored 属性用来标识该管道是否已经得过分
        // pipe.y<0 是指一组管道中的上面那个管道，
        // 当管道的x坐标 加上管道的宽度小于鸟的x坐标时，就表示已经飞过了管道，可以得分了。

        if (!pipe.hasScored && pipe.y <= 0 && pipe.x <= this.bird.x - 17 - 54) {

            pipe.hasScored = true; // 标识为已经得分
            this.scoreText.text = ++this.score; // 更新分数的显示
            this.soundScore.play(); // 得分的音效（############就是“猴啊！”#######）
            return true;

        }

        return false;
    }

};

// 把定义好的场景添加到游戏中
game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('menu', game.States.menu);
game.state.add('play', game.States.play);

// 调用boot场景来启动游戏
game.state.start('boot');
