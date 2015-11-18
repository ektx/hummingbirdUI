$(function() {
	var i = 0;
	$('#my-page').on('click', '.my-shop-box, .pay-way-check', function() {
		console.log(i++)
		var _check = $(this).find('.my-shop-check');
		var _name = _check.attr('name');

		// 如果有和当前名称相同的checkbox则移除上面的选择
		$('[name="'+_name+'"]').removeClass('checked')

		_check.toggleClass('checked');
		showPayBtn()

	})

})

function showPayBtn() {
	if ($('.checked').size() >= 1) {
		$('.pay-btn').removeAttr('disabled')
	} else {
		$('.pay-btn').attr('disabled', 'disabled')
	}

}
showPayBtn()