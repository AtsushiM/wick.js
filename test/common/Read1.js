read('read.Read3', 'common/Read3');
read('read.Read2', 'common/Read2');

read.ns('read.Read1', function() {
    console.log('1');

    new read.Read2;
    new read.Read3;
});

new read.Read1;
