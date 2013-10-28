describe('readは', function() {
    it('read(readtxt)でwindow以下からreaddtxtでの指定が存在するかチェックし、その値を返す', function(done) {
        expect(read('read')).to.be.a('function');
        try {
            read('read.TestClass');
        }
        catch (e) {
            done();
        }
    });

    it('read(readtxt, srcpath)で同期的にファイルを読み込み展開する', function(done) {
        if (!window.mochaPhantomJS) {
            expect(read('read.TestClass', 'common/TestClass')).to.be.a('function');
            expect(read('read.TestClass2', 'common/TestClass2')).to.be.a('function');

            try {
                read('read.TestClass1', 'common/TestClass');
            }
            catch (e) {
                done();
            }
        }
        else {
            done();
        }
    });

    it('read.ns(keyword)でwindow以下にkeywordで指定された名前空間を作成する', function() {
        var ret = read.ns('read.testspace');
        expect(ret).to.be.a('object');
        expect(read.testspace).to.equal(ret);

        read.ns('read.testspace1.test.test.test.test');
        expect(read.testspace1.test.test.test.test).to.be.a('object');

        delete read.testspace;
        delete read.testspace1;
    });

    it('read.ns(keyword, setarg)で指定した場所にsetargを設定する', function() {
        read.ns('read.testspace.test.test.test.test', {test: 1});

        expect(read.testspace.test.test.test.test.test).to.eql(1);

        delete read.testspace;
    });

    it('read.ns(keyword, setarg)で指定した場所に予め値が存在していた場合、setargに元からあった値のプロパティを上書きする', function() {
        read.ns('read.testspace', {test1: 0, test3: 3});
        read.ns('read.testspace', {test1: 1, test2: 2});

        expect(read.testspace.test1).to.eql(1);
        expect(read.testspace.test2).to.eql(2);
        expect(read.testspace.test3).to.eql(3);

        delete read.testspace;
    });

    it('read.ns(keyword)で指定した場所に予め値が存在していた場合、上書きされない', function() {
        read.ns('read.testspace', function() {});
        read.ns('read.testspace');

        expect(read.testspace).to.be.a('function');

        read.ns('read.testspace', function() {});
        read.ns('read.testspace', {});

        expect(read.testspace).to.be.a('object');

        delete read.testspace;
    });

    it('read.run(path)で指定したpathのjsからクラスの階層を解析し実行する', function(done) {
        if (!window.mochaPhantomJS) {
            read.run('common/Read1');

            setTimeout(function() {
                expect(read.Read1).to.be.a('function');
                expect(read.Read2).to.be.a('function');
                expect(read.Read3).to.be.a('function');
                expect(read.Read4).to.be.a('function');

                done();
            }, 500);
        }
        else {
            done();
        }
    });
});
