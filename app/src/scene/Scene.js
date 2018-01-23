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
