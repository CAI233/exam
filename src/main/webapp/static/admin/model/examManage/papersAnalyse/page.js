var row_update;
myApp.controller('papersAnalyseController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    $scope.services = services;
    //列表
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/getPageList1', param, "POST");
    };
    services["_all_papers"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/theOverallAnalysis', param, "POST");
    };

    //试卷信息
    services["_see_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/test_Preview', param, "POST");
    };
    //答题分析
    services["_answer_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/answerQuestions', param, "POST");
    };
    //试卷总体分析
    services["_allpages_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/subjectiveAndObjective', param, "POST");
    };

    $scope.selRow = {};

    $scope.all_param={
        pages: 1,
        pageSize: 10,
        total: 0,
        pageNum: 1,
        searchText: null,
        bank_id: $stateParams.id
    }
    // $scope.now_papers = []
    services._sub_list($scope.all_param).success(function (res) {
        if(res.code==0){
            $scope.bankDataList = res.data.rows;
            if( res.data.rows && $scope.bankDataList.length!=0){
                $scope.selRow.paper_title = $scope.bankDataList[0].paper_title;
                $scope.check($scope.bankDataList[0].id,0);

            }else{
                $(".del_sum").show();
            }
        }
    })

    $scope.check = function(id,i){
        $scope.bankDataList[i].person_total=0 ? 1:$scope.bankDataList[i].person_total;

        $scope.selRow.person_total = $scope.bankDataList[i].person_total;
        $scope.selRow.person_fact = $scope.bankDataList[i].person_fact;
        $scope.selRow.paper_full = $scope.bankDataList[i].paper_full;
        $scope.all_tips = [];

        services._allpages_list({id:id}).success(function (res) {
            // console.log(res);
            if(res.code==0){
                //主观
                $scope.subjective = {scores:0, nums:0};
                //客观
                $scope.objective = {scores:0, nums:0};
                angular.forEach(res.data,function(key,value){
                    $scope.scores = 0;
                    if(key.length!=0){
                        angular.forEach(key,function(item,index){
                            $scope.scores += parseInt(item.subject_marks);
                        })
                    }
                    if(value=="客观"){
                        $scope.objective.nums = key.length;
                        $scope.objective.scores = $scope.scores;
                    }else{
                        $scope.subjective.nums = key.length;
                        $scope.subjective.scores = $scope.scores;
                    }
                })
            }
        })
        services._answer_list({id:id}).success(function (res) {
            // console.log(res);
            if(res.code==0){
                $scope.res_data = res.data.sort($rootScope._by("subject_type"));
                // $scope.res_data = res.data;
                // $scope.res_data = $scope.res_data.sort($rootScope._by("subject_type"));
                angular.forEach($scope.res_data,function(item,index){

                    // if(item.subject_type !=6){
                    //     $scope.all_tips.push(item);
                    // }else{
                    //     var child_tips = item.subjectList;
                    //     // var child_tips = item.subjectList.sort($rootScope._by("subject_type"))
                    //     angular.forEach(child_tips,function(itema,indexa){
                    //         $scope.all_tips.push(itema);
                    //     })
                    // }
                })
                $scope.know_all = [];
                $scope.true_nums = [];
                $scope.false_nums = [];
                angular.forEach($scope.res_data,function(item,index){
                    if(item.papertestList.length != 0){
                        var true_nums = 0;
                        angular.forEach(item.papertestList,function(itemb,index){
                            if(itemb.submit_result!=""){
                                true_nums ++;
                            }
                        })
                        item['true_nums'] = true_nums;
                    }else{
                        item['true_nums'] = 0;
                    }
                    $scope.know_all.push(index+1);
                    $scope.true_nums.push(item.true_nums);
                    $scope.false_nums.push($scope.selRow.person_total-item.true_nums)
                })
                $scope.two_load();
                $(".content_main").css("opacity",1);
            }
        })

        services._see_list({id:id}).success(function (res) {
            if (res.code == 0) {
                $scope.sum_childs = res.data.subjectList.sort($rootScope._by("subject_type"));
                console.log($scope.sum_childs);
                $scope.level_list={};
                $scope.sum_ch = {};
                $scope.all_sums = 0;
                $scope.all_marks = 0;
                angular.forEach($scope.sum_childs,function(items,indexs){
                    $scope.all_sums = indexs+1;
                    $scope.all_marks += items.detail_marks;
                    $scope.level_list[parseInt(items.subject_level.substring(0,1))] = [];
                    $scope.sum_ch[items.subject_type] = {
                        nums:0,
                        scores:0
                    };
                    angular.forEach($scope.sum_childs,function(item,index){
                        if(items.subject_type==item.subject_type){
                            $scope.sum_ch[items.subject_type].nums ++;
                            $scope.sum_ch[items.subject_type].scores += item.detail_marks;
                        }
                        if(parseInt(item.subject_level.substring(0,1))==parseInt(items.subject_level.substring(0,1))){
                            $scope.level_list[parseInt(items.subject_level.substring(0,1))].push(item);
                        }
                    })

                })
                $scope.data = [];
                console.log($scope.level_list);
                angular.forEach($scope.level_list,function(key,value){
                    $scope.data.push({
                        value:key.length,
                        name:['简单','偏难','较难'][value-1]
                    })
                })

                $scope.one_load();
            }
        })



    }
    
    $scope.one_load =function(){
        var myChart = echarts.init(document.getElementById('main'));
        var option = {
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                y:'top',
                data: ['简单','偏难','较难']
            },
            series : [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius : '40%',
                    center: ['50%', '40%'],
                    data:$scope.data,
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

    $scope.two_load = function(){
        var myCharts = echarts.init(document.getElementById('mains'));
        var options = {
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                data:['正确','错误'],
                y:'5%',
            },
            toolbox: {
                show : true,
            },
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    // data : ['充要条件','集合的概念','集合之间的关系','集合之间的运算','不等式的基本性质','一元二次不等式的解法','含有绝对值不等式的解法','一次函数','二次函数','函数的概念','对数','对数函数'],
                    data:$scope.know_all,
                    // axisLabel:{
                    //     interval:0,
                    //     rotate:45,//倾斜度 -90 至 90 默认为0
                    //     margin:2,
                    //     textStyle:{
                    //         fontWeight:"bolder",
                    //         color:"#000000",
                    //     }
                    // },
                }
            ],
            grid: { // 控制图的大小，调整下面这些值就可以，
                x: 40,
                x2: 100,
                y2: 150,// y2可以控制 X轴跟Zoom控件之间的间隔，避免以为倾斜后造成 label重叠到zoom上
            },
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    name:'正确',
                    type:'bar',
                    // data:[33, 35, 36, 24, 35, 33, 36, 33, 35, 32, 30, 29],
                    data:$scope.true_nums,
                    markPoint : {
                        data : [
                            {type : 'max', name: '正确'},
                            {type : 'min', name: '错误'}
                        ]
                    },
                },
                {
                    name:'错误',
                    type:'bar',
                    data:$scope.false_nums
                    // data:[7, 5, 4, 16, 5, 7, 4, 7, 5, 8, 10, 11],
                }
            ]
        };

        myCharts.setOption(options);
    }




})
