define(['dojo/Deferred', 'dojo/request/xhr'], function(Deferred, xhr) {

	var parse = function(actual, update) {

		var deferred = new Deferred();

		// root: Object
		//		Represent the root of the widget tree
		var root = {};

		var i = 0;

		// missing: Array
		//		Array of object definitions upcoming to instantiate
		var missing = [actual];

		recursive(deferred, update, i, root, missing);

		// root
		return deferred.promise;
	};

	var recursive = function(deferred, update, i, root, missing) {

		if (!missing.length) {
			deferred.resolve(root);
			return;
		}

		var actual = missing.shift();

		var parentWidget = actual.$parent;

		var children = actual.$children;
		delete actual.$children;

		var Type = actual.$type;

		// Instantiate the actual widget
		if ( typeof Type == 'string') {
			require([Type], function(Type) {
				var actualWidget = new Type(actual);
				create(deferred, update, i, root, actual, children, missing, actualWidget, parentWidget);
			});
		} else {
			var actualWidget = new Type(actual);
			create(deferred, update, i, root, actual, children, missing, actualWidget, parentWidget);
		}
	};

	var create = function(deferred, update, i, root, actual, children, missing, actualWidget, parentWidget) {

		if (actual.$_key) {
			if (parentWidget.set)
				parentWidget.set(actual.$_key, actualWidget);
			else
				parentWidget[actual.$_key] = actualWidget;
		} else if (actual.$_i)
			parentWidget.addChild ? parentWidget.addChild(actualWidget, actual.$_i) : parentWidget.appendChild(actualWidget, actual.$_i);
		else
			root = actualWidget;

		// annotate the upcoming object definitions to instantiate
		for (var j in children) {
			children[j].$parent = actualWidget;
			children[j].$_i = j;
			missing.push(children[j]);
		}

		// has popup, dropDown, or similar attribute?
		for (var key in actual) {
			// Si este atributo tiene un miembro type, se asume que es un widget
			if (actual[key].$type && key != "$parent") {
				actual[key].$parent = actualWidget;
				actual[key].$_key = key;
				missing.push(actual[key]);
			}
		}

		update && deferred.progress({
			element : actual,
			i : i
		});

		recursive(deferred, update, ++i, root, missing);

	};

	var count = function(props) {
		// sumary:
		//		Count the elements in the object
		if (!props)
			return 0;
		var i = 1;
		if (!props.$type)
			if ( props instanceof Array)
				i = 0;
			else
				return 0;

		for (var key in props)
		i += count(props[key]);
		return i;
	};

	return {
		parse : parse,
		count : count,
		listDependences : function(props) {

			var dependencesMap = {};

			var recursive = function(props) {
				if (!props)
					return;
				if (!props.$type) {
					if (!( props instanceof Array))
						return
				} else
					dependencesMap[props.$type] = true;

				for (var key in props)recursive(props[key]);
			}
			recursive(props);
			var dependenceArray = [];
			for(var key in dependencesMap) {
				dependenceArray.push(dependencesMap[key]);
			}
			return dependencesMap;
		},
		load : function(id, require, callback) {
			xhr(require.toUrl(id), {
				handleAs : 'json'
			}).then(function(layout) {
				parse(layout).then(callback);
			});
		}
	}
});
