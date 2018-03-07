var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');//文件重命名

gulp.task('sass', function() {
    return gulp.src("app/css/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("app/css"))
        .pipe(browserSync.stream());
});

// 监视文件改动并重新载入
gulp.task('dev',function() {
    browserSync.init({
        server: {
            baseDir: 'app'
        }
    });

    gulp.watch(['app/**/*.scss','app/**/*.css'],['sass']);

    var watcher=gulp.watch(['**/*.html', 'src/**/*.js'], {cwd: 'app'}, reload);
    watcher.on('change',function(event){
        //console.log('File'+event.path+' was '+event.type+',running tasks...');
    });
});

//合并库文件
gulp.task("libs",function(){
    gulp.src(["app/libs/jquery/jquery-1.11.2.min.js",
        "app/libs/stats.min.js",
        "app/libs/pixi/pixi-4.5.1.min.js",
        "app/libs/tween/TweenMax.min.js"])
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('app/build'))
        .pipe(rename({suffix:'.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('app/build'));
});

//合并JS文件
gulp.task('minifyjs',function(){
    gulp.src([
        "app/libs/pixi/plugins/pixi-sound.js",
        "app/libs/pixi/plugins/pixi-particles.js",

        "app/src/core/Game.js",
        "app/src/core/Utils.js",
        "app/src/core/EventDispatcher.js",
        "app/src/AssetsManager.js",
        "app/src/scene/Scene.js",
        "app/src/scene/GameScene1.js",
        "app/src/scene/GameScene2.js",
        "app/src/main.js"])  //选择合并的JS
        .pipe(concat('main.js'))   //合并js
        .pipe(gulp.dest('app/build'))   //输出
        .pipe(rename({suffix:'.min'}))     //重命名
        .pipe(uglify())                    //压缩
        .pipe(gulp.dest('app/build'));  //输出
});




