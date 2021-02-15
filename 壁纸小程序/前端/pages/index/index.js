/*
 * 即刻二开酱茄小程序开源版 v1.1.8
 * Author: gogobody
 * Help document: https://ijkxs.com/
 * github: https://github.com/longwenjunjie/jiangqie_kafei
 * gitee: https://gitee.com/longwenjunj/jiangqie_kafei
 * License：MIT
 * Copyright ️ 2020 ijkxs.com All rights reserved.
 */

const Constants = require('../../utils/constants');
const Api = require('../../utils/api.js');
const Rest = require('../../utils/rest');
const util = require('../../utils/util.js');
let setinad;
Page({
    data: {
        cardCur: 0,
        logo: '',

        background: '',

        //顶部导航
        topNav: [],
        currentTab: 0, //预设当前项的值

        //幻灯片
        slide: [],

        //图片导航
        iconNav: [],

        //热门文章
        hot: [],

        //热门tab
        postsLast: [],
        loaddingLast: false,
        pullUpOnLast: true,

        //其他tab
        posts: [],
        loadding: false,
        pullUpOn: true,

        //列表模式
        pagead:0
    },

    onLoad: function (options) {
        //加载topNav，也就是顶部分类导航栏
        let that = this;
        util.getshare(that);
        // Rest.get(Api.JIANGQIE_SETTING_HOME).then(res => {
        //     console.log(res.data)
        //     that.setData({
        //         topNav: that.data.topNav.concat(res.data.top_nav)
        //     })
        // })
        
        that.init();
    },
    init: function () {
        let that = this;
        //获取配置
        Rest.get(Api.JIANGQIE_SETTING_HOME).then(res => {
            let logo = '../../images/logo.png';
            if (res.data.logo && res.data.logo.length > 0) {
                logo = res.data.logo;
            }
            let top_nav_ =[{
                id: 0,
                name: '首页'
            }]
            that.setData({
                logo: logo,
                slide: res.data.slide,
                iconNav: res.data.icon_nav,
                slides: res.data.slide,
                hot: res.data.hot,
                background: (res.data.slide && res.data.slide.length > 0) ? Api.JIANGQIE_BG_INDEX : '',
                topNav: top_nav_.concat(res.data.top_nav)
            });

            if (res.data.title && res.data.title.length > 0) {
                getApp().appName = res.data.title;
            }
        })

        //加载文章
        this.loadPostLast(true);
    },

    onPullDownRefresh: function () {
        let that = this;
        //加载文章
        this.init();
        wx.stopPullDownRefresh();
    },


    onReachBottom: function () {
        console.log(this.data.currentTab)
        if (this.data.currentTab == 0) {
            if (!this.data.pullUpOnLast) {
                return;
            }
            console.log("到这来了");
            this.loadPostLast(false);
        } else {
            if (!this.data.pullUpOn) {
                return;
            }

            this.loadPost(false);
        }
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


    //nav start----
    handlerSearchClick: function (e) {
        wx.navigateTo({
            url: '/pages/search/search'
        })
    },
    //nav end ----

    //slide start----
    handlerSlideChange: function (e) {
        this.setData({
            current: e.detail.current
        })
    },
    //slide end----

    //tab -- start
    swichNav: function (e) {
        let cur = e.currentTarget.dataset.current;
        if (this.data.currentTab == cur) {
            return false;
        }

        this.setData({
            background: (cur == 0 && this.data.slide && this.data.slide.length > 0) ? Api.JIANGQIE_BG_INDEX : '',
            currentTab: cur
        })

        if (cur !== 0) {
            this.loadPost(true);
        }
    },

    handlerTabMoreClick: function (e) {
        wx.switchTab({
            url: '/pages/categories/categories',
        })
    },
    //tab -- end

    handlerIconNavClick: function (e) {
        let link = e.currentTarget.dataset.link;
        this.openLink(link);
    },

    handlerActiveClick: function (e) {
        let link = e.currentTarget.dataset.link;
        this.openLink(link);
    },

    handlerArticleClick: function (e) {
        let post_id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/article/article?post_id=' + post_id
        })
    },

    //加载数据
    loadPostLast: function (refresh) {
        let that = this;
        that.setData({
            loaddingLast: true
        });
        let offset = 0;
        if (!refresh) {
            offset = that.data.postsLast.length;
        }
        Rest.get(Api.JIANGQIE_POSTS_LAST, {
            'offset': offset
        }).then(res => {
            console.log(res)
            that.setData({
                loaddingLast: false,
                postsLast: refresh ? res.data : that.data.postsLast.concat(res.data),
                pullUpOnLast: res.data.length == Constants.JQ_PER_PAGE_COUNT
            });
        })
    },

    loadPost: function (refresh) {
        let that = this;

        that.setData({
            loadding: true
        });

        let offset = 0;
        if (!refresh) {
            offset = that.data.posts.length;
        }

        Rest.get(Api.JIANGQIE_POSTS_CATEGORY, {
            'offset': offset,
            'cat_id': that.data.topNav[that.data.currentTab].id
        }).then(res => {
            that.setData({
                loadding: false,
                posts: refresh ? res.data : that.data.posts.concat(res.data),
                pullUpOn: res.data.length == Constants.JQ_PER_PAGE_COUNT
            });
        })
    },


    // cardSwiper
    cardSwiper(e) {
        this.setData({
            cardCur: e.detail.current
        })
    },
    openLink: function (link) {
        if (link.startsWith('/pages')) {
            wx.navigateTo({
                url: link,
            })
        } else {
            wx.navigateToMiniProgram({
                appId: link,
                fail: res => {
                    // wx.showToast({
                    //     title: '无效链接',
                    // })
                }
            })
        }
    },


   

})