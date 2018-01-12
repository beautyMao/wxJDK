/**
 * 图片预加载
 */
(function() {
    var root = (typeof self == 'object' && self.self == self && self) ||
        (typeof global == 'object' && global.global == global && global) ||
        this || {};

    var isWechat = window.navigator.userAgent.includes('MicroMessenger')
    var configDefalse = {
        debugFlag: false,
        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareQZone', 'onMenuShareWeibo'],
        defaultImage: 'http://driverdl.lenovo.com.cn/FE/static/image/lenovo-share.jpg'
    }
    var getWXAjaxUrl = '//appapi.lenovo.com.cn/api/forum/wechat';
    var jssdkUrl = '//res.wx.qq.com/open/js/jweixin-1.2.0.js';
    var util = {
        getCookie: function(name) {
            var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
            if (arr != null) return unescape(arr[2]);
            return null;
        },
        extendObj: function(target) {
            var args = arguments;
            if (args.length < 2) return;
            var temp = util.cloneObj(args[0]); //调用复制对象方法  
            for (var n = 1; n < args.length; n++) {
                for (var i in args[n]) {
                    temp[i] = args[n][i];
                }
            }
            return temp;
        },
        cloneObj: function(oldObj) {
            if (typeof(oldObj) != 'object') return oldObj;
            if (oldObj == null) return oldObj;
            var newObj = new Object();
            for (var i in oldObj)
                newObj[i] = util.cloneObj(oldObj[i]);
            return newObj;
        },
        convertData: function(data) {
            if (typeof data === 'object') {
                var convertResult = "";
                for (var c in data) {
                    convertResult += c + "=" + data[c] + "&";
                }
                convertResult = convertResult.substring(0, convertResult.length - 1)
                return convertResult;
            } else {
                return data;
            }
        },
        singleLoad: function(source, fn) {
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement("script")
            script.type = 'text/javascript'
            script.src = source
            script.async = true
            head.appendChild(script)
            script.onload = fn
        }
    };
    var Ajax = {
        get: function(url, fn) {
            var obj = new XMLHttpRequest(); // XMLHttpRequest对象用于在后台与服务器交换数据          
            obj.open('GET', url, true);
            obj.onreadystatechange = function() {
                if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) { // readyState == 4说明请求已完成
                    fn.call(this, obj.responseText); //从服务器获得数据
                }
            };
            obj.send();
        },
        post: function(url, data, fn) { // datat应为'a=a1&b=b1'这种字符串格式，在jq里如果data为对象会自动将对象转成这种字符串格式
            var obj = new XMLHttpRequest();
            obj.open("POST", url, true);
            obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); // 添加http头，发送信息至服务器时内容编码类型
            obj.onreadystatechange = function() {
                if (obj.readyState == 4 && (obj.status == 200 || obj.status == 304)) { // 304未修改
                    fn.call(this, obj.responseText);
                }
            };
            obj.send(util.convertData(data));
        }
    }


    function getOpenid() {
        return getOpenidValue();
    }

    function getOpenidValue() {
        var openID = util.getCookie('openid');
        if (!openID) {
            window.onload = function() {
                window.location.href = 'http://weixin.lenovo.com.cn/weixin/index.php/Api/lenovoAuthLocation2?url=' + window.location.href + '?source=wx';
            }
            return null
        } else {
            return openID;
        }

    }

    function initWechatShare(config) {
        if (isWechat) {
            return new WxjsShare(config);
        }
    }
    var WxjsShare = function(config) {
        this.config = {
            link: location.href,
            imgUrl: configDefalse.defaultImage,
        }
        this.config = util.extendObj(this.config, config);
        var me = this;
        //动态引入wecaht jssdk
        util.singleLoad(jssdkUrl, function() {
            me.__init();
        })

    }
    WxjsShare.prototype = {
        __init: function() {
            var me = this;
            // weixin config接口注入权限验证配置
            var t = Date.now();

            Ajax.post(getWXAjaxUrl, {
                url: window.location.href,
                timestamp: t
            }, function(re) {
                re = typeof(re) === 'string' ? JSON.parse(re) : re;
                var configOb = {
                    debugFlag: false,
                    appId: re.data.appId,
                    timestamp: t,
                    nonceStr: re.data.noncestr,
                    signature: re.data.signature,
                    jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage']
                };
                wx.config(configOb);
                wx.ready(function() {
                    wx.onMenuShareTimeline(me.config);
                    wx.onMenuShareAppMessage(me.config);
                })
            });

        }
    }

    function initWechatJSSDK(config) {
        return new Wxjs(config);
    }
    var Wxjs = function(config) {
        this.config = {
            debugFlag: false,
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'translateVoice', 'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu', 'showOptionMenu', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard'],
            ready: ''
        };

        this.config = util.extendObj(this.config, config);
        var me = this;
        util.singleLoad(jssdkUrl, function() {
            me.__init();
        })
    };
    Wxjs.prototype = {
        __init: function() {
            var me = this;
            // weixin config接口注入权限验证配置
            var t = Date.now();
            Ajax.post(getWXAjaxUrl, {
                url: window.location.href,
                timestamp: t
            }, function(re) {
                re = typeof(re) === 'string' ? JSON.parse(re) : re;
                var configOb = {
                    debug: false,
                    appId: re.data.appId,
                    timestamp: t,
                    nonceStr: re.data.noncestr,
                    signature: re.data.signature,
                    jsApiList: me.config.jsApiList
                };
                wx.config(configOb);

                //成功回调
                wx.ready(function() {
                    if (typeof me.config.ready == 'function') {
                        //ready函数
                        me.config.ready(wx);
                    }
                });
            });
        }
    };


    if (typeof exports != 'undefined' && !exports.nodeType) {
        exports.getOpenid = getOpenid;
        exports.initWechatShare = initWechatShare;
        exports.initWechatJSSDK = initWechatJSSDK;

    } else {
        root.getOpenid = getOpenid;
        root.initWechatShare = initWechatShare;
        root.initWechatJSSDK = initWechatJSSDK;
    };
}());