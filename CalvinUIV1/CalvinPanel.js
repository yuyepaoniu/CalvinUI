/// <reference path="../CalvinUI/JS/jquery-1.4.1-vsdoc.js" />
/// <reference path="../CalvinUI/JS/jqueryUI/core.js" />
/// <reference path="../CalvinUI/JS/jqueryUI/widget.js" />
/// <reference path="../CalvinUI/JS/jqueryUI/mouse.js" />
/// <reference path="../CalvinUI/JS/jqueryUI/draggable.js" />
/// <reference path="../CalvinUI/JS/jqueryUI/resizable.js" />

/********************************************************************************************
* 文件名称:	
* 设计人员:	许志伟 
* 设计时间:	
* 功能描述:	
* 注意事项：如果变量前面有带$表示的是JQ对象
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*
********************************************************************************************/
$.widget("calvinUI.panel", {

    options: {
        noheader: false, //是否显示头
        title: "<span>&nbsp;&nbsp;</span>",
        bodyCss: {},
        width: 800,
        height: 500,
        left: null,
        top: null,
        border: true,
        //自定义工具
        tools: [],
        container: "body",
        //是够可以改变大小
        resizeable: false,
        //是否可以拖拉
        draggable: false,

        collapsible: false,
        //定义是否显示最小化按钮
        minimizable: false,
        maximizable: false,
        closable: false,
        collapsed: false,
        minimized: false, //定义在初始化的时候最小化面板
        maximized: false,
        closed: false, //定义在初始化的时候关闭面板
        onBeforeOpen: function () { },
        onOpen: function () { },
        onBeforeClose: function () { },
        onClose: function () { },
        onBeforeDestroy: function () { },
        onDestroy: function () { },
        onResize: function (width, height) { },
        onMaximize: function () { },
        onRestore: function () { },
        onMinimize: function () { },
        onBeforeCollapse: function () { },
        onBeforeExpand: function () { },
        onCollapse: function () { },
        onExpand: function () { },
        animate: true,
        zindex: 1
    },
    _create: function () {

        var $this = this;
        this._formPanel();
        this._formHeader();


        //data.header = $header;
        //            if (opts.draggable) {
        //                reSizeAndDraggable.setDraggable(this);
        //            }
        //            if (opts.resizeable) {
        //                reSizeAndDraggable.setResizeable(this);
        //            }

        /*如果多次调用calvinPanel的话 因为target被JS重新设置宽度 采用把target的原始宽度缓存起来 
        *防止多次调用 宽度逐渐缩小*/


        this._initStyle();
        this.setInitalState();

        if (this.options.draggable && $.ui && $.ui.draggable) {
            this.panel.draggable({ iframeFix: true, containment: this.options.container, handle: this.header, cursor: "move" });
        }
        if (this.options.resizeable && $.ui && $.ui.resizable) {
            this.panel.resizable({ start: function (event, ui) {
                //修正iframe内容拖拉不流畅
                $(">iframe", $this.body).each(function () {
                    $("<div class='ui-resizable-iframeFix' style='background: #fff;'></div>")
            .css({
                width: this.offsetWidth + "px", height: this.offsetHeight + "px",
                position: "absolute", opacity: "0.001", zIndex: 10000
            })
            .css($(this).offset())
            .appendTo("body");
                });

            }, resize: function () {
                var params = {};
                params.height = $this.panel.height();
                params.width = $this.panel.width();
                $this.setSizeByParams(params);

            }, stop: function () {
                var params = {};
                params.height = $this.panel.height();
                params.width = $this.panel.width();
                $this.setSizeByParams(params);
                //修正iframe内容拖拉不流畅
                $("div.ui-resizable-iframeFix").each(function () {
                    this.parentNode.removeChild(this);
                });

            }
            });
        }

    },
    closePanel: function (forceClose) {
        var $panel = this.panel;
        var opts = this.options;
        if (forceClose != true) {
            if (opts.onBeforeClose.call(this.element[0]) == false) return;
        }
        $panel.hide();
        opts.closed = true;
        opts.onClose.call(this.element[0]);
    },
    collapsePanel: function (animate) {
        var opts = this.options;
        var panel = this.panel;
        var body = panel.find('>div.panel-body');
        var tool = panel.find('>div.panel-header .panel-tool-collapse');
        var target = this.element[0];
        if (tool.hasClass('panel-tool-expand')) return;

        body.stop(true, true); // stop animation
        if (opts.onBeforeCollapse.call(target) == false) return;

        tool.addClass('panel-tool-expand');
        if (animate) {
            body.slideUp('normal', function () {
                opts.collapsed = true;
                opts.onCollapse.call(target);
            });
        }
        else {
            body.hide();
            opts.collapsed = true;
            opts.onCollapse.call(target);
        }
    },
    expandPanel: function (animate) {
        var opts = this.options;
        var panel = this.panel;
        var body = panel.find('>div.panel-body');
        var tool = panel.find('>div.panel-header .panel-tool-collapse');
        var target = this.element[0];

        if (!tool.hasClass('panel-tool-expand')) return;

        body.stop(true, true); // stop animation
        if (opts.onBeforeExpand.call(target) == false) return;

        tool.removeClass('panel-tool-expand');
        if (animate) {
            body.slideDown('normal', function () {
                opts.collapsed = false;
                opts.onExpand.call(target);
            });
        }
        else {
            body.show();
            opts.collapsed = false;
            opts.onExpand.call(target);
        }

    },
    openPanel: function (forceOpen) {
        var opts = this.options;
        var panel = this.panel;
        var target = this.element[0];
        if (forceOpen != true) {
            if (opts.onBeforeOpen.call(target) == false) return;
        }
        panel.show();
        opts.closed = false;
        opts.onOpen.call(target);
    },
    _initStyle: function () {
        var panel = this.panel;
        var width = this.options.width == "auto" ? this.element.width() : this.options.width;
        var height = this.options.height == "auto" ? this.element.height() : this.options.height;
        this.panel.css({ width: width, height: height, left: this.options.left, top: this.options.top });
        var pheader = panel.find('>div.panel-header');
        var pbody = panel.find('>div.panel-body');
        panel.width(width - (panel.outerWidth() - panel.width()));
        pheader.width(panel.width() - (pheader.outerWidth() - pheader.width()));
        pbody.width(panel.width() - (pbody.outerWidth() - pbody.width()));
        pbody.height(panel.height() - pheader.outerHeight() - (pbody.outerHeight() - pbody.height()));
        this._refreshStyle();

    },
    setMaxsizeStyle: function () {
        //目前暂时全部父容器都是body
        var opts = this.options;
        var panel = this.panel;
        var tool = panel.find('>div.panel-header .panel-tool-max');
        if (tool.hasClass('panel-tool-restore')) return;
        tool.addClass('panel-tool-restore');
        var documentHeight = document.documentElement.clientHeight || document.body.clientHeight,
        documentWidth = document.documentElement.clientWidth || document.body.clientWidth;
        var pheader = panel.find('>div.panel-header');
        var pbody = panel.find('>div.panel-body');
        this._refreshStyle();
        panel.css({ left: "0px", top: "0px" })
        /* 2012 6月4号修正*/
        panel.width(documentWidth);
        pheader.width(panel.width() - (pheader.outerWidth() - pheader.width()));
        pbody.width(panel.width() - (pbody.outerWidth() - pbody.width()));
        /* 2012 6月4号修正*/
        panel.height(documentHeight);
        pbody.height(panel.height() - pheader.outerHeight() - (pbody.outerHeight() - pbody.height()));
        opts.minimized = false;
        opts.maximized = true;
        opts.onMaximize.call(this.element[0]);

    },
    setRestroreStyle: function () {
        var target = this.element[0];
        var opts = this.options;
        var panel = this.panel;
        var tool = panel.find('>div.panel-header .panel-tool-max');

        if (!tool.hasClass('panel-tool-restore')) return;

        panel.show();
        tool.removeClass('panel-tool-restore');

        var pheader = panel.find('>div.panel-header'),
         pbody = panel.find('>div.panel-body');
        panel.css(this.lastStyle);
        pheader.width(panel.width() - (pheader.outerWidth() - pheader.width()));
        pbody.width(panel.width() - (pbody.outerWidth() - pbody.width()));
        pbody.height(panel.height() - pheader.outerHeight() - (pbody.outerHeight() - pbody.height()));


    },
    /*
    * 根据参数重新设置宽度和高度
    */
    setSizeByParams: function (params) {
        var target = this.element[0];
        var opts = this.options;
        var panel = this.panel;
        var pheader = panel.find('>div.panel-header');
        var pbody = panel.find('>div.panel-body');

        if (params) {
            if (params.width) opts.width = params.width;
            if (params.height) opts.height = params.height;
            if (params.left != null) opts.left = params.left;
            if (params.top != null) opts.top = params.top;
        }



        //        panel.css({
        //            left: opts.left,
        //            top: opts.top
        //        });

        //        panel.addClass(opts.cls);
        //        pheader.addClass(opts.headerCls);
        //        pbody.addClass(opts.bodyCls);

        if (!isNaN(opts.width)) {
            //                    if ($.support.boxModel == true) {
            panel.width(opts.width - (panel.outerWidth() - panel.width()));
            pheader.width(panel.width() - (pheader.outerWidth() - pheader.width()));
            pbody.width(panel.width() - (pbody.outerWidth() - pbody.width()));
            //                    } else {
            //                        panel.width(opts.width);
            //                        pheader.width(panel.width());
            //                        pbody.width(panel.width());
            //                    }
        } else {
            panel.width('auto');
            pbody.width('auto');
        }
        if (!isNaN(opts.height)) {
            // if ($.boxModel == true) {
            panel.height(opts.height - (panel.outerHeight() - panel.height()));
            pbody.height(panel.height() - pheader.outerHeight() - (pbody.outerHeight() - pbody.height()));
            //                    } else {
            //                        panel.height(opts.height);
            //                        pbody.height(panel.height() - pheader.outerHeight());
            //                    }
        } else {
            pbody.height('auto');
        }
        panel.css('height', null);

        opts.onResize.apply(target, [opts.width, opts.height]);
    },
    /*
    * 设置初始化状态 比如是最大化 最小化 展开
    */
    setInitalState: function () {
        var target = this.element[0], opts = this.options;
        if (opts.maximized == true) {
            eventHelper.maximizePanel(target);
        }
        if (opts.minimized == true) {
            eventHelper.minimizePanel(target);

        }
        if (opts.collapsed == true) {
            eventHelper.collapsePanel(target);
        }

        if (opts.closed == true) {
            eventHelper.closePanel(target);
        }
    },
    setzindex: function (index) {

        this.panel.css({ "z-index": index });
    },
    _formPanel: function () {

        this.body = this.element.addClass('panel-body').wrap('<div class="panel"></div>');
        this.body.css(this.options.bodyCss);
        this.panel = this.body.parent();
        this.panel.css({ "z-index": this.options.zindex });
    },
    /**
    * @description 构造pannelheader对象
    * @param {target} 目标元素
    * @returns header的jq对象
    */
    _formHeader: function (target) {
        var panel = this.panel;
        var opts = this.options;
        if (!opts.noheader) {
            var $header = $('<div class="panel-header"><div class="panel-title">' + opts.title + '</div></div>').prependTo(panel);
            this.header = $header;
            var $tool = $('<div class="panel-tool"></div>').appendTo($header);
            if (opts.closable) {
                var closeTool = $('<div class="panel-tool-close"></div>').appendTo($tool);
                this._on(closeTool, { click: function () {
                    this.closePanel();
                }
                });

            }
            if (opts.maximizable) {

                this.maxTool = $('<div class="panel-tool-max"></div>').appendTo($tool);
                this._on(this.maxTool, { click: function () {
                    if (this.maxTool.hasClass('panel-tool-restore')) {
                        this.setRestroreStyle();
                    } else {
                        this.setMaxsizeStyle();
                    }
                    return false;
                }
                });

            }
            if (opts.minimizable) {
                var minTool = $('<div class="panel-tool-min"></div>').appendTo($tool);
                this._on(minTool, { click: function () { } });
            }
            if (opts.collapsible) {
                this.collapseTool = $('<div class="panel-tool-collapse"></div>').appendTo($tool);
                this._on(this.collapseTool, { click: function () {
                    if (this.collapseTool.hasClass('panel-tool-expand')) {
                        this.expandPanel();
                    } else {
                        this.collapsePanel();
                    }
                    //event.stopPropagation();

                }
                });
            }
            if (opts.tools) {
                for (var i = opts.tools.length - 1; i >= 0; i--) {
                    var t = $('<div></div>').addClass(opts.tools[i].iconCls).appendTo($tool);
                    if (opts.tools[i].handler) {
                        t.bind('click', eval(opts.tools[i].handler));
                    }
                }
            }
            $tool.find('div').hover(function () {
                $(this).addClass('panel-tool-over');
            }, function () {
                $(this).removeClass('panel-tool-over');
            });
            this.header = $header;
        }
        return null;
    },
    _refreshStyle: function () {
        this.lastStyle = {

            left: this.panel.css("left"),
            top: this.panel.css("top"),
            width: this.panel.width(),
            height: this.panel.height()
        };




    }

});
