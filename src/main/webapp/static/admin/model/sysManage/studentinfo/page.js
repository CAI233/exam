myApp.controller('studentinfoController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    //数据列表
    services["_data_teachinfo"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/listAll', param, "POST");
    }
    //新增人员信息
    services["_add_eMPerson"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/save', param, "POST");
    }
    //删除用户
    services["_del_user"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/delPerson', param, "POST");
    }
    //生成用户
    services["_add_user"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/addAccount', param, "POST");
    }
    //导入
    services["_import_excel"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/excelImport/importUsers', param, "POST");
    }
    //通过年级查询班级
    services["_get_classes"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/classes/gradeQueryClass', param, "POST");
    }
    //班级替换
    services["_update_classes"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/classes/classReplace', param, "POST");
    }
    // 下载模板
    $scope.load_model = function () {
        var src = ctxPath + "/static/excelFile/student.xls";
        var iframe = $('<iframe style="display: none" src="' + src + '?v=' + (new Date()).getTime().toString() + '"></iframe>');
        $("#studentinfo").append(iframe);
    }

    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                pageNum: 1,
                total: 0,
                person_type: 2,
                searchText: null,
                person_status:0
            },
            columns: [
                {field: 'person_name', title: "姓名", align: 'left'},
                // {field: 'person_spell', title: "姓名全拼", align: 'left'},
                {field: 'person_studentid', title: "学号", align: 'left'},
                {
                    field: 'person_sex', title: "性别", align: 'left',
                    formatter: function (value, row, index) {
                        return ["男", "女"][value - 1] || "";
                    }
                },
                {field: 'person_id', title: "身份证号", align: 'left'},
                {field: 'person_email', title: "邮箱", align: 'left'},
                {field: 'person_phone', title: "手机", align: 'left'},
                {field: 'class_names', title: "班级", align: 'left'},
                {
                    field: 'status', title: "状态", align: 'left',
                    formatter: function (value, row, index) {
                        return ["已停用", "已启用"][value - 1] || "";
                    }
                },
                {field: 'remark', title: "备注", align: 'left'}
            ]
        },
        reload: function (param) {
            services._data_teachinfo(param).success(function (res) {
                $scope.tableControl.loadData(res.data);
            })
        }
    };

    // setTimeout(function(){
    //     This_form.render();
    // },1);
    //学生编号
    $scope.show_num = function(i){
        $scope.selRow.person_studentid = i.replace(/\D/g,'');
    };

    $scope.status = false;
    $scope.selRow = {};

    //加载
    $scope.load = function () {
        //页面操作内容
        $scope.classes_param = {pageNum: 1,pageSize: 1000}
        //班级
        $scope.classesData = null;
        services._class_list($scope.classes_param).success(function (res) {
            $scope.classesData = res.data.rows;
        })
        $scope.grade_param = {pageNum: 1,pageSize: 1000,dic_code: '10000'}
        //年级
        $scope.gradeData = null;
        services._eMDictionary($scope.grade_param).success(function (res) {
            $scope.gradeData = res.data.rows;
        })
    };
    $scope.load();


    //通过年级查询
    $scope.grade_load = function(){
        // $scope.tableControl.config.param["grade_id"] = $scope.selRow.grade_id;
        // $scope.tableControl.reload($scope.tableControl.config.param);
        $scope.reload();
        services._get_classes({class_grade:$scope.selRow.grade_id}).success(function (res) {
            if(res.code==0){
                $scope.now_classesData = res.data;
                //清空
                $scope.selRow.classes_name = null;
                $scope.selRow.classes_id = null;
            }

        })
    }

    //新增
    $scope.addRow = function () {
        $scope.selRow = {};
        $scope.rev_false = false;
        $scope.status = true;
        $rootScope.formOpen();
    }
    //提交
    $scope._form_submit = function (bool) {
        if (!$scope.selRow.person_name) {
            layer.alert("请填写姓名")
            return false;
        }
        // if (!$scope.selRow.person_spell) {
        //     layer.alert("请填写姓名全拼")
        //     return false;
        // }
        if (!$scope.selRow.person_sex) {
            layer.alert("请选择性别")
            return false;
        }
        if (!$scope.selRow.person_studentid) {
            layer.alert("请填写学号")
            return false;
        }
        if($scope.selRow.person_studentid.length!=10){
            layer.alert("学号是10位数，请填写正确")
            return false;
        }
        var filter_person_email = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
        if ($scope.selRow.person_email == "" || $scope.selRow.person_email == null) {
            layer.alert("请填写邮箱")
            return false;
        } else {
            if (!filter_person_email.test($scope.selRow.person_email)) {
                layer.alert("请填写正确的邮箱")
                return false;
            }
        }

        var filter_phone = /^1[3|4|5|7|8][0-9]{9}$/
        if ($scope.selRow.person_phone == '' || $scope.selRow.person_phone == null) {
            layer.alert("请填写手机号");
            return false;
        } else {
            if (!filter_phone.test($scope.selRow.person_phone)) {
                layer.alert("请填写正确手机号")
                return false;
            }
        }
        // if (!$scope.selRow.person_email) {
        //     layer.alert("请填写邮箱")
        //     return false;
        // }
        // if (!$scope.selRow.person_phone) {
        //     layer.alert("请填写手机号")
        //     return false;
        // }
        if (!$scope.selRow.class_names) {
            layer.alert("请选择班级")
            return false;
        }
        var filter = /\w@\w*\.\w/;
        if ($scope.selRow.email != "" && $scope.selRow.email != null) {
            if (!filter.test($scope.selRow.person_email)) {
                layer.alert("请填写正确的邮箱")
                return false;
            }
        }
        if ($scope.selRow.phone) {
            if (!(/^1[34578]\d{9}$/.test($scope.selRow.person_phone))) {
                layer.alert("手机号码有误，请重填");
                return false;
            }
        }
        $scope.selRow.person_type = 2;
        $scope.selRow.person_source = 2;
        services._add_eMPerson($scope.selRow).success(function (res) {
            if (res.code == 0) {
                if (bool) {
                    $scope.selRow = {};
                    $scope.reload();
                } else {
                    $rootScope.formClose();
                    layer.msg(res.message);
                    $scope.reload();
                }
            }
            else {
                layer.msg(res.message);
            }
        })
    }

    //班级批量替换----弹窗
    $scope.all_update = function(){
        // if(!$scope.selRow.classes_id){
        //     layer.msg("请选择要替换的班级")
        //     return false;
        // }
        $scope.selRow.check_id = null;
        $rootScope.formOpen2();
    };
    //批量替换---保存
    $scope._rev_submit = function(){
        if(!$scope.selRow.check_id){
            layer.msg("请选择学生之后的班级")
            return false;
        }
        var person_ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                // $scope.selRow = $scope.tableControl.data[index]
                person_ids.push($scope.tableControl.data[item.index].id)
            }
        });
        if(person_ids.length ==0 && !$scope.selRow.classes_id){
            layer.msg("请选择学生或者整个班级")
            return false;
        }
        console.log($scope.selRow);
        //front_class_id :替换前班级id  /after_class_id :替换后班级id
        services._update_classes({front_class_id:$scope.selRow.classes_id,after_class_id:$scope.selRow.check_id,person_ids:person_ids}).success(function (res) {
            if(res.code==0){
                console.log(res);
                layer.msg(res.message);
                //清空
                $scope.selRow.grade_id = null;
                $scope.selRow.grade_name = null;
                $scope.selRow.classes_id = null;
                $scope.selRow.classes_name = null;
                $scope.selRow.searchText = null;
                $rootScope.formClose2();
                $scope.reload();

            }else{
                layer.msg(res.message);
            }
        })
    }

    //重新查询
    $scope.reload = function (key, value) {
        $scope.tableControl.config.param.person_type = 2;
        $scope.tableControl.config.param["searchText"] = $scope.selRow.searchText;
        $scope.tableControl.config.param["grade_id"] = $scope.selRow.grade_id;
        $scope.tableControl.config.param["classes_id"] = $scope.selRow.classes_id;
        $scope.tableControl.config.param["person_status"] = $scope.selRow.status;
        $scope.tableControl.reload($scope.tableControl.config.param);
    }

    //清空操作
    $scope.clear_all = function(){
        $scope.selRow.grade_id = null;
        $scope.selRow.grade_name = null;
        $scope.selRow.classes_id = null;
        $scope.selRow.classes_name = null;
        $scope.selRow.searchText = null;
        $scope.selRow.status = 0;
        $scope.selRow.status_name = null;
        $scope.reload();
    }
    //修改
    $scope.row_update = function () {
        $(".form_btns>button").eq(1).hide();
        $scope.rev_false = true;
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
        if ($scope.selRow.person_sex) {
            $scope.selRow.sex_name = $scope.selRow.person_sex == 1 ? "男" : "女";
        }

        $scope.status = false;
        $rootScope.formOpen();
    }

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
                services._del_user({ids: ids}).success(function (res) {
                    if (res.code == 0) {
                        layer.msg(res.message)
                        $scope.reload();
                    } else {
                        layer.msg(res.message)
                    }
                })
            })
        }
    }

    //文件上传
    $('#excel_upload').prettyFile({
        text: "批量导入",
        change: function (res, obj) {
            services._import_excel({data: res.data, bank_id: 2}).success(function (res) {
                if (res.code == 0) {
                    layer.msg(res.message);
                    $scope.reload();
                } else {
                    layer.alert(res.message);
                }
            });
        },
        init: function (obj) {
            $(".file-btn-ku", obj).remove();
            $(".file-btn-text", obj).addClass("layui-btn").removeClass("layui-btn-normal").removeClass("layui-btn-primary")
        }
    });

    $scope.addAccount = function (status) {
        var message = status == 1 ? "启用" : "停用";
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select && $scope.tableControl.data[item.index].status == status) {
                ids.push($scope.tableControl.data[item.index].id)
            }
        });
        if (ids.length == 0) {
            layer.alert("请选择需要" + message + "的用户");
        }
        else {
            layer.confirm('确认' + message + '用户吗？', {
                btn: ['确定', '取消'] //按钮
            }, function () {
                services._add_user({ids: ids, person_type: 2, status: status}).success(function (res) {
                    if (res.code == 0) {
                        layer.msg(res.message);
                        $scope.reload();
                    } else {
                        layer.msg(res.message);
                    }
                })
            })
        }
    }
})
