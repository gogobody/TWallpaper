<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;
/**
 * TW壁纸 即刻壁纸小程序专用插件
 *
 * @package TWallpaper
 * @author gogobody
 * @version 1.0.0
 * @link https://geekscholar.net
 *
 */

class TWallpaper_Plugin implements Typecho_Plugin_Interface
{
    /**
     * 激活插件方法,如果激活失败,直接抛出异常
     * 
     * @access public
     * @return void
     * @throws Typecho_Plugin_Exception
     */
    public static function activate()
    {
        self::sqlInstall();
        $base = '/twallpaper/v1';
        $setting = $base . '/setting';

        Helper::addRoute('get_home', $setting . '/home', 'TWallpaper_Action', 'get_home');
        Helper::addRoute('get_hot', $setting . '/hot', 'TWallpaper_Action', 'get_hot');
        Helper::addRoute('get_category', $setting . '/category', 'TWallpaper_Action', 'get_category');

        Helper::addRoute('get_ucenter', $setting . '/ucenter', 'TWallpaper_Action', 'get_ucenter');
        //分享配置
        Helper::addRoute('get_share', $setting . '/share', 'TWallpaper_Action', 'get_share');
        //流量主
        Helper::addRoute('get_advertisement', $setting . '/advertisement', 'TWallpaper_Action', 'get_advertisement');

        $category = $base . '/category';
        //获取所有分类
        Helper::addRoute('get_index', $category . '/index', 'TWallpaper_Action', 'get_index');


        $comment = $base . '/comment';
        //文章的评论列表
        Helper::addRoute('comment_index', $comment . '/index', 'TWallpaper_Action', 'comment_index');
        //发布评论
        Helper::addRoute('comment_add', $comment . '/add', 'TWallpaper_Action', 'comment_add');
        //删除评论
        Helper::addRoute('comment_delete', $comment . '/delete', 'TWallpaper_Action', 'comment_delete');


        $post = $base . '/posts';
        //最新文章
        Helper::addRoute('get_last_posts', $post . '/last', 'TWallpaper_Action', 'get_last_posts');
        //获取某个分类下的文章
        Helper::addRoute('get_category_posts', $post . '/category', 'TWallpaper_Action', 'get_category_posts');
        //获取某个TAG下的文章
        Helper::addRoute('get_tag_posts', $post . '/tag', 'TWallpaper_Action', 'get_tag_posts');
        //搜索
        Helper::addRoute('get_search_posts', $post . '/search', 'TWallpaper_Action', 'get_search_posts');
        //热门搜索
        Helper::addRoute('get_search_hot', $post . '/search/hot', 'TWallpaper_Action', 'get_search_hot');
        //文章详情
        Helper::addRoute('get_post_detail', $post . '/detail', 'TWallpaper_Action', 'get_post_detail');
        //页面详情
        Helper::addRoute('get_post_page', $post . '/page', 'TWallpaper_Action', 'get_post_page');
        //热门 浏览数[views] 点赞数[likes] 评论数[commnets]
        Helper::addRoute('get_hot_posts', $post . '/hot', 'TWallpaper_Action', 'get_hot_posts');
        //我的文章 浏览数[views] 点赞数[likes] 评论数[commnets] 收藏[favorite]
        Helper::addRoute('get_my_posts', $post . '/my', 'TWallpaper_Action', 'get_my_posts');
        //二维码
        Helper::addRoute('get_wxacode', $post . '/wxacode', 'TWallpaper_Action', 'get_wxacode');


        $user = $base . '/user';
        //用户登陆
        Helper::addRoute('user_login', $user . '/login', 'TWallpaper_Action', 'user_login');
        //用户配置
        Helper::addRoute('user_index', $user . '/index', 'TWallpaper_Action', 'user_index');
        //用户点赞
        Helper::addRoute('user_like', $user . '/like', 'TWallpaper_Action', 'user_like');
        //用户收藏
        Helper::addRoute('user_favorite', $user . '/favorite', 'TWallpaper_Action', 'user_favorite');

        Typecho_Plugin::factory('Widget_Contents_Post_Edit')->getDefaultFieldItems = array(__CLASS__, 'setDefaultField');
    }
    /**
     * 禁用插件方法,如果禁用失败,直接抛出异常
     * 
     * @static
     * @access public
     * @return void
     * @throws Typecho_Plugin_Exception
     */
    public static function deactivate(){
        Helper::removeRoute('get_home');
        Helper::removeRoute('get_hot');
        Helper::removeRoute('get_category');
        Helper::removeRoute('get_ucenter');
        Helper::removeRoute('get_index');
        Helper::removeRoute('get_share');
        Helper::removeRoute('get_advertisement');

        Helper::removeRoute('comment_index');
        Helper::removeRoute('comment_add');
        Helper::removeRoute('comment_delete');

        Helper::removeRoute('get_last_posts');
        Helper::removeRoute('get_category_posts');
        Helper::removeRoute('get_search_posts');
        Helper::removeRoute('get_search_hot');
        Helper::removeRoute('get_tag_posts');
        Helper::removeRoute('get_post_detail');
        Helper::removeRoute('get_post_page');
        Helper::removeRoute('get_hot_posts');
        Helper::removeRoute('get_my_posts');
        Helper::removeRoute('get_wxacode');

        Helper::removeRoute('user_login');
        Helper::removeRoute('user_index');
        Helper::removeRoute('user_like');
        Helper::removeRoute('user_favorite');

    }
    public static function setDefaultField($layout){
        $thumb = new Typecho_Widget_Helper_Form_Element_Text('thumb', null, null, _t('缩略图'), _t('非必填。填写的话，首页优先显示默认缩略图'));
        $layout->addItem($thumb);  //  注册
    }
    /**
     * 获取插件配置面板
     * 
     * @access public
     * @param Typecho_Widget_Helper_Form $form 配置面板
     * @return void
     */
    public static function config(Typecho_Widget_Helper_Form $form)
    {
        ?>
        <div class="j-setting-contain">
        <link href="<?php echo Helper::options()->rootUrl ?>/usr/plugins/TWallpaper/assets/css/joe.setting.min.css" rel="stylesheet" type="text/css" />
        <div>
            <div class="j-aside">
                <div class="logo">TWallpaper<br><small>Typecho 壁纸小程序配套插件<br>by gogobody</small></div>
                <ul class="j-setting-tab">
                    <li data-current="j-setting-notice">插件公告</li>
                    <li data-current="j-setting-basic">基础设置</li>
                    <li data-current="j-setting-index">首页设置</li>
                    <!--                <li data-current="j-setting-category">分类设置</li>-->
                    <!--                <li data-current="j-setting-hot">热门设置</li>-->
                    <li data-current="j-setting-llz">流量主设置</li>
                    <!--                <li data-current="j-setting-profile">我的设置</li>-->
                </ul>
                <?php require_once('Backups.php'); ?>
            </div>
        </div>
        <span id="j-version" style="display: none;">1.0.0</span>
        <div class="j-setting-notice"></div>
        <script src="<?php echo Helper::options()->rootUrl ?>/usr/plugins/TWallpaper/assets/js/joe.setting.min.js"></script>
        <?php
        /**
         * 基础设置
         */
        $Jtitle = new Typecho_Widget_Helper_Form_Element_Text(
            'JTitle',
            NULL,
            "即刻壁纸",
            '标题',
            '请输入小程序标题'
        );
        $Jtitle->setAttribute('class', 'j-setting-content j-setting-basic');
        $form->addInput($Jtitle);

        $Jlogo = new Typecho_Widget_Helper_Form_Element_Text(
            'JLogo',
            NULL,
            "https://cdn.jsdelivr.net/gh/gogobody/Modify_Joe_Theme@4.6.6/assets/img/logo-white.svg",
            'logo',
            '请输入logo地址'
        );
        $Jlogo->setAttribute('class', 'j-setting-content j-setting-basic');
        $form->addInput($Jlogo);

        $JAppid = new Typecho_Widget_Helper_Form_Element_Text(
            'JAppid',
            NULL,
            Null,
            'Appid',
            '微信小程序 Appid'
        );
        $JAppid->setAttribute('class', 'j-setting-content j-setting-basic');
        $form->addInput($JAppid);

        $JApp_secret = new Typecho_Widget_Helper_Form_Element_Text(
            'JApp_secret',
            NULL,
            Null,
            'AppSecret',
            '微信小程序 AppSecret'
        );
        $JApp_secret->setAttribute('class', 'j-setting-content j-setting-basic');
        $form->addInput($JApp_secret);

//        $JQQAppid = new Typecho_Widget_Helper_Form_Element_Text(
//            'JQQAppid',
//            NULL,
//            Null,
//            'QQAppid',
//            'QQ小程序 Appid'
//        );
//        $JQQAppid->setAttribute('class', 'j-setting-content j-setting-basic');
//        $form->addInput($JQQAppid);
//
//        $JQQApp_secret = new Typecho_Widget_Helper_Form_Element_Text(
//            'JQQApp_secret',
//            NULL,
//            Null,
//            'JQQApp_secret',
//            'QQ小程序 App_secret'
//        );
//        $JQQApp_secret->setAttribute('class', 'j-setting-content j-setting-basic');
//        $form->addInput($JQQApp_secret);

        $JShare_title = new Typecho_Widget_Helper_Form_Element_Text(
            'JShare_title',
            NULL,
            Null,
            '小程序分享标题',
            '小程序 分享标题'
        );
        $JShare_title->setAttribute('class', 'j-setting-content j-setting-basic');
        $form->addInput($JShare_title);

        $JShare_image = new Typecho_Widget_Helper_Form_Element_Text(
            'JShare_image',
            NULL,
            Null,
            '小程序分享图',
            '小程序分享图'
        );
        $JShare_image->setAttribute('class', 'j-setting-content j-setting-basic');
        $form->addInput($JShare_image);

        $JHide_cat = new Typecho_Widget_Helper_Form_Element_Text(
            'JHide_cat',
            NULL,
            Null,
            '隐藏分类',
            '隐藏相应分类下的文章,分类ID,英文逗号分隔<br>例如：3,4,7'
        );
        $JHide_cat->setAttribute('class', 'j-setting-content j-setting-basic');
        $form->addInput($JHide_cat);

//        $JSwitch_excerpt = new Typecho_Widget_Helper_Form_Element_Radio(
//                'JSwitch_excerpt',
//            array(
//                    '0' => '不显示',
//                    '1' => '显示'
//            ),
//            '1','文章摘要','文章列表中是否显示摘要?'
//        );
//        $JSwitch_excerpt->setAttribute('class', 'j-setting-content j-setting-basic');
//        $form->addInput($JSwitch_excerpt);

        $JSwitch_comment = new Typecho_Widget_Helper_Form_Element_Radio(
            'JSwitch_comment',
            array(
                '0' => '否',
                '1' => '是'
            ),
            '0','下载','是否开启下载功能?'
        );
        $JSwitch_comment->setAttribute('class', 'j-setting-content j-setting-basic');
        $form->addInput($JSwitch_comment);
//
//        $JSwitch_comment_verify = new Typecho_Widget_Helper_Form_Element_Radio(
//            'JSwitch_comment_verify',
//            array(
//                '0' => '否',
//                '1' => '是'
//            ),
//            '0','评论审核','评论是否需要审核?'
//        );
//        $JSwitch_comment_verify->setAttribute('class', 'j-setting-content j-setting-basic');
//        $form->addInput($JSwitch_comment_verify);

        $JDefault_thumbnail = new Typecho_Widget_Helper_Form_Element_Text(
            'JDefault_thumbnail',
            NULL,
            Null,
            '默认微缩图',
            '默认微缩图'
        );
        $JDefault_thumbnail->setAttribute('class', 'j-setting-content j-setting-basic');
        $form->addInput($JDefault_thumbnail);

        $JSwitch_stick = new Typecho_Widget_Helper_Form_Element_Radio(
            'JSwitch_stick',
            array(
                '0' => '否',
                '1' => '是'
            ),
            '0','置顶功能','是否开启置顶功能'
        );
        $JSwitch_stick->setAttribute('class', 'j-setting-content j-setting-basic');
        $form->addInput($JSwitch_stick);

        $JSticky_posts = new Typecho_Widget_Helper_Form_Element_Text(
            'JSticky_posts',
            NULL,
            Null,
            '置顶文章id',
            '置顶文章id，英文逗号分隔,如：1,2,3'
        );
        $JSticky_posts->setAttribute('class', 'j-setting-content j-setting-basic');
        $form->addInput($JSticky_posts);

        /**
         * 首页设置
         */

        $JHome_top_nav = new Typecho_Widget_Helper_Form_Element_Text(
            'JHome_top_nav',
            NULL,
            "1,2,3",
            '顶部导航',
            '分类ID,英文逗号分隔<br>例如：8,12,23'
        );
        $JHome_top_nav->setAttribute('class', 'j-setting-content j-setting-index');
        $form->addInput($JHome_top_nav);

        $JTop_slide = new Typecho_Widget_Helper_Form_Element_Text(
            'JTop_slide',
            NULL,
            Null,
            '幻灯片',
            '设置首页幻灯片显示的文章,文章ID,英文逗号分隔<br>例如：8,12,23'
        );
        $JTop_slide->setAttribute('class', 'j-setting-content j-setting-index');
        $form->addInput($JTop_slide);

//        $JHome_icon_nav = new Typecho_Widget_Helper_Form_Element_Textarea(
//            'JHome_icon_nav',
//            NULL,
//            "https://xcx.jiangqie.com/wp-content/uploads/2020/05/32-1.png||使用必读||/pages/article/article?post_id=76",
//            '导航',
//            '设置首页导航页显示，一行一个，格式：图标||标题||链接<br>
//                         https://xcx.jiangqie.com/wp-content/uploads/2020/05/32-1.png||代码下载||/pages/article/article?post_id=261<br>post_id是要显示文章的id'
//        );
//        $JHome_icon_nav->setAttribute('class', 'j-setting-content j-setting-index');
//        $form->addInput($JHome_icon_nav);
//
//        $JHome_active_left = new Typecho_Widget_Helper_Form_Element_Textarea(
//            'JHome_active_left',
//            NULL,
//            "https://xcx.jiangqie.com/wp-content/uploads/2020/03/EGPDILPZWU.jpg||免责声明（用前阅读）||/pages/article/article?post_id=75",
//            '活动区域图-左图',
//            '活动区域图-左图，格式：图标||标题||链接'
//        );
//        $JHome_active_left->setAttribute('class', 'j-setting-content j-setting-index');
//        $form->addInput($JHome_active_left);
//
//        $JHome_active_right_top = new Typecho_Widget_Helper_Form_Element_Textarea(
//            'JHome_active_right_top',
//            NULL,
//            "https://xcx.jiangqie.com/wp-content/uploads/2020/03/3NXCLQST85.jpg||即刻学术“功能清单”||/pages/article/article?post_id=74",
//            '活动区域图-右上图',
//            '活动区域图-右上图，格式：图标||标题||链接'
//        );
//        $JHome_active_right_top->setAttribute('class', 'j-setting-content j-setting-index');
//        $form->addInput($JHome_active_right_top);
//
//        $JHome_active_right_down = new Typecho_Widget_Helper_Form_Element_Textarea(
//            'JHome_active_right_down',
//            NULL,
//            "https://xcx.jiangqie.com/wp-content/uploads/2020/03/MKU6SHQ8WU.jpg||有疑问不妨看看这里...||/pages/article/article?post_id=76",
//            '活动区域图-右下图',
//            '活动区域图-右下图，格式：图标||标题||链接'
//        );
//        $JHome_active_right_down->setAttribute('class', 'j-setting-content j-setting-index');
//        $form->addInput($JHome_active_right_down);

        $JHome_hot = new Typecho_Widget_Helper_Form_Element_Text(
            'JHome_hot',
            NULL,
            "71",
            '首页热门',
            '设置设置首页热门文章,文章ID,英文逗号分隔<br>例如：8,12,23'
        );
        $JHome_hot->setAttribute('class', 'j-setting-content j-setting-index');
        $form->addInput($JHome_hot);

//        $JHome_list_mode = new Typecho_Widget_Helper_Form_Element_Select(
//            'JHome_list_mode',
//            array(
//                '3'         => '混合模式',
//                '1'         => '小图模式',
//                '2'         => '大图模式',
//            ),
//            '3',
//            '列表模式',
//            '首页文章列表显示方式'
//        );
//        $JHome_list_mode->setAttribute('class', 'j-setting-content j-setting-index');
//        $form->addInput($JHome_list_mode);

        /**
         * 分类设置
         */
//        $JCategory_background = new Typecho_Widget_Helper_Form_Element_Text(
//            'JCategory_background',
//            NULL,
//            "https://xcx.jiangqie.com/wp-content/uploads/2020/08/777.png",
//            '分类背景图',
//            '分类背景图'
//        );
//        $JCategory_background->setAttribute('class', 'j-setting-content j-setting-category');
//        $form->addInput($JCategory_background);

//        $JCategory_title = new Typecho_Widget_Helper_Form_Element_Text(
//            'JCategory_title',
//            NULL,
//            "分类聚合",
//            '分类标题',
//            '分类标题'
//        );
//        $JCategory_title->setAttribute('class', 'j-setting-content j-setting-category');
//        $form->addInput($JCategory_title);

//        $JCategory_description = new Typecho_Widget_Helper_Form_Element_Text(
//            'JCategory_description',
//            NULL,
//            "即刻学术站下分类",
//            '分类描述',
//            '分类描述'
//        );
//        $JCategory_description->setAttribute('class', 'j-setting-content j-setting-category');
//        $form->addInput($JCategory_description);


        /**
         * 热榜设置
         */
//        $JHot_background= new Typecho_Widget_Helper_Form_Element_Text(
//            'JHot_background',
//            NULL,
//            "https://xcx.jiangqie.com/wp-content/uploads/2020/08/333.png",
//            '热门背景图',
//            '热门背景图'
//        );
//        $JHot_background->setAttribute('class', 'j-setting-content j-setting-hot');
//        $form->addInput($JHot_background);
//
//        $JHot_title = new Typecho_Widget_Helper_Form_Element_Text(
//            'JHot_title',
//            NULL,
//            "即刻热榜",
//            '热门标题',
//            '热门标题'
//        );
//        $JHot_title->setAttribute('class', 'j-setting-content j-setting-hot');
//        $form->addInput($JHot_title);
//
//        $JHot_description = new Typecho_Widget_Helper_Form_Element_Text(
//            'JHot_description',
//            NULL,
//            "即刻学术是一个以技术和学术为主导的综合门户",
//            '热门描述',
//            '热门描述'
//        );
//        $JHot_description->setAttribute('class', 'j-setting-content j-setting-hot');
//        $form->addInput($JHot_description);

        /**
         * 流量主设置
         */
        $JEnable_noad_download = new Typecho_Widget_Helper_Form_Element_Radio(
            'JEnable_noad_download',
            array(
                '0' => '否',
                '1' => '是'
            ),
            '0','无广告下载','是否开启无广告下载功能?'
        );
        $JEnable_noad_download->setAttribute('class', 'j-setting-content j-setting-llz');
        $form->addInput($JEnable_noad_download);

        $JBannerid = new Typecho_Widget_Helper_Form_Element_Text(
            'JBannerid',
            NULL,
            "",
            'banner广告id',
            '请输入banner广告id'
        );
        $JBannerid->setAttribute('class', 'j-setting-content j-setting-llz');
        $form->addInput($JBannerid);

        $JInterstitialid = new Typecho_Widget_Helper_Form_Element_Text(
            'JInterstitialid',
            NULL,
            "",
            '插屏广告id',
            '请输入插屏广告id'
        );
        $JInterstitialid->setAttribute('class', 'j-setting-content j-setting-llz');
        $form->addInput($JInterstitialid);

        $JVideoid = new Typecho_Widget_Helper_Form_Element_Text(
            'JVideoid',
            NULL,
            "",
            '视频广告id',
            '请输入视频广告id'
        );
        $JVideoid->setAttribute('class', 'j-setting-content j-setting-llz');
        $form->addInput($JVideoid);

        $JGridid = new Typecho_Widget_Helper_Form_Element_Text(
            'JGridid',
            NULL,
            "",
            '格子广告id',
            '请输入格子广告id'
        );
        $JGridid->setAttribute('class', 'j-setting-content j-setting-llz');
        $form->addInput($JGridid);

        $JRewardedVideoid = new Typecho_Widget_Helper_Form_Element_Text(
            'JRewardedVideoid',
            NULL,
            "",
            '激励视频广告id',
            '请输入激励视频广告id'
        );
        $JRewardedVideoid->setAttribute('class', 'j-setting-content j-setting-llz');
        $form->addInput($JRewardedVideoid);

        $JCcustomAid = new Typecho_Widget_Helper_Form_Element_Text(
            'JCcustomAid',
            NULL,
            "",
            '原生广告Aid',
            '请输入原生广告id'
        );
        $JCcustomAid->setAttribute('class', 'j-setting-content j-setting-llz');
        $form->addInput($JCcustomAid);

        $JCcustomBid = new Typecho_Widget_Helper_Form_Element_Text(
            'JCcustomBid',
            NULL,
            "",
            '原生广告Bid',
            '请输入原生广告id'
        );
        $JCcustomBid->setAttribute('class', 'j-setting-content j-setting-llz');
        $form->addInput($JCcustomBid);

        $JSwitch_inad = new Typecho_Widget_Helper_Form_Element_Radio(
                'JSwitch_inad',
            array(
                '0' => '关闭',
                '1' => '开启'
            ),'0','暴力插屏广告模式','是否开启无限弹窗插屏模式'
        );
        $JSwitch_inad->setAttribute('class', 'j-setting-content j-setting-llz');
        $form->addInput($JSwitch_inad);

        $JPosisionad = new Typecho_Widget_Helper_Form_Element_Text(
            'JPosisionad',
            null,'',
            '广告设置',
            '示例：4,5,1,3;<br>广告标识：1.banner、2.视频、3.格子、4.原生A、5.原生B<br>广告位置：1.首页信息流、2.分类页顶部、3.底部、4.分类列表页信息流、5.热榜页信息流、6.我的页底部、7.我的收藏/点赞/浏览顶部、8.关于我们页底部广告'
        );
        $JPosisionad->setAttribute('class', 'j-setting-content j-setting-llz');
        $form->addInput($JPosisionad);


        /**
         * profile
         */
//        $JProfile_background= new Typecho_Widget_Helper_Form_Element_Text(
//            'JProfile_background',
//            NULL,
//            "https://xcx.jiangqie.com/wp-content/uploads/2020/02/21212.png",
//            '顶部背景图',
//            '顶部背景图'
//        );
//        $JProfile_background->setAttribute('class', 'j-setting-content j-setting-profile');
//        $form->addInput($JProfile_background);
//
//
//        $JProfile_menu = new Typecho_Widget_Helper_Form_Element_Textarea(
//            'JProfile_menu',
//            NULL,
//            Null,
//            '菜单项',
//            "菜单项，格式：类型||图标||标题||链接||显示分割线<br>类型如下：<br>
//                                'views'     => '我的浏览',<br>
//                                'likes'     => '我的点赞',<br>
//                                'favorites' => '我的收藏',<br>
//                                'comments'  => '我的评论',<br>
//                                // 'about'     => '关于我们',<br>
//                                'feedback'  => '意见反馈',<br>
//                                'contact'   => '在线客服',<br>
//                                'clear'     => '清除缓存',<br>
//                                'split'     => '段分割线',<br>
//                                'link'      => '自定义链接',<br>
//                                'page'      => '自定义页面',<br>
//                                比如： views||图标||标题||链接||是
//                "
//        );
//        $JProfile_menu->setAttribute('class', 'j-setting-content j-setting-profile');
//        $form->addInput($JProfile_menu);
    }



    /**
     * 个人用户的配置面板
     * 
     * @access public
     * @param Typecho_Widget_Helper_Form $form
     * @return void
     */
    public static function personalConfig(Typecho_Widget_Helper_Form $form){}
    
    public static function sqlInstall(){
        // create circle follow table
        $db = Typecho_Db::get();
        $prefix = $db->getPrefix();

        if (!array_key_exists('views', $db->fetchRow($db->select()->from('table.contents')))) {
            $db->query('ALTER TABLE `'.$db->getPrefix().'contents` ADD `views` INT(10) DEFAULT 0;');
        }
        if (!array_key_exists('likes', $db->fetchRow($db->select()->from('table.contents')))) {
            $db->query('ALTER TABLE `'.$db->getPrefix().'contents` ADD `likes` INT(10) DEFAULT 0;');
        }
        if (!array_key_exists('favorites', $db->fetchRow($db->select()->from('table.contents')))) {
            $db->query('ALTER TABLE `'.$db->getPrefix().'contents` ADD `favorites` INT(10) DEFAULT 0;');
        }

        if (!array_key_exists('one_token', $db->fetchRow($db->select()->from('table.users')))) {
            $one_token = self::generate_token();
            $db->query('ALTER TABLE `'.$db->getPrefix().'users` ADD `one_token` varchar(50) DEFAULT "'.$one_token.'";');
        }

        if (!array_key_exists('avatarUrl', $db->fetchRow($db->select()->from('table.users')))) {
            $db->query('ALTER TABLE `'.$db->getPrefix().'users` ADD `avatarUrl` varchar(300) DEFAULT "" ;');
        }
        if (!array_key_exists('ext_mail', $db->fetchRow($db->select()->from('table.users')))) {
            $db->query('ALTER TABLE `'.$db->getPrefix().'users` ADD `ext_mail` varchar(100) DEFAULT "" ;');
        }

        $type = explode('_', $db->getAdapterName());
        $type = array_pop($type);
        if($type == "SQLite"){
//            throw new Typecho_Db_Exception("不支持sqlite");
            $db->query("CREATE TABLE `". $prefix ."one_post_search` (
                                  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                                  `search` varchar(250) NOT NULL DEFAULT '' ,
                                  `times` int(11) DEFAULT 0
                                )");
            $db->query("CREATE TABLE `". $prefix ."one_post_like` (
                                  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                                  `user_id` bigint(20) NOT NULL DEFAULT '0',
                                  `user_mail` varchar(30) NOT NULL DEFAULT '',
                                  `post_id` bigint(20) NOT NULL DEFAULT '0'
                                )");
            $db->query("CREATE TABLE `". $prefix ."one_post_favorite` (
                                  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                                  `user_id` bigint(20) NOT NULL DEFAULT '0',
                                  `user_mail` varchar(30) NOT NULL DEFAULT '',
                                  `post_id` bigint(20) NOT NULL DEFAULT '0'
                                )");
            $db->query("CREATE TABLE `". $prefix ."one_post_view` (
                                  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                                  `user_id` bigint(20) NOT NULL DEFAULT '0',
                                  `user_mail` varchar(30) NOT NULL DEFAULT '',
                                  `post_id` bigint(20) NOT NULL DEFAULT '0'
                                )");
        }else{
            $db->query("CREATE TABLE IF NOT EXISTS `". $prefix . "one_post_search` (
                          `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
                          `search` varchar(250) NOT NULL DEFAULT '' COMMENT '搜索关键字',
                          `times` int(11) NOT NULL DEFAULT 0 COMMENT '次数',
                          PRIMARY KEY (`id`)
                        );");
            $db->query("CREATE TABLE IF NOT EXISTS `". $prefix . "one_post_like` (
                          `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
                          `user_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '用户ID',
                          `user_mail` varchar(30) NOT NULL DEFAULT '' COMMENT '用户mail',
                          `post_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '文章ID',
                          PRIMARY KEY (`id`)
                        );");
            $db->query("CREATE TABLE IF NOT EXISTS `". $prefix . "one_post_favorite` (
                          `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
                          `user_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '用户ID',
                          `user_mail` varchar(30) NOT NULL DEFAULT '' COMMENT '用户mail',
                          `post_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '文章ID',
                          PRIMARY KEY (`id`)
                        );");
            // 文章浏览记录
            $db->query("CREATE TABLE IF NOT EXISTS `". $prefix . "one_post_view` (
                          `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID',
                          `user_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '用户ID',
                          `user_mail` varchar(30) NOT NULL DEFAULT '' COMMENT '用户mail',
                          `post_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '文章ID',
                          PRIMARY KEY (`id`)
                        );");
        }
    }

    private static function generate_token()
    {
        return md5(uniqid(rand()));
    }
}
