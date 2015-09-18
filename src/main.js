var test;
var view,stage,renderer,gameScene,assetsManager,logo,stats;
$(document).ready(function()
{
    document.addEventListener('touchmove', function(event){event.preventDefault();}, false);

    var devicePixelRatio = window.devicePixelRatio || 1;
    var iits=1/devicePixelRatio;
    $("#viewport")[0].content="width=device-width,initial-scale="+iits.toString()+" minimum-scale="+iits.toString()+", maximum-scale="+iits.toString();

    $(window).resize(resizeCanvas);
    resizeCanvas();

    init();
    initStatsBar();
});
function resizeCanvas()
{
    var winWidth=$(window).get(0).innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
    var winHeight=$(window).get(0).innerHeight||document.documentElement.clientHeight||document.body.clientHeight;
    GAME.stageWidth=winWidth;
    GAME.stageHeight=winHeight;

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
    renderer = PIXI.autoDetectRenderer(GAME.stageWidth, GAME.stageHeight,{
        backgroundColor : 0x1099bb
    });
    GAME.renderer = renderer;


    view=renderer.view;
    view.style.position="absolute";
    view.style.top = '0px';
    view.style.left = '0px';
    GAME.canvas = view;

    document.body.appendChild(view);

    stage = new PIXI.Container();
    GAME.stage = stage;

    //////////////////
    GAME.imageScale = GAME.stageWidth/640;
    GAME.positionScale=1*GAME.imageScale;
    /////////////////

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

    /////////////////initSound
    var sounds = [
    {src: "sound/s1.mp3", id: "s1"},
    {src: "sound/s2.mp3", id: "s2"},
    {src: "sound/s3.mp3", id: "s3"},
    {src: "sound/bg.mp3", id: "bg"}
    ];
    H5Sound.load(sounds,soundLoadComplete);

    function soundLoadComplete()
    {
        H5Sound.play("bg",0);

        assetsManager.start();
        animate();
    }
    //////////////
}



function initScene()
{
    var _logo = PIXI.Sprite.fromFrame("logo2.png");
    _logo.scale.y = _logo.scale.x=GAME.imageScale;
    stage.addChild(_logo);

    initScene1();

}



function initScene1()
{
    H5Sound.play("s1",1);
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
    H5Sound.play("s3",1);
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

