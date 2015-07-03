var view,stage,renderer,loading,gameScene,assetsManager,logo,stats,_background;
var isStarted=false;
$(document).ready(function()
{
    GAME.imageScale=1;
    if(GAME.Utils.isAndroid())
    {
        $("#viewport")[0].content="width=device-width, user-scalable=no, minimum-scale=1, maximum-scale=1";
    }else {
        $("#viewport")[0].content="width=device-width, user-scalable=no, minimum-scale=0.5, maximum-scale=0.5";
    }
    
    $(window).resize(resizeCanvas);
    resizeCanvas();

    //initStatsBar();
    init();
});
function resizeCanvas()
{
    var winWidth=$(window).get(0).innerWidth;
    var winHeight=$(window).get(0).innerHeight;
    if(winWidth>winHeight)
    {
        $("#landscape").width(winWidth);
        $("#landscape").height(winHeight);
        $("#landscape").show();
        return;
    }
    if(view)
    {
        $("#landscape").hide();
        $("html,body").scrollLeft(0);
        return;
    }
    GAME.stageWidth=winWidth;
    GAME.stageHeight=winHeight;
}
function initStatsBar()
{
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
};
function init()
{
    renderer = PIXI.autoDetectRenderer(GAME.stageWidth, GAME.stageHeight,{backgroundColor : 0x1099bb});
    GAME.renderer = renderer;

    view=renderer.view;
    view.width=GAME.stageWidth;
    view.height=GAME.stageHeight;
    view.style.position="absolute";
    view.style.top = '0px';
    view.style.left = '0px';
    GAME.canvas = view;

    document.body.appendChild(view);


    stage = new PIXI.Container();
    GAME.stage = stage;


    assetsManager=new GAME.AssetsManager();
    assetsManager.onComplete=function()
    {
        initScene();
        $("#loading").hide();
    };
    assetsManager.start();
    animate();
}


function initScene()
{
    /////////////////////////
    GAME.imageScale= GAME.stageWidth/640;
    ///////////////////////

    _background = PIXI.Sprite.fromFrame("bg.png");
    _background.height = GAME.stageHeight;
    _background.width = GAME.stageWidth;
    stage.addChild(_background);

    _background.alpha=0;
    TweenMax.to(_background, 1, { alpha: 1});

    initScene1();
}

function initScene1()
{
    gameScene=new GAME.GameScene1();
    stage.addChild(gameScene);

    gameScene.init();
    gameScene.sceneIn();


    gameScene.addEventListener(GAME.SCENE_OUT_COMPLETE,function(e)
    {
        stage.removeChild(gameScene);
        gameScene=null;
        initScene2();
    });
}

function initScene2()
{
    gameScene=new GAME.GameScene2();
    stage.addChild(gameScene);

    gameScene.init();
    gameScene.sceneIn();


    gameScene.addEventListener(GAME.SCENE_OUT_COMPLETE,function(e)
    {
        stage.removeChild(gameScene);
        gameScene=null;
        //initScene3();
    });
}



function animate()
{
    requestAnimationFrame(animate);
    GAME.renderer.render(GAME.stage);
    if(stats)stats.update();
    if(gameScene)gameScene.update();

};

