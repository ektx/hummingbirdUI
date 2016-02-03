
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

$('.mod')
.mousedown(moveStart)
.mousemove(holdMove)
.mouseup(moveEnd);

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
		var _w = evtIOSTimeMod.style.height;

		if (checkPosition) {

			// 计算
			// 用来确认当前元素的位置
			// 当在 控制台中使用 moveChild(number, true) 时，
			// 这里会计算与这个number之间的位移
			// 如果不对，自动校正
			if (iPositionY % (_w*2) == 0) {
				_getIPX = 0 - Math.ceil(newPosition/(_w*2))*_w*2;
			} else {
				_getIPX = _w - Math.ceil(newPosition/(_w*2))*_w*2;
			}

			// 如果和计算的值不相等，自动变成相等
			if (_getIPX !== iPositionY) {

				iPositionY = _getIPX;

				$(this).css({
					transform: 'translate3d(0,'+iPositionY+'px,0)'
				})
			}
		}

		// 相对开始位置
		var relativeY = iPositionY + newPosition;
		// 相对结束位置
		var relativeE = relativeY + _w;

		console.log(index, '开始点:', relativeY)
		console.log(index, '结束点:', relativeE)

		// 我们来判断开始点的位置
		// 如果是在 0 到 300 那么,一定是在显示区中
		// 此时只有开始的部分能看到
		if (relativeY > 0 && relativeY < 300) {
			// console.log('在之间,部分显示')
		} 
		// 如果不在 0 到 300 之间
		// 那么可能是在 0 前,那就是移动到了左边
		// 要么在 300 之后,移动到了右边
		else {

			// 如果是在 0 前面
			if (relativeY < 0 ) {

				// 那么我们看下结束点在那
				// 如果结束点 > 0,那就是在显示区中
				if (relativeE > 0) {
					
					// ::这里主要是状态说明,并没有实际作用
					// 如果还大于 300 那就是全部显示中,独占显示区
					if (relativeE > 300) {
						// console.log('全部显示中')
					} 
					// 反之则是只有尾部部分在了,快要结束或只是开始
					else {
						// console.log('尾部显示中')
					}
				}

				// 如果小于 0,那么说明它整个都已经移过了显示区
				else {

					// 我们设置一个缓冲
					// 不用让它一过显示区就移动位置
					// 万一用户马上回来又要移动位置,这样操作太频繁了
					var buffer = 0 - (_w - 300)/2;

					// 当结束点也小于缓冲区了,开始移动到新位置上
					if (relativeE < buffer) {
						$(this).css({
							transform: 'translate3d(0,'+(iPositionY+ _w *2)+'px,0)'
						})

					}
					
				}


			} 

			// 如果当前位置在 300 之后
			// 那它就看不见
			else if (relativeY > 300 ) {

				var buffer = (_w - 300)/2 + 300;

				// 同时它还在可视位置后的缓冲之外
				// 那它直接移动新位置上
				if (relativeY > buffer) {

					$(this).css({
						transform: 'translate3d(0,'+(iPositionY- _w *2)+'px,0)'
					})
				}
			}
		}

	});

}

function moveStart(e) {

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
	// 内部元素的大小
	evtIOSTimeMod.style = {}
	evtIOSTimeMod.style.width = $(this).find('.child').width()			
	evtIOSTimeMod.style.height = $(this).find('.child').height()			

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

	// 更新时间
	var updateTime = function(nowPoint) {
		console.log('nowPoint:'+nowPoint)
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

		if (willGo%48 != 0) {
			willGo = Math.ceil(willGo/48) * 48
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
			$('.box').css({
				transition: 'transform 0ms ease'
			})

			updateTime(willGo)

		}, goTime+15)


	} else {
		// 校正位置
		var correction = Math.ceil(evtIOSTimeMod.boxPosition._y/48)*48;
		evtIOSTimeMod.boxPosition._y = correction;
		quickMove(correction)
	}


	// console.log(useT, 'ms')
	// console.log(useL, 'px')
	// console.log(useS * 200, 'px/ms')
}


function getNowTime(translate) {
	var val = 0;
	if (translate < 0) {
		val = 2010 + (Math.abs(translate / 48)%30)
	} else {
		val = 2010 + (30 - (Math.abs(translate / 48)%30))
	}
	return val.toFixed(0)
}