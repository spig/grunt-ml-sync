/*
 * grunt-ml-sync
 * https://github.com/spig/grunt-ml-sync
 *
 * Copyright (c) 2015 Steve Spigarelli
 * Licensed under the MIT license.
 */

'use strict';

var marklogic = require('marklogic');
var path = require("path");
var async = require('async');

// TODO - test this function with duplicate '//' and such
var cleanPath = function(filePath, serverRoot, localPath) {
    return serverRoot + path.relative(localPath, filePath);
};

var isArray = function(obj) {
    return obj instanceof Array || (obj && Object.prototype.toString.call(obj) === '[object Array]');
};

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('ml_sync', 'Grunt plugin to sync with MarkLogic database', function() {

      // Force task into async mode and grab a handle to the "done" function
      var done = this.async();

      var defaultConfiguration = {
          database: "Documents",
          user: 'admin',
          password: 'admin',
          port: '8000',
          host: 'localhost',
          base_path: "",
          server_root: "/"
      };

      var options = this.data.options;

      var configuration = defaultConfiguration;

      for (var attrname in options) { configuration[attrname] = options[attrname]; }

    // setup marklogic db connection
    var db = marklogic.createDatabaseClient({
        database: configuration.database,
        user: configuration.user,
        password: configuration.password,
        host: configuration.host,
        port: configuration.port
    });

    var uploadTasks = [];

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.map(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else if (grunt.file.isDir(filepath)) {
            // ignore directories
            return false;
        } else {
            var server_roots = [];
            if (isArray(configuration.server_root)) {
                configuration.server_root.forEach(function(server_root) {
                    server_roots.push(server_root);
                });
            } else {
                server_roots.push(configuration.server_root);
            }

            server_roots.forEach(function(server_root) {
                var uri = cleanPath(filepath, server_root, configuration.base_path);
                uploadTasks.push(function(callback){
                    grunt.log.writeln("loading " + filepath + " to " + uri);

                    db.documents.write([{uri: uri, content: grunt.file.read(filepath)}]).result(
                        function(response) {
                            grunt.verbose.writeln('Loaded the following documents:');
                            response.documents.forEach(function(document) {
                                grunt.verbose.writeln(' ' + document.uri);
                            });
                            callback(null, response);
                        },
                        function(error) {
                            callback(error);
                        }
                    );
                });
            });
        }
      });
    });

    async.parallel(uploadTasks, function(err, results) {
        if (err) { return grunt.log.error(err); }

        grunt.verbose.writeln(results);

        // call done so the task completes
        done();
    });

  });

};
