read('read.Read4', 'common/Read4');

read.ns('read.Read3', function() {
    console.log('3');

    new read.Read4;
});

