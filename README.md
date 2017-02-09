# Object
HTML5  Project 3.1.2

Mobile Html5 frameworks
Based on pixi.js https://github.com/pixijs/

Reset event/Event.js EventDispatcher.js

Add H5Sound.js
```javascript
  var sounds = [
  {src: "sound/s1.mp3", id: "s1"},
  {src: "sound/s2.mp3", id: "s2"},
  {src: "sound/s3.mp3", id: "s3"},
  {src: "sound/bg.mp3", id: "bg"}
  ];
  H5Sound.load(sounds,soundLoadComplete);
  function soundLoadComplete()
  {
    H5Sound.play("bg",0);
  }
```
Javascript/CSS minifier 
  1. Make sure [Node.js](http://nodejs.org/download/) is installed.
  2. Open up a [command line interface](http://en.wikipedia.org/wiki/Command-line_interface).
  3. Type `cd path/to/Object/minify/`
  4. Type `npm install node-minify`
  5. Type `node ./build.js`
```javascript
  var path = require('path');
  var compressor = require('node-minify');
  var JSfiles = [
    path.resolve(__dirname, '../src/Game.js'),
    path.resolve(__dirname, '../src/main.js')
  ];
  
  var CSSfiles = [
    path.resolve(__dirname, '../css/loading.css'),
    path.resolve(__dirname, '../css/style.css')
  ];
  
  //Minified
  compressor.minify({
    compressor: 'gcc',
    input: JSfiles,
    output: path.resolve(__dirname, '../bin/object.min.js'),
    callback: function(e){}
  });
  
  // Using Sqwish
  compressor.minify({
    compressor: 'sqwish',
    input: CSSfiles,
    output: path.resolve(__dirname, '../bin/style.min.css'),
    callback: function(e) {}
  });
```
