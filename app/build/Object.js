
var GAME = GAME || {};
GAME.stageWidth=0;
GAME.stageHeight=0;
GAME.stage=null;
GAME.canvas=null;
GAME.renderer=null;
GAME.SCENE_IN="sceneIn";
GAME.SCENE_OUT="sceneOut";
GAME.SCENE_IN_COMPLETE="sceneInComplete";
GAME.SCENE_OUT_COMPLETE="sceneOutComplete";
GAME.ON_ENTER_FRAME="onEnterFrame";
GAME.retinaSupport=true;

GAME.imageScale=1;
GAME.positionScale=1;
GAME.Utils=GAME.Utils||{};
GAME.Utils.inherit = function(ctor, superCtor)
{
    ctor.superClass = superCtor;
    ctor.prototype = Object.create(superCtor.prototype);
    ctor.prototype.constructor = ctor;
};
GAME.Utils.extend = function(origin, add)
{
    // Don't do anything if add isn't an object
    if (!add || typeof add !== 'object')
        return origin;

    var keys = Object.keys(add);
    var i = keys.length;
    while (i--)
    {
        origin[keys[i]] = add[keys[i]];
    }
    return origin;
};
GAME.Utils.isAndroid=function()
{
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "SymbianOS", "Windows Phone");
    var flag = false;
    for (var v = 0; v < Agents.length; v++)
    {
        if (userAgentInfo.indexOf(Agents[v]) > 0)
        {
            flag = true;
            break;
        }
    }
    return flag;
}

GAME.Utils.isM2=function()
{
    var userAgentInfo = navigator.userAgent;
    var flag = false;
    if (userAgentInfo.indexOf("m2") > 0)
    {
        flag = true;
    }
    return flag;
}

/**
 * @author waterTian
 */
GAME.EventDispatcher = function() {}
GAME.EventDispatcher.prototype = {
	constructor: GAME.EventDispatcher,
	addEventListener: function(type, listener) {
		if (!this._listeners) {
			this._listeners = {};
		} else {
			this.removeEventListener(type, listener);
		}

		if (!this._listeners[type]) this._listeners[type] = []
		this._listeners[type].push(listener);

		return listener;
	},

	hasEventListener: function(type, listener) {
		var listeners = this._listeners;
		return !!(listeners && listeners[type]);
	},

	removeEventListener: function(type, listener) {
		if (!this._listeners) return;
		if (!this._listeners[type]) return;

		var arr = this._listeners[type];
		for (var i = 0, l = arr.length; i < l; i++) {
			if (arr[i] == listener) {
				if (l == 1) {
					delete(this._listeners[type]);
				}
				// allows for faster checks.
				else {
					arr.splice(i, 1);
				}
				break;
			}
		}
	},
	removeAllEventListeners: function(type) {
		if (!type)
			this._listeners = null;
		else if (this._listeners)
			delete(this._listeners[type]);
	},

	dispatchEvent: function(eventName, eventTarget) {
		var ret = false,
			listeners = this._listeners;

		if (eventName && listeners) {
			var arr = listeners[eventName];
			if (!arr) return ret;

			arr = arr.slice();
			// to avoid issues with items being removed or added during the dispatch

			var handler, i = arr.length;
			while (i--) {
				var handler = arr[i];
				ret = ret || handler(eventTarget);
			}

		}
		return !!ret;
	}
};
GAME.AssetsManager = function() {
    var _asset = ["assets/assets.json"];

    var _sounds = {
        s1: 'sound/s1.mp3',
        s2: 'sound/s2.mp3',
        s3: 'sound/s3.mp3',
        bg: 'sound/bg.mp3'
    };
    
    var _assetLoader = new PIXI.loaders.Loader();

    this.onComplete = null;
    this.onProgress = function(_e) {
        console.log("加载百分比" + _e.progress + "%");
    };

    this.start = function() {
        _assetLoader.add(_asset);
        _assetLoader.once('complete', this.onComplete);
        _assetLoader.on('progress', this.onProgress);
        _assetLoader.load();


        ///sounds
        PIXI.sound.add(_sounds);
    }



};
GAME.Scene = function ()
{
    PIXI.Container.call(this);
};
GAME.Utils.inherit(GAME.Scene, PIXI.Container);
GAME.Utils.extend(GAME.Scene.prototype, GAME.EventDispatcher.prototype);

GAME.Scene.prototype.init = function (){}
GAME.Scene.prototype.destroy = function (){}


///////////////
//  SCENE_IN  SCENE_OUT  SCENE_IN_COMPLETE  SCENE_OUT_COMPLETE

GAME.Scene.prototype.sceneIn = function ()
{
    this.dispatchEvent("SCENE_IN");
};
GAME.Scene.prototype.sceneOut = function ()
{
    this.dispatchEvent("SCENE_OUT");
};
GAME.Scene.prototype.sceneInComplete = function ()
{
    this.dispatchEvent("SCENE_IN_COMPLETE");
};
GAME.Scene.prototype.sceneOutComplete = function ()
{
    this.dispatchEvent("SCENE_OUT_COMPLETE");
};

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
        //_t1.scale.y = _t1.scale.x=GAME.imageScale;
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
        TweenMax.to(_txt1.position, 1, { y: -460,ease:Elastic.easeOut,delay:0.8});

        _txt1.rotation = -0.05;
        TweenMax.to(_txt1, 0.1, { rotation: 0.1,ease:Linear.easeNone,repeat:-1,yoyo:true,delay:2});



        var _mask = new PIXI.Graphics();
        _mask.lineStyle(0);
        _mask.beginFill(0x000, 1);
        _mask.drawCircle(0, 0, 50);
        _stage1Container.addChild(_mask);
        _mask.position.y = -460;
        _txt1.mask = _mask;







        _pic1 = PIXI.Sprite.fromFrame("pic1.jpg");
        //_pic1.scale.y = _pic1.scale.x=GAME.imageScale;
        _pic1.anchor.x = 0.5;
        _pic1.anchor.y = 1;
        _stage1Container.addChild(_pic1);
        _pic1.alpha=0;
        TweenMax.to(_pic1, 1, { alpha: 1,ease:Strong.easeOut,delay:1});
        TweenMax.to(_pic1.position, 1, { y: Math.floor(-350),ease:Elastic.easeOut,delay:1});


        _pic2 = PIXI.Sprite.fromFrame("pic2.jpg");
        //_pic2.scale.y = _pic2.scale.x=GAME.imageScale;
        _pic2.anchor.x = 0.5;
        _pic2.anchor.y = 1;
        _stage1Container.addChild(_pic2);
        _pic2.alpha=0;
        TweenMax.to(_pic2, 1, { alpha: 1,ease:Strong.easeOut,delay:1.2});
        TweenMax.to(_pic2.position, 1, { y: Math.floor(-210),ease:Elastic.easeOut,delay:1.2});


        _btn1 = PIXI.Sprite.fromFrame("btn1.png");
        //_btn1.scale.y = _btn1.scale.x=GAME.imageScale;
        _btn1.anchor.x = 0.5;
        _btn1.anchor.y = 1;
        _stage1Container.addChild(_btn1);
        _btn1.alpha=0;
        TweenMax.to(_btn1, 1, { alpha: 1,ease:Strong.easeOut,delay:1.4});
        TweenMax.to(_btn1.position, 1, { y: -20,ease:Elastic.easeOut,delay:1.4});



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
        PIXI.sound.play("s2");
        _stage2Container = new PIXI.Container();
        _this.addChild(_stage2Container);


        _pic4 = PIXI.Sprite.fromFrame("pic4.jpg");
        //_pic4.scale.y = _pic4.scale.x=GAME.imageScale;
        _pic4.position.x=0;
        _pic4.position.y=100;
        _stage2Container.addChild(_pic4);
        _pic4.alpha=0;
        TweenMax.to(_pic4, 0.6, {alpha: 1});


        _pic5 = PIXI.Sprite.fromFrame("pic5.png");
        //_pic5.scale.y = _pic5.scale.x=GAME.imageScale;
        _pic5.anchor.x = 0.5;
        _pic5.anchor.y = 0.5;
        _pic5.position.x=GAME.stageWidth/2;
        _pic5.position.y=GAME.stageHeight/2;
        _stage2Container.addChild(_pic5);
        _pic5.scale.x=_pic5.scale.y=0;
        TweenMax.to(_pic5.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:0.8});

        _btn2 = PIXI.Sprite.fromFrame("btn2.jpg");
        //_btn2.scale.y = _btn2.scale.x=GAME.imageScale;
        _btn2.anchor.x = 0.5;
        _btn2.anchor.y = 0.5;
        _btn2.position.x=GAME.stageWidth/2;
        _btn2.position.y=_pic5.position.y+240;
        _stage2Container.addChild(_btn2);
        _btn2.scale.x=_btn2.scale.y=0;
        TweenMax.to(_btn2.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:0.9});

        _btn2.interactive = true;
        _btn2.mousedown = _btn2.touchstart = function ()
        {
            _this.sceneOut()
        }
    }



    this.sceneOut = function ()
    {
        GAME.Scene.prototype.sceneOut.apply(this);
        TweenMax.to(this, 0.4, {alpha:0,
            onComplete:function(){_this.sceneOutComplete()}
        });
    }







};
GAME.Utils.inherit(GAME.GameScene1, GAME.Scene);

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

        updateParticle();
    }


    function initStage1()
    {
        _stage1Container = new PIXI.Container();
        _stage1Container.x = GAME.stageWidth/2;
        _stage1Container.y = GAME.stageHeight/2;
        _this.addChild(_stage1Container);

        _pic6 = PIXI.Sprite.fromFrame("pic6.jpg");
        //_pic6.scale.y = _pic6.scale.x=GAME.imageScale;
        _pic6.anchor.x = 0.5;
        _stage1Container.addChild(_pic6);
        _pic6.alpha=0;
        TweenMax.to(_pic6, 1, { alpha: 1,ease:Strong.easeOut,delay:0.6});
        TweenMax.to(_pic6, 1, { y: -300,ease:Elastic.easeOut,delay:0.6});

        _pic7 = PIXI.Sprite.fromFrame("pic7.png");
        //_pic7.scale.y = _pic7.scale.x=GAME.imageScale;
        _pic7.anchor.x = 0.5;
        _pic7.anchor.y = 0.5;
        _stage1Container.addChild(_pic7);

        _pic7.scale.x=_pic7.scale.y=0;
        TweenMax.to(_pic7.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:0.8});

        _pic8 = PIXI.Sprite.fromFrame("pic8.png");
        _pic8.anchor.x = 0.5;
        _pic8.anchor.y = 0.5;
        _stage1Container.addChild(_pic8);
        _pic8.x=-134;
        _pic8.y=-58;
        _pic8.scale.x=_pic8.scale.y=0;
        TweenMax.to(_pic8.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:0.9});


        _pic9 = PIXI.Sprite.fromFrame("pic9.png");
        _pic9.anchor.x = 0.5;
        _pic9.anchor.y = 0.5;
        _stage1Container.addChild(_pic9);
        _pic9.x=-54;
        _pic9.y=-128;
        _pic9.scale.x=_pic9.scale.y=0;
        TweenMax.to(_pic9.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:1});

        _pic10 = PIXI.Sprite.fromFrame("pic10.png");
        _pic10.anchor.x = 0.5;
        _pic10.anchor.y = 0.5;
        _stage1Container.addChild(_pic10);
        _pic10.x=61;
        _pic10.y=-128;
        _pic10.scale.x=_pic10.scale.y=0;
        TweenMax.to(_pic10.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:1.1});


        _pic11 = PIXI.Sprite.fromFrame("pic11.png");
        _pic11.anchor.x = 0.5;
        _pic11.anchor.y = 0.5;
        _stage1Container.addChild(_pic11);
        _pic11.x=134;
        _pic11.y=-58;
        _pic11.scale.x=_pic11.scale.y=0;
        TweenMax.to(_pic11.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:1.2});


        initParticle();

        for (var i = 0; i < 4; i++)
        {
            var touchPoint = new PIXI.Sprite(PIXI.Texture.fromFrame("pic7.png"));

            touchPoint.interactive = true;
            touchPoint.buttonMode = true;
            touchPoint.anchor.set(0.5);
            //touchPoint.scale.set(GAME.imageScale);

            touchPoint
                // events for drag start
                .on('mousedown', onDragStart)
                .on('touchstart', onDragStart)
                // events for drag end
                .on('mouseup', onDragEnd)
                .on('mouseupoutside', onDragEnd)
                .on('touchend', onDragEnd)
                .on('touchendoutside', onDragEnd)
                // events for drag move
                .on('mousemove', onDragMove)
                .on('touchmove', onDragMove);

            // move the sprite to its designated position
            touchPoint.x = Math.floor(Math.random() * 200);
            touchPoint.y = Math.floor(Math.random() * 200);
            // add it to the stage
            _this.addChild(touchPoint);

            addParticle(touchPoint);
        }        
    }

    var ps=[],pc;
    function initParticle()
    {
        pc = new PIXI.ParticleContainer(10000, {
                        scale: true,
                        position: true,
                        //rotation: true,
                        //uvs: true,
                        alpha: true
                    });                                        
        _this.addChild(pc);
    }
    function addParticle(parentObject)
    {
        for (var i = 0; i < 100; ++i)
        {
            var p = new PIXI.Sprite.fromFrame("star.png");
            p.anchor.set(0.5);
            p.scale.set((Math.random()+1));
            p.x = parentObject.x;
            p.y = parentObject.y;
            p.parentObject=parentObject;
            p.Xspeed=Math.random() *2-1;
            p.Yspeed=Math.random() *2-1;
            p.Aspeed=0.01+Math.random()*0.1;

            ps.push(p);
            pc.addChild(p);
        }
    }
    function updateParticle()
    {
        for (var i = 0; i < ps.length; i++)
        {
            var p = ps[i];
            p.alpha -= p.Aspeed;
            p.x+=p.Xspeed;
            p.y+=p.Yspeed;

            if(p.alpha<=0) {
                p.x = p.parentObject.x;
                p.y = p.parentObject.y;
                p.alpha=1;
            }
        }
    }


    function onDragStart(event)
    {
        this.data = event.data;
        this.alpha = 0.99;
        this.dragging = true;

        this.id = this.data.identifier;
    }

    function onDragEnd(event)
    {
        if (event.data.identifier == this.id)
        {
            this.alpha = 1;
            this.dragging = false;
            this.data = null;
            this.id=null;
        }
    }

    function onDragMove(event)
    {
        if (event.data.identifier == this.id)
        {
            if (this.dragging)
            {
                var newPosition = this.data.getLocalPosition(this.parent);
                this.x = newPosition.x;
                this.y = newPosition.y;
            }
        }
    }



    this.sceneOut = function ()
    {

    }


};
GAME.Utils.inherit(GAME.GameScene2, GAME.Scene);

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