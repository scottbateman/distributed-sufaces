requirejs.config({
   baseUrl: 'js/lib',
   paths: {
      //paths are relative to baseUrl
      "jquery": [
         "//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min",
         //If CDN fails, load from local file
         "jquery-1.10.2"
      ],
      "hammer": "hammer",
      "socket.io": "/socket.io/socket.io"
      , "shake": "shake"
   }
});

requirejs(['jquery', 'session'], function($, Session) {
   var rndColor = function() {
      var bg_colour = Math.floor(Math.random() * 16777215).toString(16);
      bg_colour = "#"+("000000" + bg_colour).slice(-6);
      return bg_colour;
   };
   var sampleNames = [
      'Fe', 'Thomas', 'Kirstie', 'Wynell', 'Mario', 'Aretha', 'Cherryl', 'Ta',
      'Lindy', 'Karina', 'Sacha', 'Latesha', 'Miki', 'Janel', 'Leola', 'Romeo',
      'Roderick', 'Felica', 'Ilona', 'Nila', 'Patrina', 'Wes', 'Henry', 'Elvera',
      'Karrie', 'Jacklyn', 'Alethea', 'Emogene', 'Alphonso', 'Chandra', 'Beryl',
      'Lilly', 'Georgetta', 'Darrin', 'Deane', 'Rocio', 'Charissa', 'Simona',
      'Don', 'Arianne', 'Esther', 'Leonia', 'Karma', 'Rosemarie', 'Carolyn',
      'Miriam', 'Chastity', 'Vesta', 'Christian', 'Lashaun'
   ].sort();
   var name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
   var color = rndColor();

   $(document).ready(function() {
      var userID = $('#userID');
      userID.text(name);
      userID.css({ background: color });

      $('.id').text(name);
   });

   var sess = new Session({
      color: color,
      name: name,
      path: window.location.pathname
   });
//   setTimeout(function() {
//      console.log(sess.uuid);
//   }, 500);

   function updateBar() {
      var dropArea = $('#drop-area');
      dropArea.find('div').remove();
      for (var i = 0, len = sess.otherClients.length; i < len; i++) {
         var newUserDropArea = $(document.createElement('div'));
         newUserDropArea.addClass('drop');
         newUserDropArea.attr('data-target', sess.otherClients[i].uuid);
         newUserDropArea.css({ background: sess.otherClients[i].description.color });

         var newUserText = $(document.createElement('p'));
         newUserText.text(sess.otherClients[i].description.name);
         newUserDropArea.append(newUserText);

         dropArea.append(newUserDropArea);
         var useHeight = (100 / sess.otherClients.length) + '%';
         dropArea.find('div').css({ height: useHeight });
      }
   }
   sess.on([Session.when.connection_ok,
           Session.when.user_connected,
           Session.when.user_disconnected].join(" "), updateBar);

   setTimeout(function() {
//      sess.sendMSG([sess.otherClients[0].uuid], {msg: "hello", metadata: true});
//      sess.broadcastMSG({msg: "hello", metadata: true});
   }, 1000);
   sess.on(Session.when.broadcast_received, function(data) {
      console.log(data);
   });


//   sess.emit('connected', { path: window.location.pathname });
//   sess.on('hello', function(data) {
//      console.log(data.msg);
//
//      $(document).ready(function() {
//         var userID = $('#userID');
//         userID.text(data.name);
//         userID.css({ background: data.color });
//
//         $('.id').text(data.name);
//
//         $('#drop-area div').remove();
//         for (var i = 0, len = data.users.length; i < len; i++) {
//            var newUserDropArea = $(document.createElement('div'));
//            newUserDropArea.addClass('drop');
//            newUserDropArea.attr('data-target-id', data.users[i].user);
//            newUserDropArea.css({ background: data.users[i].color });
//
//            var newUserText = $(document.createElement('p'));
//            newUserText.text(data.users[i].name);
//            newUserDropArea.append(newUserText);
//
//            $('#drop-area').append(newUserDropArea);
//            var useHeight = (100 / data.users.length) + '%';
//            $('#drop-area div').css({ height: useHeight });
//         }
//      });
//   });

//   sess.on("NEW_CONN_OK", function(ev) {
//      console.log('my custom event');
//      console.log(ev);
//   });

//   sess.addMT(".drag");
   sess.addMT($('.drag'));
//   sess.addMT(document.getElementsByClassName("drag"));

   sess.on('touch', function (ev) {
      var touches = ev.originalEvent.gesture.touches;
      for (var t = 0, len = touches.length; t < len; t++) {
         var target = $(touches[t].target);
         $('.drag').css({ zIndex: 5 });
         target.css({ zIndex: 10 });
      }
   });
   sess.on('drag', function (ev) {
      var touches = ev.originalEvent.gesture.touches;
      for (var t = 0, len = touches.length; t < len; t++) {
//         var target = $(touches[t].target);
         var target = $(ev.target);

         if (target.hasClass('drag')) {
            target.css({
               left: touches[t].pageX - target.width() / 2,
               top: touches[t].pageY - target.height() / 2
            });
         }
      }
   });
   sess.on('release', function(ev) {
      var touches = ev.originalEvent.gesture.touches;
//      console.log(touches.length);
      for (var t = 0; t < touches.length; t++) {
         var target = $(touches[t].target);
         if (target.hasClass('drag')) {
            var targetCenter = {
               x: target.offset().left + target.width() / 2,
               y: target.offset().top + target.height() / 2
            };
            var where;
            var dropAreas = $('#drop-area').find('div');
            for (var i = 0; i < dropAreas.length
               && typeof where === 'undefined'; i++) {
               var drop = $(dropAreas[i]);
               if (drop.offset().left <= targetCenter.x &&
                  targetCenter.x <= drop.offset().left + drop.width() &&
                  drop.offset().top <= targetCenter.y &&
                  targetCenter.y <= drop.offset().top + drop.height()) {
                  where = drop.attr("data-target");
               }
            }
            if (typeof where === 'string') {
               sess.sendMSG([where], {
                  action: 'new_element',
                  element: {
                     tag: target[0].tagName,
                     id: target[0].id,
                     className: target[0].className,
                     innerHTML: target[0].innerHTML,
                     relHeight: ( targetCenter.y / $(window).height() )
                  }
               });
               target.remove();
            }
         }
      }
   });
   sess.on(Session.when.message_received, function(data) {
      console.log(data);
      switch (data.action) {
         case "new_element":
            new_element(data.element);
            break;
      }
   });

   function new_element(metadata) {
      console.log(metadata);

      var newElem = $(document.createElement(metadata.tag));
      newElem.addClass(metadata.className);
      newElem.attr('id', metadata.id);
      newElem.html(metadata.innerHTML);

      $("body").append(newElem);
      sess.addMT(newElem);

      var fuzziness = 1 + 25;
      var rndLeft = Math.floor(Math.random() * fuzziness - 5);
      newElem.css({
         top: ( metadata.relHeight * $(window).height() - newElem.height() / 2 ),
         left: ( $(window).width() - $('#drop-area').width() - newElem.width() + rndLeft )
      });
   };

//   sess.onRemote('drag', function(data) {
//      console.log(data);
//   });
//   sess.on("shake", function(data) {
//      console.log('Undo?');
//   });

   window.sess = sess;
   window.Session = Session;

   /*
   //FIXME check error with drag when element jumps to new location
   sess.on('pinchout', function(ev) {
      var target = $(ev.target);

//      console.log(ev);
//      console.log(ev.originalEvent.gesture.scale);
//      console.log(target);
//      console.log(target.css('width').split('').slice(0,-2).join(''));

      var centerX = +target.css('width').split('').slice(0,-2).join('') / 2 + +target.offset().left;
      var centerY = +target.css('height').split('').slice(0,-2).join('') / 2+ +target.offset().top;
      var scale = ev.originalEvent.gesture.scale;
      var newWidth = +target.css('width').split('').slice(0,-2).join('') * (1 + scale / 50);
      var newHeight = +target.css('height').split('').slice(0,-2).join('') * (1 + scale / 50);
      var newPosX = centerX - newWidth / 2;
      var newPosY = centerY - newHeight / 2;
      var newBorderRadius = newWidth / 2;

      target.css({
         left: newPosX + 'px',
         top: newPosY + 'px',
         width: newWidth + 'px',
         height: newHeight + 'px',
         borderRadius: newBorderRadius + 'px'
      });
   });
   sess.on('pinchin', function(ev) {
      var target = $(ev.target);

      var centerX = +target.css('width').split('').slice(0,-2).join('') / 2 + +target.offset().left;
      var centerY = +target.css('height').split('').slice(0,-2).join('') / 2+ +target.offset().top;
      var scale = ev.originalEvent.gesture.scale;
      var newWidth = +target.css('width').split('').slice(0,-2).join('') * (1 - scale / 20);
      var newHeight = +target.css('height').split('').slice(0,-2).join('') * (1 - scale / 20);
      var newPosX = centerX - newWidth / 2;
      var newPosY = centerY - newHeight / 2;
      var newBorderRadius = newWidth/2;

      target.css({
         left: newPosX + 'px',
         top: newPosY + 'px',
         width: newWidth + 'px',
         height: newHeight + 'px',
         borderRadius: newBorderRadius + 'px'
      });
   });
   */

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