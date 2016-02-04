
$(function() {
	var deg = 360 / 30;
	$('.child li').each(function(index) {
		console.log(index)
		// if (index < 15) {
		// 	$(this).css({
		// 		transform: 'rotateX('+index * deg + 'deg)'
		// 	})
			
		// } else {
			$(this).css({
				transform: 'rotateX('+(180 - index * deg )+ 'deg)'
			})
		// }
	})
})


document.getElementById('hide').addEventListener('click', function() {
	var isChecked = document.getElementById('hide').checked;

	if (isChecked) {
		document.getElementsByClassName('mod')[0].style.overflow = 'hidden'
	} else {
		document.getElementsByClassName('mod')[0].style.overflow = 'initial'
		
	}
})



var evtIOSTimeMod = {}
evtIOSTimeMod.eventTime = {}
evtIOSTimeMod.eventPosition = {}
evtIOSTimeMod.eventPosition.start = {}
evtIOSTimeMod.eventPosition.end = {}
evtIOSTimeMod.ishold = false;

$('.mod').mousedown(moveStart).mousemove(holdMove).mouseup(moveEnd);

var mod = document.querySelector('.mod');
mod.addEventListener('touchstart', moveStart, false)
mod.addEventListener('touchmove', holdMove, false)
mod.addEventListener('touchend', moveEnd, false)


// 获取元素当前 translate 值
function getTransForm (element) {
	var getVal = $(element).css('transform');
	getVal = getVal == 'none' ? 'matrix(1, 0, 0, 1, 0, 0)' : getVal; 
	
	return {
		x : Number(getVal.split(',')[4]),
		y : Number(getVal.split(',')[5].replace(')',''))
	}
}

function quad(progress) {
	return Math.pow(progress, 5)
}

function makeEaseOut(delta) {
	return function(progress) {
		return 1 - delta(1 - progress)
	}
}

function animate(opts) {

	var start = new Date
	
	var id = setInterval(function() {
		var timePassed = new Date - start;
		// 进程，已经完成了多少，从0到1
		var progress = timePassed / opts.duration

		if (progress > 1) progress = 1;

		var delta = opts.delta(progress)
		opts.step(delta)

		if (progress == 1) clearInterval(id)
	}, opts.delay || 10)
}


function quickMove(newPosition) {

	moveChild(newPosition, true)

	// 设置顶层移动距离
	$('.box').css({
		transform: 'translate3d(0,'+newPosition+'px,0)'
	})
}

// 移动主框架
// @newPosition 新地址
// @checkPosition 是否要验证内部元素的位置
function moveChild (newPosition, checkPosition) {

	$('.child').each(function(index) {
		var iPositionY = getTransForm($(this)).y;
		var _getIPX = 0;
		// ul的高
		var _h = evtIOSTimeMod.style.height;
		// 容器高
		var _BoxH = evtIOSTimeMod.boxStyle.height;

		var setActive = function(ele) {
			ele.addClass('active').siblings().removeClass('active')
		}

		if (checkPosition) {

			// 计算
			// 用来确认当前元素的位置
			// 当在 控制台中使用 moveChild(number, true) 时，
			// 这里会计算与这个number之间的位移
			// 如果不对，自动校正
			if (iPositionY % (_h*2) == 0) {
				_getIPX = 0 - Math.ceil(newPosition/(_h*2))*_h*2;
			} else {
				_getIPX = _h - Math.ceil(newPosition/(_h*2))*_h*2;
			}

			// 如果和计算的值不相等，自动变成相等
			if (_getIPX !== iPositionY) {

				iPositionY = _getIPX;

				$(this).css({
					transform: 'translate3d(0,'+iPositionY+'px,0)'
				})
			}
		}

		// 偏移量，默认为0，也就是盒子的顶部为原点
		// 现在因为是滚轮，那么中间才是原点
		var deviation = 0
		// var deviation = evtIOSTimeMod.style.liHeight *2
		// 相对开始位置
		var relativeY = iPositionY + newPosition;
		// 相对结束位置
		var relativeE = relativeY + _h;

		// console.log(index, '开始点:', relativeY)
		// console.log(index, '结束点:', relativeE)

		// 我们来判断开始点的位置
		// 先假定原点在左上角
		// 那么高度可以显示的大小就是 0 到容器的高
		// 如果是在 0 到 高之间那么,一定是在显示区中
		// 此时只有开始的部分能看到
		// |----------------|
		// |                |
		// |                |
		// |                |    在这容器中
		// |================| <- 开始点
		// |================|
		// |================|
		if (relativeY >= 0) {
			if (relativeY > _BoxH) {
				// console.log('>= 你在容器的后面了')

				var buffer = (_h - _BoxH) /2 + _BoxH;

				if (relativeY > buffer) {
					$(this).css({
						transform: 'translate3d(0,'+(iPositionY- _h *2)+'px,0)'
					})
				}
			} else {

				if (relativeE > _BoxH) {
					// console.log('>= 你显示了头部')
					if (relativeY < _BoxH/2) {
						setActive($(this))
					}
				} else {
					// console.log('>= 你全部显示了！')
					setActive($(this))
				}
			}
		} else {
			if (relativeE > 0) {
				if (relativeE >= _BoxH) {
					// console.log('< 你全部显示了！')
					setActive($(this))
				} else {

					// console.log('< 你的尾巴出来了...')

					if (relativeE > _BoxH/2) {
						setActive($(this))
					}
				}
			} else {
				// console.log('< 你在原点前面哟...')
				// 我们设置一个缓冲
				// 不用让它一过显示区就移动位置
				// 万一用户马上回来又要移动位置,这样操作太频繁了
				var buffer = 0 - (_h - _BoxH)/2;

				// 当结束点也小于缓冲区了,开始移动到新位置上
				if (relativeE < buffer) {
					$(this).css({
						transform: 'translate3d(0,'+(iPositionY+ _h *2)+'px,0)'
					})

				}

			}
		}

	});

}

function moveStart(e) {

	var _ = $(this);

	// 清除缓冲效果
	$('.box').css({
		transition: 'transform 0s ease'
	})

	if (e.type === 'mousedown') {
		evtIOSTimeMod.eventPosition.start.x = e.originalEvent.layerX;
		evtIOSTimeMod.eventPosition.start.y = e.originalEvent.layerY;
	} 
	// touchstart
	else {
		evtIOSTimeMod.eventPosition.start.x = e.touches[0].pageX;
		evtIOSTimeMod.eventPosition.start.y = e.touches[0].pageY;
	}

	evtIOSTimeMod.eventTime.start = e.timeStamp;
	evtIOSTimeMod.ishold = true;

	// 主容器大小
	evtIOSTimeMod.boxStyle = {};
	evtIOSTimeMod.boxStyle.width = _.width()
	evtIOSTimeMod.boxStyle.height = _.height()

	// 内部元素的大小
	var _child = _.find('.child')
	evtIOSTimeMod.style = {}
	evtIOSTimeMod.style.width = _child.width()			
	evtIOSTimeMod.style.height = _child.height()
	evtIOSTimeMod.style.liHeight = 	_.find('li').height();
	evtIOSTimeMod.style.liSize = $('.child li').size() / 2;		

	// 获取当前的位置信息
	evtIOSTimeMod.boxPosition = {}
	evtIOSTimeMod.boxPosition.y = getTransForm('.box').y;

	console.log('原始位置：'+evtIOSTimeMod.eventPosition.start.y );

}

function holdMove(e) {
	e.preventDefault();

	if (e.buttons === 1 || evtIOSTimeMod.ishold) {
		var move;

		if (e.type === 'mousemove') {

			move = e.originalEvent.layerY - evtIOSTimeMod.eventPosition.start.y

		} else {
			move = e.touches[0].pageY - evtIOSTimeMod.eventPosition.start.y
		}

		evtIOSTimeMod.boxPosition._y = evtIOSTimeMod.boxPosition.y + move;

		// 当前年份
		evtIOSTimeMod.year = getNowTime(evtIOSTimeMod.boxPosition._y)

		$('#newBoxPosX-s').text(evtIOSTimeMod.boxPosition._y)
		.next().find('span').text(evtIOSTimeMod.year)

		moveChild(evtIOSTimeMod.boxPosition._y, false)

		// 设置顶层移动距离
		$('.box').css({
			transform: 'translate3d(0, '+evtIOSTimeMod.boxPosition._y+'px, 0)'
		})
	}
}

function moveEnd(e) {

	if (e.type === 'mouseup') {
		evtIOSTimeMod.eventPosition.end.x = e.originalEvent.layerX;
		evtIOSTimeMod.eventPosition.end.y = e.originalEvent.layerY;
		
	}
	else {
		evtIOSTimeMod.eventPosition.end.x = e.changedTouches[0].pageX;
		evtIOSTimeMod.eventPosition.end.y = e.changedTouches[0].pageY;
	}

	evtIOSTimeMod.ishold = false;
	evtIOSTimeMod.eventTime.end = e.timeStamp;
	// console.log(evtIOSTimeMod.eventTime, evtIOSTimeMod.eventPosition)

	// 移动时间
	var useT = evtIOSTimeMod.eventTime.end - evtIOSTimeMod.eventTime.start;
	// 移动的距离
	var useL = evtIOSTimeMod.eventPosition.end.y - evtIOSTimeMod.eventPosition.start.y;

	// 移动速度
	var useS = useL / useT;
	// 缓冲时间
	var goTime = 500;
	var liH = evtIOSTimeMod.style.liHeight;

	// 更新时间
	var updateTime = function(nowPoint) {
		document.getElementById('year').innerText = getNowTime(nowPoint)
	}

	// 移动时间小于滑动时间且移动的距离 > 0
	// 我们认为你是不用加速运动的
	if (useT < goTime/2 && Math.abs(useL) > 0) {
		// 得到鼠标结束时的位置
		var nowPosition = getTransForm($('.box')).y
		// 缓冲距离
		var willGoTo = useS * goTime;
		// 缓冲后达到的位置
		var willGo   = willGoTo + nowPosition;
		// console.log(willGoTo, willGo)

		if (willGo % liH != 0) {
			willGo = Math.ceil(willGo/ liH) * liH
		}

		$('.box').css({
			transform: 'translate3d(0, '+willGo+'px, 0)',
			transition: 'transform '+goTime+'ms ease'
		})

		// @delay: 动画帧数
		// @duration: 动画运行时间
		// @delta: 对进度操作
		// @step: 每一帧操作
		animate({
			delay: 10,
			duration: goTime,
			delta: makeEaseOut(quad),
			step: function(delta) {
				var newVal = willGoTo * delta
				var newPoint = newVal + nowPosition
				
				moveChild(newPoint, false)

				updateTime(newPoint)
			}
		})

		setTimeout(function() {

			updateTime(willGo)

		}, goTime+15)


	} else {
		// 校正位置
		var correction = Math.ceil(evtIOSTimeMod.boxPosition._y/liH)*liH;
		evtIOSTimeMod.boxPosition._y = correction;
		
		moveChild(correction, false)

		updateTime(correction)

		// 设置顶层移动距离
		$('.box').css({
			transform: 'translate3d(0, '+correction+'px, 0)',
			transition: 'transform .3s ease'
		})
	}


	// console.log(useT, 'ms')
	// console.log(useL, 'px')
	// console.log(useS * 200, 'px/ms')
}

// 返回当前时间
// @translate 当前的总位移
function getNowTime(translate) {
	var val = 0, liH = evtIOSTimeMod.style.liHeight;
	var size = evtIOSTimeMod.style.liSize;
	var defaultNo = 2010;

	if (translate <= 0) {
		val = defaultNo + (Math.abs(translate / liH)% size)
	} else {
		val = defaultNo + (size - (Math.abs(translate / liH)% size))
	}

	val += 2;
	return val.toFixed(0)
}