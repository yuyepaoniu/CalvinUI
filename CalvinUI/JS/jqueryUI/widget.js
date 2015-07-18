/*!
* jQuery UI Widget 1.11.2
* http://jqueryui.com
*
* Copyright 2014 jQuery Foundation and other contributors
* Released under the MIT license.
* http://jquery.org/license
*
* http://api.jqueryui.com/jQuery.widget/
*/
(function (factory) {
    if (typeof define === "function" && define.amd) {

        // AMD. Register as an anonymous module.
        define(["jquery"], factory);
    } else {

        // Browser globals
        factory(jQuery);
    }
} (function ($) {

    var widget_uuid = 0,
	widget_slice = Array.prototype.slice;

    $.cleanData = (function (orig) {
        return function (elems) {
            var events, elem, i;
            for (i = 0; (elem = elems[i]) != null; i++) {
                try {

                    // Only trigger remove when necessary to save time
                    events = $._data(elem, "events");
                    if (events && events.remove) {
                        $(elem).triggerHandler("remove");
                    }

                    // http://bugs.jquery.com/ticket/8235
                } catch (e) { }
            }
            orig(elems);
        };
    })($.cleanData);

    $.widget = function (name, base, prototype) {
        var fullName, existingConstructor, constructor, basePrototype,
        // proxiedPrototype allows the provided prototype to remain unmodified
        // so that it can be used as a mixin for multiple widgets (#8876)
		proxiedPrototype = {},
		namespace = name.split(".")[0]; //命名空间

        name = name.split(".")[1]; //类名
        fullName = namespace + "-" + name;

        if (!prototype) {
            prototype = base;
            base = $.Widget;
        }

        // create selector for plugin
        $.expr[":"][fullName.toLowerCase()] = function (elem) {
            return !!$.data(elem, fullName);
        };

        $[namespace] = $[namespace] || {};
        existingConstructor = $[namespace][name];
        constructor = $[namespace][name] = function (options, element) {
            // allow instantiation without "new" keyword
            if (!this._createWidget) {
                return new constructor(options, element);
            }

            // allow instantiation without initializing for simple inheritance
            // must use "new" keyword (the code above always passes args)
            if (arguments.length) {
                //主要做控件的初始化操作 _create() _init()
                this._createWidget(options, element);
            }
        };
        // extend with the existing constructor to carry over any static properties
        //如果有已经存在的构造函数 扩展到现有
        $.extend(constructor, existingConstructor, {
            version: prototype.version,
            // copy the object used to create the prototype in case we need to
            // redefine the widget later
            _proto: $.extend({}, prototype),
            // track widgets that inherit from this widget in case this widget is
            // redefined after a widget inherits from it
            _childConstructors: []
        });

        basePrototype = new base();
        // we need to make the options hash a property directly on the new instance
        // otherwise we'll modify the options hash on the prototype that we're
        // inheriting from
        basePrototype.options = $.widget.extend({}, basePrototype.options);
        //看着没啥用 就是为了每个方法构造父类的方法 相当雨base.do()
        //
        $.each(prototype, function (prop, value) {
            if (!$.isFunction(value)) {
                proxiedPrototype[prop] = value;
                return;
            }
            proxiedPrototype[prop] = (function () {
                var _super = function () {
                    return base.prototype[prop].apply(this, arguments);
                },
				_superApply = function (args) {
				    return base.prototype[prop].apply(this, args);
				};
                return function () {
                    var __super = this._super,
					__superApply = this._superApply,
					returnValue;

                    this._super = _super;
                    this._superApply = _superApply;

                    returnValue = value.apply(this, arguments);

                    this._super = __super;
                    this._superApply = __superApply;

                    return returnValue;
                };
            })();
        });
        //扩展子类方法
        constructor.prototype = $.widget.extend(basePrototype, {
            // TODO: remove support for widgetEventPrefix
            // always use the name + a colon as the prefix, e.g., draggable:start
            // don't prefix for widgets that aren't DOM-based
            widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
        }, proxiedPrototype, {
            constructor: constructor,
            namespace: namespace,
            widgetName: name,
            widgetFullName: fullName
        });

        // If this widget is being redefined then we need to find all widgets that
        // are inheriting from it and redefine all of them so that they inherit from
        // the new version of this widget. We're essentially trying to replace one
        // level in the prototype chain.
        if (existingConstructor) {
            $.each(existingConstructor._childConstructors, function (i, child) {
                var childPrototype = child.prototype;

                // redefine the child widget using the same prototype that was
                // originally used, but inherit from the new version of the base
                $.widget(childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto);
            });
            // remove the list of existing child constructors from the old constructor
            // so the old child constructors can be garbage collected
            delete existingConstructor._childConstructors;
        } else {
            base._childConstructors.push(constructor);
        }

        $.widget.bridge(name, constructor); //将此方法挂在jQuery对象上  

        return constructor;
    };

    $.widget.extend = function (target) {
        var input = widget_slice.call(arguments, 1),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
        for (; inputIndex < inputLength; inputIndex++) {
            for (key in input[inputIndex]) {
                value = input[inputIndex][key];
                if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
                    // Clone objects
                    if ($.isPlainObject(value)) {
                        target[key] = $.isPlainObject(target[key]) ?
						$.widget.extend({}, target[key], value) :
                        // Don't extend strings, arrays, etc. with objects
						$.widget.extend({}, value);
                        // Copy everything else by reference
                    } else {
                        target[key] = value;
                    }
                }
            }
        }
        return target;
    };

    $.widget.bridge = function (name, object) {
        var fullName = object.prototype.widgetFullName || name;
        $.fn[name] = function (options) {
            //如果第一个参数是string类型，就认为是调用模块方法   
            //剩下的参数作为方法的参数，后面会用到   
            var isMethodCall = typeof options === "string",
			args = widget_slice.call(arguments, 1),
			returnValue = this;

            // allow multiple hashes to be passed on init
            //可以简单认为是$.extend(true,options,args[0],...),args可以是一个参数或是数组   
            options = !isMethodCall && args.length ?
			$.widget.extend.apply(null, [options].concat(args)) :
			options;

            if (isMethodCall) {
                this.each(function () {
                    var methodValue,
					instance = $.data(this, fullName);
                    if (options === "instance") {
                        returnValue = instance;
                        return false;
                    }
                    //没有初始化对象
                    if (!instance) {
                        return $.error("cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'");
                    }
                    //开头带下划线的方法都是私有方法，不让调用  
                    if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                        return $.error("no such method '" + options + "' for " + name + " widget instance");
                    }
                    methodValue = instance[options].apply(instance, args);
                    if (methodValue !== instance && methodValue !== undefined) {
                        returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack(methodValue.get()) :
						methodValue;
                        return false;
                    }
                });
            } else {
                this.each(function () {
                    //得到实例
                    var instance = $.data(this, fullName);
                    //查看是否已经实例化过
                    if (instance) {
                        //重新设置option而已
                        instance.option(options || {});
                        if (instance._init) {
                            instance._init();
                        }
                    } else {
                        $.data(this, fullName, new object(options, this));
                    }
                });
            }

            return returnValue;
        };
    };

    $.Widget = function ( /* options, element */) { };
    $.Widget._childConstructors = [];

    $.Widget.prototype = {
        widgetName: "widget",
        widgetEventPrefix: "",
        defaultElement: "<div>",
        options: {
            disabled: false,

            // callbacks
            create: null
        },
        _createWidget: function (options, element) {
            element = $(element || this.defaultElement || this)[0];
            this.element = $(element);
            this.uuid = widget_uuid++;
            this.eventNamespace = "." + this.widgetName + this.uuid;

            this.bindings = $();
            this.hoverable = $();
            this.focusable = $();

            if (element !== this) {
                $.data(element, this.widgetFullName, this);
                this._on(true, this.element, {
                    remove: function (event) {
                        if (event.target === element) {
                            this.destroy();
                        }
                    }
                });
                this.document = $(element.style ?
                // element within the document
				element.ownerDocument :
                // element is window or document
				element.document || element);
                this.window = $(this.document[0].defaultView || this.document[0].parentWindow);
            }

            this.options = $.widget.extend({},
			this.options,
			this._getCreateOptions(),
			options);

            this._create();
            this._trigger("create", null, this._getCreateEventData());
            this._init();
        },
        _getCreateOptions: $.noop,
        _getCreateEventData: $.noop,
        _create: $.noop,
        _init: $.noop, //小部件初始化的理念与创建不同。任何时候不带参数的调用插件或者只带一个选项哈希的调用插件，初始化小部件。当小部件被创建时会包含这个方法。
        

        destroy: function () {
            this._destroy();
            // we can probably remove the unbind calls in 2.0
            // all event bindings should go through this._on()
            this.element
			.unbind(this.eventNamespace)
			.removeData(this.widgetFullName)
            // support: jquery <1.6.3
            // http://bugs.jquery.com/ticket/9413
			.removeData($.camelCase(this.widgetFullName));
            this.widget()
			.unbind(this.eventNamespace)
			.removeAttr("aria-disabled")
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled");

            // clean up events and states
            this.bindings.unbind(this.eventNamespace);
            this.hoverable.removeClass("ui-state-hover");
            this.focusable.removeClass("ui-state-focus");
        },
        _destroy: $.noop,

        widget: function () {
            return this.element;
        },

        option: function (key, value) {
            var options = key,
			parts,
			curOption,
			i;

            if (arguments.length === 0) {
                // don't return a reference to the internal hash
                return $.widget.extend({}, this.options);
            }

            if (typeof key === "string") {
                // handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
                options = {};
                parts = key.split(".");
                key = parts.shift();
                if (parts.length) {
                    curOption = options[key] = $.widget.extend({}, this.options[key]);
                    for (i = 0; i < parts.length - 1; i++) {
                        curOption[parts[i]] = curOption[parts[i]] || {};
                        curOption = curOption[parts[i]];
                    }
                    key = parts.pop();
                    if (arguments.length === 1) {
                        return curOption[key] === undefined ? null : curOption[key];
                    }
                    curOption[key] = value;
                } else {
                    if (arguments.length === 1) {
                        return this.options[key] === undefined ? null : this.options[key];
                    }
                    options[key] = value;
                }
            }

            this._setOptions(options);

            return this;
        },
        _setOptions: function (options) {
            var key;

            for (key in options) {
                this._setOption(key, options[key]);
            }

            return this;
        },
        _setOption: function (key, value) {
            this.options[key] = value;

            if (key === "disabled") {
                this.widget()
				.toggleClass(this.widgetFullName + "-disabled", !!value);

                // If the widget is becoming disabled, then nothing is interactive
                if (value) {
                    this.hoverable.removeClass("ui-state-hover");
                    this.focusable.removeClass("ui-state-focus");
                }
            }

            return this;
        },

        enable: function () {
            return this._setOptions({ disabled: false });
        },
        disable: function () {
            return this._setOptions({ disabled: true });
        },
        ///绑定事件或者代理时间
        //this._on(true,this.element,{remove:fun}) 表示element绑定remove事件
        /*
        this._on( this.element, {
  "click a": function( event ) {
    event.preventDefault();
  }
});表示用this.element代理元素下面所有a的click事件
        */
        _on: function (suppressDisabledCheck, element, handlers) {
        	/// <summary>
        	/// _on() 方法提供了一些直接事件绑定的好处：
            /*保持处理程序内适当的 this 上下文。
            自动处理禁用的部件：如果小部件被禁用或事件发生在带有 ui-state-disabled class 的元素上，则不调用事件处理程序。可以被 suppressDisabledCheck 参数重写。
            事件处理程序会自动添加命名空间，在销毁时会自自动清理。*/
        	/// </summary>
            /// <param name="suppressDisabledCheck">是否要绕过禁用的检查。</param>
            /// <param name="element">要绑定事件处理程序的元素。如果未提供元素，this.element 用于未授权的事件，widget 元素 用于授权的事件。</param>
            /// <param name="handlers">一个 map，其中字符串键代表事件类型，可选的选择器用于授权，值代表事件调用的处理函数</param>
            var delegateElement,
			instance = this;

            // no suppressDisabledCheck flag, shuffle arguments
            if (typeof suppressDisabledCheck !== "boolean") {
                handlers = element;
                element = suppressDisabledCheck;
                suppressDisabledCheck = false;
            }

            // no element argument, shuffle and use this.element
            if (!handlers) {
                handlers = element;
                element = this.element;
                delegateElement = this.widget();
            } else {
                element = delegateElement = $(element);
                this.bindings = this.bindings.add(element);
            }

            $.each(handlers, function (event, handler) {
                function handlerProxy() {
                    // allow widgets to customize the disabled handling
                    // - disabled as an array instead of boolean
                    // - disabled class as method for disabling individual parts
                    /*
                    *
                    *自动处理禁用的部件：如果小部件被禁用或事件发生在带有 ui-state-disabled class 的元素上，
                    则不调用事件处理程序。
                    可以被 suppressDisabledCheck 参数重写。
                    */
                    if (!suppressDisabledCheck &&
						(instance.options.disabled === true ||
							$(this).hasClass("ui-state-disabled"))) {
                        return;
                    }
                    return (typeof handler === "string" ? instance[handler] : handler)
					.apply(instance, arguments);
                }

                // copy the guid so direct unbinding works
                if (typeof handler !== "string") {
                    handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
                }

                var match = event.match(/^([\w:-]*)\s*(.*)$/),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
                if (selector) {
                    delegateElement.delegate(selector, eventName, handlerProxy);
                } else {
                    element.bind(eventName, handlerProxy);
                }
            });
        },

        _off: function (element, eventName) {
        	/// <summary>
            /// 从指定的元素取消绑定事件处理程序。
        	/// </summary>
        	/// <param name="element"></param>
        	/// <param name="eventName"></param>
            eventName = (eventName || "").split(" ").join(this.eventNamespace + " ") +
			this.eventNamespace;
            element.unbind(eventName).undelegate(eventName);

            // Clear the stack to avoid memory leaks (#10056)
            this.bindings = $(this.bindings.not(element).get());
            this.focusable = $(this.focusable.not(element).get());
            this.hoverable = $(this.hoverable.not(element).get());
        },

        _delay: function (handler, delay) {
        	/// <summary>
        	/// 延迟执行
        	/// </summary>
        	/// <param name="handler"></param>
        	/// <param name="delay"></param>
        	/// <returns type=""></returns>
            function handlerProxy() {
                return (typeof handler === "string" ? instance[handler] : handler)
				.apply(instance, arguments);
            }
            var instance = this;
            return setTimeout(handlerProxy, delay || 0);
        },

        _hoverable: function (element) {
            this.hoverable = this.hoverable.add(element);
            this._on(element, {
                mouseenter: function (event) {
                    $(event.currentTarget).addClass("ui-state-hover");
                },
                mouseleave: function (event) {
                    $(event.currentTarget).removeClass("ui-state-hover");
                }
            });
        },

        _focusable: function (element) {
            this.focusable = this.focusable.add(element);
            this._on(element, {
                focusin: function (event) {
                    $(event.currentTarget).addClass("ui-state-focus");
                },
                focusout: function (event) {
                    $(event.currentTarget).removeClass("ui-state-focus");
                }
            });
        },
        /*当按下一个键时，触发 search 事件。
        this._on( this.element, {
        keydown: function( event ) {
 
        // Pass the original event so that the custom search event has
        // useful information, such as keyCode
        this._trigger( "search", event, {
 
        // Pass additional information unique to this event
        value: this.element.val()
        });
        }
        });*/
        _trigger: function (type, event, data) {
        	/// <summary>
            /// 触发一个事件及其相关的回调。带有该名称的选项与作为回调被调用的类型相等。
            /// 如果默认行为是阻止的，则返回 false，否则返回 true。当处理程序返回 false 时
            /// 或调用 event.preventDefault() 时，则阻止默认行为发生。
        	/// </summary>
            /// <param name="type">type 应该匹配回调选项的名称。完整的事件类型会自动生成。</param>
            /// <param name="event">导致该事件发生的原始事件，想听众提供上下文时很有用。</param>
            /// <param name="data">一个与事件相关的数据哈希。</param>
        	/// <returns type=""></returns>
            var prop, orig,
			callback = this.options[type];//获取option回调事件

            data = data || {};
            event = $.Event(event);
            event.type = (type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type).toLowerCase();
            // the original event may come from any element
            // so we need to reset the target on the new event
            event.target = this.element[0];

            // copy original event properties over to the new event
            orig = event.originalEvent;
            if (orig) {
                for (prop in orig) {
                    if (!(prop in event)) {
                        event[prop] = orig[prop];
                    }
                }
            }

            this.element.trigger(event, data);//处罚事件
            return !($.isFunction(callback) &&
			callback.apply(this.element[0], [event].concat(data)) === false ||
			event.isDefaultPrevented());
        }
    };

    $.each({ show: "fadeIn", hide: "fadeOut" }, function (method, defaultEffect) {
        $.Widget.prototype["_" + method] = function (element, options, callback) {
            if (typeof options === "string") {
                options = { effect: options };
            }
            var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
            options = options || {};
            if (typeof options === "number") {
                options = { duration: options };
            }
            hasOptions = !$.isEmptyObject(options);
            options.complete = callback;
            if (options.delay) {
                element.delay(options.delay);
            }
            if (hasOptions && $.effects && $.effects.effect[effectName]) {
                element[method](options);
            } else if (effectName !== method && element[effectName]) {
                element[effectName](options.duration, options.easing, callback);
            } else {
                element.queue(function (next) {
                    $(this)[method]();
                    if (callback) {
                        callback.call(element[0]);
                    }
                    next();
                });
            }
        };
    });

    return $.widget;

}));
