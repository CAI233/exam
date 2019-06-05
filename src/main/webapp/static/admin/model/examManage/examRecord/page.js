myApp.controller('examRecordController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    //新增课程
    services["_add_eMDictionary"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/save', param, "POST");
    }
    //删除课程
    services["_del_eMDictionary"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/delete', param, "POST");
    }
    //课程列表
    services["_curr_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/currList', param, "POST");
    }

    //课程列表
    services["_dic_tree"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/getDicTree', param, "POST");
    }

    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                pageNum: 1,
                total: 0,
                dic_code: "30000"
            },
            columns: [
                {field: 'dic_code', title: "编码", align: 'left'},
                {field: 'dic_name', title: "名称", align: 'left'},
                {field: 'dic_alias', title: "别名", align: 'left'},
                {field: 'creator_name', title: "创建人", align: 'left'},
                {field: 'create_time', title: "创建日期", align: 'left'},
                {field: 'remark', title: "备注", align: 'left'}
            ]
        },
        reload: function (param) {
            $scope.load ();
        }
    };

});
