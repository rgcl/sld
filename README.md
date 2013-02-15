# Simple Layout Definition

A simple way to define a widgets layout in Ecmascript/JSON.

Dijit is a widget package for creating beautiful RIA, it can work programmatically:
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
		 	Hello world!
		</div>
	</div>
</div>
```

We propose a declarative syntax in ECMAScript / JSON that may be useful to share layouts between development tools:
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

## Specification
Each JSON object has two special attributes:
$type {string}: The module identifier (MID) in AMD context.   
$children {array}: A optional array of objects with the same format

## How to contribute?

## Licence

MIT Licence

