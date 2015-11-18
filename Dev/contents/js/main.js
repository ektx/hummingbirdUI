// 注册认证功能
$(function() {

	$('.register-mod').submit(function(event) {
		
		event.preventDefault();
		var _this = $(this);
		var _secBtn = $('#getSecruityCode');
		var _secInt = $('#getSecruityVal');
		var _secVal = _secInt.val();

		if (_secVal !== _secBtn.attr('mycode')) {
			alert('验证码错误,请重试!');
			_secInt.focus()
			return;
		}

		// 修改新手机号功能
		if ($(this).find('.btn').attr('data-type') === 'changeMobile') {
			if (APP_USR_INFO.Mobile == register.phone) {
				alert('手机号相同!');
			} else {
				APP_USR_INFO.Mobile = register.phone
			}

			setUsrCenter(true);
			return;
		} 


		var URL = '/service/LoveEService.asmx/CheckInfo';

		$.ajax({
			url: URL,
			type: 'post',
			dataType: 'json',
			data: JSON.stringify({phone: register.phone, idcard: register.usrID, code: _secVal}),
			contentType: "application/json;charset=utf-8"
		})
		.done(function(data) {
			// console.log(data);

			setUsrCenter(data)
		})
		.fail(function(err) {
			// console.log(err)

		})

	}).checkForm();



});  // jq

function registerErr(data) {
	var _aTime = 0.3;
	document.querySelector('.circle-z').classList.remove('loading')
	document.querySelector('#svg-err').classList.add('show')
	document.querySelector('#svg-right').classList.remove('show')
	TweenMax.to('#svg-usrico', _aTime, {opacity: 0})
	TweenMax.to('.register-mod', _aTime, {backgroundColor: '#db2f69'})

}

function registerSuccess(data) {
	var _aTime = 0.3;
	document.querySelector('.circle-z').classList.remove('loading')
	document.querySelector('#svg-err').classList.remove('show')
	
	document.querySelector('#svg-right').classList.add('show')
	
	TweenMax.to('#svg-usrico', _aTime, {opacity: 0})
	TweenMax.to('.register-mod', _aTime, {backgroundColor: '#09f'})
	// TweenMax.to('.register-form', .5, {opacity: 0, y: '10%'})

	setTimeout(function() {
		$('.register-status-mod').click()
		
	}, 500)

}

function loading() {
	document.querySelector('.circle-z').classList.add('loading')

}

function reDefault() {
	document.querySelector('.show').classList.remove('show')
	TweenMax.to('#svg-usrico', .3, {opacity: 1})
	TweenMax.to('.register-mod', .3, {backgroundColor: '#09f'})
}

// 注册信息
var register = {};
// 获取验证码
document.getElementById('getSecruityCode').onclick = function() {
	var _this = this;
	register.phone = document.getElementById('phone').value.replace(/-/g,'');
	register.usrID = APP_USR_INFO.Cardid || document.getElementById('identity').value;

	var checkPhone = new Validatemobile(register.phone);
	if (checkPhone.isNull() || !checkPhone.isMobile()) {
		alert('请输入手机号')
		return;
	} 
	// else if ((typeof APP_USR_INFO == 'object') && (APP_USR_INFO.Mobile != register.phone) {

	// }


	_this.style.color = '#999';
	_this.setAttribute('disabled', 'disabled');


	var totalTime = 120;
	_this.innerHTML = totalTime+'秒后重新获取';

	var clock = setInterval(function() {
		totalTime--;
		_this.innerHTML = totalTime+'秒后重新获取';

		if (totalTime === 0) {
			_this.innerHTML = '获取验证码';
			_this.removeAttribute('disabled');
			_this.removeAttribute('style');
			clearInterval(clock)
		}
	}, 1000)

	$.ajax({
		type: "POST",
		dataType: 'json',
		data: JSON.stringify({phone: register.phone, idcard: register.usrID}),
		contentType: "application/json;charset=utf-8",
		url: 'service/LoveEService.asmx/AuthEmployee',
		success: function(result) {
			_this.setAttribute('mycode', result.d.substr(25, 6));
		}
	})

	return false
}


function setUsrCenter(data) {

	var bindUsr = function(obj, isEmployee) {
		// 如果不是修改密码刚不定义新的用户信息
		if (obj !== 'changeMobile') {
			APP_USR_INFO = {};

			APP_USR_INFO.Cardid =  obj['身份证号'] || register.usrID;
			APP_USR_INFO.Name = obj['姓名'] || register.phone;
			APP_USR_INFO.CompanyName = obj['公司名称'] || register.usrID;
			APP_USR_INFO.Mobile = obj.phone || register.phone;
			APP_USR_INFO.Address =  obj['家庭地址'] || '';
			APP_USR_INFO.CompanyId = obj['客户ID'] || '';
			APP_USR_INFO.EmployeeId = obj['雇员ID'] || '';
			APP_USR_INFO.isEmployee = isEmployee;
			APP_USR_INFO.Job = obj["工作岗位"];
			APP_USR_INFO.OpenId = sessionStorage.openid;
			// alert(JSON.stringify(APP_USR_INFO, '', '\t'))
			BindOrUpUsrInfo()
		} else {

			// alert(JSON.stringify(APP_USR_INFO, '', '\t'))

			BindOrUpUsrInfo(function(){
				history.back();
				setUsrDetialInfo()
			})
		}



	}

	// 如果只是修改手机号
	if (!!data && (typeof data === 'string')) {
		bindUsr('changeMobile', true)
		return;
	}
	if (data.d.substr(15,1) == '0' ) {

		bindUsr(register, false)

	} else {

		// 转JSON
		var infoJSON = eval('('+data.d.substr(1, data.d.length-2)+')');

		bindUsr(infoJSON, true)

	}


}




