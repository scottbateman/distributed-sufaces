(function() {

   /** Session */
   var //start Session
      Session = function(host, clientDescription) {
         return new Session.init(host, clientDescription);
      }
      , //generate unique id
      getUUID = function() {
         return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
         });
      }
      , //Returns true if object is a DOM node
      isNode = function(o) {
         return (typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number"
               && typeof o.nodeName === "string");
      }
      , //Returns true if object is a DOM element
      isElement = function(o) {
         return (typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1
               && typeof o.nodeName === "string");
      }
      , //Returns true if object is jQuery element
      isJQueryElement = function(o) {
         return (o instanceof Session.modules.$);
      }
      , //Check if object is empty
      isEmpty = function(obj) {
         for (var key in obj) {
            if (obj.hasOwnProperty(key))
               return false;
         }
         return true;
      }
      ;

   Session.READY = false;

   Session.init = function(host, clientDescription) {
      if (typeof host !== "string") {
         clientDescription = host;
         host = undefined;
      }

      this.socket = Session.modules.io.connect(host);
      this.socket.emit('connectionReq', {
         description: this.description
      });
      this.socket.on('connectionRes', function(data) {

      });

      this.description = clientDescription;
      this.MTObjects = [];
      this.MTSelector = "";

      Session.READY = true;
      return this;
   };

//   Session.init.prototype.foo = function () {return "bar";};
//   Session.init.prototype.bar = "foo";
   Session.init.prototype = {
      //All Hammer events
      MTEvents: [
         "hold", "tap", "doubletap", "drag", "dragstart", "dragend", "dragup",
         "dragdown", "dragleft", "dragright", "swipe", "swipeup", "swipedown",
         "swipeleft", "swiperight", "transform", "transformstart", "transformend",
         "rotate", "pinch", "pinchin", "pinchout", "touch", "release"
      ],
      addMT: function(elem) {
         //TODO make hammer start on body and move items only with certain classes
         //FIXME --bug 1--
         // when we pass clean js array of html elements (not $),
         // and we push each element into MTObjects array, inside "on" function
         // callback on elements is not called.
         // Also. When in MTObjects was pushed instance of Hammer, "on" function
         // was not calling callback on elements. (On github wiki it is working)
         for (var i = 0, len = elem.length; i < len; i++) {
            var newMTObj = new Session.modules.Hammer(elem[i], {
               prevent_default: true,
               no_mouseevents: true
            });
//            this.MTObjects.push(newMTObj);
         }
         this.MTObjects.push(elem);
      },
//      startMT: function (selector) {
//         new Session.modules.Hammer(document.body, {
//            prevent_default: true,
//            no_mouseevents: true
//         });
//         this.MTSelector = selector;
//      },
      emit: function(type, data) {
         this.socket.emit(type, data);
      },
      on: function(type, callback) {
         if (this.MTEvents.indexOf(type) != -1) {
            this.MTObjects.forEach(function (MTObj) {
//               console.log(MTObj);
               MTObj.on(type, function (ev) {
//                  console.log("hello");
                  //FIXME --bug 1-- continued
                  // cont from higher - this callback is not called when event is
                  // generated. Right before callback any console.log is called,
                  // but right inside this callback none of console.log are called
                  callback(ev);
               });
            });
         } else {
            this.socket.on(type, function (data) {
               callback(data);
            });
         }
      }
   };

   // Taken from Hammer.js and modified
   // Based off Lo-Dash's excellent UMD wrapper (slightly modified) - https://github.com/bestiejs/lodash/blob/master/lodash.js#L5515-L5543
   // some AMD build optimizers, like r.js, check for specific condition patterns like the following:
   if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      // define as Session module
      define(["jquery", "hammer", "socket.io"],
         function ($, Hammer, io) {
            if (!Session.modules) {
               Session.modules = {};
            }
            Session.modules.$ = $;
            Session.modules.Hammer = Hammer;
            Session.modules.io = io;
            return Session;
         });
   }
   // Browserify support
   else if(typeof module === 'object' && typeof module.exports === 'object') {
      //TODO Work on dependencies for browserify plugin
      module.exports = Session;
   }
   // If we have no plugins
   else {
      //TODO Work on dependencies when there is no plugins
      window.Session = Session;
   }
})();