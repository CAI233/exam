var row_update;
myApp.controller('paperRankController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    $scope.services = services;

    //排名
    services["_rank_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/ranking', param, "POST");
    };
    $scope.param = {
        searchText:null
    };
    //查询
    $scope._chaData = function(){
        $scope.search_text = $scope.param.searchText;
        $scope.all_person();
    }
    //清空
    $scope._DechaData = function(){
        $scope.search_text =  null;
        $scope.param.searchText = null;
        $scope.all_person();
    }
    $scope.all_person = function(){
        services._rank_list({person_name:$scope.search_text,id:$stateParams.id}).success(function (res) {
            if(res.code==0) {
                $scope.sub_ranking = res.data;
                var str = "";
                setTimeout(function(){
                    angular.forEach($scope.sub_ranking,function(item,index){
                        var This = index+1;
                        str +=  '<tr>'+
                            '<td>'+ This+'</td>'+
                            '<td>'+item.user_real_name+'</td>'+
                            '<td>'+item.fraction+'</td>'+
                            '<td><a href="#/personScores/'+item.person_id+'&'+$stateParams.id+'" target="_blank">试卷查看</a></td>'+
                            '</tr>'
                            // &nbsp;&nbsp;&nbsp;<a href="#" target="_blank">试卷分析</a>
                        $("#show").html(str);
                    })
                },200)
            }
        })
    }
    $scope.all_person();

    //返回
    $scope.backPage = function () {
        $state.go("papersResult");
    };

})
