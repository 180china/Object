GAME.Event=function(type)
{
	this.type=type;
	this.target=null;
};
GAME.Event.prototype=
{
	constructor:GAME.Event,
    clone:function()
    {
        return new GAME.Event(this.type,this.target);
    }
};