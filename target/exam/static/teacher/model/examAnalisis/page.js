myApp.controller('examAnalisisController', function ($rootScope, $scope, services, $sce,$state, $stateParams) {
    $scope.services = services;
    $scope.exam_id = $stateParams.exam_id;
    $scope.status = $stateParams.status;
    $scope.id = $stateParams.id;
    var now_Paperfull = localStorage.getItem("now_Paperfull");
    var now_Paperpass = localStorage.getItem("now_Paperpass");

    //考试难易度分析
    // services["_level_analisis"] = function (param) {
    //     return $rootScope.serverAction(ctxPath + '/admin/statistics/paperLevelStatistics', param, "POST");
    // };
    //学生考试成绩统计
    services["_scores_Result"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/studentPaperScore', param, "POST");
    };
    //学生考试情况
    // services["_scores_Exam"] = function (param) {
    //     return $rootScope.serverAction(ctxPath + '/admin/statistics/studentPaperSituation', param, "POST");
    // };

    //考试详情
    services["_get_examList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/paperDetails', param, "POST");
    };
    //获取该次考试的知识点展示
    services["_get_knowledgsList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/paperStructStatistics', param, "POST");
    };

    //获取该次考试考试信息
    services["_get_examLists"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/comprehensiveStatistics', param, "POST");
    };
    //获取该次考试所带班级
    services["_get_examClass"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/joinPaperClass', param, "POST");
    };
    //获取该次考试分数分段数据
    services["_get_examScore"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/markSubsection', param, "POST");
    };
    //获取该次考试试题的知识点分布
    services["_get_examlKnowledge"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/levelKnowledges', param, "POST");
    };
    //获取该次考试试题的难易度分布
    services["_get_examlLevel"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/statistics/paperSubjectType', param, "POST");
    };

    //当前考试的基本信息
    services._get_examList({id:$scope.exam_id}).success(function (res) {
        if(res.code==0){
            $scope.papers_all = res.data;
            $scope.now_currums = $scope.retu_currm($scope.papers_all.paper_curriculum);
            //默认初始化
            $scope.pub_load($scope.now_currums[0]);
            services._get_examLists({id:$scope.exam_id,paper_pass:$scope.papers_all.paper_pass}).success(function (res) {
                if(res.code==0){
                    $scope.paper_alls = res.data[0];
                }
            });
            services._get_examClass({id:$scope.exam_id}).success(function (res) {
                if(res.code==0){
                    $scope.class_alls_name = [];
                    $scope.class_alls = [];
                    angular.forEach(res.data,function(item,index){
                        //班级名字
                        $scope.class_alls_name.push(item.class_name);
                        //班级信息
                        $scope.class_alls.push({
                            name:item.class_name,
                            id:item.c_class
                        })
                    })
                    $scope.now_classesName = $scope.class_alls_name.join(",")
                }
            });
            // console.log($scope.papers_all);
        }else{
            layer.msg(res.message);
        }
    })

    //默认对象
    $scope.show_param = {
        paper_id:$scope.exam_id,
        grade:null,
        class_id:null,
        exam_id:$scope.exam_id,
        struct_curriculum:null,
        subject_level:null
    };
    if($scope.status==1){
        $scope.show_param.class_id = $scope.id;
    }else{
        $scope.show_param.grade = $scope.id
    }

    //返回课程名
    $scope.retu_currm = function(data){
        var now = data.split(",").map(function(data){
            return +data
        });
        return now;
    };
    //知识点分布表
    $scope.pub_load = function(data){
        $scope.show_param.struct_curriculum = data;
        $rootScope.show_true_tf = true;
        services._get_knowledgsList($scope.show_param).success(function (res) {
            if(res.code==0){
                $scope.now_knowledges = res.data;
            }else{
                layer.msg(res.message)
            }
        })
    }


    //得到当前试卷的学生考试情况
    services._get_examScore({id:$scope.show_param.exam_id}).success(function (res) {
            if(res.code==0){
                if(res.data!=null || res.data!='' ){
                    $scope.stu_score = []
                    $scope.level_list = res.data;
                    $scope.get_Dload($scope.level_list,$scope.level_list.length)

                }else{
                    layer.msg("当前图表数据为默认值，或为最近没有考试");
                }
            }else{
                layer.msg(res.message);
            }
        })

    //得到当前学生的成绩
    services._scores_Result($scope.show_param).success(function (res) {
            if(res.code==0){
                if(res.data && res.data.length>0){
                    $scope.stus_result = res.data;

                    $scope.get_load($scope.stus_result,$scope.stus_result.length)
                }else{
                    layer.msg(res.message);
                }
            }
    })


    //得到当前考试难易度分布
    services._get_examlLevel({id:$scope.show_param.exam_id}).success(function (res) {
        if(res.code==0){
            $scope.all_level = res.data;
            $scope.all_levelList = [];
            $scope.all_levelName = [];
            angular.forEach($scope.all_level,function(item){
                $scope.all_levelList.push({
                    value:item.total_count,
                    name:item.dic_name,
                    id:item.c_subject_level,
                });
                $scope.all_levelName.push(item.dic_name);
            });
            //默认选择
            $scope.get_examKnowledge($scope.all_levelList[0]);
            $scope.load2();
        }else{
            layer.msg(res.message);
        }
    })

    //获取当前考试的试题的知识点分布
    $scope.all_knowledges = null;
    $scope.get_examKnowledge = function(data){
        $scope.show_param.subject_level_name = data.name;
        services._get_examlKnowledge({id:$scope.show_param.exam_id,subject_level:data.id}).success(function (res){
            if(res.code==0){
                $scope.all_knowledges = res.data;
            }else{
                layer.msg(res.message);
            }
        })
    };
    //页面知识点去点数字和小数点
    $scope.replace_now = function(data){
        var now_data = null;
        now_data = data.replace(data.replace(/[^\d\.]/g,''),'');
        return now_data;
    }

    //通过班级-----成绩
    $scope.nowClass_load = function(){
        services._scores_Result({grade:$scope.show_param.grade,class_id:$scope.show_param.now_checkClass_id,paper_id:$scope.exam_id}).success(function (res) {
            if(res.code==0){
                console.log(res)
                if(res.data && res.data.length>0){
                    $scope.stus_result = res.data;

                    $scope.get_load($scope.stus_result,$scope.stus_result.length)
                }else{
                    layer.msg(res.message);
                }
            }
        })
    }

    $scope.load1 = function(){
        var myChart1 = echarts.init(document.getElementById('mage_left'));

        var data = $scope.list_all;
        var colorList = $scope.list_color;

        data = echarts.util.map(data, function (item, index) {
            return {
                value: item,
                itemStyle: {
                    normal: {
                        color: colorList[index]
                    }
                }
            };
        });
        var num=0;
        function renderItem(params, api) {
            // num++;
            // var x2 = now_Paperfull/4*num
            // var x1 = now_Paperfull/4*(num-1)
            var yValue = api.value(2);
            var start = api.coord([api.value(0), yValue]);
            var size = api.size([api.value(1)-api.value(0), yValue]);
            var style = api.style();
            return {
                type: 'rect',
                shape: {
                    x: start[0],
                    y: start[1],
                    width: size[0],
                    height: size[1]
                },
                style: style
            };
        }

       var option1 = {
            title: {
                text: '学生考试成绩分段图',
                left: 'center'
            },
            tooltip: {
                formatter:function(v){
                  return '分数 ：'+v.value[0]+'～'+v.value[1]+'<br/>人数：'+v.value[2]
                }
            },

            xAxis:{
            } ,
            yAxis: {
                axisLabel:{
                    formatter:function(v){
                        return v+'(人)'
                    }
                }
            },
            series: [{
                type: 'custom',
                renderItem: renderItem,
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    },

                    axisLabel:{
                        formatter:function(v){
                            console.log(v);
                        }
                    },
                },
                // dimensions: ['分数', '人数'],
                encode: {
                    x: [0, 1],
                    y: 2,
                    tooltip: [0, 1,2],
                    itemName: 3,
                },

                data: data
            }]
        };


        myChart1.setOption(option1);
    };


    $scope.now_color = {'background':'#a0d468'};
    $scope.load2 = function() {
        var myChart2 = echarts.init(document.getElementById('mage_right'));
        // var colors = ['#FF7372',"#FFCE55","#67D99E"]
        var colors = ['#a0d468',"#ffce54","#fc6e51"];

        var option2 = {
            title : {
                text: '试题难易度比例',
                // subtext: '纯属虚构',
                x:'left',
                textStyle:{
                    //文字颜色
                    color:'#666666',
                    //字体风格,'normal','italic','oblique'
                    // fontStyle:'normal',
                    //字体粗细 'normal','bold','bolder','lighter',100 | 200 | 300 | 400...
                    // fontWeight:'bold',
                    //字体系列
                    fontFamily:'microsoftYaHei-serif',
                    //字体大小
                    fontSize:16
                }
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient : 'vertical',
                x : 'right',
                y:'bottom',
                data:$scope.all_levelName,
                center:['40%','50%']
            },
            color:colors,
            calculable : true,
            series : [
                {
                    name:'试题难易度比例',
                    type:'pie',
                    radius : ['50%', '70%'],
                    data:$scope.all_levelList
                }
            ]
        };
        myChart2.on('click',function(params){
            $scope.now_color = {'background':params.color};
            $scope.get_examKnowledge(params.data)
        });
        myChart2.setOption(option2);
    };

    $scope.load_param = {
        pages:1,
        total:0
    }
    //分页----学生成绩
    $scope.get_load = function(all,cunt){
            laypage.render({
                elem: 'pager'
                ,count: cunt,
                limit:50,
                curr:$scope.load_param.pages
                ,jump: function(obj){
                    //模拟渲染
                    document.getElementById('show_class').innerHTML = function(){
                        var arr = []
                            ,thisData = all.concat().splice(obj.curr*obj.limit - obj.limit, obj.limit);
                        if (obj.curr != $scope.load_param.pages) {
                            setTimeout(function(){
                                $scope.$apply(function(){
                                    $scope.load_param.pages = parseInt(obj.curr);
                                })
                            },1)
                        }
                        $scope.load_param.total = obj.count;

                        layui.each(thisData, function(index, item){
                            var This_full =  now_Paperfull;
                            var This_pass =  now_Paperpass;

                            item.score = item.score == null ? '缺考' :item.score ;
                            var This_color = null;
                                // if(item.score == '缺考'){
                                //     This_color = 'color_red';
                                // }else if(item.score <This_full*0.3){
                                //     This_color = 'color_red'
                                // }else if(item.score >=This_full*0.3 && item.score <This_full*0.6){
                                //     This_color = 'color_yel'
                                // }else if(item.score >=This_full*0.3 && item.score <This_full*0.8){
                                //     This_color = 'color_gre'
                                // }else{
                                //     This_color = 'color_sky'
                                // }
                                if(item.score == '缺考'){
                                    This_color = 'color_red';
                                }else if(item.score <This_pass){
                                    This_color = 'color_yel'
                                }else if(item.score >=This_pass && item.score <This_full){
                                    This_color = 'color_gre'
                                }else{
                                    This_color = 'color_sky'
                                }


                            if(item.score == '缺考'){
                                arr.push('<tr ><td >' + item.c_student_name + '</td>' +
                                    '<td>' + item.c_student_id + '</td>' +
                                    '<td>' +["男","女"][item.c_student_sex-1] + '</td>' +
                                    '<td class="'+This_color+'">' +item.score + '</td>' +
                                    '<td><a href="javascript:;" style="color:red;">暂无结果</a></td></tr>')
                            }else{
                                arr.push('<tr ><td >' + item.c_student_name + '</td>' +
                                    '<td>' + item.c_student_id + '</td>' +
                                    '<td>' +["男","女"][item.c_student_sex-1] + '</td>' +
                                    '<td class="'+This_color+'">' +item.score + '</td>' +
                                    '<td><a href="javascript:;" style="color:#32B8F5;"  onclick="my_result(\''+item.c_student_id+'\',\''+item.c_student_name+'\',\''+item.score+'\')">分析结果</a></td></tr>')
                            }

                        });
                        return arr.join('');
                    }();
                }
            });
    };


    //分页----成绩分段图
    $scope.Dload_param = {
        pages:1,
        total:0
    }
    $scope.get_Dload = function(all,cunt){
        laypage.render({
            elem: 'Dpager'
            ,count: cunt,
            limit:50,
            curr:$scope.Dload_param.pages
            ,jump: function(obj){
                //模拟渲染
                document.getElementById('show_Dclass').innerHTML = function(){
                    var arr = []
                        ,thisData = all.concat().splice(obj.curr*obj.limit - obj.limit, obj.limit);
                    if (obj.curr != $scope.Dload_param.pages) {
                        setTimeout(function(){
                            $scope.$apply(function(){
                                $scope.Dload_param.pages = parseInt(obj.curr);
                            })
                        },1)
                    }
                    $scope.Dload_param.total = obj.count;

                    layui.each(thisData, function(index, item){
                        arr.push('<tr ><td >' + item.mx + '</td>' +
                            '<td>' + item.num + '</td>' +
                            '<td>' + item.t_num + '</td>' +
                           '</tr>')
                    });
                    return arr.join('');
                }();
            }
        });
    };


    //考生 分析结果页面
    my_result = function(id,name,score){

        localStorage.setItem("now_stu_name",JSON.stringify(name));
        localStorage.setItem("now_total_socer",JSON.stringify($scope.papers_all.paper_full));
        localStorage.setItem("now_exam_currum",JSON.stringify($scope.now_currums));
        $state.go("studentAnalisis",{exam_id:$scope.exam_id,id:id,score:score,status:$scope.status,ana_id:$scope.id});
    }
});

