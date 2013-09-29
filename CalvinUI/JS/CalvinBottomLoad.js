/// <reference path="jquery-1.4.1-vsdoc.js" />
/// <reference path="json2.js" />
/// <reference path="CalvinTimeDelayMaker.js" />
/// <reference path="CalvinUI.Core.js" />

/********************************************************************************************
* 文件名称:	CalvinAutoComplete.js
* 设计人员:	许志伟 
* 设计时间:	
* 功能描述:	AutoComplete
* 注意事项：如果变量前面有带$表示的是JQ对象
*
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*
********************************************************************************************/
calvin.Create("calvin.ui", function () {

    var defaults = {
        LoadRadius: 5, //加载范围
        onReach: function () { },
        LoadData: function (data) { },
        LoadError: function (xhr, status, error) { },
        ajaxRequest: false,
        ajaxOption: $.ajaxSettting,
        container: window
    };
    this.bottomload = calvin.Class(
    {
        init: function (options) {
            this.opts = $.extend({}, defaults, options);
            this.page = 1;
            this.loaded = true;
            var othis = this;
            $(calvin.BodyOrHtmlOrWindow(this.opts.container) ? window : this.opts.container).scroll(calvin.CalvinTimeDelayMaker.throttle(100, function () {
                othis.onScroll.apply(othis);
            }, true));
        },
        setLoadedState: function (state) {
            this.loaded = state;
        }
    });
    this.bottomload.prototype.onScroll = function () {
        var scrollheight = ScrollHelper.getScrollRect(this.opts.container).height,
             scrollTop = $(this.opts.container).scrollTop(),
             height = ScrollHelper.getVisiableRect(this.opts.container).height,
             LoadRadius = this.opts.LoadRadius, _this = this;
        if ((scrollTop + height - scrollheight) >= LoadRadius || (scrollTop + height - scrollheight) >= -LoadRadius) {
            ++this.page;
            if (this.loaded) {
                //同步加载
                this.setLoadedState(false);
                this.opts.onReach.apply(this);
                if (!this.opts.ajaxRequest) {
                    this.opts.LoadData.apply(this);
                    this.setLoadedState(true);
                }
                else {
                    var ajaxOptions = $.extend({}, this.opts.ajaxOption, {
                        onTimeout: function () {
                            _this.opts.LoadError.call(_this, xhr, status, "请求超时");
                            _this.setLoadedState(true);
                        },
                        success: function (data, status, xhr) {
                            _this.opts.LoadData.call(_this, data);
                            _this.setLoadedState(true);
                        },
                        error: function (xhr, status, error) {
                            _this.opts.LoadError.call(_this, xhr, status, error);
                            _this.setLoadedState(true);
                        }
                    });
                    $.ajax(ajaxOptions);
                }
            }


        }
    };

    var ScrollHelper = {
        getVisiableRect: function (elem) {
            if (calvin.BodyOrHtmlOrWindow(elem)) {
                if (window.innerHeight) {
                    return { height: window.innerHeight, width: window.innerWidth };
                } else {
                    if (document.compatMode === "BackCompat") {
                        return { height: document.body.clientHeight, width: document.body.clientWidth };
                    }
                    else {
                        return { height: document.documentElement.clientHeight, width: document.documentElement.clientWidth };
                    }
                }
            } else {
                return { height: parseFloat($(elem).height()), width: parseFloat($(elem).width()) };
            }
        },
        getScrollRect: function (elem) {
            if (calvin.BodyOrHtmlOrWindow(elem)) {
                return { height: document.body.scrollHeight, width: document.body.scrollWidth };
            }
            else {
                return { height: elem.scrollHeight, width: elem.scrollWidth };
            }
            /*
            var doc = window.document;
            return { height: GetMax("Height"), width: GetMax("Width") };
            function GetMax(i) {
            return Math.max(
            doc.body["scroll" + i], doc.documentElement["scroll" + i],
            doc.body["offset" + i], doc.documentElement["offset" + i]
            );
            }*/
        }
    };

});

