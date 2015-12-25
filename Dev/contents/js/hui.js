
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
		// 如果已经没有数据且有url，则尝试请求
		else {

			// 如果为空不去查询
			if (!val) {
				if (!ctrl_url) {
					$(ctrl_box).find('li').show();
				}
				return;
			};

			return delaySearch = setTimeout(function() {
				// 如果有回调函数，则运行查询
				if (callback) search(val, ctrl_box);
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
	用户列表
	---------------------------------------------
	zwl  2015-12-21

	@temlpate: 模板名称，最好是id,样式最好是唯一
	@data: JSON数组数据

	模板使用：
	将要使用的HTML指定一个id,对内容数据进行[[[数据可以用内容]]]来处理

	data = [
		{'姓名': 'zwl', '年龄': 27},
		{'姓名': '张飞', '年龄': 57}
	]

	<ul id="companyEmployee-template" class="hui-gp-inner">
		<li data-mod-t="[[inner]]" data-mod="iCenter/query-mod" data-nav="true">
			<!-- 图片 -->
			<figure>
				<img src="contents/img/people/usr001/usr01.png" alt="默认头像" />
			</figure>
			<!-- 个人信息 -->
			<div class="hui-gp-usr-info">
				<h2>[[[姓名]]]</h2>
				<p>[[[年龄]]]</p>
			</div>
		</li>
	</ul>

	示例:
	5级子模板调用示例 UI/temTest.ejs
*/
function generateTemHTML(temlpate, data) {

	// 自动生成模板的副本
	// 目标是让用户只要处理自己目标的模板
	// 让展示和内容直观一些
	// 程序自动生成备用的模板来完成之后的需要
	var temlpate2 = temlpate+'-copy';
	var tem2 = $(temlpate2);

	var tem = '';
	var html = '';
	var childTems = [];

	// 判断备用模板在不在
	if (tem2.size() > 0) {
		tem = tem2.html();
	} else {
		var mod = $(temlpate);
		tem = mod.html();
		// 取得所有子模板集合
		childTems = mod.find('[tem-type="child-template"]');
		// 生成备用模板
		mod.clone().insertAfter(mod).attr('id', temlpate2.substr(1)).hide()

	}

	/*
		生成模板
		----------------------------------
		按照传入的模板生成HTML
		@templateHTML : 模板文件
		@JSON : JSON数据
	*/
	var generateTem = function(temNo, JSON) {

		var templateHTML = temObj[temNo+'_'];
		// 解析模板要处理的内容
		var matchArr = templateHTML.match(/\[{3}.*?(?=\]{3})/g) || [];

		// 解析模板个数
		var matchLen = matchArr.length;

		// 如果数据是 Object
		if (typeof JSON == 'object' || typeof JSON == 'string') {
			for (var m = 0; m < matchLen; m++) {
				var arrVal = matchArr[m].replace(/\[{3}/, '');
				
				if (typeof JSON == 'string') {
					templateHTML = templateHTML.replace(/\[{3}.*?\]{3}/, JSON)
				}

				else {
					// 取值
					dataVal = JSON[arrVal];

					if (dataVal) {
						templateHTML = templateHTML.replace(/\[{3}.*?\]{3}/, dataVal)
					}
				}
			}
		}

		return templateHTML;
	}

	/*
		生成模板
		---------------------------------
		对传入指定的HTML代码进行模板的格式化与提取工作
		@ele : 指定的 HTML 代码
	*/
	var createTemObj = function(ele) {

		// obj 预留保存模板的集合
		// index 对应模板的关键针
		var obj = {}, _index = 0;

		// 创建核心
		var createTem = function(elelment) {

			var html = elelment.html();
			
			// 如果元素内容存在子模板的话
			if (elelment.find('[tem-type="child-template"]').size() > 0) {
		
				var cTem = elelment.find('[tem-type="child-template"]')[0].innerHTML;
				cTem = cTem.replace(/(\"|\(|\)|\[|\]|\/)/g, '\\$1')
				cTem = cTem.replace(/\r/g, '\\r')
				cTem = cTem.replace(/\n\r/g, '\\n\\r')
				cTem = cTem.replace(/\n/g, '\\n')
				cTem = cTem.replace(/\t/g, '\\t')
				cTem = cTem.replace(/\s/g, '\\s')
				var reg = new RegExp($.trim(cTem), 'i')

				html = html.replace(reg, '___tem'+(_index+1))
				obj['___tem'+_index] = html;

				// console.log('Tem: '+ html)
				html = html.replace(/(tem-data="\[{3}.*?\]{3}")|(tem-type="child-template")/gi, '')
				obj['___tem'+_index+'_'] = html;
				_index++;

				createTem(elelment.find('[tem-type="child-template"]').eq(0))
			} 
			// 如果没有子模板,则返回就前模板
			else {
				obj['___tem'+_index] = html;
				obj['___tem'+_index+'_'] = html;
			}

		}

		// 创建模板
		createTem(ele)

		return obj;
	}

	// 对传入子模板要处理的数据进行拆分生成
	var runData = function(temlpateInner, data) {
		var rhtml = '';

		// 如果数据要拆分工作的话
		if (data.length && typeof data == 'object') {

			for (var i = 0, len = data.length; i < len; i++) {
				rhtml += generateTem(temlpateInner, data[i])
			}
			
		} 
		// 直接生成
		else {
			rhtml = generateTem(temlpateInner, data)
		}

		return rhtml;
	}

	/*
		是否存在子模板判断
		-----------------------------------------
		生成模板
		对传入的指定模板进行生成,先判断是否有子模板的标记
		如果有的话先处理子模板,以此类推
	*/
	var hasChildTem = function(temNo, data) {

		var cHTML = '';
		var temlpateInner = temObj[temNo];

		// 如果没有数据,不去处理模板
		if (!data) return;

		// 判断当前模板是否有子模板标签
		if (/___tem/.test(temlpateInner)) {
	
			// 取子模板要使用的数据指针
			var getDataIndex = temlpateInner.match(/tem-data="\[{3}(.+)\]{3}/)[1];
			// 取子模板的数据内容
			var childData = data[getDataIndex];

			// 子模板指针
			// 目前不建议用户的子模板数超出2位数
			var childTem  = temlpateInner.match(/___tem\d/)[0];
			// 子模板
			//childTem = temObj[childTem];

			// 获取返回的 HTML 代码
			// 如果是 undefined 则使用 空
			if (childData) {
				if (childData.length && typeof childData == 'object') {

					for (var t = 0, tl = childData.length; t < tl; t++) {
						cHTML += hasChildTem(childTem, childData[t]) || '';

					} 
				}

				else {
					cHTML = hasChildTem(childTem, childData) || '';
				}
			}

		}
		// 替换
		// 1.在没有了子
		cHTML = runData(temNo, data).replace(/___tem\d/g, cHTML)
		return cHTML;
	}

	var temObj = createTemObj($(temlpate))
	// console.log(temObj)

	// 处理传来的总的条数据
	for (var i =0, len = data.length; i < len; i++) {
		// debugger
		html += hasChildTem('___tem0', data[i])
	}

	return html;
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
	var url = JSON.parse(_form.attr('ctrl-url').replace(/\'/g, '"'));
	// 表单提交的值
	var PData = JSON.parse(_form.attr('ctrl-data').replace(/\'/g,'"')) || '';
	// 默认值
	var defDate = JSON.parse(_form.attr('ctrl-defD').replace(/\'/g, '"')) || '';
	// 查询后运行函数
	var callback = _form.attr('ctrl-fun') || false;

	if (isLabels > 0) {
		findType = _form.find('input:checked').val();
	}

	// 取请求值的 url
	url = url[findType];

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
