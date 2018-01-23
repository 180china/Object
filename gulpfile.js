var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

gulp.task('sass', function() {
    return gulp.src("app/css/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.stream());
});

// 监视文件改动并重新载入
gulp.task('serve',function() {
    browserSync.init({
        server: {
            baseDir: 'app'
        }
    });

    gulp.watch(['app/css/*.scss','app/css/*.css'],['sass']);

    var watcher=gulp.watch(['*.html', 'src/**/*.js'], {cwd: 'app'}, reload);
    watcher.on('change',function(event){
        //console.log('File'+event.path+' was '+event.type+',running tasks...');
    });
});
