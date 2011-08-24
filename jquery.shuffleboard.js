/*!
 * jQuery Shuffleboard Plugin
 * Created by Rehan Dalal
 *
 * Date: Thu Jun 30 14:16:56 2011 -0400
 */
(function( $ ){
    var methods = {
        'create': function(options) {
            var settings = {
                'autoStart': true,
                'direction': 'back',
                'easing': 'swing',
                'interval': 1000,
                'randomize': true,
                'speed': 1000,
                'tag': 'img'
            }

            if (options) {
                $.extend(settings, options);
            }
            
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('shuffleboard');

                //If the plugin hasn't been initialized yet
                if (!data) {
                    $this.data('shuffleboard', settings);
                }
                
                //Set the appropriate CSS positioning on the elements
                $this.css({'position': 'relative'});
                $this.children(settings.tag).each(function(){
                    $(this).css({'position': 'absolute'})
                });

                $this.shuffleboard('reindex');

                if (settings.randomize) {
                    $this.shuffleboard('scatter');
                }

                if (settings.autoStart) {
                    $this.shuffleboard('start');
                }
            });
        },
        'destroy': function() {
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('shuffleboard');

                //Stop the shuffleboard
                $this.shuffleboard('stop');

                //Unbind all events
                $(window).unbind('.shuffleboard');

                //Remove data
                data.shuffleboard.remove();
                $this.removeData('shuffleboard');
            });
        },
        'reindex': function() {
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('shuffleboard');

                //Assign the correct z-index to all of the elements
                $this.children(data.tag).each(function(index){
                    $(this).css({'zIndex': index + 1});
                });
            });
        },
        'scatter': function() {
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('shuffleboard');
                $this.children(data.tag).each(function(){
                    //Generate random coordinates and move items
                    var x = parseInt($this.css('paddingLeft')) + Math.floor(Math.random()*($this.width() - $(this).outerWidth() + 1));
                    var y = parseInt($this.css('paddingTop')) + Math.floor(Math.random()*($this.height() - $(this).outerHeight() + 1));
                    $(this).css({'left': x+'px', 'top': y+'px'});
                });
            });
        },
        'shuffle': function() {
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('shuffleboard');
                var item = (data.direction == 'front')?$this.children(data.tag).first():$this.children(data.tag).last();

                if (data.randomize) {
                    var x = parseInt($this.css('paddingLeft')) + Math.floor(Math.random()*($this.width() - item.outerWidth() + 1));
                    var y = parseInt($this.css('paddingTop')) + Math.floor(Math.random()*($this.height() - item.outerHeight() + 1));
                } else {
                    var x = 0;
                    var y = 0;
                }

                item.animate({'top': $this.outerHeight() + 'px', 'left': $this.outerWidth() + 'px'}, data.speed / 2, data.easing, function(){
                    $(this).css('zIndex', ((data.direction == 'front')?($this.children(data.tag).length + 1):0));
                    $(this).animate({'top': y+'px', 'left': x+'px'}, data.speed / 2, data.easing, function(){
                        if (data.direction == 'front')
                        {
                            $this.append($(this).clone());
                        } else {
                            $this.prepend($(this).clone());
                        }
                        
                        $(this).remove();
                        $this.shuffleboard('reindex');

                        if (data._started) {
                            $this.shuffleboard('start');
                        }
                    });
                });
            });
        },
        'start': function() {
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('shuffleboard');
                data._started = true;
                data._timeout = setTimeout(function(){ $this.shuffleboard('shuffle'); }, data.interval);
            });
        },
        'stop': function() {
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('shuffleboard');
                data._started = false;
                if (data._timeout) { clearTimeout(data._timeout); }
            });
        }
    }

    $.fn.shuffleboard = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.create.apply(this, arguments);
        } else {
            $.error('Method '+method+' does not exist on jQuery.shuffleboard' );
        }
    };
})( jQuery );