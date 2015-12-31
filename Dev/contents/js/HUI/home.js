var nav = [
	{
		"mod": "ui/setico",
		"title": "[[inner]]",
		"icon" : "i-set-nav",
		"name" : "设置菜单图标"
	},
	{
		"mod": "iCenter/health/health",
		"title": "[[inner]]",
		"icon" : "i-health-nav",
		"name" : "信息展示示例"
	},
	{
		"mod": "iCenter/health/button",
		"title": "[[inner]]",
		"icon" : "i-health-nav",
		"name" : "按钮展示示例"
	},
	{
		"mod": "UI/search",
		"title": "[[inner]]",
		"icon" : "i-search-nav",
		"name" : "搜索展示示例"
	},
	{
		"mod": "UI/ul",
		"title": "[[inner]]",
		"icon" : "i-list-nav",
		"name" : "列表信息示例"
	},
	{
		"mod": "UI/time/timeSelect",
		"title": "[[inner]]",
		"icon" : "i-list-nav",
		"name" : "时间示例"
	},
	{
		"mod": "UI/label",
		"title": "[[inner]]",
		"icon" : "i-code-nav",
		"name" : "label标签"
	},
	{
		"mod": "iCenter/points",
		"title": "[[inner]]",
		"icon" : "i-usr-nav",
		"name" : "雇员变动信息统计"
	}
]

var html = generateTemHTML('#home-nav-template', nav);
$('#home-nav-template').html(html)