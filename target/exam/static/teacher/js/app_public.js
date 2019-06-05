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
        //用户登录信息
        $rootScope._USERINFO = null;
        //用户菜单信息
        $rootScope._ALLMENU = null;
        //token
        $rootScope.token = null;
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
        //执行用户登录
        $rootScope._login = function (param, token) {
            if (param) {
                services._login(param).success(function (res) {
                    if (res.code == 0) {
                        layer.msg(res.message);
                    } else {
                        layer.msg(res.message);
                    }
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
                $rootScope._toPage("login");
            }
        }
        //登录后用户参数重组
        $rootScope._loginToParam = function (res) {
            if (res.code == 0) {
                $rootScope.token = res.data.token;
                $rootScope._rloadSystemData(res.data, null);
                if (!$rootScope.skipPage || $rootScope.skipPage.name == "login") {
                    $rootScope.skipPage = {
                        name: "home"
                    };
                }
                $rootScope._toPage($rootScope.skipPage.name);
            }
            else {
                $("#sysLogin").attr("disabled", false).removeClass("layui-btn-disabled").html("登录");
                $rootScope._toPage("login");
            }
        }
        //装载数据
        $rootScope._rloadSystemData = function (userData, menuData) {
            //用户信息
            // console.log(userData);
            $rootScope._USERINFO = userData;
            window.sessionStorage.setItem("_USERINFO", JSON.stringify(userData));
            //获取菜单信息
            $rootScope._ALLMENU = menuData;
            window.sessionStorage.setItem("_ALLMENU", null);
            //保存token
            $.cookie("LOGINUSERINFO_TOKEN", userData.token);
            $rootScope.token = userData.token;
            //rootScope存储
            $rootScope.sessionReload = {
                userData: userData,
                menuData: menuData,
                tokenArray: {}
            };
            $rootScope.init_public_data();
        }
        //注销用户
        $rootScope.sessionOut = function (page, params) {
            localStorage.removeItem("_USERINFO");
            localStorage.removeItem("_ALLMENU");
            $rootScope.sessionReload = null;
            $rootScope._USERINFO = null;
            $rootScope._ALLMENU = null;
            if ($rootScope.skipPage.name != "login" || $rootScope.skipPage.name != "404") {
                $rootScope.skipPage = page;
                $rootScope.skipPageParam = params;
            }
            $rootScope._toPage("login");
            $.cookie('LOGINUSERINFO_TOKEN', "");
        }
        //退出登录
        $rootScope.loginup = function () {
            layer.confirm("你确定要退出系统吗?", function () {
                $(".parent_view").empty();
                //登出
                services._logup();
                $rootScope.sessionOut($rootScope.skipPage, $rootScope.skipPageParam);
                layer.closeAll();
            })
        }

        //下拉组件
        $("body").delegate(".layui-form-select", "click", function () {
            $(".layui-form-select").not(this).removeClass("layui-form-selected");
            if (!$(".layui-select-title input", this).attr("disabled")) {
                if ($(this).hasClass('cooper') && $(this).not("layui-form-selected")) {
                    $(this).addClass("layui-form-selected");
                } else {
                    $(this).toggleClass("layui-form-selected");
                }
            }
            return false;
        })

        $("body").bind("click", function () {
            $(".layui-form-select").removeClass("layui-form-selected");
        });
    }
]);
myApp.factory('authInterceptor', function ($rootScope, $q) {
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
                $rootScope.sessionOut($rootScope.skipPage, $rootScope.skipPageParam);
            }
            return $q.reject(rejection);
        },
        response: function (response) {
            //正常
            if (response.code == 600) {
                $rootScope.sessionOut($rootScope.skipPage, $rootScope.skipPageParam);
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
myApp.controller('mainController', function ($rootScope, $scope, services, $sce, $state, $stateParams, $timeout) {
    //是否显示课程标题
    $rootScope.showCurriculumsTitle = 0;
    //课程
    $rootScope.curriculums = null;
    //默认课程-选中值
    $rootScope.curriculum = null;
    //试卷-难易度
    $rootScope.paperLevelTypes = null;
    //试卷-类型
    $rootScope.paperDataTypes = null;
    //试题-难易度
    $rootScope.questionLevelTypes = null;
    //试题-类型
    $rootScope.questionDataTypes = null;
    //默认知识点
    $rootScope.knowledges = null;
    //默认知识点-选中值
    $rootScope.checked_knowledge = null;
    //试题篮
    $rootScope.BasketExams = [];
    //我的试题库
    $rootScope.myBankList = [];
    //根节点参数存放
    $rootScope.root_param = {
        selDfBank: null,
        bank_title: null
    }
    $rootScope._toPage = function (name, param) {
        $state.go(name, param);
    }
    //获取系统级默认参数
    $rootScope.init_public_data = function () {
        console.log('系统参数初始化')
        if (!$rootScope.curriculums) {
            var curriculums = localStorage.getItem('curriculums');
            var curriculum = localStorage.getItem('curriculum');
            if (curriculums) {
                $rootScope.curriculums = JSON.parse(curriculums);
                if ($rootScope.curriculums && $rootScope.curriculums.length > 0) {
                    if (curriculum) {
                        $rootScope.curriculum = JSON.parse(curriculum);
                    }
                    else {
                        $rootScope.curriculum = $rootScope.curriculums[0];
                        localStorage.setItem('curriculum', JSON.stringify($rootScope.curriculums[0]));
                    }
                }
                //console.log('加载试题篮列表')
                $rootScope.getAllBasketList();
                //console.log('加载知识点')
                $rootScope.get_knowledges();
            }
            else {
                services._getDicTree({
                    dic_parentcode: '30000'
                }).success(function (res) {
                    $rootScope.curriculums = res.data;
                    if ($rootScope.curriculums && $rootScope.curriculums.length > 0) {
                        if (curriculum) {
                            $rootScope.curriculum = JSON.parse(curriculum);
                        }
                        else {
                            $rootScope.curriculum = $rootScope.curriculums[0];
                            localStorage.setItem('curriculum', JSON.stringify($rootScope.curriculums[0]));
                        }
                    }
                    localStorage.setItem('curriculums', JSON.stringify(res.data));
                    //console.log('加载试题篮列表')
                    $rootScope.getAllBasketList();
                    //console.log('加载知识点')
                    $rootScope.get_knowledges();
                })
            }
        }else{
            //退出后再进来就会进入这里
            //console.log('加载试题篮列表')
            $rootScope.getAllBasketList()
        }

        //获取试卷难易度
        $rootScope.getPaperLevelTypes();
        //获取试卷类型
        $rootScope.getPaperDataTypes();
        //试题难易度
        $rootScope.getQuestionLevelTypes();
        //题库--
        $rootScope.getMyBanks();
    }
    //默认事件
    $(function () {
        $("body").delegate(".group_plan", "mouseover", function () {
            $('.group_content', this).show();
            return false;
        });
        $("body").delegate(".group_plan", "mouseout", function () {
            $('.group_content', this).hide();
            return false;
        });
        $("body").delegate(".group_plan", "click", function () {
            $('.group_content', this).hide();
        });
        //页面滚动
        $(window).scroll(function (e) {
            var top = document.body.scrollTop ? document.body.scrollTop : document.documentElement.scrollTop;
            var h = document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
            var s = document.body.scrollHeight ? document.body.scrollHeight : document.documentElement.scrollHeight;
            if (top > 100 && $rootScope._USERINFO) {
                $('.scroll_p_shop').show();
            }
            else {
                $('.scroll_p_shop').hide();
            }
            if (top < 114) {
                $('.right_fix').css({
                    'top': 114 - top,
                    'bottom': 0
                });
            }
            else {
                var nn = (242 - (s - h - top));
                $('.right_fix').css({
                    'top': 0,
                    'bottom': nn > 0 ? nn : 0
                });
            }
        })
        $rootScope.clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        $(window).resize(function () {
            $rootScope.$apply(function () {
                $rootScope.clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
                //console.log($rootScope.clientHeight)
            })
        })
    })
    //选择默认课程
    $rootScope.set_curriculum = function (obj) {
        $rootScope.curriculum = obj;
        localStorage.setItem('curriculum', JSON.stringify(obj));
        console.log('加载试题篮列表')
        $rootScope.getAllBasketList();
        console.log('加载知识点')
        $rootScope.get_knowledges();
    }
    //加载试题篮列表
    $rootScope.getAllBasketList = function () {
        $rootScope.questionDataTypes = [];
        //先生成试题篮类型
        angular.forEach($rootScope.curriculum.children, function (item) {
            item.children = [];
            $rootScope.questionDataTypes[$rootScope.questionDataTypes.length] = item;
        })
        //默认题型
        services._basketList().success(function (res) {
            $rootScope.BasketExams = [];
            if (res.data.length > 0) {
                angular.forEach(res.data, function (item) {
                    $rootScope._covertQuestionNum(item);
                })
            }
        })
    }
    //计算当前课程下 - 题型数量
    $rootScope._covertQuestionNum = function (item, bool) {
        var arr = null, kcroot = null;
        angular.forEach($rootScope.curriculums, function (kc) {
            if (kc.id == item.subject_curriculum) {
                kcroot = kc;
                angular.forEach(kc.children, function (tx) {
                    if (tx.id == item.subject_type) {
                        arr = tx;
                        if (!arr.children) {
                            arr.children = [];
                        }
                    }
                })
            }
        })
        if (arr && arr.children) {
            //减去重复的
            angular.forEach(arr.children, function (citem, index) {
                if (citem.id == item.id)
                    arr.children.splice(index, 1);
            })
            angular.forEach($rootScope.BasketExams, function (citem, index) {
                if (citem.id == item.id)
                    $rootScope.BasketExams.splice(index, 1);
            })

            if(!bool){
                arr.children.push(item);
                $rootScope.BasketExams.push(item);
            }
            // if (bool) {
                //减去
                // angular.forEach(arr.children, function (citem, index) {
                //     if (citem.id == item.id)
                //         arr.children.splice(index, 1);
                // })
                // angular.forEach($rootScope.BasketExams, function (citem, index) {
                //     if (citem.id == item.id)
                //         $rootScope.BasketExams.splice(index, 1);
                // })
            // }
            // else {
                //加上
                // arr.children.push(item);
                // $rootScope.BasketExams.push(item);
            // }
        }
        $rootScope.showCurriculumsTitle = 0;

        angular.forEach($rootScope.curriculums, function (kc) {
            kc.hasst = 0;

            angular.forEach(kc.children, function (tx) {
                tx.hasst = tx.children.length;
                kc.hasst += tx.hasst;
            })
            if (kc.hasst) {
                $rootScope.showCurriculumsTitle += 1;
            }
        })
    };
    //获取知识点
    $rootScope.get_knowledges = function () {
        services._getKnowledge({
            struct_curriculum: $rootScope.curriculum.id
        }).success(function (res) {
            if (res.data.length < 5) {
                angular.forEach(res.data, function (item) {
                    item.selected = true;
                })
            }
            else if (res.data.length > 0) {
                res.data[0].selected = true;
            }
            $rootScope.knowledges = res.data;
        })
    }
    //根据课程ID 获取课程名称
    $rootScope._get_curriculum_name = function (id) {
        var name = null;
        if (id && id.toString().indexOf(',') != -1) {
            name = "综合";
        }
        else {
            angular.forEach($rootScope.curriculums, function (item) {
                if (item.id == id)
                    name = item.dic_name;
            })
        }
        return name;
    }
    //根据课程ID 题型ID 获取题型名称
    $rootScope._get_exam_name_byid = function (kcid, txid) {
        var name = '--';
        angular.forEach($rootScope.curriculums, function (item) {
            if (item.id == kcid) {
                angular.forEach(item.children, function (st) {
                    if (st.id == txid)
                        name = st.dic_name;
                })
            }
        })
        return name;
    }
    //根据ID获取试题难易度
    $rootScope._get_qustion_leve = function (id) {
        var name = null;
        angular.forEach($rootScope.questionLevelTypes, function (item) {
            if (id == item.id) {
                name = item.dic_name;
            }
        })
        return name;
    }
    //根据ID获取题库名称
    $rootScope._get_bank_name = function (id, arr) {
        var name = null;
        angular.forEach(arr, function (item) {
            if (id == item.id) {
                name = item.bank_title;
            }
        })
        return name;
    }
    //根据ID获取试卷难易度
    $rootScope._get_paper_leve_name = function (id) {
        var name = null;
        angular.forEach($rootScope.paperLevelTypes, function (item) {
            if (item.id == id)
                name = item.dic_name
        })
        return name;
    }
    //根据ID获取试卷类型
    $rootScope._get_paper_type_name = function (id) {
        var name = null;
        angular.forEach($rootScope.paperDataTypes, function (item) {
            if (item.id == id)
                name = item.dic_name
        })
        return name;
    }
    //打开添加到试题库
    $rootScope.openToStoreroom = function () {
        $('.exam_other .actions').hide();
        $('.exam_other .storerooms').show();
        //获取我的题库
        services._getBankList().success(function (res) {
            $rootScope.myBankList = res.data;
            if (res.data.length > 0) {
                $rootScope.root_param.selDfBank = res.data[0];
            }
        })
    }
    //获取题库
    $rootScope.getMyBanks = function () {
        //获取我的题库
        services._getBankList().success(function (res) {
            $rootScope.myBankList = res.data;
        })
    }
    //试卷难易度
    $rootScope.getPaperLevelTypes = function () {
        services._eMDictionary({
            dic_code: '100000',
            pageNum: 1,
            pageSize: 100
        }).success(function (res) {
            //console.log('试卷难易度')
            $rootScope.paperLevelTypes = res.data.rows;
        })
    }
    //试卷类型
    $rootScope.getPaperDataTypes = function () {
        services._eMDictionary({
            dic_code: '70000',
            pageNum: 1,
            pageSize: 100
        }).success(function (res) {
            //console.log('试卷类型')
            $rootScope.paperDataTypes = res.data.rows;
            //console.log($rootScope.paperDataTypes);
        })
    }
    //试题难易度
    $rootScope.getQuestionLevelTypes = function () {
        services._eMDictionary({
            dic_code: '80000',
            pageNum: 1,
            pageSize: 100
        }).success(function (res) {
            //console.log('试题难易度')
            $rootScope.questionLevelTypes = res.data.rows;
            //console.log($rootScope.questionLevelTypes);
        })
    }
    //是否显示试题篮
    $rootScope.showShop = false;
    //显示隐藏试题篮
    $rootScope.showShopFn = function () {
        if ($rootScope.showShop) {
            $('.shop_plan').animate({
                'right': -350
            }, 'fast', function () {
                $('.p_shop').fadeOut();
                $('body, html').removeClass('hidden')
            });
            $rootScope.showShop = false;
        }
        else {
            $('body, html').addClass('hidden')
            $('.p_shop').fadeIn();
            $('.shop_plan').animate({
                'right': 0
            });
            $rootScope.showShop = true;
            $('.shop_plan').click(function () {
                return false;
            })
            $('.p_shop').click(function () {
                $('.shop_plan').animate({
                    'right': -350
                }, 'fast', function () {
                    $('.p_shop').fadeOut();
                    $('body, html').removeClass('hidden')
                });
                $rootScope.showShop = false;
            })
        }
    }
    //回到页面顶部
    $rootScope.toPageTop = function () {
        window.scrollTo(0, 0);
    }
    //获取题库id
    $rootScope.get_bank = function () {

    }
    //添加试题到试题库
    $rootScope.add_test = function () {
        $rootScope.loadingStart();
        var all_testId = [];
        angular.forEach($rootScope.BasketExams, function (item, index) {
            all_testId.push(item.id)
        })
        if ($rootScope.BasketExams.length == 0) {
            layer.msg("请添加试题后再加入题库")
            return false;
        } else {
            services._addTo_bank({
                bank_id: $rootScope.root_param.selDfBank.id,
                ids: all_testId
            }).success(function (res) {
                $rootScope.loadingEnd();
                if (res.code == 0) {
                    //清除试题篮
                    $rootScope._delQuestionAll();
                    $rootScope.closeStoreroom();
                    $rootScope.showShopFn();
                    layer.confirm('试题已加入到题库，是否前往题库查看?', {
                        btn: ['前往试题库', '取消'] //按钮
                    }, function () {
                        $rootScope._toPage("myOptionBanks");
                        $rootScope.get_bank();
                        layer.closeAll();
                    });
                }
            })
        }
    }
    //关闭添加到试题库
    $rootScope.closeStoreroom = function () {
        $('.exam_other .storerooms').hide();
        $('.exam_other .actions').show();
    }
    //精确计算试题分类
    $rootScope.covert_options_exam = function (param) {
        services._getDicTree({
            dic_parentcode: '30000'
        }).success(function (res) {
            //清算内容
            angular.forEach($rootScope.BasketExams, function (item) {
                var arr = null;
                angular.forEach(res.data, function (kc) {
                    if (kc.id == item.subject_curriculum) {
                        angular.forEach(kc.children, function (tx) {
                            if (tx.id == item.subject_type) {
                                if (!tx.children) {
                                    tx.children = [];
                                }
                                arr = tx;
                            }
                        })
                    }
                })
                if (arr && arr.children)
                    arr.children.push(item)
            })
            var PrivateBasketExams = [];
            angular.forEach(res.data, function (kc) {
                var kc_item = {
                    id: kc.id,
                    dic_name: kc.dic_name,
                    children: [],
                    total: 0
                };
                angular.forEach(kc.children, function (tx) {
                    var children = {
                        id: tx.id,
                        dic_name: tx.dic_name,
                        total: 0,
                        num: 0
                    }
                    if (tx.children && tx.children.length > 0) {
                        children.children = tx.children;
                        kc_item.children.push(children)
                    }
                })
                if (kc_item.children.length > 0) {
                    PrivateBasketExams.push(kc_item);
                }
            })
            var ii = 0, iii = 0, str = null;
            ////////////////////////////清空多余课程////////////////////////////////////
            angular.forEach(PrivateBasketExams, function (kc) {
                ////////////////////////////清空多余大题////////////////////////////////////
                angular.forEach(kc.children, function (tx) {
                    if (tx.children.length == 0) {
                        kc.children.splice(kc.children.indexOf(tx), 1);
                    }
                })
                if (kc.children.length == 0) {
                    PrivateBasketExams.splice(PrivateBasketExams.indexOf(kc), 1);
                }
                else {
                    //试卷的课程
                    str = str ? (str += ',' + kc.id) : kc.id;
                }
                ////////////////////////////清空多余大题////////////////////////////////////
            });
            ////////////////////////////清空多余课程////////////////////////////////////
            param.paper_curriculum = str;
            var paper_full = 0;
            var totalNum = 0;
            angular.forEach(PrivateBasketExams, function (kc, index) {
                //循环前清空数量 和 分数
                kc.kc_total_fraction = 0;
                kc.kc_total_num = 0;
                kc.index = index;
                angular.forEach(kc.children, function (tx) {
                    //清空大题的数量 和 分数
                    tx.tx_total_fraction = 0;
                    tx.tx_total_num = 0;
                    //大题索引
                    tx.index = ii;
                    ii += 1;
                    angular.forEach(tx.children, function (st, siii) {
                        if (st.subjectList && st.subjectList.length > 0) {
                            angular.forEach(st.subjectList, function (sst) {
                                tx.tx_total_num += 1;
                                // sst.detail_marks = parseInt(sst.detail_marks || 0);
                                sst.detail_marks = sst.detail_marks==null ? 2 : sst.detail_marks;
                                tx.tx_total_fraction += parseInt(sst.detail_marks);
                                sst.index = ++iii;
                            })
                            st.index = siii + 1;
                        }
                        else {
                            tx.tx_total_num += 1;
                            // st.detail_marks = parseInt(st.detail_marks || 0);
                            st.detail_marks = st.detail_marks==null ? 2 : st.detail_marks;
                            tx.tx_total_fraction += parseInt(st.detail_marks);
                            st.index = ++iii;
                        }
                    })
                    //课程中小题数 总分数
                    kc.kc_total_fraction += parseInt(tx.tx_total_fraction);
                    kc.kc_total_num += tx.tx_total_num;
                })

                //结束循环后将每个课程的 小题数  和 分数加到试卷总数上
                paper_full += parseInt(kc.kc_total_fraction);
                totalNum += kc.kc_total_num;
            });
            var maxExamNum = 0;
            //大题题号
            var gtArray = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
            //算题
            if (param) {
                angular.forEach(PrivateBasketExams, function (kc, i) {
                    param.paper_full += kc.kc_total_fraction //手工组卷总分
                    param.totalNum += kc.kc_total_num //手工组卷总题数

                    // console.log(kc)
                    var kc_1 = {
                        paper_detail_id: null,
                        paper_id: null,
                        subject_id: kc.id,
                        subject_pid: null,
                        option_type: 1,
                        detail_marks: kc.kc_total_fraction,
                        detail_number: kc.kc_total_num,
                        detail_order: i,
                        subject_type: kc.index,
                        pbank_title: kc.dic_name + "部分",
                        children: []
                    }
                    angular.forEach(kc.children, function (tx) {
                        var tx_1 = {
                            paper_detail_id: null,
                            paper_id: null,
                            subject_id: tx.id,
                            subject_pid: null,
                            option_type: 2,
                            detail_marks: tx.tx_total_fraction,
                            detail_number: tx.tx_total_num,
                            detail_order: tx.index,
                            subject_type: tx.id,
                            pbank_title: gtArray[maxExamNum] + "、" + tx.dic_name,
                            children: []
                        }
                        maxExamNum += 1;
                        angular.forEach(tx.children, function (st) {
                            var st_1 = {
                                paper_detail_id: null,
                                paper_id: null,
                                subject_id: st.id,
                                subject_pid: null,
                                option_type: 3,
                                // detail_marks: st.detail_marks ? st.detail_marks : 2,
                                detail_marks: st.detail_marks,
                                detail_number: st.subjectList ? st.subjectList.length : 0,
                                detail_order: st.index,
                                subject_type: st.subject_type,
                                children: []
                            }
                            angular.forEach(st.subjectList, function (xst) {
                                st_1.children.push({
                                    paper_detail_id: null,
                                    paper_id: null,
                                    subject_id: xst.id,
                                    subject_pid: null,
                                    option_type: 4,
                                    // detail_marks: xst.detail_marks ? xst.detail_marks : 2,
                                    detail_marks: xst.detail_marks,
                                    detail_number: 0,
                                    detail_order: xst.index,
                                    subject_type: xst.subject_type,
                                    children: []
                                })
                            })
                            tx_1.children.push(st_1);
                        })
                        kc_1.children.push(tx_1);
                    })
                    param.children.push(kc_1);
                })
                //手工组卷
                param.source = 3;
                console.log(param)
                services._savePaper(param).success(function (res) {
                    if (res.code == 0) {
                        //清空试题篮
                        $rootScope._delQuestionAll();
                        $rootScope._toPage("examPaperOther", {
                            source: 3,
                            id: res.data
                        })
                    }
                    else {
                        $rootScope.loadingEnd();
                        layer.alert(res.message);
                        $rootScope.showShopFn();
                    }
                })
            }
        })
    }
    //生成试卷页面
    $rootScope.openExamPaper = function () {
        $rootScope.loadingStart();
        $rootScope.showShopFn();
        //保存试卷
        var configParam = {
            paper_title: true, //主标题  1
            paper_subtitle: false, //副标题  1
            paper_attention: false, //注意事项 1
            success: false, //考试顺利  1
            student_info: false, //考生信息
            show_kc: true, //显示课程 1
            show_num: true, //小题分数
            show_max_tg: true, //显示大题 1
            paper_full: true //总分总时 1
        }
        var param = {
            subjectList: [], //试题集合
            children: [] //试题集合
        };
        console.log($rootScope.examKnowledge_id)
        if ($rootScope.examKnowledge_id) {
            services._pbankPreview({
                pbank_id: $rootScope.examKnowledge_id
            }).success(function (bas) {
                //试卷配置
                param['id'] = $rootScope.examKnowledge_id;
                param['paper_title'] = bas.data.paper_title;
                param['paper_subtitle'] = bas.data.paper_subtitle;
                param['paper_duration'] = bas.data.paper_duration;
                param['paper_curriculum'] = bas.data.paper_curriculum;
                param['paper_pass'] = bas.data.paper_pass;
                param['paper_type'] = bas.data.paper_type ? bas.data.paper_type : 10042;
                param['paper_level'] = bas.data.paper_level ? bas.data.paper_level : 10076;
                param['paper_code'] = bas.data.paper_code;
                param['paper_explain'] = bas.data.paper_explain;
                param['paper_full'] = bas.data.paper_full;
                param['paper_url'] = bas.data.paper_url;
                param['org_id'] = bas.data.org_id;
                param['assistant'] = bas.data.assistant;
                param['is_open'] = bas.data.is_open;
                param['is_template'] = bas.data.is_template;
                param['source'] = bas.data.source;
                param['status'] = bas.data.status;
                // param['configure'] = bas.data.configure;
                param['configure'] = $rootScope.examconfigParam ? $rootScope.examconfigParam :bas.data.configure;
                param['fragment'] = bas.data.fragment;
                $rootScope.covert_options_exam(param);
            })
        }
        else {
            param = {
                id: $rootScope.examKnowledge_id,
                paper_full: 0, //总分
                totalNum: 0, //总数
                paper_title: "未命名", //主标题
                paper_subtitle: (new Date()).getFullYear() + "年湖北省普通高等学校招收中职毕业生技能高考", //副标题
                paper_explain: '', //试卷描述
                paper_pass: 60, //及格分
                paper_duration: 120, //考试用时
                paper_curriculum: null, //所属课程
                paper_type: 10042, //试卷类型
                paper_type_name: '课堂练习',
                assistant: null, // 协作者
                paper_level: 10076, //难易度
                paper_level_name: '简单',
                is_open:$rootScope.superManage()==true ? 1:0,//考试是否公开
                configure: JSON.stringify(configParam), //试卷配置
                subjectList: [], //试题集合
                children: [], //试题集合
                fragment: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>试卷预览</title><style>body{background:#f4f4f4;margin:0;padding:0}.paper-html{padding:30px 100px;width:842px;box-sizing:border-box}</style></head><body><div style="font-size: 14px;margin: 0 auto;background: #fff" class="paper-html"></div></body></html>' //试卷片段
            }
            $rootScope.covert_options_exam(param);
        }
    };
    //前往添加试题库
    $rootScope.addStoreroom = function () {
        $('.storerooms .rooms_1').hide();
        $('.storerooms .rooms_2').show();
        $('#p_add_bank_name').focus();
    }
    //关闭添加试题库
    $rootScope.closeStoreroom_2 = function () {
        $('.storerooms .rooms_2').hide();
        $('.storerooms .rooms_1').show();
    }
    //添加试题库
    $rootScope._addBookRoot = function () {
        if (!$rootScope.root_param.bank_title) {
            layer.alert('请填写题库名称!')
            return false;
        }
        services._saveBank({
            bank_title: $rootScope.root_param.bank_title
        }).success(function (res) {
            if (res.code == 0) {
                $rootScope.root_param.bank_title = null;
                //获取我的题库
                services._getBankList().success(function (res) {
                    $rootScope.myBankList = res.data;
                    if (res.data.length > 0) {
                        $rootScope.root_param.selDfBank = res.data[0];
                    }
                });
                $rootScope.closeStoreroom_2();
            }
            else {
                layer.alert(res.message);
            }
        })
    }
    //清除试题篮
    $rootScope._delQuestionAll = function (fn) {
        angular.forEach($rootScope.curriculums, function (kc) {
            kc.hasst = 0;
            angular.forEach(kc.children, function (tx) {
                tx.children = [];
            })
        })
        $rootScope.showCurriculumsTitle = 0;
        $rootScope.BasketExams = [];
        services._oneKeyDel().success(function () {
            if (fn) fn();
        });
    }
    //验证是否存在于试题篮
    $rootScope._judgeBasket = function (subject) {
        var bool = false;
        angular.forEach($rootScope.BasketExams, function (item) {
            if (item.id == subject.id) {
                bool = true;
            }
        })
        return bool;
    }
    //按题型删除试题-试题篮
    $rootScope._delQuestionArray = function (item) {
        var ids = [];
        var children = [];
        for (mm in item.children) {
            children[mm] = item.children[mm]
        }
        angular.forEach(children, function (mm) {
            ids.push(mm.id);
            $rootScope._covertQuestionNum(mm, true);
            //$rootScope.BasketExams.splice($rootScope.BasketExams.indexOf(mm), 1);
        })
        services._delBasket({
            ids: ids
        }).success(function (res) {
            if (res.code == 0) {
                item.children = [];
            }
            else {
                layer.alert(res.message);
            }
        })
    }
    //添加到试题篮
    $rootScope._addBasket = function (subject, fn) {
        var bool = null;
        angular.forEach($rootScope.BasketExams, function (item) {
            if (item.id == subject.id) {
                bool = item;
            }
        })
        //add 加
        if (bool == null) {
            services._addBasket({
                subject_id: subject.id
            }).success(function (res) {
                if(fn) fn();
            })
            $rootScope._covertQuestionNum(subject);
        }
        //subtract 减
        else {
            services._delBasket({
                ids: [subject.id]
            }).success(function (res) {
                if(fn) fn();
            })
            $rootScope._covertQuestionNum(subject, true);
        }
    }
    //格式化html
    $rootScope._trustAsHtml = function (html) {
        return $sce.trustAsHtml(html);
    }
    //公共的loading
    $rootScope.loading = null;
    $rootScope.loadingStart = function () {
        if (!$rootScope.loading) {
            $rootScope.loading = layer.open({
                type: 1,
                title: false,
                closeBtn: 0,
                shadeClose: false,
                skin: 'yourclass',
                content: '<div class="paper_loading"></div>'
            });
        }
    }
    $rootScope.loadingEnd = function () {
        $('.paper_loading').addClass('loading_end');
        setTimeout(function () {
            layer.close($rootScope.loading);
            $rootScope.loading = null;
        }, 666);
    }
    //超级管理员权限
    $rootScope.superManage = function () {
        if ($rootScope._USERINFO)
            return $rootScope._USERINFO.role_type == 1;
        else
            return false;
    }
    $rootScope.now = 0;
    //默认缓存
    $rootScope.create_exam = function (bool) {
        $rootScope.paper_tf = true;
        if (bool) {
            $state.go("new_Exampaper");
        }
    };
    //试卷预览
    $rootScope._now_papers = function (data) {
        $state.go("Seepaper", {id: data})
    };

    $rootScope.Lreplacehtml = function(html){
        return html ? html.replace(/text-align: justify;/g, "text-align: justify;text-indent:2em;line-height:25px;")
            .replace(/text-align:justify;/g, "text-align: justify;text-indent:2em;line-height:25px;"): html;
    }
    //试题篮试题下载
    $scope.downList = function () {
        console.log($rootScope.BasketExams);
        $scope.now_BasketList = $rootScope.BasketExams;
        setTimeout(function(){
            $scope.now_BasketListAll = $("#now_BasketList").html();
            console.log($scope.now_BasketListAll);
            var fragment = '<!DOCTYPE html>' +
                '<html lang="en">' +
                '<head>' +
                '<meta charset="UTF-8">' +
                '<title>answerCardDown</title>' +
                '<style>' +
                '*{margin:0;padding:0;}' +
                '</style>' +
                '</head>' +
                '<body oncopy="return false;"  oncut="return false;" oncontextmenu="return false" ondragstart="return false" onselectstart ="return false" onbeforecopy="return false">' +
                ''+$scope.now_BasketListAll+'</body>' +
                '</html>';
            services._send_fragment({fragment:fragment}).success(function (res) {
                if(res.code==0){
                    var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + '/admin/subject/downloadSubjectsDoc ?htmlPath='+res.data + '"></iframe>');
                    $("body").append(iframe);
                }
            })
        },1000)


        // var all_testId = '';
        // angular.forEach($rootScope.BasketExams, function (item, index) {
        //     all_testId += item.id + ',';
        // });
        // var This_ids = all_testId.substring(0, all_testId.length - 1);
        // var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + '/admin/subject/downloadSubjects?ids=' + This_ids + '&token=' + $rootScope.token + '"></iframe>');
        // $("body").append(iframe);
    }


    //页面上显示级别名称---分析页面用
    $rootScope.show_leve_tf = false;
    //新建题库
    $rootScope.creat_bank = function (bool) {
        $rootScope.bank_tf = true;
        $state.go("myOptionBanks");
    };
    //鼠标移动到按钮上提醒
    $rootScope.btnTip = function (e, title) {
        layer.tips(title, e.target, {tips: 1, time: 1000});
    }
    //打开表单
    $rootScope.formOpen = function () {
        $(".form_content").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");
    };
    $rootScope.formOpen2 = function () {
        $(".form_content2").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");
    };
    $rootScope.formOpen3 = function () {
        $(".form_content3").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");
    };
    //关闭表单
    $rootScope.formClose = function () {
        $(".form_content").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
    };
    $rootScope.formClose2 = function () {
        $(".form_content2").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
    };
    $rootScope.formClose3 = function () {
        $(".form_content3").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
    };
    //排序方法
    $rootScope._by = function (name) {
        return function (o, p) {
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
    //反向排序
    $rootScope.rev_by = function (name) {
        return function (o, p) {
            var a, b;
            if (typeof o === "object" && typeof p === "object" && o && p) {
                a = o[name];
                b = p[name];
                if (a === b) {
                    return 0;
                }
                if (typeof a === typeof b) {
                    return a > b ? -1 : 1;
                }
                return typeof a > typeof b ? -1 : 1;
            }
            else {
                throw ("error");
            }
        }
    }
});

myApp.run(['$rootScope', '$state', function ($rootScope, $state) {
    //开始加载新页面
    $rootScope.$on('$stateChangeStart', function (event, toState, fromState, fromParams) {
        if (layer) {
            $rootScope.pageLoading = layer.load(1, {
                shade: [0.1, '#fff'] //0.1透明度的白色背景
            });
        }
        //手工组卷标识
        //$rootScope.examKnowledge_id = null;
        $rootScope.skipPage = toState;
        if (toState.name == "login" || toState.name == "404") {
            $("body").addClass("un-login");
        }
        else if ($rootScope._USERINFO == null) {
            $("body").removeClass("un-login");
            var _USERINFO = window.sessionStorage.getItem("_USERINFO");
            var _ALLMENU = window.sessionStorage.getItem("_ALLMENU");
            var _userinfo = null, _allmenu = null;
            var token = $.cookie("LOGINUSERINFO_TOKEN");
            if (token) {
                $rootScope.token = token;
            }
            if (_USERINFO && _USERINFO != "") {
                _userinfo = eval("(" + _USERINFO + ")");
                $rootScope._rloadSystemData(_userinfo, _allmenu);
            }
            else if (token && token != "") {
                $rootScope._login(null, token);
                event.preventDefault();
            }
            else {
                $rootScope._toPage("login");
                event.preventDefault();
            }
        }
        else {
            $("body").removeClass("un-login");
        }
    });
    //页面加载成功
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        window.scrollTo(0, 0);
        setTimeout(function () {
            $(".animated").removeClass("fadeIn");
        }, 2000)
        layer.close($rootScope.pageLoading);
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
        templateUrl: ctxPath + "/static/teacher/model/login/page.html",
        controller: 'loginController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/login/page.css',
                    ctxPath + '/static/teacher/model/login/page.js'])
            }]
        }
    });
    //404
    $stateProvider.state("404", {
        url: "/404",
        templateUrl: ctxPath + "/static/teacher/model/other/404/page.html",
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/other/404/page.css'])
            }]
        }
    });
    ////////////////////////////////////////默认首页////////////////////////////////////////
    //首页
    $stateProvider.state("home", {
        url: "/home",
        templateUrl: ctxPath + "/static/teacher/model/home/page.html",
        controller: 'homeController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/home/page.css',
                    ctxPath + '/static/teacher/model/home/page.js'])
            }]
        }
    });
    //试题库
    $stateProvider.state("exams", {
        url: "/exams?s",
        templateUrl: ctxPath + "/static/teacher/model/exams/page.html",
        controller: 'examsController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/exams/page.css',
                    ctxPath + '/static/teacher/model/exams/page.js'])
            }]
        }
    });
    //学校题库
    $stateProvider.state("schoolBlank", {
        url: "/schoolBlank?s",
        templateUrl: ctxPath + "/static/teacher/model/schoolBlank/page.html",
        controller: 'schoolBlankController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/schoolBlank/page.css',
                    ctxPath + '/static/teacher/model/schoolBlank/page.js'])
            }]
        }
    });
    //试卷库
    $stateProvider.state("examps", {
        url: "/examps?s",
        templateUrl: ctxPath + "/static/teacher/model/examps/page.html",
        controller: 'exampsController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/examps/page.css',
                    ctxPath + '/static/teacher/model/examps/page.js'])
            }]
        }
    });
    //知识点组卷
    $stateProvider.state("examKnowledge", {
        url: "/examKnowledge?id",
        templateUrl: ctxPath + "/static/teacher/model/examKnowledge/page.html",
        controller: 'examKnowledgeController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/examKnowledge/page.css',
                    ctxPath + '/static/teacher/model/examKnowledge/page.js'])
            }]
        }
    });
    //模板组卷
    $stateProvider.state("examTemplate", {
        url: "/examTemplate",
        templateUrl: ctxPath + "/static/teacher/model/examTemplate/page.html",
        controller: 'examTemplateController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/examTemplate/page.css',
                    ctxPath + '/static/teacher/model/examTemplate/page.js'])
            }]
        }
    });
    //导航栏 统计分析
    $stateProvider.state("staAnalysis", {
        url: "/staAnalysis",
        templateUrl: ctxPath + "/static/teacher/model/staAnalysis/page.html",
        controller: 'staAnalysisController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/staAnalysis/page.css',
                    ctxPath + '/static/teacher/model/staAnalysis/page.js'])
            }]
        }
    });
    //生成试卷
    $stateProvider.state("examPaper", {
        url: "/examPaper?template&source&id",
        templateUrl: ctxPath + "/static/teacher/model/examPaper/page.html",
        controller: 'examPaperController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/examPaper/page.css',
                    ctxPath + '/static/teacher/model/examPaper/page.js'])
            }]
        }
    });
    //生成试卷-手工组卷
    $stateProvider.state("examPaperOther", {
        url: "/examPaperOther?template&source&id",
        templateUrl: ctxPath + "/static/teacher/model/examPaperOther/page.html",
        controller: 'examPaperOtherController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/examPaperOther/page.css',
                    ctxPath + '/static/teacher/model/examPaperOther/page.js'])
            }]
        }
    });
    //试卷查看
    $stateProvider.state("Seepaper", {
        url: "/Seepaper/:id",
        templateUrl: ctxPath + "/static/teacher/model/Seepaper/page.html",
        controller: 'SeepaperController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/Seepaper/page.css',
                    ctxPath + '/static/teacher/model/Seepaper/page.js'])
            }]
        }
    });

    //我的信息编辑
    $stateProvider.state("editUserInfo", {
        url: "/editUserInfo",
        templateUrl: ctxPath + "/static/teacher/model/editUserInfo/page.html",
        controller: 'editUserInfoController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/editUserInfo/page.css',
                    ctxPath + '/static/teacher/model/editUserInfo/page.js'])
            }]
        }
    });
    //我的试题库
    $stateProvider.state("myOptionBanks", {
        url: "/myOptionBanks",
        templateUrl: ctxPath + "/static/teacher/model/myOptionBanks/page.html",
        controller: 'myOptionBanksController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/myOptionBanks/page.css',
                    ctxPath + '/static/teacher/model/myOptionBanks/page.js'])
            }]
        }
    });
    //公共试卷
    $stateProvider.state("publicPapers", {
        url: "/publicPapers",
        templateUrl: ctxPath + "/static/teacher/model/publicPapers/page.html",
        controller: 'publicPapersController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/publicPapers/page.css',
                    ctxPath + '/static/teacher/model/publicPapers/page.js'])
            }]
        }
    });
    //我的试卷库
    $stateProvider.state("myPapers", {
        url: "/myPapers",
        templateUrl: ctxPath + "/static/teacher/model/myPapers/page.html",
        controller: 'myPapersController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/myPapers/page.css',
                    ctxPath + '/static/teacher/model/myPapers/page.js'])
            }]
        }
    });
    //我的考试管理
    $stateProvider.state("myExamManage", {
        url: "/myExamManage",
        templateUrl: ctxPath + "/static/teacher/model/myExamManage/page.html",
        controller: 'myExamManageController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/myExamManage/page.css',
                    ctxPath + '/static/teacher/model/myExamManage/page.js'])
            }]
        }
    });
    //我的班级
    $stateProvider.state("myClasses", {
        url: "/myClasses",
        templateUrl: ctxPath + "/static/teacher/model/myClasses/page.html",
        controller: 'myClassesController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/myClasses/page.css',
                    ctxPath + '/static/teacher/model/myClasses/page.js'])
            }]
        }
    });
    //学生的最近成绩
    $stateProvider.state("recentTest", {
        url: "/recentTest/:id",
        templateUrl: ctxPath + "/static/teacher/model/recentTest/page.html",
        controller: 'recentTestController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/recentTest/page.css',
                    ctxPath + '/static/teacher/model/recentTest/page.js'])
            }]
        }
    });
    //上传试题
    $stateProvider.state("update_paper", {
        url: "/update_paper",
        templateUrl: ctxPath + "/static/teacher/model/update_paper/page.html",
        controller: 'update_paperController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/update_paper/page.css',
                    ctxPath + '/static/teacher/model/update_paper/page.js'])
            }]
        }
    });
    //手工命题
    $stateProvider.state("subject_add", {
        url: "/subject_add",
        templateUrl: ctxPath + "/static/teacher/model/subject_add/page.html",
        controller: 'subject_addController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/subject_add/page.css',
                    ctxPath + '/static/teacher/model/subject_add/page.js'])
            }]
        }
    });
    //新建考试
    $stateProvider.state("new_Exampaper", {
        url: "/new_Exampaper/:id",
        templateUrl: ctxPath + "/static/teacher/model/new_Exampaper/page.html",
        controller: 'new_ExampaperController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/new_Exampaper/page.css',
                    ctxPath + '/static/teacher/model/new_Exampaper/page.js'])
            }]
        }
    });

    //考试分析
    $stateProvider.state("examAnalisis", {
        url: "/examAnalisis/:exam_id&:status&:id",
        templateUrl: ctxPath + "/static/teacher/model/examAnalisis/page.html",
        controller: 'examAnalisisController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/examAnalisis/page.css',
                    ctxPath + '/static/teacher/model/examAnalisis/page.js'])
            }]
        }
    });
    //考生分析
    $stateProvider.state("studentAnalisis", {
        url: "/studentAnalisis/:id&:exam_id&:score&:status&:ana_id",
        templateUrl: ctxPath + "/static/teacher/model/studentAnalisis/page.html",
        controller: 'studentAnalisisController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/studentAnalisis/page.css',
                    ctxPath + '/static/teacher/model/studentAnalisis/page.js'])
            }]
        }
    });
    //班级统计
    $stateProvider.state("classesAnalisis", {
        url: "/classesAnalisis",
        templateUrl: ctxPath + "/static/teacher/model/classesAnalisis/page.html",
        controller: 'classesAnalisisController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/classesAnalisis/page.css',
                    ctxPath + '/static/teacher/model/classesAnalisis/page.js'])
            }]
        }
    });

    //年级统计
    $stateProvider.state("gradeAnalisis", {
        url: "/gradeAnalisis",
        templateUrl: ctxPath + "/static/teacher/model/gradeAnalisis/page.html",
        controller: 'gradeAnalisisController',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load([ctxPath + '/static/teacher/model/gradeAnalisis/page.css',
                    ctxPath + '/static/teacher/model/gradeAnalisis/page.js'])
            }]
        }
    });
});
