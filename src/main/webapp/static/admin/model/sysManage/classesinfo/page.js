myApp.controller('classesinfoController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    var myCode = '90000';

    //新增
    services["_add_classes"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/classes/save', param, "POST");
    }
    //删除用户
    services["_del_classes"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/classes/delete', param, "POST");
    };
    //获得老师信息
    services["_data_teachinfo"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/listAll', param, "POST");
    };

    //加载
    $scope.load = function () {
        //年级
        $scope.grade_param = {
            pageNum: 1,
            pageSize: 1000,
            dic_code: '10000'
        }
        $scope.gradeData = null;

        //专业
        $scope.specialty_param = {
            pageNum: 1,
            pageSize: 1000,
            dic_code: '20000'
        }
        $scope.specialtyData = null;

        //老师
        $scope.person_param = {
            pageNum: 1,
            pageSize: 1000,
            person_type: 1
        }
        $scope.personData = null;

        //专业
        services._eMDictionary($scope.specialty_param).success(function (res) {
            $scope.specialtyData = res.data.rows;
            console.log($scope.specialtyData)
        });
        //年级
        services._eMDictionary($scope.grade_param).success(function (res) {
            $scope.gradeData = res.data.rows;
            console.log($scope.gradeData)
        });
        //老师
        services._data_teachinfo($scope.person_param).success(function(res){
            $scope.personData = res.data.rows;
            console.log($scope.personData)
        });
    };
    $scope.load();

    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                pageNum: 1,
                total: 0
            },
            columns: [
                {field: 'id', title: "班级编码", align: 'left'},
                {field: 'class_name', title: "班级名称", align: 'left'},
                {field: 'person_name', title: "班主任", align: 'left'},
                {field: 'grade_name', title: "年级", align: 'left'},
                // {field: 'specialty_name', title: "专业", align: 'left'},
                {field: 'creator_name', title: "创建人", align: 'left'},
                {field: 'create_time', title: "创建日期", align: 'left'},
                {field: 'remark', title: "备注", align: 'left'}
            ]
        },
        reload: function (param) {
            services._class_list(param).success(function (res) {
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
        "dic_code": myCode
    }

    //新增
    $scope.addRow = function () {
        $scope.selRow = {};
        $scope.status = true;
        $rootScope.formOpen();
    }
    //提交
    $scope._form_submit = function (bool) {
        if (!$scope.selRow.class_name) {
            layer.alert("请填写班级名称")
            return false;
        }

        services._add_classes($scope.selRow).success(function (res) {
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
        $scope.tableControl.config.param["dic_code"] = "10000";
        // $scope.tableControl.config.param["pageNum"] = 1;
        $scope.tableControl.reload($scope.tableControl.config.param);
    }
    //修改
    $scope.row_update = function () {
        $(".form_btns>button").eq(1).hide();
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                $scope.selRow = $scope.tableControl.data[index]
                ids.push($scope.tableControl.data[item.index].id)
                //绑定年级
                angular.forEach($scope.gradeData, function (data, index) {
                    if(data.id == $scope.tableControl.data[item.index].class_grade){
                        $scope.selRow.grade_name = data.dic_name;
                    }
                });
                //绑定专业
                angular.forEach($scope.specialtyData, function (data, index) {
                    if(data.id == $scope.tableControl.data[item.index].class_specialty){
                        $scope.selRow.specialty_name = data.dic_name;
                    }
                });
                //绑定老师
                angular.forEach($scope.personData, function (data, index) {
                    if(data.id == $scope.tableControl.data[item.index].person_id){
                        $scope.selRow.person_name = data.person_name;
                    }
                });
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

                services._del_classes({class_ids: ids}).success(function (res) {
                    if (res.code == 0) {
                        layer.msg("删除成功");
                        $scope.reload();
                    } else {
                        layer.msg(res.message)
                    }
                })
                // services._del_eMDictionary({ids: ids}).success(function (res) {
                //     if (res.code == 0) {
                //         layer.msg(res.message);
                //         $scope.reload();
                //     } else {
                //         layer.msg(res.message)
                //     }
                // })
            })
        }
    }

})
