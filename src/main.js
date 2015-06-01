var view,stage,renderer,loading,gameScene,assetsManager,logo,initTimer,_background;
var isStarted=false;
$(document).ready(function()
{
    document.addEventListener('touchmove', function(event){event.preventDefault();}, false);

    GAME.imageScale=1;
    $("#viewport")[0].content="width=device-width, user-scalable=no, minimum-scale=0.5, maximum-scale=0.5";

    resizeCanvas();
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

    initStatsBar();
    init();
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

    view=renderer.view
    view.width=GAME.stageWidth;
    view.height=GAME.stageHeight;
    GAME.canvas = view;

    document.body.appendChild(view);


    stage = new PIXI.Container();
    GAME.stage = stage;

    showLoading();
    animate();
}

function showLoading()
{
    loading=new GAME.LoadingScene();
    loading.init();
    loading.addEventListener(GAME.SCENE_OUT_COMPLETE,function(e)
    {
        stage.removeChild(loading);
        loading=null;
        initScene();

    });
    stage.addChild(loading);
    loading.sceneIn();

    assetsManager=new GAME.AssetsManager();
    assetsManager.onComplete=function()
    {
        loading.sceneOut();
    };

    //load sound
    GAME.Sound.load(GAME.SoundConfig, function() {
        if(!isStarted)
        {
            assetsManager.start();
            console.log('start');
            isStarted=true;
        }

    });
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
    if(loading)
    {
        loading.update();
        return;
    };
    if(gameScene)gameScene.update();

};

