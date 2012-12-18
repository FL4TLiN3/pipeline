var utils = require('../lib/utils');

describe('Utils', function() {
    describe('#merge()', function() {
        it('should be return merged object', function() {
            var object = utils.merge({name: 'foo'}, {age: 10});
            object.name.should.be.equal('foo');
            object.age.should.be.equal(10);
        });

        it('should merge 3 or more objects', function() {
            var object = utils.merge(
                {name: 'john'},
                {
                    family: [
                        'james',
                        'adam'
                    ],
                    health: {
                        breath: 'normal',
                        bloodType: 'A'
                    }
                },
                {sex: 'male'},
                {age: 20}
            );
            object.name.should.be.equal('john');
            object.family[0].should.be.equal('james');
            object.family[1].should.be.equal('adam');
            object.health.breath.should.be.equal('normal');
            object.health.bloodType.should.be.equal('A');
            object.sex.should.be.equal('male');
            object.age.should.be.equal(20);
        });
    });
});
