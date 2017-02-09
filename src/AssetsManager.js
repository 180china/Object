GAME.AssetsManager=function()
{
    var _asset = ["assets/assets.json"];
    var _assetAndroid = ["assets/assets_android.json"];

    var _assetLoader=new PIXI.loaders.Loader();

    this.onComplete=null;
    this.onProgress=function(_e)
    {
        console.log("加载百分比"+_e.progress+"%");
    };

    this.start=function()
    {
        if(GAME.Utils.isAndroid())
        {
            _assetLoader.add(_asset);
        }else{
            _assetLoader.add(_asset);
        }
        _assetLoader.once('complete',this.onComplete);
        _assetLoader.on('progress',this.onProgress);
        _assetLoader.load();

    }



};
