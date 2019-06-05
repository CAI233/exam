myApp.controller('recentTestController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    
    //声明默认对象
    $scope.param = {
        student_id:$stateParams.id
    };
    //学生最近考试试题题型准确率统计
    services["_get_stuType"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/studentLatelyTypeStatistics', param, "POST");
    };
    //学生最近考试试题难易度准确率统计
    services["_get_stuLevel"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/studentLatelyLevelStatistics', param, "POST");
    };
    //学生最近考试课程成绩统计
    services["_get_stuScore"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/studentLatelyCurriculumStatistics', param, "POST");
    };

    //学生个人统计分析
    services["_get_stuAnalisis"] = function (param) {
        return $rootScope.serverAction(ctxPath + 'admin/statistics/structStatistics', param, "POST");
    };


    //默认初始条件
    $scope.Type_TF = false;
    $scope.Level_TF = false;
    $scope.Score_TF = false;
    //获取选择的条件
    $scope.get_load = function(data){
        $scope.param.curriculum	 = data.id;
        $scope.param.person_studentid = $stateParams.id;
        $scope.param.frequency = 5;
        //得到最近的试题题型统计
        services._get_stuType($scope.param).success(function (res) {
            if(res.code==0){

                if(res.data && res.data.length>0){
                    $scope.Type_TF = true;
                    $scope.all_typeList = res.data;
                    $scope.type_list = [];
                    $scope.type_cont = [];
                    $scope.type_right = [];
                    angular.forEach($scope.all_typeList,function(item){
                        $scope.type_list.push(item.dic_name);
                        $scope.type_cont.push(item.total_count)
                        $scope.type_right.push(item.right_count)

                    })
                    $scope.load1();
                }else{
                    $scope.type_list = ['初始题型', '初始题型', '初始题型','初始题型'];
                    $scope.type_cont = [0, 0, 0,0];
                    $scope.type_right = [0, 0, 0,0];
                    $scope.load1();
                }
            }else{
                layer.msg(res.message);
            }

        })

        //得到最近的试题难易度统计
        services._get_stuLevel($scope.param).success(function (res) {
            if(res.code==0){
                if(res.data && res.data.length>0){
                    $scope.Level_TF = true;
                    $scope.all_levelList = res.data;
                    $scope.level_list = [];
                    $scope.level_cont = [];
                    $scope.level_right = [];
                    angular.forEach($scope.all_levelList,function(item){
                        $scope.level_list.push(item.dic_name);
                        $scope.level_cont.push(item.total_count)
                        $scope.level_right.push(item.right_count)

                    })
                    $scope.load2();
                }else{
                    $scope.level_list = ["基础题","中等题","较难题"];
                    $scope.level_cont = [0, 0, 0];
                    $scope.level_right = [0, 0, 0];
                    $scope.load2();
                }
            }else{
                layer.msg(res.message)
            }
        })
        //得到最近的考试成绩统计
        services._get_stuScore($scope.param).success(function (res) {
            if(res.code==0){
                // console.log(res);
                if( res.data.length>0 && res.data){
                    $scope.Score_TF = true;
                    $scope.all_scorelList = res.data.sort($rootScope._by("create_time"));
                    $scope.score_list = [];
                    $scope.score_time = [];
                    for(var i=0;i<$scope.all_scorelList.length;i++){

                        var This_show = $scope.all_scorelList[i];
                        $scope.score_list.push(This_show.create_time.substring(0,This_show.create_time.length-3));
                        if(This_show.range==1){
                            $scope.score_time.push({name:"极差",value:This_show.achievement})
                            continue;
                        }
                        if(This_show.difference==1){
                            $scope.score_time.push({name:"差",value:This_show.achievement})
                            continue;
                        }
                        if(This_show.good==1){
                            $scope.score_time.push({name:"良",value:This_show.achievement});
                            continue;
                        }
                        if(This_show.very_good==1){
                            $scope.score_time.push({name:"极好",value:This_show.achievement})
                            continue;
                        }
                    }

                    $scope.load3();

                }else{
                    $scope.score_list = ['2018-01-01','2018-01-01','2018-01-01','2018-01-01','2018-01-01','2018-01-01','2018-01-01'];
                    $scope.score_time = [{value:0,name:"暂无"},{value:0,name:"暂无"},{value:0,name:"暂无"},{value:0,name:"暂无"},{value:0,name:"暂无"},{value:0,name:"暂无"},{value:0,name:"暂无"}];
                    $scope.load3();

                }
            }else{
                layer.msg(res.message)
            }

        })

        setTimeout(function(){
            if($scope.Type_TF == false || $scope.Level_TF == false || $scope.Score_TF == false){
                layer.msg("当前图表数据为默认值，或为最近没有考试")
            }
        },2000)


    };


    //初始化
    $scope.init = function(){
        $scope.param.currum_id = $rootScope.curriculums[0].id;
        $scope.param.curriculum_id = $rootScope.curriculums[0].id;
        $scope.pub_load($rootScope.curriculums[0]);


        $scope.get_load($rootScope.curriculums[0])
    };

    //加载知识点
    $scope.pub_load = function(data){
        $rootScope.show_leve_tf = true;
        $scope.param.struct_curriculum = data.id;
        $scope.param.exam_num = 5;
        services._get_stuAnalisis($scope.param).success(function (res) {
            if(res.code==0){
                $scope.now_knowledges = res.data;
            }
        })
    };
    $scope.init();

    $scope.load1 = function(){
        var myChart1 = echarts.init(document.getElementById('mage_left'));

        var option1 = {
            title: {
                text: '题型准确率',
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
                    data: $scope.type_list
                },
                {
                    type: 'category',
                    axisLine: {show: false},
                    axisTick: {show: false},
                    axisLabel: {show: false},
                    splitArea: {show: false},
                    splitLine: {show: false},
                    data: $scope.type_list
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
                            label: {show: true, textStyle: {color: '#999'},position:'top'}
                        }
                    },
                    barWidth: 50,
                    data: $scope.type_cont
                },
                {
                    name: '正确数',
                    type: 'bar',
                    xAxisIndex: 1,
                    barWidth: 50,
                    itemStyle: {normal: {color: '#67D99E', label: {show: true}}},
                    data: $scope.type_right
                }
            ]
        };



        myChart1.setOption(option1);

    }

    $scope.load2 = function(){
        var myChart2 = echarts.init(document.getElementById('mage_right'));
        var option2 = {
            title: {
                text: '试题难易度准确率',
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
                    data: $scope.level_list
                },
                {
                    type: 'category',
                    axisLine: {show: false},
                    axisTick: {show: false},
                    axisLabel: {show: false},
                    splitArea: {show: false},
                    splitLine: {show: false},
                    data: $scope.level_list
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
                            label: {show: true, textStyle: {color: '#999'},position:'top'}
                        }
                    },
                    barWidth: 50,
                    data: $scope.level_cont
                },
                {
                    name: '正确数',
                    type: 'bar',
                    xAxisIndex: 1,
                    barWidth: 50,
                    itemStyle: {normal: {color: '#67D99E', label: {show: true}}},
                    data: $scope.level_right
                }
            ]
        };
        myChart2.setOption(option2);
    }

    $scope.load3 = function(){

       var myChart3 = echarts.init(document.getElementById('mage_top'));
       var option3 = {
           title : {
               text: '最近考试课程成绩',
               textStyle: {
                   fontSize: 17,
                   fontStyle: 'normal',
                   fontWeight: 'normal'
               }
           },
           tooltip : {
               trigger: 'axis'
           },
           calculable : true,
           xAxis : [
               {
                   type : 'category',
                   boundaryGap : false,
                   data : $scope.score_list
               }
           ],
           yAxis : [
               {
                   type : 'value',
                   axisLabel : {
                       formatter: '{value}'
                   }
               }
           ],
           series : [
               {
                   name:'学生成绩',
                   type:'line',
                   color:['#66D99F'],
                   label: {
                       normal: {
                           show: true,
                           position: 'top',
                           formatter:function(v){
                               return v.data.name
                           }
                       }
                   },
                   data:$scope.score_time,
                   markLine : {
                       data : [
                           {type : 'average', name: '平均值'}
                       ]
                   },
                   itemStyle : { normal: {label : {show: true}}}
               }
           ]
       };

        myChart3.setOption(option3);
    }



});

