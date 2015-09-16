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
        _pic6.scale.y = _pic6.scale.x=GAME.imageScale;
        _pic6.anchor.x = 0.5;
        _stage1Container.addChild(_pic6);
        _pic6.alpha=0;
        TweenMax.to(_pic6, 1, { alpha: 1,ease:Strong.easeOut,delay:0.6});
        TweenMax.to(_pic6, 1, { y: -300*GAME.positionScale,ease:Elastic.easeOut,delay:0.6});

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
        _pic8.x=-134*GAME.positionScale;
        _pic8.y=-58*GAME.positionScale;
        _pic8.scale.x=_pic8.scale.y=0;
        TweenMax.to(_pic8.scale, 1, { x: GAME.imageScale, y: GAME.imageScale,ease:Elastic.easeOut,delay:0.9});


        _pic9 = PIXI.Sprite.fromFrame("pic9.png");
        _pic9.anchor.x = 0.5;
        _pic9.anchor.y = 0.5;
        _stage1Container.addChild(_pic9);
        _pic9.x=-54*GAME.positionScale;
        _pic9.y=-128*GAME.positionScale;
        _pic9.scale.x=_pic9.scale.y=0;
        TweenMax.to(_pic9.scale, 1, { x: GAME.imageScale, y: GAME.imageScale,ease:Elastic.easeOut,delay:1});

        _pic10 = PIXI.Sprite.fromFrame("pic10.png");
        _pic10.anchor.x = 0.5;
        _pic10.anchor.y = 0.5;
        _stage1Container.addChild(_pic10);
        _pic10.x=61*GAME.positionScale;
        _pic10.y=-128*GAME.positionScale;
        _pic10.scale.x=_pic10.scale.y=0;
        TweenMax.to(_pic10.scale, 1, { x: GAME.imageScale, y: GAME.imageScale,ease:Elastic.easeOut,delay:1.1});


        _pic11 = PIXI.Sprite.fromFrame("pic11.png");
        _pic11.anchor.x = 0.5;
        _pic11.anchor.y = 0.5;
        _stage1Container.addChild(_pic11);
        _pic11.x=134*GAME.positionScale;
        _pic11.y=-58*GAME.positionScale;
        _pic11.scale.x=_pic11.scale.y=0;
        TweenMax.to(_pic11.scale, 1, { x: GAME.imageScale, y: GAME.imageScale,ease:Elastic.easeOut,delay:1.2});


        initParticle();

        for (var i = 0; i < 4; i++)
        {
            var touchPoint = new PIXI.Sprite(PIXI.Texture.fromFrame("pic7.png"));

            touchPoint.interactive = true;
            touchPoint.buttonMode = true;
            touchPoint.anchor.set(0.5);
            touchPoint.scale.set(GAME.imageScale);

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
        if(GAME.Utils.isAndroid())pc.scale.set(window.devicePixelRatio);
    }
    function addParticle(parentObject)
    {
        for (var i = 0; i < 100; ++i)
        {
            var p = new PIXI.Sprite.fromFrame("star.png");
            p.anchor.set(0.5);
            p.scale.set((Math.random()+1)*GAME.positionScale);
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
