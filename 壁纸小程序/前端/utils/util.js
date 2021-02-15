/*
 * 即刻二开酱茄小程序开源版 v1.1.8
 * Author: gogobody
 * Help document: https://ijkxs.com/
 * github: https://github.com/longwenjunjie/jiangqie_kafei
 * gitee: https://gitee.com/longwenjunj/jiangqie_kafei
 * License：MIT
 * Copyright ️ 2020 ijkxs.com All rights reserved.
 */
const Api = require('api.js');
const Rest = require('rest.js');
function navigateBack() {
    wx.navigateBack({
        delta: 1,
        fail: function (res) {
            wx.switchTab({
              url: '/pages/index/index',
            })
        }
    });
}
function getAD(that,showad){
    Rest.get(Api.JIANGQIE_SETTING_AD).then(res => {
        res.data.posisionad =  res.data.posisionad.length >0 ? res.data.posisionad.split(','):[];
        console.log(res.data)
        that.setData({
            setAD: res.data
        })
        showad();
    })
}
function getshare(that){
    Rest.get(Api.JIANGQIE_SETTING_SHARE).then(res => {
        console.log(res.data)
        that.setData({
            shares: res.data
        })
    })
}


module.exports = {
    navigateBack,
    getAD,
    getshare,
}