myApp.controller('classesAnalisisController', function ($rootScope, $scope, services, $sce, $stateParams,$state) {
    $scope.services = services;

    //班级列表
    services["_get_classes"] = function (param) {
         return $rootScope.serverAction(ctxPath + '/admin/classes/getPageList', param, "POST");
    }
    //考试列表
    services["_get_classesPapers"] = function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/statistics/classPaper', param, "POST");
    }


    $scope.now_param = {};
    //得到班级的列表
    services._get_classes({ pageNum: 1,pageSize: 1000}).success(function (res) {
        if(res.code==0){
            $scope.now_classes = res.data.rows;

            //默认选择
            $scope.now_param.check_id = $scope.now_classes[0].id;
            $scope.show_papers($scope.now_classes[0]);
        }

    })

    //得到当前班级下所有试卷
    $scope.show_papers = function(data){
        services._get_classesPapers({ class_id: data.id}).success(function (res) {
            if(res.code==0){
                $scope.now_papers = res.data.sort($rootScope.rev_by("paper_start"));

            }
        })
    }

    //跳转
    $scope.go_analisis = function(data){
        localStorage.setItem("now_Paperfull",JSON.stringify(data.paper_full));
        localStorage.setItem("now_Paperpass",JSON.stringify(data.paper_pass));
        $state.go("examAnalisis",{exam_id:data.id,id:$scope.now_param.check_id,status:1});
    }

    // services._getKnowledge({
    //     struct_curriculum: $rootScope.curriculum.id
    // }).success(function (res) {
    //     $scope.now_knowledges =  res.data;
    // })
    // $scope.num = 0;

});

