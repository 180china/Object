/**
 * Created by weibin.zeng on 15/9/25.
 */
GAME.IncrementalLoadManager=function(){
    var _this=this;
    var _assets=[
        "../img/imgs_1.json",
        "../img/imgs_2.json",

        "../img/s1_1.json",
        "../img/s1_2.json",
        "../img/loop1.json",
        "../img/p1/p1_bg.jpg",
        "../img/p1/p1_sp6.png",
        "../img/p1/p1_sp7.png",
        "../img/p3/p3_bg.jpg"

                ];
    var _index=0;
    this.start=function(){
        load(_assets[_index]);
    }
    this.progressFun=null;
    this.completeFun=null;
    function load(url){
        var _assetLoader=new PIXI.loaders.Loader();
        _assetLoader.add(url);
        _assetLoader.once("complete",function(event){
            if(++_index<_assets.length){
                if(_this.progressFun)_this.progressFun(_index,_assets.length);
                load(_assets[_index]);
            }else{
                if(_this.completeFun)_this.completeFun();
            }
        });
        _assetLoader.on("progress",function(event){

        });
        _assetLoader.load();
    }

};
