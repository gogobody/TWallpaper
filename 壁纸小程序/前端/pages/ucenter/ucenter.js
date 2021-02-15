/*
 * 即刻二开酱茄小程序开源版 v1.1.8
 * Author: gogobody
 * Help document: https://ijkxs.com/
 * github: https://github.com/longwenjunjie/jiangqie_kafei
 * gitee: https://gitee.com/longwenjunj/jiangqie_kafei
 * License：MIT
 * Copyright ️ 2020 ijkxs.com All rights reserved.
 */

const Auth = require('../../utils/auth');
const Api = require('../../utils/api.js');
const Rest = require('../../utils/rest');
const util = require('../../utils/util.js');
let setinad;
Page({

    data: {
        setting: {},
        user: undefined,
        menu: {},
        pagead:5
    },

    default: {
        background: Api.JIANGQIE_BG_MY,
        menu: [ //views,likes,favorites,comments,about,feedback,contact,clear,split,link,page
            {
                tp: 'views',
                icon: '../../images/icon_view.png',
                title: '我的浏览',
                line: 1,
            },
            {
                tp: 'likes',
                icon: '../../images/icon_like.png',
                title: '我的点赞',
                line: 1,
            },
            {
                tp: 'favorites',
                icon: '../../images/icon_fav.png',
                title: '我的收藏',
                line: 1,
            },
            {
                tp: 'about',
                icon: '../../images/icon_com.png',
                title: '我也弄一个~',
                line: 1,
            },
            {
                tp: 'about',
                icon: '',
                title: '关于我们',
                line: 1,
            },
            {
                tp: 'feedback',
                icon: '',
                title: '意见反馈',
                line: 1,
            },
            {
                tp: 'contact',
                icon: '',
                title: '在线客服',
                line: 1,
            },
            {
                tp: 'clear',
                icon: '',
                title: '清除缓存',
                line: 0,
            },
        ]
    },
onLoad(){
    let that = this;
        util.getshare(that);
},
    onShow: function (options) {
        let that = this;
        util.getAD(that,function(){
            that.setInterstitialAd(); //加载插屏广告
        })
        let user = Auth.getUser();
        that.setData({
            user: user
        });

        Rest.get(Api.JIANGQIE_SETTING_UCENTER).then(res => {
            console.log()
            let menu = that.default.menu;
            if (res.data.menu.length > 0) {
                menu = res.data.menu;
            }
            that.setData({
                setting: {
                    background: res.data.background ? res.data.background : that.default.background,
                },
                menu: menu
            });
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

    handlerPostTrack: function (e) {
        if (!Auth.getUser()) {
            this.setData({
                showPopLogin: true
            });
            return;
        }

        let track = e.currentTarget.dataset.track;
        wx.navigateTo({
            url: '/pages/list/list?track=' + track
        })
    },

    handlerAbout: function (e) {
        wx.navigateTo({
            url: '/pages/about/about',
        })
    },

    handlerClearCache: function (e) {
        wx.showModal({
            title: '提示',
            content: '清除缓存 需要重新登录',
            success(res) {
                if (res.confirm) {
                    wx.removeStorage({
                        key: 'jiangqie_user',
                        success(res) {
                            console.log(res)
                        }
                    })
                    wx.showToast({
                        title: '清除完毕',
                    });
                    wx.reLaunch({
                        url: '/pages/index/index',
                    })
                }
            }
        });
    },

    handlerLinkClick: function (e) {
        let link = e.currentTarget.dataset.link;
        if (link.startsWith('/pages')) {
            wx.navigateTo({
                url: link,
            })
        } else {
            wx.navigateToMiniProgram({
                appId: link,
                fail: res => {
                   
                }
            })
        }
    },

    handlerPageClick: function (e) {
        let page_id = e.currentTarget.dataset.page_id;
        wx.navigateTo({
            url: '/pages/viewhtml/viewhtml?page_id=' + page_id,
        })
    },

    handlerLoginCancelClick: function (e) {
        this.setData({
            showPopLogin: false
        });
    },

    handlerDoLoginClick: function (e) {
        wx.navigateTo({
            url: '/pages/login/login',
        });

        this.setData({
            showPopLogin: false
        });
    },
})