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

var cleanPath = function(filePath, localPath) {
    return path.relative(localPath, filePath);
};

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('ml_sync', 'Grunt plugin to sync with MarkLogic database', function() {

      // Force task into async mode and grab a handle to the "done" function
      var done = this.async();

    // create options to pass to marklogic db creation
    var options = this.options({
      user: this.data.user || 'admin',
      password: this.data.password || 'admin',
      port: this.data.port || '8000',
      host: this.data.host || 'localhost',
      base_path: this.data.base_path || "",
      server_root: this.data.server_root || "/"
    });

    // setup marklogic db connection
    var db = marklogic.createDatabaseClient({
        user: options.user,
        password: options.password,
        host: options.host,
        port: options.port
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
            var uri = options.server_root + cleanPath(filepath, options.base_path);
            uploadTasks.push(function(callback){
                db.documents.write([{uri: uri, content: grunt.file.read(filepath)}]).result(
                    function(response) {
                        grunt.log.writeln('Loaded the following documents:');
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
