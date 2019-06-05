var row_update;
myApp.controller('analyseController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    $scope.services = services;
    //列表
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/examinationResult', param, "POST");
    };

    //分类树
    services["_dic_tree"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/getDicTree', param, "POST");
    }

    services["_theTest_Analysis"] = function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/papers/theTestAnalysis', param, "POST");
    }

    //试卷信息
    services["_see_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/test_Preview', param, "POST");
    };

    $scope.selRow = {};

    $scope.all_param={
            pages: 1,
            pageSize: 10,
            total: 0,
            pageNum: 1,
            searchText: null,
            bank_id: $stateParams.id
    },

    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                total: 0,
                pageNum: 1,
                searchText: null,
                bank_id: $stateParams.id
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
                        var config = '<a onclick="check(\''+row.id+'\')">查看</a>';
                        return config ;
                    }
                }
            ]
        },
        reload: function (param) {
            services._sub_list(param).success(function (res) {
                $scope.tableControl.loadData(res.data);
            })
        }
    };

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

    $scope.all_knows = [];
    $scope.all_list = []
    $scope.all_nums = {}
    $scope.socers = 0;
    check = function(id){
        $scope.all_pages = [];
        services._see_list({id:id}).success(function (res) {
            if(res.code==0){
                $scope.order = res.data.subjectList.sort($rootScope._by("subject_type"));
                // angular.forEach($scope.order,function(items,indexs){
                //
                //     if(items.subjectList!=null){
                //         var child_item = items.subjectList.sort($rootScope._by("subject_type"));
                //         angular.forEach(child_item,function(item,index){
                //             $scope.all_pages.push(item);
                //         })
                //     }else{
                //         $scope.all_pages.push(items)
                //     }
                // })
            }

            $scope.all_nums = {};
            $scope.all_list = [];
            $scope.all_knows = [];
            $scope.socers = 0;
            angular.forEach($scope.order,function(item,indexs){
                $scope.socers += item.detail_marks;
                $scope.all_nums[item.know_nameName] = {};
                $scope.all_nums[item.know_nameName].all_ids = '';
                $scope.all_nums[item.know_nameName].all_marks = 0;
                angular.forEach($scope.order,function(value,index){
                    if(item.know_nameName === value.know_nameName){
                        $scope.all_nums[item.know_nameName].all_ids += index+1+'、';
                        $scope.all_nums[item.know_nameName].all_marks += value.detail_marks;
                    }
                })
            })
            angular.forEach($scope.all_nums,function(key,value,index){
                $scope.all_knows.push(value);
                $scope.all_list.push({
                    value:key.all_marks,
                    name:value
                })
            })


            $scope.layer_export = layer.open({
                type: 1,
                title: "",
                area: ["1000px", "600px"],
                content: $("#pages_tu")
            });
            $scope.load();

        })


    }





    $scope.load =function(){
        var myChart = echarts.init(document.getElementById('main'));
        var option = {
            title : {
                text: '知识点分布饼状图',
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            // legend: {
            //     orient: 'vertical',
            //     x: 'left',
            //     y:'top',
            //     // data: ['韩剧女','大地飞歌','天丰购销部','语文','数学']
            //     data: $scope.all_knows
            // },
            series : [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius : '40%',
                    center: ['50%', '50%'],
                    // data:[
                    //     {value:335, name:'韩剧女'},
                    //     {value:310, name:'大地飞歌'},
                    //     {value:234, name:'天丰购销部'},
                    //     {value:135, name:'语文'},
                    //     {value:1548, name:'数学'}
                    // ],
                    data:$scope.all_list,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 20,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        myChart.setOption(option);
    }



})
