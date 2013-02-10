define(['dojo/_base/declare', './parser'], function(declare, parser) {

	return declare(null, {

		constructor : function(sld) {
			this.sld = sld;
		},

		parse : function() {
			return parser.parse(this.sld);
		},

		count : function() {
			return parser.count(this.sld);
		},

		listDependences : function() {
			return parser.listDependences(this.sld);
		}
	});

});
