angular.module('myServices', []).factory('services', function ($http, $rootScope) {
    /**
     * 服务端请求模板
     * @param url 服务端请求url
     * @param param 请求参数
     * @param ajaxType post\get,默认是post
     * @param needFormPostCfg 是否需要表单提交参数
     * @returns {*}
     */
    $rootScope.serverAction = function (url, param, ajaxType, needFormPostCfg) {
        var type = ajaxType;
        if (type == null || type == "") {
            type = "POST";
        }
        if (!param) {
            param = {
                token: $rootScope.token
            };
        }
        if (type == "GET") {
            if ($.param(param)) {
                url = url + "?" + $.param(param);
            }
            return $http({
                method: 'GET',
                url: url
            }).error(function (data, state) {
                console.log("系统错误:" + url.replace("?", "") + state);
            })
        }
        else {
            var _postCfg = {};
            if (needFormPostCfg) {
                _postCfg = {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    transformRequest: function (d) {
                        return $.param(d);
                    }
                };
            }
            //var loading = layer.load(1);
            return $http.post(url, param, _postCfg).error(function (data, state) {
                console.log("系统错误:" + url.replace("?", "") + state);
                //layer.close(loading);
            }).success(function (res) {
                if (res.code == 600) {
                    $rootScope.sessionOut();
                }
                //layer.close(loading);
            })
        }
    }
    var serviceAPI = {
        //退出登录
        _logup: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/logout', param, "POST");
        },
        //用户登录信息-登录
        _login: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/login', param, "POST");
        },
        //获取所有年级 获取所有课程 获取所有专业  （比如年级10000、专业20000、课程30000）
        _eMDictionary: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/listAll', param, "POST");
        },
        //获取课程层级
        _getDicTree: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/getDicTree', param, "POST");
        },
        //获取知识点
        _getKnowledge: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/struct/getKnowledge', param, "POST");
        },
        //添加试题栏 试题
        _addBasket: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/basket/addBasket', param, "POST");
        },
        //移除试题栏 试题
        _delBasket: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/basket/delBasket', param, "POST");
        },
        //试题篮列表
        _basketList: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/basket/basketList', param, "POST");
        },
        //清除试题篮
        _oneKeyDel: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/basket/oneKeyDel', param, "POST");
        },
        //我的题库
        _getBankList: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/questionBank/getBankList', param, "POST");
        },
        //新增题库
        _saveBank: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/questionBank/saveBank', param, "POST");
        },
        //试题----添加收藏
        _add_pages: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/subTeacherRel/addCollection', param, "POST");
        },
        //试题----移除收藏
        _del_pages: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/subTeacherRel/delCollection', param, "POST");
        },
        //试题----加入题库
        _addTo_bank: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/subject/joinBank', param, "POST");
        },
        //生成试卷
        _savePaper: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/pbank/savePaper', param, "POST");
        },
        //试卷详情
        _pbankPreview: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/pbank/pbankPreview', param, "POST");
        },
        //公共题保存

        _addset_sub:function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/subject/reSubject', param, "POST");
        },
        //上传页面---临时试题---保存
        _update_Savesub:function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/subjectcache/updateSubjectCache', param, "POST");
        },
        //试题下载----传html片段给后台
        _send_fragment:function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/subject/saveSubjectsHtml', param, "POST");
        }
        //学校题保存
        // _add_sub :function (param) {
        //     return $rootScope.serverAction(ctxPath + '/admin/subject/saveSubject', param, "POST");
        // }
    };
    return serviceAPI;
})