module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-bg-shell');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Project configuration.
    grunt.initConfig({
        bgShell: {
            supervisor: {
                cmd: 'supervisor -i ./public app.js',
                stdout: true,
                stderr: true,
                bg: true
            }
        },
        watch: {
            files: [
               //add here static file which need to be livereloaded
               'public/**/*'
               , '!public/**/*.css'
               , 'views/**/*.jade'
               , 'views/**/*.styl'
            ],
            options: {
                livereload: true
            }
        }
    });

    grunt.registerTask('default', ['bgShell:supervisor', 'watch']);
};
