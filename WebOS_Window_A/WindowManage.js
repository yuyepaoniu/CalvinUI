Array.prototype.indexOf = function (obj) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i] == obj) return i;
    }
    return -1;
}
Array.prototype.contains = function (obj) {
    return this.indexOf(obj) > -1;

}

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
}