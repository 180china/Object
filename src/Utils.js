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
