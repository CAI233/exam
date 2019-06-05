myApp.controller('exampsController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    //列表
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/homePaperList', param, "POST");
    };
    //试卷收藏
    services["_add_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/paperCollection', param, "POST");
    };
    //取消收藏
    services["_del_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/delPaperCollection', param, "POST");
    };


    $scope.all_param = {
        pages: 0,
        total: 0,
        pageSize: 10,
        pageNum: 1,
        searchText: $stateParams.s,
        paper_curriculum: null,
        paper_type: null,
        paper_level: null
    };
    $scope.param = {
        searchText: $stateParams.s
    };

    //返回课程名
    $scope.retu_currm = function(data){
        var now = data.split(",").map(function(data){
            return +data
        });
        return now;
    };

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
    //搜索
    $scope.reload =function(){
        $scope.all_param.searchText = $scope.param.searchText;
        $scope.all_param.pageNum = 1;
        $scope.all_load();
    };

    $scope.exampsList = [];
    $scope.all_load = function () {
        services._sub_list($scope.all_param).success(function (res) {
            if (res.code == 0) {
                $scope.exampsList = res.data.rows;
                $scope.all_param.total = res.data.total;
                $scope.all_param.pages = res.data.pages;
                laypage.render({
                    elem: "pager",
                    count: $scope.all_param.total,
                    curr: $scope.all_param.pageNum || 1,
                    limit: $scope.all_param.pageSize,
                    jump: function (resPager) {
                        if (resPager.curr != $scope.all_param.pageNum) {
                            $scope.all_param.pageNum = parseInt(resPager.curr);
                            $scope.all_load();
                        }
                    }
                });
            }
        })
    };

    //试卷收藏
    $scope.add_paper = function(data){
        var show_check = layer.load(1);
        if(data.is_keep!=1){
            data.check = true;

            services._add_list({id:data.id}).success(function (res) {
                if(res.code==0){
                    layer.close(show_check);
                    layer.msg(res.message);
                    $scope.all_load();
                }else{
                    layer.close(show_check);
                    layer.msg(res.message);
                }
            });
        }else{
            data.check = false;
            services._del_list({id:data.id}).success(function (res) {
                if(res.code==0){
                    layer.close(show_check);
                    layer.msg(res.message);
                    $scope.all_load();
                }else{
                    layer.close(show_check);
                    layer.msg(res.message);
                }
            });
        }
    };

    //试卷预览
    $scope.lookPaper = function (item) {
        window.open(item.paper_url)
    }

    //加载
    $scope.all_load();
    //下载
    $scope.exampsDown = function (id) {
        var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + '/admin/pbank/downPBank?id=' + id + '"></iframe>');
        $("#examps").append(iframe);
    }
});

