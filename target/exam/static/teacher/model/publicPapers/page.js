myApp.controller('publicPapersController', function ($rootScope, $scope, services, $sce,$state,$stateParams) {
    //获取我的试卷 接口
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/pbankList', param, "POST");
    };
    //删除试卷
    services["_del_testList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/delPbank', param, "POST");
    };
    //试卷设置
    services["_update_testList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/updateInfoPbank', param, "POST");
    };
    //协助者 接口
    services["_assistantList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/assistantList', param, "POST");
    };
    $scope.param={
        pageNum: 1,
        pageSize: 10,
        paper_level:null,
        paper_type:null,
        searchText:null
    };

    //返回课程名
    // $scope.retu_currm = function(data){
    //     var now = data.split(",").map(function(data){
    //         return +data
    //     });
    //     return now;
    // };

    //返回试卷类型
    $scope.retu_type = function(data){
        var This_name = null;
        angular.forEach($rootScope.paperDataTypes,function(item,index){
            if(data==item.id){
                This_name = item.dic_name;

            }
        });
        return This_name;
    };
    //试卷列表
    $scope.all_load = function(){
        $scope.exampsLis = [];
        $scope.loadding=layer.load(1,{success: function(layero){
            var cle=parseInt(layero.css('left'));
            layero.css("left",cle)
        }
        });
        services._sub_list($scope.param).success(function (res) {
            if(res.code==0){
                console.log(res);
                var data = res.data;
                $scope.exampsList = data.rows;
                layer.close($scope.loadding);
                $scope.loadding=false;
                $scope.subjectList = res.data.rows;
                $scope.param.total = res.data.total;
                $scope.param.pages = res.data.pages;
                console.log($rootScope.paperLevelTypes);

                laypage.render({
                    elem: "pager",
                    count:$scope.param.total,
                    curr: $scope.param.pageNum || 1,
                    limit: $scope.param.pageSize
                    ,jump: function (resPager) {
                        if (resPager.curr != $scope.param.pageNum) {
                            $scope.param.pageNum = parseInt(resPager.curr);
                            $scope.all_load();
                        }
                    }
                });
            }
        })
    };
    $scope.all_load();

    $scope.teachers = null;
    $scope.update_param = {};
    //加载协助者
    services._assistantList().success(function (res) {
        if(res.code==0){
            $scope.teachers = res.data;
        }else{
            layer.msg(res.message);
        }
    });

    //添加协助者
    $scope.addTeacher = function (item) {
        item.select = !item.select;
    };
    //搜索 试题
    $scope.reload =function(){
        // $scope.all_param.searchText = $scope.param.searchText;
        // $scope.all_param.pageNum = 1;
        $scope.all_load();
    };
    //重组试卷
    $scope.rePaper = function (data) {
        if(data.is_template==1 ){
            $state.go("examPaper",{id:data.id,source:data.source,template:data.template});
        }else{
            $state.go("examPaper",{id:data.id,source:data.source});
        }
    };

    // //试卷类型
    // $scope.$watch('paperDataTypes', function (data) {
    //     if(data){
    //         $scope.now_paperDataTypes = angular.copy(data)
    //     }
    // },true);
    // $scope.select_type = function (item) {
    //     item.select = !item.select;
    // };
    // //试卷难易度
    // $scope.$watch('paperLevelTypes', function (data) {
    //     if(data){
    //         $scope.now_paperLevelTypes = angular.copy(data)
    //     }
    // },true);
    // $scope.select_level = function (item) {
    //     item.select = !item.select;
    // };
    //设置试卷
    $scope.setPaper = function (data) {
        //清空一次
        $scope.update_param = {};
        //打开弹出层
        $scope.export = layer.open({
            type: 1,
            title: "试卷设置",
            area: ["700px", "580px"],
            content: $("#paper_config")
        });
        var now_data = angular.copy(data);
        console.log(data);
        //试卷id
        $scope.update_param.id = now_data.id;
        //试卷标题
        $scope.update_param.paper_title = now_data.paper_title;
        //试卷副标题
        $scope.update_param.paper_subtitle = now_data.paper_subtitle;
        //试卷总分
        $scope.update_param.paper_full = now_data.paper_full;
        //考试时长
        $scope.update_param.paper_duration = now_data.paper_duration;

        //试卷类型
        $scope.now_paperDataTypes = angular.copy($rootScope.paperDataTypes);
        angular.forEach($scope.now_paperDataTypes,function(item,index){
            if(data.paper_type==item.id){
                $scope.update_param.paper_type = item.id;
                $scope.update_param.paper_type_name = item.dic_name;
            }
        });
        //试卷难易度
        $scope.now_paperLevelTypes = angular.copy($rootScope.paperLevelTypes);
        angular.forEach($scope.now_paperLevelTypes,function(item,index){
            if(data.paper_level==item.id){
                $scope.update_param.paper_level_name = item.dic_name;
                $scope.update_param.paper_level = item.id;
            }
        });
        //可见性
        $scope.update_param.is_open = now_data.is_open;
        //试卷解析
        $scope.update_param.paper_explain = now_data.paper_explain;
        //及格分数
        $scope.update_param.paper_pass = now_data.paper_pass;
        //试卷配置
        $scope.update_param.configure = now_data.configure;
        //试卷配置
        $scope.update_param.fragment = now_data.fragment;

        //判断协助者
        if($scope.update_param.assistant){
            $scope.update_param.assistant = now_data.assistant.split(",").map(function(data){
                return +data
            });

            console.log($scope.update_param.assistant);
            angular.forEach($scope.teachers,function(item,index){
                if($scope.update_param.assistant.indexOf(item.user_id)!=-1){
                    if(!item.select){
                        $scope.addTeacher(item);
                    }
                }
            });
        }


        // $scope.update_param ={
        //     id:data.id,//试卷id
        //     paper_title:data.paper_title,//试卷标题
        //     paper_subtitle:data.paper_subtitle,//试卷副标题
        //     paper_full:data.paper_full,//试卷总分
        //     paper_duration:data.paper_duration,//考试时长
        //     paper_type:data.paper_type,//试卷类型
        //     paper_level:data.paper_level,//试卷难易度
        //     paper_explain:data.paper_explain,//试卷解析
        //     paper_pass:data.paper_pass,//及格分数
        //     configure:data.configure,//试卷配置
        //     fragment:data.fragment,//试卷片段
        //     assistant:asseient//协助者
        // }
    };
    $scope.subPaper = [{id:0,name:'私有',bool:true},{id:1,name:'公开',bool:true}];
    $scope.select_bank = function(data){
        angular.forEach($scope.subPaper,function(item,index){
            if(!data.check){
                item.check = false;
                data.bool = false;
            }else{
                item.check = true;
                data.bool = true;
            }
        })
    }
    //试卷保存
    $scope.savePaper = function(){
        console.log($scope.update_param);
        services._update_testList($scope.update_param).success(function (res) {
            if(res.code==0){
                layer.msg(res.message);
                layer.close($scope.export);
                $scope.reload();
            }else{
                layer.msg(res.message);
            }

        })

    }

    //删除试卷
    $scope.delPaper = function (data) {
        layer.confirm('删除试卷后将无法找回,确认删除吗？', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            services._del_testList({id:data.id}).success(function (res) {
                if(res.code==0){
                    layer.msg(res.message);
                    //刷新页面
                    $scope.reload();
                }else{
                    layer.msg(res.message)
                }
            })
        })
    };
    //下载试卷
    $scope.downPaper = function (id){
        var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + '/admin/pbank/downPBank?id=' + id + '"></iframe>');
        $("#publicPapers").append(iframe);
    }
    setTimeout(function(){
        This_form.render();
    },50)

});

