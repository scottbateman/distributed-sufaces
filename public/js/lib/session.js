all();
function all() {
   /**
    * Function is alias to {@link Session.init}
    * @param {string} [host] Host socket.io is connecting to
    * @param {object} clientDescription User specified description of client
    * @returns {Session.init} Instance of session
    *
    * @alias Session
    * @constructor
    */
   var Session = function(host, clientDescription) {
      return new Session.init(host, clientDescription);
   };

//   var //Returns true if object is a DOM node
//      isNode = function(o) {
//         return (typeof Node === "object" ? o instanceof Node :
//            o && typeof o === "object" && typeof o.nodeType === "number"
//               && typeof o.nodeName === "string");
//      }
//      , //Returns true if object is a DOM element
//      isElement = function(o) {
//         return (typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
//            o && typeof o === "object" && o !== null && o.nodeType === 1
//               && typeof o.nodeName === "string");
//      }
//      , //Returns true if object is jQuery element
//      isJQueryElement = function(o) {
//         return (o instanceof Session.modules.$);
//      }
//      , //Check if object is empty
//      isEmpty = function(obj) {
//         for (var key in obj) {
//            if (obj.hasOwnProperty(key))
//               return false;
//         }
//         return true;
//      }
//      , //default drag callback
//      defaultDragCallback = function(ev) {
//         var $ = Session.modules.$;
//
//      };

   /**
    * Is true when {@link Session.init#socket socket} is connected and
    * {@link Session.init#MTObjects MT objects} initialized
    * @type {boolean}
    */
   Session.READY = false;

   /**
    * List of all events that (sent to/received from) server
    * @type {string[]}
    */
   var serviceCalls = ["CONN", "CONN_OK", "CONN_USER", "DEL_USER",
      "MT_EVENT_SUBSCRIBE"];
   //   Session.events = new Session.modules.ev();

   /**
    * Function initializes new session instance
    * @param {string} [host] Host socket.io is connecting to
    * @param {object} clientDescription User specified description of client
    * @returns {Session.init} Instance of session
    *
    * @constructor
    */
   Session.init = function(host, clientDescription) {
      if (typeof host !== "string") {
         clientDescription = host;
         host = undefined;
      }
      var self = this;

      /**
       * Socket to the host for the current session
       * @type {*|io.Socket}
       */
      this.socket = Session.modules.io.connect(host);
      this.socket.emit('CONN', {
         description: clientDescription
      });
      this.socket.once('CONN_OK', function(data) {
         self.uuid = data.uuid;
         self.otherClients = data.otherClients;

         //TODO fire event or something similar when connection happened
      });
      this.socket.on('CONN_USER', function(data) {
         self.otherClients.push(data.client);

         //TODO fire event
      });
      this.socket.on('DEL_USER', function(data) {
         if (self.otherClients.length > 0) {
            var toDelete = -1, i;
            for (i = 0; i < self.otherClients.length && toDelete === -1; i++) {
               if (self.otherClients[i].uuid === data.client.uuid) {toDelete = i;}
            }
            if (toDelete != -1) {
               self.otherClients.splice(toDelete, 1);
            }

            //TODO fire event
         }
      });

      /**
       * Description of client for current session
       * @type {Object}
       */
      this.description = clientDescription;
      /**
       * Objects that has multi-touch properties
       * @type {Array}
       */
      this.MTObjects = [];
      this.MTSelector = "";

      Session.READY = true;
      return this;
   };

//   Session.init.prototype.foo = function () {return "bar";};
//   Session.init.prototype.bar = "foo";
   Session.init.prototype = {
      /**
       * All multitouch events from Hammer
       * @type {string[]}
       */
      MTEvents: [
         "hold", "tap", "doubletap", "drag", "dragstart", "dragend", "dragup",
         "dragdown", "dragleft", "dragright", "swipe", "swipeup", "swipedown",
         "swipeleft", "swiperight", "transform", "transformstart", "transformend",
         "rotate", "pinch", "pinchin", "pinchout", "touch", "release"
      ],
      /**
       * Specify on which element multitouch is started
       * @param {jQuery} elem Jquery array of elements
       */
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
      // TODO check on idea of starting MT on body and only allowing
      // to interact with elements with certain selector
//      startMT: function (selector) {
//         new Session.modules.Hammer(document.body, {
//            prevent_default: true,
//            no_mouseevents: true
//         });
//         this.MTSelector = selector;
//      },
      /**
       * Send data to server through {@link Session.init#socket|socket}
       * @param {string} type Type of event created on server
       * @param {string|object} data Object to send
       */
      emit: function(type, data) {
         var self = this;
         this.socket.emit(type, {
            uuid: self.uuid,
            msg: data
         });
      },
      /**
       * Register callback on specified event
       * @param {string|string[]} types On which types fire callback
       * @param {function} callback Function to execute
       */
      on: function(types, callback) {
         var self = this;
         types.split(' ').forEach(function(type) { // in case types is given as string of few events
            if (self.MTEvents.indexOf(type) != -1) { // if this event is from hammer
               self.MTObjects.forEach(function (MTObj) { // to all mt objects we attach listener
                  MTObj.on(type, function (ev) { //listener callback
                     var touches = ev.originalEvent.gesture.touches;
                     var data = {
                        sourceUUID: self.uuid,
                        event: {
                           type: type,
                           element: []
                        }
                     };
                     for (var i = 0; i < touches.length; i++) {
                        var touch = touches[i];
                        data.event.element.push({
                           tag: touch.target.tagName,
                           id: touch.target.id,
                           className: touch.target.className,
                           innerHTML: touch.target.innerHTML,
                           x: touch.pageX,
                           y: touch.pageY
                        });
                     }
                     self.socket.emit(type, data);

                     //FIXME --bug 1-- continued
                     // cont from higher - this callback is not called when event is
                     // generated. Right before callback any console.log is called,
                     // but right inside this callback none of console.log are called
                     callback(ev);
                  });
               });
            } else {
               self.socket.on(type, function (data) {
                  callback(data);
               });
            }
         });
      },
      /**
       * Register callback on event type from remote server
       * @param {string|string[]} types On which types fire callback
       * @param {function} callback Function to execute
       */
      onRemote: function(types, callback) {
         var self = this;
         self.socket.emit("MT_EVENT_SUBSCRIBE", {
            sourceUUID: self.uuid,
            eventType: types
         });
         types.split(' ').forEach(function(type) {
            self.socket.on(type, function(data) {
               callback(data);
            });
         });
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
};