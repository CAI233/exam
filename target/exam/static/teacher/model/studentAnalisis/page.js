myApp.controller('studentAnalisisController', function ($rootScope, $scope, services, $sce,$state, $stateParams) {
    $scope.services = services;
    $scope.exam_id = $stateParams.exam_id;
    $scope.stu_id = $stateParams.id;
    $scope.stu_score = $stateParams.score;
    $scope.status = $stateParams.status;
    $scope.id = $stateParams.ana_id;
        //当前学生的名字
    $scope.now_stu = JSON.parse(localStorage.getItem("now_stu_name"));
        //当前考试的总分
    $scope.now_total = JSON.parse(localStorage.getItem("now_total_socer"));
        //当前考试所包含的课程
    $scope.now_exam_currum = JSON.parse(localStorage.getItem("now_exam_currum"));
    //学生个人题型准确率
    services["_person_type"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/studentTypeStatistics', param, "POST");
    };
    //学生个人难易度准确率
    services["_person_level"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/studentLevelStatistics', param, "POST");
    };

    //学生个人统计分析
    services["_person_analisis"] = function (param) {
        return $rootScope.serverAction(ctxPath + 'admin/statistics/structStatistics', param, "POST");
    };
    
    //得到当前学生题型的准确率
    services._person_type({paper_id:$scope.exam_id,person_studentid:$scope.stu_id}).success(function (res) {
        if(res.code==0){
            $scope.all_type = res.data;
            console.log($scope.all_type);
            if($scope.all_type && $scope.all_type.length>0){
                $scope.type_all = [];
                $scope.type_all_cont = [] ;
                $scope.type_all_true = [];
                angular.forEach($scope.all_type,function(item){
                    $scope.type_all.push('︵'+$rootScope._get_curriculum_name(item.c_curriculum)+'︶'+item.dic_name);
                    $scope.type_all_cont.push(item.total_count);
                    $scope.type_all_true.push(item.right_count);
                });
                $scope.load1();
            }else{
                $scope.type_all = ['初始题型', '初始题型', '初始题型','初始题型'];
                $scope.type_all_cont = [0, 0, 0,0] ;
                $scope.type_all_true = [0, 0, 0,0];
                $scope.load1();
                layer.msg("当前图表数据为默认值，或为最近没有考试");
            }
        }else{
            layer.msg(res.message)
        }
    })
    //得到当前学生难易度的难易度
    services._person_level({paper_id:$scope.exam_id,person_studentid:$scope.stu_id}).success(function (res) {
        if(res.code==0){
            // console.log(res);
            $scope.all_level = res.data;
            if($scope.all_level && $scope.all_level.length>0){
                $scope.level_all = [];
                $scope.level_all_cont = [] ;
                $scope.level_all_true = [];
                angular.forEach($scope.all_level,function(item){
                    $scope.level_all.push(item.dic_name);
                    $scope.level_all_cont.push(item.total_count);
                    $scope.level_all_true.push(item.right_count);
                })
                $scope.load2();
            }else{
                $scope.level_all = ["基础题","中等题","较难题"];
                $scope.level_all_cont = [0, 0, 0] ;
                $scope.level_all_true = [0, 0, 0];
                $scope.load2();
                layer.msg("当前图表数据为默认值，或为最近没有考试")
            }
        }else{
            layer.msg(res.message)
        }
    })

    //声明默认对象
    $scope.param = {
        exam_id:$scope.exam_id,
        student_id:$scope.stu_id
    };

    //默认选择课程
    $scope.init = function(){
        $scope.pub_load($scope.now_exam_currum[0]);
    };

    //加载知识点
    $scope.pub_load = function(data){
        $scope.param.struct_curriculum = data;
        $rootScope.show_leve_tf = false;
        $rootScope.show_true_tf = false;
        services._person_analisis($scope.param).success(function (res) {
            if(res.code==0){
                $scope.now_knowledges = res.data;
            }else{
                layer.msg(res.message)
            }
        })
    };
    $scope.init();

    $scope.load1 = function(){
        var myChart1 = echarts.init(document.getElementById('mage_left'));
        var option1 = {
            title: {
                text: '试题题型掌握比例',
                textStyle: {
                    fontSize: 17,
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'line'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter:function(value){
                    return value[0].seriesName+'：'+value[0].value+'<br>'+value[1].seriesName+'：'+value[1].value;
                },

            },
            calculable: true,
            grid: {bottom:'29%'},
            xAxis: [
                {
                    type: 'category',
                    data: $scope.type_all,
                    axisLabel: {
                        interval:0,
                        formatter:function(value)
                        {
                            return value.split("").join("\n");
                        }
                    }

                },
                {
                    type: 'category',
                    axisLine: {show: false},
                    axisTick: {show: false},
                    axisLabel: {show: false},
                    splitArea: {show: false},
                    splitLine: {show: false},
                    data: $scope.type_all
                }

            ],
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {formatter: '{value}'}
                }
            ],
            series: [
                {
                    name: '总题数',
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: '#EAF0F0',
                            label: {show: true, textStyle: {color: '#999'}, position: 'top'}
                        },
                        emphasis:{color:'#EAF0F0'},
                    },
                    barWidth: 25,
                    data: $scope.type_all_cont
                },
                {
                    name: '正确数',
                    type: 'bar',
                    xAxisIndex: 1,
                    barWidth: 25,
                    itemStyle: {
                        normal: {
                            color: '#67D99E',

                            label: {show: true}
                        },
                        emphasis:{color:'#67D99E'},
                    },
                    data: $scope.type_all_true
                }
            ]
        };

        myChart1.setOption(option1);

    }

    $scope.load2 = function(){
        var myChart2 = echarts.init(document.getElementById('mage_right'));
        var option2 = {
            title: {
                text: '试题难易度掌握比例',
                textStyle: {
                    fontSize: 17,
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                }
            },
            tooltip: {
                trigger: 'axis'
            },
            calculable: true,
            grid: {y: 70, y2: 30, x2: 20},
            xAxis: [
                {
                    type: 'category',
                    data: $scope.level_all
                },
                {
                    type: 'category',
                    axisLine: {show: false},
                    axisTick: {show: false},
                    axisLabel: {show: false},
                    splitArea: {show: false},
                    splitLine: {show: false},
                    data: $scope.level_all
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {formatter: '{value}'}
                }
            ],
            series: [
                {
                    name: '总题数',
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            color: '#EAF0F0',
                            label: {show: true, textStyle: {color: '#999'}, position: 'top'}
                        },
                        emphasis:{color:'#EAF0F0'},
                    },
                    barWidth: 50,
                    data: $scope.level_all_cont
                },
                {
                    name: '正确数',
                    type: 'bar',
                    xAxisIndex: 1,
                    barWidth: 50,
                    itemStyle: {
                        normal: {
                            color: '#67D99E', label: {show: true}
                        },
                        emphasis:{color:'#67D99E'},
                    },
                    data: $scope.level_all_true
                }
            ]
        };
        myChart2.setOption(option2);
    }

    //返回
    $scope.goBack = function(){
        $state.go("examAnalisis",{exam_id:$stateParams.exam_id,status:$scope.status,id:$scope.id});
    }
});

