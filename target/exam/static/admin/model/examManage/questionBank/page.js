var row_update;
myApp.controller('questionBankController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    $scope.services = services;
    //列表
    services["_all_Banklist"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/schoolQuestionBank', param, "POST");
    }

    //新增题库
    services["_add_bank"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/saveBank', param, "POST");
    }
    //题库列表
    services["_bank_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/getBankPageList', param, "POST");
    }
    //删除题库
    services["_del_bank"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/delBanks', param, "POST");
    }

    //题库默认
    $scope.bank_tf = true;

    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                total: 0,
                pageNum: 1,
                searchText: null
            },
            columns: [
                {field: 'bank_title', title: "题库标题",align:'left'},
                {field: 'subject_count', title: "试题数量"},
                {field: 'bank_explain', title: "题库说明", align:'left'},
                {field: 'creator_name', title: "创建人", align:'left'},
                {field: 'action', title: "操作",
                    formatter: function (value, row, index) {
                        var showSubject ='<a onclick="importQuestion(' + row.id + ')">查看试题</a>';
                        return showSubject
                    }
                }
            ]
        },
        reload: function (param) {
            services._bank_list(param).success(function (res) {
                if($scope.bank_tf){
                    $scope.tableControl.loadData(res.data);
                }else{
                    $scope.tableControl.loadData($scope.both_banks)
                }
                    // $scope.tableControl.loadData(res.data);
            })
        }
    };

    //题库
    $scope.all_banks = [{id:0,name:'个人题库',bool:true},{id:1,name:"学校题库",bool:false}];

    //默认选择题库
    $scope.init = function(){
        $scope.all_banks[0].check = true;

        $scope.all_param = {
                pages: 1,
                pageSize: 10,
                total: 0,
                pageNum: 1,
                searchText: null
                }
        services._all_Banklist($scope.all_param).success(function (res) {
            if(res.code==0){
                $scope.both_banks = {
                    pageNum:1,
                    pageSize:10,
                    pages:1,
                    rows:[{"assistant": "", "bank_explain": "", "bank_title": "学校题库", "create_time": "2017-11-27", "creator": null, "creator_name": null, "id": 0, "ids": null, "org_id": null, "status": null, "subject_count":res.data.total, "subject_id": null, "update_time": null, "updater": null}],
                    size:1,
                    total:1
                }
            }

        })
    };
    $scope.init();
    $scope.selRow = {}
    //页面操作内容
    $scope.param = {
        searchText: null
    }
    //重新查询
    $scope.reload = function () {
        $scope.tableControl.config.param["searchText"] = $scope.param.searchText;
        $scope.tableControl.config.param["pageNum"] = 1;
        $scope.tableControl.reload($scope.tableControl.config.param);
    }

    //选择题库
    $scope.select_bank = function(data){
        angular.forEach($scope.all_banks,function(item,index){
            if(data.id!=item.id){
                item.check = false;
            }
        })
        if(data.bool){
            $scope.bank_tf = true;
        }else{
            $scope.bank_tf = false;
        }
        $scope.tableControl.reload($scope.tableControl.config.param);
    };

    //修改
    $scope.row_update = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                ids.push($scope.tableControl.data[item.index].id)
            }
        });
        if (ids.length == 0) {
            layer.alert("请选择你将要修改的数据");
            return false
        }
        if (ids.length > 1) {
            layer.alert("同时只能修改一条数据");
            return false
        }
        $scope.status=false
        $rootScope.formOpen();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                $scope.selRow = $scope.tableControl.data[index]
            }
        });
    }

    //新增
    $scope.addRow = function () {
        $scope.selRow = {}
        $scope.status=true
        $rootScope.formOpen();
    }
    //提交
    $scope._form_submit = function (bool) {
        if (!$scope.selRow.bank_title) {
            layer.alert("请填写题库标题")
            return false;
        }
        services._add_bank($scope.selRow).success(function (res) {
            if (res.code == 0) {
                if (bool) {
                    $rootScope.formClose();
                }
                else {
                    $scope.selRow = {};
                }
                $scope.reload();
                layer.msg('信息保存成功');
            }
            else {
                layer.msg(res.message);
            }
        })
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
                services._del_bank({ids: ids}).success(function (res) {
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

    //导入题目
    importQuestion=function(id){
        $state.go("questionManage", {id: id})
    }
});