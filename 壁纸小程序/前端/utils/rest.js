/*
 * 即刻二开酱茄小程序开源版 v1.1.8
 * Author: gogobody
 * Help document: https://ijkxs.com/
 * github: https://github.com/longwenjunjie/jiangqie_kafei
 * gitee: https://gitee.com/longwenjunj/jiangqie_kafei
 * License：MIT
 * Copyright ️ 2020 ijkxs.com All rights reserved.
 */

const Auth = require('./auth');
/**
 * request封装
 */
function request(url, data = {}, method = "GET") {
    return new Promise(function (resolve, reject) {
        let pages = getCurrentPages();
        let currentPage = pages[pages.length - 1];
        currentPage.setData({loading: true});
        // wx.showLoading();

        data.token = Auth.getToken();
        data.plantform = 'mp-weixin'
        wx.request({
            url: url,
            data: data,
            method: method,
            success: function (res) {
                console.log(url)
                console.log(res)
                // if(url.indexOf("home") != -1){
                //     for(var i=0;i<res.data.data.slide.length;i++){
                //         res.data.data.slide[i].thumbnail = res.data.data.slide[i].thumbnail.replace('https://bz.jikebox.cn', 'https://bizhi.jikebox.cn');
                //     }
                // }
                // if(url.indexOf("last") != -1||url.indexOf("hot") != -1||url.indexOf("search") != -1||url.indexOf("tag") != -1||url.indexOf("my") != -1||url.indexOf("posts/category") != -1){
                //     for(var i=0;i<res.data.data.length;i++){
                //         res.data.data[i].thumbnail = res.data.data[i].thumbnail.replace('https://bz.jikebox.cn', 'https://bizhi.jikebox.cn');
                //     }
                // }
                
                // if(url.indexOf("detail") != -1){
                //     res.data.data.thumbnail = res.data.data.thumbnail.replace('https://bz.jikebox.cn', 'https://bizhi.jikebox.cn');
                //     res.data.data.content = res.data.data.content.replace('https://bz.jikebox.cn', 'https://bizhi.jikebox.cn');
                // }
                // wx.hideLoading();
                currentPage.setData({loading: false});

                if (res.statusCode != 200) {
                    reject(res.errMsg);
                    return;
                }

                if (res.data.code == -1) {
                    currentPage.setData({
                        showPopLogin: true
                    });
                    return;
                }

                if (res.data.code == 0) {
                    resolve(res.data);
                    return;
                }
                resolve(res.data);
            },
            fail: function (err) {
                // wx.hideLoading();
                currentPage.setData({loading: false});

                reject(err);
            }
        })
    });
}

/**
 * get请求
 */
function get(url, data = {}) {
    return request(url, data, 'GET')
}

/**
 * post请求
 */
function post(url, data = {}) {
    return request(url, data, 'POST')
}

module.exports = {
    get,
    post,
}