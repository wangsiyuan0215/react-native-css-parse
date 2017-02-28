var fs = require('fs');

const color = ['red', 'green', 'blue', 'pink'];

const _ = {

	/**
	 * 读取 css 文件
	 * @method readFile
	 * @param  {[type]} filePath [description]
	 * @return {[type]}          [description]
	 */
	readFile: function (filePath) {
		return fs.readFileSync(filePath, 'utf-8');
	},

	/**
	 * is Array for array
	 * @param  {Array}  arr
	 * @return boolean
	 */

	isArray: function (arr) {
	    if("function" === typeof Array.isArray) {
	        return Array.isArray(arr);
	    } else {
	        return Object.prototype.toString.call(arr) === '[object Array]';
	    }
	},

	/**
	 * in Array for array
	 * @method inArray
	 * @param  {[type]} arr    [description]
	 * @param  {[type]} target [description]
	 * @return {[type]}        [description]
	 */
	inArray: function(arr, target) {
		const _arr = arr.join(',');

		return _arr.indexOf(target) !== -1;
	},

	/**
	 * 将带有 px | rem | rem | % 的值过滤掉
	 * @method filterValueToNum
	 * @param  {[type]}         value [description]
	 * @return {[type]}               [description]
	 */
	filterValueToNum: function (value) {
		return value.replace(/([.\d]*)(px|em|rem|%)/g, function (_, a, b) {
			if (b === 'px') {
				return a;
			} else if (b === 'em') {
				return a;
			} else {
				return a;
			}
		});
	},

	/**
	 * 转换为小驼峰
	 * @method toCamelCase
	 * @param  {[type]}    str [description]
	 * @return {[type]}        [description]
	 */
	toCamelCase: function (str) {
		return str.replace(/(?:\-)(\w)/g, function(_, a) {
			return a ? a.toUpperCase() : '';
		})
	},


	/**
	 * css 名称去 . | # | [space]
	 * @method cssNameTransfer
	 * @param  {[type]}        name [description]
	 * @return {[type]}             [description]
	 */
	cssNameTransfer: function (name) {
		return name.replace(/(?:^\.| |\.|\#|^\#)(\w)/g, function(_, a) {
			return a;
		})
	},


	/**
	 * 判断参数是否是颜色
	 * @method isColor
	 * @param  {[type]}  str [description]
	 * @return {Boolean}     [description]
	 */
	isColor: function (str) {
		return str.indexOf('#') !== -1 || str.indexOf('rgb') !== -1 ||
				color.join(',').indexOf(str) !== -1;
	},


	/**
	 * 判断参数是否是数值
	 * @method isNumber
	 * @param  {[type]}  num [description]
	 * @return {Boolean}     [description]
	 */
	isNumber: function (num) {
		return num.indexOf('px') !== -1 || num.indexOf('em') !== -1 ||
				num.indexOf('%') !== -1;
	},

};

module.exports = _;