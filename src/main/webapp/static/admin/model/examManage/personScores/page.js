var person_all =
myApp.controller('personScoresController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    $scope.services = services;
    $scope.isUse = $stateParams.isUse;
    $scope.status = $stateParams.status;
    //试卷信息
    services["_see_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/test_Preview', param, "POST");
    };

    //试卷信息
    services["_papers_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/site/papers/getPaper/', param, "POST");
    };

    //答题分析
    // services["_answer_list"] = function (param) {
    //     return $rootScope.serverAction(ctxPath + '/admin/papers/answerQuestions', param, "POST");
    // };
    // 答案
    services["_answer_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers//getPaper', param, "POST");
    };
    //根据对象里的键排序 方法
    var by = function(name){
        return function(o, p){
            var a, b;
            if (typeof o === "object" && typeof p === "object" && o && p) {
                a = o[name];
                b = p[name];
                if (a === b) {
                    return 0;
                }
                if (typeof a === typeof b) {
                    return a < b ? -1 : 1;
                }
                return typeof a < typeof b ? -1 : 1;
            }
            else {
                throw ("error");
            }
        }
    }

    $scope.categoryData = [];
    $scope.event = function(){
        //试卷类别
        services._dic_list({
            pageNum: 1,
            pageSize: 1000,
            dic_code: '70000'
        }).success(function (res) {
            $scope.categoryData = res.data.rows;
        })
    };
    $scope.event();
    $scope.submit_result = null;
    services._answer_list({id:$stateParams.paper_id,user_id:$stateParams.id}).success(function (res) {
        if(res.code==0){
            $scope.submit_result = res.data.submitResult
        }

    })

    $scope.sub_list={};
    $scope.mark_list = {}
    $scope.ch_list = null;
    $scope.all_pages = [];
    services._see_list({id:$stateParams.paper_id}).success(function (res) {
        if(res.code==0){
            $scope.papers_message = res.data;
            $scope.result_message = res.data.subjectList.sort(by("subject_type"));

            $scope.all_nums = 0;
            angular.forEach($scope.result_message, function (items,indexs) {
                $scope.all_nums++;
                items['my_index'] = $scope.all_nums;
                if(items.subjectList!=null){
                    items.subjectList.sort(by("subject_type"));
                    angular.forEach(items.subjectList,function(item,index){
                        $scope.all_pages.push(item)
                    })
                }else{
                    $scope.all_pages.push(items)
                }
            })
            // console.log($scope.all_pages);

            angular.forEach($scope.all_pages,function(items,indexs){
                angular.forEach($scope.submit_result,function(item,index){
                    if(item.subject==items.id){
                        // if(items.subject_type==2 || items.subject_type==1){
                        //     angular.forEach(items.option,function(ites,indes){
                        //         var str_id = ites.id.toString();
                        //         if(item.answer.indexOf(str_id)!=-1){
                        //             // console.log(indes);
                        //
                        //         }
                        //     })
                        //
                        //     // var answer = item.answer.split(",")
                        //     // console.log(answer);
                        // }
                        items["answer"] = item.answer
                    }
                })
            })
            // console.log($scope.result_message);
            angular.forEach($scope.result_message, function (item, index) {
                $scope.sub_list[item.subject_type] = [];
                $scope.mark_list[item.subject_type] = 0;
                angular.forEach($scope.result_message, function (value, indexs) {
                    if (item.subject_type == value.subject_type) {
                        $scope.sub_list[item.subject_type].push(value);
                        $scope.mark_list[item.subject_type] += value.detail_marks;
                    }
                })
            })
            $scope.subjectList =  $scope.sub_list ;
            // console.log($scope.subjectList)
        }


    })
})




