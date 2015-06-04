GAME.Sound= {
    load : function(obj, fun) {

        createjs.Sound.alternateExtensions = ["mp3"];
        createjs.Sound.addEventListener("fileload", handleLoadComplete);
        createjs.Sound.registerSounds(obj);
        //createjs.Sound.registerManifest(obj);

        function handleLoadComplete(e) 
        {
            if (fun) {
                fun();
            }
        }
    },

    play : function(id, loop) {
        loop = loop === undefined ? 0 : 9999;
        createjs.Sound.play(id, createjs.Sound.INTERRUPT_ANY, 0, 0, loop, 1, 0);
    },

    stop : function(trackName) {
        createjs.Sound.stop(trackName);
    }
}

