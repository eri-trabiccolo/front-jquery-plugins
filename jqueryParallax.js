/* ===================================================
 * jqueryParallax.js v1.0.0
 * ===================================================
 * (c) 2016 Nicolas Guillaume - Rocco Aliberti, Nice, France
 * CenterImages plugin may be freely distributed under the terms of the GNU GPL v2.0 or later license.
 *
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 *
 *
 *
 * =================================================== */
;(function ( $, window, document, undefined ) {
  /*
  * In order to handle a smooth scroll
  * ( inspired by jquery.waypoints and smoothScroll.js )
  * Maybe use this -> https://gist.github.com/paulirish/1579671
  */
  var czrParallaxRequestAnimationFrame = function(callback) {
    var requestFn = ( czrapp && czrapp.requestAnimationFrame) ||
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      function( callback ) { window.setTimeout(callback, 1000 / 60); };

    requestFn.call(window, callback);
  };

  //defaults
  var pluginName = 'czrParallax',
      defaults = {
        parallaxRatio : 0.5,
        parallaxDirection : 1,
        parallaxOverflowHidden : true,
        oncustom : [],//list of event here
        backgroundClass : 'image',
        parallaxParent  : '.parallax-wrapper'
      };

  function Plugin( element, options ) {
    this.element = $(element);
    this.options = $.extend( {}, defaults, options, this.parseElementDataOptions() ) ;
    this._name = pluginName;
    this.init();
  }

  Plugin.prototype.parseElementDataOptions = function () {
    return this.element.data();
  };

  //can access this.element and this.option
  //@return void
  Plugin.prototype.init = function () {
    //cache some element
    this.$_document   = $(document);
    this.$_window     = czrapp ? czrapp.$_window : $(window);
    this.wrapper      = this.element.closest(this.options.parallaxParent );

    this.doingAnimation = false;
    /*
    * If not wrapper defined the parallax element will freely parallax in the viewport
    */
    if ( this.wrapper.length < 1 )
      this.wrapper = this.element;

    this.stageParallaxElements();
    this.initWaypoints();
    this._bind_evt();

    this.maybeParallaxMe();
  };

  //@return void
  //map custom events if any
  Plugin.prototype._bind_evt = function() {
    var self = this,
        _customEvt = $.isArray(this.options.oncustom) ? this.options.oncustom : this.options.oncustom.split(' ');

    _.bindAll( this, 'maybeParallaxMe', 'parallaxMe' );
    /* TODO: custom events? */
  };

  Plugin.prototype.stageParallaxElements = function() {
    this.element.css( 'position', this.element.hasClass( this.options.backgroundClass ) ? 'absolute' : 'relative' );
    if ( this.options.parallaxOverflowHidden )
      this.wrapper.css( 'overflow', 'hidden' );
  };

  Plugin.prototype.initWaypoints = function() {
    var self = this;

      this.way_start = new Waypoint({
        element: self.wrapper,
        handler: function() {
          if ( ! self.element.hasClass('parallaxing') ){
            window.addEventListener('scroll', self.maybeParallaxMe );
            self.element.addClass('parallaxing');
          }else{
            self.element.removeClass('parallaxing');
            window.removeEventListener('scroll', self.maybeParallaxMe );
            self.doingAnimation = false;
            self.element.css('top', 0 );
          }
        }
      });

      this.way_stop = new Waypoint({
        element: self.wrapper,
        handler: function() {
          if ( ! self.element.hasClass('parallaxing') ) {
            window.addEventListener('scroll', self.maybeParallaxMe );
            self.element.addClass('parallaxing');
          }else {
            self.element.removeClass('parallaxing');
            window.removeEventListener('scroll', self.maybeParallaxMe );
            self.doingAnimation = false;
          }
        },
        offset: function(){
          //offset = this.context.innerHeight() - this.adapter.outerHeight();
          //return - (  offset > 20 /* possible wrong h scrollbar */ ? offset : this.context.innerHeight() );
          return - this.adapter.outerHeight();
        }
      });
  };

  /*
  * In order to handle a smooth scroll
  */
  Plugin.prototype.maybeParallaxMe = function() {
      var self      = this;

      if ( !this.doingAnimation ) {
        this.doingAnimation = true;
        //window.requestAnimationFrame(function() {
          self.parallaxMe();
          self.doingAnimation = false;
        //});
      }
  };

  Plugin.prototype.parallaxMe = function() {
      var ratio = this.options.parallaxRatio,
          parallaxDirection = this.options.parallaxDirection,
          value = ratio * parallaxDirection * ( this.$_document.scrollTop() - this.way_start.triggerPoint );

      value = parallaxDirection * value < 0 ? 0 : value;
      this.element.css('top', value +'px' );
  };


  // prevents against multiple instantiations
  $.fn[pluginName] = function ( options ) {
      return this.each(function () {
          if (!$.data(this, 'plugin_' + pluginName)) {
              $.data(this, 'plugin_' + pluginName,
              new Plugin( this, options ));
          }
      });
  };

})( jQuery, window, document );