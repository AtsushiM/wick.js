// main
(function() {
    var $ = read('$', 'http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min'),
        Model = read('Wick.Model'),
        LocalStorage = read('Wick.LocalStorage'),
        ModelAccessLog = Model.extend({
            init: function() {
                this._super({
                    namespace: 'accesslog',
                    store: new LocalStorage
                });

                var prev_count = this.get('count') || 0;

                this.set('count', prev_count + 1);

                console.log(prev_count);
            }
        });

    new ModelAccessLog();
}());
