/*!
 * VERSION: 0.2.6
 * DATE: 2015-11-18
 * 
 * @author: zwl, ektx1989@icloud.com
 **/

// 打开菜单延时键
var goTimeout;

document.addEventListener('DOMContentLoaded', function() {
	var app = document.querySelector('.hummer-app');

	// 鼠标事件
	app.addEventListener('click', handStart, false);
	app.addEventListener('mousemove', handMove, false);


	function handStart(event) {
		console.log('click!')
		console.log(event)
		console.log(event.target)
		console.log(event.target)

		// 得到含有样式 .hummer-app 的元素（只查询到首次得到的一个）
		console.log(getEle(event.target, '.hummer-app'))
		// 得到含有ID为 hui-app 元素
		console.log(getEle(event.target, '#hui-app'))
		// 得到含有 data-move的元素
		console.log(getEle(event.target, 'data-move'))

	}

	function handMove(event) {
		if (event.buttons === 1) {
			// console.log(event)
			console.log(event.pageX + ' - ' + event.pageY);

		}
	}




}, false)


/* 
	取得委托元素
	-------------------------------------------------------
	// 得到含有样式 .hummer-app 的元素（只查询到首次得到的一个）
	console.log(getEle(event.target, '.hummer-app'))
	// 得到含有ID为 hui-app 元素
	console.log(getEle(event.target, '#hui-app'))
	// 得到含有 data-move的元素
	console.log(getEle(event.target, 'data-move'))


*/
function getEle(element, attribute) {
	// 查询含有样式的元素
	var queryCss = function(element, attribute) {
		
		if (element.classList.contains(attribute)) {
			_ = element;

		} else {
			callbackIt(element, queryCss)
		}
	};

	// 查询含有指定 id 的元素
	var queryId = function(element, attribute) {
		
		if (element.id === attribute) {
			_ = element;

		} else {
			callbackIt(element, queryId)
		}
	};

	// 查询含有指定 attribute 元素
	var queryAttr = function(element, attribute) {
		if (!element.getAttribute(attribute)) {
			callbackIt(element, queryAttr)
		} else {
			_ = element;
		}
	}

	// 回滚查询
	// 当前没有则查询父级，直到body
	var callbackIt = function(element, callback) {
		
			// 如果一直遍历到body了也找不到我们指定的内容
			// 返回 false
			if (element.tagName === 'BODY') {
				_ = false;
			} 
			// 查看父级内容中是否有
			else {
				callback(element.parentNode, attribute)
			}
	};	

	if (attribute.indexOf('.') === 0) {
		// css element
		attribute = attribute.substr(1);
		queryCss(element, attribute)

	} else if (attribute.indexOf('#') === 0) {
		// id element
		attribute = attribute.substr(1);
		// queryId(element, attribute);

		_ = document.getElementById(attribute);

	} else {
		// attribute element
		queryAttr(element, attribute)
	}

	var _;

	return _;
}