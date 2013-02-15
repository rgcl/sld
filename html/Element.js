define(['dojo/_base/declare', 'dojo/dom-construct'], function(declare, domConstruct) {

	return declare(null, {

		constructor : function(props) {	
			var domProps = {};
			for(var key in props)
				if(key[0] !== '$' && key !== 'tagName')
					domProps[key] = props[key];
			props.$type && (delete props.$type);
			this.domNode = domConstruct.create(props.tagName, domProps);
			this._children = [];
		},

		addChild : function(element, pos) {
			this._children.push(element);
			element.placeAt(this.domNode, pos || 0);
		},

		placeAt : function(element, pos) {
			domConstruct.place(this.domNode, element, pos || 0);
		},

		set : function() {
			throw new Error("This is just a HTML element, not a complete widget :)");
		},
		
		getChildren: function() {
			return this._children;
		},
		
		startup : function() {			
			for(var i in this._children) {
				this._children[i].startup();
			}
		}
	});

});