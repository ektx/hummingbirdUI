$(function() {
	var appId, 
		nonceStr, 
		timestamp, 
		signature, 
		rawString;

	var code = getQueryString("code");
	var data = { code: "'" + code + "'" };

	if (!!sessionStorage.openid) {
		getUsrInfo(sessionStorage.openid)
		return;
	}

	if (code != null) {
	    $.ajax({
	        type: "GET",
	        // async: false, //同步
	        dataType: "json",
	        contentType: "application/json;charset=utf-8",
	        url: "service/LoveEService.asmx/Getsubscribe",
	        data: data,
	        error: function (error) { 
	        	alert('error') 
	        	// alert(error) 
	        },
	        success: function (result) {

	            var openid = eval('('+result.d+')').openid;

				sessionStorage.openid = openid;

				getUsrInfo(openid)
	        }
	    });
	}



}); // jq


function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

// 个人信息保存
var APP_USR_INFO = '';

// 取得个人信息

function getUsrInfo(openid) {
	
	$.ajax({
		type: 'post',
		dataType: 'json',
		data: JSON.stringify({openid: openid}),
        contentType: "application/json;charset=utf-8",
		url: 'service/LoveEService.asmx/GetUserInfo'
	})
	.done(function(data) {

		var url = 'iCenter/register.html';


		if (data.d.indexOf('failed') == -1) {

			APP_USR_INFO = data.d;

			APP_USR_INFO = eval('('+ APP_USR_INFO.substr(9, APP_USR_INFO.lastIndexOf(']')-9).replace(/''/g, '"') +')');

			$('h3.slideworld').html(APP_USR_INFO.Name);

			var bgImg = APP_USR_INFO.Background;
			if (!!bgImg) {
				$('.people-pic').css('background-image', 'url("image/'+bgImg+'")')
			}
			
			url = 'iCenter/usrcenter.html';

			// alert(JSON.stringify(APP_USR_INFO))
		}


		$('#my-page').load(url, function() {
			setUsrInfo()
		})

	})
	.fail(function(err) {
		// console.log('无法取得个人信息！')
		// test 加载个人中心,仅测试
		$('#my-page').load('iCenter/usrcenter.html', function() {
			setUsrInfo()
		})
	})

}


/*
	设置用户信息
	---------------------------------------------

*/
function setUsrInfo() {
	var _usrBox = $('.usr-base-info');

	_usrBox.find('h3').html(APP_USR_INFO.Name).end()
	.find('p').html(APP_USR_INFO.Job)

	if (!!APP_USR_INFO.Icon) {
		$('.usr-pic-mod').find('img').attr('src', 'image/'+APP_USR_INFO.Icon);
	}

	if (!APP_USR_INFO.EmployeeId) {
		$('.i-search-nav').remove()

	}
}


/*
	设置个人详细信息
	----------------------------------------------
*/
function setUsrDetialInfo() {

	setUsrInfo()

	// 设置用户信息
	if (typeof APP_USR_INFO == 'undefined') return;

	$('.i-perSpace-inner input').each(function(index, el) {

		// 从全局变量中取值
		$(this).val(APP_USR_INFO[$(this).attr('name')])
	});

	$('[data-name="Address"]').text(APP_USR_INFO.Address)

}



/*
	绑定或更新用户信息
	---------------------------------------
*/
function BindOrUpUsrInfo(callback) {

	$.ajax({
		type: 'POST',
		dataType: 'json',
		contentType: "application/json;charset=utf-8",
		url: 'service/LoveEService.asmx/binduser',
		data: JSON.stringify({user:APP_USR_INFO})
	})
	.done(function(data) {

		var FirstReg = $('.register-status-mod');

		if (FirstReg.length > 0) {
			FirstReg.attr({
				'data-mod':'iCenter/usrcenter-mod', 
				'data-mod-t':'个人中心',
				'data-fun': 'setUsrInfo()'
			}).click();

			setTimeout(function() {
				FirstReg.remove()
			}, 450)
		}


		if (typeof callback == 'function') {
			callback()
		}

	})
	.fail(function(err) {
		alert('注册出错了！请重试！')
		// alert(JSON.stringify(err))
		// $('.register-status-mod').attr({
		// 	'data-mod':'iCenter/usrcenter-mod', 
		// 	'data-mod-t':'个人中心',
		// 	'data-fun': 'setUsrInfo()'
		// }).click();
	})
}