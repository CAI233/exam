var row_update;
myApp.controller('studentManageController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    if (!$stateParams || !$stateParams.id) {
        $state.go("papers");
    }
    $scope.services = services;
    //列表
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/getPaperPerson', param, "POST");
    }

    //试卷信息
    services["_see_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/test_Preview', param, "POST");
    };

    //删除
    services["_del_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/delPapersStudent', param, "POST");
    }
    //添加学生到试卷中
    services["_add_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/addPapersStudent', param, "POST");
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
                {field: 'person_email', title: "邮箱", align: 'left'},
                {field: 'person_phone', title: "手机", align: 'left'},
                {field: 'paper_id', title: "考生状态", align: 'left',
                    formatter:function(value,row,index){
                        var status = "未参加";
                        if(value.indexOf($stateParams.id) > -1){
                            status="已参加";
                        }
                        return status;
                    }}
            ]
        },
        reload: function (param) {
            services._sub_list(param).success(function (res) {
                $scope.persons = []
                angular.forEach(res.data.rows,function(item,index){
                    if(item.status=="2"){
                        $scope.persons.push(item);
                    }
                })
                res.data.rows = $scope.persons;
                $scope.tableControl.loadData(res.data);
            })
        }
    };

    //页面操作内容
    $scope.classes_param = {
        pageNum: 1,
        pageSize: 1000
    }
    //班级
    $scope.classesData = null;
    services._class_list($scope.classes_param).success(function (res) {
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

    //得到当前试卷的结束时间
    services._see_list({id:$stateParams.id}).success(function (res) {
        if (res.code == 0) {
            $scope.stu_status = parseInt(res.data.status);
        }
    });


    $scope.addRow = function () {
        if($scope.stu_status!=3){
            var ids = new Array();
            angular.forEach($scope.tableControl.rows, function (item, index) {
                // debugger;
                if (item.select && $scope.tableControl.data[item.index].paper_id.indexOf($stateParams.id) < 1 && $scope.tableControl.data[item.index].user_id != null) {
                    ids.push($scope.tableControl.data[item.index].id)
                }
            });
            if (ids.length == 0) {
                layer.msg("请检查学员是否参加或是否生成登录用户");
            }else{
                services._add_sub({ids: ids, paper_id: $stateParams.id}).success(function (res) {
                    if (res.code == 0) {
                        layer.msg(res.message);
                        $scope.reload();
                    } else {
                        layer.msg(res.message);
                    }
                });
            }
        }else{
            layer.msg("考试已结束，不能加入考生");
        }
    };

    //删除
    $scope.delRow = function () {
        if($scope.stu_status==1) {
            var ids = new Array();
            angular.forEach($scope.tableControl.rows, function (item, index) {
                if (item.select && $scope.tableControl.data[item.index].paper_id != '') {
                    ids.push($scope.tableControl.data[item.index].user_id)
                }
            });
            if (ids.length == 0) {
                layer.msg("请选择你将要移除的学员");
            } else {

                    layer.confirm('是否确认移除学员吗？', {
                        btn: ['确定', '取消'] //按钮
                    }, function () {
                        services._del_sub({ids: ids, paper_id: $stateParams.id}).success(function (res) {
                            if (res.code == 0) {
                                layer.msg(res.message);
                                $scope.reload();
                            } else {
                                layer.msg(res.message);
                            }
                        })
                    })

            }
        }else{
            layer.msg("考试已发布或已结束，不能删除考生");
        }
    };

    //返回
    $scope.backPage = function () {
        $state.go("papers");
    };

});