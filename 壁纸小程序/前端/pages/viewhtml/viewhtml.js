/*
 * 即刻二开酱茄小程序开源版 v1.1.8
 * Author: gogobody
 * Help document: https://ijkxs.com/
 * github: https://github.com/longwenjunjie/jiangqie_kafei
 * gitee: https://gitee.com/longwenjunj/jiangqie_kafei
 * License：MIT
 * Copyright ️ 2020 ijkxs.com All rights reserved.
 */

const Api = require('../../utils/api.js');
const Rest = require('../../utils/rest');
const WxParse = require('../../components/wxParse/wxParse');
const util = require('../../utils/util.js');
let setinad;
Page({

    data: {
        pagead:7
    },

    onLoad: function (options) {
        let that = this;
        util.getshare(that);
        Rest.get(Api.JIANGQIE_POST_PAGE, {
            page_id: options.page_id
        }).then(res => {
            wx.setNavigationBarTitle({
                title: res.data.title,
            })

            WxParse.wxParse('article', 'md', res.data.content, that, 5);
        });
    },
onShow(){
    let that = this;
    util.getAD(that,function(){
        that.setInterstitialAd(); //加载插屏广告
    })
},
 // 获取小程序插屏广告
 setInterstitialAd: function () {
    var that = this;
   if(that.data.setAD.interstitialid&&wx.createInterstitialAd){
       let interstitialAd = wx.createInterstitialAd({
           adUnitId: that.data.setAD.interstitialid
       })
        // 监听插屏错误事件
       interstitialAd.onError((err) => {
           console.error(err)
       })
        // 显示广告
       if (interstitialAd) {
           if(that.data.setAD.switch_inad=='yes'){
               setinad = setInterval(() => {
                   interstitialAd.show().catch((err) => {
                       console.error(err)
                   })
               }, 2000);
           }
           else{
               setTimeout(() => {
                   interstitialAd.show().catch((err) => {
                       console.error(err)
                   })
               }, 2000);
           }
           
    }
   }
},
onHide(){
clearInterval(setinad);
},
   onShareAppMessage: function () {
       var that = this;
       wx.showShareMenu({
           withShareTicket: true,
           menus: ['shareAppMessage', 'shareTimeline']
       })
       return {
           title: that.data.shares.share_title,
           imageUrl: that.data.shares.share_image,
       }
   },
   //转发朋友圈
   onShareTimeline: function () {
       var that = this;
       return {
           title: that.data.shares.share_title,
           imageUrl: that.data.shares.share_image,
       }
   },
   // 收藏
   onAddToFavorites:function(){
       var that = this;
       return {
           title: that.data.shares.share_title,
           imageUrl: that.data.shares.share_image,
       }
   },

})