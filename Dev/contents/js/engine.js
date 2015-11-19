/*!
 * VERSION: 0.2.1
 * DATE: 2015-11-18
 * 
 * @author: zwl, ektx1989@icloud.com
 **/

// 打开菜单延时键
var goTimeout;

document.addEventListener('DOMContentLoaded', function() {

	// 加载页面模板
	var loadHTMLMod = '';

	// https://developer.mozilla.org/zh-CN/docs/Web/Events/popstate
	// 当浏览器点击返回按钮功能
	// 返回上一层菜单
	window.onpopstate = function(event) {
		console.log('!!! popstate')
		// alert('location:'+ document.location+', state:'+JSON.stringify(event.state))
		var obj = $('.app-room-overlay:last').parent().siblings();

		hideM(obj)
	}


	var appbody = $('.hummer-app');

	appbody.on('click', '[data-mod]', function(evt) {

		var _this = $(this);
		var goDelay = 300;
		var getHtml = _this.attr('data-mod');
		var innerBody = _this.parents('.app-inner-room');
		var elemet = innerBody.siblings('.app-children-room');
		var winW = document.documentElement.clientWidth;
		// 判断菜单隐藏属性
		var isHide = !!_this.attr('data-nav');
		var _title = _this.attr('data-mod-t') || '';
		var callback = _this.attr('data-fun');
		var needFun  = _this.attr('data-nfn') || '';


		// 如果不是菜单或是工资条,且有指定调用内容的情况下结束打开菜单
		if (!getHtml && (_this.hasClass('nav-li-box') || _this.hasClass('wages-months-list'))) return;

		// 设置遮盖层
		innerBody.append('<div class="app-room-overlay"></div>')
		var overlay = innerBody.find('.app-room-overlay');
		overlay.css({
			'webkitTransition': '-webkit-transform 300ms ease, opacity 300ms ease',
			'transition': 'transform 300ms ease, opacity 300ms ease'
		})

		// 加载指定文件
		// 修改指定加载层内容
		// 当数据为 inner 或 myself 时,则是直接让 app-inner-room 出现,因为数据已经在里面了
		if (getHtml == '[[children]]' || getHtml == '[[myself]]') {
			getHtml = ''
		}
		if (!!getHtml) {
			var _name = getHtml.substr(0, getHtml.length-4);
			var _url  = _name +'.html';

			console.log('%c当前页面地址: '+_url, 'color:red');

			// 如果加载模板与之前的缓存模板相同
			// 则不请求请的模板了
			if (loadHTMLMod !== _url) {

				loadHTMLMod = _url;

				// 加载等待
				elemet.html(genLoadHTML())

				elemet.load(_url, function(res, status, xhr) {

					console.log(status)

					if (!!callback) {
						eval(callback)
					}
					// console.log(scripts)
				})
				
			} 
			// 在模板相同的情况下
			else {
				// 强制启动callback
				// 只要点击了就要运行指定函数
				// 1 全局,一定运行
				if (needFun === '2') {
					if (!!callback) {
						eval(callback)
					}
				}
			}
		}

		// 强制启动callback
		// 只要点击了就要运行指定函数
		// 1 全局,一定运行
		if (needFun === '1') {
			if (!!callback) {
				eval(callback)
			}
		}


		// 设置title
		if (!!_title) {

			if (_title == '[[inner]]') {
				_title = _this.find('.nav-link-name').text()
			}

			document.title = _title;

			// hack在微信等webview中无法修改document.title的情况
			if (navigator.appVersion.toLocaleLowerCase().indexOf('micromessenger') > -1) {
				var $body = $('body');
				var $iframe = $('<iframe src="/favicon.ico"></iframe>').on('load', function() {
					setTimeout(function() {
						$iframe.off('load').remove()
					}, 0)
				}).appendTo($body)
			}
		}


		// 设置延时打开子菜
		return goTimeout = setTimeout(function() {

			// 如果指定要隐藏菜单
			if (isHide) {
				$('.app-menu').addClass('hide')
			} else {
				$('.app-menu').removeClass('hide')

			}

			
			elemet.css({
				'webkitTransform': 'translate3d(-100%, 0, 0)',
				'transform': 'translate3d(-100%, 0, 0)',
				'webkitTransition': '-webkit-transform 300ms ease',
				'transition': 'transform 300ms ease'
			})

			overlay.css({
				'opacity': .8
			})

			// 设置 URL
			setPopstate(1)

		}, goDelay)


		evt.stopPropagation()
	})
	
	// 返回指定父级层数
	.on('click', '[to-mod]', function(evt) {
		var toMod = $(this).attr('to-mod');
		var obj = $('.app-children-room').filter(function() {
			return ($(this).find('.app-children-room').size() == toMod)
		})
		hideM(obj)
	})
	
	// 弹层输入功能
	.on('click', '.nav-li-box', function(event) {
		var _this = $(this);
		var title = _this.attr('data-title') || '';
		var txt   = _this.attr('data-txt') || '';
		var callback = _this.attr('data-fun') || '';
		var txtA  = _this.attr('data-inner') || '';
		var names = _this.find('input').attr('name') || _this.find('[data-name]').attr('data-name');

		if (txt == '[[title]]') {
			txt = _this.find('.nav-link-name b').text() || _this.find('.nav-link-name p:first').text();
		}

		if (txtA == '[[inner]]') {
			txtA = _this.find('.nav-link-name p:last').text() || _this.find('.nav-link-name input').val()
		}

		if (title == '' && txt == '') return;

		showSlideConfirm({
			title: title,
			txt: txt,
			txtA: txtA,
			name: names
		}, callback)
	});




	// TouchMove()
	moveDiv = {};
	// 移动层收集器
	// 因框架是级级相套的结构,因此在移动内层子级时,父级难免一起受到了事件的监听
	// 收集器可以把收集到的数据统一集中
	moveDiv.Ctrl = [];

	var moveOptions = '.app-children-room, [data-move]';

	appbody.on('touchstart mousedown', moveOptions, function() {

		moveDiv.oldTransform = parseFloat($(this).css('transform').split(',')[4]);
		if (!moveDiv.oldTransform && typeof moveDiv.oldTransform == 'number') {
			moveDiv.oldTransform = 0;
		}
		moveDiv.winW  = document.documentElement.clientWidth;
		moveDiv.direX = 1;
		moveDiv.direY = 1;

		moveDiv.Ctrl.push(parseInt($(this).find('.app-inner-room').attr('mod-ctrl')) || 1);

		handleStart($(this))

	}).on('touchmove mousemove', moveOptions, function(e) {

		_this = $(this);

		handleMove(_this)

	}).on('touchend mouseup', moveOptions, function(e) {
		// debugger
		console.log(e.type)
		handleEnd($(this), event)

		e.stopPropagation()

	})


	// 打开主菜单
	appbody.on('click', '.toMainNav', function(event) {

		var _this = $(this);
		var _class= 'close';

		if (_this.hasClass(_class)) {
			_this.removeClass(_class)

			// TweenMax.to('.app-menu', .3, {y:60})
			$('.app-menu').addClass('hide')
			// TweenMax.to('.shopcart-nav', .4, {y:0})
			$('.shopcart-nav').removeClass('sp-main-nav')
		} else {
			_this.addClass(_class)
			// TweenMax.to('.app-menu', .3, {y:0})
			$('.app-menu').removeClass('hide')
			// TweenMax.to('.shopcart-nav', .4, {y:-56})
			$('.shopcart-nav').addClass('sp-main-nav')
		}
	});

	// 手机震动api
	// if ("vibrate" in navigator) {
	// 	navigator.vibrate([2000,1000,2000])
	// } else {
	// 	alert('not support vibrate')
	// }


}, false)


function changeUseInfo() {
	var txtA = $('.slideTxtInt-box textarea');
	
	console.log(APP_USR_INFO)

	APP_USR_INFO[txtA.attr('name')] = txtA.val()

	console.log(APP_USR_INFO)

	// 更新用户信息
	BindOrUpUsrInfo();
	// 更新DOM
	setUsrDetialInfo();
	// 收起下拉
	hideSlideTxt()
}



// 模拟手机返回功能
// 设置页面 popstate 属性
// 用于页面无跳转刷新
function setPopstate(pages) {

	var locURL = window.location
	var locSearch = locURL.search;
	var pageN = 0;

	if (!!locSearch) {
		pageN = parseInt(locSearch.substr(6))
	}

	var nowPage = pageN + Number(pages);
	history.pushState({page: nowPage}, "", "#page="+ nowPage)

}


function handleStart(_this) {

	moveDiv.start = {}
	if (event.type === 'touchstart') {
		moveDiv.start.pageX = event.touches[0].pageX;
		moveDiv.start.pageY = event.touches[0].pageY
	} else {
		moveDiv.start.pageX = event.pageX;
		moveDiv.start.pageY = event.pageY
	}

	moveDiv.deltaX = 0;
	moveDiv.Stime = +new Date();
	
	if (!!_this.attr('data-rhelp')) {
		var winW = document.documentElement.clientWidth;
		_this.css({
			'webkitTransform': 'translate3d('+ (20 - winW) + 'px, 0, 0)',
			'transform': 'translate3d('+ (20 - winW) + 'px, 0, 0)',
			'webkitTransition': '-webkit-transform 100ms linear',
			'transition': 'transform 100ms linear'
		}).addClass('animationPaused')

	}
		

	if (!!document.querySelector('#tStart'))
		document.querySelector('#tStart').innerHTML = 'Start:'+JSON.stringify(moveDiv.start);
}

/*
	Touchmove & Mousemove 事件
	---------------------------------------
	移动操作处理
*/
function handleMove(_this) {

	var evt = event;

	// 如果是鼠标事件的话
	// 在鼠标没有按下时不进行以下工作
	if (event.type === 'mousemove' && event.buttons === 0) return;

	// 清除打开菜单
	clearTimeout(goTimeout)

	// 1.只对当前层
	// 2.且内部同级的遮盖层只能有1个的层进行或是与自定的 mod-ctrl 数相同的层
	if (_this.hasClass('app-children-room') && _this.parent().find('.app-room-overlay').size() != moveDiv.Ctrl[0]) {

		return
	}

	var antiJitter = 30;
	var deltaX = 0;
	var deltaY = 0;

	if (event.type === 'touchmove') {
		deltaX = evt.touches[0].pageX - moveDiv.start.pageX;
		deltaY = evt.touches[0].pageY - moveDiv.start.pageY;
	} else {
		if (event.buttons !== 0) {
			deltaX = event.pageX - moveDiv.start.pageX;
			deltaY = event.pageY - moveDiv.start.pageY;
		}
	}

	moveDiv.deltaX = deltaX;

	// 阻止浏览器默认形为,好处是浏览器不会出现抖动了,平稳的像原生APP
	// 坏处是,滚动条都不给动了,呵呵
	if (Math.abs(deltaX) > Math.abs(deltaY))
		evt.preventDefault();

	// 调试显示区
	if (!!document.querySelector('#tmove'))
		document.querySelector('#tmove').innerHTML = 'Move - X:'+deltaX +', Y:' + deltaY;

	// 设置遮盖层的明暗
	var shine = (1- deltaX/moveDiv.winW) * 0.8;

	_this.css({
		
	}).siblings('.app-inner-room').find('.app-room-overlay').css({
		'opacity': shine,
		'webkitTransition': 'opacity 0s linear',
		'transition': 'opacity 0s linear'
	})

	// 抗抖动~~~
	if (Math.abs(deltaX) < antiJitter && !_this.attr('data-rhelp')) {
		console.log(!_this.attr('data-rhelp'))
		return;
	}

	var _moveX = 0;
	var _moveY = 0;

	switch (moveDiv.direX) {
		case 1:
			// -20是移动的位置,引导时,右移了20px
			antiJitter = !!_this.attr('data-rhelp')?-20:antiJitter;
			console.log('>> 只能右移 >>'+antiJitter)
			var __x = moveDiv.oldTransform + deltaX - antiJitter;

			if (__x > - moveDiv.winW) {
				_moveX = __x;
			} else {
				_moveX = - moveDiv.winW;
			}
			break;
		case 2:
			// console.log('<< 只能左移 <<')
			var __x = moveDiv.oldTransform + deltaX;
			if (__x < - moveDiv.winW)  {
				_moveX = __x;
			} else {
				_moveX = - moveDiv.winW;
			}
			break;
		case 4:
			// console.log('<>')
			_moveX = moveDiv.oldTransform + deltaX;
			break;
		default:
			_moveX = moveDiv.oldTransform;
	}

	_this.css({
		'webkitTransform': 'translate3d('+ _moveX + 'px, 0, 0)',
		'transform': 'translate3d('+ _moveX + 'px, 0, 0)',
		'webkitTransition': '-webkit-transform 0ms linear',
		'transition': 'transform 0ms linear'
	})

	// 移动结束时，位置标记
	moveDiv.endX = _moveX;

}


function handleEnd(_this, evt) {

	console.log('touchend: '+moveDiv.endX)
	console.log(_this)
	if (moveDiv.deltaX === 0) return;

	var antiJitter = 30;
	moveDiv.Etime = +new Date();


	// 判断返回菜单是否显示
	var backNav = _this.find('.app-inner-room').attr('back-nav');

	var showM = function() {
		
		console.log('<<< 显示');
		
		_this.removeClass('animationPaused').css({
			'webkitTransform': 'translate3d(-100%, 0, 0)',
			'transform': 'translate3d(-100%, 0, 0)'
		})

		// touchend时,没有达到要隐藏的指标时
		// 遮盖层恢复到开始状态
		.siblings('.app-inner-room').find('.app-room-overlay').css({
			'opacity': .8,
			'webkitTransition': 'opacity .3s linear',
			'transition': 'opacity .3s linear'
		})

	}


	// goTimeout;
	// 左侧为主型
	// 移动 < 2/3 的全屏幕时,还会回到全部显示状态
	// 移动 > 2/3 的全屏幕时,就会隐藏这个子层了
	var mainL = function() {

		var useTime = moveDiv.Etime - moveDiv.Stime;
		var moveSpeed = moveDiv.deltaX / useTime;
		console.log(moveDiv.deltaX+'px')
		console.log(useTime+'ms')
		console.log(moveSpeed+'px/ms')

		// 当用户在屏幕上快速滑动返回时,当速度超过0.5时,就不用
		// 要移动2/3的屏幕距离,内容就能返回了
		if (moveSpeed > 0.3) {
			hideM(_this, backNav)
			return;
		}

		if (moveDiv.endX < - (moveDiv.winW/3 + antiJitter)) {
			showM()
		} else {
			hideM(_this, backNav)
		}
	}

	var mainR = function() {
		if (moveDiv.endX > -(moveDiv.winW/3 + moveDiv.winW + antiJitter)) {
			showM()
		} else {
			hideM(_this, backNav)
		}
	}


	_this.css({
		'webkitTransition': '-webkit-transform 200ms linear',
		'transition': 'transform 200ms linear'
	})

	// 防止手机跳动无动画
	setTimeout(function() {

		switch (moveDiv.direX) {
			case 1:
				mainL();
				break;
			case 2:
				mainR();
		}
	}, 0)


	moveDiv.Ctrl = []
	// document.querySelector('#tEnd').innerHTML = 'End:' + _endX;
}


function hideM(_this, backNav) {

	console.log('>>> 隐藏')
	
	backNav = backNav;
	var _overlay = _this.siblings('.app-inner-room').find('.app-room-overlay');

	_this.css({
		'webkitTransform': 'translate3d(0, 0, 0)',
		'transform': 'translate3d(0, 0, 0)'
	})

	// touchend时,达到要隐藏的指标时
	// 隐藏此层动画
	_overlay.css({
		'opacity': 0,
		'webkitTransition': 'opacity 300ms linear',
		'transition': 'opacity 300ms linear'
	})

	setTimeout(function() {
		var _nav = $('.app-menu');

		// 移除遮盖层
		_overlay.remove()

		if (!!backNav) {
			if (backNav == 'hide') {
				// console.log('隐藏')
				_nav.addClass('hide')
			}
		} else {
			var _class = 'hide';

			if (_nav.hasClass(_class)) {
				// console.log('显示')
				_nav.removeClass(_class)
			}
		}
		var isRemove = _this.attr('data-remove') || false;

		if(isRemove) {
			_this.remove()
		}
	}, 310)

}

// 主菜单功能
var nav = document.querySelector('.app-menu');
nav.addEventListener('click', function(e) {

	var activeCss = 'nav-active';
	var _ = '';

	// 取得委托元素
	function getEle(ele, classname) {
		var _;
		var run = function(ele, classname) {
			if (ele.classList.contains(classname)) {
				_ = ele;
			} else {

				// 如果一直遍历到body了也找不到我们指定的内容
				// 返回 false
				if (ele.tagName === 'BODY') {
					_ = false;
				} 
				// 查看父级内容中是否有
				else {
					run(ele.parentNode, classname)
				}
			}
		}
		run(ele, classname)

		return _;
	}

	_ = getEle(e.target, 'app-menu-nav');

	if (_.classList.contains(activeCss)) return;

	// 状态修改
	document.querySelector('.'+activeCss).classList.remove(activeCss)
	_.classList.add(activeCss)

	var _id = _.getAttribute('dataid');
	var _url = _.getAttribute('data-url');
	var oldRoom = document.querySelector('.app-room-show');
	var thisE = document.querySelector('#'+_id);

	// 切换动画
	thisE.className += ' app-room-fadeIn app-room-show';
	// loading...
	$('.hummer-load-mod').fadeIn();

	// 请求页面
	if (_url) {
		var _inner = $('#'+_id);
		_url += '.html'

		_inner.hide()
		
		_inner.load(_url, function() {
			_inner.fadeIn()
			// loading...
			$('.hummer-load-mod').remove()
			$('.nav-active').removeAttr('data-url')
		})
	}
	
	// 移除切换动画状态
	setTimeout(function() {
		oldRoom.classList.toggle('app-room-show')
		thisE.classList.remove('app-room-fadeIn')
	}, 410)
});


function showChild() {
	TweenMax.to('.app-children-room', .3, {x: '-100%'})
}
function hideChild() {
	TweenMax.to('.app-children-room', .3, {x: '0%'})
}


function showSlideConfirm(obj, callback) {
	var el = '.slideTxtInner';
	var pt = '.slideTxtArea-mod';
	var title = $('.slideTxtTitle-box h3');
	var txt = $('.slideTxtTitle-box p');
	var inner = $('.slideTxtInt-box textarea');
	var sureBtn = $('.slideTxtBtn-box button:last');

	var titleVal = obj.title || '';
	var txtVal = obj.txt || '';
	var innerTxtA = obj.txtA || '';

	// 设置标题与提示内容
	title.text(titleVal).next().text(txtVal);
	inner.val(innerTxtA).attr('name', obj.name)

	sureBtn.attr('onclick', callback)

	TweenMax.set(pt, {'visibility': 'visible', background: 'rgba(0,0,0,.6)'})

	TweenMax.set(el, {x:0})
	TweenMax.to(el, .3, {y:'0%', delay: .1})

	// eval(callback);
	
}


// 隐藏下拉输入层
function hideSlideTxt() {
	var el = '.slideTxtInner';
	var pt = '.slideTxtArea-mod';

	TweenMax.to(el, .3, {y:'-100%'})
	TweenMax.set(pt, {background: 'rgba(0,0,0,0)'})

	TweenMax.set(pt, {'visibility': 'hidden', delay: .4})

}


/*
	加载中模板
	---------------------------
*/
function genLoadHTML() {
	var html = '<div class="hummer-load-mod"><div class="load-animate"></div><p>Loading...</p></div>';

	return html;
}