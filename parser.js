/*
 Copyright (c) 2013, Sapienlab All Rights Reserved.
 Available via Academic Free License >= 2.1 OR the modified BSD license (same licenses of Dojo).
 see: http://dojotoolkit.org/license for details
 */

define(['dojo/_base/declare', 'dojo/request/xhr', 'dojo/Deferred', 'dojo/json'], function(declare, xhr, Deferred, JSON) {

	var parse = function(sld, options) {
		// summary:
		//			Parse the given SLD
		// sld : Object|string
		// 			A SLD node as JSON
		// options : Object
		//

		sld = typeof sld === 'string' ? JSON.parse(sld, true) : sld;
		options = options || {};
		options.tokens = options.tokens || {};

		var TOKEN_TYPE = options.tokens.TYPE || '$type';
		var TOKEN_CHILDREN = options.tokens.CHILDREN || '$children';
		var _require = options.require || require;
		var rules = options.rules || [];

		// root: Object
		//		Represent the root of the widget tree
		var root = {};

		// The iteration index
		var i = 0;

		// missing: Array
		//		Buffer of SLD nodes upcoming to instantiate
		var missing = [sld];

		// created: Array
		//		Array of created widgets
		var created = [];

		var deferred = new Deferred();

		// Call to the recursive function asynchronously
		setTimeout(function() {
			_recursive(_require, deferred, created, missing, TOKEN_TYPE, TOKEN_CHILDREN, rules, root, i);
		}, 0);

		// root
		return deferred.promise;
	};

	var _recursive = function(require, deferred, created, missing, TOKEN_TYPE, TOKEN_CHILDREN, rules, root, i) {
		// summary :
		//			A function that is called by this.parse. walks on each node of the SLD
		// deferred: Deferred
		// options : Object
		// root : Object
		// missing : Array
		//
		// tags : protected

		// If the missing buffer is empty, then stop
		if (!missing.length) {
			deferred.resolve(root);
			return;
		}

		// The SLD for this recursion
		var sld = missing.shift();

		// The parent widget
		var widgetParent = created[sld.$__parentCreatedIndex];
		delete sld.$__parentCreatedIndex;

		// The index of this widget in their parent
		var widgetParentIndex = sld.$__parentIndex;
		delete sld.$__parentIndex;

		// The type of widget
		var widgetType = sld[TOKEN_TYPE];
		delete sld[TOKEN_TYPE];

		var widgetChildren = sld[TOKEN_CHILDREN];
		delete sld[TOKEN_CHILDREN];

		// The children of this widget
		if (widgetChildren) {
			for (var j = 0, length = widgetChildren.length; j < length; j++) {
				widgetChildren[j].$__parentCreatedIndex = i;
				widgetChildren[j].$__parentIndex = j;
				missing.push(widgetChildren[j]);
			}
		}

		// Find the children of this widget that is implicit
		forEachKeyInSld:
		for (var key in sld) {

			if (!sld.hasOwnProperty(key))
				continue forEachKeyInSld;

			// Applies the rules for each pair key:value
			forEachJInRules:
			for (var k in rules) {
				var rule = rules[k];
				// If matches for a rule
				if ((rule.keyPattern instanceof RegExp && rule.keyPattern.test(key)) || rule.keyPattern === key) {
					// If must execute a handler
					rule.onPreparse && rule.onPreparse(key, sld[key]);
					// If this node must be deleted
					if (rule.disabled) {
						delete sld[key];
						continue forEachKeyInSld;
					}
					// if rule has key member
					if (rule.key !== undefined) {
						sld[rule.key] = sld[key];
						delete sld[key];
						key = rule.key;
					}
					// If rule has value member
					if (rule.value !== undefined) {
						sld[key] = rule.value;
					}
				}
			}

			// If has a implicit children
			if (sld[key][TOKEN_TYPE]) {
				var implicitSld = sld[key];
				delete sld[key];
				implicitSld.$__parentIndex = key;
				implicitSld.$__parentCreatedIndex = i;
				missing.push(implicitSld);
			}
		}

		// Instantiate the SLD widget
		if ( typeof widgetType === 'string') {// is MID
			require([widgetType], function(Type) {
				try {
					var widget = new Type(sld);
					_associateWithParent(require, deferred, created, missing, TOKEN_TYPE, TOKEN_CHILDREN, rules, root, i, sld, widget, widgetParent, widgetParentIndex);
				} catch(e) {
					deferred.reject(e);
				}
			});
		} else if ( widgetType instanceof Array) {

			var types = [], requires = [], requiresIndex = [];

			for (var i in widgetType) {
				if ( typeof widgetType[i] === 'string') {
					requires.push(widgetType[i]);
					requiresIndex.push(i);
				} else// is constructor
					types[i] = widgetType[i];
			}

			require(requires, function() {
				for (var i in arguments) {
					types[requiresIndex[i]] = arguments[i]
				}
				try {
					var widget = new declare(types)(sld);
					_associateWithParent(require, deferred, created, missing, TOKEN_TYPE, TOKEN_CHILDREN, rules, root, i, sld, widget, widgetParent, widgetParentIndex);
				} catch(e) {
					deferred.reject(e);
				}

			});

		} else {// is constructor
			try {
				var widget = new widgetType(sld);
				_associateWithParent(require, deferred, created, missing, TOKEN_TYPE, TOKEN_CHILDREN, rules, root, i, sld, widget, widgetParent, widgetParentIndex);
			} catch(e) {
				deferred.reject(e);
			}
		}
	};

	var _associateWithParent = function(require, deferred, created, missing, TOKEN_TYPE, TOKEN_CHILDREN, rules, root, i, sld, widget, widgetParent, widgetParentIndex) {

		// Save the created widget
		created[i] = widget;

		// Associate the widget with their parent
		if ( typeof widgetParent === 'undefined')
			root = widget;
		else if ( typeof widgetParentIndex === 'string')
			widgetParent.set(widgetParentIndex, widget);
		else if ( typeof widgetParentIndex === 'number')
			widgetParent.addChild(widget, widgetParentIndex);
		else
			deferred.rejected(new Error("Illegal argument error"));

		// notify the progress
		deferred.progress({
			sld : sld,
			widget : widget,
			i : i
		});

		_recursive(require, deferred, created, missing, TOKEN_TYPE, TOKEN_CHILDREN, rules, root, ++i);

	};

	return {

		parse : parse,

		load : function(id, require, callback) {
			var modulProps = id.split(',');
			var modul = modulProps[0];
			var props = modulProps[1] ? JSON.parse(modulProps[1]) : {};
			require(['dojo/text!' + modul], function(sld) {
				parse(sld, props).then(callback);
			});
		},

		forEach : function(sld, iterator) {
			var i = -1;
			return (function recursiveForEach(sld) {
				if (!sld)
					return;
				if (!sld.$type) {
					if (!( sld instanceof Array))
						return
				} else
					iterator(sld, ++i);

				for (var key in sld)recursiveForEach(sld[key]);
			})(sld);
		},

		count : function(props) {
			var count;
			this.forEach(function(item, i) {
				count = i;
			});
			return count;
		},

		listDependences : function(sld, toObject) {

			var dependencesMap = {};

			this.forEach(sld, function(item) {
				if ( typeof item.$type === 'string') {
					dependencesMap[item.$type] = true;
				} else if (item.$type instanceof Array) {
					for (var i in item.$type) {
						dependencesMap[item.$type[i]] = true;
					}
				}
			});

			if (toObject)
				return dependencesMap;

			var dependenceArray = [];
			for (var key in dependencesMap) {
				dependenceArray.push(dependencesMap[key]);
			}

			return dependenceArray;
		}
	}
});
