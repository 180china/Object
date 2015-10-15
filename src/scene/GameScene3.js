GAME.GameScene3 = function ()
{
    GAME.Scene.call(this);
    var _this = this;
    var _isSceneIn = false;
    var _background;
    var _stage1Container;
    var _pic1,_pic2,_pic4,_pic5,_pic6;
    var _btn1,_btn2;
    var _txt1;
    var _t1;


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
        H5Sound.play("s2",1);
        _stage1Container = new PIXI.Container();
        _this.addChild(_stage1Container);


        _pic4 = PIXI.Sprite.fromFrame("pic4.jpg");
        _pic4.scale.y = _pic4.scale.x=GAME.imageScale;
        _pic4.position.x=0;
        _pic4.position.y=100*GAME.positionScale;
        _stage1Container.addChild(_pic4);
        _pic4.alpha=0;
        TweenMax.to(_pic4, 0.6, {alpha: 1});


        _pic5 = PIXI.Sprite.fromFrame("pic5.png");
        _pic5.scale.y = _pic5.scale.x=GAME.imageScale;
        _pic5.anchor.x = 0.5;
        _pic5.anchor.y = 0.5;
        _pic5.position.x=GAME.stageWidth/2;
        _pic5.position.y=GAME.stageHeight/2;
        _stage1Container.addChild(_pic5);
        _pic5.scale.x=_pic5.scale.y=0;
        TweenMax.to(_pic5.scale, 1, { x: GAME.imageScale, y: GAME.imageScale,ease:Elastic.easeOut,delay:0.8});

        _btn2 = PIXI.Sprite.fromFrame("btn2.jpg");
        _btn2.scale.y = _btn2.scale.x=GAME.imageScale;
        _btn2.anchor.x = 0.5;
        _btn2.anchor.y = 0.5;
        _btn2.position.x=GAME.stageWidth/2;
        _btn2.position.y=_pic5.position.y+240*GAME.positionScale;
        _stage1Container.addChild(_btn2);
        _btn2.scale.x=_btn2.scale.y=0;
        TweenMax.to(_btn2.scale, 1, { x: GAME.imageScale, y: GAME.imageScale,ease:Elastic.easeOut,delay:0.9});

        _txt1= new PIXI.Text("Scene3", { font: "30px Helvetica", fill: "#FFFFFF" });
        _stage1Container.addChild(_txt1);
        _txt1.anchor.x = 0.5;
        _txt1.anchor.y = 1;
        _txt1.alpha=0;
        TweenMax.to(_txt1, 1, { alpha: 1,ease:Strong.easeOut,delay:1});
        TweenMax.to(_txt1.position, 1, {x:GAME.stageWidth/2, y: 300*GAME.positionScale,ease:Elastic.easeOut,delay:0.8});

        _txt1.rotation = -0.05;
        TweenMax.to(_txt1, 0.1, { rotation: 0.1,ease:Linear.easeNone,repeat:-1,yoyo:true,delay:2});
    }


    this.sceneOut = function ()
    {
        GAME.Scene.prototype.sceneOut.apply(this);
        TweenMax.to(this, 0.4, {alpha:0,
            onComplete:function(){_this.sceneOutComplete()}
        });
    }


};
GAME.Utils.inherit(GAME.GameScene3, GAME.Scene);
