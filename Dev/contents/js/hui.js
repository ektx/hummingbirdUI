
$(function() {


	// 取得个人信息
	getURLJSON({session: true})


	// 与搜索一起功能
	// search/base.ejs
	var delaySearch;
	$('body').on('keyup', 'input[type="search"]', function(event) {

		var _ = $(this);
		// 获取查询的form表单
		var _form = $(this).parents('form');
		// 取得表单对应操作的列表
		var ctrl_box = _form.attr('ctrl-box');
		var callback = _form.attr('ctrl-fun');
		var ctrl_url = _form.attr('ctrl-url') || '';
		// 查询方式
		var search_type = _form.attr('search-type') || false;

		// 展开所有列隐藏所有列表
		$(ctrl_box).show().find('li').hide();

		// 查询值
		var val = $.trim(_.val());

		clearTimeout(delaySearch);

		if (!ctrl_url) {
			// 判断各自显示
			$(ctrl_box).find('li').each(function(index) {
				var html = $(this).text();
				var reg = new RegExp(val, 'i')
				if (reg.test(html)) {
					$(this).show()
				}
			});
		}
		// 在有 url 情况下，则尝试请求
		else {

			// 如果为空不去查询
			if (!val) {
				if (!ctrl_url) {
					$(ctrl_box).find('li').show();
				}
				return;
			};

			return delaySearch = setTimeout(function() {
				// 新旧方法区分
				if (search_type) {
					var c_data = {
						val : val,
						url: ctrl_url,
						ele: ctrl_box
					}
					if (callback) eval(callback)(c_data)
				}
				// 如果没有指定查询类型，则用老的方法
				else {
					// 如果有回调函数，则运行查询
					if (callback) search(val, ctrl_box);
				}
			}, 600)
		}


	}).on('keydown', 'input[type="search"]', function(event) {

		// 阻止enter键提交功能
		if (event.which == 13) {
			event.preventDefault()
		};
	}).on('click', 'input[type="reset"]', function(event) {
		var _form = $(this).parents('form');
		var ctrl_box = _form.attr('ctrl-box');
		var ctrl_url = _form.attr('ctrl-url') || '';

		// 显示所有数据
		if (!ctrl_url)
			$(ctrl_box).find('li').show();
	});


	// 用户列表收缩效果
	$('.app-inner').on('click', '.hui-group-box > h1', function() {
		var _ = $(this);

		_.find('i').toggleClass('close').end().next('ul').toggle(400)
	});




})


/*
	处理后台返回字符串形式JSON
	-------------------------------------
	zwl 2015-12-7
*/
function getJSON(data) {

	data = data.d;
	// 去字符串中（）|换行(win)|换行(liu) 空格|换行(Mac)，防止生成报错
	data = data.replace(/\(|\)|\r\n|\n|\r/g , '');
	data = eval('('+data+')');

	return data;
}

/*
	处理URL字符串形式JSON
	格式： ?name=zwl&age=28
	-------------------------------------
	zwl 2015-12-7
*/
function getURLJSON(obj) {
	var arr = location.search.substr(1).split('&');
	var json = {};

	for (var i = 0, len = arr.length; i < len; i++) {
		var minArr = arr[i].split('=')
		json[minArr[0]] = decodeURI(minArr[1]);

		// 保存到cookie
		if (obj.cookie) {
			document.cookie = arr[i]
		}
		// 本地保存 session sto
		if (obj.session) {
			sessionStorage[minArr[0]] = minArr[1]
		}
	}

	return json;
}



/*
	公共查询
	-------------------------------------
	@value: 提交数据
	@element: 关联的多查询标签
	zwl 2015-12-11
*/
function search(value, element) {
	var findType, postData = {}, html = '';
	// 当前 form 表单
	var _form = $('[ctrl-box="'+element+'"]');
	// 是否有多地址查询
	var isLabels = _form.find('.label-box').size();
	// 表单的 url集
	var url = _form.attr('ctrl-url').replace(/\'/g, '"');
	if (url.indexOf('"') > -1) {
		url = JSON.parse(url)
	}
	// 表单提交的值
	var ctrlD = _form.attr('ctrl-data') || false;
	var PData =  ctrlD ? ctrlD.indexOf('\'') > -1 ? JSON.parse(ctrlD.replace(/\'/g,'"')) : ctrlD : ctrlD;
	// 默认值
	var defD = _form.attr('ctrl-defD')
	var defDate = defD ? defD.indexOf('\'') > -1 ? JSON.parse(defD.replace(/\'/g, '"')) : defD : defD;
	// 查询后运行函数
	var callback = _form.attr('ctrl-fun') || false;

	if (isLabels > 0) {
		findType = _form.find('input:checked').val();
	}

	// 取请求值的 url
	url = findType ? url[findType] : url;

	// 如果有请求值的话
	if (PData) {
		postData[PData[findType]] = value;
	}

	// 如果有默认值
	if (defDate) {
		for (var i in defDate) {
			postData[i] = defDate[i]
		}
	}

	$.ajax({
		type: 'POST',
		url: url,
		data: JSON.stringify(postData),
		dataType: 'json',
		contentType:'application/json;charset=utf-8'
	})
	.done(function(data) {

		data = getJSON(data);
		if (callback) {
			eval(callback)(data, findType)
		}
	})
	.fail(function(err) {
		console.error(err)
	})

}

/*
	展示请求结果[mis]
	-----------------------------------
	zwl 2012-12-14
*/
function displaySearch(data, findType) {

	if (data.failed === 0) {
		data = [{
			'姓名':'没有查询到数据', 
			'身份证号':'请重新查询'
		}]
	}

	if (findType == 'emp') {
		html = generateTemHTML('#search-usr-list-template', data)
		$('#search-usr-list-template').html(html).removeAttr('style').find('li').show()
	} else {
		html = generateTemHTML('#search-cus-list-template', data)
		$('#search-cus-list-template').html(html).removeAttr('style').find('li').show()
	}

}



/*
	双行列表清单
	----------------------------------------
	zwl 2015-12-8
*/
function generateDoubleList(data) {
	var html = '';

	for (var i in data ) {
		html += '<li class="ul-list-double-txt"><p class="title">';
		html += i+'</p><p class="inner">' + (!data[i]?'<无>':data[i]) + '</p></li>'
	}

	return html
}


/*
	查询客户列表
	----------------------------------------
*/
function getMyCus(name) {

	$.ajax({
		type: 'POST',
		url: '/MisService.asmx/MyCustomer',
		dataType: 'json',
		data: JSON.stringify({'name' : decodeURI(name)}),
		contentType: 'application/json;charset=utf-8'
	})
	.done(function(data) {

		var html = generateCustomerList(getJSON(data).inservice);
		$('#my-customers-have-people').html(html);

		html = generateCustomerList(getJSON(data).noservice);
		$('#my-customers-no-people').html(html)

	})
	.fail(function(err){
		console.error(err)
	})
}


/*
	设置时间选择
	-------------------------------------

*/
function setSelectMod() {

	var d = new Date();
	var sld = ' selected="selected" ';
	var box = $('.select-time');

	var setYearMod = function(selectTime) {
		var opt = '<select>';
		var y = d.getFullYear();

		for (var i = 0; i < 20; i++) {
			var _y = y - i;
			var _s = '';

			if (_y == selectTime) {
				_s = sld;
			}

			opt += '<option value="' + _y +'"'+_s+'>'+_y+'年</option>';
		}

		opt += '</select>';

		return opt;

	}

	var setMonthMod = function(setMonth) {
		var m = d.getMonth();
		var opt = '<select>';

		for (var i = 1; i < 13; i++) {
			var _s = '';

			if (i == setMonth) {
				_s = sld;
			}
			
			opt += '<option value="' + i +'"'+_s+'>'+i+'月</option>';
		}

		opt += '</select>';
		return opt;
	}

	// Delay 转成数字
	var toNumber = function(str) {
		return Number(str.replace(/Y|M|D/g, ''))
	}


	box.each(function(index, el) {
		var _this = $(this);
		var type = _this.attr('select-type');
		// 延迟数组; 如：延迟2年3个月 select-delay=2Y3M
		var delay = _this.attr('select-delay') || false;
		// 默认时间;
		// $$ 表示当前时间;今年1月,$$-1
		// 数字表示指定时间;2015年4月 2015-4
		var defaultT = _this.attr('selDef-time') || false;

		var html = '';
		// 将格式数组化
		var typeArr = type.match(/\w{2}|-/g);
		var defArr  = defaultT ? defaultT.match(/\${2}|-|\d+/g) : [];

		// 按格式生成指定的 HTML
		for (var i = 0, l = typeArr.length; i < l; i++) {
			if (typeArr[i] == 'yy') {
				var t = d.getFullYear();
				if (defaultT) {
					if (defaultT[i] != '$$' && !isNaN(defaultT[i])) {
						t -= Number(defaultT[i])
					}
				} else if (delay) {
					t -= Number(delay.match(/\d+(?=Y)/g)[0])
				}

				html += setYearMod(t)
			} 
			else if (typeArr[i] == 'mm') {
				var t = d.getMonth() + 1;
				if (defaultT) {
					if (defArr[i] != '$$' && !isNaN(defArr[i])) {
						t = Number(defaultT[i])
					}
				}
				else if (delay) {
					t -= Number(delay.match(/\d+(?=M)/)[0])
				}

				html += setMonthMod(t)
			} 
			else {
				html += '-'
			}
		}

		_this.html(html)
		
	});

}


// 延时请求查询关键字
var toQquerySelectTime;
/*
    取得请求时间
    ---------------------------------------------------
    开始时间和结束时间
    @delayTime: 延迟处理时间，这样可以有时间让用户选择自己要的时间
    @sort: 是否从小到大输出时间 true | false
    @callback: 回调时间的处理函数
*/
function getQuerySelectTime(delayTime, sort, callback) {
    clearTimeout(toQquerySelectTime);
    var arr = []

    toQquerySelectTime = setTimeout(function() {

        $('.select-time:visible').each(function(e) {
            var _ = $(this);
            var html = '';

            _.find('select').each(function(e) {
                var _val = $(this).val()
                html += _val > 9 ? _val : '0'+_val
            })

            arr.push(html)
        })

        if (sort && arr.length >= 2) {
            // 从小到大
            arr.sort(function(a, b) {
                return Number(a) > Number(b) ? 1: -1
            })
        }


        if (callback) callback(arr)

    }, delayTime)

}


/*
	alert-mod
	--------------------------------------
	AlertMod({
		title: '标题',
		inner: 'my alert mod',
		canTxt: false,
		okTxt : 'ok',
		callback: function(){}
	})
*/
function AlertMod(obj) {
	var title = obj.title || '标题',
		inner = obj.inner,
		cancelBtnTxt = obj.canTxt || 'CANCEL',
		okBtnTxt = obj.okTxt || 'OK';
		callback = obj.callback || false;
	var html = '';

		$('.alert-mod header').text(title)
		.siblings('div.alert-body').html(inner)

		// 如果 cancelBtnTxt = false,则可以不显示此按钮
		if (cancelBtnTxt) {
			html += '<button id="hui-alert-cancel" value="false">'+cancelBtnTxt+'</button>'
		}
		// 
		if (okBtnTxt) {
			html += '<button id="hui-alert-ok" value="true">'+okBtnTxt+'</button>'
		} else {
			console.log('okBtnTxt 不可以设定为 false')
		}

		$('.alert-mod').show();

		$('.hui-webkit-box').unbind().on('click', 'button', function() {

			var _this = $(this);

			if (callback) callback(_this);

			$('.alert-mod').fadeOut();
		})
}
