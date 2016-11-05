'use strict';
var gulp = require('gulp');
var guppy = require('git-guppy')(gulp);
var runSequence = require('run-sequence');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var stylish_lint_reporter = require('jshint-stylish');
var env = require('gulp-env');
var nconf = require('nconf');

nconf.argv({
  f: {
    alias: 'function',
    describe: 'Function name',
    demand: false,
    default : ''
  }
});

gulp.task('test', function() {
    const envs = env.set({
        stage: 'test',
        NODE_ENV: 'test'
    });
    
    const target = `lambda_functions/${nconf.get('f') ? nconf.get('f') + '/' : ''}**/*.test.js`;

    return gulp.src( [ target, 'lib/**/*.test.js'], { read : false } )
        .pipe(envs)
        .pipe(mocha({ timeout: 5000 }));
});

gulp.task('lint', function() {

  const target = `lambda_functions/${nconf.get('f') ? nconf.get('f') + '/' : ''}**/*.js`;

  return gulp.src([
    './lambda_functions/**/*.js',
  	'./handler.js',
    target,
    './lib/**/*.js',
    './gulpfile.js',
    './test/**/*.js',
    'package.json',
    './config/**/*.json'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish_lint_reporter))
    .pipe(jshint.reporter('gulp-jshint-html-reporter', {
      filename: __dirname + '/jshint.html',
      createMissingFolders : false  
    }))
    .pipe(jshint.reporter('fail'));
});

/* git-hook tasks - Search "guppy-hook" on npm to find all guppy-hook packages. */
//dependant on guppy-pre-commit package
gulp.task('pre-commit', function() {
  return runSequence('test', 'lint');
});
