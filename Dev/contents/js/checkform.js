(function($) {
	$.fn.checkForm = function(obj) {
		
		var showErr = function(obj, err) {
			var _this = obj.parents('.int-inner').prev();
			var _height = _this.children().outerHeight(true) + 6;

			_this.children().text(err).end()
			.parents('form').find('[type="submit"]').attr('disabled', 'disabled')
			TweenMax.to(_this, .4, {opacity: 1, height: _height})
		}

		var hideErr = function(obj) {
			var _this = obj.parents('.int-inner').prev();

			var errSize = obj.parents('form').find('.error').filter(function() {
				return $(this).height() > 0
			}).length;

			var reqSize = obj.parents('form').find('input[required]').filter(function() {
				return !$(this).val()
			}).length;

			console.log(errSize +' _ '+ reqSize)

			if (errSize == 0 && reqSize == 0)
				obj.parents('form').find('[type="submit"]').removeAttr('disabled')

			TweenMax.to(_this, .4, {opacity: 0, height: 0})
		}


		// 键盘事件
		var keyEvent = function(event) {
			console.log(event.which);
			console.log(event.type);

			var _this   = $(this);
			var _val    = _this.val();
			var _maxlen = _this.attr('maxlength') || null;
			var _minlen = _this.attr('minlength') || null;
			var _req    = _this.attr('required') || null;
			var _type   = _this.attr('type');
			var _name	= _this.attr('name');
			var _etype	= event.type;

			console.log('val:'+_val)
			console.log('length:'+_val.length)
			console.log('maxlength:'+_maxlen)
			console.log('minlength:'+_minlen)
			console.log('required:'+_req);
			console.log('type:'+_type);

			if (_etype == 'blur') {
				var _req_end = false;

				if (!!_req) {
					if ($.trim(_val).length == 0){
						showErr(_this, '长度不能为0');
						_req_end = true;
					}
				}

				if (_req_end) return;

				switch (_name) {
					// 身份证验证
					case 'identity':
						if (_val.length < 15 ) {
							showErr(_this, '长度不正确')
						} else if (_val.length < 18) {
							showErr(_this, '长度不正确')
						} else {
							var ckeckFlag = new IdentityVer(_val);
							if (!ckeckFlag.IsValid()) {
								showErr(_this, '身份证错误')
							} else {
								hideErr(_this);
							}
								
						}
						break;

					// 手机验证
					case 'phone':
						_val = _val.replace(/-/g, '');
						console.log(_val)

						var checkPhone = new Validatemobile(_val);

						if (checkPhone.isNull()) {
							showErr(_this, '手机号不能为空')
						} else if (!checkPhone.isLength()) {
							showErr(_this, '手机号要有11位')
						} else if (!checkPhone.isMobile()) {
							showErr(_this, '手机号码错误')
						} else {
							hideErr(_this);
						}
				}
				return;
			}


			if (_etype == 'keydown') {
				var _end_key = false;

				// 如果按键是 删除 或是 tab 则不去判断
				if (event.which == 8 || event.which == 9) return;

				switch (_name) {
					case 'identity':
						if (_val.length >= 18) return false;
						break;
				}

			}

			if (!!_maxlen) {
				if (_val.length > _maxlen) {
					console.info('最多'+_maxlen+'位')
					showErr(_this, '最多'+_maxlen+'位')
					return;
				} else {
					hideErr(_this);
				}
			}

			if (!!_minlen) {
				if (_val.length < _minlen) {
					console.info('最少'+_minlen+'位')
					showErr(_this, '最少'+_minlen+'位')
					return;
				} else {
					hideErr(_this);
				}
			}


			switch (_name) {
				// 身份证验证
				case 'identity':
					if (_val.length < 15 ) {
						showErr(_this, '长度不正确')
					} 

					else if (_val.length < 18 && _val.length > 15) {
						showErr(_this, '长度不正确')
					}

					else if (_val.length == 15 || _val.length == 18) {
						var ckeckFlag = new IdentityVer(_val);

						if (!ckeckFlag.IsValid()) {
							showErr(_this, '身份证错误')
						}
					}

					break;

				case 'phone':
					var __val = '';

					_this.attr({'type': 'text'});

					_val = _val.replace(/-/g, '');

					if (_val.length > 10) {
						_this.blur()
						// _this.attr({'readonly':'readonly'})
					}

					if (_val.length > 3 && _val.length < 8) {
							__val = _val.replace(/(\d{3})/, '$1'+'-');
					} else {
						__val = _val.replace(/(\d{3})(\d{4})/, '$1'+'-'+'$2'+'-');
					}
					_this.val(__val)
			}

			console.log('sss')			
		}

		$(this).find('input:not([type="submit"])').each(function() {
			$(this).keydown(keyEvent).keyup(keyEvent).blur(keyEvent);
		})
	}
})(jQuery);


/*
	身份证验证
	------------------------------------------------
*/
function IdentityVer(str) {
	this.Valid = false;
	this.id15 = '';
	this.id18 = '';
	this.local = '';
	str = str.replace(/\s/g,'');
	if (!!str) this.SetCardNo(str)
}

IdentityVer.prototype.SetCardNo = function(str) {
	this.id15 = '';
	this.id18 = '';
	this.local = '';

	var strNo;

	if (str.length == 18) {
		var patt = /^\d{17}(\d|x)$/i;
		if (patt.exec(str) == null) return;
		strNo = str.toUpperCase();
	} else if (str.length == 15) {
		var patt = /^\d{15}$/;
		if (patt.exec(str) == null) return;
		strNo = str.substr(0,6)+'19'+str.substr(6,9);
		strNo += this.GetVerCode(strNo)
	}
	this.Valid = this.CheckValid(strNo);
}

IdentityVer.prototype.IsValid = function() {
	return this.Valid;
}

// 返回出生日
IdentityVer.prototype.GetDate = function() {
	var iDate = '';
	if (this.Valid)
		iDate = this.GetYear() + '-' + this.GetMonth() + '-' + this.GetDay();
	return iDate;
}

IdentityVer.prototype.GetYear = function() {
	var iYaer = '';
	if (this.Valid)
		iYaer = this.id18.substr(6,4);
	return iYaer;
}

IdentityVer.prototype.GetMonth = function() {
	var iMonth = '';
	if (this.Valid)
		iMonth = this.id18.substr(10,2);
	if (iMonth.charAt(0) == '0')
		iMonth = iMonth.charAt(1);
	return iMonth;
}

IdentityVer.prototype.GetDay = function() {
	var iDay = '';
	if (this.Valid)
		iDay = this.id18.substr(12, 2);
	return iDay;
}

IdentityVer.prototype.GetSex = function() {
	var iSex = '';
	if (this.Valid)
		iSex = this.id18.charAt(16) % 2;
	return iSex;
}

IdentityVer.prototype.Get15 = function() {
	var ID15 = '';
	if (this.Valid) ID15 = this.id15;
	return ID15;
}

IdentityVer.prototype.Get18 = function() {
	return this.Valid ? this.id18 : '';
}

IdentityVer.prototype.GetLocal = function() {
	return this.Valid ? this.local : '';
}

IdentityVer.prototype.GetVerCode = function(strNo) {
	var wi = new Array(7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2,1);
	var ai = new Array('1','0','X','9','8','7','6','5','4','3','2');
	var cardNoSum = 0;
	for (var i =0; i < strNo.length; i++)
		cardNoSum += strNo.charAt(i) * wi[i];
	var seq = cardNoSum % 11;
	return ai[seq]
}

IdentityVer.prototype.CheckValid = function(str) {
	if (this.GetVerCode(str.substr(0, 17)) != str.charAt(17)) return false;
	if (!this.IsDate(str.substr(6, 8))) return false;

	var citys = {
		11: "北京",
		12: "天津",
		13: "河北",
		14: "山西",
		15: "内蒙古",
		21: "辽宁",
		22: "吉林",
		23: "黑龙江",
		31: "上海",
		32: "江苏",
		33: "浙江",
		34: "安徽",
		35: "福建",
		36: "江西",
		37: "山东",
		41: "河南",
		42: "湖北",
		43: "湖南",
		44: "广东",
		45: "广西",
		46: "海南",
		50: "重庆",
		51: "四川",
		52: "贵州",
		53: "云南",
		54: "西藏",
		61: "陕西",
		62: "甘肃",
		63: "青海",
		64: "宁夏",
		65: "新疆",
		71: "台湾",
		81: "香港",
		82: "澳门",
		91: "国外"
	};
	if (citys[parseInt(str.substr(0,2))] == null) return false;
	this.id18 = str;
	this.id15 = str.substr(0, 6) + str.substr(8,9);
	this.local = citys[parseInt(str.substr(0,2))];
	return true
}

IdentityVer.prototype.IsDate = function(strdate) {
	var r = strdate.match(/^(\d{1,4})(\d{1,2})(\d{1,2})$/);
	if (r == null) return false;
	var d = new Date(r[1], r[2] - 1, r[3]);
	return (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[2] && d.getDate() == r[3]);
}

/*
	手机验证
	------------------------------------------------
*/
function Validatemobile(mobileNo) {
	this.mobileNo = mobileNo;
}

// 验证是不是为空
Validatemobile.prototype.isNull = function() {
	return this.mobileNo.length > 0 ? false : true;
}

// 是否为11位号
Validatemobile.prototype.isLength = function() {
	return this.mobileNo.length == 11 ? true : false;
}

Validatemobile.prototype.isMobile = function() {
	return /^1[3|4|5|7|8][0-9]\d{4,8}$/.test(this.mobileNo);
}
