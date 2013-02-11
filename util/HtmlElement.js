define(['dojo/_base/declare', 'dojo/dom-construct'], function(declare, domConstruct) {
	
	return declare(null, {
		
		constructor: function(props) {
			this.domNode = domConstruct(props.element, props);
		},
		
		addChild : function(element, pos) {
			element.place()
		}
		
	});
	
});
