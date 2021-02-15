/*
 * 即刻二开酱茄小程序开源版 v1.1.8
 * Author: gogobody
 * Help document: https://ijkxs.com/
 * github: https://github.com/longwenjunjie/jiangqie_kafei
 * gitee: https://gitee.com/longwenjunj/jiangqie_kafei
 * License：MIT
 * Copyright ️ 2020 ijkxs.com All rights reserved.
 */

const Api = require('../../utils/api');
const Rest = require('../../utils/rest');
const util = require('../../utils/util.js');
let setinad;
Page({
    data: {
        setting: {},
        categories: [],
        categorie_cover: Api.JIANGQIE_CAT_COVER,
        pagead:1,
        pageadB:2,
    },

    default: {
        background: Api.JIANGQIE_BG_CATEGORY,
        title: '分类标题，请在后台修改',
        description: '分类描述，请在后台修改',
    },

    onLoad: function (options) {
        //获取配置
        let that = this;
        util.getshare(that);
        Rest.get(Api.JIANGQIE_SETTING_CATEGORY).then(res => {
            that.setData({
                setting: {
                    background: res.data.background ? res.data.background : that.default.background,
                    title: res.data.title ? res.data.title : that.default.title,
                    description: res.data.description ? res.data.description : that.default.description,
                }
            });
        });

        //获取一级分类
        Rest.get(Api.JIANGQIE_CATEGORY_INDEX).then(res => {
            that.setData({
                categories: res.data
            });
        });
    },

    onShow(){
        var that = this;
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
                }, 6000);
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


    handlerCategoryClick: function (e) {
        let cat_id = e.currentTarget.dataset.id;
        let cat_name = e.currentTarget.dataset.name;
        wx.navigateTo({
            url: '/pages/list/list?cat_id=' + cat_id + '&title=' + cat_name
        })
    },

})