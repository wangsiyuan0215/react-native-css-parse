var _ = require('./utils'),
	_cssParse = require('css-parse'),
	// 不支持属性的正则
	_unsupportedRegExp = new RegExp('^(display)|(transtion)|(background-[^c])|(box-sizing)', 'g'),

	// transform- 的正则
	_transformRegExp = new RegExp('transform-\s*', 'g'),

	// border 的正则
	_borderRegExp = new RegExp('^border(\-\s+){0,2}', 'g'),

	// text-decoration for text-decoration-line
	_textDecorationRegExp = new RegExp('(text-decoration)', 'g');


/**
 * NativeCss 构造函数
 * @method NativeCss
 */
var NativeCss = function () {
	this._css = null;
	this._rules = null;
};

/**
 * 打开文件，并获取文件内容
 * @method open
 * @param  {[type]} filePath [description]
 * @return {[type]}          [description]
 */
NativeCss.prototype._open = function (filePath) {
	this._css = _.readFile(filePath);
	return this;
}

/**
 * 将css文件中的内容通过 css-parse 转为对象
 * @method toObject
 * @return {[type]} [description]
 */
NativeCss.prototype._toObject = function () {

	this._css = _cssParse(this._css);

	// stylesheet.rules => []

	return this;
}

/**
 * 获取 css 对象的 stylesheet 属性
 * @method _getCssStyles
 * @return {[type]}      [description]
 */
NativeCss.prototype._getCssStyles = function () {
	return this._css.stylesheet.rules;
}

/**
 * 过滤、清洗属性
 * @method _filterProperty
 * @param  {[type]}        propertyName [description]
 * @return {[type]}                     [description]
 */
NativeCss.prototype._filterProperty = function (propertyName) {
	let _res = {
		key: propertyName,
		value: _.toCamelCase(propertyName)
	};

	// display
	if (_unsupportedRegExp.test(propertyName)) {
		return false;
	}

	// transform
	if (_transformRegExp.test(propertyName)) {
		return false;
	}

	// text-decoration
	if (_textDecorationRegExp.test(propertyName)) {
		_res.value += 'Line';
	}

	// border
	if (_borderRegExp.test(propertyName)) {
		_res['key'] = 'border';

		const _borderArr = propertyName.split('-');

		if (_borderArr.length === 1) {
			_res.value = [
				`${propertyName}Style`,
				`${propertyName}Width`,
				`${propertyName}Color`,
			]
		} else if (_borderArr.length === 2) {
			const _propertyName = _.toCamelCase(propertyName);

			_res.value = _res.value === 'borderRadius' ? 
				[ _res.value ] : 
				[
					`${_propertyName}Style`,
					`${_propertyName}Width`,
					`${_propertyName}Color`,
				];

		} else {
			_res.value = [ _res.value ];
		}
	}

	return _res;
}

/**
 * 过滤、清洗数字类型的值（处理 px/rem/em）
 * @method _filterValueNum
 * @param  {[type]}        valueNum [description]
 * @return {[type]}                 [description]
 */
NativeCss.prototype._filterValueNum = function (valueNum) {
	return _.filterValueToNum(valueNum);
}

/**
 * 判断属性值是否是混合型
 * @method _isMixedValue
 * @param  {[type]}      mixedValue [description]
 * @return {Boolean}                [description]
 */
NativeCss.prototype._isMixedValue = function (mixedValue) {
	return mixedValue.indexOf(' ') !== -1;
}

/**
 * 处理混合类型的值，如 margin / padding / border
 * @method _filterValueMixed
 * @param  {[type]}          valueMixed [description]
 * @return {[type]}                     [description]
 */
NativeCss.prototype._filterValueMixed = function (property, valueMixed) {

	switch(property.key) {
		case 'margin':
			return this._boxTransfer(property.key, valueMixed);
		case 'padding':
			return this._boxTransfer(property.key, valueMixed);
		case 'transform':
			return this._transformTransfer(valueMixed);
		case 'border':
			return this._borderTransfer(property.value, valueMixed);
		// default:
		// 	return valueMixed;
	}
}

/**
 * 对 margin / padding 属性进行转换为 top / right / bottom / left
 * @method _boxTransfer
 * @param  {[type]}                 propertyName [description]
 * @param  {[type]}                 value        [description]
 * @return {[type]}                              [description]
 */
NativeCss.prototype._boxTransfer = function (propertyName, value) {
	const _arr = value.split(' ');
	const _arrLen = _arr.length;

	if (_arrLen === 1) {
		return {
			[`${propertyName}`]: _arr[0]
		};
	} else if (_arrLen === 2) {
		return {
			[`${propertyName}Top`]: _arr[0],
			[`${propertyName}Right`]: _arr[1],
			[`${propertyName}Bottom`]: _arr[0],
			[`${propertyName}Left`]: _arr[1],
		};
	} else if (_arrLen === 3) {
		return {
			[`${propertyName}Top`]: _arr[0],
			[`${propertyName}Right`]: _arr[1],
			[`${propertyName}Bottom`]: _arr[2],
			[`${propertyName}Left`]: _arr[1],
		};
	} else if (_arrLen === 4) {
		return {
			[`${propertyName}Top`]: _arr[0],
			[`${propertyName}Right`]: _arr[1],
			[`${propertyName}Bottom`]: _arr[2],
			[`${propertyName}Left`]: _arr[3],
		};
	}
};

/**
 * 属性 transform 的转换器
 * @method _transformTransfer
 * @param  {[type]}           value [description]
 * @return {[type]}                 [description]
 */
NativeCss.prototype._transformTransfer = function (value) {
	const _value = value.split(' ');
	const _transform = _value.reduce( (acc, cur) => {

		return acc.concat(this._transformItemTransfer(cur));

	}, []);

	return {
		transform: _transform
	}
}

/**
 * 属性 transform item 的转换器
 * @method _transformItemTransfer
 * @param  {[type]}           value [description]
 * @return {[type]}                 [description]
 */
NativeCss.prototype._transformItemTransfer = function (value) {
	const _transformItem = value.replace(/(\w*)(?:\()(.*)(?:\))/g,  (_, a, b) => {

		const _bArr = b.split(',');
		const _bLen = _bArr.length;

		if (_bLen === 1) {
			if (a.indexOf('X') === -1) {
				a += 'X';
			} 

			return JSON.stringify([
				{[`${a}`]: _bArr[0]}
			]);
		} else if (_bLen === 2) {
			return JSON.stringify([
				{[`${a}X`]: _bArr[0]},
				{[`${a}Y`]: _bArr[1]},
			]);
		} else if (_bLen === 3) {
			return JSON.stringify([
				{[`${a}X`]: _bArr[0]},
				{[`${a}Y`]: _bArr[1]},
				{[`${a}Z`]: _bArr[2]},
			]);
		}
	});

	return JSON.parse(_transformItem)
}

/**
 * 属性 border 转换器
 * @method _borderTransfer
 * @param  {[type]}        propertyName [description]
 * @param  {[type]}        value        [description]
 * @return {[type]}                     [description]
 */
NativeCss.prototype._borderTransfer = function (propertyName, value) {
	const _value = value.split(' ');

	const _propertyValue = _value.reduce( (acc, cur) => {

		if (_.isColor(cur)) {
			acc['color'] = cur;
		} else if (_.isNumber(cur)) {
			acc['number'] = cur;
		} else {
			acc['style'] = cur;
		}

		return acc;
	}, {});

	return propertyName.reduce( (acc, cur) => {

		let _v = null;

		if (cur.indexOf('Style') !== -1) {
			_v = _propertyValue['style'];
		} else if (cur.indexOf('Color') !== -1) {
			_v = _propertyValue['color'];
		} else {
			_v = _propertyValue['number'];
		}

		acc[cur] = _v;

		return acc;
 
	}, {});
}

/**
 * 对 css 的属性进行转换
 * @method convert
 * @param  {[type]} filePath [description]
 * @return {[type]}          [description]
 */
NativeCss.prototype.convert = function (filePath) {

	this._rules = this._open(filePath)
					  ._toObject()
					  ._getCssStyles();

	let _cssObj = {};

	this._rules.map( item => {
		if(item.hasOwnProperty('type') && 
			item.hasOwnProperty('selectors')) {

			item.selectors.map( selector => {

				const key = _.cssNameTransfer(selector);
				const value = item.declarations.reduce( (acc, cur) => {

					let _property = this._filterProperty(cur.property);

					if (_property) {

						// 根据值得特点来判定属性的类型
						if (this._isMixedValue(cur.value)) {

							const _propertyValue = this._filterValueMixed(_property,
										this._filterValueNum(cur.value));

							acc = Object.assign({}, acc, _propertyValue);

						} else {
							acc[_property.value] = this._filterValueNum(cur.value);
						}
					}

					return acc;

				}, {});

				_cssObj = Object.assign({}, _cssObj, {
					[key]: value
				})

			});
		}
	});

	return _cssObj;
}

if(typeof exports == 'object') {
	module.exports = new NativeCss();
} else if ( typeof define == 'function' && define.amd ) {
    define([], function(){ return new NativeCss() })
} else {
    window.NativeCss = new NativeCss()
}







