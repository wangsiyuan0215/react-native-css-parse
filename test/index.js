var chai = require('chai'),
	path = require('path'),
	nativeCss = require('../index');


describe('Testing start', function () {
	let fileContent = null;

	describe('constructor()', function () {
		it ('should be a Object', function (done) {
			chai.expect(nativeCss).to.be.an('object');
			done();
		})
	});

	describe('open()', function () {
		it ('Should Find a File', function (done) {
			fileContent = nativeCss._open(path.resolve(__dirname, './test.css'));
			done();		
		});

		it ('Should have _css & _rules properties', function (done) {
			chai.expect(fileContent).to.have.property('_css');
			chai.expect(fileContent).to.have.property('_rules');
			done();
		})

		it ('Should not be null for _css before converting', function (done) {
			chai.expect(fileContent._css).to.not.be.null;
			chai.expect(fileContent._css).to.be.a('string');
			done();
		})

		it ('Should be null for _rules before converting', function (done) {
			chai.expect(fileContent._rules).to.be.null;
			done();
		})

	});


	describe('_toObejct()', function () {
		it ('should be a Object', function (done) {
			fileContent._toObject();

			chai.expect(fileContent._css).to.be.an('object');
			done();
		})
	});

	describe('_filterProperty()', function () {
		it ('should be a Object & has key to be "test"', function (done) {
			let _res = fileContent._filterProperty('test');

			chai.expect(_res).to.be.an('object');
			chai.expect(_res).to.have.property('key').to.equal('test');
			done();
		})

		it ('Key is "test-test" & Value is "testTest"', function (done) {
			let _res = fileContent._filterProperty('test-test');

			chai.expect(_res).to.be.an('object');
			chai.expect(_res).to.have.property('value').to.equal('testTest');
			done();
		})
	});



});