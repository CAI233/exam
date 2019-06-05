var row_update;
myApp.controller('resultManageController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    if (!$stateParams || !$stateParams.id) {
        $state.go("papers");
    }
    $scope.services = services;
    //列表
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/getPaperPersonResult', param, "POST");
    }
    $scope.tableControl = {
        config: {
            check: false,
            param: {
                pages: 1,
                pageSize: 10,
                total: 0,
                pageNum: 1,
                searchText: null,
                paper_id: $stateParams.id,
                person_type:2
            },
            columns: [
                {field: 'person_name', title: "姓名", align: 'left'},
                {field: 'person_spell', title: "姓名全拼", align: 'left'},
                {field: 'person_studentid', title: "学号", align: 'left'},
                {field: 'person_sex', title: "性别", align: 'left',
                    formatter: function (value, row, index) {
                        return ["男", "女"][value - 1] || "";
                    }
                },
                {field: 'test_start', title: "考试时间", align: 'left',
                    formatter: function (value, row, index) {
                        var test_date = value == "" ? "":"始："+value;
                        if(row.test_end){
                            test_date += "<br/>终：" + row.test_end;
                        }
                        return test_date;
                    }
                },
                {field: 'test_status', title: "考试状态", align: 'left',
                    formatter: function (value, row, index) {
                        return ["未考试", "未交卷", "已交卷"][value - 1] || "";
                    }},
                {field: 'test_result', title: "成绩", align: 'left',
                    formatter:function(value,row,index){
                        return value;
                    }}
            ]
        },
        reload: function (param) {
            services._sub_list(param).success(function (res) {
                console.log(res);
                $scope.tableControl.loadData(res.data)
            })
        }
    };

    //页面操作内容
    $scope.classes_param = {
        pageNum: 1,
        pageSize: 1000,
        dic_code: '10000'
    }
    //班级
    $scope.classesData = null;
    services._dic_list($scope.classes_param).success(function (res) {
        $scope.classesData = res.data.rows;
    })

    $scope.selectClasses = function(item){
        $scope.param.classes_id = item.id;
        $scope.reload();
    };
    $scope.selectStatus = function(item){
        $scope.param.person_status = item.id;
        $scope.reload();
    }

    $scope.selRow = {};
    //页面操作内容
    $scope.param = {
        searchText: null,
        classes_id: null
    };
    //重新查询
    $scope.reload = function () {
        $scope.tableControl.config.param["classes_id"] = $scope.param.classes_id;
        $scope.tableControl.config.param["person_status"] = $scope.param.person_status;
        $scope.tableControl.config.param["searchText"] = $scope.param.searchText;
        $scope.tableControl.config.param["pageNum"] = 1;
        $scope.tableControl.reload($scope.tableControl.config.param);
    };

    //返回
    $scope.backPage = function () {
        $state.go("papers");
    };

});