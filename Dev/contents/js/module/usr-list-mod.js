/*
	用户列表展开收缩效果
	========================================
	模板: parts/ul/usr-list-mod.ejs


	@author: zwl
	@time: 2015-11-20
*/

$(function() {
	// 用户列表收缩效果
	$('.hui-group-box').on('click', 'h1', function() {
		var _ = $(this);

		_.find('i').toggleClass('close').end().next('ul').toggle(400)
	});


	// 与搜索一起功能
	// search/base.ejs
	$('input[type="search"]').keyup(function(event) {

		// 展开所有列隐藏所有列表
		$('.hui-gp-inner').show().find('li').hide();

		var val = $(this).val();

		// 判断各自显示
		$('li').each(function(index) {
			var html = $(this).find('h2').html();
			var reg = new RegExp(val, 'i')
			if (reg.test(html)) {
				$(this).show()
			}
		});

		// 阻止enter键提交功能
		if (event.which == 7) {
			event.preventDefault()
		}
	});

	$('input[type="reset"]').click(function() {
		$('.hui-gp-inner li').show()
	})

})