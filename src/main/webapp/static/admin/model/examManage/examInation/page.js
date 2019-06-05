myApp.controller('examInationController', function ($rootScope, $scope, services, $sce, $stateParams) {


    //考试接口
    services["_get_Exampapers"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/V2getList', param, "POST");
    };
    //删除考试
    services["_del_papers"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/v2delpaper', param, "POST");
    };
    //考试发布
    services["_pub_papers"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/paperRelease', param, "POST");
    };
    //考试撤销发布
    services["_put_papers"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/paperRevoke', param, "POST");
    };
    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pageNum: 1,
                pageSize: 10,
                searchText:null,//搜索文本
                paper_level:null,//试卷难易度
                paper_curriculum:null,//课程id
                paper_type:null //考试类型
            },
            columns: [
                {field: 'paper_title', title: "试卷标题",align:'left'},
                {field: 'subject_count', title: "考试时间"},
                {field: 'paper_addr', title: "考试地点", align:'left'},
                {field: 'paper_vcode', title: "验证码", align:'left'},
                {field: 'personList', title: "考试总人数",formatter: function (value, row, index) {}},
                {field: 'action', title: "及格人数",formatter: function (value, row, index) {}},
                {field: 'status', title: "考试状态",formatter: function (value, row, index) {}},
                {field: 'action', title: "操作",formatter: function (value, row, index) {}}
            ]
        },
        reload: function (param) {
            services._get_Exampapers(param).success(function (res) {
                $scope.tableControl.loadData(res.data);
            })
        }
    };
//时间戳
    $scope.Time = function (now_start,now_duration){
        var Data = new Date(parseInt(Date.parse(new Date(now_start.replace(/\-/g,'/'))))+parseInt(now_duration)*60*1000)
        var year=Data.getFullYear();
        var month=Data.getMonth()+1;
        var date=Data.getDate();
        var hour=Data.getHours()<10 ? '0'+Data.getHours() :Data.getHours();
        var minute=Data.getMinutes()<10 ? '0'+Data.getMinutes() :Data.getMinutes();
        var second=Data.getSeconds()<10 ? '0'+Data.getSeconds() :Data.getSeconds();
        return year+"-"+month+"-"+date+" "+hour+":"+minute;
    };

    //试卷状态
    $scope.paper_status = ["未发布","待考试","考试中","考试结束"];
    //发布试卷
    $scope.pub_list = function(data){
        console.log(data);
        services._pub_papers({id:data.id,status:data.status}).success(function (res) {
            if(res.code==0){
                layer.msg(res.message);
                //重新加载

            }else{
                layer.msg(res.message);
            }
        });
    };
    //撤销考试
    $scope.put_list = function(data){
        console.log(data);
        services._put_papers({id:data.id,status:data.status}).success(function (res) {
            if(res.code==0){
                layer.msg(res.message);
                //重新加载

            }else{
                layer.msg(res.message);
            }
        });
    };
    //删除考试
    $scope.del_list = function(data){
        console.log(data);
        layer.confirm('删除后将无法找回,确认删除吗？', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            services._del_papers({id:data.id}).success(function (res) {
                if(res.code==0){
                    layer.msg(res.message);
                    //重新加载试卷

                }else{
                    layer.msg(res.message);
                }
            })
        })
    };
    //修改试卷
    $scope.rev_list = function(data){
        //把本试卷信息存储
        if(data.status==1){


        }else{
            layer.msg("考试只有未发布状态下才可以修改")
        }
    };
    //跳转 查看考试情况
    $scope.pre_lis = function(data){
        $state.go("myExamResult",{id:data});
    };
    //跳转 查看统计分析
    $scope.ana_list = function(data){
        $state.go("myExamAnalysis",{id:data});
    }

});
