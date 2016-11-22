GAME.GameScene1 = function ()
{
    GAME.Scene.call(this);
    var _this = this;
    var _isSceneIn = false;
    var _background;
    var _stage1Container,_stage2Container;
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
        _stage1Container = new PIXI.Container();
        _stage1Container.position.x = GAME.stageWidth/2;
        _stage1Container.position.y = GAME.stageHeight;
        _this.addChild(_stage1Container);


        _t1 = PIXI.Sprite.fromFrame("t1.png");
        _t1.scale.y = _t1.scale.x=GAME.imageScale;
        _t1.anchor.x = 0.5;
        _stage1Container.addChild(_t1);
        _t1.position.y=-GAME.stageHeight;
        _t1.alpha=0;
        TweenMax.to(_t1, 1, { alpha: 1,ease:Strong.easeOut,delay:0.6});



        _txt1= new PIXI.Text("Text1", { font: "50px Helvetica", fill: "#FFFFFF" });
        _stage1Container.addChild(_txt1);
        _txt1.anchor.x = 0.5;
        _txt1.anchor.y = 1;
        _txt1.alpha=0;
        TweenMax.to(_txt1, 1, { alpha: 1,ease:Strong.easeOut,delay:1});
        TweenMax.to(_txt1.position, 1, { y: -460*GAME.positionScale,ease:Elastic.easeOut,delay:0.8});

        _txt1.rotation = -0.05;
        TweenMax.to(_txt1, 0.1, { rotation: 0.1,ease:Linear.easeNone,repeat:-1,yoyo:true,delay:2});



        var _mask = new PIXI.Graphics();
        _mask.lineStyle(0);
        _mask.beginFill(0x000, 1);
        _mask.drawCircle(0, 0, 50);
        _stage1Container.addChild(_mask);
        _mask.position.y = -460*GAME.positionScale;
        _txt1.mask = _mask;







        _pic1 = PIXI.Sprite.fromFrame("pic1.jpg");
        _pic1.scale.y = _pic1.scale.x=GAME.imageScale;
        _pic1.anchor.x = 0.5;
        _pic1.anchor.y = 1;
        _stage1Container.addChild(_pic1);
        _pic1.alpha=0;
        TweenMax.to(_pic1, 1, { alpha: 1,ease:Strong.easeOut,delay:1});
        TweenMax.to(_pic1.position, 1, { y: Math.floor(-350*GAME.positionScale),ease:Elastic.easeOut,delay:1});


        _pic2 = PIXI.Sprite.fromFrame("pic2.jpg");
        _pic2.scale.y = _pic2.scale.x=GAME.imageScale;
        _pic2.anchor.x = 0.5;
        _pic2.anchor.y = 1;
        _stage1Container.addChild(_pic2);
        _pic2.alpha=0;
        TweenMax.to(_pic2, 1, { alpha: 1,ease:Strong.easeOut,delay:1.2});
        TweenMax.to(_pic2.position, 1, { y: Math.floor(-210*GAME.positionScale),ease:Elastic.easeOut,delay:1.2});


        _btn1 = PIXI.Sprite.fromFrame("btn1.png");
        _btn1.scale.y = _btn1.scale.x=GAME.imageScale;
        _btn1.anchor.x = 0.5;
        _btn1.anchor.y = 1;
        _stage1Container.addChild(_btn1);
        _btn1.alpha=0;
        TweenMax.to(_btn1, 1, { alpha: 1,ease:Strong.easeOut,delay:1.4});
        TweenMax.to(_btn1.position, 1, { y: -20*GAME.positionScale,ease:Elastic.easeOut,delay:1.4});



        _btn1.interactive = true;
        _btn1.mousedown = _btn1.touchstart = function ()
        {
            removeStage1();
            initStage2(); 
        }

    }




    function removeStage1()
    {
        TweenMax.to(_stage1Container, 0.4, { alpha: 0,
            onComplete:function()
            {
                _this.removeChild(_stage1Container);
                _stage1Container=null;
            }
        });
    }



    function initStage2()
    {
        H5Sound.play("s2",1);
        _stage2Container = new PIXI.Container();
        _this.addChild(_stage2Container);


        _pic4 = PIXI.Sprite.fromFrame("pic4.jpg");
        _pic4.scale.y = _pic4.scale.x=GAME.imageScale;
        _pic4.position.x=0;
        _pic4.position.y=100*GAME.positionScale;
        _stage2Container.addChild(_pic4);
        _pic4.alpha=0;
        TweenMax.to(_pic4, 0.6, {alpha: 1});


        _pic5 = PIXI.Sprite.fromFrame("pic5.png");
        _pic5.scale.y = _pic5.scale.x=GAME.imageScale;
        _pic5.anchor.x = 0.5;
        _pic5.anchor.y = 0.5;
        _pic5.position.x=GAME.stageWidth/2;
        _pic5.position.y=GAME.stageHeight/2;
        _stage2Container.addChild(_pic5);
        _pic5.scale.x=_pic5.scale.y=0;
        TweenMax.to(_pic5.scale, 1, { x: GAME.imageScale, y: GAME.imageScale,ease:Elastic.easeOut,delay:0.8});

        _btn2 = PIXI.Sprite.fromFrame("btn2.jpg");
        _btn2.scale.y = _btn2.scale.x=GAME.imageScale;
        _btn2.anchor.x = 0.5;
        _btn2.anchor.y = 0.5;
        _btn2.position.x=GAME.stageWidth/2;
        _btn2.position.y=_pic5.position.y+240*GAME.positionScale;
        _stage2Container.addChild(_btn2);
        _btn2.scale.x=_btn2.scale.y=0;
        TweenMax.to(_btn2.scale, 1, { x: GAME.imageScale, y: GAME.imageScale,ease:Elastic.easeOut,delay:0.9});

        _btn2.interactive = true;
        _btn2.mousedown = _btn2.touchstart = function ()
        {
            _this.sceneOut()
        }
    }



    this.sceneOut = function ()
    {
        GAME.Scene.prototype.sceneIn.apply(this);
        TweenMax.to(this, 0.4, {alpha:0,
            onComplete:function(){_this.sceneOutComplete()}
        });
    }







};
GAME.Utils.inherit(GAME.GameScene1, GAME.Scene);
