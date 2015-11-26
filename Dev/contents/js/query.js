/*
	查询功能模块
	----------------------------------
*/
var Q_style = toQuerykey = '';

$(function() {

	// 进入查询,设置查询模式
	$('.nav-li-box').click(function() {
		Q_style = $(this).attr('data-query');


	});

	$('.usr-query-inner-mod').on('change', '.select-time', function() {
		
		$('.query-wagesList-mod .hummer-load-mod').fadeIn().siblings('ul').fadeOut()

		clearTimeout(toQuerykey);
		toQuerykey = setTimeout(function() {
			query()
		}, 2000)
	}).on('click', '.wages-months-list, .nav-retbar-box', function() {
		var _mod = $(this).attr('data-mod');

		if (/wagesMonthList/.test(_mod)) {
			var _this = $(this);
			var Qtime = _this.attr('data-time');
			if (!_this.hasClass('nav-retbar-box')) {
				wagesQuery(Qtime)
			}

		}
	})
})

function queryInit() {
	$('.hummer-load-mod').fadeIn().siblings('ul').fadeOut();

	if (Q_style !== 'doc' && Q_style !== 'house') {
		setSelectMod()
	}
	query();
}


// 查询数据
function query() {

	var url = '';
	var postData = {};
	var startTime = $('.select-time:eq(0) select');
	var strY = startTime.eq(0).val();
	var strM = startTime.eq(1).val() || '';
	strM = strM.length > 1 ? strM : '0'+strM;
	var startTimeVal = strY + strM;

	var endTime = $('.select-time:eq(1) select');
	var endY = endTime.eq(0).val();
	var endM = endTime.eq(1).val() || '';
	endM = endM.length > 1 ? endM : '0'+endM;
	var endTimeVal = endY + endM;

	postData.openid = sessionStorage.openid;

	// 自动分配启止时间
	if (Number(startTimeVal) > Number(endTimeVal)) {
		
		postData.strYMS = endTimeVal;
		postData.strYME = startTimeVal;
	} else {
		postData.strYMS = startTimeVal;
		postData.strYME = endTimeVal;
	}

	switch (Q_style) {
		case 'wages':
			url = '/service/LoveEService.asmx/GetSalaryList';
			break;

		case 'social':
			postData.type = 0;
			url = '/service/LoveEService.asmx/GetHy';
			break;

		case 'welfare':
			postData.type = 1;
			url = '/service/LoveEService.asmx/GetHy';
			break;

		case 'PAF':
			postData.type = 2;
			url = '/service/LoveEService.asmx/GetHy';
			break;

		case 'house':
			postData.type = 0;
			url = '/service/LoveEService.asmx/GetDangHu';
			break;

		case 'doc':
			postData.type = 1;
			url = '/service/LoveEService.asmx/GetDangHu';
			break;

		default:
			url = '';
	}

	$.ajax({
		type: 'POST',
		url: url,
		dataType: 'json',
		data: JSON.stringify(postData),
		contentType: "application/json;charset=utf-8"
	})
	.done(function(data) {
		// alert(JSON.stringify(data))
		var html = '';

		var wagesModFun = function(html) {
			$('.query-wagesList-mod .hummer-load-mod').fadeOut().siblings('ul').fadeIn();
			$('.wages-list-box').html(html)
			
		}

		switch (Q_style) {
			case 'wages':
				html = wagesListHTMLMod(data);
				wagesModFun(html);
				break;

			case 'social':
			case 'PAF':
			case 'welfare':
				html = socialListHTML(data.d);
				wagesModFun(html);
				break;
			case 'house':
			case 'doc':
				html = houseListHTML(data.d);
				$('.house-query-mod').prev('div').fadeOut().end().fadeIn().html(html);

		}
	})
	.fail(function(err) {
		console.error(err)
	})

}

// 查询工资详细
function wagesQuery(time) {

	var postData = {};
	postData.openid = sessionStorage.openid;
	postData.strYM = time;

	var url = '/service/LoveEService.asmx/GetSalary';

	$.ajax({
		type: 'POST',
		url: url,
		dataType: 'json',
		data: JSON.stringify(postData),
		contentType: "application/json;charset=utf-8"
	})
	.done(function(data) {

		data = data.d.replace(/\(|\)/g , '');
		data = eval('('+data+')');

		wagesMonthHTML('wages', data[0]);
	})
	.fail(function(err) {
		console.error(err)
	})
}


// 生成月报表
/*

	<li class="wages-months-list" data-mod="">
		<div class="wages-min-date">
			<i>7</i>
			<i>2015</i>
		</div><div class="wages-month-list">
			<p>$ 11,463.60</p>
			<i>更多详细 &gt;</i>
		</div>
	</li>

*/
function wagesListHTMLMod(data) {
	var json = '';
	var html = '';

	json = eval('('+data.d+')');

	if (json.failed == 0) {
		var d = new Date();
		json = [];
		json[0] = {};
		json[0]['年月']	= d.getFullYear()+'X(';
		json[0]['实发数']	= '0';
	}

	for (var i = 0; i < json.length; i++) {
		html += '<li class="wages-months-list"';
		if (json[i]['年月'].indexOf('X(') == -1) {
			html += ' data-mod="iCenter/wagesMonthList-mod" data-time="'+json[i]['年月']+'"';
		}

		html += '><div class="wages-min-date">';
		var _y = json[i]['年月'].substr(4);
		if (isNaN(_y)) {
			var _y_txt = '年终奖';
			if (_y === 'X(') {
				_y_txt = '无数据'
			}

			html += '<i style="font-size:1.3em;margin: 19px 0px 3px;">'+_y_txt+'</i>'
		} else {
			html += '<i>'+Number(_y.substring(0,2))+'</i>';
		}
		html += '<i>'+Number(json[i]['年月'].substring(0, 4))+'</i>';
		html += '</div><div class="wages-month-list">';
		html += '<p> ￥ '+ json[i]['实发数']+'</p>';
		html += '<i>更多详细 &gt;</i></div></li>'
	}

	return html;
}

// 生成单月详细

/*
	HTML模板:
	<div class="my-month-list">
		<header>
			<h3>2015 年 7月工资单</h3>
			<p>2015 年 7月 7日 14：00 发布</p>
		</header>

		<ul class="nav-ul-box nav-clos-box">
			<li class="nav-li-box nav-txt-read2">
				<div class="nav-li-inner">
					<div class="nav-link-name">
						<div class="title">
							基本工资:
						</div><div class="inner">
							7,000.00
						</div>
					</div>
				</div>
			</li>
			<li class="nav-li-box nav-txt-read2">
				<div class="nav-li-inner">
					<div class="nav-link-name">
						<div class="title">
							绩效:
						</div><div class="inner">
							7,000.00
						</div>
					</div>
				</div>
			</li>
		</ul>
	</div>

*/
function wagesMonthHTML(type, data) {

	var html = '';

	var setHeade =  function(title, info) {
		var Hhtml = '<header><h3>'+title+'</h3>';

		Hhtml += '<p>'+info+'</p></header>';
		Hhtml += '<ul class="nav-ul-box nav-clos-box">';

		return Hhtml;
	}

	var setList = function(index, data) {
		var html = '';

		// 对数字保留2位小数
		if (!isNaN(data)) {
			data = Number(data).toFixed(2)
		}


		html += '<li class="nav-li-box nav-txt-read2">';
		html += '<div class="nav-li-inner">';
		html += '<div class="nav-link-name">';
		html += '<div class="title">'+ index +':</div><div class="inner">';
		html += data+'</div></div></div></li>';

		return html;
	}

	// 如果是查询社保类的信息
	if (typeof data === 'number' && type === 'social') {

		data = SocialListJSON[data];

		for (var i in data) {
			if (i === '项目名称') {
				var info = data['开始时间'] + ' - '+ nowTime(data['结束时间']);

				html += setHeade(data['项目名称'], info);
			} else if (i==='开始时间' || i==='结束时间') {

			} else {
				html += setList(i, data[i])
			}

		}
		html += '<li class="nav-li-box nav-txt-read2"></li>';
	} 
	// 如果查询的是工资
	else {

		for (var i in data) {
			if (i === '年月') {
				html += setHeade(data['年月']+'工资单', data['年月']+'发布');
			} else {
				html += setList(i, data[i])
			}

		}
	}


	html += '</ul>';

	setTimeout(function() {
		$('.my-month-list section').html(html)
		
	}, 350)
}


// 社保福利模板
// @data 响应得到的json
function socialListHTML(data) {

	data = eval('('+data+')');

	if (data.failed == 0) {
		data = [];
		data[0] = {};
		data[0]['项目名称']	= '没有查到内容';
		data[0]['noInner'] = 'Y';	
	}

	var html = '';

	// 设置一个查询到的全局变量
	SocialListJSON = data;

	for (var i = 0; i < data.length; i++) {

		html += '<li class="nav-li-box nav-retbar-box"';
		if (data[i].noInner !== 'Y') {
			html += ' data-mod="iCenter/wagesMonthList-mod" data-fun="wagesMonthHTML(\'social\', '+i+')" data-nfn="2">';
		}

		html += '<div class="nav-li-inner"><div class="nav-retbar-name">';
		html += '<p>'+data[i]['项目名称']+'</p>';

		if (data[i].noInner !== 'Y') {
			html += '<b>'+data[i]['开始时间']+'-'+nowTime(data[i]['结束时间'])+'</b></div>';
		}
		html == '<div class="nav-more-ico"><i></i></div></div></li>'

	}

	return html;
}


// 户籍类型清单HTML
function houseListHTML(data) {
	data = eval('('+data+')');
	html = '';

	if (data.failed == 0) {
		data = [];
		data[0] = {};
		data[0]['查询内容']	= '没有查到内容';
	}

	for (var i =0; i < data.length; i++) {
		html += '<div class="nav-box-inner">';
		html += '<ul class="nav-ul-box nav-clos-box">';

		/*
			<li class="ul-list-double-txt">
				<p class="title">n</p>
				<p class="inner">_i</p>
			</li>
		*/
		for (var n in data[i]) {
			var _i = data[i][n];
			html += '<li class="ul-list-double-txt">';
			html += '<p class="title">'+n+'</p>';
			html += '<p class="inner">'+(!_i? '<无>':_i)+'</p>';
			html += '</li>';
		}

		html += '</ul></div>';
	}

	return html;
}

/*
	设置时间选择
	-------------------------------------

*/
function setSelectMod() {

	var d = new Date();
	var sld = ' selected="selected" ';
	var box = $('.select-time');

	var setYearMod = function(delay) {
		var opt = '<select>';
		var y = d.getFullYear();

		if (delay.indexOf('Y') > -1) {
			var now_Y = Number(delay.match(/\d(?=Y)/g)[0]);
			y = now_Y;
		}

		for (var i = 0; i < 20; i++) {
			var _y = y - i;
			var _s = '';

			if (_y == y) {
				_s = sld;
			}

			opt += '<option value="' + _y +'"'+_s+'>'+_y+'年</option>';
		}

		opt += '</select>';

		return opt;

	}

	var setMonthMod = function(delay) {
		var m = d.getMonth();
		var opt = '<select>';

		// 如果存在延迟月份
		if (delay.indexOf('M') > -1) {
			var delay_M = Number(delay.match(/\d(?=M)/g)[0]);
			var now_M = (m + 1) - delay_M;
			if (now_M  > 0) {
				m = now_M
			} else {
				m = 12 + now_M;

				var now_Y = Number(delay.match(/\d(?=Y)/g)[0]) + 1;
				delay = delay.replace(/\dY/, now_Y);
			}
		}

		for (var i = 0; i < 12; i++) {
			var _s = '';
			var _m = i+1;

			if (i == m) {
				_s = sld;
			}
			
			opt += '<option value="' + _m +'"'+_s+'>'+_m+'月</option>';
		}

		opt += '</select>';
		return opt;
	}


	box.each(function(index, el) {
		var _this = $(this);
		var type = _this.attr('select-type');
		var delay = _this.attr('select-delay') || '';

		var MonthHTML = setMonthMod(delay);
		var YearHTML  = setYearMod(delay)

		if (type === 'yy-mm') {
			_this.html(YearHTML + '-'+MonthHTML)
		}
		
	});

}


// 如果时间超过了现在此时此刻,显示为至今
// 对比格式: 20121010 > 20121012
function nowTime(time) {
	var d = new Date();
	var _m = d.getMonth();

	_m = _m.length > 1 ? _m : '0'+_m;
	var tIs = d.getFullYear() + _m;

	var t = Number(time);
	t = t > Number(tIs)? '至今' : t;
	return t;
}