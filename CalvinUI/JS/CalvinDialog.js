﻿/// <reference path="jquery.min.js" />
/// <reference path="CalvinUI.Core.js" />
/// <reference path="CalvinMask.js" />
/// <reference path="CalvinDraggable.js" />

/********************************************************************************************
* 文件名称:	
* 设计人员:	许志伟 
* 设计时间:	
* 功能描述:	
* 注意事项：
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*
********************************************************************************************/
calvin.Create("calvin.ui", function () {
    var Defaults = {
        title: "",
        footer: "",
        message: "",
        showTitle: true,
        showFooter: true,
        zIndex: 1000,
        showClose: true,
        autoShow: false,
        centerX: true,
        centerY: true,
        showOverlay: true,
        overlayCSS: {
            backgroundColor: '#fff',
            opacity: 50
        },
        dialogCSS: {},
        messageCSS: {},
        dragable: false
    };
    this.dialog = calvin.Class({
        init: function (elem, options) {

            var full, ie6 = calvin.ie6(), options = $.extend(true, Defaults, options);
            if (calvin.BodyOrHtmlOrWindow(elem)) {
                this.elem = /body/i.test(elem.nodeName) ? elem : (elem.body || elem.document.body);
                full = true; //window或者document为true
            }
            else {
                this.elem = elem;
                full = false; //window或者document为true
                //如果不是full的话 元素要设置position=relative 这样是为了方便遮罩层top:0 width100% left:0 height100%
                //遮盖元素
                var positionType = this.elem.style.position;
                if (positionType === 'static' || positionType === "") {
                    this.elem.style.position = 'relative';
                }
            }
            $.data(this.elem, "calvindialog", { options: options, ie6: ie6, full: full, container: this.elem });
            DialogHelper.createMask(this.elem);
            DialogHelper.wrapDialog(this.elem);
            DialogHelper.setDialogStyle(this.elem);
            if (!options.autoShow) {
                this.close();
            }
        },
        close: function () {
            DialogHelper.close(this.elem);
        },
        open: function () {
            DialogHelper.open(this.elem);
        }

    });
    var DialogHelper = {

        close: function (elem) {
            var dialogData = $.data(elem, "calvindialog");
            dialogData.$dialog.hide();
            if (dialogData.mask) {
                dialogData.mask.hideMask();
            }
        },
        open: function (elem) {
            var dialogData = $.data(elem, "calvindialog");
            dialogData.$dialog.show();
            if (dialogData.mask) {
                dialogData.mask.showMask();
            }
        },
        wrapDialog: function (elem) {
            var dialogData = $.data(elem, "calvindialog"),
            id = new Date().getTime(),
            opts = dialogData.options,
            $dialog = $("<div id='calvinDialog" + id + "' class='calvinDialog' style='display:block;position:" + (dialogData.full ? 'fixed' : 'absolute') + ";z-index:" + (opts.zIndex + 2) + ";margin: 0px;'></div>"),
            dialogContent = $('<div class="Dialog_content"></div>'),
            message = opts.message;
            $(elem).append($dialog);
            $dialog.append(dialogContent);
            $dialog.css(opts.dialogCSS);
            if (opts.showTitle) {
                var dialogTitle = $('<div class="Dialog_title" id=\"Dialog_title' + id + '" style="cursor: move;"><h4 style="float:left;display:inline-block;margin:0;">' + opts.title + '</h4></div>');
                if (opts.showClose) {
                    var closeBtn = $('<a href="javascript:void(0)" title="关闭窗口" class="close_btn" id="calvinCloseBtn' + id + '">×</a>');
                    closeBtn.click(function () {
                        DialogHelper.close(elem);
                    });
                    dialogTitle.prepend(closeBtn);

                }

                dialogContent.append(dialogTitle);
                if (opts.dragable) {
                    new calvin.ui.cavindrag($dialog[0], { containment: elem, handle: "div.Dialog_title" });
                }
                dialogContent.append("<div class='line'/>");
            }
            //if (!!message && message.nodeType && message.nodeName) {
            //    //dialogContent.append(message);
            //    $(message).show();

            //}
            //else {
                var dialogMessage = $('<div class="Dialog_message"></div>').append(message).width($dialog.width() - 35);
                dialogContent.append(dialogMessage);
           // }
            if (opts.showFooter) {
                dialogContent.append("<div class='line'/>");
                var dialogFooter = $('<div class="Dialog_footer">' + opts.footer + '</div>');
                dialogContent.append(dialogFooter);
            }

            dialogData.$dialog = $dialog;

        },
        createMask: function (elem) {
            var dialogData = $.data(elem, "calvindialog"), opts = dialogData.options;
            dialogData.mask = null;
            if (opts.showOverlay) {
                var mask = new calvin.ui.masker(dialogData.container, { baseZ: opts.zIndex++, overlayCSS: opts.overlayCSS });
                dialogData.mask = mask;
            }

        },
        setDialogStyle: function (elem) {
            var dialogData = $.data(elem, "calvindialog");
            var $dialog = dialogData.$dialog, opts = dialogData.options, full = dialogData.full;
            //IE6的话 可以采用setExpression来居中消息   其他的可以采用fiexed属性来居中
            if (calvin.ie6() && full) {
                $dialog.css("position", 'absolute');
                $dialog.get(0).style.setExpression('top', '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (document.documentElement.scrollTop||document.body.scrollTop) + "px"');
                $dialog.get(0).style.setExpression('left', '(document.documentElement.clientWidth || document.body.clientWidth) / 2 - (this.offsetWidth / 2) + (document.documentElement.scrollLeft||document.body.scrollLeft) + "px"');
            }
            else if (full) {
                $dialog.addClass('Dialogfull');
            }
            else {
                StyleHelper.center($dialog.get(0), opts.centerX, opts.centerY);
            }


        }
    };
    var StyleHelper = {
        /*
        *@description 让对象在父元素中居中
        *@param  {el} 要居中的对象
        *@param {x} 是否X方向居中
        *@param {Y} 是否Y方向居中
        */
        center: function (el, x, y) {
            if (!x && !y) return;
            var p = el.parentNode, s = el.style;
            var $p = $(p);
            var borderAndPaddingWidth, borderAndPaddingHeight;

            if ($.support.boxModel) {
                borderAndPaddingWidth = $p.outerWidth() - $p.width();
                borderAndPaddingHeight = $p.outerHeight() - $p.height();
            }
            var l, t;
            if ($.support.boxModel) {
                l = ((p.offsetWidth - el.offsetWidth) / 2) - (borderAndPaddingWidth / 2);
                t = ((p.offsetHeight - el.offsetHeight) / 2) - (borderAndPaddingHeight / 2);

            }
            else {
                l = (p.offsetWidth - el.offsetWidth) / 2;
                t = (p.offsetHeight - el.offsetHeight) / 2;
            }
            if (x) s.left = l > 0 ? (l + 'px') : '0';
            if (y) s.top = t > 0 ? (t + 'px') : '0';
        }

    };
});