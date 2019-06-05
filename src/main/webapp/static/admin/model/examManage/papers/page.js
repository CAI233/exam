var row_update;
myApp.controller('papersController', function ($rootScope, $scope, services, $sce, $stateParams, $state){
    $scope.services = services;
    //列表
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/getPageList', param, "POST");
    };
    //删除
    services["_del_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/delPapers', param, "POST");
    };
    services["_deploy_paper"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/deployPapers', param, "POST");
    };
    services["_deploy_paperid"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/deployPaperById', param, "POST");
    };
    services["_revoke_test"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/revoke', param, "POST");
    };

    //试卷信息
    services["_see_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/test_Preview', param, "POST");
    };

    services["_get_paper_info"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/getPaperInfo', param, "POST");
    };
    //考生列表
    services["_stu_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/getPaperPersonResult', param, "POST");
    }

    $scope.stu_param={
        pages: 1,
            pageSize: 10,
            total: 0,
            pageNum: 1,
            searchText: null,
            paper_id: null,
            person_type:2
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
                {field: 'paper_title', title: "标题"},
                {
                    field: 'paper_start', title: "考试时间",
                    formatter: function (value, row, index) {
                        // console.log(row)
                        // return value;
                        return value+"&nbsp;-&nbsp;"+row.paper_end.substring(11,row.paper_end.length);
                    }
                },
                {field: 'paper_addr', title: "考试地点"},
                {field: 'paper_vcode', title: "验证码",
                    formatter: function (value, row, index) {
                        if(row.status==1){
                            value = "";
                        }
                        return value;
                    }
                },
                {field: 'paper_pass', title: "及格分/卷面总分",
                    formatter: function (value, row, index) {
                        // console.log(row);
                        return value+"&nbsp;/&nbsp;"+row.paper_full;
                    }
                },
                {field: 'subject_marks', title: "实到人/总人数",
                    formatter: function (value, row, index) {
                        return  row.person_fact+"&nbsp;/&nbsp;"+row.person_total;
                    }
                },
                {field: 'passing_number', title: "及格人数",
                    formatter: function (value, row, index) {
                        return !value ? "0":value;
                    }
                },
                {field: 'creator_name', title: "创建人"},
                /*{field: 'subject_marks', title: "难度"},*/
                {field: 'status', title: "试卷状态",
                    formatter: function (value, row, index) {
                        return ["未发布", "已发布","考试结束"][value - 1] || "";
                    }
                },
                {field: 'id', title: "操作",
                    formatter: function (value, row, index) {
                        var config = '<a onclick="showStudents(\''+row.id+'\')">考生</a>';
                        var showResult = '<a onclick="showResult(\''+row.id+'\')" >考试情况</a>';
                        var showPapers ='<a onclick="paperSetting(\''+row.id +'\',\'' + row.isUse+'\',\'' + row.status+'\')">试卷详情</a>';
                        var printPapers ='<a onclick="showPrint(\''+row.id+'\')">打印</a>';
                        var seePapers = '<a href="#/seeManage/'+row.id+'"  target="_blank">预览</a>';
                        if(row.status!=1){
                            return config +'&nbsp;&nbsp;'+ showResult+'&nbsp;&nbsp;'+showPapers+'&nbsp;&nbsp;'+seePapers+'&nbsp;&nbsp;' + printPapers;
                        }else{
                            return config +'&nbsp;&nbsp;'+ showPapers+'&nbsp;&nbsp;'+seePapers;
                        }

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
        // $scope.tableControl.config.param["paper_grade"] = $scope.param.paper_grade;
        // $scope.tableControl.config.param["paper_specialty"] = $scope.param.paper_specialty;
        $scope.tableControl.config.param["paper_type"] = $scope.param.paper_type;
        $scope.tableControl.config.param["pageNum"] = 1;
        $scope.tableControl.reload($scope.tableControl.config.param);
    };
    $scope.Dreload = function () {
        // $scope.param.paper_grade=null;$scope.param.grade_name=null
        // $scope.param.paper_specialty=null;$scope.param.specialty_name=null;
        $scope.param.paper_type=null;$scope.param.paper_type_name=null;
        $scope.param.searchText=null
        $scope.reload();
    };

    //删除
    $scope.delRow = function () {
        var ids = new Array();
        var idsa = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select && $scope.tableControl.data[item.index].status == 1) {
                ids.push($scope.tableControl.data[item.index].id);
            }
            if (item.select && $scope.tableControl.data[item.index].status == 2) {
                ids.push($scope.tableControl.data[item.index].id);
                idsa.push($scope.tableControl.data[item.index].id);
            }
            if (item.select && $scope.tableControl.data[item.index].status == 3) {
                ids.push($scope.tableControl.data[item.index].id);
                idsa.push($scope.tableControl.data[item.index].id);
            }
        });

        if (ids.length == 0 ) {
            layer.alert("请选择你将要删除的数据");
        }
        else{
            if(idsa.length>0){
                layer.alert("选中的试卷已发布或考试结束，无法删除");
            }
            else{
                layer.confirm('删除后数据无法找回,确认删除吗？', {
                    btn: ['确定', '取消'] //按钮
                }, function () {
                    services._del_sub({paperIds: ids, bank_id: $stateParams.id}).success(function (res) {

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
    };
    showStudents=function(paperId){
        $state.go("studentManage", {id: paperId})
    }

    showResult=function(paperId){
        $scope.stu_param.paper_id = paperId;
        services._stu_list($scope.stu_param).success(function (res) {
            if(res.code==0){
                if(res.data.rows.length!=0){
                    $state.go("resultManage", {id: paperId})
                }else{
                    layer.msg("该试卷目前没有考生加入，请加入考生")
                }
            }
        })

    }
    paperSetting=function(paperId,isUse,status){
        var data = Date.parse(new Date(moment().format('YYYY-MM-DD HH:mm').replace(/\-/g,'/')));
        $state.go("paperSetting", {id: paperId,isUse:isUse,status:status})

    };
    showPrint=function(paperId){
        var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + 'admin/pbank/downPBank?id=' + paperId + '"></iframe>');
        $("#papers").append(iframe);
    }

    //发布
    $scope.openTest = function () {
        var ids = new Array();
        var idse = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select && $scope.tableControl.data[item.index].status == 1) {
                $scope.selRow = $scope.tableControl.data[index]
                ids.push($scope.tableControl.data[item.index].id)
            }
            if (item.select) {
                idse.push($scope.tableControl.data[item.index].id)
            }
        });
        if(idse.length==0){
            layer.msg("请选择的要发布的试卷");
            return;
        }
        if (ids.length == 0) {
            layer.msg("您选择的试卷已发布或考试结束");
        } else if (ids.length == 1 && ids.length==idse.length) {
            $scope.status = true;
            $scope.selRow.paper_vcode = randCode();
            $rootScope.formOpen();
        } else {
            if(ids.length != idse.length){
                layer.msg("您选择的试卷中有已发布或考试结束试卷，请重新选择");
            }else{
                $rootScope.formClose();
                $rootScope.stopEvent(event);
                //打开层
                $scope.layer_export = layer.open({
                    type: 1,
                    title: "发布",
                    area: ["500px", "200px"],
                    content: $("#open_test")
                });
                $scope.selRow.paper_vcode_all = randCode();
            }
        }
    };

    $scope.getRand = function () {
        return randCode();
    };

    function randCode() {
        var vCode = "";
        for (var i = 0; i < 6; i++) {
            vCode += Math.floor(Math.random() * 10);
        }
        return vCode;
    }

    $scope.escValue = function () {
        $scope.selRow.paper_vcode_all = "";
        layer.closeAll();
    };

    $scope.sendValue = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                ids.push($scope.tableControl.data[item.index].id)
            }
        });
        services._deploy_paper({paperIds: ids, paper_vcode: $scope.selRow.paper_vcode_all}).success(function (res) {
            if (res.code == 0) {
                layer.msg("发布成功");
                layer.closeAll();
                $scope.reload();
            } else {
                layer.msg(res.message);
            }
        });
    };

    //分数判断
    $scope.show_socre = function(i){
        $scope.selRow.paper_pass = i.replace(/\D/g,'');
    }

    $scope._form_submit = function () {

        if (!$scope.selRow.paper_title) {
            layer.msg('请填写试卷标题');
            return false;
        }
        if (!$scope.selRow.paper_pass || $scope.selRow.paper_pass==0) {
            layer.msg('请填写及格分数');
            return false;
        }
        if (!$scope.selRow.paper_start) {
            layer.msg('请选择考试开始时间');
            return false;
        }
        if (!$scope.selRow.paper_end) {
            layer.msg('请选择考试结束时间');
            return false;
        }
        if ($scope.selRow.paper_end.replace(/\-/g,'/') <= $scope.selRow.paper_start.replace(/\-/g,'/')) {
            layer.msg('考试结束时间必须大于开始时间');
            return !1;
        }
        if ($scope.selRow.paper_end.substring(0, 10) != $scope.selRow.paper_start.substring(0, 10)) {
            layer.msg('考试日期必须在同一天');
            return !1;
        }
        //判断考试开始时间与当前时间对比
        if(Date.parse(new Date(($scope.selRow.paper_start+":00").replace(/\-/g,'/')))<Date.parse(new Date(moment().format('YYYY-MM-DD HH:mm:ss').replace(/\-/g,'/')))){
            layer.msg("考试开始时间必须大于当前时间")
        }else{
            $scope.selRow.paper_start = $scope.selRow.paper_start + ":00";
            $scope.selRow.paper_end = $scope.selRow.paper_end + ":00";
            services._deploy_paperid($scope.selRow).success(function (res) {
                if (res.code == 0) {
                    $rootScope.formClose();
                    layer.msg(res.message);
                    $scope.reload();
                }
            });
        }
    };
    //获取时长
    $scope.getPaperDuration = function () {
        if ($scope.selRow.paper_end && $scope.selRow.paper_start) {
            var tt = Date.parse(new Date($scope.selRow.paper_end.replace(/\-/g,'/'))) - Date.parse(new Date($scope.selRow.paper_start.replace(/\-/g,'/')))
            $scope.selRow.paper_duration = tt / 1000 / 60
        }
    };
    //撤销发布
    $scope.revoke = function () {
        var ids = new Array();
        var ids_all = new Array();
        var ids_Published = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if(item.select){
                ids_all.push($scope.tableControl.data[item.index].id);
            }
            if (item.select && $scope.tableControl.data[item.index].status == 2) {
                ids_Published.push($scope.tableControl.data[item.index].id);
                var low_time = parseInt(Date.parse(new Date(($scope.tableControl.data[item.index].paper_start+":00").replace(/\-/g,'/')))-parseInt(Date.parse(new Date(moment().format('YYYY-MM-DD HH:mm:ss').replace(/\-/g,'/')))));
                if(low_time >0){
                    ids.push($scope.tableControl.data[item.index].id);
                }
            }
        });
        if(ids_all.length>0){
            if(ids_all.length>ids_Published.length || ids_Published.length==0){
                layer.msg("选择的试卷里包含未发布或考试结束的试卷，请重新选择！");
            }else{
                if(ids_Published.length!=ids.length || ids.length==0){
                    layer.msg("选择的试卷里包含考试已开始的试卷，不能撤销！");
                }else{
                    services._revoke_test({ids: ids}).success(function (res) {
                        if (res.code == 0) {
                            layer.closeAll();
                            layer.msg(res.message);
                            $scope.reload();
                        }
                    });
                }
            }

        }else{
            layer.msg("请选择要撤销发布的试卷！");
        }
    }

    $scope.selgraData = [];
    $scope.selspecialtyData = [];
    $scope.categoryData = [];
    $scope.event = function(){
        // services._dic_list({
        //     pageNum: 1,
        //     pageSize: 1000,
        //     dic_code: '10000'
        // }).success(function (res) {
        //     $scope.selgraData = res.data.rows;
        // })
        //
        // services._dic_list({
        //     pageNum: 1,
        //     pageSize: 1000,
        //     dic_code: '20000'
        // }).success(function (res) {
        //     $scope.selspecialtyData = res.data.rows;
        // })

        //试卷类别
        services._dic_list({
            pageNum: 1,
            pageSize: 1000,
            dic_parentcode: 70000
        }).success(function (res) {
            $scope.categoryData = res.data;
        })
    };
    $scope.event();
});