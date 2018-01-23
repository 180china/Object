var view,
    stage,
    renderer,
    gameScene,
    assetsManager,
    logo,
    stats;

var winWidth,
    winHeight;

$(function(){
    // document.addEventListener('touchmove', function(event){event.preventDefault();}, false);

    $(window).resize(resizeCanvas);
    resizeCanvas();

    init();
    initStatsBar();
});

function resizeCanvas()
{
    winWidth=$(window).get(0).innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
    winHeight=$(window).get(0).innerHeight||document.documentElement.clientHeight||document.body.clientHeight;

    //此处可以解决 进入h5在横屏不加载的问题。
    if(winHeight>winWidth && !view)
    {
        //init();
        $("html,body").scrollLeft(0);
    }
}


function initStatsBar()
{
    stats = new Stats();
    document.body.appendChild(stats.domElement);
}


function init() {
    var dpr = window.devicePixelRatio || 1;
    /*
     * 缩放适配方案
     * 1、宽高比例不变
     * 2、canvas width=640，高度等比例设置（winWidth/winHeight=640/x)
     * 3、canvas css(width=winWidth,height=winHeight)
     * */

    var stageWidth=640;//设计图的宽度

    GAME.stageWidth=stageWidth;
    GAME.stageHeight=(stageWidth*winHeight)/winWidth;

    view=document.getElementById('pixi_view');
    view.style.width=winWidth+'px';
    view.style.height=winHeight+'px';

    renderer = new PIXI.Application({
        width:GAME.stageWidth,
        height:GAME.stageHeight,
        view:view,
        // backgroundColor:0x1099bb,
        transparent: true, //透明背景
    });
    stage = new PIXI.Container();
    renderer.stage.addChild(stage);

    GAME.renderer = renderer;
    GAME.canvas = view;
    GAME.stage = stage;

    assetsManager=new GAME.AssetsManager();
    assetsManager.onComplete=function()
    {
        TweenMax.to(document.getElementById("loading"),1,{css:{alpha:0}});
        TweenMax.delayedCall(1,function()
        {
            $("#loading").hide();
        });
        initScene();
    };
    assetsManager.start();
    animate();

}



function initScene() {
    var _logo = PIXI.Sprite.fromFrame("logo2.png");
    // _logo.scale.y = _logo.scale.x = GAME.imageScale;
    stage.addChild(_logo);

    initScene1();

    // PIXI.sound.play('bg', {
    //     "loop": true
    // });

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