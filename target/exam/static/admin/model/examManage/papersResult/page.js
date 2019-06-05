var row_update;
myApp.controller('papersResultController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    $scope.services = services;
    
    //列表
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/examinationResult', param, "POST");
    };
    

    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                total: 0,
                pageNum: 1,
                status:3,
                id: $stateParams.id
            },
            columns: [
                {field: 'paper_title', title: "试卷名称"},
                {
                    field: 'paper_specialty', title: "专业",
                    formatter: function (value, row, index) {
                        // var value = "电子商务";
                        return row.paper_specialtyName;
                    }
                },
                {field: 'paper_grade', title: "年级", formatter: function (value, row, index) {
                    // var value = "一年级"
                    return row.paper_gradeName ;
                }},
                {field: 'person_total', title: "应考人数",formatter: function (value, row, index) {
                    // var value = 40
                    return row.person_total ;
                }
                },
                {field: 'person_fact', title: "实际考试人数",formatter: function (value, row, index) {
                    // var value = 30
                    return row.person_fact ;
                }
                },
                {field: 'person_low', title: "未参考人数",
                    formatter: function (value, row, index) {
                        // var value = 10
                        return row.person_total-row.person_fact ;

                    }
                },
                {field: 'passing_number', title: "及格人数",
                    formatter: function (value, row, index) {
                        // var value = 25
                        return !value ? "0":value ;
                        // return !value ? "0":value;
                    }
                },
                {field: 'id', title: "操作",
                    formatter: function (value, row, index) {
                        var config = '<a onclick="showRanking(\''+row.id+'\')">查看排名</a>';
                            return config ;
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

    $scope.param = {
        searchText: null
    };

    //查询
    $scope.reload = function () {
        $scope.tableControl.config.param["searchText"] = $scope.param.searchText;
        $scope.tableControl.config.param["pageNum"] = 1;
        $scope.tableControl.reload($scope.tableControl.config.param);
    };
    //清除查询
    $scope.Dreload = function () {
        $scope.param.searchText=null
        $scope.reload();
    };

    //查看排名
    $scope.sub_ranking = null;
    $scope.papers_id = null;
    showRanking =function(id){

        $state.go("paperRank",{id:id})
        // $scope.papers_id = id;
        // services._rank_list({id:id}).success(function (res) {
        //     if(res.code==0){
        //         $scope.sub_ranking = res.data;
        //         console.log(res);
        //
        //         $scope.layer_export = layer.open({
        //             type: 1,
        //             title: "",
        //             area: ["900px", "650px"],
        //             content: $("#rank_show")
        //         });
        //         var str = "";
        //         setTimeout(function(){
        //             angular.forEach($scope.sub_ranking,function(item,index){
        //                 str +=  '<tr>'+
        //                     '<td>'+index+1+'</td>'+
        //                     '<td>'+item.user_real_name+'</td>'+
        //                     '<td>'+item.fraction+'</td>'+
        //                     '<td><a href="#/personScores/'+item.person_id+'&'+$scope.papers_id+'" target="_blank">查看</a></td>'+
        //                     '</tr>'
        //                 $("#show").html(str);
        //             })
        //         },200)
        //
        //
        //         // $rootScope.formOpen();
        //     }
        // })
    }
    


})
