
wx.config({
	debug: false,
	appId: appId,
	timestamp: timestamp,
	nonceStr: nonceStr,
	signature: signature,
	jsApiList: [
		'chooseImage',
		'previewImage',
		'uploadImage',
		'downImage',
		'hideOptionMenu'
	]
});


$('.app-children-room').on('click', '.fontCover-mod', function(evt) {
	
	ChooseImg('background');
	evt.stopPropagation();
});
$('.setUsrIco').click(function() {
	ChooseImg('usrIco');
})


function ChooseImg(setType) {
	wx.chooseImage({
		count: 1,
		success: function(res) {
			var localIDs = res.localIds;
			
			wx.uploadImage({
				localId: localIDs[0],
				success: function(res) {

					var serverID = res.serverId;
					var _oldImg = '';
					if (setType === 'background') {
						_oldImg =  APP_USR_INFO.Background;		
					} else if (setType === 'usrIco') {
						_oldImg = APP_USR_INFO.Icon;
					}

					$.ajax({
						type: 'post',
						url: 'service/LoveEService.asmx/UploadImage',
						dataType: 'json',
						contentType: "application/json;charset=utf-8",
						data: JSON.stringify({
							oldfile: _oldImg,
							mediaId: serverID
						})
					})
					.done(function(data) {

						if (setType === 'background') {
							$('.chooseImg-box').css({
								'background': 'url('+localIDs+')',
								backgroundSize : 'cover'
							})

							APP_USR_INFO.Background = data.d;
							
						} else if (setType === 'usrIco') {
							$('.usr-pic-mod img').attr('src', localIDs)
							APP_USR_INFO.Icon = data.d;
						}

						// 保存数据
						BindOrUpUsrInfo();
					})
					.fail(function(err) {
						alert(JSON.stringify(err))
					})
				},
				fail: function(err) {

					alert('UploadImage:'+JSON.stringify(err))
				}
			})

		}
	})
}


/*
	解除绑定
	---------------------------------------
*/
$('#dropMyInfo').click(function() {

	var check = confirm('您确认要解除绑定吗?');

	if (check == true) {
		$.ajax({
			url: '/service/LoveEService.asmx/Unbind',
			type: 'POST',
			dataType: 'json',
			data: JSON.stringify({openid: APP_USR_INFO.OpenId}),
			contentType: "application/json;charset=utf-8"
		})
		.done(function(data) {
			var json = eval('('+data.d+')')

			if (json.success == 1) {
				location.reload()
			}
		})
		.fail(function(err) {
			alert(err)
		})
	}
})


function setFrontCover(url) {

	var obj = document.querySelector('.chooseImg-box');

	if (!url) {
		url = 'contents/img/people/usr001/p01.png';

		// 取得你自己的图片地址
		// 以下是使用全局变量来保存地址的示例
		// 如果存在此变量
		if (typeof APP_USR_INFO != 'undefined') {
			url = !APP_USR_INFO.Background ? url : 'image/'+APP_USR_INFO.Background;
		}
	} else {
		url = 'image/'+url;
	}

	obj.style.background = 'url('+url+') no-repeat';
	obj.style.backgroundSize = 'cover';
}
