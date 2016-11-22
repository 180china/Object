// https://npmjs.org/package/node-minify
// https://github.com/srod/node-minify
/*
1. Make sure [Node.js](http://nodejs.org/download/) is installed.
2. Open up a [command line interface](http://en.wikipedia.org/wiki/Command-line_interface).
3. Type `cd path/to/Object/minify/`
4. Type `npm install node-minify`
5. Type `node build.js`
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


// //Concatenated
// compressor.minify({
//   compressor: 'no-compress',
//   input: JSfiles,
//   output: path.resolve(__dirname, '../bin/object.js'),
//   callback: function(e) {
//     if (!e) {
//       console.log('concatenation complete');
//     } else {
//       console.log('unable to concatenate', e);
//     }
//   }
// });


//Minified


// Using Google Closure Compiler
compressor.minify({
  compressor: 'gcc',
  input: JSfiles,
  output: path.resolve(__dirname, '../bin/object.min.js'),
  callback: function (err, min) {
    if (!err) {
      console.log('gcc minified complete');
    } else {
      console.log('unable to gcc minify', e);
    }
  }
});

// // Using UglifyJS
// compressor.minify({
//   compressor: 'uglifyjs',
//   input: JSfiles,
//   output: path.resolve(__dirname, '../bin/object.uglifyjs.js'),
//   callback: function(e){
//     if (!e) {
//       console.log('uglifyjs minified complete');
//     } else {
//       console.log('unable to uglifyjs minify', e);
//     }
//   }
// });

// // Using Promise
// var promise = compressor.minify({
//   compressor: 'uglifyjs',
//   input: JSfiles,
//   output: path.resolve(__dirname, '../bin/object.promise.js')
// });

// promise.then(function(min) {
//   console.log('Promise minified complete');
// });



// // Using Sqwish
// compressor.minify({
//   compressor: 'sqwish',
//   input: CSSfiles,
//   output: path.resolve(__dirname, '../bin/style.min.css'),
//   callback: function(e) {
//     if (!e) {
//       console.log('Sqwish css complete');
//     } else {
//       console.log('unable to Sqwish css', e);
//     }
//   }
// });


