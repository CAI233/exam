myApp.controller('papersTypeCatController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    //新增用户
    services["_add_eMDictionary"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/save', param, "POST");
    }
    //删除用户
    services["_del_eMDictionary"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/delete', param, "POST");
    }
    //删除用户
    services["_list_eMDictionary"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/listAll', param, "POST");
    }

    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                pageNum: 1,
                total: 0,
                dic_code: "70000"
            },
            columns: [
                {field: 'dic_code', title: "试卷类别编码", align: 'left'},
                {field: 'dic_name', title: "试卷类别名称", align: 'left'},
                {field: 'creator_name', title: "创建人", align: 'left'},
                {field: 'create_time', title: "创建日期", align: 'left'},
                {field: 'remark', title: "备注", align: 'left'}

            ]
        },
        reload: function (param) {
            services._list_eMDictionary(param).success(function (res) {
                $scope.tableControl.loadData(res.data);
            })
        }
    };

    $scope.status = false;
    $scope.selRow = {};

    //页面操作内容
    $scope.param = {
        "pageNum": 1,
        "pageSize": 1000,
        "dic_code": "70000"
    }

    //新增
    $scope.addRow = function () {
        $scope.selRow = {};
        $scope.status = true;
        $rootScope.formOpen();
    }
    //提交
    $scope._form_submit = function (bool) {
        if (!$scope.selRow.dic_code) {
            layer.alert("请填写试卷类别编码")
            return false;
        }
        if (!$scope.selRow.dic_name) {
            layer.alert("请填写试卷类别名称")
            return false;
        }
        $scope.selRow.dic_parentcode="70000";
        services._add_eMDictionary($scope.selRow).success(function (res) {
            if (res.code == 0) {
                if(bool){
                    $scope.selRow = {};
                    $scope.reload();
                }else{
                    $rootScope.formClose();
                    layer.msg(res.message);
                    $scope.reload();
                }
            } else {
                layer.msg(res.message);
            }
        })
    }

    //重新查询
    $scope.reload = function (key, value) {
        $scope.tableControl.config.param["dic_code"] = "70000";
        $scope.tableControl.config.param["pageNum"] = 1;
        $scope.tableControl.reload($scope.tableControl.config.param);
    }
    //修改
    $scope.row_update = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                $scope.selRow = $scope.tableControl.data[index]
                ids.push($scope.tableControl.data[item.index].id)
            }
        });
        if (ids.length != 1) {
            layer.alert("请选择你将要修改的数据，同时只能修改一条数据");
            return false;
        }
        $scope.status = false;
        $rootScope.formOpen();
    }


    //删除
    $scope.delRow = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select){
                ids.push($scope.tableControl.data[item.index].id) ;
            }
        });
        if (ids.length == 0) {
            layer.alert("请选择你将要删除的数据");
        }
        else {
            layer.confirm('删除后数据无法找回,确认删除吗？', {
                btn: ['确定', '取消'] //按钮
            }, function () {
                services._del_eMDictionary({ids: ids}).success(function (res) {
                    if (res.code == 0) {
                        layer.msg(res.message);
                        $scope.reload();
                    } else {
                        layer.msg(res.message)
                    }
                })
            })
        }
    }

})
