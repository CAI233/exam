var row_update;
myApp.controller('paperclassifyController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    if (!$stateParams || !$stateParams.id) {
        $state.go("paperclassify");
    }
    $scope.services = services;
    //新增
    services["_add_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/paperclassify/saveSubject', param, "POST");
    }
    //列表
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/paperclassify/getPageList', param, "POST");
    }
    //删除
    services["_del_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/paperclassify/delSubjectDetails', param, "POST");
    }
    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                total: 0,
                pageNum: 1,
                searchText: null,
                bank_id: $stateParams.id
            },
            columns: [
                {field: 'classify_title', title: "分类标题"},
                {field: 'test_start', title: "考试时间段",
                    formatter: function (value, row, index) {
                        return value + " - "+ row.test_end;
                    }
                },
                {field: 'paper_title', title: "评阅方式"},
                {field: 'result_publictime', title: "成绩公布时间"},
                {field: 'result_publictype', title: "成绩公布方式"},
                {field: 'creator', title: "创建人"},
                {field: 'id', title: "操作",
                    formatter: function (value, row, index) {
                        return value;
                    }
                }
            ]
        },
        reload: function (param) {
            services._sub_list(param).success(function (res) {
                console.log(res);
                $scope.tableControl.loadData(res.data);
            })
        }
    };

    $scope.selRow = {};
    //页面操作内容
    $scope.param = {
        searchText: null
    };
    //重新查询
    $scope.reload = function () {
        $scope.tableControl.config.param["searchText"] = $scope.param.searchText;
        $scope.tableControl.config.param["pageNum"] = 1;
        $scope.tableControl.reload($scope.tableControl.config.param);
    };


    //删除
    $scope.delRow = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                ids.push($scope.tableControl.data[item.index].id)
            }
        });
        if (ids.length == 0) {
            layer.alert("请选择你将要删除的数据");
        }
        else {
            layer.confirm('删除后数据无法找回,确认删除吗？', {
                btn: ['确定', '取消'] //按钮
            }, function () {
                services._del_sub({ids: ids, bank_id: $stateParams.id}).success(function (res) {
                    if (res.code == 0) {
                        layer.msg(res.message);
                        $scope.reload();
                    } else {
                        layer.msg(res.message);
                    }
                })
            })
        }
    };

    //返回
    $scope.backPage = function () {
        $state.go("paperclassify");
    };

    showPapers=function(data){
        debugger;

    }
});