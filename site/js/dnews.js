(function($) {
    $.fn.extend({
        dnews: function(options) {
            var settings = $.extend({
                controls: false,
                switchInterval: 3000,
                feedurl: '',
                showdetail: true,
                moretext: '[...]',
                controlsalwaysvisible: true,
                entries: 10,
                target : "",
				headlineLength:80
            }, options);
            return this.each(function() {
                var direction = "forward";
                var wrapper = $(this);
                var interval;
                var prevIndex = 0;
                var curIndex = 0;
                var mode = 'auto'; //auto, manual
                var next, prev, play, pause;
                var containerWidth;
                var left;
                var total;
                var allHeadlines;
                var controlbar;
                var previewWraper;
                var mouseEntered = 0;
                function setPlayingStatus(isPlaying) {
                    if (isPlaying) {
                        play.css('display', 'none');
                        pause.css('display', '');
                    }
                    else {
                        play.css('display', '');
                        pause.css('display', 'none');
                    }
                }
               
                               var id = 0;
                var descriptions = new Array();
                //build news headlines from feed
                if (settings.feedurl != '') {
                    $('.news', wrapper).html();
                    google.setOnLoadCallback(function OnLoad() {
                        var feed = new google.feeds.Feed(settings.feedurl);
                        feed.setNumEntries(settings.entries);
                        feed.setResultFormat(google.feeds.Feed.XML_FORMAT);
                        feed.load(feedLoaded);
                    });
                    function feedLoaded(result) {
                        if (!result.error) {
                            $('.news', wrapper).html('');
                            var chanels = $(result.xmlDocument).find('channel');
                            var newsHome = $('>link', chanels).text();
                            var newsDate = chanels.find('lastBuildDate').text();
                            var allNews = chanels.find('item');
                            allNews.each(function(index, news) {
                                id++;
                                var headlintext = $(news).find('title').text();
                                if (headlintext.length > settings.headlineLength)
                                    headlintext = headlintext.substr(0, settings.headlineLength) + ' ...';
                                var headline = $('<div/>').addClass('headline').append($('<a/>').attr('id', id).html(headlintext).attr('target',settings.target).attr('href', $(news).find('link').text()));
                                descriptions.push($(news).find('description').text());
                                $('.news', wrapper).append(headline);
                            });
                            setupHeadlines();
                        }
                        else alert(result.error);
                    }
                }
                else {
                    $('.news a', wrapper).each(function(index, news) {
                        id++;
                        descriptions.push($(news).attr('title'));
                        $(news).attr('id', id).removeAttr('title');
                    });
                    setupHeadlines();
                }
                /*wrapper.find('.news').hover(stopAnimation, function() { if (mode == 'auto') startAnimation(); });*/
                function stopAnimation() { clearInterval(interval); }
                function startAnimation() { interval = setInterval(switchNews, settings.switchInterval); }
                function setupHeadlines() {
                    if (settings.controls)
                        controlbar.css('display', '');
                    wrapper.prepend($('<div/>').addClass('news-title'));
                    containerWidth = $('.news', wrapper).width() + $('.news-title', wrapper).width();
                    allHeadlines = $('.headline', wrapper);
                    left = wrapper.find('.news').css('left');
                    if (left == 'auto') left = $('.news-title').width() + 'px';
                    allHeadlines.css('left', '-' + containerWidth + 'px');
                    total = allHeadlines.length;
                    $(allHeadlines[curIndex]).css('left', left);
                    interval = setInterval(switchNews, settings.switchInterval);
                    if (previewWraper != null) {
                        var previewWrapperLeft = previewWraper.offset().left;
                        previewWraper.animate({ opacity: 0 }, 1000, function() { $(this).css('visibility', 'hidden'); });
                    }
                    if (!settings.controlsalwaysvisible)
                        controlbar.slideUp("fast");
                    wrapper.mouseenter(function(e) {
                        stopAnimation();
                        mouseEntered = getMousePosition(e, wrapper);
                        if (!settings.controlsalwaysvisible)
                            controlbar.slideDown("fast");
                    });

                    
                  
                   
                    if (settings.showdetail) {
                        $('.headline', wrapper).mouseenter(function(e) {
                            var top = -(previewWraper.height() + $('.tip').height() + 2);
                            previewWraper.css('top', top);
                            var description = descriptions[parseInt($(this).find('a').attr('id')) - 1];
                            if (description == '') description = $(this).find('a').html();
                            if (description.length > 120) description = description.substr(0, 120);
                            description += '<a href="' + $(this).find('a').attr('href') + '" target="'+settings.target+'" >' + settings.moretext + '</a>';
                            var previewId = wrapper.attr('id') + '-' + 'preview';
                            $('#' + previewId + ' p').html(description);
                            $('#' + previewId + ' h4').html($(this).find('a').html());
                            var previewleft = $(this).offset().left - previewWrapperLeft;
                            previewWraper.css('left', previewleft + 'px')
                        .css('visibility', 'visible')
                        .stop()
                        .animate({ opacity: 1.0 }, 1000, function() {
                        });
                        });
                    }
                }
                function switchNews() {
                    if (direction == 'forward') {
                        curIndex = (prevIndex + 1) % total;
                        $(allHeadlines[prevIndex]).stop().animate({ 'left': containerWidth + 'px' }, "slow", function() {
                            $(this).css('left', '-' + containerWidth + 'px');
                        });
                        $(allHeadlines[curIndex]).stop().animate({ 'left': left }, "slow");
                    }
                    else {
                        curIndex = (prevIndex > 0 ? prevIndex - 1 : total - 1) % total;
                        $(allHeadlines[prevIndex]).stop().animate({ 'left': -containerWidth + 'px' }, "slow");
                        $(allHeadlines[curIndex]).css({ 'left': containerWidth + 'px' }).stop().animate({ 'left': left }, "slow");
                    }
                    prevIndex = curIndex;
                }
                function getMousePosition(e, el) {
                    var x = 0;
                    var y = 0;
                    if (e.offsetX || e.offsetY) {
                        x = e.offsetX;
                        y = e.offsetY;
                    }
                    else if (e.pageX || e.pageY) {
                        x = e.pageX - parseInt($(el).css('left'));
                        y = e.pageY - parseInt($(el).css('top'));
                    }
                    else if (e.clientX || e.clientY) {
                        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                    }
                    return [x, y];
                }

            });
        }
    });
})(jQuery);