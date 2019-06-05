myApp.controller('gradeAnalisisController', function ($rootScope, $scope, services, $sce, $stateParams,$state) {

    //考试列表
    services["_get_gradePapers"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/gradePaper', param, "POST");
    }
    $scope.now_param = {};
    //得到所有的年级
    services._eMDictionary({pageNum: 1,pageSize: 1000,dic_code: '10000'}).success(function (res) {
        if(res.code==0){
            console.log(res);
            $scope.now_grade = res.data.rows;

            //默认选择
            $scope.now_param.check_id = $scope.now_grade[0].id;
            $scope.show_papers($scope.now_grade[0])
        }
    })
    
    $scope.show_papers = function(data){
        services._get_gradePapers({ grade: data.id}).success(function (res) {
            if(res.code==0){
                $scope.now_papers = res.data.sort($rootScope.rev_by("paper_start"));
            }
        })
    }

    $scope.go_analisis = function(data){
        localStorage.setItem("now_Paperfull",JSON.stringify(data.paper_full));
        localStorage.setItem("now_Paperpass",JSON.stringify(data.paper_pass));
        $state.go("examAnalisis",{exam_id:data.id,id:$scope.now_param.check_id,status:2});
    }
});

