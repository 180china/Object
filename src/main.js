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
    {src: "sound/bg.mp3", id: "bg"},
    {src: "sound/s1.mp3", id: "s1"},
    {src: "sound/s2.mp3", id: "s2"},
    {src: "sound/s3.mp3", id: "s3"}
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
    _logo.scale.set(GAME.imageScale);
    _logo.x=GAME.stageWidth-_logo.width;
    stage.addChild(_logo);

    var _btn1= new PIXI.Text("Scene1", { font: "26px Helvetica", fill: "#000" });
    _btn1.anchor.y=1;
    _btn1.y=GAME.stageHeight;
    _btn1.x=100*GAME.positionScale;
    stage.addChild(_btn1);

    var _btn2= new PIXI.Text("Scene2", { font: "26px Helvetica", fill: "#000" });
    _btn2.anchor.y=1;
    _btn2.y=GAME.stageHeight;
    _btn2.x=300*GAME.positionScale;
    stage.addChild(_btn2);

    var _btn3= new PIXI.Text("Scene3", { font: "26px Helvetica", fill: "#000" });
    _btn3.anchor.y=1;
    _btn3.y=GAME.stageHeight;
    _btn3.x=500*GAME.positionScale;
    stage.addChild(_btn3);


    _btn1.interactive = true;
    _btn1.mousedown = _btn1.touchstart = function ()
    {
        removeSceneTo(1);
    }

    _btn2.interactive = true;
    _btn2.mousedown = _btn2.touchstart = function ()
    {
        removeSceneTo(2);
    }

    _btn3.interactive = true;
    _btn3.mousedown = _btn3.touchstart = function ()
    {
        removeSceneTo(3);
    }


    initScene1();
}


function removeSceneTo(num)
{
    if(gameScene)
    {
        gameScene.sceneOut();
        gameScene.addEventListener(GAME.SCENE_OUT_COMPLETE,function(e)
        {
            stage.removeChild(gameScene);
            gameScene=null;
            if(num==1)initScene1();
            if(num==2)initScene2();
            if(num==3)initScene3();
        });
    }
}


function initScene1()
{
    H5Sound.play("s1",1);
    gameScene=new GAME.GameScene1();
    stage.addChildAt(gameScene,0);

    gameScene.init();
    gameScene.sceneIn();

    gameScene.addEventListener(GAME.GO_SCENE3,function(e)
    {
        console.log(e);
        removeSceneTo(3);
    });
}

function initScene2()
{
    H5Sound.play("s3",1);
    gameScene=new GAME.GameScene2();
    stage.addChildAt(gameScene,0);

    gameScene.init();
    gameScene.sceneIn();
}


function initScene3()
{
    gameScene=new GAME.GameScene3();
    stage.addChildAt(gameScene,0);

    gameScene.init();
    gameScene.sceneIn();
}


function animate()
{
    requestAnimationFrame(animate);
    GAME.renderer.render(GAME.stage);
    if(stats)stats.update();
    if(gameScene)gameScene.update();


};

