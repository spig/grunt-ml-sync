# grunt-ml-sync

> Grunt plugin to sync with MarkLogic database via a REST endpoint

## Getting Started
This plugin was created using Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-ml-sync --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-ml-sync');
```

## The "ml_sync" task

### Overview
In your project's Gruntfile, add a section named `ml_sync` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  ml_sync: {
    your_target: {
      // Target-specific file lists and/or options go here.
      user: "username",
      password: "password",
      host: "localhost",
      port: "8000",
      base_path: "/path/to/files/to/sync",
      server_root: "/upload/files/to/this/root/",
      src: "path/to/files/to/match/**"
    },
  },
});
```

### Target Options

#### user
Type: `String`
Default value: `'admin'`

The username of the user having read-write access to the MarkLogic REST server.

#### password
Type: `String`
Default value: `'admin'`

The password of the user having read-write access to the MarkLogic REST server.

#### host
Type: `String`
Default value: `'localhost'`

The host of the MarkLogic REST server.

#### port
Type: `String`
Default value: `'8000'`

The port of the MarkLogic REST server.

#### base_path
Type: `String`
Default value: `'admin'`

The part of the file path that should be ignored when creating the URI of a document to upload.

#### server_root
Type: `String`
Default value: `'admin'`

The root of the REST server where files should be saved. This tends to be the part of the URI that can't be derived from the name or path of the local file.

#### src
Type: `String`
Default value: none

The path of the files to watch or file globbing patterns.

### Usage Examples

#### Example monitoring an entire folder

In this example, a local code folder is being kept in sync with a MarkLogic code repository that is accessible via a REST endpoint.

```js
grunt.initConfig({
  ml_sync: {
      code: {
          src: "folder/to/source/**",
          options: {
              base_path: "folder/to/source",
              server_root: "/code/my-app/"
          }
      }
  }
});
```

#### Example with newer and watch

If you were to monitor an entire code repository that you wanted to keep in sync with a MarkLogic server, using [grunt-newer](https://github.com/tschaub/grunt-newer) would be a good option as this will keep track of only changed files and let the task be more efficient by not uploading every file every time, but allowing the file glob pattern to match all files.

This example watches all files in the folder/to/source for changes, then calls the newer:ml_sync:code task so it will only sync those files that have been updated recently.

```js
grunt.initConfig({
  ml_sync: {
      code: {
          src: "folder/to/source/**"
          options: {
              base_path: "folder/to/source",
              server_root: "/code/my-app/"
          }
      }
  },
  watch: {
      code: {
          files: ["folder/to/source/**"],
          tasks: ["newer:ml_sync:code"]
        }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
