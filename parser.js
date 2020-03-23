/*
The MIT License (MIT)
Copyright (c) 2013-2020 Rodrigo González Castillo <r.gnzlz.cstll@gmail.com>
 */
'use strict';
define(['dojo/_base/declare', 'dojo/request/xhr', 'dojo/Deferred', 'dojo/on', 'dojo/_base/lang'],
	function(declare, xhr, Deferred, on, lang) {

	/**
	 * Parse the given SLD and return the root widget within their children recursively.
	 * @param sld
	 * @param options
	 * @param options.tokens.TYPE default to '$type'
	 * @param options.tokens.CHILDREN default to '$children'
	 * @param options.tokens.REQUIRE default to '$require'
	 * @param options.tokens.REF default to '$ref'
	 * @param options.tokens.ON default to '$on'
	 * @param options.tokens.I18N default to '$i18n'
	 * @param options.rules array of rules
	 * @param options.typeAliasMap a object for the alias of the types alias=>type, as key=alias and value=type
	 * @param options.hydrateObject a object with members to call with the $on directive, and $ref
	 * @param options.i18n
	 * @returns {*}
	 */
	function parse(sld, options) {

		sld = typeof sld === 'string' ? JSON.parse(sld) : sld;
		options = options || {};
		options.tokens = options.tokens || {};
		options.typeAliasMap = options.typeAliasMap || {};
		options.rules = options.rules || [];
		options.i18n = options.i18n || {};

		var TOKEN_TYPE = options.tokens.TYPE || '$type';
		var TOKEN_CHILDREN = options.tokens.CHILDREN || '$children';
		var TOKEN_REQUIRE = options.tokens.REQUIRE || '$require';
		var TOKEN_REF = options.tokens.REF || '$ref';
		var TOKEN_ON = options.tokens.ON || '$on';
		var TOKEN_I18N = options.tokens.I18N || '$i18n';

		var deferred = new Deferred();

		// Call to the recursive function asynchronously
		setTimeout(function() {
			recursiveParse(deferred, [], [sld], {}, 0);
		}, 0);

		function recursiveParse(deferred, created, missing, root, i) {

			if (!missing.length) {
				deferred.resolve(root);
				return;
			}

			// The SLD for this recursion
			var sld = missing.shift();

			// The parent widget
			var widgetParent = created[sld.$__parentCreatedIndex];
			sld.$__parentCreatedIndex = null;

			// The index of this widget in their parent
			var widgetParentIndex = sld.$__parentIndex;
			sld.$__parentIndex = null;

			var widgetRequire = sld[TOKEN_REQUIRE];
			if(widgetRequire) {
				sld[TOKEN_REQUIRE] = null;
				require(['dojo/text!' + widgetRequire], function(sldRequired) {
					parse(sldRequired, options).then(function(widget) {
						associateWithParent(deferred, created, missing, root, i, sld, widget, eventsMap, widgetParent,
							widgetParentIndex);
					}, deferred.reject, deferred.progress);
				});
				return;
			} else {

				var widgetType = sld[TOKEN_TYPE];
				if(widgetType in options.typeAliasMap) {
					widgetType = options.typeAliasMap[widgetType];
				}
				sld[TOKEN_TYPE] = null;

				var widgetChildren = sld[TOKEN_CHILDREN];

				var widget = null;

				// The children of this widget
				if(widgetChildren) {
					sld[TOKEN_CHILDREN] = null;
					for (var j = 0, length = widgetChildren.length; j < length; j++) {
						widgetChildren[j].$__parentCreatedIndex = i;
						widgetChildren[j].$__parentIndex = j;
						missing.push(widgetChildren[j]);
					}
				}

			}

			// Find the children of this widget that is implicit
			var eventsMap = {};
			forEachKeyInSld:
				for(var key in sld) {

					if (!sld.hasOwnProperty(key))
						continue forEachKeyInSld;

					if(options.hydrateObject) {
						var keyParts = key.split(':');
						if(keyParts[0] === TOKEN_ON) {
							eventsMap[keyParts[1]] = sld[key]
						}
						if(options.i18n) {
							if(keyParts[0] === TOKEN_I18N) {
								sld[keyParts[1]] = options.i18n[sld[key]] || sld[key];
								sld[key] = null;
							}
						}
					}

					// Applies the rules for each pair key:value
					forEachJInRules:
						for (var k in options.rules) {
							var rule = options.rules[k];
							// If matches for a rule
							if ((rule.keyPattern instanceof RegExp && rule.keyPattern.test(key)) || rule.keyPattern === key) {
								// If must execute a handler
								rule.onPreparse && rule.onPreparse(key, sld[key]);
								// If this node must be deleted
								if (rule.disabled) {
									sld[key] = null; // previously this used `delete sld[key]`
									continue forEachKeyInSld;
								}

								// if rule has key member
								if (rule.key !== undefined) {
									sld[rule.key] = sld[key];
									sld[key] = null;
									key = rule.key;
								}
								// If rule has value member
								if (rule.value !== undefined) {
									sld[key] = rule.value;
								}
							}
						}

					// If has a implicit children
					if (sld[key] && (sld[key][TOKEN_TYPE] || sld[key][TOKEN_REQUIRE])) {
						var implicitSld = sld[key];
						sld[key] = null;
						implicitSld.$__parentIndex = key;
						implicitSld.$__parentCreatedIndex = i;
						missing.push(implicitSld);
					}
				}

			// Instantiate the SLD widget
			if (typeof widgetType === 'string') {// is MID
				require([widgetType], function(Type) {
					try {
						var widget = new Type(sld);
						associateWithParent(deferred, created, missing, root, i, sld, widget, eventsMap,
							widgetParent, widgetParentIndex);
					} catch(e) {
						deferred.reject(e);
					}
				});
			} else if ( widgetType instanceof Array) {

				var types = [], requires = [], requiresIndex = [];

				for (var j in widgetType) {
					if ( typeof widgetType[j] === 'string') {
						requires.push(widgetType[j]);
						requiresIndex.push(j);
					} else// is constructor
						types[j] = widgetType[j];
				}

				require(requires, function() {
					for (var j in arguments) {
						types[requiresIndex[j]] = arguments[j]
					}
					try {
						var widget = new declare(types)(sld);
						associateWithParent(deferred, created, missing, root, i, sld, widget, eventsMap,
							widgetParent, widgetParentIndex);
					} catch(e) {
						deferred.reject(e);
					}

				});

			} else {// is constructor
				try {
					var widget = new widgetType(sld);
					associateWithParent(deferred, created, missing, root, i, sld, widget, eventsMap,
						widgetParent, widgetParentIndex);
				} catch(e) {
					deferred.reject(e);
				}
			}
		} // end recursive

		function associateWithParent(deferred, created, missing, root, i,
									 sld, widget, eventsMap, widgetParent, widgetParentIndex) {

			// Save the created widget
			created[i] = widget;

			// Associate the widget with their parent
			if(typeof widgetParent === 'undefined')
				root = widget;
			else if(typeof widgetParentIndex === 'string')
				widgetParent.set(widgetParentIndex, widget);
			else if(typeof widgetParentIndex === 'number')
				widgetParent.addChild(widget, widgetParentIndex);
			else
				deferred.reject(new Error("Invalid widget parent association: Index must to be a string or a number, " +
					"and not " + typeof(widgetParentIndex)));

			if(options.hydrateObject) {
				// Hydrate the object for anchor $ref
				if(sld[TOKEN_REF]) {
					if(!options.hydrateObject.$ref) {
						options.hydrateObject.$ref = {}
					}
					options.hydrateObject.$ref[sld[TOKEN_REF]] = widget;
				}
				// Hydrate the object for events $on:*
				for(var eventKey in eventsMap) {
					if(eventsMap.hasOwnProperty(eventKey)) {
						console.log(eventsMap, eventKey)
						if(!(eventsMap[eventKey] in options.hydrateObject)) {
							return deferred.reject('Error in SLD parser: ' + eventsMap[eventKey]
								+ ' method is not in hydrateObject for widget id=' + widget.id);
						}
						on(
							widget,
							eventKey,
							lang.hitch(options.hydrateObject, options.hydrateObject[eventsMap[eventKey]])
						);
					}
				}

			}

			// notify the progress
			deferred.progress({
				sld : sld,
				widget : widget,
				i : i
			});

			recursiveParse(deferred, created, missing, root, ++i);
		} // end associateWithParent

		// root
		return deferred.promise;

	}

	return {

		parse : parse,

		load : function load(id, require, callback) {
			var modulProps = id.split(',');
			var modul = modulProps[0];
			var props = modulProps[1] ? JSON.parse(modulProps[1]) : {};
			require(['dojo/text!' + modul], function(sld) {
				parse(sld, props).then(callback);
			});
		},

		forEach : function forEach(sld, iterator) {
			var i = -1;
			return (function recursiveForEach(sld) {
				if (!sld)
					return;
				if (!sld.$type) {
					if (!(sld instanceof Array))
						return;
				} else
					iterator(sld, ++i);

				for (var key in sld) {
					if(sld.hasOwnProperty(key)) {
						if(sld[key] && sld[key].$type) {
							recursiveForEach(sld[key].$type);
						}
						recursiveForEach(sld[key]);
					}
				}
			})(sld);
		},

		count : function() {
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

			if(Object.keys)
				return Object.keys(dependencesMap);
			
			var dependenceArray = [];
			for (var key in dependencesMap) {
				dependenceArray.push(key);
			}

			return dependenceArray;
		}
	}
});
