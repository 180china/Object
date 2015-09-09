// https://npmjs.org/package/node-minify
/*
1. Make sure [Node.js](http://nodejs.org/download/) is installed.
2. Open up a [command line interface](http://en.wikipedia.org/wiki/Command-line_interface).
3. Type `cd path/to/Object`
4. Type `npm install node-minify`
5. Type `node ./minify/build.js`
*/

var path = require('path');
var compressor = require('node-minify');


var JSfiles = [
  path.resolve(__dirname, '../libs/zepto.min.js'),
  path.resolve(__dirname, '../libs/stats.min.js'),
  path.resolve(__dirname, '../libs/pixi.min.js'),
  path.resolve(__dirname, '../libs/TweenMax.min.js'),
  path.resolve(__dirname, '../libs/soundjs-0.6.1.min.js'),

  path.resolve(__dirname, '../src/Game.js'),
  path.resolve(__dirname, '../src/Utils.js'),
  path.resolve(__dirname, '../src/H5Sound.js'),
  path.resolve(__dirname, '../src/AssetsManager.js'),
  path.resolve(__dirname, '../src/event/Event.js'),
  path.resolve(__dirname, '../src/event/EventDispatcher.js'),
  path.resolve(__dirname, '../src/scene/Scene.js'),
  path.resolve(__dirname, '../src/scene/GameScene1.js'),
  path.resolve(__dirname, '../src/scene/GameScene2.js'),

  path.resolve(__dirname, '../src/main.js')
];

var CSSfiles = [
  path.resolve(__dirname, '../css/loading.css'),
  path.resolve(__dirname, '../css/style.css')
];

// Concatenated
new compressor.minify({
  type: 'no-compress',
  fileIn: JSfiles,
  fileOut: path.resolve(__dirname, '../bin/main.js'),
  callback: function(e) {
    if (!e) {
      console.log('concatenation complete');
    } else {
      console.log('unable to concatenate', e);
    }
  }
});

// Minified
// new compressor.minify({
//   type: 'uglifyjs',
//   fileIn: JSfiles,
//   fileOut: path.resolve(__dirname, '../bin/main.min.js'),
//   callback: function(e){
//     if (!e) {
//       console.log('minified complete');
//     } else {
//       console.log('unable to minify', e);
//     }
//   }
// });


// Using Sqwish
new compressor.minify({
  type: 'sqwish',
  fileIn: CSSfiles,
  fileOut: path.resolve(__dirname, '../bin/style-min.css'),
  callback: function(e) {
    if (!e) {
      console.log('Sqwish css complete');
    } else {
      console.log('unable to Sqwish css', e);
    }
  }
});


