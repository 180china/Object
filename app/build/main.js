(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sound = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Filterable = (function () {
    function Filterable(input, output) {
        this._output = output;
        this._input = input;
    }
    Object.defineProperty(Filterable.prototype, "destination", {
        get: function () {
            return this._input;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Filterable.prototype, "filters", {
        get: function () {
            return this._filters;
        },
        set: function (filters) {
            var _this = this;
            if (this._filters) {
                this._filters.forEach(function (filter) {
                    if (filter) {
                        filter.disconnect();
                    }
                });
                this._filters = null;
                this._input.connect(this._output);
            }
            if (filters && filters.length) {
                this._filters = filters.slice(0);
                this._input.disconnect();
                var prevFilter_1 = null;
                filters.forEach(function (filter) {
                    if (prevFilter_1 === null) {
                        _this._input.connect(filter.destination);
                    }
                    else {
                        prevFilter_1.connect(filter.destination);
                    }
                    prevFilter_1 = filter;
                });
                prevFilter_1.connect(this._output);
            }
        },
        enumerable: true,
        configurable: true
    });
    Filterable.prototype.destroy = function () {
        this.filters = null;
        this._input = null;
        this._output = null;
    };
    return Filterable;
}());
exports.default = Filterable;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var AUDIO_EXTENSIONS = ["wav", "mp3", "ogg", "oga", "m4a"];
function middleware(resource, next) {
    if (resource.data && AUDIO_EXTENSIONS.indexOf(resource._getExtension()) > -1) {
        resource.sound = index_1.default.add(resource.name, {
            loaded: next,
            preload: true,
            srcBuffer: resource.data,
        });
    }
    else {
        next();
    }
}
function middlewareFactory() {
    return middleware;
}
function install() {
    var Resource = PIXI.loaders.Resource;
    AUDIO_EXTENSIONS.forEach(function (ext) {
        Resource.setExtensionXhrType(ext, Resource.XHR_RESPONSE_TYPE.BUFFER);
        Resource.setExtensionLoadType(ext, Resource.LOAD_TYPE.XHR);
    });
    PIXI.loaders.Loader.addPixiMiddleware(middlewareFactory);
    PIXI.loader.use(middleware);
}
exports.install = install;

},{"./index":17}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var SoundInstance_1 = require("./SoundInstance");
var SoundNodes_1 = require("./SoundNodes");
var SoundSprite_1 = require("./SoundSprite");
var Sound = (function () {
    function Sound(context, source) {
        var options = {};
        if (typeof source === "string") {
            options.src = source;
        }
        else if (source instanceof ArrayBuffer) {
            options.srcBuffer = source;
        }
        else {
            options = source;
        }
        options = Object.assign({
            autoPlay: false,
            singleInstance: false,
            src: null,
            srcBuffer: null,
            preload: false,
            volume: 1,
            speed: 1,
            complete: null,
            loaded: null,
            loop: false,
            useXHR: true,
        }, options);
        this._context = context;
        this._nodes = new SoundNodes_1.default(this._context);
        this._source = this._nodes.bufferSource;
        this._instances = [];
        this._sprites = {};
        var complete = options.complete;
        this._autoPlayOptions = complete ? { complete: complete } : null;
        this.isLoaded = false;
        this.isPlaying = false;
        this.autoPlay = options.autoPlay;
        this.singleInstance = options.singleInstance;
        this.preload = options.preload || this.autoPlay;
        this.src = options.src;
        this.srcBuffer = options.srcBuffer;
        this.useXHR = options.useXHR;
        this.volume = options.volume;
        this.loop = options.loop;
        this.speed = options.speed;
        if (options.sprites) {
            this.addSprites(options.sprites);
        }
        if (this.preload) {
            this._beginPreload(options.loaded);
        }
    }
    Sound.from = function (options) {
        return new Sound(index_1.default.context, options);
    };
    Sound.prototype.destroy = function () {
        this._nodes.destroy();
        this._nodes = null;
        this._context = null;
        this._source = null;
        this.removeSprites();
        this._sprites = null;
        this.srcBuffer = null;
        this._removeInstances();
        this._instances = null;
    };
    Object.defineProperty(Sound.prototype, "isPlayable", {
        get: function () {
            return this.isLoaded && !!this._source && !!this._source.buffer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "context", {
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "volume", {
        get: function () {
            return this._volume;
        },
        set: function (volume) {
            this._volume = this._nodes.gain.gain.value = volume;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "loop", {
        get: function () {
            return this._source.loop;
        },
        set: function (loop) {
            this._source.loop = !!loop;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "buffer", {
        get: function () {
            return this._source.buffer;
        },
        set: function (buffer) {
            this._source.buffer = buffer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "duration", {
        get: function () {
            console.assert(this.isPlayable, "Sound not yet playable, no duration");
            return this._source.buffer.duration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "nodes", {
        get: function () {
            return this._nodes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "filters", {
        get: function () {
            return this._nodes.filters;
        },
        set: function (filters) {
            this._nodes.filters = filters;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "speed", {
        get: function () {
            return this._source.playbackRate.value;
        },
        set: function (value) {
            this._source.playbackRate.value = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "instances", {
        get: function () {
            return this._instances;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sound.prototype, "sprites", {
        get: function () {
            return this._sprites;
        },
        enumerable: true,
        configurable: true
    });
    Sound.prototype.addSprites = function (source, data) {
        if (typeof source === "object") {
            var results = {};
            for (var alias in source) {
                results[alias] = this.addSprites(alias, source[alias]);
            }
            return results;
        }
        else if (typeof source === "string") {
            console.assert(!this._sprites[source], "Alias " + source + " is already taken");
            var sprite = new SoundSprite_1.default(this, data);
            this._sprites[source] = sprite;
            return sprite;
        }
    };
    Sound.prototype.removeSprites = function (alias) {
        if (!alias) {
            for (var name_1 in this._sprites) {
                this.removeSprites(name_1);
            }
        }
        else {
            var sprite = this._sprites[alias];
            if (sprite !== undefined) {
                sprite.destroy();
                delete this._sprites[alias];
            }
        }
        return this;
    };
    Sound.prototype.play = function (source, complete) {
        var _this = this;
        var options;
        if (typeof source === "string") {
            var sprite = source;
            options = { sprite: sprite, complete: complete };
        }
        else if (typeof source === "function") {
            options = {};
            options.complete = source;
        }
        else {
            options = source;
        }
        options = Object.assign({
            complete: null,
            loaded: null,
            sprite: null,
            start: 0,
            fadeIn: 0,
            fadeOut: 0,
        }, options || {});
        if (options.sprite) {
            var alias = options.sprite;
            console.assert(!!this._sprites[alias], "Alias " + alias + " is not available");
            var sprite = this._sprites[alias];
            options.start = sprite.start;
            options.end = sprite.end;
            options.speed = sprite.speed;
            delete options.sprite;
        }
        if (options.offset) {
            options.start = options.offset;
        }
        if (!this.isLoaded) {
            return new Promise(function (resolve, reject) {
                _this.autoPlay = true;
                _this._autoPlayOptions = options;
                _this._beginPreload(function (err, sound, instance) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        if (options.loaded) {
                            options.loaded(err, sound, instance);
                        }
                        resolve(instance);
                    }
                });
            });
        }
        if (this.singleInstance) {
            this._removeInstances();
        }
        var instance = SoundInstance_1.default.create(this);
        this._instances.push(instance);
        this.isPlaying = true;
        instance.once("end", function () {
            if (options.complete) {
                options.complete(_this);
            }
            _this._onComplete(instance);
        });
        instance.once("stop", function () {
            _this._onComplete(instance);
        });
        instance.play(options.start, options.end, options.speed, options.loop, options.fadeIn, options.fadeOut);
        return instance;
    };
    Sound.prototype.stop = function () {
        if (!this.isPlayable) {
            this.autoPlay = false;
            this._autoPlayOptions = null;
            return this;
        }
        this.isPlaying = false;
        for (var i = this._instances.length - 1; i >= 0; i--) {
            this._instances[i].stop();
        }
        return this;
    };
    Sound.prototype.pause = function () {
        for (var i = this._instances.length - 1; i >= 0; i--) {
            this._instances[i].paused = true;
        }
        this.isPlaying = false;
        return this;
    };
    ;
    Sound.prototype.resume = function () {
        for (var i = this._instances.length - 1; i >= 0; i--) {
            this._instances[i].paused = false;
        }
        this.isPlaying = this._instances.length > 0;
        return this;
    };
    Sound.prototype._beginPreload = function (callback) {
        if (this.src) {
            this.useXHR ? this._loadUrl(callback) : this._loadPath(callback);
        }
        else if (this.srcBuffer) {
            this._decode(this.srcBuffer, callback);
        }
        else if (callback) {
            callback(new Error("sound.src or sound.srcBuffer must be set"));
        }
        else {
            console.error("sound.src or sound.srcBuffer must be set");
        }
    };
    Sound.prototype._onComplete = function (instance) {
        if (this._instances) {
            var index = this._instances.indexOf(instance);
            if (index > -1) {
                this._instances.splice(index, 1);
            }
            this.isPlaying = this._instances.length > 0;
        }
        instance.destroy();
    };
    Sound.prototype._removeInstances = function () {
        for (var i = this._instances.length - 1; i >= 0; i--) {
            this._instances[i].destroy();
        }
        this._instances.length = 0;
    };
    Sound.prototype._loadUrl = function (callback) {
        var _this = this;
        var request = new XMLHttpRequest();
        var src = this.src;
        request.open("GET", src, true);
        request.responseType = "arraybuffer";
        request.onload = function () {
            _this.srcBuffer = request.response;
            _this._decode(request.response, callback);
        };
        request.send();
    };
    Sound.prototype._loadPath = function (callback) {
        var _this = this;
        var fs = require("fs");
        var src = this.src;
        fs.readFile(src, function (err, data) {
            if (err) {
                console.error(err);
                if (callback) {
                    callback(new Error("File not found " + _this.src));
                }
                return;
            }
            var arrayBuffer = new ArrayBuffer(data.length);
            var view = new Uint8Array(arrayBuffer);
            for (var i = 0; i < data.length; ++i) {
                view[i] = data[i];
            }
            _this.srcBuffer = arrayBuffer;
            _this._decode(arrayBuffer, callback);
        });
    };
    Sound.prototype._decode = function (arrayBuffer, callback) {
        var _this = this;
        this._context.decode(arrayBuffer, function (err, buffer) {
            if (err) {
                if (callback) {
                    callback(err);
                }
            }
            else {
                _this.isLoaded = true;
                _this.buffer = buffer;
                var instance = void 0;
                if (_this.autoPlay) {
                    instance = _this.play(_this._autoPlayOptions);
                }
                if (callback) {
                    callback(null, _this, instance);
                }
            }
        });
    };
    return Sound;
}());
exports.default = Sound;

},{"./SoundInstance":5,"./SoundNodes":7,"./SoundSprite":8,"./index":17,"fs":undefined}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Filterable_1 = require("./Filterable");
var SoundContext = (function (_super) {
    __extends(SoundContext, _super);
    function SoundContext() {
        var _this = this;
        var ctx = new SoundContext.AudioContext();
        var gain = ctx.createGain();
        var compressor = ctx.createDynamicsCompressor();
        var analyser = ctx.createAnalyser();
        analyser.connect(gain);
        gain.connect(compressor);
        compressor.connect(ctx.destination);
        _this = _super.call(this, analyser, gain) || this;
        _this._ctx = ctx;
        _this._offlineCtx = new SoundContext.OfflineAudioContext(1, 2, ctx.sampleRate);
        _this._unlocked = false;
        _this.gain = gain;
        _this.compressor = compressor;
        _this.analyser = analyser;
        _this.volume = 1;
        _this.muted = false;
        _this.paused = false;
        if ("ontouchstart" in window && ctx.state !== "running") {
            _this._unlock();
            _this._unlock = _this._unlock.bind(_this);
            document.addEventListener("mousedown", _this._unlock, true);
            document.addEventListener("touchstart", _this._unlock, true);
            document.addEventListener("touchend", _this._unlock, true);
        }
        return _this;
    }
    SoundContext.prototype._unlock = function () {
        if (this._unlocked) {
            return;
        }
        this.playEmptySound();
        if (this._ctx.state === "running") {
            document.removeEventListener("mousedown", this._unlock, true);
            document.removeEventListener("touchend", this._unlock, true);
            document.removeEventListener("touchstart", this._unlock, true);
            this._unlocked = true;
        }
    };
    SoundContext.prototype.playEmptySound = function () {
        var source = this._ctx.createBufferSource();
        source.buffer = this._ctx.createBuffer(1, 1, 22050);
        source.connect(this._ctx.destination);
        source.start(0, 0, 0);
    };
    Object.defineProperty(SoundContext, "AudioContext", {
        get: function () {
            var win = window;
            return (win.AudioContext ||
                win.webkitAudioContext ||
                null);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundContext, "OfflineAudioContext", {
        get: function () {
            var win = window;
            return (win.OfflineAudioContext ||
                win.webkitOfflineAudioContext ||
                null);
        },
        enumerable: true,
        configurable: true
    });
    SoundContext.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        var ctx = this._ctx;
        if (typeof ctx.close !== "undefined") {
            ctx.close();
        }
        this.analyser.disconnect();
        this.gain.disconnect();
        this.compressor.disconnect();
        this.gain = null;
        this.analyser = null;
        this.compressor = null;
        this._offlineCtx = null;
        this._ctx = null;
    };
    Object.defineProperty(SoundContext.prototype, "audioContext", {
        get: function () {
            return this._ctx;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundContext.prototype, "offlineContext", {
        get: function () {
            return this._offlineCtx;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundContext.prototype, "muted", {
        get: function () {
            return this._muted;
        },
        set: function (muted) {
            this._muted = !!muted;
            this.gain.gain.value = this._muted ? 0 : this._volume;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundContext.prototype, "volume", {
        get: function () {
            return this._volume;
        },
        set: function (volume) {
            this._volume = volume;
            if (!this._muted) {
                this.gain.gain.value = this._volume;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundContext.prototype, "paused", {
        get: function () {
            return this._paused;
        },
        set: function (paused) {
            if (paused && this._ctx.state === "running") {
                this._ctx.suspend();
            }
            else if (!paused && this._ctx.state === "suspended") {
                this._ctx.resume();
            }
            this._paused = paused;
        },
        enumerable: true,
        configurable: true
    });
    SoundContext.prototype.toggleMute = function () {
        this.muted = !this.muted;
        return this._muted;
    };
    SoundContext.prototype.decode = function (arrayBuffer, callback) {
        this._offlineCtx.decodeAudioData(arrayBuffer, function (buffer) {
            callback(null, buffer);
        }, function () {
            callback(new Error("Unable to decode file"));
        });
    };
    return SoundContext;
}(Filterable_1.default));
exports.default = SoundContext;

},{"./Filterable":1}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var id = 0;
var SoundInstance = (function (_super) {
    __extends(SoundInstance, _super);
    function SoundInstance(parent) {
        var _this = _super.call(this) || this;
        _this.id = id++;
        _this._parent = null;
        _this._paused = false;
        _this._elapsed = 0;
        _this._init(parent);
        return _this;
    }
    SoundInstance.create = function (parent) {
        if (SoundInstance._pool.length > 0) {
            var sound = SoundInstance._pool.pop();
            sound._init(parent);
            return sound;
        }
        else {
            return new SoundInstance(parent);
        }
    };
    SoundInstance.prototype.stop = function () {
        if (this._source) {
            this._internalStop();
            this.emit("stop");
        }
    };
    SoundInstance.prototype.play = function (start, end, speed, loop, fadeIn, fadeOut) {
        if (end) {
            console.assert(end > start, "End time is before start time");
        }
        this._paused = false;
        this._source = this._parent.nodes.cloneBufferSource();
        if (speed !== undefined) {
            this._source.playbackRate.value = speed;
        }
        this._speed = this._source.playbackRate.value;
        if (loop !== undefined) {
            this._loop = this._source.loop = !!loop;
        }
        if (this._loop && end !== undefined) {
            console.warn('Looping not support when specifying an "end" time');
            this._loop = this._source.loop = false;
        }
        this._end = end;
        var duration = this._source.buffer.duration;
        fadeIn = this._toSec(fadeIn);
        if (fadeIn > duration) {
            fadeIn = duration;
        }
        if (!this._loop) {
            fadeOut = this._toSec(fadeOut);
            if (fadeOut > duration - fadeIn) {
                fadeOut = duration - fadeIn;
            }
        }
        this._duration = duration;
        this._fadeIn = fadeIn;
        this._fadeOut = fadeOut;
        this._lastUpdate = this._now();
        this._elapsed = start;
        this._source.onended = this._onComplete.bind(this);
        this._source.start(0, start, (end ? end - start : undefined));
        this.emit("start");
        this._update(true);
        this._enabled = true;
    };
    SoundInstance.prototype._toSec = function (time) {
        if (time > 10) {
            time /= 1000;
        }
        return time || 0;
    };
    Object.defineProperty(SoundInstance.prototype, "_enabled", {
        set: function (enabled) {
            var _this = this;
            this._parent.nodes.script.onaudioprocess = !enabled ? null : function () {
                _this._update();
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundInstance.prototype, "progress", {
        get: function () {
            return this._progress;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundInstance.prototype, "paused", {
        get: function () {
            return this._paused;
        },
        set: function (paused) {
            if (paused !== this._paused) {
                this._paused = paused;
                if (paused) {
                    this._internalStop();
                    this.emit("paused");
                }
                else {
                    this.emit("resumed");
                    this.play(this._elapsed % this._duration, this._end, this._speed, this._loop, this._fadeIn, this._fadeOut);
                }
                this.emit("pause", paused);
            }
        },
        enumerable: true,
        configurable: true
    });
    SoundInstance.prototype.destroy = function () {
        this.removeAllListeners();
        this._internalStop();
        this._source = null;
        this._speed = 0;
        this._end = 0;
        this._parent = null;
        this._elapsed = 0;
        this._duration = 0;
        this._loop = false;
        this._fadeIn = 0;
        this._fadeOut = 0;
        this._paused = false;
        if (SoundInstance._pool.indexOf(this) < 0) {
            SoundInstance._pool.push(this);
        }
    };
    SoundInstance.prototype.toString = function () {
        return "[SoundInstance id=" + this.id + "]";
    };
    SoundInstance.prototype._now = function () {
        return this._parent.context.audioContext.currentTime;
    };
    SoundInstance.prototype._update = function (force) {
        if (force === void 0) { force = false; }
        if (this._source) {
            var now = this._now();
            var delta = now - this._lastUpdate;
            if (delta > 0 || force) {
                this._elapsed += delta;
                this._lastUpdate = now;
                var duration = this._duration;
                var progress = ((this._elapsed * this._speed) % duration) / duration;
                if (this._fadeIn || this._fadeOut) {
                    var position = progress * duration;
                    var gain = this._parent.nodes.gain.gain;
                    var maxVolume = this._parent.volume;
                    if (this._fadeIn) {
                        if (position <= this._fadeIn && progress < 1) {
                            gain.value = maxVolume * (position / this._fadeIn);
                        }
                        else {
                            gain.value = maxVolume;
                            this._fadeIn = 0;
                        }
                    }
                    if (this._fadeOut && position >= duration - this._fadeOut) {
                        var percent = (duration - position) / this._fadeOut;
                        gain.value = maxVolume * percent;
                    }
                }
                this._progress = progress;
                this.emit("progress", this._progress, duration);
            }
        }
    };
    SoundInstance.prototype._init = function (parent) {
        this._parent = parent;
    };
    SoundInstance.prototype._internalStop = function () {
        if (this._source) {
            this._enabled = false;
            this._source.onended = null;
            this._source.stop();
            this._source = null;
            this._parent.volume = this._parent.volume;
        }
    };
    SoundInstance.prototype._onComplete = function () {
        if (this._source) {
            this._enabled = false;
            this._source.onended = null;
        }
        this._source = null;
        this._progress = 1;
        this.emit("progress", 1, this._duration);
        this.emit("end", this);
    };
    return SoundInstance;
}(PIXI.utils.EventEmitter));
SoundInstance._pool = [];
exports.default = SoundInstance;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Filterable_1 = require("./Filterable");
var filters = require("./filters");
var Sound_1 = require("./Sound");
var SoundContext_1 = require("./SoundContext");
var SoundInstance_1 = require("./SoundInstance");
var SoundSprite_1 = require("./SoundSprite");
var SoundUtils_1 = require("./SoundUtils");
var SoundLibrary = (function () {
    function SoundLibrary() {
        if (this.supported) {
            this._context = new SoundContext_1.default();
        }
        this._sounds = {};
        this.utils = SoundUtils_1.default;
        this.filters = filters;
        this.Sound = Sound_1.default;
        this.SoundInstance = SoundInstance_1.default;
        this.SoundLibrary = SoundLibrary;
        this.SoundSprite = SoundSprite_1.default;
        this.Filterable = Filterable_1.default;
    }
    Object.defineProperty(SoundLibrary.prototype, "context", {
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundLibrary.prototype, "filtersAll", {
        get: function () {
            return this._context.filters;
        },
        set: function (filters) {
            this._context.filters = filters;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SoundLibrary.prototype, "supported", {
        get: function () {
            return SoundContext_1.default.AudioContext !== null;
        },
        enumerable: true,
        configurable: true
    });
    SoundLibrary.prototype.add = function (source, sourceOptions) {
        if (typeof source === "object") {
            var results = {};
            for (var alias in source) {
                var options = this._getOptions(source[alias], sourceOptions);
                results[alias] = this.add(alias, options);
            }
            return results;
        }
        else if (typeof source === "string") {
            console.assert(!this._sounds[source], "Sound with alias " + source + " already exists.");
            if (sourceOptions instanceof Sound_1.default) {
                this._sounds[source] = sourceOptions;
                return sourceOptions;
            }
            else {
                var options = this._getOptions(sourceOptions);
                var sound = new Sound_1.default(this.context, options);
                this._sounds[source] = sound;
                return sound;
            }
        }
    };
    SoundLibrary.prototype._getOptions = function (source, overrides) {
        var options;
        if (typeof source === "string") {
            options = { src: source };
        }
        else if (source instanceof ArrayBuffer) {
            options = { srcBuffer: source };
        }
        else {
            options = source;
        }
        return Object.assign(options, overrides || {});
    };
    SoundLibrary.prototype.remove = function (alias) {
        this.exists(alias, true);
        this._sounds[alias].destroy();
        delete this._sounds[alias];
        return this;
    };
    Object.defineProperty(SoundLibrary.prototype, "volumeAll", {
        get: function () {
            return this._context.volume;
        },
        set: function (volume) {
            this._context.volume = volume;
        },
        enumerable: true,
        configurable: true
    });
    SoundLibrary.prototype.pauseAll = function () {
        this._context.paused = true;
        return this;
    };
    SoundLibrary.prototype.resumeAll = function () {
        this._context.paused = false;
        return this;
    };
    SoundLibrary.prototype.muteAll = function () {
        this._context.muted = true;
        return this;
    };
    SoundLibrary.prototype.unmuteAll = function () {
        this._context.muted = false;
        return this;
    };
    SoundLibrary.prototype.removeAll = function () {
        for (var alias in this._sounds) {
            this._sounds[alias].destroy();
            delete this._sounds[alias];
        }
        return this;
    };
    SoundLibrary.prototype.stopAll = function () {
        for (var alias in this._sounds) {
            this._sounds[alias].stop();
        }
        return this;
    };
    SoundLibrary.prototype.exists = function (alias, assert) {
        if (assert === void 0) { assert = false; }
        var exists = !!this._sounds[alias];
        if (assert) {
            console.assert(exists, "No sound matching alias '" + alias + "'.");
        }
        return exists;
    };
    SoundLibrary.prototype.find = function (alias) {
        this.exists(alias, true);
        return this._sounds[alias];
    };
    SoundLibrary.prototype.play = function (alias, options) {
        return this.find(alias).play(options);
    };
    SoundLibrary.prototype.stop = function (alias) {
        return this.find(alias).stop();
    };
    SoundLibrary.prototype.pause = function (alias) {
        return this.find(alias).pause();
    };
    SoundLibrary.prototype.resume = function (alias) {
        return this.find(alias).resume();
    };
    SoundLibrary.prototype.volume = function (alias, volume) {
        var sound = this.find(alias);
        if (volume !== undefined) {
            sound.volume = volume;
        }
        return sound.volume;
    };
    SoundLibrary.prototype.duration = function (alias) {
        return this.find(alias).duration;
    };
    SoundLibrary.prototype.destroy = function () {
        this.removeAll();
        this._sounds = null;
        this._context = null;
    };
    return SoundLibrary;
}());
exports.default = SoundLibrary;

},{"./Filterable":1,"./Sound":3,"./SoundContext":4,"./SoundInstance":5,"./SoundSprite":8,"./SoundUtils":9,"./filters":16}],7:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Filterable_1 = require("./Filterable");
var SoundNodes = (function (_super) {
    __extends(SoundNodes, _super);
    function SoundNodes(context) {
        var _this = this;
        var audioContext = context.audioContext;
        var bufferSource = audioContext.createBufferSource();
        var script = audioContext.createScriptProcessor(SoundNodes.BUFFER_SIZE);
        var gain = audioContext.createGain();
        var analyser = audioContext.createAnalyser();
        bufferSource.connect(analyser);
        analyser.connect(gain);
        gain.connect(context.destination);
        script.connect(context.destination);
        _this = _super.call(this, analyser, gain) || this;
        _this.context = context;
        _this.bufferSource = bufferSource;
        _this.script = script;
        _this.gain = gain;
        _this.analyser = analyser;
        return _this;
    }
    SoundNodes.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.bufferSource.disconnect();
        this.script.disconnect();
        this.gain.disconnect();
        this.analyser.disconnect();
        this.bufferSource = null;
        this.script = null;
        this.gain = null;
        this.analyser = null;
        this.context = null;
    };
    SoundNodes.prototype.cloneBufferSource = function () {
        var orig = this.bufferSource;
        var clone = this.context.audioContext.createBufferSource();
        clone.buffer = orig.buffer;
        clone.playbackRate.value = orig.playbackRate.value;
        clone.loop = orig.loop;
        clone.connect(this.destination);
        return clone;
    };
    return SoundNodes;
}(Filterable_1.default));
SoundNodes.BUFFER_SIZE = 256;
exports.default = SoundNodes;

},{"./Filterable":1}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SoundSprite = (function () {
    function SoundSprite(parent, options) {
        this.parent = parent;
        Object.assign(this, options);
        this.duration = this.end - this.start;
        console.assert(this.duration > 0, "End time must be after start time");
    }
    SoundSprite.prototype.play = function (complete) {
        return this.parent.play(Object.assign({
            complete: complete,
            speed: this.speed || this.parent.speed,
            end: this.end,
            start: this.start,
        }));
    };
    SoundSprite.prototype.destroy = function () {
        this.parent = null;
    };
    return SoundSprite;
}());
exports.default = SoundSprite;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require("uuid/v4");
var index_1 = require("./index");
var Sound_1 = require("./Sound");
var SoundUtils = (function () {
    function SoundUtils() {
    }
    SoundUtils.sineTone = function (hertz, seconds) {
        if (hertz === void 0) { hertz = 200; }
        if (seconds === void 0) { seconds = 1; }
        var soundContext = index_1.default.context;
        var soundInstance = new Sound_1.default(soundContext, {
            singleInstance: true,
        });
        var nChannels = 1;
        var sampleRate = 48000;
        var amplitude = 2;
        var buffer = soundContext.audioContext.createBuffer(nChannels, seconds * sampleRate, sampleRate);
        var fArray = buffer.getChannelData(0);
        for (var i = 0; i < fArray.length; i++) {
            var time = i / buffer.sampleRate;
            var angle = hertz * time * Math.PI;
            fArray[i] = Math.sin(angle) * amplitude;
        }
        soundInstance.buffer = buffer;
        soundInstance.isLoaded = true;
        return soundInstance;
    };
    SoundUtils.render = function (sound, options) {
        options = Object.assign({
            width: 512,
            height: 128,
            fill: "black",
        }, options || {});
        console.assert(!!sound.buffer, "No buffer found, load first");
        var canvas = document.createElement("canvas");
        canvas.width = options.width;
        canvas.height = options.height;
        var context = canvas.getContext("2d");
        context.fillStyle = options.fill;
        var data = sound.buffer.getChannelData(0);
        var step = Math.ceil(data.length / options.width);
        var amp = options.height / 2;
        for (var i = 0; i < options.width; i++) {
            var min = 1.0;
            var max = -1.0;
            for (var j = 0; j < step; j++) {
                var datum = data[(i * step) + j];
                if (datum < min) {
                    min = datum;
                }
                if (datum > max) {
                    max = datum;
                }
            }
            context.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
        }
        return PIXI.BaseTexture.fromCanvas(canvas);
    };
    SoundUtils.playOnce = function (src, callback) {
        var alias = uuid();
        index_1.default.add(alias, {
            src: src,
            preload: true,
            autoPlay: true,
            loaded: function (err) {
                if (err) {
                    console.error(err);
                    index_1.default.remove(alias);
                    if (callback) {
                        callback(err);
                    }
                }
            },
            complete: function () {
                index_1.default.remove(alias);
                if (callback) {
                    callback(null);
                }
            },
        });
        return alias;
    };
    return SoundUtils;
}());
exports.default = SoundUtils;

},{"./Sound":3,"./index":17,"uuid/v4":20}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sound_1 = require("./Sound");
var SoundLibrary_1 = require("./SoundLibrary");
var SoundLibraryPrototype = SoundLibrary_1.default.prototype;
var SoundPrototype = Sound_1.default.prototype;
SoundLibraryPrototype.sound = function sound(alias) {
    console.warn("PIXI.sound.sound is deprecated, use PIXI.sound.find");
    return this.find(alias);
};
SoundLibraryPrototype.panning = function panning(alias, panningValue) {
    console.warn("PIXI.sound.panning is deprecated, use PIXI.sound.filters.StereoPan");
    return 0;
};
SoundLibraryPrototype.addMap = function addMap(map, globalOptions) {
    console.warn("PIXI.sound.addMap is deprecated, use PIXI.sound.add");
    return this.add(map, globalOptions);
};
Object.defineProperty(SoundLibraryPrototype, "SoundUtils", {
    get: function () {
        console.warn("PIXI.sound.SoundUtils is deprecated, use PIXI.sound.utils");
        return this.utils;
    },
});
Object.defineProperty(SoundPrototype, "block", {
    get: function () {
        console.warn("PIXI.sound.Sound.prototype.block is deprecated, use singleInstance instead");
        return this.singleInstance;
    },
    set: function (value) {
        console.warn("PIXI.sound.Sound.prototype.block is deprecated, use singleInstance instead");
        this.singleInstance = value;
    },
});
Object.defineProperty(SoundPrototype, "loaded", {
    get: function () {
        console.warn("PIXI.sound.Sound.prototype.loaded is deprecated, use constructor option instead");
        return null;
    },
    set: function (value) {
        console.warn("PIXI.sound.Sound.prototype.loaded is deprecated, use constructor option instead");
    },
});
Object.defineProperty(SoundPrototype, "complete", {
    get: function () {
        console.warn("PIXI.sound.Sound.prototype.complete is deprecated, use constructor option instead");
        return null;
    },
    set: function (value) {
        console.warn("PIXI.sound.Sound.prototype.complete is deprecated, use constructor option instead");
    },
});

},{"./Sound":3,"./SoundLibrary":6}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Filter_1 = require("./Filter");
var index_1 = require("../index");
var DistortionFilter = (function (_super) {
    __extends(DistortionFilter, _super);
    function DistortionFilter(amount) {
        if (amount === void 0) { amount = 0; }
        var _this = this;
        var distortion = index_1.default.context.audioContext.createWaveShaper();
        _this = _super.call(this, distortion) || this;
        _this._distortion = distortion;
        _this.amount = amount;
        return _this;
    }
    Object.defineProperty(DistortionFilter.prototype, "amount", {
        get: function () {
            return this._amount;
        },
        set: function (value) {
            value *= 1000;
            this._amount = value;
            var samples = 44100;
            var curve = new Float32Array(samples);
            var deg = Math.PI / 180;
            var i = 0;
            var x;
            for (; i < samples; ++i) {
                x = i * 2 / samples - 1;
                curve[i] = (3 + value) * x * 20 * deg / (Math.PI + value * Math.abs(x));
            }
            this._distortion.curve = curve;
            this._distortion.oversample = '4x';
        },
        enumerable: true,
        configurable: true
    });
    DistortionFilter.prototype.destroy = function () {
        this._distortion = null;
        _super.prototype.destroy.call(this);
    };
    return DistortionFilter;
}(Filter_1.default));
exports.default = DistortionFilter;

},{"../index":17,"./Filter":13}],12:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Filter_1 = require("./Filter");
var index_1 = require("../index");
var EqualizerFilter = (function (_super) {
    __extends(EqualizerFilter, _super);
    function EqualizerFilter(f32, f64, f125, f250, f500, f1k, f2k, f4k, f8k, f16k) {
        if (f32 === void 0) { f32 = 0; }
        if (f64 === void 0) { f64 = 0; }
        if (f125 === void 0) { f125 = 0; }
        if (f250 === void 0) { f250 = 0; }
        if (f500 === void 0) { f500 = 0; }
        if (f1k === void 0) { f1k = 0; }
        if (f2k === void 0) { f2k = 0; }
        if (f4k === void 0) { f4k = 0; }
        if (f8k === void 0) { f8k = 0; }
        if (f16k === void 0) { f16k = 0; }
        var _this = this;
        var equalizerBands = [
            {
                f: EqualizerFilter.F32,
                type: 'lowshelf',
                gain: f32
            },
            {
                f: EqualizerFilter.F64,
                type: 'peaking',
                gain: f64
            },
            {
                f: EqualizerFilter.F125,
                type: 'peaking',
                gain: f125
            },
            {
                f: EqualizerFilter.F250,
                type: 'peaking',
                gain: f250
            },
            {
                f: EqualizerFilter.F500,
                type: 'peaking',
                gain: f500
            },
            {
                f: EqualizerFilter.F1K,
                type: 'peaking',
                gain: f1k
            },
            {
                f: EqualizerFilter.F2K,
                type: 'peaking',
                gain: f2k
            },
            {
                f: EqualizerFilter.F4K,
                type: 'peaking',
                gain: f4k
            },
            {
                f: EqualizerFilter.F8K,
                type: 'peaking',
                gain: f8k
            },
            {
                f: EqualizerFilter.F16K,
                type: 'highshelf',
                gain: f16k
            }
        ];
        var bands = equalizerBands.map(function (band) {
            var filter = index_1.default.context.audioContext.createBiquadFilter();
            filter.type = band.type;
            filter.gain.value = band.gain;
            filter.Q.value = 1;
            filter.frequency.value = band.f;
            return filter;
        });
        _this = _super.call(this, bands[0], bands[bands.length - 1]) || this;
        _this.bands = bands;
        _this.bandsMap = {};
        for (var i = 0; i < _this.bands.length; i++) {
            var node = _this.bands[i];
            if (i > 0) {
                _this.bands[i - 1].connect(node);
            }
            _this.bandsMap[node.frequency.value] = node;
        }
        return _this;
    }
    EqualizerFilter.prototype.setGain = function (frequency, gain) {
        if (gain === void 0) { gain = 0; }
        if (!this.bandsMap[frequency]) {
            throw 'No band found for frequency ' + frequency;
        }
        this.bandsMap[frequency].gain.value = gain;
    };
    EqualizerFilter.prototype.reset = function () {
        this.bands.forEach(function (band) {
            band.gain.value = 0;
        });
    };
    EqualizerFilter.prototype.destroy = function () {
        this.bands.forEach(function (band) {
            band.disconnect();
        });
        this.bands = null;
        this.bandsMap = null;
    };
    return EqualizerFilter;
}(Filter_1.default));
EqualizerFilter.F32 = 32;
EqualizerFilter.F64 = 64;
EqualizerFilter.F125 = 125;
EqualizerFilter.F250 = 250;
EqualizerFilter.F500 = 500;
EqualizerFilter.F1K = 1000;
EqualizerFilter.F2K = 2000;
EqualizerFilter.F4K = 4000;
EqualizerFilter.F8K = 8000;
EqualizerFilter.F16K = 16000;
exports.default = EqualizerFilter;

},{"../index":17,"./Filter":13}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Filter = (function () {
    function Filter(destination, source) {
        this.destination = destination;
        this.source = source || destination;
    }
    Filter.prototype.connect = function (destination) {
        this.source.connect(destination);
    };
    Filter.prototype.disconnect = function () {
        this.source.disconnect();
    };
    Filter.prototype.destroy = function () {
        this.disconnect();
        this.destination = null;
        this.source = null;
    };
    return Filter;
}());
exports.default = Filter;

},{}],14:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Filter_1 = require("./Filter");
var index_1 = require("../index");
var ReverbFilter = (function (_super) {
    __extends(ReverbFilter, _super);
    function ReverbFilter(seconds, decay, reverse) {
        if (seconds === void 0) { seconds = 3; }
        if (decay === void 0) { decay = 2; }
        if (reverse === void 0) { reverse = false; }
        var _this = this;
        var convolver = index_1.default.context.audioContext.createConvolver();
        _this = _super.call(this, convolver) || this;
        _this._convolver = convolver;
        _this._seconds = _this._clamp(seconds, 1, 50);
        _this._decay = _this._clamp(decay, 0, 100);
        _this._reverse = reverse;
        _this._rebuild();
        return _this;
    }
    ReverbFilter.prototype._clamp = function (value, min, max) {
        return Math.min(max, Math.max(min, value));
    };
    Object.defineProperty(ReverbFilter.prototype, "seconds", {
        get: function () {
            return this._seconds;
        },
        set: function (seconds) {
            this._seconds = this._clamp(seconds, 1, 50);
            this._rebuild();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReverbFilter.prototype, "decay", {
        get: function () {
            return this._decay;
        },
        set: function (decay) {
            this._decay = this._clamp(decay, 0, 100);
            this._rebuild();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReverbFilter.prototype, "reverse", {
        get: function () {
            return this._reverse;
        },
        set: function (reverse) {
            this._reverse = reverse;
            this._rebuild();
        },
        enumerable: true,
        configurable: true
    });
    ReverbFilter.prototype._rebuild = function () {
        var context = index_1.default.context.audioContext;
        var rate = context.sampleRate;
        var length = rate * this._seconds;
        var impulse = context.createBuffer(2, length, rate);
        var impulseL = impulse.getChannelData(0);
        var impulseR = impulse.getChannelData(1);
        var n;
        for (var i = 0; i < length; i++) {
            n = this._reverse ? length - i : i;
            impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, this._decay);
            impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, this._decay);
        }
        this._convolver.buffer = impulse;
    };
    ReverbFilter.prototype.destroy = function () {
        this._convolver = null;
        _super.prototype.destroy.call(this);
    };
    return ReverbFilter;
}(Filter_1.default));
exports.default = ReverbFilter;

},{"../index":17,"./Filter":13}],15:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Filter_1 = require("./Filter");
var index_1 = require("../index");
var StereoFilter = (function (_super) {
    __extends(StereoFilter, _super);
    function StereoFilter(pan) {
        if (pan === void 0) { pan = 0; }
        var _this = this;
        var stereo;
        var panner;
        var destination;
        var audioContext = index_1.default.context.audioContext;
        if (audioContext.createStereoPanner) {
            stereo = audioContext.createStereoPanner();
            destination = stereo;
        }
        else {
            panner = audioContext.createPanner();
            panner.panningModel = 'equalpower';
            destination = panner;
        }
        _this = _super.call(this, destination) || this;
        _this._stereo = stereo;
        _this._panner = panner;
        _this.pan = pan;
        return _this;
    }
    Object.defineProperty(StereoFilter.prototype, "pan", {
        get: function () {
            return this._pan;
        },
        set: function (value) {
            this._pan = value;
            if (this._stereo) {
                this._stereo.pan.value = value;
            }
            else {
                this._panner.setPosition(value, 0, 1 - Math.abs(value));
            }
        },
        enumerable: true,
        configurable: true
    });
    StereoFilter.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this._stereo = null;
        this._panner = null;
    };
    return StereoFilter;
}(Filter_1.default));
exports.default = StereoFilter;

},{"../index":17,"./Filter":13}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Filter_1 = require("./Filter");
exports.Filter = Filter_1.default;
var EqualizerFilter_1 = require("./EqualizerFilter");
exports.EqualizerFilter = EqualizerFilter_1.default;
var DistortionFilter_1 = require("./DistortionFilter");
exports.DistortionFilter = DistortionFilter_1.default;
var StereoFilter_1 = require("./StereoFilter");
exports.StereoFilter = StereoFilter_1.default;
var ReverbFilter_1 = require("./ReverbFilter");
exports.ReverbFilter = ReverbFilter_1.default;

},{"./DistortionFilter":11,"./EqualizerFilter":12,"./Filter":13,"./ReverbFilter":14,"./StereoFilter":15}],17:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LoaderMiddleware_1 = require("./LoaderMiddleware");
var SoundLibrary_1 = require("./SoundLibrary");
require("./deprecations");
var sound = new SoundLibrary_1.default();
if (global.PIXI === undefined) {
    throw new Error("pixi.js is required");
}
if (PIXI.loaders !== undefined) {
    LoaderMiddleware_1.install();
}
Object.defineProperty(PIXI, "sound", {
    get: function () { return sound; },
});
exports.default = sound;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./LoaderMiddleware":2,"./SoundLibrary":6,"./deprecations":10}],18:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

module.exports = bytesToUuid;

},{}],19:[function(require,module,exports){
(function (global){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection
var rng;

var crypto = global.crypto || global.msCrypto; // for IE 11
if (crypto && crypto.getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16);
  rng = function whatwgRNG() {
    crypto.getRandomValues(rnds8);
    return rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var  rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

module.exports = rng;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],20:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":18,"./lib/rng":19}]},{},[17])(17)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvRmlsdGVyYWJsZS5qcyIsImxpYi9Mb2FkZXJNaWRkbGV3YXJlLmpzIiwibGliL1NvdW5kLmpzIiwibGliL1NvdW5kQ29udGV4dC5qcyIsImxpYi9Tb3VuZEluc3RhbmNlLmpzIiwibGliL1NvdW5kTGlicmFyeS5qcyIsImxpYi9Tb3VuZE5vZGVzLmpzIiwibGliL1NvdW5kU3ByaXRlLmpzIiwibGliL1NvdW5kVXRpbHMuanMiLCJsaWIvZGVwcmVjYXRpb25zLmpzIiwibGliL2ZpbHRlcnMvRGlzdG9ydGlvbkZpbHRlci5qcyIsImxpYi9maWx0ZXJzL0VxdWFsaXplckZpbHRlci5qcyIsImxpYi9maWx0ZXJzL0ZpbHRlci5qcyIsImxpYi9maWx0ZXJzL1JldmVyYkZpbHRlci5qcyIsImxpYi9maWx0ZXJzL1N0ZXJlb0ZpbHRlci5qcyIsImxpYi9maWx0ZXJzL2luZGV4LmpzIiwibGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3V1aWQvbGliL2J5dGVzVG9VdWlkLmpzIiwibm9kZV9tb2R1bGVzL3V1aWQvbGliL3JuZy1icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3V1aWQvdjQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBGaWx0ZXJhYmxlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBGaWx0ZXJhYmxlKGlucHV0LCBvdXRwdXQpIHtcbiAgICAgICAgdGhpcy5fb3V0cHV0ID0gb3V0cHV0O1xuICAgICAgICB0aGlzLl9pbnB1dCA9IGlucHV0O1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRmlsdGVyYWJsZS5wcm90b3R5cGUsIFwiZGVzdGluYXRpb25cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pbnB1dDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEZpbHRlcmFibGUucHJvdG90eXBlLCBcImZpbHRlcnNcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maWx0ZXJzO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChmaWx0ZXJzKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2ZpbHRlcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGZpbHRlcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVycyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5faW5wdXQuY29ubmVjdCh0aGlzLl9vdXRwdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZpbHRlcnMgJiYgZmlsdGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJzID0gZmlsdGVycy5zbGljZSgwKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbnB1dC5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgdmFyIHByZXZGaWx0ZXJfMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgZmlsdGVycy5mb3JFYWNoKGZ1bmN0aW9uIChmaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZGaWx0ZXJfMSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2lucHV0LmNvbm5lY3QoZmlsdGVyLmRlc3RpbmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXZGaWx0ZXJfMS5jb25uZWN0KGZpbHRlci5kZXN0aW5hdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcHJldkZpbHRlcl8xID0gZmlsdGVyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHByZXZGaWx0ZXJfMS5jb25uZWN0KHRoaXMuX291dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIEZpbHRlcmFibGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZmlsdGVycyA9IG51bGw7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fb3V0cHV0ID0gbnVsbDtcbiAgICB9O1xuICAgIHJldHVybiBGaWx0ZXJhYmxlO1xufSgpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEZpbHRlcmFibGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1GaWx0ZXJhYmxlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGluZGV4XzEgPSByZXF1aXJlKFwiLi9pbmRleFwiKTtcbnZhciBBVURJT19FWFRFTlNJT05TID0gW1wid2F2XCIsIFwibXAzXCIsIFwib2dnXCIsIFwib2dhXCIsIFwibTRhXCJdO1xuZnVuY3Rpb24gbWlkZGxld2FyZShyZXNvdXJjZSwgbmV4dCkge1xuICAgIGlmIChyZXNvdXJjZS5kYXRhICYmIEFVRElPX0VYVEVOU0lPTlMuaW5kZXhPZihyZXNvdXJjZS5fZ2V0RXh0ZW5zaW9uKCkpID4gLTEpIHtcbiAgICAgICAgcmVzb3VyY2Uuc291bmQgPSBpbmRleF8xLmRlZmF1bHQuYWRkKHJlc291cmNlLm5hbWUsIHtcbiAgICAgICAgICAgIGxvYWRlZDogbmV4dCxcbiAgICAgICAgICAgIHByZWxvYWQ6IHRydWUsXG4gICAgICAgICAgICBzcmNCdWZmZXI6IHJlc291cmNlLmRhdGEsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbmV4dCgpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG1pZGRsZXdhcmVGYWN0b3J5KCkge1xuICAgIHJldHVybiBtaWRkbGV3YXJlO1xufVxuZnVuY3Rpb24gaW5zdGFsbCgpIHtcbiAgICB2YXIgUmVzb3VyY2UgPSBQSVhJLmxvYWRlcnMuUmVzb3VyY2U7XG4gICAgQVVESU9fRVhURU5TSU9OUy5mb3JFYWNoKGZ1bmN0aW9uIChleHQpIHtcbiAgICAgICAgUmVzb3VyY2Uuc2V0RXh0ZW5zaW9uWGhyVHlwZShleHQsIFJlc291cmNlLlhIUl9SRVNQT05TRV9UWVBFLkJVRkZFUik7XG4gICAgICAgIFJlc291cmNlLnNldEV4dGVuc2lvbkxvYWRUeXBlKGV4dCwgUmVzb3VyY2UuTE9BRF9UWVBFLlhIUik7XG4gICAgfSk7XG4gICAgUElYSS5sb2FkZXJzLkxvYWRlci5hZGRQaXhpTWlkZGxld2FyZShtaWRkbGV3YXJlRmFjdG9yeSk7XG4gICAgUElYSS5sb2FkZXIudXNlKG1pZGRsZXdhcmUpO1xufVxuZXhwb3J0cy5pbnN0YWxsID0gaW5zdGFsbDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUxvYWRlck1pZGRsZXdhcmUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgaW5kZXhfMSA9IHJlcXVpcmUoXCIuL2luZGV4XCIpO1xudmFyIFNvdW5kSW5zdGFuY2VfMSA9IHJlcXVpcmUoXCIuL1NvdW5kSW5zdGFuY2VcIik7XG52YXIgU291bmROb2Rlc18xID0gcmVxdWlyZShcIi4vU291bmROb2Rlc1wiKTtcbnZhciBTb3VuZFNwcml0ZV8xID0gcmVxdWlyZShcIi4vU291bmRTcHJpdGVcIik7XG52YXIgU291bmQgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNvdW5kKGNvbnRleHQsIHNvdXJjZSkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHt9O1xuICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgb3B0aW9ucy5zcmMgPSBzb3VyY2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc291cmNlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICAgIG9wdGlvbnMuc3JjQnVmZmVyID0gc291cmNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBhdXRvUGxheTogZmFsc2UsXG4gICAgICAgICAgICBzaW5nbGVJbnN0YW5jZTogZmFsc2UsXG4gICAgICAgICAgICBzcmM6IG51bGwsXG4gICAgICAgICAgICBzcmNCdWZmZXI6IG51bGwsXG4gICAgICAgICAgICBwcmVsb2FkOiBmYWxzZSxcbiAgICAgICAgICAgIHZvbHVtZTogMSxcbiAgICAgICAgICAgIHNwZWVkOiAxLFxuICAgICAgICAgICAgY29tcGxldGU6IG51bGwsXG4gICAgICAgICAgICBsb2FkZWQ6IG51bGwsXG4gICAgICAgICAgICBsb29wOiBmYWxzZSxcbiAgICAgICAgICAgIHVzZVhIUjogdHJ1ZSxcbiAgICAgICAgfSwgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB0aGlzLl9ub2RlcyA9IG5ldyBTb3VuZE5vZGVzXzEuZGVmYXVsdCh0aGlzLl9jb250ZXh0KTtcbiAgICAgICAgdGhpcy5fc291cmNlID0gdGhpcy5fbm9kZXMuYnVmZmVyU291cmNlO1xuICAgICAgICB0aGlzLl9pbnN0YW5jZXMgPSBbXTtcbiAgICAgICAgdGhpcy5fc3ByaXRlcyA9IHt9O1xuICAgICAgICB2YXIgY29tcGxldGUgPSBvcHRpb25zLmNvbXBsZXRlO1xuICAgICAgICB0aGlzLl9hdXRvUGxheU9wdGlvbnMgPSBjb21wbGV0ZSA/IHsgY29tcGxldGU6IGNvbXBsZXRlIH0gOiBudWxsO1xuICAgICAgICB0aGlzLmlzTG9hZGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYXV0b1BsYXkgPSBvcHRpb25zLmF1dG9QbGF5O1xuICAgICAgICB0aGlzLnNpbmdsZUluc3RhbmNlID0gb3B0aW9ucy5zaW5nbGVJbnN0YW5jZTtcbiAgICAgICAgdGhpcy5wcmVsb2FkID0gb3B0aW9ucy5wcmVsb2FkIHx8IHRoaXMuYXV0b1BsYXk7XG4gICAgICAgIHRoaXMuc3JjID0gb3B0aW9ucy5zcmM7XG4gICAgICAgIHRoaXMuc3JjQnVmZmVyID0gb3B0aW9ucy5zcmNCdWZmZXI7XG4gICAgICAgIHRoaXMudXNlWEhSID0gb3B0aW9ucy51c2VYSFI7XG4gICAgICAgIHRoaXMudm9sdW1lID0gb3B0aW9ucy52b2x1bWU7XG4gICAgICAgIHRoaXMubG9vcCA9IG9wdGlvbnMubG9vcDtcbiAgICAgICAgdGhpcy5zcGVlZCA9IG9wdGlvbnMuc3BlZWQ7XG4gICAgICAgIGlmIChvcHRpb25zLnNwcml0ZXMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkU3ByaXRlcyhvcHRpb25zLnNwcml0ZXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByZWxvYWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2JlZ2luUHJlbG9hZChvcHRpb25zLmxvYWRlZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgU291bmQuZnJvbSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBuZXcgU291bmQoaW5kZXhfMS5kZWZhdWx0LmNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH07XG4gICAgU291bmQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX25vZGVzLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5fbm9kZXMgPSBudWxsO1xuICAgICAgICB0aGlzLl9jb250ZXh0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fc291cmNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZW1vdmVTcHJpdGVzKCk7XG4gICAgICAgIHRoaXMuX3Nwcml0ZXMgPSBudWxsO1xuICAgICAgICB0aGlzLnNyY0J1ZmZlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX3JlbW92ZUluc3RhbmNlcygpO1xuICAgICAgICB0aGlzLl9pbnN0YW5jZXMgPSBudWxsO1xuICAgIH07XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kLnByb3RvdHlwZSwgXCJpc1BsYXlhYmxlXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pc0xvYWRlZCAmJiAhIXRoaXMuX3NvdXJjZSAmJiAhIXRoaXMuX3NvdXJjZS5idWZmZXI7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZC5wcm90b3R5cGUsIFwiY29udGV4dFwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnRleHQ7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZC5wcm90b3R5cGUsIFwidm9sdW1lXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdm9sdW1lO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2b2x1bWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZvbHVtZSA9IHRoaXMuX25vZGVzLmdhaW4uZ2Fpbi52YWx1ZSA9IHZvbHVtZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kLnByb3RvdHlwZSwgXCJsb29wXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc291cmNlLmxvb3A7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKGxvb3ApIHtcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZS5sb29wID0gISFsb29wO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmQucHJvdG90eXBlLCBcImJ1ZmZlclwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZS5idWZmZXI7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKGJ1ZmZlcikge1xuICAgICAgICAgICAgdGhpcy5fc291cmNlLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kLnByb3RvdHlwZSwgXCJkdXJhdGlvblwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQodGhpcy5pc1BsYXlhYmxlLCBcIlNvdW5kIG5vdCB5ZXQgcGxheWFibGUsIG5vIGR1cmF0aW9uXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZS5idWZmZXIuZHVyYXRpb247XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZC5wcm90b3R5cGUsIFwibm9kZXNcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9ub2RlcztcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kLnByb3RvdHlwZSwgXCJmaWx0ZXJzXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbm9kZXMuZmlsdGVycztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAoZmlsdGVycykge1xuICAgICAgICAgICAgdGhpcy5fbm9kZXMuZmlsdGVycyA9IGZpbHRlcnM7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZC5wcm90b3R5cGUsIFwic3BlZWRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fc291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmQucHJvdG90eXBlLCBcImluc3RhbmNlc1wiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2luc3RhbmNlcztcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kLnByb3RvdHlwZSwgXCJzcHJpdGVzXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc3ByaXRlcztcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgU291bmQucHJvdG90eXBlLmFkZFNwcml0ZXMgPSBmdW5jdGlvbiAoc291cmNlLCBkYXRhKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc291cmNlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgYWxpYXMgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1thbGlhc10gPSB0aGlzLmFkZFNwcml0ZXMoYWxpYXMsIHNvdXJjZVthbGlhc10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHNvdXJjZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoIXRoaXMuX3Nwcml0ZXNbc291cmNlXSwgXCJBbGlhcyBcIiArIHNvdXJjZSArIFwiIGlzIGFscmVhZHkgdGFrZW5cIik7XG4gICAgICAgICAgICB2YXIgc3ByaXRlID0gbmV3IFNvdW5kU3ByaXRlXzEuZGVmYXVsdCh0aGlzLCBkYXRhKTtcbiAgICAgICAgICAgIHRoaXMuX3Nwcml0ZXNbc291cmNlXSA9IHNwcml0ZTtcbiAgICAgICAgICAgIHJldHVybiBzcHJpdGU7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFNvdW5kLnByb3RvdHlwZS5yZW1vdmVTcHJpdGVzID0gZnVuY3Rpb24gKGFsaWFzKSB7XG4gICAgICAgIGlmICghYWxpYXMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIG5hbWVfMSBpbiB0aGlzLl9zcHJpdGVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVTcHJpdGVzKG5hbWVfMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgc3ByaXRlID0gdGhpcy5fc3ByaXRlc1thbGlhc107XG4gICAgICAgICAgICBpZiAoc3ByaXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBzcHJpdGUuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9zcHJpdGVzW2FsaWFzXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFNvdW5kLnByb3RvdHlwZS5wbGF5ID0gZnVuY3Rpb24gKHNvdXJjZSwgY29tcGxldGUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIG9wdGlvbnM7XG4gICAgICAgIGlmICh0eXBlb2Ygc291cmNlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB2YXIgc3ByaXRlID0gc291cmNlO1xuICAgICAgICAgICAgb3B0aW9ucyA9IHsgc3ByaXRlOiBzcHJpdGUsIGNvbXBsZXRlOiBjb21wbGV0ZSB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBzb3VyY2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICAgICAgb3B0aW9ucy5jb21wbGV0ZSA9IHNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBzb3VyY2U7XG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgY29tcGxldGU6IG51bGwsXG4gICAgICAgICAgICBsb2FkZWQ6IG51bGwsXG4gICAgICAgICAgICBzcHJpdGU6IG51bGwsXG4gICAgICAgICAgICBzdGFydDogMCxcbiAgICAgICAgICAgIGZhZGVJbjogMCxcbiAgICAgICAgICAgIGZhZGVPdXQ6IDAsXG4gICAgICAgIH0sIG9wdGlvbnMgfHwge30pO1xuICAgICAgICBpZiAob3B0aW9ucy5zcHJpdGUpIHtcbiAgICAgICAgICAgIHZhciBhbGlhcyA9IG9wdGlvbnMuc3ByaXRlO1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoISF0aGlzLl9zcHJpdGVzW2FsaWFzXSwgXCJBbGlhcyBcIiArIGFsaWFzICsgXCIgaXMgbm90IGF2YWlsYWJsZVwiKTtcbiAgICAgICAgICAgIHZhciBzcHJpdGUgPSB0aGlzLl9zcHJpdGVzW2FsaWFzXTtcbiAgICAgICAgICAgIG9wdGlvbnMuc3RhcnQgPSBzcHJpdGUuc3RhcnQ7XG4gICAgICAgICAgICBvcHRpb25zLmVuZCA9IHNwcml0ZS5lbmQ7XG4gICAgICAgICAgICBvcHRpb25zLnNwZWVkID0gc3ByaXRlLnNwZWVkO1xuICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMuc3ByaXRlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLm9mZnNldCkge1xuICAgICAgICAgICAgb3B0aW9ucy5zdGFydCA9IG9wdGlvbnMub2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5pc0xvYWRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5hdXRvUGxheSA9IHRydWU7XG4gICAgICAgICAgICAgICAgX3RoaXMuX2F1dG9QbGF5T3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgICAgICAgICAgX3RoaXMuX2JlZ2luUHJlbG9hZChmdW5jdGlvbiAoZXJyLCBzb3VuZCwgaW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5sb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmxvYWRlZChlcnIsIHNvdW5kLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2luZ2xlSW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZUluc3RhbmNlcygpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IFNvdW5kSW5zdGFuY2VfMS5kZWZhdWx0LmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgdGhpcy5faW5zdGFuY2VzLnB1c2goaW5zdGFuY2UpO1xuICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRydWU7XG4gICAgICAgIGluc3RhbmNlLm9uY2UoXCJlbmRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmNvbXBsZXRlKF90aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzLl9vbkNvbXBsZXRlKGluc3RhbmNlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGluc3RhbmNlLm9uY2UoXCJzdG9wXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLl9vbkNvbXBsZXRlKGluc3RhbmNlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGluc3RhbmNlLnBsYXkob3B0aW9ucy5zdGFydCwgb3B0aW9ucy5lbmQsIG9wdGlvbnMuc3BlZWQsIG9wdGlvbnMubG9vcCwgb3B0aW9ucy5mYWRlSW4sIG9wdGlvbnMuZmFkZU91dCk7XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9O1xuICAgIFNvdW5kLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNQbGF5YWJsZSkge1xuICAgICAgICAgICAgdGhpcy5hdXRvUGxheSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fYXV0b1BsYXlPcHRpb25zID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSB0aGlzLl9pbnN0YW5jZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIHRoaXMuX2luc3RhbmNlc1tpXS5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBTb3VuZC5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSB0aGlzLl9pbnN0YW5jZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIHRoaXMuX2luc3RhbmNlc1tpXS5wYXVzZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNQbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgO1xuICAgIFNvdW5kLnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSB0aGlzLl9pbnN0YW5jZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIHRoaXMuX2luc3RhbmNlc1tpXS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzUGxheWluZyA9IHRoaXMuX2luc3RhbmNlcy5sZW5ndGggPiAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFNvdW5kLnByb3RvdHlwZS5fYmVnaW5QcmVsb2FkID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0aGlzLnNyYykge1xuICAgICAgICAgICAgdGhpcy51c2VYSFIgPyB0aGlzLl9sb2FkVXJsKGNhbGxiYWNrKSA6IHRoaXMuX2xvYWRQYXRoKGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLnNyY0J1ZmZlcikge1xuICAgICAgICAgICAgdGhpcy5fZGVjb2RlKHRoaXMuc3JjQnVmZmVyLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcihcInNvdW5kLnNyYyBvciBzb3VuZC5zcmNCdWZmZXIgbXVzdCBiZSBzZXRcIikpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInNvdW5kLnNyYyBvciBzb3VuZC5zcmNCdWZmZXIgbXVzdCBiZSBzZXRcIik7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFNvdW5kLnByb3RvdHlwZS5fb25Db21wbGV0ZSA9IGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgICAgICBpZiAodGhpcy5faW5zdGFuY2VzKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLl9pbnN0YW5jZXMuaW5kZXhPZihpbnN0YW5jZSk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2luc3RhbmNlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5pc1BsYXlpbmcgPSB0aGlzLl9pbnN0YW5jZXMubGVuZ3RoID4gMDtcbiAgICAgICAgfVxuICAgICAgICBpbnN0YW5jZS5kZXN0cm95KCk7XG4gICAgfTtcbiAgICBTb3VuZC5wcm90b3R5cGUuX3JlbW92ZUluc3RhbmNlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IHRoaXMuX2luc3RhbmNlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgdGhpcy5faW5zdGFuY2VzW2ldLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnN0YW5jZXMubGVuZ3RoID0gMDtcbiAgICB9O1xuICAgIFNvdW5kLnByb3RvdHlwZS5fbG9hZFVybCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICB2YXIgc3JjID0gdGhpcy5zcmM7XG4gICAgICAgIHJlcXVlc3Qub3BlbihcIkdFVFwiLCBzcmMsIHRydWUpO1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcbiAgICAgICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5zcmNCdWZmZXIgPSByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgICAgICAgX3RoaXMuX2RlY29kZShyZXF1ZXN0LnJlc3BvbnNlLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgIH07XG4gICAgU291bmQucHJvdG90eXBlLl9sb2FkUGF0aCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgZnMgPSByZXF1aXJlKFwiZnNcIik7XG4gICAgICAgIHZhciBzcmMgPSB0aGlzLnNyYztcbiAgICAgICAgZnMucmVhZEZpbGUoc3JjLCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3IoXCJGaWxlIG5vdCBmb3VuZCBcIiArIF90aGlzLnNyYykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXJyYXlCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoZGF0YS5sZW5ndGgpO1xuICAgICAgICAgICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcik7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2aWV3W2ldID0gZGF0YVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzLnNyY0J1ZmZlciA9IGFycmF5QnVmZmVyO1xuICAgICAgICAgICAgX3RoaXMuX2RlY29kZShhcnJheUJ1ZmZlciwgY2FsbGJhY2spO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFNvdW5kLnByb3RvdHlwZS5fZGVjb2RlID0gZnVuY3Rpb24gKGFycmF5QnVmZmVyLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLl9jb250ZXh0LmRlY29kZShhcnJheUJ1ZmZlciwgZnVuY3Rpb24gKGVyciwgYnVmZmVyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuaXNMb2FkZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIF90aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmF1dG9QbGF5KSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlID0gX3RoaXMucGxheShfdGhpcy5fYXV0b1BsYXlPcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIF90aGlzLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBTb3VuZDtcbn0oKSk7XG5leHBvcnRzLmRlZmF1bHQgPSBTb3VuZDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVNvdW5kLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgRmlsdGVyYWJsZV8xID0gcmVxdWlyZShcIi4vRmlsdGVyYWJsZVwiKTtcbnZhciBTb3VuZENvbnRleHQgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTb3VuZENvbnRleHQsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU291bmRDb250ZXh0KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgY3R4ID0gbmV3IFNvdW5kQ29udGV4dC5BdWRpb0NvbnRleHQoKTtcbiAgICAgICAgdmFyIGdhaW4gPSBjdHguY3JlYXRlR2FpbigpO1xuICAgICAgICB2YXIgY29tcHJlc3NvciA9IGN0eC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IoKTtcbiAgICAgICAgdmFyIGFuYWx5c2VyID0gY3R4LmNyZWF0ZUFuYWx5c2VyKCk7XG4gICAgICAgIGFuYWx5c2VyLmNvbm5lY3QoZ2Fpbik7XG4gICAgICAgIGdhaW4uY29ubmVjdChjb21wcmVzc29yKTtcbiAgICAgICAgY29tcHJlc3Nvci5jb25uZWN0KGN0eC5kZXN0aW5hdGlvbik7XG4gICAgICAgIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgYW5hbHlzZXIsIGdhaW4pIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLl9jdHggPSBjdHg7XG4gICAgICAgIF90aGlzLl9vZmZsaW5lQ3R4ID0gbmV3IFNvdW5kQ29udGV4dC5PZmZsaW5lQXVkaW9Db250ZXh0KDEsIDIsIGN0eC5zYW1wbGVSYXRlKTtcbiAgICAgICAgX3RoaXMuX3VubG9ja2VkID0gZmFsc2U7XG4gICAgICAgIF90aGlzLmdhaW4gPSBnYWluO1xuICAgICAgICBfdGhpcy5jb21wcmVzc29yID0gY29tcHJlc3NvcjtcbiAgICAgICAgX3RoaXMuYW5hbHlzZXIgPSBhbmFseXNlcjtcbiAgICAgICAgX3RoaXMudm9sdW1lID0gMTtcbiAgICAgICAgX3RoaXMubXV0ZWQgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMucGF1c2VkID0gZmFsc2U7XG4gICAgICAgIGlmIChcIm9udG91Y2hzdGFydFwiIGluIHdpbmRvdyAmJiBjdHguc3RhdGUgIT09IFwicnVubmluZ1wiKSB7XG4gICAgICAgICAgICBfdGhpcy5fdW5sb2NrKCk7XG4gICAgICAgICAgICBfdGhpcy5fdW5sb2NrID0gX3RoaXMuX3VubG9jay5iaW5kKF90aGlzKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgX3RoaXMuX3VubG9jaywgdHJ1ZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCBfdGhpcy5fdW5sb2NrLCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCBfdGhpcy5fdW5sb2NrLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFNvdW5kQ29udGV4dC5wcm90b3R5cGUuX3VubG9jayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3VubG9ja2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wbGF5RW1wdHlTb3VuZCgpO1xuICAgICAgICBpZiAodGhpcy5fY3R4LnN0YXRlID09PSBcInJ1bm5pbmdcIikge1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLl91bmxvY2ssIHRydWUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsIHRoaXMuX3VubG9jaywgdHJ1ZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCB0aGlzLl91bmxvY2ssIHRydWUpO1xuICAgICAgICAgICAgdGhpcy5fdW5sb2NrZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTb3VuZENvbnRleHQucHJvdG90eXBlLnBsYXlFbXB0eVNvdW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc291cmNlID0gdGhpcy5fY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICBzb3VyY2UuYnVmZmVyID0gdGhpcy5fY3R4LmNyZWF0ZUJ1ZmZlcigxLCAxLCAyMjA1MCk7XG4gICAgICAgIHNvdXJjZS5jb25uZWN0KHRoaXMuX2N0eC5kZXN0aW5hdGlvbik7XG4gICAgICAgIHNvdXJjZS5zdGFydCgwLCAwLCAwKTtcbiAgICB9O1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZENvbnRleHQsIFwiQXVkaW9Db250ZXh0XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgd2luID0gd2luZG93O1xuICAgICAgICAgICAgcmV0dXJuICh3aW4uQXVkaW9Db250ZXh0IHx8XG4gICAgICAgICAgICAgICAgd2luLndlYmtpdEF1ZGlvQ29udGV4dCB8fFxuICAgICAgICAgICAgICAgIG51bGwpO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRDb250ZXh0LCBcIk9mZmxpbmVBdWRpb0NvbnRleHRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB3aW4gPSB3aW5kb3c7XG4gICAgICAgICAgICByZXR1cm4gKHdpbi5PZmZsaW5lQXVkaW9Db250ZXh0IHx8XG4gICAgICAgICAgICAgICAgd2luLndlYmtpdE9mZmxpbmVBdWRpb0NvbnRleHQgfHxcbiAgICAgICAgICAgICAgICBudWxsKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgU291bmRDb250ZXh0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBfc3VwZXIucHJvdG90eXBlLmRlc3Ryb3kuY2FsbCh0aGlzKTtcbiAgICAgICAgdmFyIGN0eCA9IHRoaXMuX2N0eDtcbiAgICAgICAgaWYgKHR5cGVvZiBjdHguY2xvc2UgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIGN0eC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYW5hbHlzZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLmdhaW4uZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLmNvbXByZXNzb3IuZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLmdhaW4gPSBudWxsO1xuICAgICAgICB0aGlzLmFuYWx5c2VyID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb21wcmVzc29yID0gbnVsbDtcbiAgICAgICAgdGhpcy5fb2ZmbGluZUN0eCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2N0eCA9IG51bGw7XG4gICAgfTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRDb250ZXh0LnByb3RvdHlwZSwgXCJhdWRpb0NvbnRleHRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jdHg7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZENvbnRleHQucHJvdG90eXBlLCBcIm9mZmxpbmVDb250ZXh0XCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb2ZmbGluZUN0eDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kQ29udGV4dC5wcm90b3R5cGUsIFwibXV0ZWRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tdXRlZDtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAobXV0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX211dGVkID0gISFtdXRlZDtcbiAgICAgICAgICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gdGhpcy5fbXV0ZWQgPyAwIDogdGhpcy5fdm9sdW1lO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRDb250ZXh0LnByb3RvdHlwZSwgXCJ2b2x1bWVcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl92b2x1bWU7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZvbHVtZSkge1xuICAgICAgICAgICAgdGhpcy5fdm9sdW1lID0gdm9sdW1lO1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9tdXRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2Fpbi5nYWluLnZhbHVlID0gdGhpcy5fdm9sdW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRDb250ZXh0LnByb3RvdHlwZSwgXCJwYXVzZWRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXVzZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHBhdXNlZCkge1xuICAgICAgICAgICAgaWYgKHBhdXNlZCAmJiB0aGlzLl9jdHguc3RhdGUgPT09IFwicnVubmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3R4LnN1c3BlbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFwYXVzZWQgJiYgdGhpcy5fY3R4LnN0YXRlID09PSBcInN1c3BlbmRlZFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fY3R4LnJlc3VtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fcGF1c2VkID0gcGF1c2VkO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBTb3VuZENvbnRleHQucHJvdG90eXBlLnRvZ2dsZU11dGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubXV0ZWQgPSAhdGhpcy5tdXRlZDtcbiAgICAgICAgcmV0dXJuIHRoaXMuX211dGVkO1xuICAgIH07XG4gICAgU291bmRDb250ZXh0LnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbiAoYXJyYXlCdWZmZXIsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuX29mZmxpbmVDdHguZGVjb2RlQXVkaW9EYXRhKGFycmF5QnVmZmVyLCBmdW5jdGlvbiAoYnVmZmVyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBidWZmZXIpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3IoXCJVbmFibGUgdG8gZGVjb2RlIGZpbGVcIikpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBTb3VuZENvbnRleHQ7XG59KEZpbHRlcmFibGVfMS5kZWZhdWx0KSk7XG5leHBvcnRzLmRlZmF1bHQgPSBTb3VuZENvbnRleHQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Tb3VuZENvbnRleHQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBpZCA9IDA7XG52YXIgU291bmRJbnN0YW5jZSA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFNvdW5kSW5zdGFuY2UsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU291bmRJbnN0YW5jZShwYXJlbnQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcbiAgICAgICAgX3RoaXMuaWQgPSBpZCsrO1xuICAgICAgICBfdGhpcy5fcGFyZW50ID0gbnVsbDtcbiAgICAgICAgX3RoaXMuX3BhdXNlZCA9IGZhbHNlO1xuICAgICAgICBfdGhpcy5fZWxhcHNlZCA9IDA7XG4gICAgICAgIF90aGlzLl9pbml0KHBhcmVudCk7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgU291bmRJbnN0YW5jZS5jcmVhdGUgPSBmdW5jdGlvbiAocGFyZW50KSB7XG4gICAgICAgIGlmIChTb3VuZEluc3RhbmNlLl9wb29sLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBzb3VuZCA9IFNvdW5kSW5zdGFuY2UuX3Bvb2wucG9wKCk7XG4gICAgICAgICAgICBzb3VuZC5faW5pdChwYXJlbnQpO1xuICAgICAgICAgICAgcmV0dXJuIHNvdW5kO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBTb3VuZEluc3RhbmNlKHBhcmVudCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFNvdW5kSW5zdGFuY2UucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9zb3VyY2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2ludGVybmFsU3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwic3RvcFwiKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU291bmRJbnN0YW5jZS5wcm90b3R5cGUucGxheSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kLCBzcGVlZCwgbG9vcCwgZmFkZUluLCBmYWRlT3V0KSB7XG4gICAgICAgIGlmIChlbmQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuYXNzZXJ0KGVuZCA+IHN0YXJ0LCBcIkVuZCB0aW1lIGlzIGJlZm9yZSBzdGFydCB0aW1lXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9zb3VyY2UgPSB0aGlzLl9wYXJlbnQubm9kZXMuY2xvbmVCdWZmZXJTb3VyY2UoKTtcbiAgICAgICAgaWYgKHNwZWVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSBzcGVlZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zcGVlZCA9IHRoaXMuX3NvdXJjZS5wbGF5YmFja1JhdGUudmFsdWU7XG4gICAgICAgIGlmIChsb29wICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvb3AgPSB0aGlzLl9zb3VyY2UubG9vcCA9ICEhbG9vcDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fbG9vcCAmJiBlbmQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdMb29waW5nIG5vdCBzdXBwb3J0IHdoZW4gc3BlY2lmeWluZyBhbiBcImVuZFwiIHRpbWUnKTtcbiAgICAgICAgICAgIHRoaXMuX2xvb3AgPSB0aGlzLl9zb3VyY2UubG9vcCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2VuZCA9IGVuZDtcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gdGhpcy5fc291cmNlLmJ1ZmZlci5kdXJhdGlvbjtcbiAgICAgICAgZmFkZUluID0gdGhpcy5fdG9TZWMoZmFkZUluKTtcbiAgICAgICAgaWYgKGZhZGVJbiA+IGR1cmF0aW9uKSB7XG4gICAgICAgICAgICBmYWRlSW4gPSBkdXJhdGlvbjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2xvb3ApIHtcbiAgICAgICAgICAgIGZhZGVPdXQgPSB0aGlzLl90b1NlYyhmYWRlT3V0KTtcbiAgICAgICAgICAgIGlmIChmYWRlT3V0ID4gZHVyYXRpb24gLSBmYWRlSW4pIHtcbiAgICAgICAgICAgICAgICBmYWRlT3V0ID0gZHVyYXRpb24gLSBmYWRlSW47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICAgICAgdGhpcy5fZmFkZUluID0gZmFkZUluO1xuICAgICAgICB0aGlzLl9mYWRlT3V0ID0gZmFkZU91dDtcbiAgICAgICAgdGhpcy5fbGFzdFVwZGF0ZSA9IHRoaXMuX25vdygpO1xuICAgICAgICB0aGlzLl9lbGFwc2VkID0gc3RhcnQ7XG4gICAgICAgIHRoaXMuX3NvdXJjZS5vbmVuZGVkID0gdGhpcy5fb25Db21wbGV0ZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9zb3VyY2Uuc3RhcnQoMCwgc3RhcnQsIChlbmQgPyBlbmQgLSBzdGFydCA6IHVuZGVmaW5lZCkpO1xuICAgICAgICB0aGlzLmVtaXQoXCJzdGFydFwiKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlKHRydWUpO1xuICAgICAgICB0aGlzLl9lbmFibGVkID0gdHJ1ZTtcbiAgICB9O1xuICAgIFNvdW5kSW5zdGFuY2UucHJvdG90eXBlLl90b1NlYyA9IGZ1bmN0aW9uICh0aW1lKSB7XG4gICAgICAgIGlmICh0aW1lID4gMTApIHtcbiAgICAgICAgICAgIHRpbWUgLz0gMTAwMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGltZSB8fCAwO1xuICAgIH07XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kSW5zdGFuY2UucHJvdG90eXBlLCBcIl9lbmFibGVkXCIsIHtcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAoZW5hYmxlZCkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5ub2Rlcy5zY3JpcHQub25hdWRpb3Byb2Nlc3MgPSAhZW5hYmxlZCA/IG51bGwgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuX3VwZGF0ZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kSW5zdGFuY2UucHJvdG90eXBlLCBcInByb2dyZXNzXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcHJvZ3Jlc3M7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZEluc3RhbmNlLnByb3RvdHlwZSwgXCJwYXVzZWRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXVzZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHBhdXNlZCkge1xuICAgICAgICAgICAgaWYgKHBhdXNlZCAhPT0gdGhpcy5fcGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGF1c2VkID0gcGF1c2VkO1xuICAgICAgICAgICAgICAgIGlmIChwYXVzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW50ZXJuYWxTdG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcInBhdXNlZFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcInJlc3VtZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheSh0aGlzLl9lbGFwc2VkICUgdGhpcy5fZHVyYXRpb24sIHRoaXMuX2VuZCwgdGhpcy5fc3BlZWQsIHRoaXMuX2xvb3AsIHRoaXMuX2ZhZGVJbiwgdGhpcy5fZmFkZU91dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcInBhdXNlXCIsIHBhdXNlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIFNvdW5kSW5zdGFuY2UucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgICAgIHRoaXMuX2ludGVybmFsU3RvcCgpO1xuICAgICAgICB0aGlzLl9zb3VyY2UgPSBudWxsO1xuICAgICAgICB0aGlzLl9zcGVlZCA9IDA7XG4gICAgICAgIHRoaXMuX2VuZCA9IDA7XG4gICAgICAgIHRoaXMuX3BhcmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2VsYXBzZWQgPSAwO1xuICAgICAgICB0aGlzLl9kdXJhdGlvbiA9IDA7XG4gICAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZmFkZUluID0gMDtcbiAgICAgICAgdGhpcy5fZmFkZU91dCA9IDA7XG4gICAgICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xuICAgICAgICBpZiAoU291bmRJbnN0YW5jZS5fcG9vbC5pbmRleE9mKHRoaXMpIDwgMCkge1xuICAgICAgICAgICAgU291bmRJbnN0YW5jZS5fcG9vbC5wdXNoKHRoaXMpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTb3VuZEluc3RhbmNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFwiW1NvdW5kSW5zdGFuY2UgaWQ9XCIgKyB0aGlzLmlkICsgXCJdXCI7XG4gICAgfTtcbiAgICBTb3VuZEluc3RhbmNlLnByb3RvdHlwZS5fbm93ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFyZW50LmNvbnRleHQuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIH07XG4gICAgU291bmRJbnN0YW5jZS5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uIChmb3JjZSkge1xuICAgICAgICBpZiAoZm9yY2UgPT09IHZvaWQgMCkgeyBmb3JjZSA9IGZhbHNlOyB9XG4gICAgICAgIGlmICh0aGlzLl9zb3VyY2UpIHtcbiAgICAgICAgICAgIHZhciBub3cgPSB0aGlzLl9ub3coKTtcbiAgICAgICAgICAgIHZhciBkZWx0YSA9IG5vdyAtIHRoaXMuX2xhc3RVcGRhdGU7XG4gICAgICAgICAgICBpZiAoZGVsdGEgPiAwIHx8IGZvcmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxhcHNlZCArPSBkZWx0YTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXN0VXBkYXRlID0gbm93O1xuICAgICAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IHRoaXMuX2R1cmF0aW9uO1xuICAgICAgICAgICAgICAgIHZhciBwcm9ncmVzcyA9ICgodGhpcy5fZWxhcHNlZCAqIHRoaXMuX3NwZWVkKSAlIGR1cmF0aW9uKSAvIGR1cmF0aW9uO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9mYWRlSW4gfHwgdGhpcy5fZmFkZU91dCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBwcm9ncmVzcyAqIGR1cmF0aW9uO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZ2FpbiA9IHRoaXMuX3BhcmVudC5ub2Rlcy5nYWluLmdhaW47XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXhWb2x1bWUgPSB0aGlzLl9wYXJlbnQudm9sdW1lO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fZmFkZUluKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9zaXRpb24gPD0gdGhpcy5fZmFkZUluICYmIHByb2dyZXNzIDwgMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdhaW4udmFsdWUgPSBtYXhWb2x1bWUgKiAocG9zaXRpb24gLyB0aGlzLl9mYWRlSW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2Fpbi52YWx1ZSA9IG1heFZvbHVtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9mYWRlSW4gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9mYWRlT3V0ICYmIHBvc2l0aW9uID49IGR1cmF0aW9uIC0gdGhpcy5fZmFkZU91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBlcmNlbnQgPSAoZHVyYXRpb24gLSBwb3NpdGlvbikgLyB0aGlzLl9mYWRlT3V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2Fpbi52YWx1ZSA9IG1heFZvbHVtZSAqIHBlcmNlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvZ3Jlc3MgPSBwcm9ncmVzcztcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJwcm9ncmVzc1wiLCB0aGlzLl9wcm9ncmVzcywgZHVyYXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBTb3VuZEluc3RhbmNlLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICAgIH07XG4gICAgU291bmRJbnN0YW5jZS5wcm90b3R5cGUuX2ludGVybmFsU3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NvdXJjZSkge1xuICAgICAgICAgICAgdGhpcy5fZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fc291cmNlLm9uZW5kZWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fc291cmNlLnN0b3AoKTtcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQudm9sdW1lID0gdGhpcy5fcGFyZW50LnZvbHVtZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU291bmRJbnN0YW5jZS5wcm90b3R5cGUuX29uQ29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9zb3VyY2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX3NvdXJjZS5vbmVuZGVkID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zb3VyY2UgPSBudWxsO1xuICAgICAgICB0aGlzLl9wcm9ncmVzcyA9IDE7XG4gICAgICAgIHRoaXMuZW1pdChcInByb2dyZXNzXCIsIDEsIHRoaXMuX2R1cmF0aW9uKTtcbiAgICAgICAgdGhpcy5lbWl0KFwiZW5kXCIsIHRoaXMpO1xuICAgIH07XG4gICAgcmV0dXJuIFNvdW5kSW5zdGFuY2U7XG59KFBJWEkudXRpbHMuRXZlbnRFbWl0dGVyKSk7XG5Tb3VuZEluc3RhbmNlLl9wb29sID0gW107XG5leHBvcnRzLmRlZmF1bHQgPSBTb3VuZEluc3RhbmNlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9U291bmRJbnN0YW5jZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBGaWx0ZXJhYmxlXzEgPSByZXF1aXJlKFwiLi9GaWx0ZXJhYmxlXCIpO1xudmFyIGZpbHRlcnMgPSByZXF1aXJlKFwiLi9maWx0ZXJzXCIpO1xudmFyIFNvdW5kXzEgPSByZXF1aXJlKFwiLi9Tb3VuZFwiKTtcbnZhciBTb3VuZENvbnRleHRfMSA9IHJlcXVpcmUoXCIuL1NvdW5kQ29udGV4dFwiKTtcbnZhciBTb3VuZEluc3RhbmNlXzEgPSByZXF1aXJlKFwiLi9Tb3VuZEluc3RhbmNlXCIpO1xudmFyIFNvdW5kU3ByaXRlXzEgPSByZXF1aXJlKFwiLi9Tb3VuZFNwcml0ZVwiKTtcbnZhciBTb3VuZFV0aWxzXzEgPSByZXF1aXJlKFwiLi9Tb3VuZFV0aWxzXCIpO1xudmFyIFNvdW5kTGlicmFyeSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU291bmRMaWJyYXJ5KCkge1xuICAgICAgICBpZiAodGhpcy5zdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRleHQgPSBuZXcgU291bmRDb250ZXh0XzEuZGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NvdW5kcyA9IHt9O1xuICAgICAgICB0aGlzLnV0aWxzID0gU291bmRVdGlsc18xLmRlZmF1bHQ7XG4gICAgICAgIHRoaXMuZmlsdGVycyA9IGZpbHRlcnM7XG4gICAgICAgIHRoaXMuU291bmQgPSBTb3VuZF8xLmRlZmF1bHQ7XG4gICAgICAgIHRoaXMuU291bmRJbnN0YW5jZSA9IFNvdW5kSW5zdGFuY2VfMS5kZWZhdWx0O1xuICAgICAgICB0aGlzLlNvdW5kTGlicmFyeSA9IFNvdW5kTGlicmFyeTtcbiAgICAgICAgdGhpcy5Tb3VuZFNwcml0ZSA9IFNvdW5kU3ByaXRlXzEuZGVmYXVsdDtcbiAgICAgICAgdGhpcy5GaWx0ZXJhYmxlID0gRmlsdGVyYWJsZV8xLmRlZmF1bHQ7XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZExpYnJhcnkucHJvdG90eXBlLCBcImNvbnRleHRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jb250ZXh0O1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRMaWJyYXJ5LnByb3RvdHlwZSwgXCJmaWx0ZXJzQWxsXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29udGV4dC5maWx0ZXJzO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChmaWx0ZXJzKSB7XG4gICAgICAgICAgICB0aGlzLl9jb250ZXh0LmZpbHRlcnMgPSBmaWx0ZXJzO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRMaWJyYXJ5LnByb3RvdHlwZSwgXCJzdXBwb3J0ZWRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBTb3VuZENvbnRleHRfMS5kZWZhdWx0LkF1ZGlvQ29udGV4dCAhPT0gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgU291bmRMaWJyYXJ5LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoc291cmNlLCBzb3VyY2VPcHRpb25zKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc291cmNlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgYWxpYXMgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9nZXRPcHRpb25zKHNvdXJjZVthbGlhc10sIHNvdXJjZU9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJlc3VsdHNbYWxpYXNdID0gdGhpcy5hZGQoYWxpYXMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHNvdXJjZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY29uc29sZS5hc3NlcnQoIXRoaXMuX3NvdW5kc1tzb3VyY2VdLCBcIlNvdW5kIHdpdGggYWxpYXMgXCIgKyBzb3VyY2UgKyBcIiBhbHJlYWR5IGV4aXN0cy5cIik7XG4gICAgICAgICAgICBpZiAoc291cmNlT3B0aW9ucyBpbnN0YW5jZW9mIFNvdW5kXzEuZGVmYXVsdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NvdW5kc1tzb3VyY2VdID0gc291cmNlT3B0aW9ucztcbiAgICAgICAgICAgICAgICByZXR1cm4gc291cmNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fZ2V0T3B0aW9ucyhzb3VyY2VPcHRpb25zKTtcbiAgICAgICAgICAgICAgICB2YXIgc291bmQgPSBuZXcgU291bmRfMS5kZWZhdWx0KHRoaXMuY29udGV4dCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc291bmRzW3NvdXJjZV0gPSBzb3VuZDtcbiAgICAgICAgICAgICAgICByZXR1cm4gc291bmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFNvdW5kTGlicmFyeS5wcm90b3R5cGUuX2dldE9wdGlvbnMgPSBmdW5jdGlvbiAoc291cmNlLCBvdmVycmlkZXMpIHtcbiAgICAgICAgdmFyIG9wdGlvbnM7XG4gICAgICAgIGlmICh0eXBlb2Ygc291cmNlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBvcHRpb25zID0geyBzcmM6IHNvdXJjZSB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgICBvcHRpb25zID0geyBzcmNCdWZmZXI6IHNvdXJjZSB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgb3B0aW9ucyA9IHNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihvcHRpb25zLCBvdmVycmlkZXMgfHwge30pO1xuICAgIH07XG4gICAgU291bmRMaWJyYXJ5LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoYWxpYXMpIHtcbiAgICAgICAgdGhpcy5leGlzdHMoYWxpYXMsIHRydWUpO1xuICAgICAgICB0aGlzLl9zb3VuZHNbYWxpYXNdLmRlc3Ryb3koKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX3NvdW5kc1thbGlhc107XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kTGlicmFyeS5wcm90b3R5cGUsIFwidm9sdW1lQWxsXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29udGV4dC52b2x1bWU7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZvbHVtZSkge1xuICAgICAgICAgICAgdGhpcy5fY29udGV4dC52b2x1bWUgPSB2b2x1bWU7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIFNvdW5kTGlicmFyeS5wcm90b3R5cGUucGF1c2VBbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2NvbnRleHQucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBTb3VuZExpYnJhcnkucHJvdG90eXBlLnJlc3VtZUFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fY29udGV4dC5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBTb3VuZExpYnJhcnkucHJvdG90eXBlLm11dGVBbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2NvbnRleHQubXV0ZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFNvdW5kTGlicmFyeS5wcm90b3R5cGUudW5tdXRlQWxsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jb250ZXh0Lm11dGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgU291bmRMaWJyYXJ5LnByb3RvdHlwZS5yZW1vdmVBbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIGFsaWFzIGluIHRoaXMuX3NvdW5kcykge1xuICAgICAgICAgICAgdGhpcy5fc291bmRzW2FsaWFzXS5kZXN0cm95KCk7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fc291bmRzW2FsaWFzXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFNvdW5kTGlicmFyeS5wcm90b3R5cGUuc3RvcEFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgYWxpYXMgaW4gdGhpcy5fc291bmRzKSB7XG4gICAgICAgICAgICB0aGlzLl9zb3VuZHNbYWxpYXNdLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFNvdW5kTGlicmFyeS5wcm90b3R5cGUuZXhpc3RzID0gZnVuY3Rpb24gKGFsaWFzLCBhc3NlcnQpIHtcbiAgICAgICAgaWYgKGFzc2VydCA9PT0gdm9pZCAwKSB7IGFzc2VydCA9IGZhbHNlOyB9XG4gICAgICAgIHZhciBleGlzdHMgPSAhIXRoaXMuX3NvdW5kc1thbGlhc107XG4gICAgICAgIGlmIChhc3NlcnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuYXNzZXJ0KGV4aXN0cywgXCJObyBzb3VuZCBtYXRjaGluZyBhbGlhcyAnXCIgKyBhbGlhcyArIFwiJy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV4aXN0cztcbiAgICB9O1xuICAgIFNvdW5kTGlicmFyeS5wcm90b3R5cGUuZmluZCA9IGZ1bmN0aW9uIChhbGlhcykge1xuICAgICAgICB0aGlzLmV4aXN0cyhhbGlhcywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLl9zb3VuZHNbYWxpYXNdO1xuICAgIH07XG4gICAgU291bmRMaWJyYXJ5LnByb3RvdHlwZS5wbGF5ID0gZnVuY3Rpb24gKGFsaWFzLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmQoYWxpYXMpLnBsYXkob3B0aW9ucyk7XG4gICAgfTtcbiAgICBTb3VuZExpYnJhcnkucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoYWxpYXMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZChhbGlhcykuc3RvcCgpO1xuICAgIH07XG4gICAgU291bmRMaWJyYXJ5LnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uIChhbGlhcykge1xuICAgICAgICByZXR1cm4gdGhpcy5maW5kKGFsaWFzKS5wYXVzZSgpO1xuICAgIH07XG4gICAgU291bmRMaWJyYXJ5LnByb3RvdHlwZS5yZXN1bWUgPSBmdW5jdGlvbiAoYWxpYXMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZChhbGlhcykucmVzdW1lKCk7XG4gICAgfTtcbiAgICBTb3VuZExpYnJhcnkucHJvdG90eXBlLnZvbHVtZSA9IGZ1bmN0aW9uIChhbGlhcywgdm9sdW1lKSB7XG4gICAgICAgIHZhciBzb3VuZCA9IHRoaXMuZmluZChhbGlhcyk7XG4gICAgICAgIGlmICh2b2x1bWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc291bmQudm9sdW1lID0gdm9sdW1lO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzb3VuZC52b2x1bWU7XG4gICAgfTtcbiAgICBTb3VuZExpYnJhcnkucHJvdG90eXBlLmR1cmF0aW9uID0gZnVuY3Rpb24gKGFsaWFzKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbmQoYWxpYXMpLmR1cmF0aW9uO1xuICAgIH07XG4gICAgU291bmRMaWJyYXJ5LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlbW92ZUFsbCgpO1xuICAgICAgICB0aGlzLl9zb3VuZHMgPSBudWxsO1xuICAgICAgICB0aGlzLl9jb250ZXh0ID0gbnVsbDtcbiAgICB9O1xuICAgIHJldHVybiBTb3VuZExpYnJhcnk7XG59KCkpO1xuZXhwb3J0cy5kZWZhdWx0ID0gU291bmRMaWJyYXJ5O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9U291bmRMaWJyYXJ5LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgRmlsdGVyYWJsZV8xID0gcmVxdWlyZShcIi4vRmlsdGVyYWJsZVwiKTtcbnZhciBTb3VuZE5vZGVzID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoU291bmROb2RlcywgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBTb3VuZE5vZGVzKGNvbnRleHQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIGF1ZGlvQ29udGV4dCA9IGNvbnRleHQuYXVkaW9Db250ZXh0O1xuICAgICAgICB2YXIgYnVmZmVyU291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICB2YXIgc2NyaXB0ID0gYXVkaW9Db250ZXh0LmNyZWF0ZVNjcmlwdFByb2Nlc3NvcihTb3VuZE5vZGVzLkJVRkZFUl9TSVpFKTtcbiAgICAgICAgdmFyIGdhaW4gPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB2YXIgYW5hbHlzZXIgPSBhdWRpb0NvbnRleHQuY3JlYXRlQW5hbHlzZXIoKTtcbiAgICAgICAgYnVmZmVyU291cmNlLmNvbm5lY3QoYW5hbHlzZXIpO1xuICAgICAgICBhbmFseXNlci5jb25uZWN0KGdhaW4pO1xuICAgICAgICBnYWluLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICAgIHNjcmlwdC5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgICBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIGFuYWx5c2VyLCBnYWluKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgX3RoaXMuYnVmZmVyU291cmNlID0gYnVmZmVyU291cmNlO1xuICAgICAgICBfdGhpcy5zY3JpcHQgPSBzY3JpcHQ7XG4gICAgICAgIF90aGlzLmdhaW4gPSBnYWluO1xuICAgICAgICBfdGhpcy5hbmFseXNlciA9IGFuYWx5c2VyO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIFNvdW5kTm9kZXMucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF9zdXBlci5wcm90b3R5cGUuZGVzdHJveS5jYWxsKHRoaXMpO1xuICAgICAgICB0aGlzLmJ1ZmZlclNvdXJjZS5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMuc2NyaXB0LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5nYWluLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5hbmFseXNlci5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMuYnVmZmVyU291cmNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5zY3JpcHQgPSBudWxsO1xuICAgICAgICB0aGlzLmdhaW4gPSBudWxsO1xuICAgICAgICB0aGlzLmFuYWx5c2VyID0gbnVsbDtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gbnVsbDtcbiAgICB9O1xuICAgIFNvdW5kTm9kZXMucHJvdG90eXBlLmNsb25lQnVmZmVyU291cmNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3JpZyA9IHRoaXMuYnVmZmVyU291cmNlO1xuICAgICAgICB2YXIgY2xvbmUgPSB0aGlzLmNvbnRleHQuYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICBjbG9uZS5idWZmZXIgPSBvcmlnLmJ1ZmZlcjtcbiAgICAgICAgY2xvbmUucGxheWJhY2tSYXRlLnZhbHVlID0gb3JpZy5wbGF5YmFja1JhdGUudmFsdWU7XG4gICAgICAgIGNsb25lLmxvb3AgPSBvcmlnLmxvb3A7XG4gICAgICAgIGNsb25lLmNvbm5lY3QodGhpcy5kZXN0aW5hdGlvbik7XG4gICAgICAgIHJldHVybiBjbG9uZTtcbiAgICB9O1xuICAgIHJldHVybiBTb3VuZE5vZGVzO1xufShGaWx0ZXJhYmxlXzEuZGVmYXVsdCkpO1xuU291bmROb2Rlcy5CVUZGRVJfU0laRSA9IDI1NjtcbmV4cG9ydHMuZGVmYXVsdCA9IFNvdW5kTm9kZXM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Tb3VuZE5vZGVzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIFNvdW5kU3ByaXRlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTb3VuZFNwcml0ZShwYXJlbnQsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSB0aGlzLmVuZCAtIHRoaXMuc3RhcnQ7XG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KHRoaXMuZHVyYXRpb24gPiAwLCBcIkVuZCB0aW1lIG11c3QgYmUgYWZ0ZXIgc3RhcnQgdGltZVwiKTtcbiAgICB9XG4gICAgU291bmRTcHJpdGUucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbiAoY29tcGxldGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50LnBsYXkoT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICBzcGVlZDogdGhpcy5zcGVlZCB8fCB0aGlzLnBhcmVudC5zcGVlZCxcbiAgICAgICAgICAgIGVuZDogdGhpcy5lbmQsXG4gICAgICAgICAgICBzdGFydDogdGhpcy5zdGFydCxcbiAgICAgICAgfSkpO1xuICAgIH07XG4gICAgU291bmRTcHJpdGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICB9O1xuICAgIHJldHVybiBTb3VuZFNwcml0ZTtcbn0oKSk7XG5leHBvcnRzLmRlZmF1bHQgPSBTb3VuZFNwcml0ZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVNvdW5kU3ByaXRlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHV1aWQgPSByZXF1aXJlKFwidXVpZC92NFwiKTtcbnZhciBpbmRleF8xID0gcmVxdWlyZShcIi4vaW5kZXhcIik7XG52YXIgU291bmRfMSA9IHJlcXVpcmUoXCIuL1NvdW5kXCIpO1xudmFyIFNvdW5kVXRpbHMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNvdW5kVXRpbHMoKSB7XG4gICAgfVxuICAgIFNvdW5kVXRpbHMuc2luZVRvbmUgPSBmdW5jdGlvbiAoaGVydHosIHNlY29uZHMpIHtcbiAgICAgICAgaWYgKGhlcnR6ID09PSB2b2lkIDApIHsgaGVydHogPSAyMDA7IH1cbiAgICAgICAgaWYgKHNlY29uZHMgPT09IHZvaWQgMCkgeyBzZWNvbmRzID0gMTsgfVxuICAgICAgICB2YXIgc291bmRDb250ZXh0ID0gaW5kZXhfMS5kZWZhdWx0LmNvbnRleHQ7XG4gICAgICAgIHZhciBzb3VuZEluc3RhbmNlID0gbmV3IFNvdW5kXzEuZGVmYXVsdChzb3VuZENvbnRleHQsIHtcbiAgICAgICAgICAgIHNpbmdsZUluc3RhbmNlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIG5DaGFubmVscyA9IDE7XG4gICAgICAgIHZhciBzYW1wbGVSYXRlID0gNDgwMDA7XG4gICAgICAgIHZhciBhbXBsaXR1ZGUgPSAyO1xuICAgICAgICB2YXIgYnVmZmVyID0gc291bmRDb250ZXh0LmF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIobkNoYW5uZWxzLCBzZWNvbmRzICogc2FtcGxlUmF0ZSwgc2FtcGxlUmF0ZSk7XG4gICAgICAgIHZhciBmQXJyYXkgPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZkFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgdGltZSA9IGkgLyBidWZmZXIuc2FtcGxlUmF0ZTtcbiAgICAgICAgICAgIHZhciBhbmdsZSA9IGhlcnR6ICogdGltZSAqIE1hdGguUEk7XG4gICAgICAgICAgICBmQXJyYXlbaV0gPSBNYXRoLnNpbihhbmdsZSkgKiBhbXBsaXR1ZGU7XG4gICAgICAgIH1cbiAgICAgICAgc291bmRJbnN0YW5jZS5idWZmZXIgPSBidWZmZXI7XG4gICAgICAgIHNvdW5kSW5zdGFuY2UuaXNMb2FkZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gc291bmRJbnN0YW5jZTtcbiAgICB9O1xuICAgIFNvdW5kVXRpbHMucmVuZGVyID0gZnVuY3Rpb24gKHNvdW5kLCBvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIHdpZHRoOiA1MTIsXG4gICAgICAgICAgICBoZWlnaHQ6IDEyOCxcbiAgICAgICAgICAgIGZpbGw6IFwiYmxhY2tcIixcbiAgICAgICAgfSwgb3B0aW9ucyB8fCB7fSk7XG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KCEhc291bmQuYnVmZmVyLCBcIk5vIGJ1ZmZlciBmb3VuZCwgbG9hZCBmaXJzdFwiKTtcbiAgICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IG9wdGlvbnMud2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodDtcbiAgICAgICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IG9wdGlvbnMuZmlsbDtcbiAgICAgICAgdmFyIGRhdGEgPSBzb3VuZC5idWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XG4gICAgICAgIHZhciBzdGVwID0gTWF0aC5jZWlsKGRhdGEubGVuZ3RoIC8gb3B0aW9ucy53aWR0aCk7XG4gICAgICAgIHZhciBhbXAgPSBvcHRpb25zLmhlaWdodCAvIDI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3B0aW9ucy53aWR0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbWluID0gMS4wO1xuICAgICAgICAgICAgdmFyIG1heCA9IC0xLjA7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN0ZXA7IGorKykge1xuICAgICAgICAgICAgICAgIHZhciBkYXR1bSA9IGRhdGFbKGkgKiBzdGVwKSArIGpdO1xuICAgICAgICAgICAgICAgIGlmIChkYXR1bSA8IG1pbikge1xuICAgICAgICAgICAgICAgICAgICBtaW4gPSBkYXR1bTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRhdHVtID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgICAgIG1heCA9IGRhdHVtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFJlY3QoaSwgKDEgKyBtaW4pICogYW1wLCAxLCBNYXRoLm1heCgxLCAobWF4IC0gbWluKSAqIGFtcCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQSVhJLkJhc2VUZXh0dXJlLmZyb21DYW52YXMoY2FudmFzKTtcbiAgICB9O1xuICAgIFNvdW5kVXRpbHMucGxheU9uY2UgPSBmdW5jdGlvbiAoc3JjLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgYWxpYXMgPSB1dWlkKCk7XG4gICAgICAgIGluZGV4XzEuZGVmYXVsdC5hZGQoYWxpYXMsIHtcbiAgICAgICAgICAgIHNyYzogc3JjLFxuICAgICAgICAgICAgcHJlbG9hZDogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9QbGF5OiB0cnVlLFxuICAgICAgICAgICAgbG9hZGVkOiBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4XzEuZGVmYXVsdC5yZW1vdmUoYWxpYXMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpbmRleF8xLmRlZmF1bHQucmVtb3ZlKGFsaWFzKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhbGlhcztcbiAgICB9O1xuICAgIHJldHVybiBTb3VuZFV0aWxzO1xufSgpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IFNvdW5kVXRpbHM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Tb3VuZFV0aWxzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIFNvdW5kXzEgPSByZXF1aXJlKFwiLi9Tb3VuZFwiKTtcbnZhciBTb3VuZExpYnJhcnlfMSA9IHJlcXVpcmUoXCIuL1NvdW5kTGlicmFyeVwiKTtcbnZhciBTb3VuZExpYnJhcnlQcm90b3R5cGUgPSBTb3VuZExpYnJhcnlfMS5kZWZhdWx0LnByb3RvdHlwZTtcbnZhciBTb3VuZFByb3RvdHlwZSA9IFNvdW5kXzEuZGVmYXVsdC5wcm90b3R5cGU7XG5Tb3VuZExpYnJhcnlQcm90b3R5cGUuc291bmQgPSBmdW5jdGlvbiBzb3VuZChhbGlhcykge1xuICAgIGNvbnNvbGUud2FybihcIlBJWEkuc291bmQuc291bmQgaXMgZGVwcmVjYXRlZCwgdXNlIFBJWEkuc291bmQuZmluZFwiKTtcbiAgICByZXR1cm4gdGhpcy5maW5kKGFsaWFzKTtcbn07XG5Tb3VuZExpYnJhcnlQcm90b3R5cGUucGFubmluZyA9IGZ1bmN0aW9uIHBhbm5pbmcoYWxpYXMsIHBhbm5pbmdWYWx1ZSkge1xuICAgIGNvbnNvbGUud2FybihcIlBJWEkuc291bmQucGFubmluZyBpcyBkZXByZWNhdGVkLCB1c2UgUElYSS5zb3VuZC5maWx0ZXJzLlN0ZXJlb1BhblwiKTtcbiAgICByZXR1cm4gMDtcbn07XG5Tb3VuZExpYnJhcnlQcm90b3R5cGUuYWRkTWFwID0gZnVuY3Rpb24gYWRkTWFwKG1hcCwgZ2xvYmFsT3B0aW9ucykge1xuICAgIGNvbnNvbGUud2FybihcIlBJWEkuc291bmQuYWRkTWFwIGlzIGRlcHJlY2F0ZWQsIHVzZSBQSVhJLnNvdW5kLmFkZFwiKTtcbiAgICByZXR1cm4gdGhpcy5hZGQobWFwLCBnbG9iYWxPcHRpb25zKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRMaWJyYXJ5UHJvdG90eXBlLCBcIlNvdW5kVXRpbHNcIiwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJQSVhJLnNvdW5kLlNvdW5kVXRpbHMgaXMgZGVwcmVjYXRlZCwgdXNlIFBJWEkuc291bmQudXRpbHNcIik7XG4gICAgICAgIHJldHVybiB0aGlzLnV0aWxzO1xuICAgIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VuZFByb3RvdHlwZSwgXCJibG9ja1wiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIlBJWEkuc291bmQuU291bmQucHJvdG90eXBlLmJsb2NrIGlzIGRlcHJlY2F0ZWQsIHVzZSBzaW5nbGVJbnN0YW5jZSBpbnN0ZWFkXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5zaW5nbGVJbnN0YW5jZTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIlBJWEkuc291bmQuU291bmQucHJvdG90eXBlLmJsb2NrIGlzIGRlcHJlY2F0ZWQsIHVzZSBzaW5nbGVJbnN0YW5jZSBpbnN0ZWFkXCIpO1xuICAgICAgICB0aGlzLnNpbmdsZUluc3RhbmNlID0gdmFsdWU7XG4gICAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdW5kUHJvdG90eXBlLCBcImxvYWRlZFwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIlBJWEkuc291bmQuU291bmQucHJvdG90eXBlLmxvYWRlZCBpcyBkZXByZWNhdGVkLCB1c2UgY29uc3RydWN0b3Igb3B0aW9uIGluc3RlYWRcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiUElYSS5zb3VuZC5Tb3VuZC5wcm90b3R5cGUubG9hZGVkIGlzIGRlcHJlY2F0ZWQsIHVzZSBjb25zdHJ1Y3RvciBvcHRpb24gaW5zdGVhZFwiKTtcbiAgICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU291bmRQcm90b3R5cGUsIFwiY29tcGxldGVcIiwge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJQSVhJLnNvdW5kLlNvdW5kLnByb3RvdHlwZS5jb21wbGV0ZSBpcyBkZXByZWNhdGVkLCB1c2UgY29uc3RydWN0b3Igb3B0aW9uIGluc3RlYWRcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiUElYSS5zb3VuZC5Tb3VuZC5wcm90b3R5cGUuY29tcGxldGUgaXMgZGVwcmVjYXRlZCwgdXNlIGNvbnN0cnVjdG9yIG9wdGlvbiBpbnN0ZWFkXCIpO1xuICAgIH0sXG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRlcHJlY2F0aW9ucy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIEZpbHRlcl8xID0gcmVxdWlyZShcIi4vRmlsdGVyXCIpO1xudmFyIGluZGV4XzEgPSByZXF1aXJlKFwiLi4vaW5kZXhcIik7XG52YXIgRGlzdG9ydGlvbkZpbHRlciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKERpc3RvcnRpb25GaWx0ZXIsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gRGlzdG9ydGlvbkZpbHRlcihhbW91bnQpIHtcbiAgICAgICAgaWYgKGFtb3VudCA9PT0gdm9pZCAwKSB7IGFtb3VudCA9IDA7IH1cbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIGRpc3RvcnRpb24gPSBpbmRleF8xLmRlZmF1bHQuY29udGV4dC5hdWRpb0NvbnRleHQuY3JlYXRlV2F2ZVNoYXBlcigpO1xuICAgICAgICBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIGRpc3RvcnRpb24pIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLl9kaXN0b3J0aW9uID0gZGlzdG9ydGlvbjtcbiAgICAgICAgX3RoaXMuYW1vdW50ID0gYW1vdW50O1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEaXN0b3J0aW9uRmlsdGVyLnByb3RvdHlwZSwgXCJhbW91bnRcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hbW91bnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YWx1ZSAqPSAxMDAwO1xuICAgICAgICAgICAgdGhpcy5fYW1vdW50ID0gdmFsdWU7XG4gICAgICAgICAgICB2YXIgc2FtcGxlcyA9IDQ0MTAwO1xuICAgICAgICAgICAgdmFyIGN1cnZlID0gbmV3IEZsb2F0MzJBcnJheShzYW1wbGVzKTtcbiAgICAgICAgICAgIHZhciBkZWcgPSBNYXRoLlBJIC8gMTgwO1xuICAgICAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICAgICAgdmFyIHg7XG4gICAgICAgICAgICBmb3IgKDsgaSA8IHNhbXBsZXM7ICsraSkge1xuICAgICAgICAgICAgICAgIHggPSBpICogMiAvIHNhbXBsZXMgLSAxO1xuICAgICAgICAgICAgICAgIGN1cnZlW2ldID0gKDMgKyB2YWx1ZSkgKiB4ICogMjAgKiBkZWcgLyAoTWF0aC5QSSArIHZhbHVlICogTWF0aC5hYnMoeCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZGlzdG9ydGlvbi5jdXJ2ZSA9IGN1cnZlO1xuICAgICAgICAgICAgdGhpcy5fZGlzdG9ydGlvbi5vdmVyc2FtcGxlID0gJzR4JztcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgRGlzdG9ydGlvbkZpbHRlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fZGlzdG9ydGlvbiA9IG51bGw7XG4gICAgICAgIF9zdXBlci5wcm90b3R5cGUuZGVzdHJveS5jYWxsKHRoaXMpO1xuICAgIH07XG4gICAgcmV0dXJuIERpc3RvcnRpb25GaWx0ZXI7XG59KEZpbHRlcl8xLmRlZmF1bHQpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IERpc3RvcnRpb25GaWx0ZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1EaXN0b3J0aW9uRmlsdGVyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgRmlsdGVyXzEgPSByZXF1aXJlKFwiLi9GaWx0ZXJcIik7XG52YXIgaW5kZXhfMSA9IHJlcXVpcmUoXCIuLi9pbmRleFwiKTtcbnZhciBFcXVhbGl6ZXJGaWx0ZXIgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhFcXVhbGl6ZXJGaWx0ZXIsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gRXF1YWxpemVyRmlsdGVyKGYzMiwgZjY0LCBmMTI1LCBmMjUwLCBmNTAwLCBmMWssIGYyaywgZjRrLCBmOGssIGYxNmspIHtcbiAgICAgICAgaWYgKGYzMiA9PT0gdm9pZCAwKSB7IGYzMiA9IDA7IH1cbiAgICAgICAgaWYgKGY2NCA9PT0gdm9pZCAwKSB7IGY2NCA9IDA7IH1cbiAgICAgICAgaWYgKGYxMjUgPT09IHZvaWQgMCkgeyBmMTI1ID0gMDsgfVxuICAgICAgICBpZiAoZjI1MCA9PT0gdm9pZCAwKSB7IGYyNTAgPSAwOyB9XG4gICAgICAgIGlmIChmNTAwID09PSB2b2lkIDApIHsgZjUwMCA9IDA7IH1cbiAgICAgICAgaWYgKGYxayA9PT0gdm9pZCAwKSB7IGYxayA9IDA7IH1cbiAgICAgICAgaWYgKGYyayA9PT0gdm9pZCAwKSB7IGYyayA9IDA7IH1cbiAgICAgICAgaWYgKGY0ayA9PT0gdm9pZCAwKSB7IGY0ayA9IDA7IH1cbiAgICAgICAgaWYgKGY4ayA9PT0gdm9pZCAwKSB7IGY4ayA9IDA7IH1cbiAgICAgICAgaWYgKGYxNmsgPT09IHZvaWQgMCkgeyBmMTZrID0gMDsgfVxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgZXF1YWxpemVyQmFuZHMgPSBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZjogRXF1YWxpemVyRmlsdGVyLkYzMixcbiAgICAgICAgICAgICAgICB0eXBlOiAnbG93c2hlbGYnLFxuICAgICAgICAgICAgICAgIGdhaW46IGYzMlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmOiBFcXVhbGl6ZXJGaWx0ZXIuRjY0LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdwZWFraW5nJyxcbiAgICAgICAgICAgICAgICBnYWluOiBmNjRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZjogRXF1YWxpemVyRmlsdGVyLkYxMjUsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3BlYWtpbmcnLFxuICAgICAgICAgICAgICAgIGdhaW46IGYxMjVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZjogRXF1YWxpemVyRmlsdGVyLkYyNTAsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3BlYWtpbmcnLFxuICAgICAgICAgICAgICAgIGdhaW46IGYyNTBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZjogRXF1YWxpemVyRmlsdGVyLkY1MDAsXG4gICAgICAgICAgICAgICAgdHlwZTogJ3BlYWtpbmcnLFxuICAgICAgICAgICAgICAgIGdhaW46IGY1MDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZjogRXF1YWxpemVyRmlsdGVyLkYxSyxcbiAgICAgICAgICAgICAgICB0eXBlOiAncGVha2luZycsXG4gICAgICAgICAgICAgICAgZ2FpbjogZjFrXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGY6IEVxdWFsaXplckZpbHRlci5GMkssXG4gICAgICAgICAgICAgICAgdHlwZTogJ3BlYWtpbmcnLFxuICAgICAgICAgICAgICAgIGdhaW46IGYya1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmOiBFcXVhbGl6ZXJGaWx0ZXIuRjRLLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdwZWFraW5nJyxcbiAgICAgICAgICAgICAgICBnYWluOiBmNGtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZjogRXF1YWxpemVyRmlsdGVyLkY4SyxcbiAgICAgICAgICAgICAgICB0eXBlOiAncGVha2luZycsXG4gICAgICAgICAgICAgICAgZ2FpbjogZjhrXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGY6IEVxdWFsaXplckZpbHRlci5GMTZLLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdoaWdoc2hlbGYnLFxuICAgICAgICAgICAgICAgIGdhaW46IGYxNmtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICAgICAgdmFyIGJhbmRzID0gZXF1YWxpemVyQmFuZHMubWFwKGZ1bmN0aW9uIChiYW5kKSB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyID0gaW5kZXhfMS5kZWZhdWx0LmNvbnRleHQuYXVkaW9Db250ZXh0LmNyZWF0ZUJpcXVhZEZpbHRlcigpO1xuICAgICAgICAgICAgZmlsdGVyLnR5cGUgPSBiYW5kLnR5cGU7XG4gICAgICAgICAgICBmaWx0ZXIuZ2Fpbi52YWx1ZSA9IGJhbmQuZ2FpbjtcbiAgICAgICAgICAgIGZpbHRlci5RLnZhbHVlID0gMTtcbiAgICAgICAgICAgIGZpbHRlci5mcmVxdWVuY3kudmFsdWUgPSBiYW5kLmY7XG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyO1xuICAgICAgICB9KTtcbiAgICAgICAgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBiYW5kc1swXSwgYmFuZHNbYmFuZHMubGVuZ3RoIC0gMV0pIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmJhbmRzID0gYmFuZHM7XG4gICAgICAgIF90aGlzLmJhbmRzTWFwID0ge307XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3RoaXMuYmFuZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gX3RoaXMuYmFuZHNbaV07XG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5iYW5kc1tpIC0gMV0uY29ubmVjdChub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90aGlzLmJhbmRzTWFwW25vZGUuZnJlcXVlbmN5LnZhbHVlXSA9IG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBFcXVhbGl6ZXJGaWx0ZXIucHJvdG90eXBlLnNldEdhaW4gPSBmdW5jdGlvbiAoZnJlcXVlbmN5LCBnYWluKSB7XG4gICAgICAgIGlmIChnYWluID09PSB2b2lkIDApIHsgZ2FpbiA9IDA7IH1cbiAgICAgICAgaWYgKCF0aGlzLmJhbmRzTWFwW2ZyZXF1ZW5jeV0pIHtcbiAgICAgICAgICAgIHRocm93ICdObyBiYW5kIGZvdW5kIGZvciBmcmVxdWVuY3kgJyArIGZyZXF1ZW5jeTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJhbmRzTWFwW2ZyZXF1ZW5jeV0uZ2Fpbi52YWx1ZSA9IGdhaW47XG4gICAgfTtcbiAgICBFcXVhbGl6ZXJGaWx0ZXIucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJhbmRzLmZvckVhY2goZnVuY3Rpb24gKGJhbmQpIHtcbiAgICAgICAgICAgIGJhbmQuZ2Fpbi52YWx1ZSA9IDA7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgRXF1YWxpemVyRmlsdGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJhbmRzLmZvckVhY2goZnVuY3Rpb24gKGJhbmQpIHtcbiAgICAgICAgICAgIGJhbmQuZGlzY29ubmVjdCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5iYW5kcyA9IG51bGw7XG4gICAgICAgIHRoaXMuYmFuZHNNYXAgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIEVxdWFsaXplckZpbHRlcjtcbn0oRmlsdGVyXzEuZGVmYXVsdCkpO1xuRXF1YWxpemVyRmlsdGVyLkYzMiA9IDMyO1xuRXF1YWxpemVyRmlsdGVyLkY2NCA9IDY0O1xuRXF1YWxpemVyRmlsdGVyLkYxMjUgPSAxMjU7XG5FcXVhbGl6ZXJGaWx0ZXIuRjI1MCA9IDI1MDtcbkVxdWFsaXplckZpbHRlci5GNTAwID0gNTAwO1xuRXF1YWxpemVyRmlsdGVyLkYxSyA9IDEwMDA7XG5FcXVhbGl6ZXJGaWx0ZXIuRjJLID0gMjAwMDtcbkVxdWFsaXplckZpbHRlci5GNEsgPSA0MDAwO1xuRXF1YWxpemVyRmlsdGVyLkY4SyA9IDgwMDA7XG5FcXVhbGl6ZXJGaWx0ZXIuRjE2SyA9IDE2MDAwO1xuZXhwb3J0cy5kZWZhdWx0ID0gRXF1YWxpemVyRmlsdGVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RXF1YWxpemVyRmlsdGVyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIEZpbHRlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gRmlsdGVyKGRlc3RpbmF0aW9uLCBzb3VyY2UpIHtcbiAgICAgICAgdGhpcy5kZXN0aW5hdGlvbiA9IGRlc3RpbmF0aW9uO1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZSB8fCBkZXN0aW5hdGlvbjtcbiAgICB9XG4gICAgRmlsdGVyLnByb3RvdHlwZS5jb25uZWN0ID0gZnVuY3Rpb24gKGRlc3RpbmF0aW9uKSB7XG4gICAgICAgIHRoaXMuc291cmNlLmNvbm5lY3QoZGVzdGluYXRpb24pO1xuICAgIH07XG4gICAgRmlsdGVyLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNvdXJjZS5kaXNjb25uZWN0KCk7XG4gICAgfTtcbiAgICBGaWx0ZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLmRlc3RpbmF0aW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIEZpbHRlcjtcbn0oKSk7XG5leHBvcnRzLmRlZmF1bHQgPSBGaWx0ZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1GaWx0ZXIuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBGaWx0ZXJfMSA9IHJlcXVpcmUoXCIuL0ZpbHRlclwiKTtcbnZhciBpbmRleF8xID0gcmVxdWlyZShcIi4uL2luZGV4XCIpO1xudmFyIFJldmVyYkZpbHRlciA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFJldmVyYkZpbHRlciwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBSZXZlcmJGaWx0ZXIoc2Vjb25kcywgZGVjYXksIHJldmVyc2UpIHtcbiAgICAgICAgaWYgKHNlY29uZHMgPT09IHZvaWQgMCkgeyBzZWNvbmRzID0gMzsgfVxuICAgICAgICBpZiAoZGVjYXkgPT09IHZvaWQgMCkgeyBkZWNheSA9IDI7IH1cbiAgICAgICAgaWYgKHJldmVyc2UgPT09IHZvaWQgMCkgeyByZXZlcnNlID0gZmFsc2U7IH1cbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIGNvbnZvbHZlciA9IGluZGV4XzEuZGVmYXVsdC5jb250ZXh0LmF1ZGlvQ29udGV4dC5jcmVhdGVDb252b2x2ZXIoKTtcbiAgICAgICAgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBjb252b2x2ZXIpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLl9jb252b2x2ZXIgPSBjb252b2x2ZXI7XG4gICAgICAgIF90aGlzLl9zZWNvbmRzID0gX3RoaXMuX2NsYW1wKHNlY29uZHMsIDEsIDUwKTtcbiAgICAgICAgX3RoaXMuX2RlY2F5ID0gX3RoaXMuX2NsYW1wKGRlY2F5LCAwLCAxMDApO1xuICAgICAgICBfdGhpcy5fcmV2ZXJzZSA9IHJldmVyc2U7XG4gICAgICAgIF90aGlzLl9yZWJ1aWxkKCk7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgUmV2ZXJiRmlsdGVyLnByb3RvdHlwZS5fY2xhbXAgPSBmdW5jdGlvbiAodmFsdWUsIG1pbiwgbWF4KSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1pbihtYXgsIE1hdGgubWF4KG1pbiwgdmFsdWUpKTtcbiAgICB9O1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZXZlcmJGaWx0ZXIucHJvdG90eXBlLCBcInNlY29uZHNcIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zZWNvbmRzO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChzZWNvbmRzKSB7XG4gICAgICAgICAgICB0aGlzLl9zZWNvbmRzID0gdGhpcy5fY2xhbXAoc2Vjb25kcywgMSwgNTApO1xuICAgICAgICAgICAgdGhpcy5fcmVidWlsZCgpO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmV2ZXJiRmlsdGVyLnByb3RvdHlwZSwgXCJkZWNheVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlY2F5O1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIChkZWNheSkge1xuICAgICAgICAgICAgdGhpcy5fZGVjYXkgPSB0aGlzLl9jbGFtcChkZWNheSwgMCwgMTAwKTtcbiAgICAgICAgICAgIHRoaXMuX3JlYnVpbGQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJldmVyYkZpbHRlci5wcm90b3R5cGUsIFwicmV2ZXJzZVwiLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JldmVyc2U7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHJldmVyc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX3JldmVyc2UgPSByZXZlcnNlO1xuICAgICAgICAgICAgdGhpcy5fcmVidWlsZCgpO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBSZXZlcmJGaWx0ZXIucHJvdG90eXBlLl9yZWJ1aWxkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY29udGV4dCA9IGluZGV4XzEuZGVmYXVsdC5jb250ZXh0LmF1ZGlvQ29udGV4dDtcbiAgICAgICAgdmFyIHJhdGUgPSBjb250ZXh0LnNhbXBsZVJhdGU7XG4gICAgICAgIHZhciBsZW5ndGggPSByYXRlICogdGhpcy5fc2Vjb25kcztcbiAgICAgICAgdmFyIGltcHVsc2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlcigyLCBsZW5ndGgsIHJhdGUpO1xuICAgICAgICB2YXIgaW1wdWxzZUwgPSBpbXB1bHNlLmdldENoYW5uZWxEYXRhKDApO1xuICAgICAgICB2YXIgaW1wdWxzZVIgPSBpbXB1bHNlLmdldENoYW5uZWxEYXRhKDEpO1xuICAgICAgICB2YXIgbjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbiA9IHRoaXMuX3JldmVyc2UgPyBsZW5ndGggLSBpIDogaTtcbiAgICAgICAgICAgIGltcHVsc2VMW2ldID0gKE1hdGgucmFuZG9tKCkgKiAyIC0gMSkgKiBNYXRoLnBvdygxIC0gbiAvIGxlbmd0aCwgdGhpcy5fZGVjYXkpO1xuICAgICAgICAgICAgaW1wdWxzZVJbaV0gPSAoTWF0aC5yYW5kb20oKSAqIDIgLSAxKSAqIE1hdGgucG93KDEgLSBuIC8gbGVuZ3RoLCB0aGlzLl9kZWNheSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY29udm9sdmVyLmJ1ZmZlciA9IGltcHVsc2U7XG4gICAgfTtcbiAgICBSZXZlcmJGaWx0ZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2NvbnZvbHZlciA9IG51bGw7XG4gICAgICAgIF9zdXBlci5wcm90b3R5cGUuZGVzdHJveS5jYWxsKHRoaXMpO1xuICAgIH07XG4gICAgcmV0dXJuIFJldmVyYkZpbHRlcjtcbn0oRmlsdGVyXzEuZGVmYXVsdCkpO1xuZXhwb3J0cy5kZWZhdWx0ID0gUmV2ZXJiRmlsdGVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UmV2ZXJiRmlsdGVyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgRmlsdGVyXzEgPSByZXF1aXJlKFwiLi9GaWx0ZXJcIik7XG52YXIgaW5kZXhfMSA9IHJlcXVpcmUoXCIuLi9pbmRleFwiKTtcbnZhciBTdGVyZW9GaWx0ZXIgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTdGVyZW9GaWx0ZXIsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU3RlcmVvRmlsdGVyKHBhbikge1xuICAgICAgICBpZiAocGFuID09PSB2b2lkIDApIHsgcGFuID0gMDsgfVxuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgc3RlcmVvO1xuICAgICAgICB2YXIgcGFubmVyO1xuICAgICAgICB2YXIgZGVzdGluYXRpb247XG4gICAgICAgIHZhciBhdWRpb0NvbnRleHQgPSBpbmRleF8xLmRlZmF1bHQuY29udGV4dC5hdWRpb0NvbnRleHQ7XG4gICAgICAgIGlmIChhdWRpb0NvbnRleHQuY3JlYXRlU3RlcmVvUGFubmVyKSB7XG4gICAgICAgICAgICBzdGVyZW8gPSBhdWRpb0NvbnRleHQuY3JlYXRlU3RlcmVvUGFubmVyKCk7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbiA9IHN0ZXJlbztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHBhbm5lciA9IGF1ZGlvQ29udGV4dC5jcmVhdGVQYW5uZXIoKTtcbiAgICAgICAgICAgIHBhbm5lci5wYW5uaW5nTW9kZWwgPSAnZXF1YWxwb3dlcic7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbiA9IHBhbm5lcjtcbiAgICAgICAgfVxuICAgICAgICBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIGRlc3RpbmF0aW9uKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5fc3RlcmVvID0gc3RlcmVvO1xuICAgICAgICBfdGhpcy5fcGFubmVyID0gcGFubmVyO1xuICAgICAgICBfdGhpcy5wYW4gPSBwYW47XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0ZXJlb0ZpbHRlci5wcm90b3R5cGUsIFwicGFuXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGFuO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fcGFuID0gdmFsdWU7XG4gICAgICAgICAgICBpZiAodGhpcy5fc3RlcmVvKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RlcmVvLnBhbi52YWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFubmVyLnNldFBvc2l0aW9uKHZhbHVlLCAwLCAxIC0gTWF0aC5hYnModmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgU3RlcmVvRmlsdGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBfc3VwZXIucHJvdG90eXBlLmRlc3Ryb3kuY2FsbCh0aGlzKTtcbiAgICAgICAgdGhpcy5fc3RlcmVvID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcGFubmVyID0gbnVsbDtcbiAgICB9O1xuICAgIHJldHVybiBTdGVyZW9GaWx0ZXI7XG59KEZpbHRlcl8xLmRlZmF1bHQpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IFN0ZXJlb0ZpbHRlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVN0ZXJlb0ZpbHRlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBGaWx0ZXJfMSA9IHJlcXVpcmUoXCIuL0ZpbHRlclwiKTtcbmV4cG9ydHMuRmlsdGVyID0gRmlsdGVyXzEuZGVmYXVsdDtcbnZhciBFcXVhbGl6ZXJGaWx0ZXJfMSA9IHJlcXVpcmUoXCIuL0VxdWFsaXplckZpbHRlclwiKTtcbmV4cG9ydHMuRXF1YWxpemVyRmlsdGVyID0gRXF1YWxpemVyRmlsdGVyXzEuZGVmYXVsdDtcbnZhciBEaXN0b3J0aW9uRmlsdGVyXzEgPSByZXF1aXJlKFwiLi9EaXN0b3J0aW9uRmlsdGVyXCIpO1xuZXhwb3J0cy5EaXN0b3J0aW9uRmlsdGVyID0gRGlzdG9ydGlvbkZpbHRlcl8xLmRlZmF1bHQ7XG52YXIgU3RlcmVvRmlsdGVyXzEgPSByZXF1aXJlKFwiLi9TdGVyZW9GaWx0ZXJcIik7XG5leHBvcnRzLlN0ZXJlb0ZpbHRlciA9IFN0ZXJlb0ZpbHRlcl8xLmRlZmF1bHQ7XG52YXIgUmV2ZXJiRmlsdGVyXzEgPSByZXF1aXJlKFwiLi9SZXZlcmJGaWx0ZXJcIik7XG5leHBvcnRzLlJldmVyYkZpbHRlciA9IFJldmVyYkZpbHRlcl8xLmRlZmF1bHQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBMb2FkZXJNaWRkbGV3YXJlXzEgPSByZXF1aXJlKFwiLi9Mb2FkZXJNaWRkbGV3YXJlXCIpO1xudmFyIFNvdW5kTGlicmFyeV8xID0gcmVxdWlyZShcIi4vU291bmRMaWJyYXJ5XCIpO1xucmVxdWlyZShcIi4vZGVwcmVjYXRpb25zXCIpO1xudmFyIHNvdW5kID0gbmV3IFNvdW5kTGlicmFyeV8xLmRlZmF1bHQoKTtcbmlmIChnbG9iYWwuUElYSSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwicGl4aS5qcyBpcyByZXF1aXJlZFwiKTtcbn1cbmlmIChQSVhJLmxvYWRlcnMgIT09IHVuZGVmaW5lZCkge1xuICAgIExvYWRlck1pZGRsZXdhcmVfMS5pbnN0YWxsKCk7XG59XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoUElYSSwgXCJzb3VuZFwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBzb3VuZDsgfSxcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gc291bmQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCIvKipcbiAqIENvbnZlcnQgYXJyYXkgb2YgMTYgYnl0ZSB2YWx1ZXMgdG8gVVVJRCBzdHJpbmcgZm9ybWF0IG9mIHRoZSBmb3JtOlxuICogWFhYWFhYWFgtWFhYWC1YWFhYLVhYWFgtWFhYWC1YWFhYWFhYWFhYWFhcbiAqL1xudmFyIGJ5dGVUb0hleCA9IFtdO1xuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXhbaV0gPSAoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpO1xufVxuXG5mdW5jdGlvbiBieXRlc1RvVXVpZChidWYsIG9mZnNldCkge1xuICB2YXIgaSA9IG9mZnNldCB8fCAwO1xuICB2YXIgYnRoID0gYnl0ZVRvSGV4O1xuICByZXR1cm4gIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gKyAnLScgK1xuICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICsgJy0nICtcbiAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXSArICctJyArXG4gICAgICAgICAgYnRoW2J1ZltpKytdXSArIGJ0aFtidWZbaSsrXV0gK1xuICAgICAgICAgIGJ0aFtidWZbaSsrXV0gKyBidGhbYnVmW2krK11dICtcbiAgICAgICAgICBidGhbYnVmW2krK11dICsgYnRoW2J1ZltpKytdXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBieXRlc1RvVXVpZDtcbiIsIi8vIFVuaXF1ZSBJRCBjcmVhdGlvbiByZXF1aXJlcyBhIGhpZ2ggcXVhbGl0eSByYW5kb20gIyBnZW5lcmF0b3IuICBJbiB0aGVcbi8vIGJyb3dzZXIgdGhpcyBpcyBhIGxpdHRsZSBjb21wbGljYXRlZCBkdWUgdG8gdW5rbm93biBxdWFsaXR5IG9mIE1hdGgucmFuZG9tKClcbi8vIGFuZCBpbmNvbnNpc3RlbnQgc3VwcG9ydCBmb3IgdGhlIGBjcnlwdG9gIEFQSS4gIFdlIGRvIHRoZSBiZXN0IHdlIGNhbiB2aWFcbi8vIGZlYXR1cmUtZGV0ZWN0aW9uXG52YXIgcm5nO1xuXG52YXIgY3J5cHRvID0gZ2xvYmFsLmNyeXB0byB8fCBnbG9iYWwubXNDcnlwdG87IC8vIGZvciBJRSAxMVxuaWYgKGNyeXB0byAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gIC8vIFdIQVRXRyBjcnlwdG8gUk5HIC0gaHR0cDovL3dpa2kud2hhdHdnLm9yZy93aWtpL0NyeXB0b1xuICB2YXIgcm5kczggPSBuZXcgVWludDhBcnJheSgxNik7XG4gIHJuZyA9IGZ1bmN0aW9uIHdoYXR3Z1JORygpIHtcbiAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHJuZHM4KTtcbiAgICByZXR1cm4gcm5kczg7XG4gIH07XG59XG5cbmlmICghcm5nKSB7XG4gIC8vIE1hdGgucmFuZG9tKCktYmFzZWQgKFJORylcbiAgLy9cbiAgLy8gSWYgYWxsIGVsc2UgZmFpbHMsIHVzZSBNYXRoLnJhbmRvbSgpLiAgSXQncyBmYXN0LCBidXQgaXMgb2YgdW5zcGVjaWZpZWRcbiAgLy8gcXVhbGl0eS5cbiAgdmFyICBybmRzID0gbmV3IEFycmF5KDE2KTtcbiAgcm5nID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIHI7IGkgPCAxNjsgaSsrKSB7XG4gICAgICBpZiAoKGkgJiAweDAzKSA9PT0gMCkgciA9IE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMDtcbiAgICAgIHJuZHNbaV0gPSByID4+PiAoKGkgJiAweDAzKSA8PCAzKSAmIDB4ZmY7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJuZHM7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcm5nO1xuIiwidmFyIHJuZyA9IHJlcXVpcmUoJy4vbGliL3JuZycpO1xudmFyIGJ5dGVzVG9VdWlkID0gcmVxdWlyZSgnLi9saWIvYnl0ZXNUb1V1aWQnKTtcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgdmFyIGkgPSBidWYgJiYgb2Zmc2V0IHx8IDA7XG5cbiAgaWYgKHR5cGVvZihvcHRpb25zKSA9PSAnc3RyaW5nJykge1xuICAgIGJ1ZiA9IG9wdGlvbnMgPT0gJ2JpbmFyeScgPyBuZXcgQXJyYXkoMTYpIDogbnVsbDtcbiAgICBvcHRpb25zID0gbnVsbDtcbiAgfVxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB2YXIgcm5kcyA9IG9wdGlvbnMucmFuZG9tIHx8IChvcHRpb25zLnJuZyB8fCBybmcpKCk7XG5cbiAgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuICBybmRzWzZdID0gKHJuZHNbNl0gJiAweDBmKSB8IDB4NDA7XG4gIHJuZHNbOF0gPSAocm5kc1s4XSAmIDB4M2YpIHwgMHg4MDtcblxuICAvLyBDb3B5IGJ5dGVzIHRvIGJ1ZmZlciwgaWYgcHJvdmlkZWRcbiAgaWYgKGJ1Zikge1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCAxNjsgKytpaSkge1xuICAgICAgYnVmW2kgKyBpaV0gPSBybmRzW2lpXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmIHx8IGJ5dGVzVG9VdWlkKHJuZHMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHY0O1xuIl19

/*!
 * pixi-particles - v2.1.5
 * Compiled Tue, 14 Mar 2017 22:08:59 UTC
 *
 * pixi-particles is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pixiParticles = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var ParticleUtils = require("./ParticleUtils"),
	Particle = require("./Particle"),
	Texture = PIXI.Texture;

/**
 * An individual particle image with an animation. Art data passed to the emitter must be
 * formatted in a particular way for AnimatedParticle to be able to handle it:
 *
 *     {
 *         //framerate is required. It is the animation speed of the particle in frames per
 *         //second.
 *         //A value of "matchLife" causes the animation to match the lifetime of an individual
 *         //particle, instead of at a constant framerate. This causes the animation to play
 *         //through one time, completing when the particle expires.
 *         framerate: 6,
 *         //loop is optional, and defaults to false.
 *         loop: true,
 *         //textures is required, and can be an array of any (non-zero) length.
 *         textures: [
 *             //each entry represents a single texture that should be used for one or more
 *             //frames. Any strings will be converted to Textures with Texture.fromImage().
 *             //Instances of PIXI.Texture will be used directly.
 *             "animFrame1.png",
 *             //entries can be an object with a 'count' property, telling AnimatedParticle to
 *             //use that texture for 'count' frames sequentially.
 *             {
 *                 texture: "animFrame2.png",
 *                 count: 3
 *             },
 *             "animFrame3.png"
 *         ]
 *     }
 *
 * @memberof PIXI.particles
 * @class AnimatedParticle
 * @extends PIXI.particles.Particle
 * @constructor
 * @param {PIXI.particles.Emitter} emitter The emitter that controls this AnimatedParticle.
 */
var AnimatedParticle = function(emitter)
{
	Particle.call(this, emitter);

	/**
	 * Texture array used as each frame of animation, similarly to how MovieClip works.
	 * @property {Array} textures
	 * @private
	 */
	this.textures = null;

	/**
	 * Duration of the animation, in seconds.
	 * @property {Number} duration
	 * @private
	 */
	this.duration = 0;

	/**
	 * Animation framerate, in frames per second.
	 * @property {Number} framerate
	 * @private
	 */
	this.framerate = 0;

	/**
	 * Animation time elapsed, in seconds.
	 * @property {Number} elapsed
	 * @private
	 */
	this.elapsed = 0;

	/**
	 * If this particle animation should loop.
	 * @property {Boolean} loop
	 * @private
	 */
	this.loop = false;
};

// Reference to the super class
var s = Particle.prototype;
// Reference to the prototype
var p = AnimatedParticle.prototype = Object.create(s);

/**
 * Initializes the particle for use, based on the properties that have to
 * have been set already on the particle.
 * @method PIXI.particles.AnimatedParticle#init
 */
p.init = function()
{
	this.Particle_init();

	this.elapsed = 0;

	//if the animation needs to match the particle's life, then cacluate variables
	if(this.framerate < 0)
	{
		this.duration = this.maxLife;
		this.framerate = this.textures.length / this.duration;
	}
};

/**
 * Sets the textures for the particle.
 * @method PIXI.particles.AnimatedParticle#applyArt
 * @param {Array} art An array of PIXI.Texture objects for this animated particle.
 */
p.applyArt = function(art)
{
	this.textures = art.textures;
	this.framerate = art.framerate;
	this.duration = art.duration;
	this.loop = art.loop;
};

/**
 * Updates the particle.
 * @method PIXI.particles.AnimatedParticle#update
 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
 */
p.update = function(delta)
{
	//only animate the particle if it is still alive
	if(this.Particle_update(delta) >= 0)
	{
		this.elapsed += delta;
		if(this.elapsed > this.duration)
		{
			//loop elapsed back around
			if(this.loop)
				this.elapsed = this.elapsed % this.duration;
			//subtract a small amount to prevent attempting to go past the end of the animation
			else
				this.elapsed = this.duration - 0.000001;
		}
		var frame = (this.elapsed * this.framerate + 0.0000001) | 0;
		this.texture = this.textures[frame] || ParticleUtils.EMPTY_TEXTURE;
	}
};

p.Particle_destroy = Particle.prototype.destroy;
/**
 * Destroys the particle, removing references and preventing future use.
 * @method PIXI.particles.AnimatedParticle#destroy
 */
p.destroy = function()
{
	this.Particle_destroy();
	this.textures = null;
};

/**
 * Checks over the art that was passed to the Emitter's init() function, to do any special
 * modifications to prepare it ahead of time.
 * @method PIXI.particles.AnimatedParticle.parseArt
 * @static
 * @param  {Array} art The array of art data, properly formatted for AnimatedParticle.
 * @return {Array} The art, after any needed modifications.
 */
AnimatedParticle.parseArt = function(art)
{
	var i, data, output = [], j, textures, tex, outTextures;
	for(i = 0; i < art.length; ++i)
	{
		data = art[i];
		art[i] = output = {};
		output.textures = outTextures = [];
		textures = data.textures;
		for(j = 0; j < textures.length; ++j)
		{
			tex = textures[j];
			if(typeof tex == "string")
				outTextures.push(Texture.fromImage(tex));
			else if(tex instanceof Texture)
				outTextures.push(tex);
			//assume an object with extra data determining duplicate frame data
			else
			{
				var dupe = tex.count || 1;
				if(typeof tex.texture == "string")
					tex = Texture.fromImage(tex.texture);
				else// if(tex.texture instanceof Texture)
					tex = tex.texture;
				for(; dupe > 0; --dupe)
				{
					outTextures.push(tex);
				}
			}
		}

		//use these values to signify that the animation should match the particle life time.
		if(data.framerate == "matchLife")
		{
			//-1 means that it should be calculated
			output.framerate = -1;
			output.duration = 0;
			output.loop = false;
		}
		else
		{
			//determine if the animation should loop
			output.loop = !!data.loop;
			//get the framerate, default to 60
			output.framerate = data.framerate > 0 ? data.framerate : 60;
			//determine the duration
			output.duration = outTextures.length / output.framerate;
		}
	}

	return art;
};

module.exports = AnimatedParticle;
},{"./Particle":3,"./ParticleUtils":4}],2:[function(require,module,exports){
"use strict";

var ParticleUtils = require("./ParticleUtils"),
	Particle = require("./Particle"),
	ParticleContainer = PIXI.particles.ParticleContainer || PIXI.ParticleContainer,
	ticker = PIXI.ticker.shared;

/**
 * A particle emitter.
 * @memberof PIXI.particles
 * @class Emitter
 * @constructor
 * @param {PIXI.DisplayObjectContainer} particleParent The display object to add the
 *                                                     particles to.
 * @param {Array|PIXI.Texture|String} [particleImages] A texture or array of textures to use
 *                                                     for the particles. Strings will be turned
 *                                                     into textures via Texture.fromImage().
 * @param {Object} [config] A configuration object containing settings for the emitter.
 * @param {Boolean} [config.emit=true] If config.emit is explicitly passed as false, the Emitter
 *                                     will start disabled.
 * @param {Boolean} [config.autoUpdate=false] If config.emit is explicitly passed as true, the Emitter
 *                                     will automatically call update via the PIXI shared ticker.
 */
var Emitter = function(particleParent, particleImages, config)
{
	/**
	 * The constructor used to create new particles. The default is
	 * the built in particle class.
	 * @property {Function} _particleConstructor
	 * @private
	 */
	this._particleConstructor = Particle;
	//properties for individual particles
	/**
	 * An array of PIXI Texture objects.
	 * @property {Array} particleImages
	 */
	this.particleImages = null;
	/**
	 * The starting alpha of all particles.
	 * @property {Number} startAlpha
	 * @default 1
	 */
	this.startAlpha = 1;
	/**
	 * The ending alpha of all particles.
	 * @property {Number} endAlpha
	 * @default 1
	 */
	this.endAlpha = 1;
	/**
	 * The starting speed of all particles.
	 * @property {Number} startSpeed
	 * @default 0
	 */
	this.startSpeed = 0;
	/**
	 * The ending speed of all particles.
	 * @property {Number} endSpeed
	 * @default 0
	 */
	this.endSpeed = 0;
	/**
	 * A minimum multiplier for the speed of a particle at both start and
	 * end. A value between minimumSpeedMultiplier and 1 is randomly generated
	 * and multiplied with startSpeed and endSpeed to provide the actual
	 * startSpeed and endSpeed for each particle.
	 * @property {Number} minimumSpeedMultiplier
	 * @default 1
	 */
	this.minimumSpeedMultiplier = 1;
	/**
	 * Acceleration to apply to particles. Using this disables
	 * any interpolation of particle speed. If the particles do
	 * not have a rotation speed, then they will be rotated to
	 * match the direction of travel.
	 * @property {PIXI.Point} acceleration
	 * @default null
	 */
	this.acceleration = null;
	/**
	 * The maximum speed allowed for accelerating particles. Negative values, values of 0 or NaN
	 * will disable the maximum speed.
	 * @property {Number} maxSpeed
	 * @default NaN
	 */
	this.maxSpeed = NaN;
	/**
	 * The starting scale of all particles.
	 * @property {Number} startScale
	 * @default 1
	 */
	this.startScale = 1;
	/**
	 * The ending scale of all particles.
	 * @property {Number} endScale
	 * @default 1
	 */
	this.endScale = 1;
	/**
	 * A minimum multiplier for the scale of a particle at both start and
	 * end. A value between minimumScaleMultiplier and 1 is randomly generated
	 * and multiplied with startScale and endScale to provide the actual
	 * startScale and endScale for each particle.
	 * @property {Number} minimumScaleMultiplier
	 * @default 1
	 */
	this.minimumScaleMultiplier = 1;
	/**
	 * The starting color of all particles, as red, green, and blue uints from 0-255.
	 * @property {Array} startColor
	 */
	this.startColor = null;
	/**
	 * The ending color of all particles, as red, green, and blue uints from 0-255.
	 * @property {Array} endColor
	 */
	this.endColor = null;
	/**
	 * The minimum lifetime for a particle, in seconds.
	 * @property {Number} minLifetime
	 */
	this.minLifetime = 0;
	/**
	 * The maximum lifetime for a particle, in seconds.
	 * @property {Number} maxLifetime
	 */
	this.maxLifetime = 0;
	/**
	 * The minimum start rotation for a particle, in degrees. This value
	 * is ignored if the spawn type is "burst" or "arc".
	 * @property {Number} minStartRotation
	 */
	this.minStartRotation = 0;
	/**
	 * The maximum start rotation for a particle, in degrees. This value
	 * is ignored if the spawn type is "burst" or "arc".
	 * @property {Number} maxStartRotation
	 */
	this.maxStartRotation = 0;
	/**
	 * If no particle rotation should occur. Starting rotation will still
	 * affect the direction in which particles move. If the rotation speed
	 * is set, then this will be ignored.
	 * @property {Boolean} maxStartRotation
	 */
	this.noRotation = false;
	/**
	 * The minimum rotation speed for a particle, in degrees per second.
	 * This only visually spins the particle, it does not change direction
	 * of movement.
	 * @property {Number} minRotationSpeed
	 */
	this.minRotationSpeed = 0;
	/**
	 * The maximum rotation speed for a particle, in degrees per second.
	 * This only visually spins the particle, it does not change direction
	 * of movement.
	 * @property {Number} maxRotationSpeed
	 */
	this.maxRotationSpeed = 0;
	/**
	 * The blend mode for all particles, as named by PIXI.blendModes.
	 * @property {int} particleBlendMode
	 */
	this.particleBlendMode = 0;
	/**
	 * An easing function for nonlinear interpolation of values. Accepts a single
	 * parameter of time as a value from 0-1, inclusive. Expected outputs are values
	 * from 0-1, inclusive.
	 * @property {Function} customEase
	 */
	this.customEase = null;
	/**
	 *	Extra data for use in custom particles. The emitter doesn't look inside, but
	 *	passes it on to the particle to use in init().
	 *	@property {Object} extraData
	 */
	this.extraData = null;
	//properties for spawning particles
	/**
	 * Time between particle spawns in seconds.
	 * @property {Number} _frequency
	 * @private
	 */
	this._frequency = 1;
	/**
	 * Maximum number of particles to keep alive at a time. If this limit
	 * is reached, no more particles will spawn until some have died.
	 * @property {int} maxParticles
	 * @default 1000
	 */
	this.maxParticles = 1000;
	/**
	 * The amount of time in seconds to emit for before setting emit to false.
	 * A value of -1 is an unlimited amount of time.
	 * @property {Number} emitterLifetime
	 * @default -1
	 */
	this.emitterLifetime = -1;
	/**
	 * Position at which to spawn particles, relative to the emitter's owner's origin.
	 * For example, the flames of a rocket travelling right might have a spawnPos
	 * of {x:-50, y:0}.
	 * to spawn at the rear of the rocket.
	 * To change this, use updateSpawnPos().
	 * @property {PIXI.Point} spawnPos
	 * @readOnly
	 */
	this.spawnPos = null;
	/**
	 * How the particles will be spawned. Valid types are "point", "rectangle",
	 * "circle", "burst", "ring".
	 * @property {String} spawnType
	 * @readOnly
	 */
	this.spawnType = null;
	/**
	 * A reference to the emitter function specific to the spawn type.
	 * @property {Function} _spawnFunc
	 * @private
	 */
	this._spawnFunc = null;
	/**
	 * A rectangle relative to spawnPos to spawn particles inside if the spawn type is "rect".
	 * @property {PIXI.Rectangle} spawnRect
	 */
	this.spawnRect = null;
	/**
	 * A circle relative to spawnPos to spawn particles inside if the spawn type is "circle".
	 * @property {PIXI.Circle} spawnCircle
	 */
	this.spawnCircle = null;
	/**
	 * Number of particles to spawn each wave in a burst.
	 * @property {int} particlesPerWave
	 * @default 1
	 */
	this.particlesPerWave = 1;
	/**
	 * Spacing between particles in a burst. 0 gives a random angle for each particle.
	 * @property {Number} particleSpacing
	 * @default 0
	 */
	this.particleSpacing = 0;
	/**
	 * Angle at which to start spawning particles in a burst.
	 * @property {Number} angleStart
	 * @default 0
	 */
	this.angleStart = 0;
	/**
	 * Rotation of the emitter or emitter's owner in degrees. This is added to
	 * the calculated spawn angle.
	 * To change this, use rotate().
	 * @property {Number} rotation
	 * @default 0
	 * @readOnly
	 */
	this.rotation = 0;
	/**
	 * The world position of the emitter's owner, to add spawnPos to when
	 * spawning particles. To change this, use updateOwnerPos().
	 * @property {PIXI.Point} ownerPos
	 * @default {x:0, y:0}
	 * @readOnly
	 */
	this.ownerPos = null;
	/**
	 * The origin + spawnPos in the previous update, so that the spawn position
	 * can be interpolated to space out particles better.
	 * @property {PIXI.Point} _prevEmitterPos
	 * @private
	 */
	this._prevEmitterPos = null;
	/**
	 * If _prevEmitterPos is valid, to prevent interpolation on the first update
	 * @property {Boolean} _prevPosIsValid
	 * @private
	 * @default false
	 */
	this._prevPosIsValid = false;
	/**
	 * If either ownerPos or spawnPos has changed since the previous update.
	 * @property {Boolean} _posChanged
	 * @private
	 */
	this._posChanged = false;
	/**
	 * If the parent is a ParticleContainer from Pixi V3
	 * @property {Boolean} _parentIsPC
	 * @private
	 */
	this._parentIsPC = false;
	/**
	 * The display object to add particles to.
	 * @property {PIXI.DisplayObjectContainer} _parent
	 * @private
	 */
	this._parent = null;
	/**
	 * If particles should be added at the back of the display list instead of the front.
	 * @property {Boolean} addAtBack
	 */
	this.addAtBack = false;
	/**
	 * The current number of active particles.
	 * @property {Number} particleCount
	 * @readOnly
	 */
	this.particleCount = 0;
	/**
	 * If particles should be emitted during update() calls. Setting this to false
	 * stops new particles from being created, but allows existing ones to die out.
	 * @property {Boolean} _emit
	 * @private
	 */
	this._emit = false;
	/**
	 * The timer for when to spawn particles in seconds, where numbers less
	 * than 0 mean that particles should be spawned.
	 * @property {Number} _spawnTimer
	 * @private
	 */
	this._spawnTimer = 0;
	/**
	 * The life of the emitter in seconds.
	 * @property {Number} _emitterLife
	 * @private
	 */
	this._emitterLife = -1;
	/**
	 * The particles that are active and on the display list. This is the first particle in a
	 * linked list.
	 * @property {Particle} _activeParticlesFirst
	 * @private
	 */
	this._activeParticlesFirst = null;
	/**
	 * The particles that are active and on the display list. This is the last particle in a
	 * linked list.
	 * @property {Particle} _activeParticlesLast
	 * @private
	 */
	this._activeParticlesLast = null;
	/**
	 * The particles that are not currently being used. This is the first particle in a
	 * linked list.
	 * @property {Particle} _poolFirst
	 * @private
	 */
	this._poolFirst = null;
	/**
	 * The original config object that this emitter was initialized with.
	 * @property {Object} _origConfig
	 * @private
	 */
	this._origConfig = null;
	/**
	 * The original particle image data that this emitter was initialized with.
	 * @property {PIXI.Texture|Array|String} _origArt
	 * @private
	 */
	this._origArt = null;
	/**
	 * If the update function is called automatically from the shared ticker.
	 * Setting this to false requires calling the update function manually.
	 * @property {Boolean} _autoUpdate
	 * @private
	 */
	this._autoUpdate = false;
	/**
	 * If the emitter should destroy itself when all particles have died out. This is set by
	 * playOnceAndDestroy();
	 * @property {Boolean} _destroyWhenComplete
	 * @private
	 */
	this._destroyWhenComplete = false;

	//set the initial parent
	this.parent = particleParent;

	if(particleImages && config)
		this.init(particleImages, config);

	//save often used functions on the instance instead of the prototype for better speed
	this.recycle = this.recycle;
	this.update = this.update;
	this.rotate = this.rotate;
	this.updateSpawnPos = this.updateSpawnPos;
	this.updateOwnerPos = this.updateOwnerPos;
};

// Reference to the prototype
var p = Emitter.prototype = {};

var helperPoint = new PIXI.Point();

/**
 * Time between particle spawns in seconds. If this value is not a number greater than 0,
 * it will be set to 1 (particle per second) to prevent infinite loops.
 * @member {Number} PIXI.particles.Emitter#frequency
 */
Object.defineProperty(p, "frequency",
{
	get: function() { return this._frequency; },
	set: function(value)
	{
		//do some error checking to prevent infinite loops
		if(typeof value == "number" && value > 0)
			this._frequency = value;
		else
			this._frequency = 1;
	}
});

/**
 * The constructor used to create new particles. The default is
 * the built in Particle class. Setting this will dump any active or
 * pooled particles, if the emitter has already been used.
 * @member {Function} PIXI.particles.Emitter#particleConstructor
 */
Object.defineProperty(p, "particleConstructor",
{
	get: function() { return this._particleConstructor; },
	set: function(value)
	{
		if(value != this._particleConstructor)
		{
			this._particleConstructor = value;
			//clean up existing particles
			this.cleanup();
			//scrap all the particles
			for (var particle = this._poolFirst; particle; particle = particle.next)
			{
				particle.destroy();
			}
			this._poolFirst = null;
			//re-initialize the emitter so that the new constructor can do anything it needs to
			if(this._origConfig && this._origArt)
				this.init(this._origArt, this._origConfig);
		}
	}
});

/**
* The display object to add particles to. Settings this will dump any active particles.
* @member {PIXI.DisplayObjectContainer} PIXI.particles.Emitter#parent
*/
Object.defineProperty(p, "parent",
{
	get: function() { return this._parent; },
	set: function(value)
	{
		//if our previous parent was a ParticleContainer, then we need to remove
		//pooled particles from it
		if (this._parentIsPC) {
			for (var particle = this._poolFirst; particle; particle = particle.next)
			{
				if(particle.parent)
					particle.parent.removeChild(particle);
			}
		}
		this.cleanup();
		this._parent = value;
		this._parentIsPC = ParticleContainer && value && value instanceof ParticleContainer;
	}
});

/**
 * Sets up the emitter based on the config settings.
 * @method PIXI.particles.Emitter#init
 * @param {Array|PIXI.Texture} art A texture or array of textures to use for the particles.
 * @param {Object} config A configuration object containing settings for the emitter.
 */
p.init = function(art, config)
{
	if(!art || !config)
		return;
	//clean up any existing particles
	this.cleanup();

	//store the original config and particle images, in case we need to re-initialize
	//when the particle constructor is changed
	this._origConfig = config;
	this._origArt = art;

	//set up the array of data, also ensuring that it is an array
	art = Array.isArray(art) ? art.slice() : [art];
	//run the art through the particle class's parsing function
	var partClass = this._particleConstructor;
	this.particleImages = partClass.parseArt ? partClass.parseArt(art) : art;
	///////////////////////////
	// Particle Properties   //
	///////////////////////////
	//set up the alpha
	if (config.alpha)
	{
		this.startAlpha = config.alpha.start;
		this.endAlpha = config.alpha.end;
	}
	else
		this.startAlpha = this.endAlpha = 1;
	//set up the speed
	if (config.speed)
	{
		this.startSpeed = config.speed.start;
		this.endSpeed = config.speed.end;
		this.minimumSpeedMultiplier = config.speed.minimumSpeedMultiplier || 1;
	}
	else
	{
		this.minimumSpeedMultiplier = 1;
		this.startSpeed = this.endSpeed = 0;
	}
	//set up acceleration
	var acceleration = config.acceleration;
	if(acceleration && (acceleration.x || acceleration.y))
	{
		this.endSpeed = this.startSpeed;
		this.acceleration = new PIXI.Point(acceleration.x, acceleration.y);
		this.maxSpeed = config.maxSpeed || NaN;
	}
	else
		this.acceleration = new PIXI.Point();
	//set up the scale
	if (config.scale)
	{
		this.startScale = config.scale.start;
		this.endScale = config.scale.end;
		this.minimumScaleMultiplier = config.scale.minimumScaleMultiplier || 1;
	}
	else
		this.startScale = this.endScale = this.minimumScaleMultiplier = 1;
	//set up the color
	if (config.color)
	{
		this.startColor = ParticleUtils.hexToRGB(config.color.start);
		//if it's just one color, only use the start color
		if (config.color.start != config.color.end)
		{
			this.endColor = ParticleUtils.hexToRGB(config.color.end);
		}
		else
			this.endColor = null;
	}
	//set up the start rotation
	if (config.startRotation)
	{
		this.minStartRotation = config.startRotation.min;
		this.maxStartRotation = config.startRotation.max;
	}
	else
		this.minStartRotation = this.maxStartRotation = 0;
	if (config.noRotation &&
		(this.minStartRotation || this.maxStartRotation))
	{
		this.noRotation = !!config.noRotation;
	}
	else
		this.noRotation = false;
	//set up the rotation speed
	if (config.rotationSpeed)
	{
		this.minRotationSpeed = config.rotationSpeed.min;
		this.maxRotationSpeed = config.rotationSpeed.max;
	}
	else
		this.minRotationSpeed = this.maxRotationSpeed = 0;
	//set up the lifetime
	this.minLifetime = config.lifetime.min;
	this.maxLifetime = config.lifetime.max;
	//get the blend mode
	this.particleBlendMode = ParticleUtils.getBlendMode(config.blendMode);
	//use the custom ease if provided
	if (config.ease)
	{
		this.customEase = typeof config.ease == "function" ?
													config.ease :
													ParticleUtils.generateEase(config.ease);
	}
	else
		this.customEase = null;
	//set up the extra data, running it through the particle class's parseData function.
	if(partClass.parseData)
		this.extraData = partClass.parseData(config.extraData);
	else
		this.extraData = config.extraData || null;
	//////////////////////////
	// Emitter Properties   //
	//////////////////////////
	//reset spawn type specific settings
	this.spawnRect = this.spawnCircle = null;
	this.particlesPerWave = 1;
	this.particleSpacing = 0;
	this.angleStart = 0;
	var spawnCircle;
	//determine the spawn function to use
	switch(config.spawnType)
	{
		case "rect":
			this.spawnType = "rect";
			this._spawnFunc = this._spawnRect;
			var spawnRect = config.spawnRect;
			this.spawnRect = new PIXI.Rectangle(spawnRect.x, spawnRect.y, spawnRect.w, spawnRect.h);
			break;
		case "circle":
			this.spawnType = "circle";
			this._spawnFunc = this._spawnCircle;
			spawnCircle = config.spawnCircle;
			this.spawnCircle = new PIXI.Circle(spawnCircle.x, spawnCircle.y, spawnCircle.r);
			break;
		case "ring":
			this.spawnType = "ring";
			this._spawnFunc = this._spawnRing;
			spawnCircle = config.spawnCircle;
			this.spawnCircle = new PIXI.Circle(spawnCircle.x, spawnCircle.y, spawnCircle.r);
			this.spawnCircle.minRadius = spawnCircle.minR;
			break;
		case "burst":
			this.spawnType = "burst";
			this._spawnFunc = this._spawnBurst;
			this.particlesPerWave = config.particlesPerWave;
			this.particleSpacing = config.particleSpacing;
			this.angleStart = config.angleStart ? config.angleStart : 0;
			break;
		case "point":
			this.spawnType = "point";
			this._spawnFunc = this._spawnPoint;
			break;
		default:
			this.spawnType = "point";
			this._spawnFunc = this._spawnPoint;
			break;
	}
	//set the spawning frequency
	this.frequency = config.frequency;
	//set the emitter lifetime
	this.emitterLifetime = config.emitterLifetime || -1;
	//set the max particles
	this.maxParticles = config.maxParticles > 0 ? config.maxParticles : 1000;
	//determine if we should add the particle at the back of the list or not
	this.addAtBack = !!config.addAtBack;
	//reset the emitter position and rotation variables
	this.rotation = 0;
	this.ownerPos = new PIXI.Point();
	this.spawnPos = new PIXI.Point(config.pos.x, config.pos.y);
	this._prevEmitterPos = this.spawnPos.clone();
	//previous emitter position is invalid and should not be used for interpolation
	this._prevPosIsValid = false;
	//start emitting
	this._spawnTimer = 0;
	this.emit = config.emit === undefined ? true : !!config.emit;
	this.autoUpdate = config.autoUpdate === undefined ? false : !!config.autoUpdate;
};

/**
 * Recycles an individual particle.
 * @method PIXI.particles.Emitter#recycle
 * @param {Particle} particle The particle to recycle.
 * @private
 */
p.recycle = function(particle)
{
	if(particle.next)
		particle.next.prev = particle.prev;
	if(particle.prev)
		particle.prev.next = particle.next;
	if(particle == this._activeParticlesLast)
		this._activeParticlesLast = particle.prev;
	if(particle == this._activeParticlesFirst)
		this._activeParticlesFirst = particle.next;
	//add to pool
	particle.prev = null;
	particle.next = this._poolFirst;
	this._poolFirst = particle;
	//remove child from display, or make it invisible if it is in a ParticleContainer
	if(this._parentIsPC)
	{
		particle.alpha = 0;
		particle.visible = false;
	}
	else
	{
		if(particle.parent)
			particle.parent.removeChild(particle);
	}
	//decrease count
	--this.particleCount;
};

/**
 * Sets the rotation of the emitter to a new value.
 * @method PIXI.particles.Emitter#rotate
 * @param {Number} newRot The new rotation, in degrees.
 */
p.rotate = function(newRot)
{
	if (this.rotation == newRot) return;
	//caclulate the difference in rotation for rotating spawnPos
	var diff = newRot - this.rotation;
	this.rotation = newRot;
	//rotate spawnPos
	ParticleUtils.rotatePoint(diff, this.spawnPos);
	//mark the position as having changed
	this._posChanged = true;
};

/**
 * Changes the spawn position of the emitter.
 * @method PIXI.particles.Emitter#updateSpawnPos
 * @param {Number} x The new x value of the spawn position for the emitter.
 * @param {Number} y The new y value of the spawn position for the emitter.
 */
p.updateSpawnPos = function(x, y)
{
	this._posChanged = true;
	this.spawnPos.x = x;
	this.spawnPos.y = y;
};

/**
 * Changes the position of the emitter's owner. You should call this if you are adding
 * particles to the world display object that your emitter's owner is moving around in.
 * @method PIXI.particles.Emitter#updateOwnerPos
 * @param {Number} x The new x value of the emitter's owner.
 * @param {Number} y The new y value of the emitter's owner.
 */
p.updateOwnerPos = function(x, y)
{
	this._posChanged = true;
	this.ownerPos.x = x;
	this.ownerPos.y = y;
};

/**
 * Prevents emitter position interpolation in the next update.
 * This should be used if you made a major position change of your emitter's owner
 * that was not normal movement.
 * @method PIXI.particles.Emitter#resetPositionTracking
 */
p.resetPositionTracking = function()
{
	this._prevPosIsValid = false;
};

/**
 * If particles should be emitted during update() calls. Setting this to false
 * stops new particles from being created, but allows existing ones to die out.
 * @member {Boolean} PIXI.particles.Emitter#emit
 */
Object.defineProperty(p, "emit",
{
	get: function() { return this._emit; },
	set: function(value)
	{
		this._emit = !!value;
		this._emitterLife = this.emitterLifetime;
	}
});

/**
 * If the update function is called automatically from the shared ticker.
 * Setting this to false requires calling the update function manually.
 * @member {Boolean} PIXI.particles.Emitter#autoUpdate
 */
Object.defineProperty(p, "autoUpdate",
{
	get: function() { return this._autoUpdate; },
	set: function(value)
	{
		if (this._autoUpdate && !value)
		{
			ticker.remove(this.update, this);
		}
		else if (!this._autoUpdate && value)
		{
			ticker.add(this.update, this);
		}
		this._autoUpdate = !!value;
	}
});

/**
 * Starts emitting particles, sets autoUpdate to true, and sets up the Emitter to destroy itself
 * when particle emission is complete.
 * @method PIXI.particles.Emitter#playOnceAndDestroy
 */
p.playOnceAndDestroy = function()
{
	this.autoUpdate = true;
	this.emit = true;
	this._destroyWhenComplete = true;
};

/**
 * Updates all particles spawned by this emitter and emits new ones.
 * @method PIXI.particles.Emitter#update
 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
 */
p.update = function(delta)
{
	if (this._autoUpdate)
	{
		delta = delta / PIXI.settings.TARGET_FPMS / 1000;
	}

	//if we don't have a parent to add particles to, then don't do anything.
	//this also works as a isDestroyed check
	if (!this._parent) return;
	//update existing particles
	var i, particle, next;
	for (particle = this._activeParticlesFirst; particle; particle = next)
	{
		next = particle.next;
		particle.update(delta);
	}
	var prevX, prevY;
	//if the previous position is valid, store these for later interpolation
	if(this._prevPosIsValid)
	{
		prevX = this._prevEmitterPos.x;
		prevY = this._prevEmitterPos.y;
	}
	//store current position of the emitter as local variables
	var curX = this.ownerPos.x + this.spawnPos.x;
	var curY = this.ownerPos.y + this.spawnPos.y;
	//spawn new particles
	if (this._emit)
	{
		//decrease spawn timer
		this._spawnTimer -= delta;
		//while _spawnTimer < 0, we have particles to spawn
		while(this._spawnTimer <= 0)
		{
			//determine if the emitter should stop spawning
			if(this._emitterLife > 0)
			{
				this._emitterLife -= this._frequency;
				if(this._emitterLife <= 0)
				{
					this._spawnTimer = 0;
					this._emitterLife = 0;
					this.emit = false;
					break;
				}
			}
			//determine if we have hit the particle limit
			if(this.particleCount >= this.maxParticles)
			{
				this._spawnTimer += this._frequency;
				continue;
			}
			//determine the particle lifetime
			var lifetime;
			if (this.minLifetime == this.maxLifetime)
				lifetime = this.minLifetime;
			else
				lifetime = Math.random() * (this.maxLifetime - this.minLifetime) + this.minLifetime;
			//only make the particle if it wouldn't immediately destroy itself
			if(-this._spawnTimer < lifetime)
			{
				//If the position has changed and this isn't the first spawn,
				//interpolate the spawn position
				var emitPosX, emitPosY;
				if (this._prevPosIsValid && this._posChanged)
				{
					//1 - _spawnTimer / delta, but _spawnTimer is negative
					var lerp = 1 + this._spawnTimer / delta;
					emitPosX = (curX - prevX) * lerp + prevX;
					emitPosY = (curY - prevY) * lerp + prevY;
				}
				else//otherwise just set to the spawn position
				{
					emitPosX = curX;
					emitPosY = curY;
				}
				//create enough particles to fill the wave (non-burst types have a wave of 1)
				i = 0;
				for(var len = Math.min(this.particlesPerWave, this.maxParticles - this.particleCount); i < len; ++i)
				{
					//create particle
					var p, rand;
					if(this._poolFirst)
					{
						p = this._poolFirst;
						this._poolFirst = this._poolFirst.next;
						p.next = null;
					}
					else
					{
						p = new this.particleConstructor(this);
					}

					//set a random texture if we have more than one
					if(this.particleImages.length > 1)
					{
						p.applyArt(this.particleImages.random());
					}
					else
					{
						//if they are actually the same texture, a standard particle
						//will quit early from the texture setting in setTexture().
						p.applyArt(this.particleImages[0]);
					}
					//set up the start and end values
					p.startAlpha = this.startAlpha;
					p.endAlpha = this.endAlpha;
					if(this.minimumSpeedMultiplier != 1)
					{
						rand = Math.random() * (1 - this.minimumSpeedMultiplier) + this.minimumSpeedMultiplier;
						p.startSpeed = this.startSpeed * rand;
						p.endSpeed = this.endSpeed * rand;
					}
					else
					{
						p.startSpeed = this.startSpeed;
						p.endSpeed = this.endSpeed;
					}
					p.acceleration.x = this.acceleration.x;
					p.acceleration.y = this.acceleration.y;
					p.maxSpeed = this.maxSpeed;
					if(this.minimumScaleMultiplier != 1)
					{
						rand = Math.random() * (1 - this.minimumScaleMultiplier) + this.minimumScaleMultiplier;
						p.startScale = this.startScale * rand;
						p.endScale = this.endScale * rand;
					}
					else
					{
						p.startScale = this.startScale;
						p.endScale = this.endScale;
					}
					p.startColor = this.startColor;
					p.endColor = this.endColor;
					//randomize the rotation speed
					if(this.minRotationSpeed == this.maxRotationSpeed)
						p.rotationSpeed = this.minRotationSpeed;
					else
						p.rotationSpeed = Math.random() * (this.maxRotationSpeed - this.minRotationSpeed) + this.minRotationSpeed;
					p.noRotation = this.noRotation;
					//set up the lifetime
					p.maxLife = lifetime;
					//set the blend mode
					p.blendMode = this.particleBlendMode;
					//set the custom ease, if any
					p.ease = this.customEase;
					//set the extra data, if any
					p.extraData = this.extraData;
					//call the proper function to handle rotation and position of particle
					this._spawnFunc(p, emitPosX, emitPosY, i);
					//initialize particle
					p.init();
					//update the particle by the time passed, so the particles are spread out properly
					p.update(-this._spawnTimer);//we want a positive delta, because a negative delta messes things up
					//add the particle to the display list
					if(!this._parentIsPC || !p.parent)
					{
						if (this.addAtBack)
							this._parent.addChildAt(p, 0);
						else
							this._parent.addChild(p);
					}
					else
					{
						//kind of hacky, but performance friendly
						//shuffle children to correct place
						var children = this._parent.children;
						//avoid using splice if possible
						if(children[0] == p)
							children.shift();
						else if(children[children.length-1] == p)
							children.pop();
						else
						{
							var index = children.indexOf(p);
							children.splice(index, 1);
						}
						if(this.addAtBack)
							children.unshift(p);
						else
							children.push(p);
					}
					//add particle to list of active particles
					if(this._activeParticlesLast)
					{
						this._activeParticlesLast.next = p;
						p.prev = this._activeParticlesLast;
						this._activeParticlesLast = p;
					}
					else
					{
						this._activeParticlesLast = this._activeParticlesFirst = p;
					}
					++this.particleCount;
				}
			}
			//increase timer and continue on to any other particles that need to be created
			this._spawnTimer += this._frequency;
		}
	}
	//if the position changed before this update, then keep track of that
	if(this._posChanged)
	{
		this._prevEmitterPos.x = curX;
		this._prevEmitterPos.y = curY;
		this._prevPosIsValid = true;
		this._posChanged = false;
	}

	//if we are all done and should destroy ourselves, take care of that
	if (this._destroyWhenComplete && !this._emit && !this._activeParticlesFirst)
	{
		this.destroy();
	}
};

/**
 * Positions a particle for a point type emitter.
 * @method PIXI.particles.Emitter#_spawnPoint
 * @private
 * @param {Particle} p The particle to position and rotate.
 * @param {Number} emitPosX The emitter's x position
 * @param {Number} emitPosY The emitter's y position
 * @param {int} i The particle number in the current wave. Not used for this function.
 */
p._spawnPoint = function(p, emitPosX, emitPosY)
{
	//set the initial rotation/direction of the particle based on
	//starting particle angle and rotation of emitter
	if (this.minStartRotation == this.maxStartRotation)
		p.rotation = this.minStartRotation + this.rotation;
	else
		p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) + this.minStartRotation + this.rotation;
	//drop the particle at the emitter's position
	p.position.x = emitPosX;
	p.position.y = emitPosY;
};

/**
 * Positions a particle for a rectangle type emitter.
 * @method PIXI.particles.Emitter#_spawnRect
 * @private
 * @param {Particle} p The particle to position and rotate.
 * @param {Number} emitPosX The emitter's x position
 * @param {Number} emitPosY The emitter's y position
 * @param {int} i The particle number in the current wave. Not used for this function.
 */
p._spawnRect = function(p, emitPosX, emitPosY)
{
	//set the initial rotation/direction of the particle based on starting
	//particle angle and rotation of emitter
	if (this.minStartRotation == this.maxStartRotation)
		p.rotation = this.minStartRotation + this.rotation;
	else
		p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) + this.minStartRotation + this.rotation;
	//place the particle at a random point in the rectangle
	helperPoint.x = Math.random() * this.spawnRect.width + this.spawnRect.x;
	helperPoint.y = Math.random() * this.spawnRect.height + this.spawnRect.y;
	if(this.rotation !== 0)
		ParticleUtils.rotatePoint(this.rotation, helperPoint);
	p.position.x = emitPosX + helperPoint.x;
	p.position.y = emitPosY + helperPoint.y;
};

/**
 * Positions a particle for a circle type emitter.
 * @method PIXI.particles.Emitter#_spawnCircle
 * @private
 * @param {Particle} p The particle to position and rotate.
 * @param {Number} emitPosX The emitter's x position
 * @param {Number} emitPosY The emitter's y position
 * @param {int} i The particle number in the current wave. Not used for this function.
 */
p._spawnCircle = function(p, emitPosX, emitPosY)
{
	//set the initial rotation/direction of the particle based on starting
	//particle angle and rotation of emitter
	if (this.minStartRotation == this.maxStartRotation)
		p.rotation = this.minStartRotation + this.rotation;
	else
		p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) +
					this.minStartRotation + this.rotation;
	//place the particle at a random radius in the circle
	helperPoint.x = Math.random() * this.spawnCircle.radius;
	helperPoint.y = 0;
	//rotate the point to a random angle in the circle
	ParticleUtils.rotatePoint(Math.random() * 360, helperPoint);
	//offset by the circle's center
	helperPoint.x += this.spawnCircle.x;
	helperPoint.y += this.spawnCircle.y;
	//rotate the point by the emitter's rotation
	if(this.rotation !== 0)
		ParticleUtils.rotatePoint(this.rotation, helperPoint);
	//set the position, offset by the emitter's position
	p.position.x = emitPosX + helperPoint.x;
	p.position.y = emitPosY + helperPoint.y;
};

/**
 * Positions a particle for a ring type emitter.
 * @method PIXI.particles.Emitter#_spawnRing
 * @private
 * @param {Particle} p The particle to position and rotate.
 * @param {Number} emitPosX The emitter's x position
 * @param {Number} emitPosY The emitter's y position
 * @param {int} i The particle number in the current wave. Not used for this function.
 */
p._spawnRing = function(p, emitPosX, emitPosY)
{
	var spawnCircle = this.spawnCircle;
	//set the initial rotation/direction of the particle based on starting
	//particle angle and rotation of emitter
	if (this.minStartRotation == this.maxStartRotation)
		p.rotation = this.minStartRotation + this.rotation;
	else
		p.rotation = Math.random() * (this.maxStartRotation - this.minStartRotation) +
					this.minStartRotation + this.rotation;
	//place the particle at a random radius in the ring
	if(spawnCircle.minRadius == spawnCircle.radius)
	{
		helperPoint.x = Math.random() * (spawnCircle.radius - spawnCircle.minRadius) +
						spawnCircle.minRadius;
	}
	else
		helperPoint.x = spawnCircle.radius;
	helperPoint.y = 0;
	//rotate the point to a random angle in the circle
	var angle = Math.random() * 360;
	p.rotation += angle;
	ParticleUtils.rotatePoint(angle, helperPoint);
	//offset by the circle's center
	helperPoint.x += this.spawnCircle.x;
	helperPoint.y += this.spawnCircle.y;
	//rotate the point by the emitter's rotation
	if(this.rotation !== 0)
		ParticleUtils.rotatePoint(this.rotation, helperPoint);
	//set the position, offset by the emitter's position
	p.position.x = emitPosX + helperPoint.x;
	p.position.y = emitPosY + helperPoint.y;
};

/**
 * Positions a particle for a burst type emitter.
 * @method PIXI.particles.Emitter#_spawnBurst
 * @private
 * @param {Particle} p The particle to position and rotate.
 * @param {Number} emitPosX The emitter's x position
 * @param {Number} emitPosY The emitter's y position
 * @param {int} i The particle number in the current wave.
 */
p._spawnBurst = function(p, emitPosX, emitPosY, i)
{
	//set the initial rotation/direction of the particle based on spawn
	//angle and rotation of emitter
	if(this.particleSpacing === 0)
		p.rotation = Math.random() * 360;
	else
		p.rotation = this.angleStart + (this.particleSpacing * i) + this.rotation;
	//drop the particle at the emitter's position
	p.position.x = emitPosX;
	p.position.y = emitPosY;
};

/**
 * Kills all active particles immediately.
 * @method PIXI.particles.Emitter#cleanup
 */
p.cleanup = function()
{
	var particle, next;
	for (particle = this._activeParticlesFirst; particle; particle = next)
	{
		next = particle.next;
		this.recycle(particle);
		if(particle.parent)
			particle.parent.removeChild(particle);
	}
	this._activeParticlesFirst = this._activeParticlesLast = null;
	this.particleCount = 0;
};

/**
 * Destroys the emitter and all of its particles.
 * @method PIXI.particles.Emitter#destroy
 */
p.destroy = function()
{
	//make sure we aren't still listening to any tickers
	this.autoUpdate = false;
	//puts all active particles in the pool, and removes them from the particle parent
	this.cleanup();
	//wipe the pool clean
	var next;
	for (var particle = this._poolFirst; particle; particle = next)
	{
		//store next value so we don't lose it in our destroy call
		next = particle.next;
		particle.destroy();
	}
	this._poolFirst = this._parent = this.particleImages = this.spawnPos = this.ownerPos =
		this.startColor = this.endColor = this.customEase = null;
};

module.exports = Emitter;
},{"./Particle":3,"./ParticleUtils":4}],3:[function(require,module,exports){
var ParticleUtils = require("./ParticleUtils");
var Sprite = PIXI.Sprite;

/**
 * An individual particle image. You shouldn't have to deal with these.
 * @memberof PIXI.particles
 * @class Particle
 * @extends PIXI.Sprite
 * @constructor
 * @param {PIXI.particles.Emitter} emitter The emitter that controls this particle.
 */
var Particle = function(emitter)
{
	//start off the sprite with a blank texture, since we are going to replace it
	//later when the particle is initialized.
	Sprite.call(this);

	/**
	 * The emitter that controls this particle.
	 * @property {Emitter} emitter
	 */
	this.emitter = emitter;
	//particles should be centered
	this.anchor.x = this.anchor.y = 0.5;
	/**
	 * The velocity of the particle. Speed may change, but the angle also
	 * contained in velocity is constant.
	 * @property {PIXI.Point} velocity
	 */
	this.velocity = new PIXI.Point();
	/**
	 * The maximum lifetime of this particle, in seconds.
	 * @property {Number} maxLife
	 */
	this.maxLife = 0;
	/**
	 * The current age of the particle, in seconds.
	 * @property {Number} age
	 */
	this.age = 0;
	/**
	 * A simple easing function to be applied to all properties that
	 * are being interpolated.
	 * @property {Function} ease
	 */
	this.ease = null;
	/**
	 * Extra data that the emitter passes along for custom particles.
	 * @property {Object} extraData
	 */
	this.extraData = null;
	/**
	 * The alpha of the particle at the start of its life.
	 * @property {Number} startAlpha
	 */
	this.startAlpha = 0;
	/**
	 * The alpha of the particle at the end of its life.
	 * @property {Number} endAlpha
	 */
	this.endAlpha = 0;
	/**
	 * The speed of the particle at the start of its life.
	 * @property {Number} startSpeed
	 */
	this.startSpeed = 0;
	/**
	 * The speed of the particle at the end of its life.
	 * @property {Number} endSpeed
	 */
	this.endSpeed = 0;
	/**
	 * Acceleration to apply to the particle.
	 * @property {PIXI.Point} accleration
	 */
	this.acceleration = new PIXI.Point();
	/**
	 * The maximum speed allowed for accelerating particles. Negative values, values of 0 or NaN
	 * will disable the maximum speed.
	 * @property {Number} maxSpeed
	 * @default NaN
	 */
	this.maxSpeed = NaN;
	/**
	 * The scale of the particle at the start of its life.
	 * @property {Number} startScale
	 */
	this.startScale = 0;
	/**
	 * The scale of the particle at the start of its life.
	 * @property {Number} endScale
	 */
	this.endScale = 0;
	/**
	 * The tint of the particle at the start of its life.
	 * @property {Array} startColor
	 */
	this.startColor = null;
	/**
	 * The red tint of the particle at the start of its life.
	 * This is pulled from startColor in init().
	 * @property {uint} _sR
	 * @private
	 */
	this._sR = 0;
	/**
	 * The green tint of the particle at the start of its life.
	 * This is pulled from startColor in init().
	 * @property {uint} _sG
	 * @private
	 */
	this._sG = 0;
	/**
	 * The blue tint of the particle at the start of its life.
	 * This is pulled from startColor in init().
	 * @property {uint} _sB
	 * @private
	 */
	this._sB = 0;
	/**
	 * The tint of the particle at the start of its life.
	 * @property {Array} endColor
	 */
	this.endColor = null;
	/**
	 * The red tint of the particle at the end of its life.
	 * This is pulled from endColor in init().
	 * @property {uint} _eR
	 * @private
	 */
	this._eR = 0;
	/**
	 * The green tint of the particle at the end of its life.
	 * This is pulled from endColor in init().
	 * @property {uint} _sG
	 * @private
	 */
	this._eG = 0;
	/**
	 * The blue tint of the particle at the end of its life.
	 * This is pulled from endColor in init().
	 * @property {uint} _sB
	 * @private
	 */
	this._eB = 0;
	/**
	 * If alpha should be interpolated at all.
	 * @property {Boolean} _doAlpha
	 * @private
	 */
	this._doAlpha = false;
	/**
	 * If scale should be interpolated at all.
	 * @property {Boolean} _doScale
	 * @private
	 */
	this._doScale = false;
	/**
	 * If speed should be interpolated at all.
	 * @property {Boolean} _doSpeed
	 * @private
	 */
	this._doSpeed = false;
	/**
	 * If acceleration should be handled at all. _doSpeed is mutually exclusive with this,
	 * and _doSpeed gets priority.
	 * @property {Boolean} _doAcceleration
	 * @private
	 */
	this._doAcceleration = false;
	/**
	 * If color should be interpolated at all.
	 * @property {Boolean} _doColor
	 * @private
	 */
	this._doColor = false;
	/**
	 * If normal movement should be handled. Subclasses wishing to override movement
	 * can set this to false in init().
	 * @property {Boolean} _doNormalMovement
	 * @private
	 */
	this._doNormalMovement = false;
	/**
	 * One divided by the max life of the particle, saved for slightly faster math.
	 * @property {Number} _oneOverLife
	 * @private
	 */
	this._oneOverLife = 0;

	/**
	 * Reference to the next particle in the list.
	 * @property {Particle} next
	 * @private
	 */
	this.next = null;

	/**
	 * Reference to the previous particle in the list.
	 * @property {Particle} prev
	 * @private
	 */
	this.prev = null;

	//save often used functions on the instance instead of the prototype for better speed
	this.init = this.init;
	this.Particle_init = this.Particle_init;
	this.update = this.update;
	this.Particle_update = this.Particle_update;
	this.applyArt = this.applyArt;
	this.kill = this.kill;
};

// Reference to the prototype
var p = Particle.prototype = Object.create(Sprite.prototype);

/**
 * Initializes the particle for use, based on the properties that have to
 * have been set already on the particle.
 * @method PIXI.particles.Particle#init
 */
/**
 * A reference to init, so that subclasses can access it without the penalty of Function.call()
 * @method PIXI.particles.Particle#Particle_init
 * @protected
 */
p.init = p.Particle_init = function()
{
	//reset the age
	this.age = 0;
	//set up the velocity based on the start speed and rotation
	this.velocity.x = this.startSpeed;
	this.velocity.y = 0;
	ParticleUtils.rotatePoint(this.rotation, this.velocity);
	if (this.noRotation)
	{
		this.rotation = 0;
	}
	else
	{
		//convert rotation to Radians from Degrees
		this.rotation *= ParticleUtils.DEG_TO_RADS;
	}
	//convert rotation speed to Radians from Degrees
	this.rotationSpeed *= ParticleUtils.DEG_TO_RADS;
	//set alpha to inital alpha
	this.alpha = this.startAlpha;
	//set scale to initial scale
	this.scale.x = this.scale.y = this.startScale;
	//determine start and end color values
	if (this.startColor)
	{
		this._sR = this.startColor[0];
		this._sG = this.startColor[1];
		this._sB = this.startColor[2];
		if(this.endColor)
		{
			this._eR = this.endColor[0];
			this._eG = this.endColor[1];
			this._eB = this.endColor[2];
		}
	}
	//figure out what we need to interpolate
	this._doAlpha = this.startAlpha != this.endAlpha;
	this._doSpeed = this.startSpeed != this.endSpeed;
	this._doScale = this.startScale != this.endScale;
	this._doColor = !!this.endColor;
	this._doAcceleration = this.acceleration.x !== 0 || this.acceleration.y !== 0;
	//_doNormalMovement can be cancelled by subclasses
	this._doNormalMovement = this._doSpeed || this.startSpeed !== 0 || this._doAcceleration;
	//save our lerp helper
	this._oneOverLife = 1 / this.maxLife;
	//set the inital color
	this.tint = ParticleUtils.combineRGBComponents(this._sR, this._sG, this._sB);
	//ensure visibility
	this.visible = true;
};

/**
 * Sets the texture for the particle. This can be overridden to allow
 * for an animated particle.
 * @method PIXI.particles.Particle#applyArt
 * @param {PIXI.Texture} art The texture to set.
 */
p.applyArt = function(art)
{
	this.texture = art || ParticleUtils.EMPTY_TEXTURE;
};

/**
 * Updates the particle.
 * @method PIXI.particles.Particle#update
 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
 * @return {Number} The standard interpolation multiplier (0-1) used for all relevant particle
 *                   properties. A value of -1 means the particle died of old age instead.
 */
/**
 * A reference to update so that subclasses can access the original without the overhead
 * of Function.call().
 * @method PIXI.particles.Particle#Particle_update
 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
 * @return {Number} The standard interpolation multiplier (0-1) used for all relevant particle
 *                   properties. A value of -1 means the particle died of old age instead.
 * @protected
 */
p.update = p.Particle_update = function(delta)
{
	//increase age
	this.age += delta;
	//recycle particle if it is too old
	if(this.age >= this.maxLife)
	{
		this.kill();
		return -1;
	}

	//determine our interpolation value
	var lerp = this.age * this._oneOverLife;//lifetime / maxLife;
	if (this.ease)
	{
		if(this.ease.length == 4)
		{
			//the t, b, c, d parameters that some tween libraries use
			//(time, initial value, end value, duration)
			lerp = this.ease(lerp, 0, 1, 1);
		}
		else
		{
			//the simplified version that we like that takes
			//one parameter, time from 0-1. TweenJS eases provide this usage.
			lerp = this.ease(lerp);
		}
	}

	//interpolate alpha
	if (this._doAlpha)
		this.alpha = (this.endAlpha - this.startAlpha) * lerp + this.startAlpha;
	//interpolate scale
	if (this._doScale)
	{
		var scale = (this.endScale - this.startScale) * lerp + this.startScale;
		this.scale.x = this.scale.y = scale;
	}
	//handle movement
	if(this._doNormalMovement)
	{
		//interpolate speed
		if (this._doSpeed)
		{
			var speed = (this.endSpeed - this.startSpeed) * lerp + this.startSpeed;
			ParticleUtils.normalize(this.velocity);
			ParticleUtils.scaleBy(this.velocity, speed);
		}
		else if(this._doAcceleration)
		{
			this.velocity.x += this.acceleration.x * delta;
			this.velocity.y += this.acceleration.y * delta;
			if (this.maxSpeed)
			{
				var currentSpeed = ParticleUtils.length(this.velocity);
				//if we are going faster than we should, clamp at the max speed
				//DO NOT recalculate vector length
				if (currentSpeed > this.maxSpeed)
				{
					ParticleUtils.scaleBy(this.velocity, this.maxSpeed / currentSpeed);
				}
			}
		}
		//adjust position based on velocity
		this.position.x += this.velocity.x * delta;
		this.position.y += this.velocity.y * delta;
	}
	//interpolate color
	if (this._doColor)
	{
		var r = (this._eR - this._sR) * lerp + this._sR;
		var g = (this._eG - this._sG) * lerp + this._sG;
		var b = (this._eB - this._sB) * lerp + this._sB;
		this.tint = ParticleUtils.combineRGBComponents(r, g, b);
	}
	//update rotation
	if(this.rotationSpeed !== 0)
	{
		this.rotation += this.rotationSpeed * delta;
	}
	else if(this.acceleration && !this.noRotation)
	{
		this.rotation = Math.atan2(this.velocity.y, this.velocity.x);// + Math.PI / 2;
	}
	return lerp;
};

/**
 * Kills the particle, removing it from the display list
 * and telling the emitter to recycle it.
 * @method PIXI.particles.Particle#kill
 */
p.kill = function()
{
	this.emitter.recycle(this);
};

p.Sprite_Destroy = Sprite.prototype.destroy;
/**
 * Destroys the particle, removing references and preventing future use.
 * @method PIXI.particles.Particle#destroy
 */
p.destroy = function()
{
	if (this.parent)
		this.parent.removeChild(this);
	if (this.Sprite_Destroy)
		this.Sprite_Destroy();
	this.emitter = this.velocity = this.startColor = this.endColor = this.ease =
		this.next = this.prev = null;
};

/**
 * Checks over the art that was passed to the Emitter's init() function, to do any special
 * modifications to prepare it ahead of time.
 * @method PIXI.particles.Particle.parseArt
 * @static
 * @param  {Array} art The array of art data. For Particle, it should be an array of Textures.
 *                     Any strings in the array will be converted to Textures via
 *                     Texture.fromImage().
 * @return {Array} The art, after any needed modifications.
 */
Particle.parseArt = function(art)
{
	//convert any strings to Textures.
	var i;
	for(i = art.length; i >= 0; --i)
	{
		if(typeof art[i] == "string")
			art[i] = PIXI.Texture.fromImage(art[i]);
	}
	//particles from different base textures will be slower in WebGL than if they
	//were from one spritesheet
	if(ParticleUtils.verbose)
	{
		for(i = art.length - 1; i > 0; --i)
		{
			if(art[i].baseTexture != art[i - 1].baseTexture)
			{
				if (window.console)
					console.warn("PixiParticles: using particle textures from different images may hinder performance in WebGL");
				break;
			}
		}
	}

	return art;
};

/**
 * Parses extra emitter data to ensure it is set up for this particle class.
 * Particle does nothing to the extra data.
 * @method PIXI.particles.Particle.parseData
 * @static
 * @param  {Object} extraData The extra data from the particle config.
 * @return {Object} The parsed extra data.
 */
Particle.parseData = function(extraData)
{
	return extraData;
};

module.exports = Particle;
},{"./ParticleUtils":4}],4:[function(require,module,exports){
"use strict";

var BLEND_MODES = PIXI.BLEND_MODES || PIXI.blendModes;
var Texture = PIXI.Texture;

/**
 * Contains helper functions for particles and emitters to use.
 * @memberof PIXI.particles
 * @class ParticleUtils
 * @static
 */
var ParticleUtils = {};

/**
 * If errors and warnings should be logged within the library.
 * @name PIXI.particles.ParticleUtils.verbose
 * @default false
 * @static
 */
ParticleUtils.verbose = false;

var DEG_TO_RADS = ParticleUtils.DEG_TO_RADS = Math.PI / 180;

var empty = ParticleUtils.EMPTY_TEXTURE = Texture.EMPTY;
//prevent any events from being used on the empty texture, as well as destruction of it
//v4 of Pixi does this, but doing it again won't hurt
empty.on = empty.destroy = empty.once = empty.emit = function() {};

/**
 * Rotates a point by a given angle.
 * @method PIXI.particles.ParticleUtils.rotatePoint
 * @param {Number} angle The angle to rotate by in degrees
 * @param {PIXI.Point} p The point to rotate around 0,0.
 * @static
 */
ParticleUtils.rotatePoint = function(angle, p)
{
	if(!angle) return;
	angle *= DEG_TO_RADS;
	var s = Math.sin(angle);
	var c = Math.cos(angle);
	var xnew = p.x * c - p.y * s;
	var ynew = p.x * s + p.y * c;
	p.x = xnew;
	p.y = ynew;
};

/**
 * Combines separate color components (0-255) into a single uint color.
 * @method PIXI.particles.ParticleUtils.combineRGBComponents
 * @param {uint} r The red value of the color
 * @param {uint} g The green value of the color
 * @param {uint} b The blue value of the color
 * @return {uint} The color in the form of 0xRRGGBB
 * @static
 */
ParticleUtils.combineRGBComponents = function(r, g, b/*, a*/)
{
	return /*a << 24 |*/ r << 16 | g << 8 | b;
};

/**
 * Reduces the point to a length of 1.
 * @method PIXI.particles.ParticleUtils.normalize
 * @static
 * @param {PIXI.Point} point The point to normalize
 */
ParticleUtils.normalize = function(point)
{
	var oneOverLen = 1 / ParticleUtils.length(point);
	point.x *= oneOverLen;
	point.y *= oneOverLen;
};

/**
 * Multiplies the x and y values of this point by a value.
 * @method PIXI.particles.ParticleUtils.scaleBy
 * @static
 * @param {PIXI.Point} point The point to scaleBy
 * @param value {Number} The value to scale by.
 */
ParticleUtils.scaleBy = function(point, value)
{
	point.x *= value;
	point.y *= value;
};

/**
 * Returns the length (or magnitude) of this point.
 * @method PIXI.particles.ParticleUtils.length
 * @static
 * @param {PIXI.Point} point The point to measure length
 * @return The length of this point.
 */
ParticleUtils.length = function(point)
{
	return Math.sqrt(point.x * point.x + point.y * point.y);
};

/**
 * Converts a hex string from "#AARRGGBB", "#RRGGBB", "0xAARRGGBB", "0xRRGGBB",
 * "AARRGGBB", or "RRGGBB" to an array of ints of 0-255 or Numbers from 0-1, as
 * [r, g, b, (a)].
 * @method PIXI.particles.ParticleUtils.hexToRGB
 * @param {String} color The input color string.
 * @param {Array} output An array to put the output in. If omitted, a new array is created.
 * @return The array of numeric color values.
 * @static
 */
ParticleUtils.hexToRGB = function(color, output)
{
	if (output)
		output.length = 0;
	else
		output = [];
	if (color.charAt(0) == "#")
		color = color.substr(1);
	else if (color.indexOf("0x") === 0)
		color = color.substr(2);
	var alpha;
	if (color.length == 8)
	{
		alpha = color.substr(0, 2);
		color = color.substr(2);
	}
	output.push(parseInt(color.substr(0, 2), 16));//Red
	output.push(parseInt(color.substr(2, 2), 16));//Green
	output.push(parseInt(color.substr(4, 2), 16));//Blue
	if (alpha)
		output.push(parseInt(alpha, 16));
	return output;
};

/**
 * Generates a custom ease function, based on the GreenSock custom ease, as demonstrated
 * by the related tool at http://www.greensock.com/customease/.
 * @method PIXI.particles.ParticleUtils.generateEase
 * @param {Array} segments An array of segments, as created by
 * http://www.greensock.com/customease/.
 * @return {Function} A function that calculates the percentage of change at
 *                    a given point in time (0-1 inclusive).
 * @static
 */
ParticleUtils.generateEase = function(segments)
{
	var qty = segments.length;
	var oneOverQty = 1 / qty;
	/*
	 * Calculates the percentage of change at a given point in time (0-1 inclusive).
	 * @param {Number} time The time of the ease, 0-1 inclusive.
	 * @return {Number} The percentage of the change, 0-1 inclusive (unless your
	 *                  ease goes outside those bounds).
	 */
	var simpleEase = function(time)
	{
		var t, s;
		var i = (qty * time) | 0;//do a quick floor operation
		t = (time - (i * oneOverQty)) * qty;
		s = segments[i] || segments[qty - 1];
		return (s.s + t * (2 * (1 - t) * (s.cp - s.s) + t * (s.e - s.s)));
	};
	return simpleEase;
};

/**
 * Gets a blend mode, ensuring that it is valid.
 * @method PIXI.particles.ParticleUtils.getBlendMode
 * @param {String} name The name of the blend mode to get.
 * @return {int} The blend mode as specified in the PIXI.blendModes enumeration.
 * @static
 */
ParticleUtils.getBlendMode = function(name)
{
	if (!name) return BLEND_MODES.NORMAL;
	name = name.toUpperCase();
	while (name.indexOf(" ") >= 0)
		name = name.replace(" ", "_");
	return BLEND_MODES[name] || BLEND_MODES.NORMAL;
};

module.exports = ParticleUtils;
},{}],5:[function(require,module,exports){
"use strict";

var ParticleUtils = require("./ParticleUtils"),
	Particle = require("./Particle");

/**
 * An particle that follows a path defined by an algebraic expression, e.g. "sin(x)" or
 * "5x + 3".
 * To use this class, the particle config must have a "path" string in the
 * "extraData" parameter. This string should have "x" in it to represent movement (from the
 * speed settings of the particle). It may have numbers, parentheses, the four basic
 * operations, and the following Math functions or properties (without the preceding "Math."):
 * "pow", "sqrt", "abs", "floor", "round", "ceil", "E", "PI", "sin", "cos", "tan", "asin",
 * "acos", "atan", "atan2", "log".
 * The overall movement of the particle and the expression value become x and y positions for
 * the particle, respectively. The final position is rotated by the spawn rotation/angle of
 * the particle.
 *
 * Some example paths:
 *
 * 	"sin(x/10) * 20" // A sine wave path.
 * 	"cos(x/100) * 30" // Particles curve counterclockwise (for medium speed/low lifetime particles)
 * 	"pow(x/10, 2) / 2" // Particles curve clockwise (remember, +y is down).
 *
 * @memberof PIXI.particles
 * @class PathParticle
 * @extends PIXI.particles.Particle
 * @constructor
 * @param {PIXI.particles.Emitter} emitter The emitter that controls this PathParticle.
 */
var PathParticle = function(emitter)
{
	Particle.call(this, emitter);
	/**
	 * The function representing the path the particle should take.
	 * @property {Function} path
	 */
	this.path = null;
	/**
	 * The initial rotation in degrees of the particle, because the direction of the path
	 * is based on that.
	 * @property {Number} initialRotation
	 */
	this.initialRotation = 0;
	/**
	 * The initial position of the particle, as all path movement is added to that.
	 * @property {PIXI.Point} initialPosition
	 */
	this.initialPosition = new PIXI.Point();
	/**
	 * Total single directional movement, due to speed.
	 * @property {Number} movement
	 */
	this.movement = 0;
};

// Reference to the super class
var s = Particle.prototype;
// Reference to the prototype
var p = PathParticle.prototype = Object.create(s);

/**
 * A helper point for math things.
 * @property {Function} helperPoint
 * @private
 * @static
 */
var helperPoint = new PIXI.Point();

/**
 * Initializes the particle for use, based on the properties that have to
 * have been set already on the particle.
 * @method PIXI.particles.PathParticle#init
 */
p.init = function()
{
	//get initial rotation before it is converted to radians
	this.initialRotation = this.rotation;
	//standard init
	this.Particle_init();

	//set the path for the particle
	this.path = this.extraData.path;
	//cancel the normal movement behavior
	this._doNormalMovement = !this.path;
	//reset movement
	this.movement = 0;
	//grab position
	this.initialPosition.x = this.position.x;
	this.initialPosition.y = this.position.y;
};

//a hand picked list of Math functions (and a couple properties) that are allowable.
//they should be used without the preceding "Math."
var MATH_FUNCS =
[
	"pow",
	"sqrt",
	"abs",
	"floor",
	"round",
	"ceil",
	"E",
	"PI",
	"sin",
	"cos",
	"tan",
	"asin",
	"acos",
	"atan",
	"atan2",
	"log"
];
//Allow the 4 basic operations, parentheses and all numbers/decimals, as well
//as 'x', for the variable usage.
var WHITELISTER = "[01234567890\\.\\*\\-\\+\\/\\(\\)x ,]";
//add the math functions to the regex string.
for(var index = MATH_FUNCS.length - 1; index >= 0; --index)
{
	WHITELISTER += "|" + MATH_FUNCS[index];
}
//create an actual regular expression object from the string
WHITELISTER = new RegExp(WHITELISTER, "g");

/**
 * Parses a string into a function for path following.
 * This involves whitelisting the string for safety, inserting "Math." to math function
 * names, and using eval() to generate a function.
 * @method PIXI.particles.PathParticle~parsePath
 * @private
 * @static
 * @param {String} pathString The string to parse.
 * @return {Function} The path function - takes x, outputs y.
 */
var parsePath = function(pathString)
{
	var rtn;
	var matches = pathString.match(WHITELISTER);
	for(var i = matches.length - 1; i >= 0; --i)
	{
		if(MATH_FUNCS.indexOf(matches[i]) >= 0)
			matches[i] = "Math." + matches[i];
	}
	pathString = matches.join("");
	eval("rtn = function(x){ return " + pathString + "; };");// jshint ignore:line
	return rtn;
};

/**
 * Updates the particle.
 * @method PIXI.particles.PathParticle#update
 * @param {Number} delta Time elapsed since the previous frame, in __seconds__.
 */
p.update = function(delta)
{
	var lerp = this.Particle_update(delta);
	//if the particle died during the update, then don't bother
	if(lerp >= 0 && this.path)
	{
		//increase linear movement based on speed
		var speed = (this.endSpeed - this.startSpeed) * lerp + this.startSpeed;
		this.movement += speed * delta;
		//set up the helper point for rotation
		helperPoint.x = this.movement;
		helperPoint.y = this.path(this.movement);
		ParticleUtils.rotatePoint(this.initialRotation, helperPoint);
		this.position.x = this.initialPosition.x + helperPoint.x;
		this.position.y = this.initialPosition.y + helperPoint.y;
	}
};

p.Particle_destroy = Particle.prototype.destroy;
/**
 * Destroys the particle, removing references and preventing future use.
 * @method PIXI.particles.PathParticle#destroy
 */
p.destroy = function()
{
	this.Particle_destroy();
	this.path = this.initialPosition = null;
};

/**
 * Checks over the art that was passed to the Emitter's init() function, to do any special
 * modifications to prepare it ahead of time. This just runs Particle.parseArt().
 * @method PIXI.particles.PathParticle.parseArt
 * @static
 * @param  {Array} art The array of art data. For Particle, it should be an array of Textures.
 *                     Any strings in the array will be converted to Textures via
 *                     Texture.fromImage().
 * @return {Array} The art, after any needed modifications.
 */
PathParticle.parseArt = function(art)
{
	return Particle.parseArt(art);
};

/**
 * Parses extra emitter data to ensure it is set up for this particle class.
 * PathParticle checks for the existence of path data, and parses the path data for use
 * by particle instances.
 * @method PIXI.particles.PathParticle.parseData
 * @static
 * @param  {Object} extraData The extra data from the particle config.
 * @return {Object} The parsed extra data.
 */
PathParticle.parseData = function(extraData)
{
	var output = {};
	if(extraData && extraData.path)
	{
		try
		{
			output.path = parsePath(extraData.path);
		}
		catch(e)
		{
			if(ParticleUtils.verbose)
				console.error("PathParticle: error in parsing path expression");
			output.path = null;
		}
	}
	else
	{
		if(ParticleUtils.verbose)
			console.error("PathParticle requires a path string in extraData!");
		output.path = null;
	}
	return output;
};

module.exports = PathParticle;
},{"./Particle":3,"./ParticleUtils":4}],6:[function(require,module,exports){
//Nothing to deprecate right now!
},{}],7:[function(require,module,exports){
require("./polyfills.js");
exports.ParticleUtils = require("./ParticleUtils.js");
exports.Particle = require("./Particle.js");
exports.Emitter = require("./Emitter.js");
exports.PathParticle = require("./PathParticle.js");
exports.AnimatedParticle = require("./AnimatedParticle.js");
require("./deprecation.js");
},{"./AnimatedParticle.js":1,"./Emitter.js":2,"./Particle.js":3,"./ParticleUtils.js":4,"./PathParticle.js":5,"./deprecation.js":6,"./polyfills.js":8}],8:[function(require,module,exports){
/**
 * Add methods to Array
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 * @class Array
 */

/**
 * Shuffles the array
 * @method shuffle
 * @return {Array} The array, for chaining calls.
 */
if(!Array.prototype.shuffle)
{
	// In EcmaScript 5 specs and browsers that support it you can use the Object.defineProperty
	// to make it not enumerable set the enumerable property to false
	Object.defineProperty(Array.prototype, 'shuffle', {
		enumerable: false,
		writable:false,
		value: function() {
			for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
			return this;
		}
	});
}

/**
 * Get a random item from an array
 * @method random
 * @return {*} The random item
 */
if(!Array.prototype.random)
{
	Object.defineProperty(Array.prototype, 'random', {
		enumerable: false,
		writable: false,
		value: function() {
			return this[Math.floor(Math.random() * this.length)];
		}
	});
}
},{}],9:[function(require,module,exports){
"use strict";

// Check for window, fallback to global
var global = typeof window !== 'undefined' ? window : GLOBAL;

//ensure that the particles namespace exist - PIXI 4 creates it itself, PIXI 3 does not
if (!global.PIXI.particles) {
	global.PIXI.particles = {};
}

// Export for Node-compatible environments like Electron
if (typeof module !== 'undefined' && module.exports)
{
	// Attempt to require the pixi module
	if (typeof PIXI === 'undefined')
	{
		// Include the Pixi.js module
		require('pixi.js');
	}

	// Export the module
	module.exports = global.PIXI.particles || particles;
}
// If we're in the browser make sure PIXI is available
else if (typeof PIXI === 'undefined')
{
	throw "pixi-particles requires pixi.js to be loaded first";
}

// get the library itself
var particles = require('./particles');

// insert the lirbary into the particles namespace on PIXI
for (var prop in particles) {
	global.PIXI.particles[prop] = particles[prop];
}
},{"./particles":7,"pixi.js":undefined}]},{},[9])(9)
});


//# sourceMappingURL=pixi-particles.js.map


var GAME = GAME || {};
GAME.stageWidth=0;
GAME.stageHeight=0;
GAME.stage=null;
GAME.canvas=null;
GAME.renderer=null;
GAME.SCENE_IN="sceneIn";
GAME.SCENE_OUT="sceneOut";
GAME.SCENE_IN_COMPLETE="sceneInComplete";
GAME.SCENE_OUT_COMPLETE="sceneOutComplete";
GAME.ON_ENTER_FRAME="onEnterFrame";
GAME.retinaSupport=true;

GAME.imageScale=1;
GAME.positionScale=1;
GAME.Utils=GAME.Utils||{};
GAME.Utils.inherit = function(ctor, superCtor)
{
    ctor.superClass = superCtor;
    ctor.prototype = Object.create(superCtor.prototype);
    ctor.prototype.constructor = ctor;
};
GAME.Utils.extend = function(origin, add)
{
    // Don't do anything if add isn't an object
    if (!add || typeof add !== 'object')
        return origin;

    var keys = Object.keys(add);
    var i = keys.length;
    while (i--)
    {
        origin[keys[i]] = add[keys[i]];
    }
    return origin;
};
GAME.Utils.isAndroid=function()
{
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array("Android", "SymbianOS", "Windows Phone");
    var flag = false;
    for (var v = 0; v < Agents.length; v++)
    {
        if (userAgentInfo.indexOf(Agents[v]) > 0)
        {
            flag = true;
            break;
        }
    }
    return flag;
}

GAME.Utils.isM2=function()
{
    var userAgentInfo = navigator.userAgent;
    var flag = false;
    if (userAgentInfo.indexOf("m2") > 0)
    {
        flag = true;
    }
    return flag;
}

/**
 * @author waterTian
 */
GAME.EventDispatcher = function() {}
GAME.EventDispatcher.prototype = {
	constructor: GAME.EventDispatcher,
	addEventListener: function(type, listener) {
		if (!this._listeners) {
			this._listeners = {};
		} else {
			this.removeEventListener(type, listener);
		}

		if (!this._listeners[type]) this._listeners[type] = []
		this._listeners[type].push(listener);

		return listener;
	},

	hasEventListener: function(type, listener) {
		var listeners = this._listeners;
		return !!(listeners && listeners[type]);
	},

	removeEventListener: function(type, listener) {
		if (!this._listeners) return;
		if (!this._listeners[type]) return;

		var arr = this._listeners[type];
		for (var i = 0, l = arr.length; i < l; i++) {
			if (arr[i] == listener) {
				if (l == 1) {
					delete(this._listeners[type]);
				}
				// allows for faster checks.
				else {
					arr.splice(i, 1);
				}
				break;
			}
		}
	},
	removeAllEventListeners: function(type) {
		if (!type)
			this._listeners = null;
		else if (this._listeners)
			delete(this._listeners[type]);
	},

	dispatchEvent: function(eventName, eventTarget) {
		var ret = false,
			listeners = this._listeners;

		if (eventName && listeners) {
			var arr = listeners[eventName];
			if (!arr) return ret;

			arr = arr.slice();
			// to avoid issues with items being removed or added during the dispatch

			var handler, i = arr.length;
			while (i--) {
				var handler = arr[i];
				ret = ret || handler(eventTarget);
			}

		}
		return !!ret;
	}
};
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
GAME.Scene = function ()
{
    PIXI.Container.call(this);
};
GAME.Utils.inherit(GAME.Scene, PIXI.Container);
GAME.Utils.extend(GAME.Scene.prototype, GAME.EventDispatcher.prototype);

GAME.Scene.prototype.init = function (){}
GAME.Scene.prototype.destroy = function (){}


///////////////
//  SCENE_IN  SCENE_OUT  SCENE_IN_COMPLETE  SCENE_OUT_COMPLETE

GAME.Scene.prototype.sceneIn = function ()
{
    this.dispatchEvent("SCENE_IN");
};
GAME.Scene.prototype.sceneOut = function ()
{
    this.dispatchEvent("SCENE_OUT");
};
GAME.Scene.prototype.sceneInComplete = function ()
{
    this.dispatchEvent("SCENE_IN_COMPLETE");
};
GAME.Scene.prototype.sceneOutComplete = function ()
{
    this.dispatchEvent("SCENE_OUT_COMPLETE");
};

GAME.GameScene1 = function ()
{
    GAME.Scene.call(this);
    var _this = this;
    var _isSceneIn = false;
    var _background;
    var _stage1Container,_stage2Container;
    var _pic1,_pic2,_pic4,_pic5,_pic6;
    var _btn1,_btn2;
    var _txt1;
    var _t1;


    this.init = function ()
    {


    }


    this.sceneIn = function ()
    {
        GAME.Scene.prototype.sceneIn.apply(this);

        initStage1();

        _isSceneIn = true;
    }
    this.update = function ()
    {
        if (!_isSceneIn)return;

    }


    function initStage1()
    {
        _stage1Container = new PIXI.Container();
        _stage1Container.position.x = GAME.stageWidth/2;
        _stage1Container.position.y = GAME.stageHeight;
        _this.addChild(_stage1Container);


        _t1 = PIXI.Sprite.fromFrame("t1.png");
        //_t1.scale.y = _t1.scale.x=GAME.imageScale;
        _t1.anchor.x = 0.5;
        _stage1Container.addChild(_t1);
        _t1.position.y=-GAME.stageHeight;
        _t1.alpha=0;
        TweenMax.to(_t1, 1, { alpha: 1,ease:Strong.easeOut,delay:0.6});



        _txt1= new PIXI.Text("Text1", { font: "50px Helvetica", fill: "#FFFFFF" });
        _stage1Container.addChild(_txt1);
        _txt1.anchor.x = 0.5;
        _txt1.anchor.y = 1;
        _txt1.alpha=0;
        TweenMax.to(_txt1, 1, { alpha: 1,ease:Strong.easeOut,delay:1});
        TweenMax.to(_txt1.position, 1, { y: -460,ease:Elastic.easeOut,delay:0.8});

        _txt1.rotation = -0.05;
        TweenMax.to(_txt1, 0.1, { rotation: 0.1,ease:Linear.easeNone,repeat:-1,yoyo:true,delay:2});



        var _mask = new PIXI.Graphics();
        _mask.lineStyle(0);
        _mask.beginFill(0x000, 1);
        _mask.drawCircle(0, 0, 50);
        _stage1Container.addChild(_mask);
        _mask.position.y = -460;
        _txt1.mask = _mask;







        _pic1 = PIXI.Sprite.fromFrame("pic1.jpg");
        //_pic1.scale.y = _pic1.scale.x=GAME.imageScale;
        _pic1.anchor.x = 0.5;
        _pic1.anchor.y = 1;
        _stage1Container.addChild(_pic1);
        _pic1.alpha=0;
        TweenMax.to(_pic1, 1, { alpha: 1,ease:Strong.easeOut,delay:1});
        TweenMax.to(_pic1.position, 1, { y: Math.floor(-350),ease:Elastic.easeOut,delay:1});


        _pic2 = PIXI.Sprite.fromFrame("pic2.jpg");
        //_pic2.scale.y = _pic2.scale.x=GAME.imageScale;
        _pic2.anchor.x = 0.5;
        _pic2.anchor.y = 1;
        _stage1Container.addChild(_pic2);
        _pic2.alpha=0;
        TweenMax.to(_pic2, 1, { alpha: 1,ease:Strong.easeOut,delay:1.2});
        TweenMax.to(_pic2.position, 1, { y: Math.floor(-210),ease:Elastic.easeOut,delay:1.2});


        _btn1 = PIXI.Sprite.fromFrame("btn1.png");
        //_btn1.scale.y = _btn1.scale.x=GAME.imageScale;
        _btn1.anchor.x = 0.5;
        _btn1.anchor.y = 1;
        _stage1Container.addChild(_btn1);
        _btn1.alpha=0;
        TweenMax.to(_btn1, 1, { alpha: 1,ease:Strong.easeOut,delay:1.4});
        TweenMax.to(_btn1.position, 1, { y: -20,ease:Elastic.easeOut,delay:1.4});



        _btn1.interactive = true;
        _btn1.mousedown = _btn1.touchstart = function ()
        {
            removeStage1();
            initStage2(); 
        }

    }




    function removeStage1()
    {
        TweenMax.to(_stage1Container, 0.4, { alpha: 0,
            onComplete:function()
            {
                _this.removeChild(_stage1Container);
                _stage1Container=null;
            }
        });
    }



    function initStage2()
    {
        PIXI.sound.play("s2");
        _stage2Container = new PIXI.Container();
        _this.addChild(_stage2Container);


        _pic4 = PIXI.Sprite.fromFrame("pic4.jpg");
        //_pic4.scale.y = _pic4.scale.x=GAME.imageScale;
        _pic4.position.x=0;
        _pic4.position.y=100;
        _stage2Container.addChild(_pic4);
        _pic4.alpha=0;
        TweenMax.to(_pic4, 0.6, {alpha: 1});


        _pic5 = PIXI.Sprite.fromFrame("pic5.png");
        //_pic5.scale.y = _pic5.scale.x=GAME.imageScale;
        _pic5.anchor.x = 0.5;
        _pic5.anchor.y = 0.5;
        _pic5.position.x=GAME.stageWidth/2;
        _pic5.position.y=GAME.stageHeight/2;
        _stage2Container.addChild(_pic5);
        _pic5.scale.x=_pic5.scale.y=0;
        TweenMax.to(_pic5.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:0.8});

        _btn2 = PIXI.Sprite.fromFrame("btn2.jpg");
        //_btn2.scale.y = _btn2.scale.x=GAME.imageScale;
        _btn2.anchor.x = 0.5;
        _btn2.anchor.y = 0.5;
        _btn2.position.x=GAME.stageWidth/2;
        _btn2.position.y=_pic5.position.y+240;
        _stage2Container.addChild(_btn2);
        _btn2.scale.x=_btn2.scale.y=0;
        TweenMax.to(_btn2.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:0.9});

        _btn2.interactive = true;
        _btn2.mousedown = _btn2.touchstart = function ()
        {
            _this.sceneOut()
        }
    }



    this.sceneOut = function ()
    {
        GAME.Scene.prototype.sceneOut.apply(this);
        TweenMax.to(this, 0.4, {alpha:0,
            onComplete:function(){_this.sceneOutComplete()}
        });
    }







};
GAME.Utils.inherit(GAME.GameScene1, GAME.Scene);

GAME.GameScene2 = function ()
{
    GAME.Scene.call(this);
    var _this = this;
    var _isSceneIn = false;
    var _stage1Container,_stage2Container;
    var _pic6,_pic7,_pic8,_pic9,_pic10,_pic11;


    this.init = function ()
    {


    }


    this.sceneIn = function ()
    {
        GAME.Scene.prototype.sceneIn.apply(this);

        initStage1();

        _isSceneIn = true;
    }
    this.update = function ()
    {
        if (!_isSceneIn)return;

        updateParticle();
    }


    function initStage1()
    {
        _stage1Container = new PIXI.Container();
        _stage1Container.x = GAME.stageWidth/2;
        _stage1Container.y = GAME.stageHeight/2;
        _this.addChild(_stage1Container);

        _pic6 = PIXI.Sprite.fromFrame("pic6.jpg");
        //_pic6.scale.y = _pic6.scale.x=GAME.imageScale;
        _pic6.anchor.x = 0.5;
        _stage1Container.addChild(_pic6);
        _pic6.alpha=0;
        TweenMax.to(_pic6, 1, { alpha: 1,ease:Strong.easeOut,delay:0.6});
        TweenMax.to(_pic6, 1, { y: -300,ease:Elastic.easeOut,delay:0.6});

        _pic7 = PIXI.Sprite.fromFrame("pic7.png");
        //_pic7.scale.y = _pic7.scale.x=GAME.imageScale;
        _pic7.anchor.x = 0.5;
        _pic7.anchor.y = 0.5;
        _stage1Container.addChild(_pic7);

        _pic7.scale.x=_pic7.scale.y=0;
        TweenMax.to(_pic7.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:0.8});

        _pic8 = PIXI.Sprite.fromFrame("pic8.png");
        _pic8.anchor.x = 0.5;
        _pic8.anchor.y = 0.5;
        _stage1Container.addChild(_pic8);
        _pic8.x=-134;
        _pic8.y=-58;
        _pic8.scale.x=_pic8.scale.y=0;
        TweenMax.to(_pic8.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:0.9});


        _pic9 = PIXI.Sprite.fromFrame("pic9.png");
        _pic9.anchor.x = 0.5;
        _pic9.anchor.y = 0.5;
        _stage1Container.addChild(_pic9);
        _pic9.x=-54;
        _pic9.y=-128;
        _pic9.scale.x=_pic9.scale.y=0;
        TweenMax.to(_pic9.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:1});

        _pic10 = PIXI.Sprite.fromFrame("pic10.png");
        _pic10.anchor.x = 0.5;
        _pic10.anchor.y = 0.5;
        _stage1Container.addChild(_pic10);
        _pic10.x=61;
        _pic10.y=-128;
        _pic10.scale.x=_pic10.scale.y=0;
        TweenMax.to(_pic10.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:1.1});


        _pic11 = PIXI.Sprite.fromFrame("pic11.png");
        _pic11.anchor.x = 0.5;
        _pic11.anchor.y = 0.5;
        _stage1Container.addChild(_pic11);
        _pic11.x=134;
        _pic11.y=-58;
        _pic11.scale.x=_pic11.scale.y=0;
        TweenMax.to(_pic11.scale, 1, { x:1, y:1,ease:Elastic.easeOut,delay:1.2});


        initParticle();

        for (var i = 0; i < 4; i++)
        {
            var touchPoint = new PIXI.Sprite(PIXI.Texture.fromFrame("pic7.png"));

            touchPoint.interactive = true;
            touchPoint.buttonMode = true;
            touchPoint.anchor.set(0.5);
            //touchPoint.scale.set(GAME.imageScale);

            touchPoint
                // events for drag start
                .on('mousedown', onDragStart)
                .on('touchstart', onDragStart)
                // events for drag end
                .on('mouseup', onDragEnd)
                .on('mouseupoutside', onDragEnd)
                .on('touchend', onDragEnd)
                .on('touchendoutside', onDragEnd)
                // events for drag move
                .on('mousemove', onDragMove)
                .on('touchmove', onDragMove);

            // move the sprite to its designated position
            touchPoint.x = Math.floor(Math.random() * 200);
            touchPoint.y = Math.floor(Math.random() * 200);
            // add it to the stage
            _this.addChild(touchPoint);

            addParticle(touchPoint);
        }        
    }

    var ps=[],pc;
    function initParticle()
    {
        pc = new PIXI.ParticleContainer(10000, {
                        scale: true,
                        position: true,
                        //rotation: true,
                        //uvs: true,
                        alpha: true
                    });                                        
        _this.addChild(pc);
    }
    function addParticle(parentObject)
    {
        for (var i = 0; i < 100; ++i)
        {
            var p = new PIXI.Sprite.fromFrame("star.png");
            p.anchor.set(0.5);
            p.scale.set((Math.random()+1));
            p.x = parentObject.x;
            p.y = parentObject.y;
            p.parentObject=parentObject;
            p.Xspeed=Math.random() *2-1;
            p.Yspeed=Math.random() *2-1;
            p.Aspeed=0.01+Math.random()*0.1;

            ps.push(p);
            pc.addChild(p);
        }
    }
    function updateParticle()
    {
        for (var i = 0; i < ps.length; i++)
        {
            var p = ps[i];
            p.alpha -= p.Aspeed;
            p.x+=p.Xspeed;
            p.y+=p.Yspeed;

            if(p.alpha<=0) {
                p.x = p.parentObject.x;
                p.y = p.parentObject.y;
                p.alpha=1;
            }
        }
    }


    function onDragStart(event)
    {
        this.data = event.data;
        this.alpha = 0.99;
        this.dragging = true;

        this.id = this.data.identifier;
    }

    function onDragEnd(event)
    {
        if (event.data.identifier == this.id)
        {
            this.alpha = 1;
            this.dragging = false;
            this.data = null;
            this.id=null;
        }
    }

    function onDragMove(event)
    {
        if (event.data.identifier == this.id)
        {
            if (this.dragging)
            {
                var newPosition = this.data.getLocalPosition(this.parent);
                this.x = newPosition.x;
                this.y = newPosition.y;
            }
        }
    }



    this.sceneOut = function ()
    {

    }


};
GAME.Utils.inherit(GAME.GameScene2, GAME.Scene);

var view,
    stage,
    renderer,
    gameScene,
    assetsManager,
    logo,
    stats;

var winWidth,
    winHeight;

$(function(){
    // document.addEventListener('touchmove', function(event){event.preventDefault();}, false);

    $(window).resize(resizeCanvas);
    resizeCanvas();

    init();
    initStatsBar();
});

function resizeCanvas()
{
    winWidth=$(window).get(0).innerWidth||document.documentElement.clientWidth||document.body.clientWidth;
    winHeight=$(window).get(0).innerHeight||document.documentElement.clientHeight||document.body.clientHeight;

    //此处可以解决 进入h5在横屏不加载的问题。
    if(winHeight>winWidth && !view)
    {
        //init();
        $("html,body").scrollLeft(0);
    }
}


function initStatsBar()
{
    stats = new Stats();
    document.body.appendChild(stats.domElement);
}


function init() {
    //var dpr = window.devicePixelRatio || 1;
    /*
     * 缩放适配方案
     * 1、宽高比例不变
     * 2、canvas width=640，高度等比例设置（winWidth/winHeight=640/x)
     * 3、canvas css(width=winWidth,height=winHeight)
     * */

    var stageWidth=640;//设计图的宽度

    GAME.stageWidth=stageWidth;
    GAME.stageHeight=(stageWidth*winHeight)/winWidth;

    view=document.getElementById('pixi_view');
    view.style.width=winWidth+'px';
    view.style.height=winHeight+'px';

    renderer = new PIXI.Application({
        width:GAME.stageWidth,
        height:GAME.stageHeight,
        view:view,
        // backgroundColor:0x1099bb,
        transparent: true, //透明背景
    });
    stage = new PIXI.Container();
    renderer.stage.addChild(stage);

    GAME.renderer = renderer;
    GAME.canvas = view;
    GAME.stage = stage;

    assetsManager=new GAME.AssetsManager();
    assetsManager.onComplete=function()
    {
        TweenMax.to(document.getElementById("loading"),1,{css:{alpha:0}});
        TweenMax.delayedCall(1,function()
        {
            $("#loading").hide();
        });
        initScene();
    };
    assetsManager.start();

    animate();
}

function initScene() {
    var _logo = PIXI.Sprite.fromFrame("logo2.png");
    // _logo.scale.y = _logo.scale.x = GAME.imageScale;
    stage.addChild(_logo);

    initScene1();

    PIXI.sound.play('bg', {
        "loop": true
    });
}

function initScene1() {
    PIXI.sound.play("s1");

    gameScene = new GAME.GameScene1();
    stage.addChild(gameScene);
    gameScene.init();
    gameScene.sceneIn();

    gameScene.addEventListener("SCENE_OUT_COMPLETE", function(e) {
        stage.removeChild(gameScene);
        gameScene = null;
        initScene2();
    });
}

function initScene2() {
    PIXI.sound.play("s3");

    gameScene = new GAME.GameScene2();
    stage.addChild(gameScene);
    gameScene.init();
    gameScene.sceneIn();

    gameScene.addEventListener("SCENE_OUT_COMPLETE", function(e) {
        stage.removeChild(gameScene);
        gameScene = null;
        //initScene3();
    });
}

function animate() {
    requestAnimationFrame(animate);

    GAME.renderer.render(GAME.stage);

    if (stats) stats.update();

    if (gameScene) gameScene.update();
};