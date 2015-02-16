module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    folders: {
      webapp: {
        root: 'src/main/webapp/resources/',
        build: 'src/main/webapp/.outputResources/'
      }
    },

    banner: '/*!\n * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
      ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n*/\n',

    bower_concat: {
      all: {
        dest: '<%= folders.webapp.build %>script/all-component-script.js',
        cssDest: '<%= folders.webapp.build %>styles/all-component-style.css',
        bowerOptions: {
          relative: false
        }
      }
    },

   copy: {
      resources: {
        expand: true,
        cwd: '<%= folders.webapp.root %>/../resources/angularjs/',
        src: ['**/**/*'],
        dest: '<%= folders.webapp.build %>/angularjs/'
      },
      img: {
        expand: true,
        cwd: '<%= folders.webapp.root %>images/',
        src: ['**/**/*'],
        dest: '<%= folders.webapp.build %>images/'
      },
      fonts: {
        expand: true,
        flatten: true,
        src: [ 'bower_components/components-font-awesome/fonts/**/*','bower_components/bootstrap/dist/fonts/**/*','<%= folders.webapp.root %>font/**/*'],
        dest: '<%= folders.webapp.build %>/fonts/'
      }      
    },
    
    concat: {
        js: {
          src: [ '<%= folders.webapp.build %>angularjs/common/app/app.js', '<%= folders.webapp.build %>angularjs/common/**/*.js' ],
          dest: '<%= folders.webapp.build %>angularjs/common/common-app.js'
        },
        css:{
          src: [ '<%= folders.webapp.root %>styles/**/*.css' ],
          dest: '<%= folders.webapp.build %>styles/style.css'
        }
      },
      
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      js: {
        src: '<%= concat.js.dest %>',
        dest: '<%= folders.webapp.build %>angularjs/common/common-app.min.js'
      }
    },
    
    jshint: {
        options: {
          curly:    false,
          eqeqeq:   true,
          immed:    true,
          latedef:  false,
          newcap:   true,
          noarg:    true,
          sub:      true,
          undef:    false,
          unused:   true,
          boss:     true,
          eqnull:   true,
          browser:  true,
          globals: {
            jQuery: true
          }
        },
        all: ['Gruntfile.js', '<%= folders.webapp.root %>angularjs/**/*.js']
      },
    qunit: {
      files: ['test/**/*.html']
    },
    watch: {
      js: {
        files: '<%= jshint.all %>',
        tasks: ['concat:js']
      },
      templates: {
        files: ['<%= folders.webapp.root %>/index.html', '<%= folders.webapp.root %>templates/**/*.html'],
        tasks: [ 'copy:resources' ]
      },
      css: {
        files: '<%= folders.webapp.root %>/styles/**/*.css',
        tasks: [ 'concat:css' ]
      }

    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bower-concat');

  grunt.registerTask('default', ['bower_concat', 'copy', 'concat', 'uglify']);

};
