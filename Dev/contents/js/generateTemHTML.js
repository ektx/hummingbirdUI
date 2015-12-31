
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
		temlpate = temlpate2
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
					dataVal = dataVal ? dataVal : '<无>'

					templateHTML = templateHTML.replace(/\[{3}.*?\]{3}/, dataVal)
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
