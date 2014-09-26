/// <reference path="jquery.min.js" />
/// <reference path="CalvinUI.Core.js" />
/// <reference path="CalvinMask.js" />
/// <reference path="CalvinDraggable.js" />
calvin.Create("calvin.ui", function () {

    this.fixedtop = calvin.Class({
        init: function (elem, options) {

            this.fixed = false;
            var $elem = $(elem), initialPostion = $elem.css("position"), initialTop = $elem.css("top"), initialleft = $elem.css("left");
            $elem.data("calvin.ui.fixedtop", { initialPostion: initialPostion, initialTop: initialTop, initialleft: initialleft, options: options });
            this.elem = elem;
            this.set();

            },
         set: function () {
            if (this.fixed) return;
            this.fixed = true;
            var $elem = $(this.elem), options = $elem.data("calvin.ui.fixedtop").options, top = options.top || 0, left = options.left || 0
            if (calvin.ie6()) {
                $elem.css("position", 'absolute');
                $elem.elements[0].style.setExpression('top', '(document.documentElement.scrollTop||document.body.scrollTop)+' + top + ' + "px"');
                $elem.elements[0].style.setExpression('left', '(document.documentElement.scrollLeft||document.body.scrollLeft)+' + left + ' + "px"');
            }
            else {
                $elem.css({ position: 'fixed', top: top, left: left });
            }
        },
        reset: function () {
            this.fixed = false;
            var $elem = $(this.elem), options = $elem.data("calvin.ui.fixedtop");
            $elem.css({ position: options.initialPostion, top: options.initialTop, left: options.initialleft });

        }

    });


});