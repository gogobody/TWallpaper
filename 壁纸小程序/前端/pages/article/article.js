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
const Util = require('../../utils/util');
const Api = require('../../utils/api.js');
const Rest = require('../../utils/rest');
const Auth = require('../../utils/auth');
const WxParse = require('../../components/wxParse/wxParse');
const Poster = require('../../components/poster/poster/poster');
let rewardedVideoAd = null;
Page({

    data: {
        post: {},
        post_like: 0,
        post_favorite: 0,
        comment_count: 0,
        comments: [],
        loadding: false,
        pullUpOn: true,
        loaded: false,
        pagead: 7,
        show_comment_submit: false,
        comment_content: '',
        comment_count_change: 0,
        article_img: '',
        time: null,
        showdel: false
    },
    sloading: true,
    post_id: 0,
    comment_id: 0,

    //小程序码
    wxacode: '',

    //返回页面是否需要刷新
    needRefresh: true,
    setinad:null,
    onLoad: function (options) {
        let date = new Date();
        let day = date.getDay();
        let weeks = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六");
        let week = weeks[day];
        let tobj = {
            hour: date.getHours() > 9 ? date.getHours() : '0' + date.getHours(),
            mins: date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes(),
            mon: date.getMonth(),
            date: date.getDate(),
            week: week,
        }
        this.setData({
            sloading: true,
            time: tobj
        })

        if (options.scene) {
            this.post_id = decodeURIComponent(options.scene);
        } else if (options.post_id) {
            this.post_id = options.post_id;
        }
        //小程序码
        // this.loadWxacode();
        let user = Auth.getUser()
        console.log('user:',user)
        if (user && user.uid == user.auid) {
            this.setData({
                showdel:true
            })
        }
    },

    onShow: function () {
        if (!this.needRefresh) {
            this.needRefresh = true;
            return;
        }

        let that = this;
        Util.getAD(that, function () {
            that.setInterstitialAd(); //加载插屏广告
            //加载广告
            that.loadInterstitialAd();
        })
        Rest.get(Api.JIANGQIE_POST_DETAIL, {
            post_id: that.post_id
        }).then(res => {
            console.log(res)
            wx.setNavigationBarTitle({
                title: res.data.title,
            })

            that.setData({
                post: res.data,
                post_like: res.data.user.islike,
                post_favorite: res.data.user.isfavorite,
                comment_count: Number(res.data.comment_count),
                like_list: res.data.like_list,
            });

            WxParse.wxParse('article', 'md', res.data.content, that, 5);
            this.setData({
                article_img: that.data.article.imageUrls[0] ? this.data.article.imageUrls[0] : '../../images/404.webp'
            })
        });

        // this.loadComments(true);
    },

    // 获取小程序插屏广告
    setInterstitialAd: function () {
        var that = this;
        if (that.data.setAD.interstitialid && wx.createInterstitialAd) {
            let interstitialAd = wx.createInterstitialAd({
                adUnitId: that.data.setAD.interstitialid
            })
            // 监听插屏错误事件
            interstitialAd.onError((err) => {
                console.error(err)
            })
            // 显示广告
            if (interstitialAd) {
                if (that.data.setAD.switch_inad == 'yes') {
                    that.data.setinad = setInterval(() => {
                        interstitialAd.show().catch((err) => {
                            console.error(err)
                        })
                    }, 2000);
                } else {
                    setTimeout(() => {
                        interstitialAd.show().catch((err) => {
                            console.error(err)
                        })
                    }, 6000);
                }

            }
        }
    },
    onHide() {
        if(this.data.setinad){
            clearInterval(that.data.setinad);
        }
    },
    onReachBottom: function () {
        if (!this.data.pullUpOn) {
            return;
        }

        // this.loadComments(false);
    },

    onShareAppMessage: function () {
        let that = this;
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })
        return {
            title: "【" + that.data.post.title + "】分享这张好看的手机壁纸给你~",
            imageUrl: this.data.post.thumbnail,
            path: 'pages/article/article?post_id=' + this.post_id,
        }
    },

    onShareTimeline: function () {
        let that = this;
        return {
            title: "【" + that.data.post.title + "】分享这张好看的手机壁纸给你~",
            query: 'post_id=' + that.post_id,
            imageUrl: that.data.post.thumbnail,
        }
    },
    // 收藏
    onAddToFavorites: function () {
        var that = this;
        return {
            title: that.data.post.title,
            imageUrl: that.data.post.thumbnail,
        }
    },
    /**
     * 海报分享
     */
    sharePosterClick: function (e) {
        let posterConfig = {
            width: 750,
            height: 1334,
            backgroundColor: '#E6372F',
            debug: false,
            pixelRatio: 1,
            blocks: [{
                width: 690,
                height: 1000,
                x: 30,
                y: 234,
                backgroundColor: '#FFFFFF'
            }, ],
            texts: [{
                    x: 375,
                    y: 120,
                    baseLine: 'middle',
                    textAlign: 'center',
                    text: this.data.post.title,
                    width: 600,
                    fontSize: 38,
                    color: '#FFFFFF',
                },
                {
                    x: 70,
                    y: 780,
                    fontSize: 28,
                    lineHeight: 40,
                    baseLine: 'middle',
                    text: this.data.post.excerpt,
                    width: 600,
                    lineNum: 3,
                    color: '#000000',
                    zIndex: 200,
                },
                {
                    x: 360,
                    y: 1170,
                    baseLine: 'middle',
                    textAlign: 'center',
                    text: getApp().appName,
                    fontSize: 28,
                    color: '#888888',
                    zIndex: 200,
                }
            ],
            images: [{
                    width: 690,
                    height: 520,
                    x: 30,
                    y: 200,
                    url: this.data.post.thumbnail,
                    zIndex: 100
                },
                {
                    width: 200,
                    height: 200,
                    x: 275,
                    y: 920,
                    url: this.wxacode,
                }
            ]

        }

        this.setData({
            posterConfig: posterConfig
        }, () => {
            Poster.create(true); // 入参：true为抹掉重新生成 
        });
    },

    /**
     * 画报生成成功
     */
    onPosterSuccess(e) {
        this.needRefresh = false;

        const {
            detail
        } = e;
        wx.previewImage({
            current: detail,
            urls: [detail]
        })
    },

    /**
     * 画报生成失败
     */
    onPosterFail(err) {
        console.error(err);
    },
    delPost(){
        let that = this
        wx.showModal({
            content:'是否删除',
            success (res) {
                if (res.confirm) {
                    let user = Auth.getUser()
                    Rest.get(Api.JIANGQIE_POSTS_DELETE,{
                        uid: user.uid,
                        cid: that.post_id
                    }).then(res => {
                        console.log(res)
                        if(res.code == 0){
                            wx.showToast({
                              title: '删除成功',
                            })
                            Util.navigateBack();
                        }else{
                            wx.showToast({
                                title: '删除失败',
                              })
                        }
                    })
                } 
              }
        })
        
    },
    /**
     * 文章中a标签点击
     */
    wxParseTagATap: function (e) {
        wx.setClipboardData({
            data: e.currentTarget.dataset.src
        });
    },

    /**
     * 点击 TAG
     */
    handlerTagClick: function (e) {
        let tag_id = e.currentTarget.dataset.id;
        let tag = e.currentTarget.dataset.tag;
        wx.navigateTo({
            url: '/pages/list/list?title=' + tag + '&tag_id=' + tag_id,
        })
    },

    /**
     * 跳转返回
     */
    jumpBtn: function (options) {
        Util.navigateBack();
    },
    /**
     * 文章 点赞
     */
    handlerLikeClick: function (e) {
        let that = this;
        Rest.get(Api.JIANGQIE_USER_LIKE, {
            post_id: that.data.post.id
        }).then(res => {
            let avatar = Auth.getUser().avatar;
            var index = that.data.like_list.indexOf(avatar);
            if (index > -1) {
                that.data.like_list.splice(index, 1);
            } else {
                that.data.like_list.unshift(avatar);
            }

            that.setData({
                post_like: (that.data.post_like == 1 ? 0 : 1),
                like_list: that.data.like_list
            });
        })
    },

    /**
     * 评论 弹框
     */
    handlerCommentClick: function (e) {
        this.comment_id = 0;
        this.setData({
            show_comment_submit: true
        });
    },

    /**
     * 评论 取消
     */
    handlerCancelClick: function (e) {
        this.setData({
            show_comment_submit: false
        });
    },

    /**
     * 评论 提交
     */
    handlerCommentSubmit: function (e) {
        let that = this;
        Rest.get(Api.JIANGQIE_COMMENT_ADD, {
            post_id: that.post_id,
            parent_id: that.comment_id,
            content: that.data.comment_content
        }).then(res => {
            that.setData({
                comment_count_change: that.data.comment_count_change + (res.data.comment_verify == 1 ? 0 : 1),
                show_comment_submit: false
            });

            // that.loadComments(true);
        });
    },

    /**
     * 评论 回复
     */
    handlerCommentReplyClick: function (e) {
        this.comment_id = e.currentTarget.dataset.id;
        this.setData({
            show_comment_submit: true
        });
    },

    /**
     * 评论 删除
     */
    handlerCommentDeleteClick: function (e) {
        let that = this;

        wx.showModal({
            title: '提示',
            content: '确定要删除吗？',
            success(res) {
                if (res.confirm) {
                    let comment_id = e.currentTarget.dataset.id;
                    Rest.get(Api.JIANGQIE_COMMENT_DELETE, {
                        comment_id: comment_id
                    }).then(res => {
                        that.setData({
                            comment_count_change: that.data.comment_count_change - 1
                        });
                        // that.loadComments(true);
                    });
                }
            }
        });
    },

    /**
     * 评论输入
     */
    handlerContentInput: function (e) {
        this.setData({
            comment_content: e.detail.value
        });
    },

    /**
     * 文章 收藏
     */
    handlerFavoriteClick: function (e) {
        let that = this;
        Rest.get(Api.JIANGQIE_USER_FAVORITE, {
            post_id: that.data.post.id
        }).then(res => {
            that.setData({
                post_favorite: (that.data.post_favorite == 1 ? 0 : 1)
            });
        })
    },

    /**
     * 加载小程序码
     */
    loadWxacode: function () {
        let that = this;
        Rest.get(Api.JIANGQIE_POST_WXACODE, {
            post_id: that.post_id
        }).then(res => {
            that.wxacode = res.data;
        }, err => {
            console.log(err);
        });
    },

    /**
     * 加载 评论
     */
    loadComments: function (refresh) {
        let that = this;

        that.setData({
            loadding: true
        });

        let offset = 0;
        if (!refresh) {
            offset = that.data.comments.length;
        }

        Rest.get(Api.JIANGQIE_COMMENT_INDEX, {
            post_id: that.post_id,
            offset: offset
        }).then(res => {
            that.setData({
                loaded: true,
                loadding: false,
                comments: refresh ? res.data : that.data.comments.concat(res.data),
                pullUpOn: res.data.length == Constants.JQ_PER_PAGE_COUNT,
            });
        });
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




    // 二开版权信息
    showModal(e) {
        this.setData({
            modalName: e.currentTarget.dataset.target
        })
    },
    hideModal(e) {
        this.setData({
            modalName: null
        })
    },
    // 二开版权信息end



    // 二开下载
    downloadPhotos: function (e) {
        // 判断用户是否登入
        if (!Auth.getUser()) {
            this.setData({
                showPopLogin: true
            });
            return;
        }


        //准备下载壁纸
        var self = this;
        //缓存
        var openAdLogs = wx.getStorageSync('openAdLogs');
        var atdate = new Date();
        atdate = atdate.getFullYear() + "-" + (atdate.getMonth() + 1) + '-' + atdate.getDate();
        console.log("当前日期：" + atdate);

        if (openAdLogs.length <= 0) { //缓存不存在
            if(this.data.setAD.enableNoAd){
                self.downloadPhoto(e);
            }else{
                wx.showModal({
                    title: '壁纸下载',
                    content: '每天只需要看一次广告就可以下载所有的壁纸了~',
                    success(res) {
                        if (res.confirm) {
                            console.log('用户点击确定');
                            self.readMore();
                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
                    }
                })
            }
            
        } else { //缓存存在
            if (openAdLogs[0].date == atdate) {
                if (openAdLogs[0].num != 0) {
                    openAdLogs[0].num = openAdLogs[0].num - 1
                    wx.setStorageSync('openAdLogs', openAdLogs);
                    self.downloadPhoto(e);
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '已经下载10张啦~需要我帮你收藏这张壁纸吗？等明天再来下载',
                        success(res) {
                            if (res.confirm) {
                                self.handlerFavoriteClick(e);
                                console.log('用户点击确定')
                            } else if (res.cancel) {
                                console.log('用户点击取消')
                            }
                        }
                    })
                }
            } else {
                wx.showModal({
                    title: '壁纸下载',
                    content: '每天只需要看一次广告就可以下载所有的壁纸了~',
                    success(res) {
                        if (res.confirm) {
                            console.log('用户点击确定');

                            self.readMore();

                            console.log("无广告下载~");

                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
                    }
                })
            }
        }
    },


    // 打开激励视频
    readMore: function () {
        var self = this;
        var platform = self.data.platform
        if (platform == 'devtools') {
            wx.showToast({
                title: "开发工具无法显示激励视频",
                icon: "none",
                duration: 2000
            });
            self.setData({
                detailSummaryHeight: ''
            })
        } else {
            rewardedVideoAd.show()
                .catch(() => {
                    rewardedVideoAd.load()
                        .then(() => rewardedVideoAd.show())
                        .catch(err => {
                            console.log('激励视频 广告显示失败');
                            self.setData({
                                detailSummaryHeight: ''
                            })
                        })
                })
        }

    },


    //下载壁纸
    downloadPhoto: function (e) {
        var t = this;
        var photourl = t.data.article.imageUrls[0];
        wx.showLoading({
            title: '正在保存...',
        })
        wx.downloadFile({
            url: photourl,
            success: function (e) {
                wx.saveImageToPhotosAlbum({
                    filePath: e.tempFilePath,
                    success: function (e) {
                        setTimeout(function () {
                            wx.hideLoading()
                        }, 2000)
                        wx.showToast({
                            title: '保存成功',
                            icon: "success",
                            duration: 2e3
                        })
                    },
                    fail: function (e) {
                        "saveImageToPhotosAlbum:fail auth deny" === e.errMsg && wx.openSetting({
                            success: function (e) {
                                console.log(e), e.authSetting["scope.writePhotosAlbum"] ? console.log("获取权限成功，给出再次点击图片保存到相册的提示。") : console.log("获取权限失败，给出不给权限就无法正常使用的提示");
                            }
                        });
                    },
                    complete: function (e) {
                        wx.hideLoading();
                    }
                })
            }
        })
    },



    //加载广告
    loadInterstitialAd: function () {
        var self = this;
        if (wx.createRewardedVideoAd) {
            rewardedVideoAd = wx.createRewardedVideoAd({
                adUnitId: self.data.setAD.rewardedVideoid
            })
            rewardedVideoAd.onLoad(() => {
                console.log('onLoad event emit')
            })
            rewardedVideoAd.onError((err) => {
                console.log(err);
                this.setData({
                    detailSummaryHeight: ''
                })
            })
            rewardedVideoAd.onClose((res) => {

                var id = self.data.post.id;
                if (res && res.isEnded) {

                    var nowDate = new Date();
                    nowDate = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();

                    var openAdLogs = [];
                    // 过滤重复值
                    if (openAdLogs.length > 0) {
                        openAdLogs = openAdLogs.filter(function (log) {
                            return log["id"] !== id;
                        });
                    }
                    // 如果超过指定数量不再记录
                    if (openAdLogs.length < 21) {
                        var log = {
                            "id": id,
                            "date": nowDate,
                            "num": 9
                        }
                        openAdLogs.unshift(log);
                        wx.setStorageSync('openAdLogs', openAdLogs);
                        console.log(openAdLogs);

                    }
                    this.setData({
                        detailSummaryHeight: ''
                    })
                    self.downloadPhoto();
                } else {
                    wx.showToast({
                        title: "你中途关闭了视频",
                        icon: "none",
                        duration: 3000
                    });
                }
            })
        }
    },
    imgOnerror: function () {
        console.log('404')
    },
    imgLoaded:function(){
        this.setData({
            sloading: false
        })
    }
})