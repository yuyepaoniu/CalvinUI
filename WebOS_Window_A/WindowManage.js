/// <reference path="../CalvinUI/JS/jquery-1.4.1-vsdoc.js" />
/// <reference path="../CalvinUI/JS/jqueryUI/core.js" />
/// <reference path="../CalvinUI/JS/jqueryUI/widget.js" />

Array.prototype.indexOf = function (obj) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i] == obj) return i;
    }
    return -1;
}
Array.prototype.contains = function (obj) {
    return this.indexOf(obj) > -1;

}

function formatStr(str) {
    var args = arguments;
    return str.replace(/\{(\d+)\}/g,
        function (m, i) {
            i = parseInt(i);
            return args[i + 1];
        }).toString();
};

/// <reference path="../CalvinUI/JS/jquery-1.4.1-vsdoc.js" />


function windowmanage() {
    this.window_ids = [];
    this.maxindex = 1;
    this.openwindow = function (options) {
        var opts = {
            left: "15%",
            height: 500,
            width: 800,
            top: "10%"
        };
        options = $.extend(true, {}, opts, options);
        if (!options.windowid) {
            return;
        }
        if (this.window_ids.contains(options.windowid)) {
            $("#window_" + options.windowid).parent().show();
            return;
        }
        var index = this.maxindex;
        this.window_ids.push(options.windowid);
        var Pwindow = $("<div id='window_" + options.windowid + "'>" + options.content + "</div>");
        Pwindow.appendTo("body");
        Pwindow.panel({ minimizable: true,
            draggable: true, resizeable: true,
            collapsible: true, closable: true,
            maximizable: true,
            bodyCss: { overflow: "hidden", backgroundColor: "#FFF" },
            left: options.left,
            top: options.top,
            width: options.width,
            height: options.height,
            zindex: index
        });
        ++this.maxindex;
    };
    this.setWindowTop = function (windowid) {
        $("#window_" + windowid).panel("setzindex", ++this.maxindex);
    };
};


///工具条封装
var ___taskbartag = "<dt class=\"normal\"  id=\"{0}\"><a href=\"javascript:void(0);\" class=\"BG24\" title=\"{1}\">{2}</a></dt>";
$.widget("calvinUI.taskbar", {
    _create: function () {
        this.task_ids = [];
        //代理taskbar的点击事件
        this._on(this.element, { "click dt": function (event) {

            var taskelement = event.target;
            if (taskelement.tagName == "A") {
                taskelement = taskelement.parentNode;
            }
            var id = taskelement.id.split('_')[1];
            this._setSelectedStyle(id);
            if (this.options.ontaskclick) {
                this.options.ontaskclick.call(this, id);
            }
        }
        });

    },
    addtask: function (id, name) {
        /// <summary>
        /// 添加一个任务栏
        /// </summary>
        /// <param name="id"></param>
        /// <param name="name"></param>
        if (!id || !name) {
            return;
        }
        if (!this.task_ids.contains(id)) {
            var atask = $(formatStr(___taskbartag, "task_" + id, name, name));
            this.element.append(atask);
            this.task_ids.push(id);
        }
        this._setSelectedStyle(id);

    },
    _setSelectedStyle: function (id) {
        /// <summary>
        /// 设置选中样式
        /// </summary>
        /// <param name="id">选中任务的id 不带前缀</param>
        $("dt", this.element).each(function () {
            if (this.id != "task_" + id) {
                this.className = "normal";
            }
            else {
                this.className = "current";
            }
        });
    }

});