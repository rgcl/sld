define(['dojo/_base/declare', // declare
'dojo/_base/lang', // lang
'dojo/dom-construct' // dom-construct
], function(declare, lang, domConstruct) {

	return declare(null, {

		constructor : function(props) {
			//lang.mixin(this, props);
			var domProps = {};
			for (var key in props) {
				if (key[0] !== '$' && key !== 'tagName')
					domProps[key] = props[key];
			}
			this.domNode = domConstruct.create(props.tagName, domProps);
			this._children = [];
		},

		startup : function() {
			if (this._started)
				return;
			this._started = true;
			for (var i in this._children) {
				this._children[i].startup();
			}
		},

		addChild : function(element, pos) {
			this._children.push(element);
			domConstruct.place(element.domNode || element, this.domNode, pos || 0);			
		},

		placeAt : function(parent, pos) {
			domConstruct.place(this.domNode, parent.domNode || parent, pos || 0);
		},

		getChildren : function() {
			return this._children;
		},

		destroy : function() {
			if (this._destroyed)
				return;
			this._destroyed = true;
			for (var i in this._children) {
				this._children[i].destroy();
			}
			domConstruct.destroy(this.domNode);
		}
	});

});
