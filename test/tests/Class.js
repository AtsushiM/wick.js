describe('Wick.Classは', function() {
    var klass;

    beforeEach(function() {
        // init
        klass = new Wick.Class();
    });
    afterEach(function() {
        // clear
        if (klass.dispose) {
            klass.dispose();
        }
    });

    it('.extend(prop)でクラスを作成する', function() {
        var initcount = 0,
            method1count = 0,
            Test = Wick.Class.extend({
                init: function(num) {
                    initcount += num;
                },
                method1: function() {
                    method1count++;
                }
            }),
            test = new Test(1);

        expect(initcount).to.be(1);
        test.method1();
        expect(method1count).to.be(1);
        test.method1();
        expect(method1count).to.be(2);
    });

    it('initは省略できる', function() {
        var method1count = 0,
            Test = Wick.Class.extend({
                method1: function() {
                    method1count++;
                }
            }),
            test = new Test(1);

        test.method1();
        expect(method1count).to.be(1);
        test.method1();
        expect(method1count).to.be(2);
    });

    it('extend()で作成したクラスはextend()を持つ', function() {
        var method1count = 0,
            method2count = 0,
            method3count = 0,
            Test1 = Wick.Class.extend({
                method1: function() {
                    method1count += 1;
                },
                method2: function() {
                    method2count += 1;
                },
                method3: function() {
                    method3count += 1;
                }
            }),
            Test2 = Test1.extend({
                method1: function() {
                    method1count += 2;
                },
                method2: function() {
                    method2count += 2;
                    this._super();
                }
            }),
            test2 = new Test2();

        test2.method1();
        test2.method2();
        test2.method3();

        expect(method1count).to.be(2);
        expect(method2count).to.be(3);
        expect(method3count).to.be(1);
    });
    it('dispose()でプロパティとメソッドを破棄し、メモリーを解放する', function() {
        // klass.test1 = 1;
        // klass.test2 = '2';
        // klass.test3 = {};
        // klass.test4 = function() {};
        /* klass.dispose(); */
        // expect(klass).to.eql({});
        // expect(klass.dispose).to.be(undefined);
    });
});
