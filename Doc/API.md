# Hummingbird
hummingbird 是用于制作手机端层叠级的微网站.它可以轻松实现类似`ios`的菜单功能可是ios中的`App store`的应用效果
(暂不支持Firefox的使用)  

## 使用多层子级结构方法
``` html
<div class="app-inner-room">
展示内容
</div>
<div class="app-children-room"></div>
```

2级菜单结构
``` html
<div class="app-inner-room">
展示内容
</div>
<div class="app-children-room">
	<div class="app-inner-room">
	展示内容2
	</div>
	<div class="app-children-room">
		内容3
	</div>
</div>
```


## API 参数使用  
加载指数  
- data-mod : 子级内容调用地址;格式为  
- data-mod-t : 新页面打开时，title标题,  
```html  
<xxx .. data-mod="地址-mod" data-mod-t="标题">
<xxx .. data-mod="地址-mod" data-mod-t="[[inner]]">
```
- data-url : 调用地址  

- data-mod-t : [string|[[inner]] ]子内容标题,会在title上显示,可以自己指定内容,或是使用[[inner]]自动引用 nav-link-name中文字为标题
- data-nav : [hide], 加载子级时隐藏主菜单  

移动控制参数  
### 单个新层适用  
- data-move: [true] 设置为可以移动的层,这个主要针对的是单个层，例如示例中的欢迎页面(parts/welcome.ejs)
- data-remove : [true] 设置移动之后从`DOM`删除,要先设置了`data-move="true"`
- data-rhelp: [true|false|null] 点击时,页面是否出现提示性移动   

### `app-inner-room`适用
- mod-ctrl : 数字,指定返回父级层数,默认为1,-1表示禁止移动  
- back-nav : [hide] 指定返回当前层之后，主菜单是否要显示，注：不要对顶层元素使用

### 按钮等内部控件适用      
- to-mod    : 数字,指点击此后应用返回父级层数  
- data-fun  : 调用函数; data-fun="highlightCode()" 
- data-nfn  : 1 每次点击都运行; 2 在模板相同时运行

下拉输入功能  
- data-type : [slideConfirm] 下拉确认功能  
- data-txt  : string | [[title]] 提示文字,默认读取 nav-link-name 中内容  
- data-inner: string | [[inner]] 默认输入内容,默认读取的是 nav-link-name 中的数据
- data-title: string | '' 标题,默认为空    
- data-fun  : string 确认调用函数功能  