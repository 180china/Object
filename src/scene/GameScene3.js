GAME.GameScene3 = function ()
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
        TweenMax.to(_pic6.position, 1, { y: -300*GAME.imageScale,ease:Elastic.easeOut,delay:0.6});


    }




    this.sceneOut = function ()
    {

    }







};
GAME.Utils.inherit(GAME.GameScene3, GAME.Scene);
