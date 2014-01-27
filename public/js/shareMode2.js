requirejs.config({
   baseUrl: 'js/lib',
   paths: {
      //paths are relative to baseUrl
      "jquery": [
         "//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js",
         //If CDN fails, load from local file
         "jquery-1.10.2"
      ],
      "hammer": "hammer",
      "socket.io": "/socket.io/socket.io"
   }
});

requirejs(['jquery', 'session'], function($, Session) {
   var sess = new Session();
   sess.emit('connected', { path: window.location.pathname });
   sess.on('hello', function(data) {
      console.log(data.msg);

      $(document).ready(function() {
         var userID = $('#userID');
         userID.text(data.name);
         userID.css({ background: data.color });

         $('.id').text(data.name);

         $('#drop-area div').remove();
         for (var i = 0, len = data.users.length; i < len; i++) {
            var newUserDropArea = $(document.createElement('div'));
            newUserDropArea.addClass('drop');
            newUserDropArea.attr('data-target-id', data.users[i].user);
            newUserDropArea.css({ background: data.users[i].color });

            var newUserText = $(document.createElement('p'));
            newUserText.text(data.users[i].name);
            newUserDropArea.append(newUserText);

            $('#drop-area').append(newUserDropArea);
            var useHeight = (100 / data.users.length) + '%';
            $('#drop-area div').css({ height: useHeight });
         }
      });
   });

//   console.log(Session);
//   console.log(Session.READY);
//   console.log(sess);
//   console.log(sess.foo());
//   console.log(sess.bar);
//   console.log(sess.READY);

   /*
   var socket = io.connect();
   socket.emit('connected', { path: window.location.pathname });
   startHammer($('.drag'));

   function startHammer(elem) {
      for (var i = 0, len = elem.length; i < len; i++) {
         new Hammer(elem[i], { prevent_default: true, no_mouseevents: true });
      }

      // elem.on('touch transformstart', function(ev) {
      elem.on('touch', function(ev) {
         console.log('start ' + ev.originalEvent.type);
         var touches = ev.originalEvent.gesture.touches;
         // console.log(touches);
         for (var t = 0, len = touches.length; t < len; t++) {
            var target = $(touches[t].target);
            $('.drag').css({ zIndex: 5 });
            target.css({ zIndex: 10 });
         }
      });

      elem.on('drag transform', function(ev) {
         var touches = ev.originalEvent.gesture.touches;
         // console.log(touches);
         for (var t = 0, len = touches.length; t < len; t++) {
            var target = $(touches[t].target);

            // $('.drag').css({ zIndex: 0 });

            if (target.hasClass('drag')) {
               target.css({
                  // zIndex: 10,
                  left: touches[t].pageX - target.width() / 2,
                  top: touches[t].pageY - target.height() / 2
               });
            }
         }
      });

      // elem.on('release transformend', function(ev) {
      elem.on('release', function(ev) {
         // console.log('end ' + ev.originalEvent.type);
         var touches = ev.originalEvent.gesture.touches;
         // console.log(touches);
         for (var t = 0, len = touches.length; t < len; t++) {
            var target = $(touches[t].target);
            if (target.hasClass('drag')) {
               var targetCenter = {
                  x: target.offset().left + target.width() / 2,
                  y: target.offset().top + target.height() / 2
               };
               var where;
               var dropAreas = $('#drop-area div');
               for (var i = 0, len = dropAreas.length; i < len
                  && typeof where === 'undefined'; i++) {
                  var drop = $(dropAreas[i]);
                  if (drop.offset().left <= targetCenter.x &&
                     targetCenter.x <= drop.offset().left + drop.width() &&
                     drop.offset().top <= targetCenter.y &&
                     targetCenter.y <= drop.offset().top + drop.height()) {
                     where = drop;
                  }
               }
               if (typeof where !== 'undefined') {
                  sendElement(target, where, targetCenter);
                  target.remove();
               }
            }
         }
      });
   }

   socket.on('hello', function(data) {
      console.log(data.msg);

      $(document).ready(function() {
         var userID = $('#userID');
         userID.text(data.name);
         userID.css({ background: data.color });

         $('.id').text(data.name);

         $('#drop-area div').remove();
         for (var i = 0, len = data.users.length; i < len; i++) {
            var newUserDropArea = $(document.createElement('div'));
            newUserDropArea.addClass('drop');
            newUserDropArea.attr('data-target-id', data.users[i].user);
            newUserDropArea.css({ background: data.users[i].color });

            var newUserText = $(document.createElement('p'));
            newUserText.text(data.users[i].name);
            newUserDropArea.append(newUserText);

            $('#drop-area').append(newUserDropArea);
            var useHeight = (100 / data.users.length) + '%';
            $('#drop-area div').css({ height: useHeight });
         }
      });
   });

   socket.on('new_user', function(data) {
      var newUserDropArea = $(document.createElement('div'));
      newUserDropArea.addClass('drop');
      newUserDropArea.attr('data-target-id', data.user);
      newUserDropArea.css({ background: data.color });

      var newUserText = $(document.createElement('p'));
      newUserText.text(data.name);
      newUserDropArea.append(newUserText);

      $('#drop-area').append(newUserDropArea);

      var useHeight = (100 / data.total) + '%';
      $('#drop-area div').css({ height: useHeight });
   });

   socket.on('del_user', function(data) {
      $('[data-target-id=' + data.user + ']').remove();
      var divs = $('#drop-area div');
      var useHeight = (100 / divs.length) + '%';
      divs.css({ height: useHeight });
   });

   socket.on('new_element', function(data) {
      var newElem = $(document.createElement(data.tag));
      newElem.addClass(data.classes);
      newElem.attr('id', data.id);
      newElem.html(data.innerHTML);

      $("body").append(newElem);
      startHammer(newElem);

      var fuzziness = 1 + 25;
      var rndLeft = Math.floor(Math.random() * fuzziness - 5);
      newElem.css({
         top: ( data.relHeight * $(window).height() - newElem.height() / 2 ),
         left: ( $(window).width() - $('#drop-area').width() - newElem.width() + rndLeft )
      });

   });

   function sendElement(element, where, position) {
      socket.emit('transfer_ball', {
         target: where.attr('data-target-id'),
         relHeight: ( position.y / $(window).height() ),
         tag: element[0].tagName,
         classes: element[0].className,
         id: element[0].id,
         innerHTML: element[0].innerHTML
      });
   }
   */
});