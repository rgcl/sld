/*
The MIT License (MIT)
Copyright (c) 2013-2020 Rodrigo González Castillo <r.gnzlz.cstll@gmail.com>
 */
var miniExcludes = {
		"sld/index.html": 1,
		"sld/README.md": 1,
		"sld/package": 1
	},
	isTestRe = /\/test\//;

var profile = {
	resourceTags: {
		test: function(filename, mid) {
			return isTestRe.test(filename);
		},

		miniExclude: function(filename, mid){
			return isTestRe.test(filename) || mid in miniExcludes;
		},

		amd: function(filename, mid){
			return /\.js$/.test(filename);
		}
	}
};