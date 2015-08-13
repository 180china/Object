GAME.GameScene2 = function ()
{
    GAME.Scene.call(this);
    var _this = this;
    var _isSceneIn = false;
    var _stage1Container,_stage2Container;
    var _pic6,_pic7,_pic8,_pic9,_pic10,_pic11;


    this.init = function ()
    {


    }


    this.sceneIn = function ()
    {
        GAME.Scene.prototype.sceneIn.apply(this);

        initStage1();

        _isSceneIn = true;
    }
    this.update = function ()
    {
        if (!_isSceneIn)return;
    }


    function initStage1()
    {
        _stage1Container = new PIXI.Container();
        _stage1Container.position.x = GAME.stageWidth/2;
        _stage1Container.position.y = GAME.stageHeight/2;
        _this.addChild(_stage1Container);

        _pic6 = PIXI.Sprite.fromFrame("pic6.jpg");
        _pic6.scale.y = _pic6.scale.x=GAME.imageScale;
        _pic6.anchor.x = 0.5;
        _stage1Container.addChild(_pic6);
        _pic6.alpha=0;
        TweenMax.to(_pic6, 1, { alpha: 1,ease:Strong.easeOut,delay:0.6});
        TweenMax.to(_pic6.position, 1, { y: -300*GAME.positionScale,ease:Elastic.easeOut,delay:0.6});

        _pic7 = PIXI.Sprite.fromFrame("pic7.png");
        _pic7.scale.y = _pic7.scale.x=GAME.imageScale;
        _pic7.anchor.x = 0.5;
        _pic7.anchor.y = 0.5;
        _stage1Container.addChild(_pic7);

        _pic7.scale.x=_pic7.scale.y=0;
        TweenMax.to(_pic7.scale, 1, { x: GAME.imageScale, y: GAME.imageScale,ease:Elastic.easeOut,delay:0.8});





        _pic8 = PIXI.Sprite.fromFrame("pic8.png");
        _pic8.anchor.x = 0.5;
        _pic8.anchor.y = 0.5;
        _stage1Container.addChild(_pic8);
        _pic8.position.x=-134*GAME.positionScale;
        _pic8.position.y=-58*GAME.positionScale;
        _pic8.scale.x=_pic8.scale.y=0;
        TweenMax.to(_pic8.scale, 1, { x: GAME.imageScale, y: GAME.imageScale,ease:Elastic.easeOut,delay:0.9});


        _pic9 = PIXI.Sprite.fromFrame("pic9.png");
        _pic9.anchor.x = 0.5;
        _pic9.anchor.y = 0.5;
        _stage1Container.addChild(_pic9);
        _pic9.position.x=-54*GAME.positionScale;
        _pic9.position.y=-128*GAME.positionScale;
        _pic9.scale.x=_pic9.scale.y=0;
        TweenMax.to(_pic9.scale, 1, { x: GAME.imageScale, y: GAME.imageScale,ease:Elastic.easeOut,delay:1});

        _pic10 = PIXI.Sprite.fromFrame("pic10.png");
        _pic10.anchor.x = 0.5;
        _pic10.anchor.y = 0.5;
        _stage1Container.addChild(_pic10);
        _pic10.position.x=61*GAME.positionScale;
        _pic10.position.y=-128*GAME.positionScale;
        _pic10.scale.x=_pic10.scale.y=0;
        TweenMax.to(_pic10.scale, 1, { x: GAME.imageScale, y: GAME.imageScale,ease:Elastic.easeOut,delay:1.1});


        _pic11 = PIXI.Sprite.fromFrame("pic11.png");
        _pic11.anchor.x = 0.5;
        _pic11.anchor.y = 0.5;
        _stage1Container.addChild(_pic11);
        _pic11.position.x=134*GAME.positionScale;
        _pic11.position.y=-58*GAME.positionScale;
        _pic11.scale.x=_pic11.scale.y=0;
        TweenMax.to(_pic11.scale, 1, { x: GAME.imageScale, y: GAME.imageScale,ease:Elastic.easeOut,delay:1.2});



    }




    this.sceneOut = function ()
    {

    }







};
GAME.Utils.inherit(GAME.GameScene2, GAME.Scene);
