var myApp = angular.module('myApp', [
    'myDirectives',
    'myServices',
    'oc.lazyLoad',
    'ui.router']).run([
    '$rootScope',
    'services',
    function ($rootScope, services) {
        //路径前缀
        $rootScope.ctxPath = ctxPath;
        $rootScope.services = services;
        //禁用默认事件冒泡
        $rootScope.stopEvent = function ($event) {
            var event = $event || window.event;
            if (event && event.stopPropagation)
                event.stopPropagation();
            if (event && event.preventDefault)
                event.preventDefault();
        }
        //格式转字符
        $rootScope.getUnixDate = function (dateStr) {
            var regEx = new RegExp("\\-", "gi");
            return Math.round(Date.parse(dateStr.replace(regEx, "/")));
        }
        //字符转格式
        $rootScope.getLocalDate = function (unixdate, datatime) {
            if (null == unixdate || "" == unixdate) {
                var date = new Date();
                unixdate = date.getTime();
            }
            var t = new Date(parseInt(unixdate));
            return $rootScope.getDateStr(t, datatime);
        }
        //返回日期格式
        $rootScope.getDateStr = function (t, datatime) {
            var tm = t.getMonth() + 1;
            if (tm < 10) {
                tm = "0" + tm.toString();
            }
            var day = t.getDate();
            if (day < 10) {
                day = "0" + day.toString();
            }
            var t_hour = t.getHours();
            if (t_hour < 10) {
                t_hour = "0" + t_hour.toString();
            }
            var t_Minutes = t.getMinutes();
            if (t_Minutes < 10) {
                t_Minutes = "0" + t_Minutes.toString();
            }
            var t_Seconds = t.getSeconds();
            if (t_Seconds < 10) {
                t_Seconds = "0" + t_Seconds.toString();
            }
            if (datatime)
                return t.getFullYear() + "-" + tm + "-" + day + " " + t_hour + ":" + t_Minutes;
            else
                return t.getFullYear() + "-" + tm + "-" + day;
        }
        //关闭
        $rootScope.closeLayer = function () {
            layer.close($rootScope.layerfunTree);
        }
    }
]);
myApp.factory('authInterceptor', function ($rootScope, $q, $window) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($rootScope.token) {
                config.headers.token = $rootScope.token;
            }
            if (returnCitySN) {
                config.headers.IP = returnCitySN["cip"];
                config.headers.Address = encodeURI(returnCitySN["cname"]);
            }
            return config;
        },
        responseError: function (rejection) {
            if (rejection.status === 401) {
                $rootScope.sessionOut();
            }
            return $q.reject(rejection);
        },
        response: function (response) {
            //正常
            if (response.code == 600) {
                $rootScope.sessionOut();
            }
            return response;
        }
    };
});
myApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
});

/**
 * 总控制器
 */
myApp.controller('mainController', function ($rootScope, $scope, services, $sce, $window, $state, $stateParams) {
    $rootScope.sys_dateTime = getSyaDatetime();
    function getSyaDatetime() {
        var day = moment().format("d"), dtxt = "星期天";
        if (day == 1) {
            dtxt = "星期一";
        }
        else if (day == 2) {
            dtxt = "星期二";
        }
        else if (day == 3) {
            dtxt = "星期三";
        }
        else if (day == 4) {
            dtxt = "星期四";
        }
        else if (day == 5) {
            dtxt = "星期五";
        }
        else if (day == 6) {
            dtxt = "星期六";
        }
        setTimeout(function () {
            $rootScope.$apply(function () {
                $rootScope.sys_dateTime = getSyaDatetime();
            });
        }, 1000);
        return moment().format('YYYY年MM月DD日 ' + dtxt + ' HH:mm:ss');
    };

    $("body").delegate(".layui-form-select", "click", function () {
        $(".layui-form-select").not(this).removeClass("layui-form-selected");
        if (!$(".layui-select-title input", this).attr("disabled"))
            $(this).toggleClass("layui-form-selected");
        return false;
    })
    //下拉组件
    $("body").delegate(".dropdown", "click", function () {
        $(".dropdown").not(this).removeClass("open");
        $(this).toggleClass("open");
        return false;
    });
    $("body").bind("click", function () {
        $(".dropdown").removeClass("open");
        $(".layui-form-select").removeClass("layui-form-selected");
    });
    $rootScope.btnTip = function (e, title) {
        layer.tips(title, e.target, {tips: 1, time: 1000});
    }

    //用户登录信息
    $rootScope._USERINFO = null;
    //用户菜单信息
    $rootScope._ALLMENU = null;
    //token
    $rootScope.token = null;
    /**
     * 执行用户登录
     * @private
     */
    $rootScope._login = function (param, token) {
        if (param) {
            services._login(param).success(function (res) {
                $rootScope._loginToParam(res);
            });
        }
        else if (token) {
            services._login({
                token: token
            }).success(function (res) {
                $rootScope._loginToParam(res);
            });
        }
        else {
            $state.go("login");
        }
    }
    $rootScope._loginToParam = function (res) {
        if (res.code == 0) {
            $rootScope.token = res.data.token;
            services._menu().success(function (resMenu) {
                console.log(resMenu)
                if(resMenu.data.length > 0){
                    $rootScope._rloadSystemData(res.data, resMenu.data[0].children);
                }else{
                    $("#sysLogin").attr("disabled", false).removeClass("layui-btn-disabled").html("登录");
                    layer.msg("您没有权限登录!");
                    $state.go("login");
                }
                if (!$rootScope.skipPage || $rootScope.skipPage.name == "login") {
                    $rootScope.skipPage = {
                        name: "home1"
                    };
                }
                //判断如果没有系统设置权限
                try {
                    $state.go($rootScope.skipPage.name);
                }
                catch (er) {
                    console.log("target err to home")
                    $rootScope.skipPage = {
                        name: "home1"
                    };
                    $state.go($rootScope.skipPage.name);
                }
                finally {
                    $("body").removeClass("un-login");
                }
            });
        }
        else {
            $("#sysLogin").attr("disabled", false).removeClass("layui-btn-disabled").html("登录");
            layer.msg("登录失败！" + res.message);
            $state.go("login");
        }
    }
    /**
     * 注销用户
     */
    $rootScope.sessionOut = function () {
        $window.sessionStorage.removeItem("_USERINFO");
        $window.sessionStorage.removeItem("_ALLMENU");
        $rootScope.sessionReload = null;
        $rootScope._USERINFO = null;
        $rootScope._ALLMENU = null;
        if ($rootScope.skipPage.name != "login" || $rootScope.skipPage.name != "404" || $rootScope.skipPage.name != "unauo") {
            $rootScope.skipPage = $state.current;
            $rootScope.skipPageParam = $stateParams;
            $state.go("login");
        }
        else {
            $state.go($rootScope.nowPage);
        }
        $.cookie('LOGINUSERINFO_TOKEN', "");
    }

    /**
     * 装载数据
     * @private
     */
    $rootScope._rloadSystemData = function (userData, menuData) {
        //用户信息
        $rootScope._USERINFO = userData;
        $window.sessionStorage.setItem("_USERINFO", JSON.stringify(userData));
        //获取菜单信息
        $rootScope._ALLMENU = menuData;
        
        $window.sessionStorage.setItem("_ALLMENU", JSON.stringify(menuData));
        //保存token
        $.cookie("LOGINUSERINFO_TOKEN", userData.token);
        $rootScope.token = userData.token;
        //rootScope存储
        $rootScope.sessionReload = {
            userData: userData,
            menuData: menuData,
            tokenArray: {}
        };
        $rootScope.eachToken(menuData);

    }
    //获取权限
    $rootScope.eachToken = function (array) {
        angular.forEach(array, function (item) {
            if (item.res_key)
                $rootScope.sessionReload.tokenArray[item.res_key] = item;
            if (item.children) {
                $rootScope.eachToken(item.children);
            }
        })
    }
    //验证是否有权限
    $rootScope.getBtnToken = function (key) {
        if ($rootScope.sessionReload && $rootScope.sessionReload.tokenArray)
            return $rootScope.sessionReload.tokenArray[key];
        else
            return undefined;
    }
    //左侧显示菜单
    $rootScope.selectTopMenu = null;
    $rootScope.selectFirstMenu = null;
    $rootScope.selectSecondMenu = null;
    /**
     * 判断菜单选中项
     * @private
     */
    $rootScope._covertMenuSelect = function () {
        angular.forEach($rootScope._ALLMENU, function (top) {
            if (top.res_id == $rootScope.showMenu.res_id) {
                $rootScope.selectTopMenu = top;
            }
            else if (top.children && top.res_type == 1) {
                angular.forEach(top.children, function (first) {
                    if (first.res_id == $rootScope.showMenu.res_id) {
                        $rootScope.selectTopMenu = top;
                        $rootScope.selectFirstMenu = first;
                    }
                    else if (first.children && first.res_type == 1) {
                        angular.forEach(first.children, function (second) {
                            if (second.res_id == $rootScope.showMenu.res_id) {
                                $rootScope.selectTopMenu = top;
                                $rootScope.selectFirstMenu = first;
                                $rootScope.selectSecondMenu = second;
                            }
                            if (second.children) {
                                angular.forEach(second.children, function (three) {
                                    if (three.res_id == $rootScope.showMenu.res_id) {
                                        $rootScope.selectTopMenu = top;
                                        $rootScope.selectFirstMenu = first;
                                        $rootScope.selectSecondMenu = second;
                                    }
                                });
                            }
                        })
                    }
                })
            }
        });
    }
    /**
     * 格式化html
     * @param html
     * @returns {*}
     * @private
     */
    $rootScope._trustAsHtml = function (html) {
        return $sce.trustAsHtml(html);
    }

    /**
     * 根据key找到页面
     * @param key
     */
    $rootScope.getPageByKey = function (key, parent) {
        var page = null;

        angular.forEach(parent, function (item) {
            if (key == item.res_key) {

                page = item;
            }
            if (!page && item.children && item.res_type == 1) {
                page = $rootScope.getPageByKey(key, item.children);
            }
        })
        return page;
    }

    /**
     * 退出登录
     */
    $rootScope.loginup = function () {
        layer.confirm("你确定要退出系统吗?", function () {
            $(".parent_view").empty();
            $window.sessionStorage.removeItem("_USERINFO");
            $window.sessionStorage.removeItem("_ALLMENU");
            $rootScope._ALLMENU = null;
            $rootScope._USERINFO = null;
            $rootScope.token = null;
            $.cookie("LOGINUSERINFO_TOKEN", "");
            //登出
            services._logup();
            $state.go("login");
            layer.closeAll();
        })
    }

    /**
     * 打开表单
     */
    $rootScope.formOpen = function () {
        $(".form_content").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");
    }
    $rootScope.formOpen2 = function () {
        $(".form_content2").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");
    }
    $rootScope.formOpen3 = function () {
        $(".form_content3").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");
    }
    $rootScope.formOpen4 = function () {
        $(".form_content4").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");
    }
    /**
     * 关闭表单
     */
    $rootScope.formClose = function () {
        $(".form_content").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
    }
    $rootScope.formClose2 = function () {
        $(".form_content2").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
    }
    $rootScope.formClose3 = function () {
        $(".form_content3").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
    }
    $rootScope.formClose4 = function () {
        $(".form_content4").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
    }

    //排序方法
    $rootScope._by = function(name){
        return function(o, p){
            var a, b;
            if (typeof o === "object" && typeof p === "object" && o && p) {
                a = o[name];
                b = p[name];
                if (a === b) {
                    return 0;
                }
                if (typeof a === typeof b) {
                    return a < b ? -1 : 1;
                }
                return typeof a < typeof b ? -1 : 1;
            }
            else {
                throw ("error");
            }
        }
    }

    $(function () {
        $("#publicMenu").mCustomScrollbar({
            theme: "minimal-dark",
            scrollInertia: 200
        });
    })
    /**
     * 修改密码
     */
    $scope.upPassword = function () {
        layer.open({
            type: 1,
            title: "修改密码",
            area: ["500px", "300px"],
            content: $("#upPassword")
        });
    }
    $scope.updatePassParam = {
        oldpwd: null,
        newpwd: null,
        newpwd_1: null
    }
    /**
     * 确认修改
     */
    $scope.cen_upPassword = function () {
        if (!$scope.updatePassParam.oldpwd) {
            layer.alert("请填写旧密码")
            return false;
        }
        if (!$scope.updatePassParam.newpwd || ($scope.updatePassParam.newpwd != $scope.updatePassParam.newpwd_1)) {
            layer.alert("请正确填写新密码")
            return false;
        }
        $rootScope._USERINFO["oldpwd"] = $scope.updatePassParam["oldpwd"];
        $rootScope._USERINFO["newpwd"] = $scope.updatePassParam["newpwd"];
        $rootScope._USERINFO["newpwd_1"] = $scope.updatePassParam["newpwd_1"];
        services._up_pass($rootScope._USERINFO).success(function (rees) {
            if (rees.code == 0) {
                layer.closeAll();
                layer.msg("密码修改成功,请重新登录!");

                $(".parent_view").empty();
                $window.sessionStorage.removeItem("_USERINFO");
                $window.sessionStorage.removeItem("_ALLMENU");
                $rootScope._ALLMENU = null;
                $rootScope._USERINFO = null;
                $rootScope.token = null;
                $.cookie("LOGINUSERINFO_TOKEN", "");
                //登出
                services._logup();
                $state.go("login");
                $scope.updatePassParam = {
                    oldpwd: null,
                    newpwd: null,
                    newpwd_1: null
                }
            }
            else {
                layer.msg(rees.message)
            }
        })
    }
    $rootScope.menuStatus = true;
    $rootScope.menuIndex = true;
    $scope.closeMenu = function () {
        $rootScope.menuStatus = !$rootScope.menuStatus;
    }
});

myApp.run(['$rootScope', '$state', '$window', function ($rootScope, $state, $window) {
    //开始加载新页面
    $rootScope.$on('$stateChangeStart', function (event, toState, fromState, fromParams) {
        if (toState.name == "login" || toState.name == "404" || toState.name == "unauo") {
            $("body").addClass("un-login");
        }
        else if ($rootScope._USERINFO == null || !$rootScope._ALLMENU) {
            $("body").removeClass("un-login");
            $rootScope.skipPage = toState;
            var _USERINFO = $window.sessionStorage.getItem("_USERINFO");
            var _ALLMENU = $window.sessionStorage.getItem("_ALLMENU");
            var _userinfo = null, _allmenu = null;
            var token = $.cookie("LOGINUSERINFO_TOKEN");
            if (token) {
                $rootScope.token = token;
            }
            if (_USERINFO && _USERINFO != "" && _ALLMENU && _ALLMENU != "") {
                _userinfo = eval("(" + _USERINFO + ")");
                _allmenu = eval("(" + _ALLMENU + ")");
                $rootScope._rloadSystemData(_userinfo, _allmenu);
            }
            else if (token && token != "") {
                $rootScope._login(null, token);
                event.preventDefault();
            }
            else {
                $state.go("login");
                event.preventDefault();
            }
        }
        else {
            $("body").removeClass("un-login");
        }
        /**
         * 循环处理layui加载情况
         */
        function unlayui() {
            if (!element || !layer || !form || !laypage) {
                setTimeout(unlayui, 500);
            }
            else if (!element_init) {
                element_init = true;
                $(".layui-nav-bar").remove();
                setTimeout(function () {
                    element.init();
                }, 500);
            }
            else if (toState.name == "login" || toState.name == "404" || toState.name == "unauo") {
                element_init = false;
            }
        }

        unlayui();

        if ($rootScope._ALLMENU && $rootScope._ALLMENU.length > 0) {
            //设置默认选择第一个模块
            if (toState.name != "404" && toState.name != "login") {
                $rootScope.selectTopMenu = null;
                $rootScope.selectFirstMenu = null;
                $rootScope.selectSecondMenu = null;
                $rootScope.showMenu = $rootScope.getPageByKey(toState.name, $rootScope._ALLMENU);
                //清除所有选中
                if ($rootScope.showMenu)
                    $rootScope._covertMenuSelect();
            }
        }
        if ($rootScope.sessionReload) {
            //权限判断
            var pName = $rootScope.sessionReload.tokenArray[toState.name];
            if (!pName && toState.name != "login" && toState.name != "404" && toState.name != "unauo") {
                $state.go("unauo");
                event.preventDefault();
            }
        }
    });
    //页面加载成功
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        if (toState.name == "login" || toState.name == "404" || toState.name == "unauo") {
            $(".center_main_content").addClass("login_main_content");
        }
        else {
            $(".center_main_content").removeClass("login_main_content");
        }
    });
    //页面加载失败
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {

    });
}]);

myApp.config(function ($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
    myApp.controller = $controllerProvider.register;
    myApp.directive = $compileProvider.directive;
    myApp.filter = $filterProvider.register;
    myApp.factory = $provide.factory;
    myApp.service = $provide.service;
    myApp.constant = $provide.constant;


    //默认页面
    $urlRouterProvider.when('', '/login');
    //不规则页面
    $urlRouterProvider.otherwise('/404');
    //登录
    $stateProvider.state("login", {
        url: "/login",
        templateUrl: ctxPath + "/static/admin/model/login/page.html",
        controller: 'loginController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/login/page.css',
                    ctxPath + '/static/admin/model/login/page.js'])
            }]
        }
    });
    //404
    $stateProvider.state("404", {
        url: "/404",
        templateUrl: ctxPath + "/static/admin/model/other/404/page.html",
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/other/404/page.css'])
            }]
        }
    });
    //没有权限
    $stateProvider.state("unauo", {
        url: "/unauo",
        templateUrl: ctxPath + "/static/admin/model/other/unauo/page.html",
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/other/unauo/page.css'])
            }]
        }
    });


    ////////////////////////////////////////默认首页////////////////////////////////////////
    //首页
    $stateProvider.state("home", {
        url: "/home",
        templateUrl: ctxPath + "/static/admin/model/examManage/subImport/page.html",
        controller: 'subImportController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/subImport/page.css',
                    ctxPath + '/static/admin/model/examManage/subImport/page.js'
                ])
            }]
        }
        // templateUrl: ctxPath + "/static/admin/model/home/page.html",
        // controller: 'homeController',
        // resolve: {
        //     loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
        //         return $ocLazyLoad.load([ctxPath + '/static/admin/model/home/page.css',
        //             ctxPath + '/static/admin/model/home/page.js'])
        //     }]
        // }
    });
    //基础数据配置
    $stateProvider.state("home1", {
        url: "/home1",
        templateUrl: ctxPath + "/static/admin/model/examManage/subImport/page.html",
        controller: 'subImportController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/subImport/page.css',
                    ctxPath + '/static/admin/model/examManage/subImport/page.js'
                ])
            }]
        }
        // templateUrl: ctxPath + "/static/admin/model/home/page.html",
        // controller: 'homeController',
        // resolve: {
        //     loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
        //         return $ocLazyLoad.load([ctxPath + '/static/admin/model/home/page.css',
        //             ctxPath + '/static/admin/model/home/page.js'])
        //     }]
        // }
    });
    //学校管理
    $stateProvider.state("home2", {
        url: "/home2",
        templateUrl: ctxPath + "/static/admin/model/sysManage/schoolInfo/page.html",
        controller: 'schoolInfoController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/sysManage/schoolInfo/page.css',
                    ctxPath + '/static/admin/model/sysManage/schoolInfo/page.js'
                ])
            }]
        }
        // templateUrl: ctxPath + "/static/admin/model/home/page.html",
        // controller: 'homeController',
        // resolve: {
        //     loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
        //         return $ocLazyLoad.load([ctxPath + '/static/admin/model/home/page.css',
        //             ctxPath + '/static/admin/model/home/page.js'])
        //     }]
        // }
    });
    //系统设置
    $stateProvider.state("home3", {
        url: "/home3",
        templateUrl: ctxPath + "/static/admin/model/sysManage/org/page.html",
        controller: 'orgController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/sysManage/org/page.css',
                    ctxPath + '/static/admin/model/sysManage/org/page.js'])
            }]
        }
        // templateUrl: ctxPath + "/static/admin/model/home/page.html",
        // controller: 'homeController',
        // resolve: {
        //     loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
        //         return $ocLazyLoad.load([ctxPath + '/static/admin/model/home/page.css',
        //             ctxPath + '/static/admin/model/home/page.js'])
        //     }]
        // }
    });
    //日志管理
    $stateProvider.state("home4", {
        url: "/home4",
        templateUrl: ctxPath + "/static/admin/model/logManage/actionLog/page.html",
        controller: 'actionLogController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/logManage/actionLog/page.css',
                    ctxPath + '/static/admin/model/logManage/actionLog/page.js'])
            }]
        }
        // templateUrl: ctxPath + "/static/admin/model/home/page.html",
        // controller: 'homeController',
        // resolve: {
        //     loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
        //         return $ocLazyLoad.load([ctxPath + '/static/admin/model/home/page.css',
        //             ctxPath + '/static/admin/model/home/page.js'])
        //     }]
        // }
    });


    //统计中心
    $stateProvider.state("statistics", {
        url: "/statistics",
        templateUrl: ctxPath + "/static/admin/model/home/page.html",
        controller: 'homeController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/home/page.css',
                    ctxPath + '/static/admin/model/home/page.js'])
            }]
        }
    });
    //资源中心
    $stateProvider.state("resCenter", {
        url: "/resCenter",
        templateUrl: ctxPath + "/static/admin/model/home/page.html",
        controller: 'homeController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/home/page.css',
                    ctxPath + '/static/admin/model/home/page.js'])
            }]
        }
    });
    ////////////////////////////////////////默认首页////////////////////////////////////////


    ////////////////////////////////////////系统管理////////////////////////////////////////
    //操作日志
    $stateProvider.state("actionLog", {
        url: "/actionLog",
        templateUrl: ctxPath + "/static/admin/model/logManage/actionLog/page.html",
        controller: 'actionLogController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/logManage/actionLog/page.css',
                    ctxPath + '/static/admin/model/logManage/actionLog/page.js'])
            }]
        }
    });
    //系统日志
    $stateProvider.state("sysLog", {
        url: "/sysLog",
        templateUrl: ctxPath + "/static/admin/model/logManage/sysLog/page.html",
        controller: 'sysLogController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/logManage/sysLog/page.css',
                    ctxPath + '/static/admin/model/logManage/sysLog/page.js'])
            }]
        }
    });

    //机构管理
    $stateProvider.state("outfit", {
        url: "/outfit",
        templateUrl: ctxPath + "/static/admin/model/sysManage/outfit/page.html",
        controller: 'outfitController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/sysManage/outfit/page.css',
                    ctxPath + '/static/admin/model/sysManage/outfit/page.js',
                    ctxPath + '/static/admin/plugin/cityData/city.data-3.js'])
            }]
        }
    });
    //组织管理
    $stateProvider.state("org", {
        url: "/org",
        templateUrl: ctxPath + "/static/admin/model/sysManage/org/page.html",
        controller: 'orgController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/sysManage/org/page.css',
                    ctxPath + '/static/admin/model/sysManage/org/page.js'])
            }]
        }
    });
    //角色管理
    $stateProvider.state("role", {
        url: "/role",
        templateUrl: ctxPath + "/static/admin/model/sysManage/role/page.html",
        controller: 'roleController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/sysManage/role/page.css',
                    ctxPath + '/static/admin/model/sysManage/role/page.js'])
            }]
        }
    });
    //用户管理
    $stateProvider.state("user", {
        url: "/user",
        templateUrl: ctxPath + "/static/admin/model/sysManage/user/page.html",
        controller: 'userController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/sysManage/user/page.css',
                    ctxPath + '/static/admin/model/sysManage/user/page.js'])
            }]
        }
    });
    //权限管理
    $stateProvider.state("authority", {
        url: "/authority",
        templateUrl: ctxPath + "/static/admin/model/sysManage/authority/page.html",
        controller: 'authorityController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/sysManage/authority/page.css',
                    ctxPath + '/static/admin/model/sysManage/authority/page.js'])
            }]
        }
    });
    //资源管理
    $stateProvider.state("resource", {
        url: "/resource",
        templateUrl: ctxPath + "/static/admin/model/sysManage/resource/page.html",
        controller: 'resourceController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/sysManage/resource/page.css',
                    ctxPath + '/static/admin/model/sysManage/resource/page.js'])
            }]
        }
    });
    ////////////////////////////////////////系统管理////////////////////////////////////////


    ////////////////////////////////////////资源管理////////////////////////////////////////

    //资讯分类
    $stateProvider.state("cmsClassify", {
        url: "/cmsClassify",
        templateUrl: ctxPath + "/static/admin/model/resourceManage/cms/cmsClassify/page.html",
        controller: 'cmsClassifyController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/resourceManage/cms/cmsClassify/page.css',
                    ctxPath + '/static/admin/model/resourceManage/cms/cmsClassify/page.js'
                ])
            }]
        }
    });
    //资讯管理
    $stateProvider.state("cmsManage", {
        url: "/cmsManage",
        templateUrl: ctxPath + "/static/admin/model/resourceManage/cms/cmsManage/page.html",
        controller: 'cmsManageController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/resourceManage/cms/cmsManage/page.css',
                    ctxPath + '/static/admin/model/resourceManage/cms/cmsManage/page.js'
                ])
            }]
        }
    });


    ////////////////////////////////////////资源管理////////////////////////////////////////

    //学校设置
    $stateProvider.state("schoolInfo", {
        url: "/schoolInfo",
        templateUrl: ctxPath + "/static/admin/model/sysManage/schoolInfo/page.html",
        controller: 'schoolInfoController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/sysManage/schoolInfo/page.css',
                    ctxPath + '/static/admin/model/sysManage/schoolInfo/page.js'
                ])
            }]
        }
    });

    ////////////////////////////////////////组卷管理////////////////////////////////////////

    //组卷管理
    $stateProvider.state("createpaper", {
        url: "/createpaper",
        templateUrl: ctxPath + "/static/admin/model/home/page.html",
        controller: 'homeController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/home/page.css',
                    ctxPath + '/static/admin/model/home/page.js'])
            }]
        }
    });
    //题库管理
    $stateProvider.state("questionBank", {
        url: "/questionBank",
        templateUrl: ctxPath + "/static/admin/model/examManage/questionBank/page.html",
        controller: 'questionBankController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/questionBank/page.css',
                    ctxPath + '/static/admin/model/examManage/questionBank/page.js'
                ])
            }]
        }
    });

    //题目管理
    $stateProvider.state("questionManage", {
        url: "/questionManage/:id",
        templateUrl: ctxPath + "/static/admin/model/examManage/questionManage/page.html",
        controller: 'questionManageController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/examManage/questionManage/page.css',
                    ctxPath + '/static/admin/model/examManage/questionManage/page.js'])
            }]
        }
    });

    //试题管理
    $stateProvider.state("subjectManage", {
        url: "/subjectManage",
        templateUrl: ctxPath + "/static/admin/model/examManage/subjectManage/page.html",
        controller: 'subjectManageController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/examManage/subjectManage/page.css',
                    ctxPath + '/static/admin/model/examManage/subjectManage/page.js'])
            }]
        }
    });

    //试题新增--命题
    $stateProvider.state("subjectAdd", {
        url: "/subjectAdd",
        templateUrl: ctxPath + "/static/admin/model/examManage/subjectAdd/page.html",
        controller: 'subjectAddController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/examManage/subjectAdd/page.css',
                    ctxPath + '/static/admin/model/examManage/subjectAdd/page.js'])
            }]
        }
    });

    //综合题
    $stateProvider.state("subChildren", {
        url: "/subChildren/:pid",
        templateUrl: ctxPath + "/static/admin/model/examManage/subChildren/page.html",
        controller: 'subChildrenController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/examManage/subChildren/page.css',
                    ctxPath + '/static/admin/model/examManage/subChildren/page.js'])
            }]
        }
    });

    //班级设置
    $stateProvider.state("classesinfo", {
        url: "/classesinfo",
        templateUrl: ctxPath + "/static/admin/model/sysManage/classesinfo/page.html",
        controller: 'classesinfoController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/sysManage/classesinfo/page.css',
                    ctxPath + '/static/admin/model/sysManage/classesinfo/page.js'
                ])
            }]
        }
    });

    //老师信息
    $stateProvider.state("teachinfo", {
        url: "/teachinfo",
        templateUrl: ctxPath + "/static/admin/model/sysManage/teachinfo/page.html",
        controller: 'teachinfoController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/sysManage/teachinfo/page.css',
                    ctxPath + '/static/admin/model/sysManage/teachinfo/page.js'
                ])
            }]
        }
    });

    //学员信息
    $stateProvider.state("studentinfo", {
        url: "/studentinfo",
        templateUrl: ctxPath + "/static/admin/model/sysManage/studentinfo/page.html",
        controller: 'studentinfoController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/sysManage/studentinfo/page.css',
                    ctxPath + '/static/admin/model/sysManage/studentinfo/page.js'
                ])
            }]
        }
    });

    //试卷信息
    $stateProvider.state("papers", {
        url: "/papers",
        templateUrl: ctxPath + "/static/admin/model/examManage/papers/page.html",
        controller: 'papersController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/papers/page.css',
                    ctxPath + '/static/admin/model/examManage/papers/page.js'
                ])
            }]
        }
    });

    //我的试卷
    $stateProvider.state("myPapers", {
        url: "/myPapers",
        templateUrl: ctxPath + "/static/admin/model/examManage/myPapers/page.html",
        controller: 'myPapersController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/myPapers/page.css',
                    ctxPath + '/static/admin/model/examManage/myPapers/page.js'
                ])
            }]
        }
    });
    //公共试卷
    $stateProvider.state("allPapers", {
        url: "/allPapers",
        templateUrl: ctxPath + "/static/admin/model/examManage/allPapers/page.html",
        controller: 'allPapersController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/allPapers/page.css',
                    ctxPath + '/static/admin/model/examManage/allPapers/page.js'
                ])
            }]
        }
    });

    //试卷学生管理
    $stateProvider.state("studentManage", {
        url: "/studentManage/:id",
        templateUrl: ctxPath + "/static/admin/model/examManage/studentManage/page.html",
        controller: 'studentManageController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/studentManage/page.css',
                    ctxPath + '/static/admin/model/examManage/studentManage/page.js'
                ])
            }]
        }
    });
    //试卷成绩查阅
    $stateProvider.state("resultManage", {
        url: "/resultManage/:id",
        templateUrl: ctxPath + "/static/admin/model/examManage/resultManage/page.html",
        controller: 'resultManageController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/resultManage/page.css',
                    ctxPath + '/static/admin/model/examManage/resultManage/page.js'
                ])
            }]
        }
    });
    //配置
    $stateProvider.state("paperSetting", {
        url: "/paperSetting/:id&:isUse&:status",
        templateUrl: ctxPath + "/static/admin/model/examManage/paperSetting/page.html",
        controller: 'paperSettingController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/paperSetting/page.css',
                    ctxPath + '/static/admin/model/examManage/paperSetting/page.js'
                ])
            }]
        }
    });

    //试卷分类信息
    $stateProvider.state("paperclassify", {
        url: "/paperclassify",
        templateUrl: ctxPath + "/static/admin/model/examManage/paperclassify/page.html",
        controller: 'paperclassifyController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/paperclassify/page.css',
                    ctxPath + '/static/admin/model/examManage/paperclassify/page.js'
                ])
            }]
        }
    });

    //试卷修改
    $stateProvider.state("updatePaper", {
        url: "/updatePaper/:id",
        templateUrl: ctxPath + "/static/admin/model/examManage/updatePaper/page.html",
        controller: 'updatePaperController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/updatePaper/page.css',
                    ctxPath + '/static/admin/model/examManage/updatePaper/page.js'
                ])
            }]
        }
    });

    //手工组卷
    $stateProvider.state("handworkPaper", {
        url: "/handworkPaper",
        templateUrl: ctxPath + "/static/admin/model/examManage/handworkPaper/page.html",
        controller: 'handworkPaperController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/handworkPaper/page.css',
                    ctxPath + '/static/admin/model/examManage/handworkPaper/page.js'
                ])
            }]
        }
    });
    //手工组卷call
    $stateProvider.state("handworkCallPaper", {
        url: "/handworkCallPaper/:id&:isUse&:status",
        templateUrl: ctxPath + "/static/admin/model/examManage/handworkCallPaper/page.html",
        controller: 'handworkCallPaperController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/handworkCallPaper/page.css',
                    ctxPath + '/static/admin/model/examManage/handworkCallPaper/page.js'
                ])
            }]
        }
    });

    //章节组卷
    $stateProvider.state("chapterPaper", {
        url: "/chapterPaper",
        templateUrl: ctxPath + "/static/admin/model/examManage/chapterPaper/page.html",
        controller: 'chapterPaperController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/chapterPaper/page.css',
                    ctxPath + '/static/admin/model/examManage/chapterPaper/page.js'
                ])
            }]
        }
    });
    //章节组卷Call
    $stateProvider.state("chapterCallPaper", {
        url: "/chapterCallPaper/:id&:isUse&:status",
        templateUrl: ctxPath + "/static/admin/model/examManage/chapterCallPaper/page.html",
        controller: 'chapterCallPaperController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/chapterCallPaper/page.css',
                    ctxPath + '/static/admin/model/examManage/chapterCallPaper/page.js'
                ])
            }]
        }
    });
    //智能组卷
    $stateProvider.state("intelligentPaper", {
        url: "/intelligentPaper",
        templateUrl: ctxPath + "/static/admin/model/examManage/intelligentPaper/page.html",
        controller: 'intelligentPaperController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/intelligentPaper/page.css',
                    ctxPath + '/static/admin/model/examManage/intelligentPaper/page.js'
                ])
            }]
        }
    });

    //一键组卷
    $stateProvider.state("ghostPaper", {
        url: "/ghostPaper",
        templateUrl: ctxPath + "/static/admin/model/examManage/ghostPaper/page.html",
        controller: 'ghostPaperController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/ghostPaper/page.css',
                    ctxPath + '/static/admin/model/examManage/ghostPaper/page.js'
                ])
            }]
        }
    });

    //年级分类
    $stateProvider.state("gradeCat", {
        url: "/gradeCat",
        templateUrl: ctxPath + "/static/admin/model/examManage/gradeCat/page.html",
        controller: 'gradeCatController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/gradeCat/page.css',
                    ctxPath + '/static/admin/model/examManage/gradeCat/page.js'
                ])
            }]
        }
    });

    //专业分类
    $stateProvider.state("specialtyCat", {
        url: "/specialtyCat",
        templateUrl: ctxPath + "/static/admin/model/examManage/specialtyCat/page.html",
        controller: 'specialtyCatController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/specialtyCat/page.css',
                    ctxPath + '/static/admin/model/examManage/specialtyCat/page.js'
                ])
            }]
        }
    });

    //课程分类
    $stateProvider.state("curriculumCat", {
        url: "/curriculumCat",
        templateUrl: ctxPath + "/static/admin/model/examManage/curriculumCat/page.html",
        controller: 'curriculumCatController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/curriculumCat/page.css',
                    ctxPath + '/static/admin/model/examManage/curriculumCat/page.js'
                ])
            }]
        }
    });

    //章节分类
    $stateProvider.state("chapterCat", {
        url: "/chapterCat",
        templateUrl: ctxPath + "/static/admin/model/examManage/chapterCat/page.html",
        controller: 'chapterCatController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/chapterCat/page.css',
                    ctxPath + '/static/admin/model/examManage/chapterCat/page.js'
                ])
            }]
        }
    });

    //知识点分类
    $stateProvider.state("knowledgeCat", {
        url: "/knowledgeCat",
        templateUrl: ctxPath + "/static/admin/model/examManage/knowledgeCat/page.html",
        controller: 'knowledgeCatController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/knowledgeCat/page.css',
                    ctxPath + '/static/admin/model/examManage/knowledgeCat/page.js'
                ])
            }]
        }
    });

    //题型分类
    $stateProvider.state("subjectTypeCat", {
        url: "/subjectTypeCat",
        templateUrl: ctxPath + "/static/admin/model/examManage/subjectTypeCat/page.html",
        controller: 'subjectTypeCatController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/subjectTypeCat/page.css',
                    ctxPath + '/static/admin/model/examManage/subjectTypeCat/page.js'
                ])
            }]
        }
    });

    //难易度设置
    $stateProvider.state("levelCat", {
        url: "/levelCat",
        templateUrl: ctxPath + "/static/admin/model/examManage/levelCat/page.html",
        controller: 'levelCatController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/levelCat/page.css',
                    ctxPath + '/static/admin/model/examManage/levelCat/page.js'
                ])
            }]
        }
    });

    //试卷类别设置
    $stateProvider.state("papersTypeCat", {
        url: "/papersTypeCat",
        templateUrl: ctxPath + "/static/admin/model/examManage/papersTypeCat/page.html",
        controller: 'papersTypeCatController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/papersTypeCat/page.css',
                    ctxPath + '/static/admin/model/examManage/papersTypeCat/page.js'
                ])
            }]
        }
    });

    //试卷导入列表
    $stateProvider.state("importExam", {
        url: "/importExam",
        templateUrl: ctxPath + "/static/admin/model/examManage/subImport/page.html",
        controller: 'subImportController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/subImport/page.css',
                    ctxPath + '/static/admin/model/examManage/subImport/page.js'
                ])
            }]
        }
    });

    //模板组卷
    $stateProvider.state("tempPaper", {
        url: "/tempPaper",
        templateUrl: ctxPath + "/static/admin/model/examManage/tempPaper/page.html",
        controller: 'tempPaperController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/tempPaper/page.css',
                    ctxPath + '/static/admin/model/examManage/tempPaper/page.js'
                ])
            }]
        }
    });

    //考试结果
    $stateProvider.state("papersResult", {
        url: "/papersResult",
        templateUrl: ctxPath + "/static/admin/model/examManage/papersResult/page.html",
        controller: 'papersResultController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/papersResult/page.css',
                    ctxPath + '/static/admin/model/examManage/papersResult/page.js'
                ])
            }]
        }
    });
    //试卷结果页面的试卷查看页面
        $stateProvider.state("paperRank", {
            url: "/paperRank/:id",
            templateUrl: ctxPath + "/static/admin/model/examManage/paperRank/page.html",
            controller: 'paperRankController',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        ctxPath + '/static/admin/model/examManage/paperRank/page.css',
                        ctxPath + '/static/admin/model/examManage/paperRank/page.js'
                    ])
                }]
            }
        });

    //试卷结果页面的试卷查看页面
    $stateProvider.state("personScores", {
        url: "/personScores/:id&:paper_id",
        templateUrl: ctxPath + "/static/admin/model/examManage/personScores/page.html",
        controller: 'personScoresController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/personScores/page.css',
                    ctxPath + '/static/admin/model/examManage/personScores/page.js'
                ])
            }]
        }
    });

    //考点分析
    $stateProvider.state("analyse", {
        url: "/analyse",
        templateUrl: ctxPath + "/static/admin/model/examManage/analyse/page.html",
        controller: 'analyseController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/analyse/page.css',
                    ctxPath + '/static/admin/model/examManage/analyse/page.js'
                ])
            }]
        }
    });
    //试卷分析
    $stateProvider.state("papersAnalyse", {
        url: "/papersAnalyse",
        templateUrl: ctxPath + "/static/admin/model/examManage/papersAnalyse/page.html",
        controller: 'papersAnalyseController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([
                    ctxPath + '/static/admin/model/examManage/papersAnalyse/page.css',
                    ctxPath + '/static/admin/model/examManage/papersAnalyse/page.js'
                ])
            }]
        }
    });
    ////////////////////////////////////////考试管理////////////////////////////////////////

    //考试管理
    $stateProvider.state("examination", {
        url: "/examination",
        templateUrl: ctxPath + "/static/admin/model/home/page.html",
        controller: 'homeController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/home/page.css',
                    ctxPath + '/static/admin/model/home/page.js'])
            }]
        }
    });
    //发布考试
    $stateProvider.state("examRelease", {
        url:"/examRelease",
        templateUrl:ctxPath + "/static/admin/model/examManage/examRelease/page.html",
        controller:'examReleaseController',
        resolve:{
            loadMyCtrl:['$ocLazyLoad',function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/examManage/examRelease/page.css',
                    ctxPath + '/static/admin/model/examManage/examRelease/page.js'])
            }]
        }
    });
    //考试操作
    $stateProvider.state("examInation", {
        url:"/examInation",
        templateUrl:ctxPath + "/static/admin/model/examManage/examInation/page.html",
        controller:'examInationController',
        resolve:{
            loadMyCtrl:['$ocLazyLoad',function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/examManage/examInation/page.css',
                    ctxPath + '/static/admin/model/examManage/examInation/page.js'])
            }]
        }
    })
    //考试记录
    $stateProvider.state("examRecord", {
        url:"/examRecord",
        templateUrl:ctxPath + "/static/admin/model/examManage/examRecord/page.html",
        controller:'examRecordController',
        resolve:{
            loadMyCtrl:['$ocLazyLoad',function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/admin/model/examManage/examRecord/page.css',
                    ctxPath + '/static/admin/model/examManage/examRecord/page.js'])
            }]
        }
    })

});
