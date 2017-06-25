const gulp = require('gulp');
const multiDest = require('gulp-multi-dest');
const shell = require('gulp-shell');
const gulpSequence = require('gulp-sequence');
const jasmine = require('gulp-jasmine');

gulp.task('copy common services', function () {
    let destOptions = {
        mode: 0755
    };
    gulp.src(['!./commonServices/tests/**', './commonServices/**'])
        .pipe(multiDest(['./commonCommands/commonServices', './transactionCommands/commonServices', './userGroupCommands/commonServices'], destOptions))
});

// Deploy each service
gulp.task('Deploy common service commands', shell.task([
    '"../node_modules/.bin/serverless" deploy -v'
], { cwd: './commonCommands' }));

gulp.task('Deploy user and group service commands', shell.task([
    '"../node_modules/.bin/serverless" deploy -v'
], { cwd: './userGroupCommands' }));

gulp.task('Deploy transaction commands', shell.task([
    '"../node_modules/.bin/serverless" deploy -v'
], { cwd: './transactionCommands' }));

// // Add the Testing capabilities for all the services
// gulp.task('Test Common Services', function () {
//     return gulp.src(['./commonServices/tests/**/test*.js'])
//         .pipe(jasmineNode({ verbose: true }))
//         .on('error', function (error) {
//             console.log(error.message);
//             this.emit('end');
//         });
// });

// Expose the development tasks
// gulp.task('Test Services', ['copy common services'], shell.task([
//     '"./node_modules/.bin/jasmine-node" commonCommands/ commonServices/ userGroupCommands/ transactionCommands/ --color --verbose --junitreport --output reports'
// ], { cwd: '.' }));

gulp.task('test_common_services', ['copy common services'], function () {
    return gulp.src(['commonCommands/tests/**/*.js'])
        .pipe(jasmine({ verbose: true, includeStackTrace: true }));
});

gulp.task('Test Services', ['copy common services'], function () {
    return gulp.src(['commonCommands/tests/**/*.js', 'commonServices/tests/**/*.js', 'userGroupCommands/tests/**/*.js', 'transactionCommands/tests/**/*.js'])
        .pipe(jasmine({ verbose: true, includeStackTrace: true }));
});

gulp.task('test-watch', function () {
    gulp.watch(['commonCommands/**/*.js', 'commonServices/**/*.js', 'userGroupCommands/**/*.js', 'transactionCommands/**/*.js'], ['Test Services']);
});
gulp.task('test-all', ['Test Services']);
gulp.task('default', ['copy common services']);
gulp.task('deploy-all', gulpSequence(['copy common services', 'Deploy common service commands', 'Deploy user and group service commands', 'Deploy transaction commands']));