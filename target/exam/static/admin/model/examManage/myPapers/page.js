var row_update;
myApp.controller('myPapersController', function ($rootScope, $scope, services, $sce, $stateParams, $state){
    $scope.services = services;
    //列表
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/schoolPbank', param, "POST");
    };
    //删除试卷
    services["_del_testList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/delPbank', param, "POST");
    };

    $scope.selgraData = [];
    $scope.selspecialtyData = [];
    $scope.categoryData = [];
    $scope.curriculumData = null;
    //试卷-难易度
    $rootScope.paperLevelTypes = null;
    $scope.event = function(){

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

    //试卷难易度
    $scope.getPaperLevelTypes = function () {
        services._eMDictionary({
            dic_code: '100000',
            pageNum: 1,
            pageSize: 100
        }).success(function (res) {
            //console.log('试卷难易度')
            $scope.paperLevelTypes = res.data.rows;
        })
    }
    $scope.getPaperLevelTypes();

    //课程
    $scope.curriculum_param = function() {
        services._dic_list({
            dic_parentcode: '30000',
            pageNum: 1,
            pageSize: 1000
        }).success(function (res) {
            $scope.curriculumData = res.data;
        })
    };
    $scope.curriculum_param();

    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                total: 0,
                pageNum: 1,
                searchText: null,
                token:$rootScope.token
            },
            columns: [
                {field: 'paper_title', title: "标题"},
                {field: 'paper_curriculum', title: "课程",formatter:function(value,row){
                    var paper_curriculum_name = ''
                    angular.forEach($scope.curriculumData,function(item){
                        if(row.paper_curriculum == item.id){
                            paper_curriculum_name = item.dic_name;
                        }
                    })
                    return paper_curriculum_name
                } },
                {field: 'paper_type_name', title: "类型",formatter:function(value,row){
                    var paper_type_name = ''
                    angular.forEach($scope.categoryData,function(item){
                        if(row.paper_type == item.id){
                            paper_type_name = item.dic_name
                        }
                    })
                    return  paper_type_name
                }},
                {field: 'paper_duration', title: "时长"},
                {field: 'paper_full', title: "总分"},
                {field: 'paper_level', title: "难度",formatter:function(value,row){
                    var paper_level_name = '';
                    angular.forEach($scope.paperLevelTypes,function(item){
                        if(row.paper_level == item.id){
                            paper_level_name = item.dic_name
                        }
                    })
                    return paper_level_name;
                }},
                {field: 'creator_name', title: "创建人"},
                {field: 'id', title: "操作",
                    formatter: function (value, row, index) {
                        // console.log(row);
                        var preview_paper = '<a href="'+row.paper_url+'" onclick="preview_paper(\''+row.id+'\')" target="_blank">预览</a>';
                        if(row.is_template!=null){
                            var update_paper = '<a href="javascript:;" onclick="update_Paper1(\''+row.id+'\',\''+row.source+'\',\''+row.is_template+'\')" target="_blank">修改</a>';
                        }else{
                            var update_paper = '<a href="javascript:;" onclick="update_Paper2(\''+row.id+'\',\''+row.source+'\')" target="_blank">修改</a>';
                        }

                        var del_paper = '<a href="javascript:;" onclick="del_Paper(\''+row.id+'\')" target="_blank">删除</a>';

                        return preview_paper+'&nbsp;&nbsp;'+update_paper+'&nbsp;&nbsp;'+del_paper;
                    }
                }
            ]
        },
        reload: function (param) {
            services._sub_list(param).success(function (res) {
                console.log(4);
                $scope.tableControl.loadData(res.data);
            })
        }
    };



    //试卷修改
        //模板组卷来的试卷
    update_Paper1 = function(id,source,is_template){
        window.open('/teacher#/examPaper?source='+source+'&id='+id+'&template='+is_template);
    };
        //非模板组卷来的试卷
    update_Paper2 = function(id,source){
        window.open('/teacher#/examPaper?source='+source+'&id='+id);
    };

    //试卷删除
    del_Paper = function(id){
        layer.confirm('删除试卷后将无法找回,确认删除吗？', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            services._del_testList({id:id}).success(function (res) {
                if(res.code==0){
                    layer.msg(res.message);
                    //刷新页面
                    $scope.reload();
                }else{
                    layer.msg(res.message)
                }
            })
        })

    }

    $scope.selRow = {};
    //页面操作内容
    $scope.param = {
        searchText: null
    };
    //重新查询
    $scope.reload = function () {
        $scope.tableControl.config.param["searchText"] = $scope.param.searchText;
        $scope.tableControl.config.param["paper_type"] = $scope.param.paper_type;
        $scope.tableControl.config.param["paper_curriculum"] = $scope.param.paper_curriculum;
        $scope.tableControl.config.param["paper_level"] = $scope.param.paper_level;
        $scope.tableControl.config.param["pageNum"] = 1;
        $scope.tableControl.reload($scope.tableControl.config.param);
    };
    $scope.Dreload = function () {
        $scope.param.paper_type=null;$scope.param.paper_type_name=null;
        $scope.param.paper_curriculum=null;$scope.param.paper_curriculum_name=null;
        $scope.param.paper_level=null;$scope.param.paper_level_name=null;
        $scope.param.searchText=null
        $scope.reload();
    };

    //新建考试
    $scope.creat_exam = function(){
        window.open('/teacher#/new_Exampaper');
    }

    //智能组卷
    $scope.creat_paper = function(num,event){
        var event = event || window.event;
        $(".layui-form-checkbox").eq(num).addClass("layui-form-checked").siblings().removeClass("layui-form-checked");
        if(num==0){
            window.open('/teacher#/examTemplate');
        }else{
            window.open('/teacher#/examKnowledge');
        }
    }



});