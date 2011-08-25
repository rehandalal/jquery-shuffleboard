/*
* shuffleboard: A jQuery plugin to create a Shuffleboard UI component
*
* Limitations:
* - requires jquery.transform.light.js (https://github.com/louisremi/jquery.transform.js) for rotation to work.
*
* Latest version and complete README available on Github:
* https://github.com/rehandalal/shuffleboard
*
* Copyright 2011 Rehan Dalal
* Licensed under the MIT license.
*
*/
(function( $ ){
    var methods = {
        'create': function(options) {
            var settings = {
                'autoStart': true,
                'animateRotation': true,
                'corner': 'topleft',
                'direction': 'back',
                'easing': 'swing',
                'interval': 1000,
                'maxRotation': 30,
                'scatter': true,
                'rotate': false,
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
                    data = $this.data('shuffleboard');
                }

                //beforeCreate Callback
                if ($.isFunction(data.beforeCreate)) { data.beforeCreate($this); }
                
                //Set the appropriate CSS positioning on the elements
                $this.css({'position': 'relative'});
                $this.children(data.tag).each(function(){
                    $(this).css({'position': 'absolute'})
                });

                $this.shuffleboard('reindex');

                if (data.scatter) {
                    $this.shuffleboard('scatter');
                }

                if (data.autoStart) {
                    $this.shuffleboard('start');
                }

                //afterCreate Callback
                if ($.isFunction(data.afterCreate)) { data.afterCreate($this); }
            });
        },
        'destroy': function() {
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('shuffleboard');

                //beforeDestroy Callback
                if ($.isFunction(data.beforeDestroy)) { data.beforeDestroy($this); }

                //Stop the shuffleboard
                $this.shuffleboard('stop');

                //Unbind all events
                $(window).unbind('.shuffleboard');

                //Remove data
                data.shuffleboard.remove();
                $this.removeData('shuffleboard');
            });
        },
        'option': function(key, value) {
            //Check if a map of options was provided
            if (typeof key === 'object') {
                return this.each(function(){
                    var $this = $(this);
                    var data = $this.data('shuffleboard');
                    $.each(key, function(index, value){
                       data[index] = value;
                    });
                });
            } else {
                //Check if this is a get or set
                if (typeof value === 'undefined') {
                    var data = this.first().data('shuffleboard');
                    return data[key];
                } else {
                    return this.each(function(){
                        var $this = $(this);
                        var data = $this.data('shuffleboard');
                        data[key] = value;
                    });
                }
            }
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

                //beforeScatter Callback
                if ($.isFunction(data.beforeScatter)) { data.beforeScatter($this); }

                $this.children(data.tag).each(function(){
                    //Generate random coordinates and move items
                    var x = parseInt($this.css('paddingLeft')) + Math.floor(Math.random()*($this.width() - $(this).outerWidth() + 1));
                    var y = parseInt($this.css('paddingTop')) + Math.floor(Math.random()*($this.height() - $(this).outerHeight() + 1));
                    $(this).css({'left': x+'px', 'top': y+'px'});

                    //Rotate if enabled
                    if (data.rotate) {
                        var ang = (Math.floor(Math.random() * ((data.maxRotation * 2) + 1)) - data.maxRotation);
                        $(this).css({'transform': 'rotate('+ang+'deg)'})
                    }
                });

                //afterScatter Callback
                if ($.isFunction(data.afterScatter)) { data.afterScatter($this); }
            });
        },
        'shuffle': function() {
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('shuffleboard');
                var item = (data.direction == 'front')?$this.children(data.tag).first():$this.children(data.tag).last();

                //beforeShuffle Callback
                if ($.isFunction(data.beforeShuffle)) { data.beforeShuffle($this, item); }

                var x, y;

                //scatter final coordinates if neccessary
                if (data.scatter) {
                    x = parseInt($this.css('paddingLeft')) + Math.floor(Math.random()*($this.width() - item.outerWidth() + 1));
                    y = parseInt($this.css('paddingTop')) + Math.floor(Math.random()*($this.height() - item.outerHeight() + 1));
                } else {
                    x = parseInt(item.css('paddingLeft'));
                    y = parseInt(item.css('paddingTop'));
                }

                var firstAnimation = {};
                
                //Select the appropriate corner to shuffle over
                var corner = {};
                switch(data.corner)
                {
                    case 'topleft':
                        corner = {
                            'top': (-item.outerHeight()) + 'px',
                            'left': (-item.outerWidth()) + 'px'
                        }
                        break;

                    case 'topright':
                        corner = {
                            'top': (-item.outerHeight()) + 'px',
                            'left': $this.outerWidth() + 'px'
                        }
                        break;

                    case 'bottomright':
                        corner = {
                            'top': $this.outerHeight() + 'px',
                            'left': $this.outerWidth() + 'px'
                        }
                        break;

                    case 'bottomleft':
                        corner = {
                            'top': $this.outerHeight() + 'px',
                            'left': (-item.outerWidth()) + 'px'
                        }
                        break;

                    default:
                        var itemCenter = [
                            parseInt(item.css('left')) + (item.outerWidth() / 2),
                            parseInt(item.css('top')) + (item.outerHeight() / 2)
                        ];

                        var containerCenter = [
                            $this.outerWidth() / 2,
                            $this.outerHeight() / 2
                        ];

                        if (itemCenter[0] < containerCenter[0]) {
                            corner['left'] = (-item.outerWidth()) + 'px';
                        } else {
                            corner['left'] = $this.outerWidth() + 'px';
                        }

                        if (itemCenter[1] < containerCenter[1]) {
                            corner['top'] = (-item.outerHeight()) + 'px';
                        } else {
                            corner['top'] = $this.outerHeight() + 'px';
                        }
                };
                $.extend(firstAnimation, corner);

                //Add rotation to the animation if enabled
                if (data.rotate && data.animateRotation) {
                    $.extend(firstAnimation, {'transform': 'rotate(0deg)'});
                }

                item.animate(firstAnimation, data.speed / 2, data.easing, function(){
                    //Send to the front or back
                    $(this).css('zIndex', ((data.direction == 'front')?($this.children(data.tag).length + 1):0));

                    var secondAnimation = {
                        'top': y+'px',
                        'left': x+'px'
                    }

                    //Add rotation to the animation if enabled
                    if (data.rotate && data.animateRotation) {
                        var ang = (Math.floor(Math.random() * ((data.maxRotation * 2) + 1)) - data.maxRotation);
                        $.extend(secondAnimation, {'transform': 'rotate('+ang+'deg)'});
                    }

                    $(this).animate(secondAnimation, data.speed / 2, data.easing, function(){
                        if (data.direction == 'front')
                        {
                            $this.append($(this).clone());
                        } else {
                            $this.prepend($(this).clone());
                        }
                        
                        $(this).remove();
                        $this.shuffleboard('reindex');
                        
                        //afterShuffle Callback
                        if ($.isFunction(data.afterShuffle)) { data.afterShuffle($this, item); }

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
        },
        'toggle': function() {
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('shuffleboard');
                $this.shuffleboard((data._started)?'stop':'start');
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