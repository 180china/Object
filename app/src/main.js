var view,
    stage,
    renderer,
    gameScene,
    assetsManager,
    logo,
    stats;

var winWidth = $(window).get(0).innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var winHeight = $(window).get(0).innerHeight || document.documentElement.clientHeight || document.body.clientHeight;


$(function() {
    // document.addEventListener('touchmove', function(event){event.preventDefault();}, false);
    init();

    $(window).resize(resizeCanvas);
    resizeCanvas();
});

function resizeCanvas() {
    winWidth = $(window).get(0).innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    winHeight = $(window).get(0).innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    GAME.stageHeight = winHeight > winWidth ? winHeight / winWidth * GAME.stageWidth : winWidth / winHeight * GAME.stageWidth;

    view.style.transformOrigin = "0% 0%";
    if (winWidth < winHeight) {
        let _c = winWidth / GAME.stageWidth;
        view.style.transform = "matrix(" + _c + ", 0, 0, " + _c + ", 0, 0)";
    } else {
        let _c = winHeight / GAME.stageWidth;
        view.style.transform = "matrix(0, " + -_c + ", " + _c + ", 0, 0, " + winHeight + ")";
    }

    setTimeout(resizeCanvas, 600);
}



function init() {
    // stats = new Stats();
    // document.body.appendChild(stats.domElement);

    GAME.stageWidth = 640; //设计图的宽度
    GAME.stageHeight = winHeight > winWidth ? winHeight / winWidth * GAME.stageWidth : winWidth / winHeight * GAME.stageWidth;


    view = document.getElementById('pixi_view');
    renderer = new PIXI.Application({
        width: GAME.stageWidth,
        height: GAME.stageHeight,
        view: view,
        // backgroundColor:0x1099bb,
        transparent: true, //透明背景
    });
    stage = new PIXI.Container();
    renderer.stage.addChild(stage);

    GAME.renderer = renderer;
    GAME.canvas = view;
    GAME.stage = stage;

    assetsManager = new GAME.AssetsManager();
    assetsManager.onComplete = function() {
        TweenMax.to(document.getElementById("loading"), 1, {
            css: {
                alpha: 0
            }
        });
        TweenMax.delayedCall(1, function() {
            $("#loading").hide();
        });
        initScene();
    };
    assetsManager.start();

    animate();
}

function initScene() {
    var _logo = PIXI.Sprite.fromFrame("logo2.png");
    stage.addChild(_logo);

    initScene1();

    PIXI.sound.play('bg', {
        "loop": true
    });
}

function initScene1() {
    PIXI.sound.play("s1");

    gameScene = new GAME.GameScene1();
    stage.addChild(gameScene);
    gameScene.init();
    gameScene.sceneIn();

    gameScene.addEventListener("SCENE_OUT_COMPLETE", function(e) {
        stage.removeChild(gameScene);
        gameScene = null;
        initScene2();
    });
}

function initScene2() {
    PIXI.sound.play("s3");

    gameScene = new GAME.GameScene2();
    stage.addChild(gameScene);
    gameScene.init();
    gameScene.sceneIn();

    gameScene.addEventListener("SCENE_OUT_COMPLETE", function(e) {
        stage.removeChild(gameScene);
        gameScene = null;
        //initScene3();
    });
}

function animate() {
    requestAnimationFrame(animate);

    GAME.renderer.render(GAME.stage);

    if (stats) stats.update();

    if (gameScene) gameScene.update();
};