require.config({
   baseUrl: 'javascripts/lib',
   paths: {
      "socket.io": "/socket.io/socket.io",
      "jquery": "jquery-1.10.2"
   }
});

require(['jquery', 'hammer', 'socket.io'], function($, Hammer, io) {
   var socket = io.connect(host);
   socket.emit('connected', { path: window.location.pathname });
   startHammer($('.drag'));

   function startHammer(elem) {
      for (var i = 0; i < elem.length; i++) {
         new Hammer(elem[i], { prevent_default: true, no_mouseevents: true });
      }

      elem.on('touch', function(ev) {
         var touches = ev.originalEvent.gesture.touches;
         for (var t = 0, len = touches.length; t < len; t++) {
            var target = $(touches[t].target);
            $('.drag').css({ zIndex: 5 });
            target.css({ zIndex: 10 });
         }
      });

      elem.on('drag transform', function(ev) {
         var touches = ev.originalEvent.gesture.touches;
         for (var t = 0, len = touches.length; t < len; t++) {
            var target = $(touches[t].target);

            if (target.hasClass('drag')) {
               target.css({
                  left: touches[t].pageX - target.width() / 2,
                  top: touches[t].pageY - target.height() / 2
               });
               sendElement(target, touches[t].pageX, touches[t].pageY);
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
      });
   });

   socket.on('move', function(data) {
      var element = $('#' + data.id);
      element.css({
         left: data.x - element.width() / 2,
         top: data.y - element.height() / 2
      });
   });

   var sendElement = function(target, x, y) {
      socket.emit('move_element', {
         id: target[0].id,
         x: x,
         y: y
      });
   };
});