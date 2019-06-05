myApp.controller('teachinfoController', function ($rootScope, $scope, services, $sce, $stateParams) {
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
    };
    // 下载模板
    $scope.load_model = function () {
        var src = ctxPath + "/static/excelFile/teacher.xls";
        var iframe = $('<iframe style="display: none" src="' + src + '?v=' + (new Date()).getTime().toString() + '"></iframe>');
        $("#teachinfo").append(iframe);
    }

    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                pageNum: 1,
                total: 0,
                person_type: 1,
                searchText: null,
            },
            columns: [
                {field: 'person_name', title: "姓名", align: 'left'},
                {field: 'person_spell', title: "姓名全拼", align: 'left'},
                {field: 'person_id', title: "身份证号", align: 'left'},
                {
                    field: 'person_sex', title: "性别", align: 'left',
                    formatter: function (value, row, index) {
                        console.log(row);
                        return ["男", "女"][value - 1] || "";
                    }
                },
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

    $scope.status = false;
    $scope.selRow = {};

    //加载
    $scope.load = function () {
        //页面操作内容
        $scope.param = {
            pageNum: 1,
            pageSize: 1000
        }
        //班级
        $scope.classesData = null;
        services._class_list($scope.param).success(function (res) {
            $scope.classesData = res.data.rows;
            $scope.classesData.unshift({id: 0, class_name: '全部'})
        })
    };
    $scope.load();

    $scope.selectClick = function (data) {
        $scope.selRow.class_names = [];
        $scope.selRow.class_ids = [];
        if (data.id == 0) {
            angular.forEach($scope.classesData, function (item, index) {
                item.check = data.check;
                if (item.id != 0) {
                    $scope.selRow.class_names.push(item.class_name);
                    $scope.selRow.class_ids.push(item.id);
                }
            })
        } else {
            angular.forEach($scope.classesData, function (item, index) {
                if (item.check) {
                    if (item.id != 0) {
                        $.inArray(item.class_name, $scope.selRow.class_names) == -1 && $scope.selRow.class_names.push(item.class_name)
                        $.inArray(item.id, $scope.selRow.class_ids) == -1 && $scope.selRow.class_ids.push(item.id)
                    }
                } else {
                    $scope.classesData[0].check = false;
                }
            });
            if ($scope.selRow.class_names.length == $scope.classesData.length - 1) {
                $scope.selectClick({id: 0, check: true});
            }
        }
        $scope.selRow.class_names = $scope.selRow.class_names.toString();
        $scope.selRow.class_ids = $scope.selRow.class_ids.toString();
    }


    //新增
    $scope.addRow = function () {
        $scope.selRow = {};
        angular.forEach($scope.classesData, function (item, index) {
            if (item.check) {
                item.check = false;
            }
        })
        $scope.status = true;
        $rootScope.formOpen();

    }
    //提交
    $scope._form_submit = function (bool) {
        if (!$scope.selRow.person_name) {
            layer.alert("请填写姓名")
            return false;
        }
        if (!$scope.selRow.person_spell) {
            layer.alert("请填写姓名全拼")
            return false;
        }
        if (!$scope.selRow.person_sex) {
            layer.alert("请选择性别")
            return false;
        }
        var filter_person_id = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        if ($scope.selRow.person_id == '' || $scope.selRow.person_id == null) {
            layer.alert("请填写身份证号")
            return false;
        } else {
            if (!filter_person_id.test($scope.selRow.person_id)) {
                layer.alert("请填写正确身份证号")
                return false;
            }
        }
        // var filter = /\w@\w*\.\w/;
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
        if (!$scope.selRow.class_names) {
            layer.alert("请选择班级")
            return false;
        }


        $scope.selRow.person_type = 1;
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

    //重新查询
    $scope.reload = function (key, value) {
        $scope.tableControl.config.param.person_type = 1;
        $scope.tableControl.config.param["searchText"] = $scope.param.searchText;
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
            }
        });
        if (ids.length != 1) {
            layer.alert("请选择你将要修改的数据，同时只能修改一条数据");
            return false;
        }
        if ($scope.selRow.class_ids) {
            var class_ids = $scope.selRow.class_ids.split(',');
            angular.forEach($scope.classesData, function (item, index) {
                if ($.inArray('' + item.id + '', class_ids) != -1) {
                    item.check = true;
                }
            });
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
                        layer.msg("删除成功")
                        $scope.reload();
                    } else {
                        layer.msg(res.message)
                    }
                })
            })
        }
    }
    $scope.load = function () {
        $("body").delegate(".xxx-form-select", "click", function () {
            $(".xxx-form-select").not(this).removeClass("xxx-form-selected");
            $(this).addClass("xxx-form-selected");
            return false;
        })
        $("body").bind("click", function () {
            $(".xxx-form-select").removeClass("xxx-form-selected");
        });

    }
    $scope.load()

    //文件上传
    $('#excel_upload').prettyFile({
        text: "批量导入",
        change: function (res, obj) {
            services._import_excel({data: res.data, bank_id: 1}).success(function (res) {
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
                services._add_user({ids: ids, person_type: 1, status: status}).success(function (res) {
                    if (res.code == 0) {
                        layer.alert(res.message);
                        $scope.reload();
                    } else {
                        layer.msg(res.message);
                    }
                })
            })
        }
    }
})
