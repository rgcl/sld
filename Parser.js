define(['dojo/_base/declare', // declare 
	'dojo/Stateful', // Stateful
	'dojo/_base/lang', // lang 
	'./parser' // parser
	], function(declare, Stateful, lang, parser) {

	return declare(Stateful, {

		/**
		 * 
 		 * @param [{Object}] args
 		 * @param [{Object}] args.sld
 		 * @param [{Array}] args.rules
		 */
		constructor : function(args) {
			this._sld = args.sld || {};
			this._rules = args.rules || [];
			this._parsed = false;
			this._counted = false;
			this._dependences = false;
		},

		parse : function() {
			if (!this._parsed)
				this._parsed = parser.parse(lang.clone(this._sld), this._rules);
			return this._parsed;
		},

		count : function() {
			if (this._counted === false)
				this._counted = parser.count(this._sld);
			return this._counted;
		},

		listDependences : function(toObject) {
			if (!this._dependences)
				this._dependences = parser.listDependences(this._sld, toObject);
			return this._dependences;
		},
		
		_sldGetter : function() {
			return this._sld;
		},

		_sldSetter : function(sld) {
			this._parsed = false;
			this._counted = false;
			this._dependences = false;
			this._sld = sld;
		},

		_rulesGetter : function() {
			return this._rules;
		},

		_rulesSetter : function(rules) {
			this._rules = rules;
		}
	});

});
