(function() {

   /** Session */
   var Session = function(host) {
      return new Session.init(host);
   };

   Session.READY = false;
   Session.DOCUMENT = window.document;

   Session.init = function(host) {
      if (typeof host !== "string" && typeof host !== "undefined") {
         throw new Error("Host is not a string");
      }
      host = host || window.location.host;
      this.host = host;
      this.socket = Session.modules.io.connect(host);


      Session.READY = true;
      return this;
   };

//   Session.init.prototype.foo = function () {return "bar";};
//   Session.init.prototype.bar = "foo";
   Session.init.prototype = {
      emit: function(type, data) {
         this.socket.emit(type, data);
      }
   , on: function(type, callback) {
         this.socket.on(type, callback);
      }
//   ,
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