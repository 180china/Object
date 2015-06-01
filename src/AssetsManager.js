GAME.AssetsManager=function()
{
    var _asset = ["assets/assets.json"];

    var _assetLoader=new PIXI.loaders.Loader();


    this.onComplete=null;
    this.start=function()
    {
        _assetLoader.add(_asset);

        _assetLoader.once('complete',this.onComplete);
        _assetLoader.load();
    }
};
