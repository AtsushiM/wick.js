// Generated by CoffeeScript 1.6.3
var AbstractTask, Async, Class, Composite, Composite_bubble, Composite_event, Composite_exeCallback, Composite_preventDefault, Composite_removeChildExe, Composite_stopPropagation, EMPTY, FALSE, LocalStorage, Model, NULL, NULLOBJ, SessionStorage, Storage, Sync, TRUE, WebStorage, bindOnProp, checkPersence, classExtend, classExtendComposite, class_fnTest, class_initializing, copyArray, deleteArrayKey, doc, emit_complete, emit_nexttask, emit_progress, emit_start, errorNotFound, ev, ext, getFile, hasDeclaredArgument, isArray, isDefined, isFunction, isNumber, isObject, isString, jsonParse, jsonStringify, ns, proxy, read, reg_readmethod, required_obj, srcpathNoCache, tag, time, toArray, win, xhrSyncScriptLoad, _is,
  __hasProp = {}.hasOwnProperty;

ns = (function() {
  if (typeof module === 'undefined') {
    return window;
  }
  return module['exports'];
})();

ns['Wick'] = {};

ns = ns['Wick'];

win = window;

doc = document;

required_obj = {};

reg_readmethod = /[=,;:&\n\(\|]\s*read\(.+?,\s*['"](.+?)['"]\)/;

time = '?' + new Date * 1;

ev = 'load';

tag = 'script';

ext = '.js';

TRUE = true;

FALSE = false;

NULL = null;

NULLOBJ = {};

EMPTY = '';

class_initializing = FALSE;

class_fnTest = /0/.test(function() {
  0;
}) ? /\b_super\b/ : /.*/;

Class = function() {};

_is = function(key, vars) {
  if (Object.prototype.toString.call(vars) === '[object ' + key + ']') {
    return TRUE;
  } else {
    return FALSE;
  }
};

isNumber = function(vars) {
  return _is('Number', vars);
};

isString = function(vars) {
  return _is('String', vars);
};

isArray = function(vars) {
  return _is('Array', vars);
};

isFunction = function(vars) {
  return _is('Function', vars);
};

isObject = function(vars) {
  return _is('Object', vars);
};

isDefined = function(vars) {
  if (vars === void 0) {
    return FALSE;
  } else {
    return TRUE;
  }
};

proxy = function(target, func) {
  return function() {
    return func.apply(target, arguments);
  };
};

toArray = function(obj) {
  var ary;
  ary = [];
  ary.push.apply(ary, obj);
  return ary;
};

copyArray = function(ary) {
  if (isArray(ary)) {
    return ary.slice(0);
  } else {
    return ary;
  }
};

deleteArrayKey = function(array, key) {
  array.splice(key, 1);
};

jsonParse = function(text) {
  return JSON['parse'](text);
};

jsonStringify = function(json) {
  return JSON['stringify'](json);
};

bindOnProp = function(that, config) {
  var i, temp, val;
  for (i in config) {
    val = config[i];
    if (temp = i.match(/^on(.+)$/)) {
      that['on'](temp[1], val);
    }
  }
};

hasDeclaredArgument = function(func) {
  return !!(isFunction(func) && func.length);
};

emit_complete = function(that) {
  that['emit']('complete');
};

emit_nexttask = function(that) {
  that['emit']('nexttask');
};

emit_start = function(that) {
  that['emit']('start');
};

emit_progress = function(that) {
  that['emit']('progress');
};

errorNotFound = function(required) {
  throw Error('not found ' + required);
};

srcpathNoCache = function(srcpath) {
  return srcpath + time;
};

checkPersence = function(required) {
  var i, temp;
  required = required.split('.');
  temp = win;
  for (i in required) {
    temp = temp[required[i]];
    if (!temp) {
      break;
    }
  }
  return temp;
};

getFile = function(srcpath, callback) {
  var res, xhr;
  res = '';
  xhr = new XMLHttpRequest;
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        res = '\n' + xhr.responseText;
      } else {
        errorNotFound(srcpath);
      }
      if (callback) {
        callback(res);
      }
    }
  };
  xhr.open('GET', srcpathNoCache(srcpath), !!callback);
  xhr.send();
  return res;
};

xhrSyncScriptLoad = function(srcpath) {
  doc.head.appendChild(doc.createElement(tag)).text = getFile(srcpath);
};

Class['extend'] = function(props) {
  var SuperClass, addMethod, i;
  SuperClass = this;
  Class = function() {
    if (!class_initializing && this['init']) {
      this['init'].apply(this, arguments);
    }
  };
  addMethod = function(key) {
    var isMethodOverride, prop, _super;
    prop = props[key];
    _super = SuperClass.prototype[key];
    isMethodOverride = isFunction(prop) && isFunction(_super) && class_fnTest.test(prop);
    if (isMethodOverride) {
      return Class.prototype[key] = function() {
        var ret, temp;
        temp = this['_super'];
        this['_super'] = _super;
        ret = prop.apply(this, arguments);
        this['_super'] = temp;
        return ret;
      };
    } else {
      Class.prototype[key] = prop;
    }
  };
  class_initializing = TRUE;
  Class.prototype = new SuperClass;
  class_initializing = FALSE;
  Class.prototype['constructor'] = Class;
  for (i in props) {
    if (!__hasProp.call(props, i)) continue;
    addMethod(i);
  }
  Class['extend'] = SuperClass['extend'];
  return Class;
};

classExtend = function(cls, prop, support) {
  var klass;
  cls = cls || Class;
  klass = cls['extend'](prop);
  if (isDefined(support)) {
    klass['support'] = support;
  }
  return klass;
};

classExtendComposite = function(prop, support) {
  return classExtend(Composite, prop, support);
};

Composite_removeChildExe = function(childs, i) {
  delete childs[i]._parentComposite;
  deleteArrayKey(childs, i);
};

Composite_bubble = function() {
  var args, callback, temp;
  args = toArray(arguments || []);
  callback = args[2];
  args = args.slice(0, 2);
  temp = this['only'].apply(this, args);
  if (FALSE !== temp && !(temp || {})._flgStopPropagation) {
    temp = this._parentComposite;
    if (temp) {
      temp['bubble'].apply(temp, args);
    }
  }
  Composite_exeCallback(callback);
};

Composite_exeCallback = function(callback) {
  if (isFunction(callback)) {
    callback.apply(this);
  }
};

Composite_preventDefault = function() {
  this._flgPreventDefault = TRUE;
};

Composite_stopPropagation = function() {
  this._flgStopPropagation = TRUE;
};

Composite_event = function(that, args) {
  var e;
  e = args[0];
  if (isString(e)) {
    e = {
      'type': e,
      'arguments': args,
      _flgPreventDefault: FALSE,
      _flgStopPropagation: FALSE,
      'preventDefault': Composite_preventDefault,
      'stopPropagation': Composite_stopPropagation
    };
  }
  e['before'] = e['target'];
  e['target'] = that;
  return e;
};

Composite = Class['extend']({
  'init': function() {
    this._observed = {};
    return this._childs = [];
  },
  'dispose': function() {
    var i, temp;
    this['removeChild'];
    for (i in this) {
      temp = this[i];
      if (temp && temp['dispose']) {
        temp['dispose'];
      }
    }
    this['__proto__'] = null;
    for (i in this) {
      this[i] = null;
      delete this[i];
    }
  },
  'on': function(key, func) {
    var observed;
    observed = this._observed;
    if (!observed[key]) {
      observed[key] = [];
    }
    observed[key].push(func);
  },
  'one': function(key, func) {
    var wrap,
      _this = this;
    wrap = function() {
      func.apply(_this, arguments);
      _this['off'](key, wrap);
    };
    wrap.original = func;
    this['on'](key, wrap);
  },
  'off': function(key, func) {
    var i, observed, target, val, _i;
    observed = this._observed;
    if (func) {
      target = observed[key];
      if (target) {
        for (i = _i = target.length - 1; _i >= 0; i = _i += -1) {
          val = target[i];
          if (func === val || func === val.original) {
            deleteArrayKey(target, i);
            if (target.length === 0) {
              delete observed[key];
            }
            return TRUE;
          }
        }
      }
      return FALSE;
    }
    return delete observed[key];
  },
  'emit': Composite_bubble,
  'bubble': Composite_bubble,
  'capture': function() {
    var args, callback, childs, val, _i;
    args = toArray(arguments);
    callback = args[2];
    childs = this._childs;
    args = args.slice(0, 2);
    if (FALSE !== this['only'].apply(this, args)) {
      for (_i = childs.length - 1; _i >= 0; _i += -1) {
        val = childs[_i];
        val['capture'].apply(val, args);
      }
    }
    Composite_exeCallback(callback);
  },
  'only': function() {
    var args, e, target, val, _i;
    args = toArray(arguments);
    e = Composite_event(this, args);
    target = this._observed[e['type']] || [];
    args[0] = e;
    for (_i = target.length - 1; _i >= 0; _i += -1) {
      val = target[_i];
      if (val) {
        val = val.apply(this, args);
        if (val === FALSE || e._flgPreventDefault) {
          return val;
        }
      }
    }
    Composite_exeCallback(args[2]);
    return e;
  },
  'addChild': function(instance) {
    if (instance._parentComposite) {
      instance._parentComposite['removeChild'](instance);
    }
    instance._parentComposite = this;
    this._childs.push(instance);
  },
  'removeChild': function(instance) {
    var childs, i, val, _i, _j;
    childs = this._childs;
    if (instance) {
      for (i = _i = childs.length - 1; _i >= 0; i = _i += -1) {
        val = childs[i];
        if (childs[i] === instance) {
          Composite_removeChildExe(childs, i);
          return;
        }
      }
    } else {
      for (i = _j = childs.length - 1; _j >= 0; i = _j += -1) {
        val = childs[i];
        Composite_removeChildExe(childs, i);
      }
    }
  }
});

AbstractTask = classExtendComposite({
  'init': function(config) {
    var queue;
    this['_super']();
    config = config || NULLOBJ;
    queue = copyArray(config['queue'] || []);
    bindOnProp(this, config);
    this['resetQueue'](queue);
    this['done'] = proxy(this, this['done']);
  },
  'start': function() {
    emit_start(this);
    this['paused'] = FALSE;
    this._exeQueue();
  },
  'restart': function(queue) {
    this['resetQueue'](queue);
    this['start']();
  },
  'stop': function() {
    this._queue = NULL;
    this['emit']('stop');
  },
  'pause': function() {
    this['paused'] = TRUE;
    this['emit']('pause');
  },
  'resume': function() {
    if (this['paused']) {
      this['emit']('resume');
      this['paused'] = FALSE;
      this._exeQueue();
    }
  },
  'resetQueue': function(queue) {
    var i, _queue;
    if (queue) {
      this._orgqueue = copyArray(queue);
    }
    _queue = this._queue = copyArray(this._orgqueue);
    for (i in _queue) {
      if (_queue[i]['resetQueue']) {
        _queue[i]['resetQueue']();
      }
    }
    this['emit']('reset');
  },
  _noticeChange: function() {
    this['emit']('change', this['getQueue']());
  },
  'setQueue': function(queue) {
    this._queue = copyArray(queue);
    this._noticeChange();
  },
  'getQueue': function() {
    return copyArray(this._queue);
  },
  'addTask': function(task, priority) {
    if (!isNumber(priority) || priority > this._queue.length) {
      priority = this._queue.length;
    }
    this._queue.splice(priority, 0, task);
    this._noticeChange();
  },
  'removeTask': function(task) {
    var i, val, _i, _len, _ref;
    i = 0;
    _ref = this._queue;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      val = _ref[i];
      if (this._queue[i] === task) {
        deleteArrayKey(this._queue, i);
        this._noticeChange();
        break;
      }
    }
  },
  _exeQueue: function() {
    if (!this['paused']) {
      this['exe']();
    }
  },
  'exe': function() {
    var func, task,
      _this = this;
    task = this._queue.shift();
    if (task) {
      if (task['one'] && task['start']) {
        task['one']('nexttask', this['done']);
        func = proxy(task, task['start']);
      } else if (hasDeclaredArgument(task)) {
        func = proxy(this, task);
      } else {
        func = function(done) {
          task.call(_this);
          done();
        };
      }
      return func(this['done']);
    }
  }
});

Async = classExtend(AbstractTask, {
  'exe': function() {
    if (this._queue) {
      if (!this._queue.length) {
        emit_complete(this);
        return emit_nexttask(this);
      }
      this._processcount = this._queue.length;
      while (!this['paused'] && this._queue && this._queue[0]) {
        this['_super']();
      }
    }
  },
  'done': function() {
    emit_progress(this);
    this._processcount--;
    if (!this._processcount) {
      emit_complete(this);
      emit_nexttask(this);
    }
  }
});

Sync = classExtend(AbstractTask, {
  'exe': function() {
    if (this._queue && !this['paused']) {
      if (this._queue[0]) {
        return this['_super']();
      }
      emit_complete(this);
      emit_nexttask(this);
    }
  },
  'done': function() {
    emit_progress(this);
    this['exe']();
  }
});

read = function(required, srcpath) {
  var cls;
  if (!(cls = checkPersence(required))) {
    if (srcpath && !required_obj[srcpath]) {
      required_obj[srcpath += ext] = true;
      xhrSyncScriptLoad(srcpath);
    } else {
      errorNotFound(required);
    }
  }
  if (!(cls = checkPersence(required))) {
    errorNotFound(required);
  }
  return cls;
};

read['ns'] = function(keywords, swap) {
  var i, len, par, temp;
  keywords = keywords.split('.');
  i = 0;
  len = keywords.length;
  temp = win;
  while (i < len) {
    par = temp;
    if (temp[keywords[i]]) {
      temp = temp[keywords[i]];
    } else {
      temp = temp[keywords[i]] = {};
    }
    i++;
  }
  if (swap) {
    for (i in temp) {
      if (swap[i] === void 0) {
        swap[i] = temp[i];
      }
    }
    temp = par[keywords[len - 1]] = swap;
  }
  return temp;
};

read['run'] = function(path) {
  var checkReadLoop, loadLoop, loaded_paths, require_ary, unitefile;
  path = path + ext;
  require_ary = [];
  loaded_paths = {};
  unitefile = '';
  checkReadLoop = function(jspath) {
    require_ary.unshift(jspath);
    if (!required_obj[jspath]) {
      required_obj[jspath] = 1;
      getFile(jspath, function(filevalue) {
        var result, temp;
        unitefile = filevalue + unitefile;
        if (result = unitefile.match(reg_readmethod)) {
          temp = result[1] + ext;
          unitefile = unitefile.slice(result.index + result[0].length);
          require_ary.unshift(temp);
          return checkReadLoop(temp);
        }
        loadLoop();
      });
    }
  };
  loadLoop = function() {
    var loadaction, script, src;
    if (src = require_ary.shift()) {
      if (!loaded_paths[src]) {
        loaded_paths[src] = 1;
        script = doc.createElement(tag);
        loadaction = function() {
          script.removeEventListener(ev, loadaction);
          loadLoop();
        };
        script.addEventListener(ev, loadaction);
        script.src = srcpathNoCache(src);
        doc.head.appendChild(script);
      } else {
        loadLoop();
      }
    }
  };
  checkReadLoop(path);
};

Storage = classExtendComposite({
  _createStore: function() {
    if (this._array) {
      return [];
    }
    return {};
  },
  'init': function(config) {
    this._array = (config || NULLOBJ)['array'] || FALSE;
    this['reset']();
  },
  'set': function(key, val) {
    var i;
    if (!isObject(key)) {
      i = {};
      i[key] = val;
      key = i;
    }
    for (i in key) {
      this._data[i] = key[i];
    }
  },
  'get': function(key) {
    var data, i, ret;
    ret = this._createStore();
    data = this._data;
    if (key) {
      return data[key];
    }
    for (i in data) {
      ret[i] = data[i];
    }
    return ret;
  },
  'remove': function(key) {
    var that;
    that = this;
    if (isDefined(that._data[key])) {
      if (that._array) {
        deleteArrayKey(that.data, key);
      } else {
        delete that._data[key];
      }
    }
  },
  'reset': function() {
    return this._data = this._createStore();
  }
});

WebStorage = classExtendComposite({
  'init': function(config) {
    config = config || NULLOBJ;
    this._array = config['array'] || FALSE;
    this._n = config['namespace'] ? config['namespace'] + '-' : EMPTY;
    this._storage = win[config['type'] + 'Storage'];
  },
  'set': function(key, val) {
    var i;
    if (!isObject(key)) {
      i = {};
      i[key] = val;
      key = i;
    }
    for (i in key) {
      this._storage.setItem(this._n + i, jsonStringify(key[i]));
    }
  },
  'get': function(key) {
    var i, ret, storage, that;
    that = this;
    ret = this._array ? [] : {};
    storage = that._storage;
    if (key) {
      return jsonParse(storage.getItem(that._n + key));
    }
    for (i in storage) {
      if (!that._n) {
        ret[i] = jsonParse(storage[i]);
      } else {
        key = i.split(that._n)[1];
        if (key) {
          ret[key] = jsonParse(storage[i]);
        }
      }
    }
    return ret;
  },
  'remove': function(key) {
    var that;
    that = this;
    key = that._n + key;
    if (isDefined(that._storage.getItem(key))) {
      that._storage.removeItem(key);
    }
  },
  'reset': function() {
    var i, that;
    that = this;
    if (!that._n) {
      return that._storage.clear();
    }
    for (i in that._storage) {
      that.remove(i);
    }
  }
});

LocalStorage = classExtend(WebStorage, {
  'init': function(config) {
    config = config || {};
    config['type'] = 'local';
    return this['_super'](config);
  }
});

SessionStorage = classExtend(WebStorage, {
  'init': function(config) {
    config = config || {};
    config['type'] = 'session';
    return this['_super'](config);
  }
});

Model = classExtendComposite({
  _notice: function(eventname, key, val) {
    var that;
    that = this;
    that['emit'](eventname, that._store['get']());
    if (key) {
      that['emit'](eventname + ':' + key, val);
    }
  },
  'init': function(config) {
    var defaults, events, i, that;
    that = this;
    config = config || NULLOBJ;
    that['_super']();
    defaults = config['defaults'] || that['defaults'] || NULLOBJ;
    events = config['events'] || that['events'];
    that._validate = config['validate'] || that['validate'] || {};
    that._store = config['store'] || that['store'] || new Storage();
    for (i in defaults) {
      that['set'](i, defaults[i]);
    }
    for (i in events) {
      that['on'](i, events[i]);
    }
  },
  'set': function(key, val) {
    var i, that;
    that = this;
    if (!isObject(key)) {
      i = {};
      i[key] = val;
      key = i;
    }
    that._prev = that._store['get']();
    for (i in key) {
      val = key[i];
      if (that._validate[i] && !that._validate[i](i, val)) {
        return that._notice('fail', i, val);
      }
      that._store['set'](i, val);
      that['emit']('change' + ':' + i, val);
    }
    that['emit']('change', that._store['get']());
  },
  'prev': function(key) {
    if (!key) {
      return this._prev;
    }
    return this._prev[key];
  },
  'get': function(key) {
    return this._store['get'](key);
  },
  'remove': function(key) {
    var get, ret, that;
    that = this;
    if (key) {
      get = that._store['get'](key);
      ret = that._store['remove'](key);
      that._notice('remove', key, get);
      return ret;
    }
  },
  'reset': function() {
    var ret;
    ret = this._store['reset']();
    this._notice('reset');
  }
});

ns['Class'] = Class;

ns['Composite'] = Composite;

ns['Storage'] = Storage;

ns['LocalStorage'] = LocalStorage;

ns['SessionStorage'] = SessionStorage;

ns['Model'] = Model;

ns['Done'] = AbstractTask;

ns['Serial'] = ns['Sync'] = Sync;

ns['Parallel'] = ns['Async'] = Async;

win['read'] = read;
