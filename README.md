# Simple Layout Definition
A simple way to define a widgets layout in Ecmascript/JSON.

Dijit is a widget package for creating a beautiful RIA, it can work programmatically:
```javascript
var tabContainer = new TabContainer({});

var pane1 = new ContentPane({
	title : 'Pane 1'	
});

var pane2 = new ContentPane({
	title : 'Pane 2',
	content: 'Hello world!'
});

var button = new Button({
	label : 'My button'
});

pane1.addChild(button);

tabContainer.addChild(pane1);
tabContainer.addChild(pane2);
```

Or declarative in HTML:
```html
<div data-dojo-type="dijit/layout/TabContainer">
	<div data-dojo-type="dijit/layout/ContentPane"
		 data-dojo-props="title:'Pane 1'">
		 <button data-dojo-type="dijit/form/Button">My Button</button>
	</div>
	<div data-dojo-type="dijit/layout/ContentPane"
		 data-dojo-props="title: 'Pane 2'">
		 	Hello world!hy7
		</div>
	</div>
</div>
```

We propose a declarative syntax in ECMAScript/JSON that may be useful to share layouts between development tools:
```json
{
	"$type" : "dijit/layout/TabContainer",
	"$children" : [{
		"$type" : "dijit/layout/ContentPane",
		"title" : "Pane 1",
		"$children" : [{
			"$type" : "dijit/form/Button",			
			"label" : "My button"
		}]
	}, {
		"$type" : "dijit/layout/ContentPane",
		"title" : "Pane 2",
		"content" : "Hello world!"
	}]
}
```
This package contains a parser for this syntax.
 
## Get Code

Clone this repo
```
git clone https://github.com/sapienlab/sld.git
```
or use the cmp tool
```
cmp install sld
```

## Specification

Each JSON/Object nodes has two special attributes:
* $type {string|function}: The module identifier (MID) in AMD context, example 'dijit/form/Button', or the widget class (constructor function).
* $children {array}: A optional array of anothers JSON/Object nodes.

Another attributes are passed to the constructor of the widget.

<pre>
{
    "$type" : "dijit/layout/TabContainer",                <div data-dojo-type="dijit/layout/TabContainer"
    "$children" : [{                                          <div data-dojo-type="dijit/layout/ContentPane"
        "$type" : "dijit/layout/ContentPane",  //------\\          data-dojo-props="title: 'Hi'">
        "title" : "Hi",                        \\------//          hi hi
        "content" : "hi hi"	                                  </div>
     }]                                                   </div>
}
</pre>

## How to use

Example with the AMD plugin:
```html
<html>
	<head>
		<link rel="stylesheet" href="path/to/dijit/themes/claro/claro.css">
		<script src="path/to/dojo.js" data-dojo-config="async: 1"></script>
		<script>
			require(['sld/parser!./layouts/myLayout.json'], function(layout) {
				layout.placeAt(document.body);
				layout.startup();
			});
		</script>
	</head>
	<body class="claro"></body>
</html>
```
For more examples see /test

## How to contribute?

* Please, help me with my english! XD
* Create issues, fork the repo and make Push Request
* Evangelize

## Authors
* Rodrigo González @roro89

## TODO

* Improvement the comments
* Create a layout creator tool demo (in another repo)

## Licence

MIT Licence