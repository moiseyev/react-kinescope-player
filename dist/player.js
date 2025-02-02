var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

/* global Map:readonly, Set:readonly, ArrayBuffer:readonly */
var hasElementType = typeof Element !== 'undefined';
var hasMap = typeof Map === 'function';
var hasSet = typeof Set === 'function';
var hasArrayBuffer = typeof ArrayBuffer === 'function' && !!ArrayBuffer.isView;

// Note: We **don't** need `envHasBigInt64Array` in fde es6/index.js

function equal(a, b) {
  // START: fast-deep-equal es6/index.js 3.1.1
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }

    // START: Modifications:
    // 1. Extra `has<Type> &&` helpers in initial condition allow es6 code
    //    to co-exist with es5.
    // 2. Replace `for of` with es5 compliant iteration using `for`.
    //    Basically, take:
    //
    //    ```js
    //    for (i of a.entries())
    //      if (!b.has(i[0])) return false;
    //    ```
    //
    //    ... and convert to:
    //
    //    ```js
    //    it = a.entries();
    //    while (!(i = it.next()).done)
    //      if (!b.has(i.value[0])) return false;
    //    ```
    //
    //    **Note**: `i` access switches to `i.value`.
    var it;
    if (hasMap && (a instanceof Map) && (b instanceof Map)) {
      if (a.size !== b.size) return false;
      it = a.entries();
      while (!(i = it.next()).done)
        if (!b.has(i.value[0])) return false;
      it = a.entries();
      while (!(i = it.next()).done)
        if (!equal(i.value[1], b.get(i.value[0]))) return false;
      return true;
    }

    if (hasSet && (a instanceof Set) && (b instanceof Set)) {
      if (a.size !== b.size) return false;
      it = a.entries();
      while (!(i = it.next()).done)
        if (!b.has(i.value[0])) return false;
      return true;
    }
    // END: Modifications

    if (hasArrayBuffer && ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (a[i] !== b[i]) return false;
      return true;
    }

    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0;)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    // END: fast-deep-equal

    // START: react-fast-compare
    // custom handling for DOM elements
    if (hasElementType && a instanceof Element) return false;

    // custom handling for React/Preact
    for (i = length; i-- !== 0;) {
      if ((keys[i] === '_owner' || keys[i] === '__v' || keys[i] === '__o') && a.$$typeof) {
        // React-specific: avoid traversing React elements' _owner
        // Preact-specific: avoid traversing Preact elements' __v and __o
        //    __v = $_original / $_vnode
        //    __o = $_owner
        // These properties contain circular references and are not needed when
        // comparing the actual elements (and not their owners)
        // .$$typeof and ._store on just reasonable markers of elements

        continue;
      }

      // all other properties should be traversed as usual
      if (!equal(a[keys[i]], b[keys[i]])) return false;
    }
    // END: react-fast-compare

    // START: fast-deep-equal
    return true;
  }

  return a !== a && b !== b;
}
// end fast-deep-equal

var reactFastCompare = function isEqual(a, b) {
  try {
    return equal(a, b);
  } catch (error) {
    if (((error.message || '').match(/stack|recursion/i))) {
      // warn on circular references, don't crash
      // browsers give this different errors name and messages:
      // chrome/safari: "RangeError", "Maximum call stack size exceeded"
      // firefox: "InternalError", too much recursion"
      // edge: "Error", "Out of stack space"
      console.warn('react-fast-compare cannot handle circular refs');
      return false;
    }
    // some other error. we should definitely know about these
    throw error;
  }
};

var VIDEO_HOST = 'https://kinescope.io/embed/';
var PLAYER_LATEST = 'https://player.kinescope.io/latest/iframe.player.js';

var NODE_JS_ID = '__kinescope_player_react_js';

var Loader = /*#__PURE__*/function (_Component) {
  _inheritsLoose(Loader, _Component);

  function Loader(props) {
    var _this;

    _this = _Component.call(this, props) || this;

    _this.loadJsNotLoad = function () {
      var el = document.getElementById(NODE_JS_ID);

      if (el) {
        el.addEventListener('load', _this.loadJs);
      }
    };

    _this.loadJs = function () {
      var el = document.getElementById(NODE_JS_ID);

      if (el) {
        el.removeEventListener('load', _this.loadJs);
      }

      _this.handleJSLoad();
    };

    _this.jsLoading = function () {
      if (_this.testLoadJS()) {
        var _window, _window$Kinescope;

        if (!!((_window = window) != null && (_window$Kinescope = _window.Kinescope) != null && _window$Kinescope.IframePlayer)) {
          _this.handleJSLoad();
        } else {
          _this.loadJsNotLoad();
        }

        return;
      }

      var el = document.createElement('script');
      el.id = NODE_JS_ID;
      el.async = false;
      document.body.appendChild(el);
      el.onload = _this.handleJSLoad;
      el.onerror = _this.handleJSLoadError;
      el.src = PLAYER_LATEST;
    };

    _this.testLoadJS = function () {
      return !!document.getElementById(NODE_JS_ID);
    };

    _this.handleJSLoad = function () {
      var onJSLoad = _this.props.onJSLoad;
      onJSLoad && onJSLoad();
    };

    _this.jsLoading();

    return _this;
  }

  var _proto = Loader.prototype;

  _proto.handleJSLoadError = function handleJSLoadError() {
    var onJSLoadError = this.props.onJSLoadError;
    onJSLoadError && onJSLoadError();
  };

  _proto.render = function render() {
    var children = this.props.children;
    return children;
  };

  return Loader;
}(React.Component);

var index = 1;

function getNextIndex() {
  return index++;
}

function getNextPlayerId() {
  return "__kinescope_player_" + getNextIndex();
}

var Player = /*#__PURE__*/function (_Component) {
  _inheritsLoose(Player, _Component);

  function Player(props) {
    var _this;

    _this = _Component.call(this, props) || this;

    _this.handleJSLoad = function () {
      try {
        _this.playerLoad = true;
        var onJSLoad = _this.props.onJSLoad;
        onJSLoad && onJSLoad();
        return Promise.resolve(_this.create()).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    };

    _this.shouldPlayerUpdate = function (prevProps) {
      try {
        var _this$props = _this.props,
            videoId = _this$props.videoId,
            width = _this$props.width,
            height = _this$props.height,
            autoPause = _this$props.autoPause,
            autoPlay = _this$props.autoPlay,
            loop = _this$props.loop,
            muted = _this$props.muted,
            playsInline = _this$props.playsInline,
            language = _this$props.language,
            watermarkText = _this$props.watermarkText,
            watermarkMode = _this$props.watermarkMode;

        var _temp2 = function () {
          if (videoId !== prevProps.videoId || width !== prevProps.width || height !== prevProps.height || autoPause !== prevProps.autoPause || autoPlay !== prevProps.autoPlay || loop !== prevProps.loop || muted !== prevProps.muted || playsInline !== prevProps.playsInline || language !== prevProps.language || watermarkText !== prevProps.watermarkText || watermarkMode !== prevProps.watermarkMode) {
            return Promise.resolve(_this.destroy()).then(function () {
              return Promise.resolve(_this.create()).then(function () {});
            });
          }
        }();

        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    _this.shouldPlaylistUpdate = function (prevProps) {
      try {
        var _this$props2 = _this.props,
            title = _this$props2.title,
            subtitle = _this$props2.subtitle,
            poster = _this$props2.poster,
            chapters = _this$props2.chapters,
            vtt = _this$props2.vtt,
            bookmarks = _this$props2.bookmarks,
            actions = _this$props2.actions;

        var _temp4 = function () {
          if (title !== prevProps.title || subtitle !== prevProps.subtitle || poster !== prevProps.poster || !reactFastCompare(chapters, prevProps.chapters) || !reactFastCompare(vtt, prevProps.vtt) || !reactFastCompare(bookmarks, prevProps.bookmarks) || !reactFastCompare(actions, prevProps.actions)) {
            return Promise.resolve(_this.updatePlaylistOptions()).then(function () {});
          }
        }();

        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    };

    _this.updatePlaylistOptions = function () {
      try {
        var _this$props3 = _this.props,
            title = _this$props3.title,
            subtitle = _this$props3.subtitle,
            poster = _this$props3.poster,
            chapters = _this$props3.chapters,
            vtt = _this$props3.vtt,
            bookmarks = _this$props3.bookmarks,
            actions = _this$props3.actions;
        var options = {
          title: title,
          poster: poster,
          subtitle: subtitle,
          chapters: chapters,
          vtt: vtt,
          bookmarks: bookmarks,
          actions: actions
        };
        return Promise.resolve(_this.setPlaylistItemOptions(options)).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    };

    _this.create = function () {
      try {
        var parentsRef = _this.parentsRef.current;

        if (!_this.playerLoad || !parentsRef) {
          return Promise.resolve();
        }

        parentsRef.textContent = '';
        var playerId = getNextPlayerId();
        var playerDiv = document.createElement('div');
        playerDiv.setAttribute('id', playerId);
        parentsRef.appendChild(playerDiv);
        return Promise.resolve(_this.createPlayer(playerId)).then(function (_this$createPlayer) {
          _this.player = _this$createPlayer;

          _this.getEventList().forEach(function (event) {
            var _this$player;

            (_this$player = _this.player) == null ? void 0 : _this$player.on(event[0], event[1]);
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };

    _this.destroy = function () {
      try {
        if (!_this.player) {
          return Promise.resolve();
        }

        return Promise.resolve(_this.player.destroy()).then(function () {
          _this.player = null;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };

    _this.getEventList = function () {
      var _this$player2;

      var Events = (_this$player2 = _this.player) == null ? void 0 : _this$player2.Events;

      if (!Events) {
        return [];
      }

      return [[Events.Ready, _this.handleEventReady], [Events.QualityChanged, _this.handleQualityChanged], [Events.AutoQualityChanged, _this.handleAutoQualityChanged], [Events.SeekChapter, _this.handleSeekChapter], [Events.SizeChanged, _this.handleSizeChanged], [Events.Play, _this.handlePlay], [Events.Playing, _this.handlePlaying], [Events.Waiting, _this.handleWaiting], [Events.Pause, _this.handlePause], [Events.Ended, _this.handleEnded], [Events.TimeUpdate, _this.handleTimeUpdate], [Events.Progress, _this.handleProgress], [Events.DurationChange, _this.handleDurationChange], [Events.VolumeChange, _this.handleVolumeChange], [Events.PlaybackRateChange, _this.handlePlaybackRateChange], [Events.Seeking, _this.handleSeeking], [Events.FullscreenChange, _this.handleFullscreenChange], [Events.CallAction, _this.handleCallAction], [Events.CallBookmark, _this.handleCallBookmark], [Events.Error, _this.handleError], [Events.Destroy, _this.handleDestroy]];
    };

    _this.getIFrameUrl = function () {
      var videoId = _this.props.videoId;
      return VIDEO_HOST + videoId;
    };

    _this.createPlayer = function (playerId) {
      var _this$props4 = _this.props,
          title = _this$props4.title,
          subtitle = _this$props4.subtitle,
          poster = _this$props4.poster,
          chapters = _this$props4.chapters,
          vtt = _this$props4.vtt,
          externalId = _this$props4.externalId,
          width = _this$props4.width,
          height = _this$props4.height,
          autoPause = _this$props4.autoPause,
          autoPlay = _this$props4.autoPlay,
          loop = _this$props4.loop,
          muted = _this$props4.muted,
          playsInline = _this$props4.playsInline,
          language = _this$props4.language,
          bookmarks = _this$props4.bookmarks,
          actions = _this$props4.actions,
          watermarkText = _this$props4.watermarkText,
          watermarkMode = _this$props4.watermarkMode;
      var options = {
        url: _this.getIFrameUrl(),
        size: {
          width: width,
          height: height
        },
        behaviour: {
          autoPause: autoPause,
          autoPlay: autoPlay,
          loop: loop,
          muted: muted,
          playsInline: playsInline
        },
        playlist: [{
          title: title,
          subtitle: subtitle,
          poster: poster,
          chapters: chapters,
          vtt: vtt,
          bookmarks: bookmarks,
          actions: actions
        }],
        ui: {
          language: language
        },
        settings: {
          externalId: externalId
        }
      };

      if (watermarkText) {
        options.ui['watermark'] = {
          text: watermarkText,
          mode: watermarkMode
        };
      }

      return window.Kinescope.IframePlayer.create(playerId, options);
    };

    _this.setPlaylistItemOptions = function (options) {
      try {
        if (!_this.player) {
          return Promise.resolve();
        }

        return Promise.resolve(_this.player.setPlaylistItemOptions(options)).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    };

    _this.isPaused = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.isPaused();
    };

    _this.isEnded = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.isEnded();
    };

    _this.play = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.play();
    };

    _this.pause = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.pause();
    };

    _this.stop = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.stop();
    };

    _this.getCurrentTime = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.getCurrentTime();
    };

    _this.getDuration = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.getDuration();
    };

    _this.seekTo = function (time) {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.seekTo(time);
    };

    _this.isMuted = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.isMuted();
    };

    _this.mute = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.mute();
    };

    _this.unmute = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.unmute();
    };

    _this.getVolume = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.getVolume();
    };

    _this.setVolume = function (value) {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.setVolume(value);
    };

    _this.getPlaybackRate = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.getPlaybackRate();
    };

    _this.setPlaybackRate = function (value) {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.setPlaybackRate(value);
    };

    _this.getVideoQualityList = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.getVideoQualityList();
    };

    _this.getCurrentVideoQuality = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.getCurrentVideoQuality();
    };

    _this.setVideoQuality = function (quality) {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.setVideoQuality(quality);
    };

    _this.enableTextTrack = function (lang) {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.enableTextTrack(lang);
    };

    _this.disableTextTrack = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.disableTextTrack();
    };

    _this.closeCTA = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.closeCTA();
    };

    _this.isFullscreen = function () {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.isFullscreen();
    };

    _this.setFullscreen = function (fullscreen) {
      if (!_this.player) {
        return Promise.reject(null);
      }

      return _this.player.setFullscreen(fullscreen);
    };

    _this.handleEventReady = function (_ref) {
      var data = _ref.data;
      var onReady = _this.props.onReady;

      _this.updatePlaylistOptions();

      onReady && onReady(data);
    };

    _this.handleQualityChanged = function (_ref2) {
      var data = _ref2.data;
      var onQualityChanged = _this.props.onQualityChanged;
      onQualityChanged && onQualityChanged(data);
    };

    _this.handleAutoQualityChanged = function (_ref3) {
      var data = _ref3.data;
      var onAutoQualityChanged = _this.props.onAutoQualityChanged;
      onAutoQualityChanged && onAutoQualityChanged(data);
    };

    _this.handleSeekChapter = function (_ref4) {
      var data = _ref4.data;
      var onSeekChapter = _this.props.onSeekChapter;
      onSeekChapter && onSeekChapter(data);
    };

    _this.handleSizeChanged = function (_ref5) {
      var data = _ref5.data;
      var onSizeChanged = _this.props.onSizeChanged;
      onSizeChanged && onSizeChanged(data);
    };

    _this.handlePlay = function () {
      var onPlay = _this.props.onPlay;
      onPlay && onPlay();
    };

    _this.handlePlaying = function () {
      var onPlaying = _this.props.onPlaying;
      onPlaying && onPlaying();
    };

    _this.handleWaiting = function () {
      var onWaiting = _this.props.onWaiting;
      onWaiting && onWaiting();
    };

    _this.handlePause = function () {
      var onPause = _this.props.onPause;
      onPause && onPause();
    };

    _this.handleEnded = function () {
      var onEnded = _this.props.onEnded;
      onEnded && onEnded();
    };

    _this.handleTimeUpdate = function (_ref6) {
      var data = _ref6.data;
      var onTimeUpdate = _this.props.onTimeUpdate;
      onTimeUpdate && onTimeUpdate(data);
    };

    _this.handleProgress = function (_ref7) {
      var data = _ref7.data;
      var onProgress = _this.props.onProgress;
      onProgress && onProgress(data);
    };

    _this.handleDurationChange = function (_ref8) {
      var data = _ref8.data;
      var onDurationChange = _this.props.onDurationChange;
      onDurationChange && onDurationChange(data);
    };

    _this.handleVolumeChange = function (_ref9) {
      var data = _ref9.data;
      var onVolumeChange = _this.props.onVolumeChange;
      onVolumeChange && onVolumeChange(data);
    };

    _this.handlePlaybackRateChange = function (_ref10) {
      var data = _ref10.data;
      var onPlaybackRateChange = _this.props.onPlaybackRateChange;
      onPlaybackRateChange && onPlaybackRateChange(data);
    };

    _this.handleSeeking = function () {
      var onSeeking = _this.props.onSeeking;
      onSeeking && onSeeking();
    };

    _this.handleFullscreenChange = function (_ref11) {
      var data = _ref11.data;
      var onFullscreenChange = _this.props.onFullscreenChange;
      onFullscreenChange && onFullscreenChange(data);
    };

    _this.handleCallAction = function (_ref12) {
      var data = _ref12.data;
      var onCallAction = _this.props.onCallAction;
      onCallAction && onCallAction(data);
    };

    _this.handleCallBookmark = function (_ref13) {
      var data = _ref13.data;
      var onCallBookmark = _this.props.onCallBookmark;
      onCallBookmark && onCallBookmark(data);
    };

    _this.handleError = function (_ref14) {
      var data = _ref14.data;
      var onError = _this.props.onError;
      onError && onError(data);
    };

    _this.handleDestroy = function () {
      var onDestroy = _this.props.onDestroy;
      onDestroy && onDestroy();
    };

    _this.playerLoad = false;
    _this.parentsRef = React.createRef();
    _this.player = null;
    return _this;
  }

  var _proto = Player.prototype;

  _proto.componentDidMount = function componentDidMount() {
    if (this.playerLoad) {
      this.create();
    }
  };

  _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
    try {
      var _this3 = this;

      return Promise.resolve(_this3.shouldPlayerUpdate(prevProps)).then(function () {
        return Promise.resolve(_this3.shouldPlaylistUpdate(prevProps)).then(function () {});
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this.destroy();
  };

  _proto.render = function render() {
    var _this$props5 = this.props,
        className = _this$props5.className,
        style = _this$props5.style,
        onJSLoadError = _this$props5.onJSLoadError;
    return React__default['default'].createElement(Loader, {
      onJSLoad: this.handleJSLoad,
      onJSLoadError: onJSLoadError
    }, React__default['default'].createElement("span", {
      ref: this.parentsRef,
      className: className,
      style: style
    }));
  };

  return Player;
}(React.Component);

Player.defaultProps = {
  width: '100%',
  height: '100%',
  autoPause: true,
  playsInline: true
};

module.exports = Player;
