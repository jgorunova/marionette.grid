/*
  marionette.grid
  http://github.com/jgorunova/marionette.grid

*/

// jshint globalstrict:true, node:true

"use strict";

module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        clean: {
            options: {
                force: true
            },
            docs: [
                "docs/**/*"
            ],
            dist: [
                "dist/*.js",
                "dist/*.css"
            ],
            default: [
                "docs/**/*",
                "dist/*.js",
                "dist/*.css"
            ]
        },

        concat: {
            'marionette.grid': {
                options: {
                    banner: '/*!\n  <%= pkg.name %> <%= pkg.version %>\n' +
                        '  <%= pkg.repository.url %>\n\n' +
                        '  Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                        '  Licensed under the MIT license.\n' +
                        '*/\n\n' +
                        '(function (root, factory) {\n\n' +
                        '  if (typeof define === "function" && define.amd) {\n' +
                        '    // AMD (+ global for extensions)\n' +
                        '    define(["underscore", "backbone", "backbone.marionette"], function (_, Backbone, Marionette) {\n' +
                        '      return (root.MaGrid = factory(_, Backbone, Marionette));\n' +
                        '    });\n' +
                        '  } else if (typeof exports === "object") {\n' +
                        '    // CommonJS\n' +
                        '    var Backbone = require("backbone");\n' +
                        '    Backbone.$ = Backbone.$ || require("jquery");\n' +
                        '    var Marionette = require("backbone.marionette");\n' +
                        '    module.exports = factory(require("underscore"), Backbone, Marionette);\n' +
                        '  } else {\n' +
                        '    // Browser\n' +
                        '    root.MaGrid = factory(root._, root.Backbone, root.Marionette);\n' +
                        '  }' +
                        '}(this, function (_, Backbone, Marionette) {\n\n  "use strict";\n\n',
                    footer: '  return MaGrid;\n' +
                        '}));'
                },
                src: [
                    "src/js/init.js",
                    "src/js/paginator.js",
                    "src/js/body.js",
                    "src/js/header.js",
                    "src/js/grid.js"
                ],
                dest: "dist/marionette.grid.js"
            }
        },

        connect: {
            server: {
                options: {
                    keepalive: true
                }
            }
        },

        jasmine: {
            test: {
                version: "1.3.1",
                src: [
                    "dist/marionette.grid.js",
                ],
                options: {
                    specs: [
                        "test/grid.js"
                    ],
                    template: require("grunt-template-jasmine-istanbul"),
                    templateOptions: {
                        coverage: "test/coverage/coverage.json",
                        report: {
                            type: "html",
                            options: {
                                dir: "test/coverage"
                            }
                        }
                    },
                    helpers: "vendor/js/jasmine-html.js",
                    vendor: [
                        "test/vendor/js/jquery.js",
                        "test/vendor/js/underscore.js",
                        "test/vendor/js/backbone.js",
                        "test/vendor/js/backbone-pageable.js",
                        "test/vendor/js/backbone.marionette.js"
                    ]
                }
            }
        },

        recess: {
            csslint: {
                options: {
                    compile: true
                },
                files: {
                    "dist/marionette.grid.css": ["src/css/marionette.grid.css"]
                }
            },
            default: {
                options: {
                    compress: true
                },
                files: {
                    "dist/marionette.grid.min.css": ["src/css/marionette.grid.css"]
                }
            }
        },

        uglify: {
            options: {
                mangle: true,
                compress: {},
                preserveComments: "some"
            },
            default: {
                files: {
                    "dist/marionette.grid.min.js": ["dist/marionette.grid.js"]
                }
            }
        },

        watch: {
            default: {
                files: ["src/**/*.*"],
                tasks: ["dist"]
            }
        },
        jsdoc: {
            dist: {
                src: ['src/js/*.js', 'README.md'],
                options: {
                    "destination": "docs/",
                    "encoding": "utf8",
                    "private": true,
                    "recurse": true,
                    "template": "./node_modules/minami"
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-recess");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask("doc", ["clean:docs", "jsdoc"]);
    grunt.registerTask("dist", ["concat", "uglify", "recess"]);
    grunt.registerTask("test", ["concat", "jasmine"]);
    grunt.registerTask("default", ["clean", "doc", "dist", "jasmine"]);
};
