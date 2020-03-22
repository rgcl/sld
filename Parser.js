/*
The MIT License (MIT)
Copyright (c) 2013-2020 Rodrigo González Castillo <r.gnzlz.cstll@gmail.com>
 */
define(['dojo/_base/declare', // declare
	'dojo/Stateful', // Stateful
	'dojo/_base/lang', // lang 
	'./parser' // parser
	], function(declare, Stateful, lang, parser) {

	return declare(Stateful, {

		/**
		 * 
 		 * @param [{Object}] sld
		 */
		constructor : function(sld) {
			this._sld = sld || {};
			this._parsed = null;
			this._counted = null;
			this._dependences = null;
		},

		parse : function(options) {
			if (!this._parsed)
				this._parsed = parser.parse(this._sld, options || {});
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
