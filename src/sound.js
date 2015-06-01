GAME.Sound= {
    volume : 1,
    load : function(obj, fun) {

        createjs.Sound.alternateExtensions = ["mp3"];
        createjs.Sound.addEventListener("fileload", handleLoadComplete);
        createjs.Sound.registerManifest(obj);
        
        function handleLoadComplete(e) 
        {
            if (fun) {
                fun();
            }
        }

    },

    play : function(id, loop) {
        createjs.Sound.setVolume(1);
        loop = loop === undefined ? 0 : 9999;
        createjs.Sound.play(id, createjs.Sound.INTERRUPT_ANY, 0, 0, loop, 1, 0);
    },

    stop : function(trackName) {
        TweenMax.to(GAME.Sound, 2, {
                volume : 0,
                onUpdate : function() {
                    createjs.Sound.setVolume(GAME.Sound.volume);
                },
                onComplete : function() {
                    createjs.Sound.stop(trackName);
                }
        });
    }
}
