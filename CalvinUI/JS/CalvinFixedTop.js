/// <reference path="jquery.min.js" />
/// <reference path="CalvinUI.Core.js" />
/// <reference path="CalvinMask.js" />
/// <reference path="CalvinDraggable.js" />
calvin.Create("calvin.ui", function () {
    this.fixedtop = calvin.Class({
        init: function (elem, options) {
            var _this = this;
            _this.fixed = false;
            var $elem = $(elem), initialPostion = $elem.css("position"), initialTop = $elem.css("top"), initialleft = $elem.css("left");
            $elem.data("calvin.ui.fixedtop", { initialPostion: initialPostion, initialTop: initialTop, initialleft: initialleft, options: options });
            this.elem = elem;
            var top = options.top || 0, left = options.left || 0;
            var offsetTop = $elem.offset().top - parseInt(options.top);
            $(window).scroll(function () {
                if ($(window).scrollTop() > offsetTop) {
                    if (_this.fixed) return;
                    if (calvin.ie6()) {
                        $("body").css("background-attachment", "fixed").css("background-image", "url(n1othing.txt)");
                        $elem.css("position", 'absolute');
                        var dom = '(document.documentElement || document.body)';
                        elem.style.setExpression('top', 'eval(' + dom + '.scrollTop + ' + parseInt(top) + ') + "px"');
                        //elem.style.setExpression('left', 'eval(' + dom + '.scrollLeft + ' + parseInt(left) + ') + "px"');
                    }
                    else {
                        $elem.css({ position: 'fixed', top: top });
                    }
                    _this.fixed = true;
                }
                else if ($(window).scrollTop() <= offsetTop) {

                    if (!_this.fixed) return;
                    _this.fixed = false;
                    $elem.css({ position: initialPostion, top: initialTop });


                }
            });
        }
    });

});