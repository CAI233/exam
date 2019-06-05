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
            var loading = layer.load(1);
            return $http.post(url, param, _postCfg).error(function (data, state) {
                console.log("系统错误:" + url.replace("?", "") + state);
                layer.close(loading);
            }).success(function (res) {
                if (res.code == 600) {
                    $rootScope.sessionOut();
                }
                layer.close(loading);
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
        //修改密码
        _up_pass: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/user/updatePwd', param, "POST");
        },
        //当前用户可见资源
        _menu: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/sysResource/json/getMenus', param, "POST");
        },
        //资源列表
        _menu_All: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/sysResource/json/list', param, "POST");
        },
        //角色列表
        _role: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/role/listAll', param, "POST");
        },
        //组织列表
        _org: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/organization/getTree', param, "POST");
        },
        //机构列表
        _outfit: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/organization/getOrgExtendList', param, "POST");
        },
        //机构选择列表
        _outfit_list: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/organization/getList', param, "POST");
        },
        //课程选择列表
        // _dic_list: function (param) {
        //     return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/listAll', param, "POST");
        // },
        _dic_list: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/getDicTree', param, "POST");
        },
        _class_list:function(param){
            return $rootScope.serverAction(ctxPath + '/admin/classes/getPageList', param, "POST");
        },
        //获取所有年级 获取所有课程 获取所有专业  （比如年级10000、专业20000、课程30000）
        _eMDictionary: function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/listAll', param, "POST");
        },
    };
    return serviceAPI;
})
    //题型
.factory('dataService', function() {
    var paperSubTypes = [
        { id: 10062 ,name:'单选题'},
        { id: 10067 ,name:'单选题'},
        { id: 10070 ,name:'单选题'},
        { id: 10072 ,name:'单选题'},
        { id: 10073 ,name:'多选题'},
        { id: 10074 ,name:'判断题'},
        { id: 10068 ,name:'填空题'},
        { id: 10063 ,name:'文言文阅读'},
        { id: 10064 ,name:'综合题'},
        { id: 10065 ,name:'现代文阅读'},
        { id: 10066 ,name:'写作题'},
        { id: 10069 ,name:'解答题'},
        { id: 10071 ,name:'阅读理解题'},
    ];
    var paperSublevel = [      //难易度
        {id: 10079, text: "基础题"},
        {id: 10080, text: "中等题"},
        {id: 10081, text: "较难题"},
    ]
    var service={
        data:paperSubTypes,
        level:paperSublevel,
    };
    return service;

});