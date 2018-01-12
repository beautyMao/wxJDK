# 微信网关SDK

> 微信通用方法

## 

``` 
# getOpenid
 根据cookie 获取openid 如果没有openid 则去微信网关获取

# initWechatShare
初始化微信JSSDK，并且设置微信分享
    initWechatShare({
        title: '联想微视频服务专区',
        desc: '联想微视频服务专区',
        link: window.location.href
     })

# initWechatJSSDK
初始化微信JSSDK，并且设置所需的微信权限
  禁止分享例子：  
   initWechatJSSDK({
    debugFlag: false,
    jsApiList: ['hideOptionMenu'],
    ready: function(wx) {
        wx.hideOptionMenu();
    }

