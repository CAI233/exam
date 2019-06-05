myApp.controller('staAnalysisController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    //学校学生课程考试比例
    services["_school_stuCurrum"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/schoolCurriculumStatistics', param, "POST");
    };
    //学校学生难易度掌握比例
    services["_school_stuLevel"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/schoolLevelStatistics', param, "POST");
    };

    //学校统计分析
    services["_school_analisis"] = function (param) {
        return $rootScope.serverAction(ctxPath + 'admin/statistics/structStatistics', param, "POST");
    };

    //声明默认对象
    $scope.param = {};

    //得到学校课程考试比例
    $scope.currum_load = function(){
        services._school_stuCurrum().success(function (res) {
            if(res.code==0){
                console.log(res);
                if(res.data){
                    $scope.all_stuCurrum = res.data;
                    console.log(res);
                    $scope.currum_all = [];
                    for(var i in $scope.all_stuCurrum){

                        var This_show = $scope.all_stuCurrum[i];
                        if(This_show!=0){
                            if(i==1) {
                                $scope.currum_all.push({ value:This_show,name:'语文'});
                                continue;
                            }
                            if(i==2){
                                $scope.currum_all.push({ value:This_show,name:'数学'});
                                continue;

                            }
                            if(i==3){
                                $scope.currum_all.push({ value:This_show,name:'英语'});
                                continue;
                            }
                            if(i==4) {
                                $scope.currum_all.push({ value:This_show,name:'综合'});
                                continue;
                            }
                        }
                    }

                    $scope.load1();
                }else{
                    $scope.currum_all = [
                        {value:0,name:"语文"},
                        {value:0,name:"数学"},
                        {value:0,name:"英语"},
                        {value:0,name:"综合"}];
                    $scope.load1();
                    layer.msg("当前图表数据为默认值，或为最近没有考试")
                }
            }
        });
    }



    //通过课程ID得到学校学生难易度的数据
    $scope.level_load = function(data){
        // console.log(data);
        services._school_stuLevel({curriculum:data.id}).success(function (res) {
            if(res.code==0){
                if(res.data && res.data.length>0){
                    $scope.all_stuLevel = res.data;
                    $scope.level_all = [];
                    $scope.level_all_cont = [] ;
                    $scope.level_all_true = [];
                    angular.forEach($scope.all_stuLevel,function(item){
                        $scope.level_all.push(item.dic_name);
                        $scope.level_all_cont.push(item.total_count);
                        $scope.level_all_true.push(item.right_count);
                    })
                    $scope.load2();
                }else{
                    $scope.level_all = ['基础题', '中等题', '较难题'];
                    $scope.level_all_cont = [0, 0, 0];
                    $scope.level_all_true = [0, 0, 0];
                    $scope.load2();
                    layer.msg("当前图表数据为默认值，或为最近没有考试")
                }
            }
        })
    };
    //加载知识点

    $scope.pub_load = function(data){
        // console.log(data);
        $rootScope.show_leve_tf = false;
        $scope.param.struct_curriculum = data.id;
        services._school_analisis($scope.param).success(function (res) {
            if(res.code==0){
                $scope.now_knowledges = res.data;
            }
        })
    }

    //默认选择课程
    $scope.init = function(){
        $scope.param.struct_curriculum = $rootScope.curriculums[0].id;
        $scope.pub_load($rootScope.curriculums[0]);
        // $scope.pub_load();

        $scope.currum_load();
        $scope.param.currum_id = $rootScope.curriculums[0].id;
        $scope.level_load($scope.param.currum_id);

    };

    $scope.init();

    var color = ["#FF7372", "#FFCE55", "#66D99E", "#32B8F5", "#FF9900"];

    $scope.load1 = function () {
        console.log($scope.currum_all)
        var myChart1 = echarts.init(document.getElementById('mage_left'));
        var option1 = {
            title: {
                text: '近期课程考试比例',
                textStyle: {
                    fontSize: 17,
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                }
            },
            color: color,
            legend: {
                orient: 'vertical',
                x: 'left',
                y: '35px'
            },
            series: [
                {
                    type: 'pie',
                    center: ['50%', '50%'],
                    radius: ['25%', '35%'],
                    label: {
                        normal: {
                            formatter: '{b|{b}}  {per|{c}} 次',
                            borderWidth: 1,
                            borderRadius: 4,
                            padding: [0, 5],
                            rich: {
                                b: {
                                    fontSize: 14,
                                    color: '#999'
                                },
                                per: {
                                    fontSize: 20,
                                    fontFamily: "Comic Sans MS"
                                }
                            }
                        }
                    },
                    data: $scope.currum_all
                }
            ]
        };
        myChart1.setOption(option1);
    }

    $scope.load2 = function () {
        var myChart2 = echarts.init(document.getElementById('mage_right'));
        var option2 = {
            title: {
                text: '学生难易度掌握比例',
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
                            label: {show: true, textStyle: {color: '#999'},position:'top'}
                        }
                    },
                    barWidth: 50,
                    data: $scope.level_all_cont
                },
                {
                    name: '正确数',
                    type: 'bar',
                    xAxisIndex: 1,
                    barWidth: 50,
                    itemStyle: {normal: {color: '#67D99E', label: {show: true}}},
                    data: $scope.level_all_true
                }
            ]
        };
        myChart2.setOption(option2);
    }


});

