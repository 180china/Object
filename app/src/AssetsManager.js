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