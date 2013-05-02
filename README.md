# Simple Layout Definition
A simple way to define layout of widgets in JSON/Ecmascript.

## Introduction
**SLD** is a proposed specification for describe a layout of [amd][AMD]-widgets in JSON.
This library is a parser for that specification.

This was originally intended to [dojo][Dojo Toolkit] widgets ([dijit][dijit], some [dojox][dojox], 
[dgrid][dgrid], [cbtree][cbtree], etc), but is not limited to them.

###Explain with Dijit

[dijit][Dijit] is a widget package for creating a beautiful RIA, it can work programmatically:
```javascript
require(['dijit/layout/TabContainer', 'dijit/layout/ContentPane', 'dijit/form/Button', 'dojo/domReady!'],
function(TabContainer, ContentPane, Button) {
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
     
});
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

**SLD** library propose a declarative syntax in ECMAScript/JSON that may be useful to share layouts between development tools:

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

This library contain a parser for the SLD specification

```javascript
require(['sld/parser', 'dojo/domReady!'], function(parser) {

  parser.parse({
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
  }).them(function(layout) {
  	layout.placeAt(document.body); // Attach the layout in the body
  });
});
```

## Installation

**SLD** API can be installed via [cpm][cpm], or [volo][volo], or simply [downloaded][download].

Via cpm:

```bash
$ cpm install sld
```

Via volo:

```bash
$ volo add sapienlab/sld
```

## SLD Specification

See [SLD 1.0 S](wiki/SLD 1.0 Specifications Draft)

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

## API

### Module: sld/parser

#### parser.parse(sld, rules)

**Parameters:**
* sld {Object} a SLD tree node.
* rules [{Object}] a optional object that (if exists) contain this attributes:
	* tokens [{Object}] a optional object of tokens:
		* TYPE {string} the token for the $type word.
		* CHILDREN {string} the token for the $children word.
	* require [{function}] a optional reference for the AMD require. 
	* rules [{Array}] a optional array of rules. A rule is a Object that contain this attibutes:
		* keyPattern {RegExp|string} a pattern for some key. Indicates that this rule applies to this attribute if it matches their key. 
		Example, is keyPattern is /^on/, then onClick, onMouseOver, etc. use this rule. Other are ignored.
		* key [{string}] a optional value. If exists, then the key of the attribute is changed by it.
		* value [{mixted}] a optional value. If exists, the the value of the attribute is changed by it.
		* disabled [{boolean=false}] if true, then this attribute is ignored.
		* onPreparse [{function}] if exists, the is called before the node is parsed.
		
*See sld/test/rules for example of rules.* 
  
**Return:** {dojo/promise} a [promise](http://dojotoolkit.org/documentation/tutorials/1.8/promises/) that is resolve when the SLD is instantiate. 
The parameter of the callback is the instantiate widget.

#### parser.count(sld)

**Parameters:**
* sld {Object} a SLD tree node.

**Return:** {number} the number of the future widgets in the SLD.

#### parser.listDepencendes(sld, toObject)

**Parameters:**
* sld {Object} a SLD tree node.
* toObject [{boolean=false}] if true then return a Object that contain the dependences as key and the true as values.

**Return:** {Array|Object} if toObject is false, then return a array with the MIDs (Module Identifier {string}) of all widgets in the SLD (no repeat),
else return a Object.

### Module: sld/Parser
Contain the same of sld/parser, but in OOP.

## How to contribute?

* I'm not a native English speaker, so create a issue or better a pull request for all of my grammatical errors :)
As well, if you have a code issue or suggestion, create a issue, Thanks!

##Releases
<table style="width:100%">
  <thead>
	  <tr>
	  <th style="width:15%;">Version</th>
	  <th style="width:15%;">Date</th>
	  <th style="width:10%;">Dependences</th>
	  <th>Description</th>
	</tr>
  </thead>
  <tbody>	
    <tr style="vertical-align:top">
      <td>sld-0.1.0</td>
      <td>May 2, 2013</td>
      <td>1.8</td>
      <td>
		Mixin support added.<br/>
		Rules support added.<br/>
		Preloaded widget support added.<br/>
		New test added.<br/>
		Parser now has asynchronous behavior.<br/>		
		Updated documentation.<br/>
      <td>
    </tr>
    <tr style="vertical-align:top">
      <td><a href="https://sourceforge.net/projects/sld-lib/files/latest/download">sld-0.0.0</a></td>
      <td>Feb 20, 2013</td>
      <td>Dojo 1.8</td>
      <td>Initial SLD release</td>
    </tr>
  </tbody>
</table>

## Licence

The MIT License (MIT)
Copyright (c) 2013 Rodrigo González, Sapienlab

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[dojo]: http://www.dojotoolkit.org 
[amd]: https://github.com/amdjs/amdjs-api/wiki/AMD
[cpm]: https://github.org/kriszyp/cpm
[download]: https://github.com/sapienlab/sld/archive/master.zip
[volo]: http://volojs.org/