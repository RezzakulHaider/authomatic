// Generated by CoffeeScript 1.6.2
(function() {
  var $, Authomatic, BaseProvider, Flickr, Foursquare, Google, LinkedIn, Oauth1Provider, Oauth2Provider, WindowsLive, addJsonpCallback, deserializeCredentials, format, getProviderClass, globalOptions, jsonPCallbackCounter, log, parseQueryString, parseUrl, _ref, _ref1, _ref2, _ref3, _ref4, _ref5,
    __slice = [].slice,
    _this = this,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = jQuery;

  jsonPCallbackCounter = 0;

  globalOptions = {
    logging: true,
    popupWidth: 800,
    pupupHeight: 600,
    backend: null,
    forceBackend: false,
    substitute: {},
    params: {},
    headers: {},
    body: '',
    jsonpCallbackPrefix: 'authomaticJsonpCallback',
    beforeBackend: null,
    backendComplete: null,
    success: null,
    complete: null
  };

  log = function() {
    var args;

    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (globalOptions.logging) {
      return typeof console !== "undefined" && console !== null ? console.log.apply(console, ['Authomatic:'].concat(__slice.call(args))) : void 0;
    }
  };

  parseQueryString = function(queryString) {
    var item, k, result, v, _i, _len, _ref, _ref1;

    result = {};
    _ref = queryString.split('&');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      _ref1 = item.split('='), k = _ref1[0], v = _ref1[1];
      v = decodeURIComponent(v);
      if (result.hasOwnProperty(k)) {
        if (Array.isArray(result[k])) {
          result[k].push(v);
        } else {
          result[k] = [result[k], v];
        }
      } else {
        result[k] = v;
      }
    }
    return result;
  };

  parseUrl = function(url) {
    var qs, questionmarkIndex, u;

    log('parseUrl', url);
    questionmarkIndex = url.indexOf('?');
    if (questionmarkIndex >= 0) {
      u = url.substring(0, questionmarkIndex);
      qs = url.substring(questionmarkIndex + 1);
    } else {
      u = url;
    }
    return {
      url: u,
      query: qs,
      params: qs ? parseQueryString(qs) : void 0
    };
  };

  deserializeCredentials = function(credentials) {
    var sc, subtype, type, typeId, _ref;

    sc = decodeURIComponent(credentials).split('\n');
    typeId = sc[1];
    _ref = typeId.split('-'), type = _ref[0], subtype = _ref[1];
    return {
      id: parseInt(sc[0]),
      typeId: typeId,
      type: parseInt(type),
      subtype: parseInt(subtype),
      rest: sc.slice(2)
    };
  };

  getProviderClass = function(credentials) {
    var subtype, type, _ref;

    _ref = deserializeCredentials(credentials), type = _ref.type, subtype = _ref.subtype;
    if (type === 1) {
      if (subtype === 2) {
        return Flickr;
      } else {
        return Oauth1Provider;
      }
    } else if (type === 2) {
      if (subtype === 6) {
        Foursquare;
      }
      if (subtype === 8) {
        return Google;
      } else if (subtype === 9) {
        return LinkedIn;
      } else if (subtype === 14) {
        return WindowsLive;
      } else if (subtype === 12 || subtype === 15) {
        return BaseProvider;
      } else {
        return Oauth2Provider;
      }
    } else {
      return BaseProvider;
    }
  };

  format = function(template, substitute) {
    return template.replace(/{([^}]*)}/g, function(match, tag) {
      var level, target, _i, _len, _ref;

      target = substitute;
      _ref = tag.split('.');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        level = _ref[_i];
        target = target[level];
      }
      return target;
    });
  };

  addJsonpCallback = function(localSuccessCallback) {
    var name, path;

    Authomatic.jsonPCallbackCounter += 1;
    name = "" + globalOptions.jsonpCallbackPrefix + Authomatic.jsonPCallbackCounter;
    path = "window." + name;
    window[name] = function(data) {
      log('Calling jsonp callback:', path);
      globalOptions.success(data);
      if (typeof localSuccessCallback === "function") {
        localSuccessCallback(data);
      }
      log('Deleting jsonp callback:', path);
      return delete _this[name];
    };
    log("Adding " + path + " jsonp callback");
    return name;
  };

  window.authomatic = new (Authomatic = (function() {
    function Authomatic() {}

    Authomatic.jsonPCallbackCounter = 0;

    Authomatic.prototype.setup = function(options) {
      $.extend(globalOptions, options);
      return log('Setting up authomatic to:', globalOptions);
    };

    Authomatic.prototype._openWindow = function(url, width, height) {
      var left, settings, top;

      top = (screen.height / 2) - (height / 2);
      left = (screen.width / 2) - (width / 2);
      settings = "width=" + width + ",height=" + height + ",top=" + top + ",left=" + left;
      return window.open(url, "authomatic:" + url, settings);
    };

    Authomatic.prototype.popup = function(width, height, validator, aSelector, formSelector) {
      var _this = this;

      if (width == null) {
        width = 800;
      }
      if (height == null) {
        height = 600;
      }
      if (validator == null) {
        validator = (function($form) {
          return true;
        });
      }
      if (aSelector == null) {
        aSelector = 'a.authomatic';
      }
      if (formSelector == null) {
        formSelector = 'form.authomatic';
      }
      $(aSelector).click(function(e) {
        e.preventDefault();
        return _this._openWindow(e.target.href, width, height);
      });
      return $(formSelector).submit(function(e) {
        var $form, url;

        e.preventDefault();
        $form = $(e.target);
        url = $form.attr('action') + '?' + $form.serialize();
        if (validator($form)) {
          return _this._openWindow(url, width, height);
        }
      });
    };

    Authomatic.prototype.access = function(credentials, url, options) {
      var Provider, localEvents, provider, updatedOptions;

      if (options == null) {
        options = {};
      }
      localEvents = {
        beforeBackend: null,
        backendComplete: null,
        success: null,
        complete: null
      };
      updatedOptions = {};
      $.extend(updatedOptions, globalOptions, localEvents, options);
      url = format(url, updatedOptions.substitute);
      log('access options', updatedOptions, globalOptions);
      if (updatedOptions.forceBackend) {
        Provider = BaseProvider;
      } else {
        Provider = getProviderClass(credentials);
      }
      provider = new Provider(options.backend, credentials, url, updatedOptions);
      log('Instantiating provider:', provider);
      return provider.access();
    };

    return Authomatic;

  })());

  BaseProvider = (function() {
    BaseProvider.prototype._x_jsonpCallbackParamName = 'callback';

    function BaseProvider(backend, credentials, url, options) {
      var parsedUrl;

      this.backend = backend;
      this.credentials = credentials;
      this.options = options;
      this.access = __bind(this.access, this);
      this.contactProvider = __bind(this.contactProvider, this);
      this.contactBackend = __bind(this.contactBackend, this);
      this.backendRequestType = 'auto';
      this.jsonpRequest = false;
      this.jsonpCallbackName = "" + globalOptions.jsonpCallbackPrefix + jsonPCallbackCounter;
      this.deserializedCredentials = deserializeCredentials(this.credentials);
      this.providerID = this.deserializedCredentials.id;
      this.providerType = this.deserializedCredentials.type;
      this.credentialsRest = this.deserializedCredentials.rest;
      parsedUrl = parseUrl(url);
      this.url = parsedUrl.url;
      this.params = {};
      $.extend(this.params, parsedUrl.params, this.options.params);
    }

    BaseProvider.prototype.contactBackend = function(callback) {
      var data, _base;

      if (this.jsonpRequest && this.options.method === !'GET') {
        this.backendRequestType = 'fetch';
      }
      data = {
        type: this.backendRequestType,
        credentials: this.credentials,
        url: this.url,
        method: this.options.method,
        body: this.options.body,
        params: JSON.stringify(this.params),
        headers: JSON.stringify(this.options.headers)
      };
      if (typeof globalOptions.beforeBackend === "function") {
        globalOptions.beforeBackend(data);
      }
      if (typeof (_base = this.options).beforeBackend === "function") {
        _base.beforeBackend(data);
      }
      log("Contacting backend at " + this.options.backend + ".", data);
      return $.get(this.options.backend, data, callback);
    };

    BaseProvider.prototype.contactProvider = function(requestElements) {
      var body, headers, jsonpOptions, method, options, params, url,
        _this = this;

      url = requestElements.url, method = requestElements.method, params = requestElements.params, headers = requestElements.headers, body = requestElements.body;
      options = {
        type: method,
        data: params,
        headers: headers,
        beforeSend: function(jqXHR, settings) {
          return log('BEFORE SEND', jqXHR, settings);
        },
        complete: [
          (function(jqXHR, textStatus) {
            return log('Request complete.', textStatus, jqXHR);
          }), globalOptions.complete, this.options.complete
        ],
        success: [
          (function(data) {
            return log('Request successfull.', data);
          }), globalOptions.success, this.options.success
        ],
        error: function(jqXHR, textStatus, errorThrown) {
          if (jqXHR.state() === 'rejected') {
            if (_this.options.method === 'GET') {
              log('Cross domain request failed! trying JSONP request.');
              _this.jsonpRequest = true;
            } else {
              _this.backendRequestType = 'fetch';
            }
            return _this.access();
          }
        }
      };
      if (this.jsonpRequest) {
        jsonpOptions = {
          jsonpCallback: this.jsonpCallbackName,
          jsonp: this._x_jsonpCallbackParamName,
          cache: true,
          dataType: 'jsonp',
          error: function(jqXHR, textStatus, errorThrown) {
            return log('JSONP failed! State:', jqXHR.state());
          }
        };
        $.extend(options, jsonpOptions);
        log("Contacting provider with JSONP request.", url, options);
      } else {
        log("Contacting provider with cross domain request", url, options);
      }
      return $.ajax(url, options);
    };

    BaseProvider.prototype.access = function() {
      var callback,
        _this = this;

      log('ACCESSS');
      callback = function(data, textStatus, jqXHR) {
        var responseTo, _base, _base1, _base2;

        if (typeof globalOptions.backendComplete === "function") {
          globalOptions.backendComplete(data, textStatus, jqXHR);
        }
        if (typeof (_base = _this.options).backendComplete === "function") {
          _base.backendComplete(data, textStatus, jqXHR);
        }
        responseTo = jqXHR != null ? jqXHR.getResponseHeader('Authomatic-Response-To') : void 0;
        if (responseTo === 'fetch') {
          log("Fetch data returned from backend.", jqXHR.getResponseHeader('content-type'), data);
          if (typeof globalOptions.success === "function") {
            globalOptions.success(data);
          }
          if (typeof (_base1 = _this.options).success === "function") {
            _base1.success(data);
          }
          if (typeof globalOptions.complete === "function") {
            globalOptions.complete(jqXHR, textStatus);
          }
          return typeof (_base2 = _this.options).complete === "function" ? _base2.complete(jqXHR, textStatus) : void 0;
        } else if (responseTo === 'elements') {
          log("Request elements data returned from backend.", data);
          return _this.contactProvider(data);
        }
      };
      if (this.jsonpRequest) {
        jsonPCallbackCounter += 1;
      }
      return this.contactBackend(callback);
    };

    return BaseProvider;

  })();

  Oauth1Provider = (function(_super) {
    __extends(Oauth1Provider, _super);

    function Oauth1Provider() {
      this.contactProvider = __bind(this.contactProvider, this);      _ref = Oauth1Provider.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Oauth1Provider.prototype.access = function() {
      this.jsonpRequest = true;
      this.params[this._x_jsonpCallbackParamName] = this.jsonpCallbackName;
      return Oauth1Provider.__super__.access.call(this);
    };

    Oauth1Provider.prototype.contactProvider = function(requestElements) {
      delete requestElements.params.callback;
      return Oauth1Provider.__super__.contactProvider.call(this, requestElements);
    };

    return Oauth1Provider;

  })(BaseProvider);

  Flickr = (function(_super) {
    __extends(Flickr, _super);

    function Flickr() {
      _ref1 = Flickr.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Flickr.prototype._x_jsonpCallbackParamName = 'jsoncallback';

    return Flickr;

  })(Oauth1Provider);

  Oauth2Provider = (function(_super) {
    __extends(Oauth2Provider, _super);

    Oauth2Provider.prototype._x_accessToken = 'access_token';

    Oauth2Provider.prototype._x_bearer = 'Bearer';

    function Oauth2Provider() {
      var args, _ref2;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.access = __bind(this.access, this);
      this.handleTokenType = __bind(this.handleTokenType, this);
      Oauth2Provider.__super__.constructor.apply(this, args);
      _ref2 = this.credentialsRest, this.accessToken = _ref2[0], this.refreshToken = _ref2[1], this.expirationTime = _ref2[2], this.tokenType = _ref2[3];
      this.handleTokenType();
    }

    Oauth2Provider.prototype.handleTokenType = function() {
      if (this.tokenType === '1') {
        return this.options.headers['Authorization'] = "" + this._x_bearer + " " + this.accessToken;
      } else {
        return this.params[this._x_accessToken] = this.accessToken;
      }
    };

    Oauth2Provider.prototype.access = function() {
      var requestElements;

      if (this.backendRequestType === 'fetch') {
        return Oauth2Provider.__super__.access.call(this);
      } else {
        requestElements = {
          url: this.url,
          method: this.options.method,
          params: this.params,
          headers: this.options.headers,
          body: this.options.body
        };
        return this.contactProvider(requestElements);
      }
    };

    return Oauth2Provider;

  })(BaseProvider);

  Foursquare = (function(_super) {
    __extends(Foursquare, _super);

    function Foursquare() {
      _ref2 = Foursquare.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Foursquare.prototype._x_accessToken = 'oauth_token';

    return Foursquare;

  })(Oauth2Provider);

  Google = (function(_super) {
    __extends(Google, _super);

    function Google() {
      _ref3 = Google.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Google.prototype._x_bearer = 'OAuth';

    return Google;

  })(Oauth2Provider);

  LinkedIn = (function(_super) {
    __extends(LinkedIn, _super);

    function LinkedIn() {
      _ref4 = LinkedIn.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    LinkedIn.prototype._x_accessToken = 'oauth2_access_token';

    return LinkedIn;

  })(Oauth2Provider);

  WindowsLive = (function(_super) {
    __extends(WindowsLive, _super);

    function WindowsLive() {
      this.handleTokenType = __bind(this.handleTokenType, this);      _ref5 = WindowsLive.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    WindowsLive.prototype.handleTokenType = function() {
      if (this.tokenType === '1') {
        this.options.headers['Authorization'] = "" + this._x_bearer + " " + this.accessToken;
      }
      return this.params[this._x_accessToken] = this.accessToken;
    };

    return WindowsLive;

  })(Oauth2Provider);

  window.pokus = function() {
    var beCredentials, beURL, fbCredentials, fbUrl, liCredentials, liURL, twCredentials, twGetOptions, twGetUrl, twPostOptions, twPostUrl;

    twCredentials = '5%0A1-5%0A1186245026-TI2YCrKLCsdXH7PeFE8zZPReKDSQ5BZxHzpjjel%0A1Xhim7w8N9rOs05WWC8rnwIzkSz1lCMMW9TSPLVtfk';
    twPostUrl = 'https://api.twitter.com/1.1/statuses/update.json';
    twPostOptions = {
      method: 'POST',
      params: {
        status: 'keket'
      },
      success: function(data, status, jqXHR) {
        return log('hura, podarilo sa:', data);
      }
    };
    twGetUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
    twGetOptions = {
      method: 'GET',
      params: {
        pokus: 'POKUS'
      },
      success: function(data, status, jqXHR) {
        return log('hura, podarilo sa:', data);
      }
    };
    fbUrl = 'https://graph.facebook.com/737583375/feed';
    fbCredentials = '15%0A2-5%0ABAAG3FAWiCwIBAJn0CKLOphV4meEbBvUcGcAXIN0z1Pv2JtCrziXlKvM99WX3p4YxI9oHC02ZCpsv7d3CZCsTMy9lqZAohaypwb3nGSKAscqngzFVTOULGLRd5ygXQYtqcka1iERfZAfZA8KQjx7Mps0izinhKyV0EGCJo1HhQcOjx1QYiCAEp%0A%0A1370766038%0A0';
    beCredentials = '11%0A2-1%0AN.W7MpNX5nTCgfwG3HLJTlc2KIZP5VMp%0A%0A0%0A0';
    beURL = 'http://behance.net/v2/collections/6870767/follow';
    liCredentials = '19%0A2-9%0AAQVK822aqXqSUjScKzJJ-4ErqXT1OHvmEjcaX2OUNRtXdjFAsWbOUjnqzQYeiyztWjCenEXV3aNvTOVgrrpm0eoXxIUHbcr8qhsT5o9LCo5Molecguf6YPc9UHYWMOO_1kZ_eLO0M805f5GMYs4zGw8GyyCw6ATNRk6TlLECAt-od8Tu-S4%0A%0A0%0A0';
    liURL = 'https://api.linkedin.com/v1/people/~/shares';
    return authomatic.setup({
      backend: 'http://authomatic.com:8080/login/'
    });
  };

  window.cb = function(data) {
    return console.log('CALLBACK', data);
  };

}).call(this);

/*
//@ sourceMappingURL=authomatic.map
*/
