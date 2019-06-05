myApp.controller('SeepaperController', function ($rootScope, $scope, services, $sce, $stateParams) {

    //试卷信息
    services["_see_paper"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/test_Preview', param, "POST");
    };

    $scope.now_paper={};
    $scope.now_marks = {}
    $scope.ch_list = null;
    services._see_paper({id:$stateParams.id}).success(function (res) {
        if (res.code == 0) {
            $scope.papers_message = res.data;
            $scope.result_message = res.data.subjectList.sort($rootScope._by("subject_type"));
            $scope.all_nums = 0;
            angular.forEach($scope.result_message, function (items,indexs) {
                $scope.all_nums++;
                items['my_index'] = $scope.all_nums;
            })
            angular.forEach($scope.result_message, function (item, index) {

                $scope.now_paper[item.subject_type] = [];
                $scope.now_marks[item.subject_type] = 0;
                angular.forEach($scope.result_message, function (value, indexs) {
                    if (item.subject_type == value.subject_type) {
                        $scope.now_paper[item.subject_type].push(value);
                        $scope.now_marks[item.subject_type] += value.detail_marks;
                    }
                })
            })
        }
    })

});

