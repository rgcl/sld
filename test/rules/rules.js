define(['dojo/topic', 
	'dojo/store/Memory', 
	'dojox/color/MeanColorModel', 
	'dojo/_base/Color'], function(topic, Memory, MeanColorModel, Color) {

	// For this example
	var i18n = {
		es : {
			pane_1 : 'Panel 1',
			pane_2 : 'Panel 2',
			hello : 'Hola :D'
		}
	};
	var lang = 'es';

	topic.subscribe('app', function(args) {
		console.log('Call ' + args.shift() + ' whith these parameters: ', args);
	});
	
	var dataStore = new Memory({idProperty: "label", data:
	    [
	      { label: "France", sales: 500, profit: 50, region: "EU" },
	      { label: "Germany", sales: 450, profit: 48, region: "EU" },
	      { label: "UK", sales: 700, profit: 60, region: "EU" },
	      { label: "USA", sales: 2000, profit: 250, region: "America" },
	      { label: "Canada", sales: 600, profit: 30, region: "America" },
	      { label: "Brazil", sales: 450, profit: 30, region: "America" },
	      { label: "China", sales: 500, profit: 40, region: "Asia" },
	      { label: "Japan", sales: 900, profit: 100, region: "Asia" }
	    ]});

	return {
		tokens : {
			// You can change the tokens $type and $children
			// so on, any override token is passed as normal member (such as label, style, etc)
			TYPE : '_tipo', // now $type is _tipo
			CHILDREN : '_hijos' // now $children is _hijos
		},
		rules : [{
			// Example rule for translations
			keyPattern : /^(title|label)$/,
			onPreparse : function(key, value) {
				this.value = i18n[lang][value] || value;
			}
		}, {
			// Example rule for emit event to the global event bus
			// (named dojo/topic in dojo)
			keyPattern : 'exec',
			key : 'onClick',
			onPreparse : function(key, value) {
				// this.key = 'onClick'; // this way also is possible
				this.value = function() {
					var args = value.split(' ');
					topic.publish(args.shift(), args);
				}
			}
		}, {
			// Example rule for emit local widget event
			keyPattern : /^on[A-Z]/, // onClick, onChange, onKeyPress, etc
			onPreparse : function(key, value) {
				if ( typeof value !== 'string')
					return;
				// this.value = eval('(' + this.value + ')'); // ojo, oreja, esternón! eval is evil
				var defn = value.match(/^\s*(function\s*\(.*})\s*$/);
				// less evil, but also evil
				defn = (defn && defn[1]) || 'function(){}';
				this.value = eval('(' + defn + ')');
			}
		}, {
			// Example for members that will be deleted
			keyPattern : 'comment',
			onPreparse : function(key, value) {
				console.log('New comment', value);
				// if true, then this member will be deleted (omitted)
				this.disabled = true;				
			}
		}, {
			// Example for the treeMap store
			keyPattern : 'treeMap.store',
			key : 'store',
			value : dataStore
		}, {
			// // Example for the treeMap color
			keyPattern : 'treeMap.colorModel',
			value : new MeanColorModel(new Color(Color.named.red), new Color(Color.named.green))
		}]
	}
});
