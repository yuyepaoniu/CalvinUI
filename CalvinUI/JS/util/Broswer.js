﻿/// <reference path="../CalvinUI.Core.js" />

/**    
* @version    1.0
* @author    bananaxzw(许志伟)(<a href="mailto:bananaxzw@qq.com">Paladin-xu</a>)
* 
*注意：允许你使用该框架 但是不允许修改该框架 有发现BUG请通知作者 切勿擅自修改框架内容
*/
calvin.Create(function () {
    /**
    *浏览器信息 目前只提供版本判断
    *@class
    *@name Browser
    *@example 
    * alert(calvin.Browser.chrome)
    * alert(calvin.Browser.ie);
    */
    function Browser() {


        var _this = this;
        var pf = navigator.platform.toLowerCase(),
        ua = navigator.userAgent.toLowerCase(), s;

        function fixedVersion(ver, floatLength) {
            ver = ("" + ver).replace(/_/g, ".");
            floatLength = floatLength || 1;
            ver = String(ver).split(".");
            ver = ver[0] + "." + (ver[1] || "0");
            ver = Number(ver).toFixed(floatLength);
            return ver;

        }
        function set(name, version) {
            _this.name = name;
            _this.version = version;
            _this[name] = version;

        }

        (s = ua.match(/msie ([\d.]+)/)) ? set("ie", fixedVersion(s[1])) :
    (s = ua.match(/firefox\/([\d.]+)/)) ? set("firefox", fixedVersion(s[1])) :
    (s = ua.match(/chrome\/([\d.]+)/)) ? set("chrome", fixedVersion(s[1])) :
    (s = ua.match(/opera.([\d.]+)/)) ? set("opera", fixedVersion(s[1])) :
    (s = ua.match(/adobeair\/([\d.]+)/)) ? set("adobeAir", fixedVersion(s[1])) :
    (s = ua.match(/version\/([\d.]+).*safari/)) ? set("safari", fixedVersion(s[1])) : 0;
    };

    Browser.prototype = {
        /** 
        * ie版本判断 如果是ie返回2位IE版本号 如果不是ie则返回0
        * @default 0 
        * @type number 
        * @example 
        */
        ie: 0,
        /** 
        *firefox: 0,
        * firefox版本判断 如果是返回firefox版本号 如果不是firefox则返回0
        * @default 0 
        * @type number 
        * @example 
        */
        firefox: 0,
        /** 
        * chrome版本判断 如果是chrome返回版本号 如果不是chrome则返回0
        * @default 0 
        * @type number 
        * @example 
        */
        chrome: 0,
        /** 
        * opera版本判断 如果是opera返回版本号 如果不是opera则返回0
        * @default 0 
        * @type number 
        * @example 
        */
        opera: 0,
        /** 
        * adobeAir版本判断 如果是adobeAir版本号 如果不是adobeAir则返回0
        * @default 0 
        * @type number 
        * @example 
        */
        adobeAir: 0,
        /** 
        * safari版本判断 如果是safari返回版本号 如果不是safari则返回0
        * @default 0 
        * @type number 
        * @example 
        */
        safari: 0
    };
    calvin.Browser = new Browser();
});

/*

<script type="text/javascript">  
                var userAgent = navigator.userAgent,   
                rMsie = /(msie\s|trident.*rv:)([\w.]+)/,   
                rFirefox = /(firefox)\/([\w.]+)/,   
                rOpera = /(opera).+version\/([\w.]+)/,   
                rChrome = /(chrome)\/([\w.]+)/,   
                rSafari = /version\/([\w.]+).*(safari)/;  
                var browser;  
                var version;  
                var ua = userAgent.toLowerCase();  
                function uaMatch(ua) {  
                    var match = rMsie.exec(ua);  
                    if (match != null) {  
                        return { browser : "IE", version : match[2] || "0" };  
                    }  
                    var match = rFirefox.exec(ua);  
                    if (match != null) {  
                        return { browser : match[1] || "", version : match[2] || "0" };  
                    }  
                    var match = rOpera.exec(ua);  
                    if (match != null) {  
                        return { browser : match[1] || "", version : match[2] || "0" };  
                    }  
                    var match = rChrome.exec(ua);  
                    if (match != null) {  
                        return { browser : match[1] || "", version : match[2] || "0" };  
                    }  
                    var match = rSafari.exec(ua);  
                    if (match != null) {  
                        return { browser : match[2] || "", version : match[1] || "0" };  
                    }  
                    if (match != null) {  
                        return { browser : "", version : "0" };  
                    }  
                }  
                var browserMatch = uaMatch(userAgent.toLowerCase());  
                if (browserMatch.browser) {  
                    browser = browserMatch.browser;  
                    version = browserMatch.version;  
                }  
                document.write(browser+version);          
                    </script>
*/

