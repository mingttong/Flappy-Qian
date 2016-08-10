/**
 * Created by lenovo on 2016/8/10.
 */
var game = new Phaser.Game(288, 505, Phaser.AUTO, 'game'); // 实例化一个Phaser的游戏实例

game.States = {}; // 创建一个对象来存放要用到的state

// boot场景，用来做一些游戏启动前的准备

game.States.boot = function () {

    this.preload = function () {

        game.load.image('loading', '../assets/preloader.gif'); // 加载进度条图片资源

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
    }

    this.create = function() {
        game.state.start('menu'); // 当以上所有资源都加载完成后就可以进入menu游戏菜单场景了
    }

};
game.States.menu = function () {
}; // menu场景，游戏菜单
game.States.play = function () {
}; // play场景，正式的游戏部分

// 把定义好的场景添加到游戏中
game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('menu', game.States.menu);
game.state.add('play', game.States.play);
