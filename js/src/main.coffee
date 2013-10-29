ns = do (
) ->
    if typeof module == 'undefined'
        return window
    return module['exports']

ns['Wick'] = {}
ns = ns['Wick']

win = window
doc = document
required_obj = {}
reg_readmethod = /[=,;:&\n\(\|]\s*read\(.+?,\s*['"](.+?)['"]\)/
time = '?' + new Date * 1
ev = 'load'
tag = 'script'
ext = '.js'
TRUE = true
FALSE = false
NULL = null
NULLOBJ = {}
EMPTY = ''
class_initializing = FALSE
class_fnTest = if /0/.test(-> 0; return;) then /\b_super\b/ else /.*/
Class = ->

_is = (key, vars) ->
    if Object.prototype.toString.call(vars) == '[object ' + key + ']' then TRUE else FALSE

isNumber = (vars) ->
    _is 'Number', vars

isString = (vars) ->
    _is 'String', vars

isArray = (vars) ->
    _is 'Array', vars

isFunction = (vars) ->
    _is 'Function', vars

isObject = (vars) ->
    _is 'Object', vars

isDefined = (vars) ->
    if vars == undefined then FALSE else TRUE

proxy = (target, func) ->
    return ->
        return func.apply target, arguments

toArray = (obj) ->
    ary = [];

    ary.push.apply ary, obj

    return ary

copyArray = (ary) ->
    if isArray ary then ary.slice(0) else ary

deleteArrayKey = (array, key) ->
    array.splice key, 1
    return

jsonParse = (text) ->
    return JSON['parse'](text)

jsonStringify = (json) ->
    return JSON['stringify'](json)

bindOnProp = (that, config) ->
    for i, val of config
        if temp = i.match /^on(.+)$/
            that['on'] temp[1], val

    return

hasDeclaredArgument = (func) ->
    return !!(isFunction(func) && func.length);

emit_complete = (that) ->
    that['emit'] 'complete'

    return

emit_nexttask = (that) ->
    that['emit'] 'nexttask'

    return

emit_start = (that) ->
    that['emit'] 'start'

    return

emit_progress = (that) ->
    that['emit'] 'progress'

    return

errorNotFound = (required) ->
    throw Error 'not found ' + required

    return

srcpathNoCache = (srcpath) ->
    return srcpath + time

checkPersence = (required) ->
    required = required.split('.')
    temp = win

    for i of required
        temp = temp[required[i]]

        break unless temp

    return temp

getFile = (srcpath, callback) ->
    res = ''
    xhr = new XMLHttpRequest

    xhr.onreadystatechange = ->
        if xhr.readyState == 4
            if xhr.status == 200
                res = '\n' + xhr.responseText
            else
                errorNotFound srcpath

            callback res if callback
        return

    xhr.open 'GET', srcpathNoCache(srcpath), !!callback

    xhr.send()

    return res

xhrSyncScriptLoad = (srcpath) ->
    doc.head
        .appendChild(doc.createElement tag)
        .text = getFile srcpath

    return

Class['extend'] = (props) ->
    SuperClass = @

    Class = ->
        if !class_initializing && @['init']
            @['init'].apply @, arguments

        return

    addMethod = (key) ->
        prop = props[key]
        _super = SuperClass.prototype[key]
        isMethodOverride = (
            isFunction(prop) &&
            isFunction(_super) &&
            class_fnTest.test(prop)
        )

        if isMethodOverride
            Class.prototype[key] = ->
                temp = @['_super']

                @['_super'] = _super

                ret = prop.apply @, arguments

                @['_super'] = temp

                return ret
        else
            Class.prototype[key] = prop

            return

    class_initializing = TRUE
    Class.prototype = new SuperClass
    class_initializing = FALSE

    Class.prototype['constructor'] = Class

    for own i of props
        addMethod i

    Class['extend'] = SuperClass['extend']

    return Class

classExtend = (cls, prop, support) ->
    cls = cls || Class

    klass = cls['extend'](prop)

    if isDefined support
        klass['support'] = support

    return klass

classExtendComposite = (prop, support) ->
    return classExtend Composite, prop, support

Composite_removeChildExe = (childs, i) ->
    delete childs[i]._parentComposite
    deleteArrayKey childs, i

    return

Composite_bubble = ->
    args = toArray arguments || []
    callback = args[2]

    args = args.slice(0, 2)

    temp = @['only'].apply @, args

    if FALSE != temp && !(temp || {})._flgStopPropagation
        temp = @_parentComposite

        if temp then temp['bubble'].apply temp, args

    Composite_exeCallback callback

    return

Composite_exeCallback = (callback) ->
    if isFunction callback
        callback.apply @
    
    return

Composite_preventDefault = ->
    @._flgPreventDefault = TRUE
    return 

Composite_stopPropagation = ->
    @._flgStopPropagation = TRUE
    return

Composite_event = (that, args) ->
    e = args[0]

    if isString e
        e =
            'type': e
            'arguments': args
            _flgPreventDefault: FALSE
            _flgStopPropagation: FALSE
            'preventDefault': Composite_preventDefault
            'stopPropagation': Composite_stopPropagation

    e['before'] = e['target']
    e['target'] = that

    return e

Composite = Class['extend']
    'init': ->
        @_observed = {}
        @_childs = []

    'dispose': ->
        @['removeChild']

        for i of @
            temp = @[i]

            if temp && temp['dispose']
                temp['dispose']


        @['__proto__'] = null

        for i of @
            @[i] = null
            delete @[i]

        return

    'on': (key, func) ->
        observed = @_observed

        if (!observed[key])
            observed[key] = []

        observed[key].push func

        return

    'one': (key, func) ->
        wrap = =>
            func.apply @, arguments
            @['off'] key, wrap
            return

        wrap.original = func

        @['on'] key, wrap
        return

    'off': (key, func) ->
        observed = @_observed

        if func
            target = observed[key]

            if target
                for val, i in target by -1
                    if func == val || func == val.original
                        deleteArrayKey target, i

                        if target.length == 0
                            delete observed[key]

                        return TRUE

            return FALSE

        return delete observed[key]

    'emit': Composite_bubble
    'bubble': Composite_bubble
    'capture': ->
        args = toArray arguments
        callback = args[2]
        childs = @_childs

        args = args.slice 0, 2

        if FALSE !=  @['only'].apply @, args
            for val in childs by -1
                val['capture'].apply val, args

        Composite_exeCallback callback

        return
    'only': ->
        args = toArray arguments
        e = Composite_event @, args
        target = @_observed[e['type']] || []

        args[0] = e

        for val in target by -1
            if val
                val = val.apply @, args

                if val == FALSE || e._flgPreventDefault
                    return val

        Composite_exeCallback args[2]

        return e

    'addChild': (instance) ->
        if instance._parentComposite
            instance._parentComposite['removeChild'] instance

        instance._parentComposite = @
        @_childs.push instance

        return
    'removeChild': (instance) ->
        childs = @_childs

        if instance
            for val, i in childs by -1
                if childs[i] == instance
                    Composite_removeChildExe childs, i

                    return

        else
            for val, i in childs by -1
                Composite_removeChildExe childs, i

            return

AbstractTask = classExtendComposite
    'init': (config) ->
        @['_super']()

        config = config || NULLOBJ

        queue = copyArray(config['queue'] || [])

        bindOnProp @, config

        @['resetQueue'] queue
        @['done'] = proxy @, @['done']

        return

    'start': ->
        emit_start @
        @['paused'] = FALSE
        @_exeQueue()

        return

    'restart': (queue) ->
        @['resetQueue'] queue
        @['start']()

        return

    'stop': ->
        @_queue = NULL
        @['emit'] 'stop'

        return

    'pause': ->
        @['paused'] = TRUE
        @['emit'] 'pause'

        return

    'resume': ->
        if @['paused']
            @['emit'] 'resume'
            @['paused'] = FALSE
            @_exeQueue()

        return
    'resetQueue': (queue) ->
        if queue
            @_orgqueue = copyArray queue

        _queue = @_queue = copyArray @_orgqueue;

        for i of _queue
            if _queue[i]['resetQueue']
                _queue[i]['resetQueue']();

        @['emit'] 'reset';

        return

    _noticeChange: ->
        @['emit'] 'change', @['getQueue']()

        return
    'setQueue': (queue) ->
        @_queue = copyArray queue
        @_noticeChange()

        return

    'getQueue': ->
        return copyArray @_queue

    'addTask': (task, priority) ->
        if !isNumber(priority) || priority > @_queue.length
            priority = @_queue.length

        @_queue.splice(priority, 0, task)

        @_noticeChange()

        return

    'removeTask': (task) ->
        i = 0

        for val, i in @_queue
            if @._queue[i] == task
                deleteArrayKey @._queue, i
                @_noticeChange()

                break

        return

    _exeQueue: ->
        if !@['paused']
            @['exe']()

        return

    'exe': ->
        task = @_queue.shift()

        if task
            if task['one'] && task['start']
                task['one'] 'nexttask', @['done']
                func = proxy task, task['start']
            else if hasDeclaredArgument task
                func = proxy @, task
            else
                func = (done) =>
                    task.call @
                    done()

                    return

            return func @['done']

        return

Async = classExtend AbstractTask, {
    'exe': ->
        if @_queue
            if !@_queue.length
                emit_complete @

                return emit_nexttask @

            @_processcount = @_queue.length

            while !@['paused'] && @_queue && @_queue[0]
                @['_super']()

        return

    'done': ->
        emit_progress @
        @_processcount--

        if !@_processcount
            emit_complete @
            emit_nexttask @

        return
}

Sync = classExtend AbstractTask, {
    'exe': ->
        if @_queue && !@['paused']
            if @_queue[0]
                return @['_super']()

            emit_complete @
            emit_nexttask @

        return

    'done': ->
        emit_progress @
        @['exe']()

        return
}

read = (required, srcpath) ->
    unless cls = checkPersence required
        if srcpath && !required_obj[srcpath]
            required_obj[srcpath += ext] = true

            xhrSyncScriptLoad srcpath
        else
            errorNotFound required

    unless cls = checkPersence required
        errorNotFound required

    return cls

read['ns'] = (keywords, swap) ->
    keywords = keywords.split '.'
    i = 0
    len = keywords.length
    temp = win

    while i < len
        par = temp

        if temp[keywords[i]]
            temp = temp[keywords[i]]
        else
            temp = temp[keywords[i]] = {}

        i++

    if swap
        for i of temp
            if swap[i] == undefined
                swap[i] = temp[i]

        temp = par[keywords[(len - 1)]] = swap

    return temp

read['run'] = (path) ->
    path = path + ext
    require_ary = []
    loaded_paths = {}
    unitefile = ''

    checkReadLoop = (jspath) ->
        require_ary.unshift jspath

        unless required_obj[jspath]
            required_obj[jspath] = 1

            if !jspath.match /^(\/\/|http)/
                console.log(jspath);
                getFile jspath, (filevalue) ->
                    unitefile = filevalue + unitefile
                    nextRead filevalue

                    return
            else
                console.log(jspath);
                require_ary.unshift jspath

                nextRead filevalue


        return

    nextRead = (filevalue) ->
        if result = unitefile.match reg_readmethod
            temp = result[1] + ext

            unitefile = unitefile.slice result.index + result[0].length

            require_ary.unshift temp

            return checkReadLoop temp

        loadLoop()

    loadLoop = () ->
        if src = require_ary.shift()
            unless loaded_paths[src]
                loaded_paths[src] = 1
                script = doc.createElement tag
                loadaction = () ->
                    script.removeEventListener ev, loadaction
                    loadLoop()

                    return

                script.addEventListener ev, loadaction

                script.src = srcpathNoCache(src)

                doc.head.appendChild script
            else
                loadLoop()

        return

    checkReadLoop path

    return
Storage = classExtendComposite
    _createStore: () ->
        if @._array
            return []

        return {};
    'init': (config) ->
        @._array = (config || NULLOBJ)['array'] || FALSE

        @['reset']()

        return
    'set': (key, val) ->
        if !isObject key
            i = {}
            i[key] = val
            key = i

        for i of key
            @._data[i] = key[i]

        return
    'get': (key) ->
        ret = @._createStore()
        data = @._data

        if key
            return data[key]

        for i of data
            ret[i] = data[i];

        return ret
    'remove': (key) ->
        that = @;

        if isDefined that._data[key]
            if that._array
                deleteArrayKey that.data, key
            else
                delete that._data[key]

        return
    'reset': () ->
        @._data = @._createStore()

WebStorage = classExtendComposite
    'init': (config) ->
        config = config || NULLOBJ
        @._array = config['array'] || FALSE
        @._n = if config['namespace'] then config['namespace'] + '-' else EMPTY
        @._storage = win[config['type'] + 'Storage']

        return
    'set': (key, val) ->
        if !isObject key
            i = {}
            i[key] = val
            key = i

        for i of key
            @._storage.setItem(@._n + i, jsonStringify(key[i]))

        return
    'get': (key) ->
        that = @

        ret = if @._array then [] else {}
        storage = that._storage

        if key
            return jsonParse(storage.getItem(that._n + key))

        for i of storage
            if !that._n
                ret[i] = jsonParse(storage[i])
            else
                key = i.split(that._n)[1]
                if key
                    ret[key] = jsonParse(storage[i])

        return ret
    'remove': (key) ->
        that = @
        key = that._n + key

        if isDefined(that._storage.getItem(key))
            that._storage.removeItem key

        return
    'reset': () ->
        that = @

        if !that._n
            return that._storage.clear()

        for i of that._storage
            that.remove(i)

        return

LocalStorage = classExtend(WebStorage, {
    'init': (config) ->
        config = config || {};

        config['type'] = 'local';
        @['_super'] config
})
SessionStorage = classExtend(WebStorage, {
    'init': (config) ->
        config = config || {};

        config['type'] = 'session';
        @['_super'] config
})

Model = classExtendComposite
    _notice: (eventname, key, val) ->
        that = @

        that['emit'](eventname, that._store['get']())

        if key 
            that['emit'](eventname + ':' + key, val)

        return
    'init': (config) ->
        that = @

        config = config || NULLOBJ

        that['_super']()

        defaults = config['defaults'] || that['defaults'] || NULLOBJ
        events = config['events'] || that['events']

        that._validate = config['validate'] || that['validate'] || {}
        that._store = config['store'] || that['store'] || new Storage()

        for i of defaults
            that['set'] i, defaults[i]

        for i of events
            that['on'] i, events[i]

        return
    'set': (key, val) ->
        that = @

        if !isObject(key)
            i = {}
            i[key] = val
            key = i

        that._prev = that._store['get']()

        for i of key
            val = key[i]

            if that._validate[i] && !that._validate[i](i, val)
                return that._notice 'fail', i, val

            that._store['set'] i, val
            that['emit']('change' + ':' + i, val)

        that['emit']('change', that._store['get']())

        return
    'prev': (key) ->
        if !key
            return this._prev

        return this._prev[key]
    'get': (key) ->
        return this._store['get'](key)
    'remove': (key) ->
        that = @

        if key
            get = that._store['get'] key
            ret = that._store['remove'] key

            that._notice 'remove', key, get

            return ret;

        return
    'reset': () ->
        ret = @_store['reset']()

        @_notice 'reset'

        return

ns['Class'] = Class
ns['Composite'] = Composite
ns['Storage'] = Storage
ns['LocalStorage'] = LocalStorage
ns['SessionStorage'] = SessionStorage
ns['Model'] = Model
ns['Done'] = AbstractTask
ns['Serial'] = ns['Sync'] = Sync
ns['Parallel'] = ns['Async'] = Async

win['read'] = read
