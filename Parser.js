define(['dojo/_base/declare', 'dojo/_base/lang', './parser'], function(declare, lang, parser) {

	return declare(null, {

		constructor : function(sld) {
			this.sld = sld;
		},

		parse : function() {
			return parser.parse(lang.clone(this.sld));
		},

		count : function() {
			return parser.count(this.sld);
		},

		listDependences : function() {
			return parser.listDependences(this.sld);
		}
	});

});
