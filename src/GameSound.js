GameSound = function ()
{
    var soundObject={};

    this.addSound=function(_id,_isLoop)
    {
        var sound= document.getElementById(_id);
        soundObject[_id]={};
        soundObject[_id]["target"]=sound;
        sound.addEventListener("canplay",function(){
            //alert(_id+"----canplay");
            soundObject[_id]["canplay"]=true;
        });
        sound.addEventListener("loadeddata",function(){
            soundObject[_id]["loadeddata"]=true;
        });
        sound.addEventListener("loadstart",function(){
            soundObject[_id]["loadstart"]=true;
        });
        sound.addEventListener("ended",function(){
            soundObject[_id]["ended"]=true;
            if(_isLoop){
                GAME.Sound.playSound(_id);
            }
        });
    }
    this.playSound=function(_id)
    {
        soundObject[_id]["target"].play();
    }
    this.pauseSound=function(_id){
        soundObject[_id]["target"].pause();
    }
    this.stopSound=function(_id){
        soundObject[_id]["target"].stop();
    }
}
