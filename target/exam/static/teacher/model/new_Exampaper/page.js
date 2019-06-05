myApp.controller('new_ExampaperController', function ($rootScope, $scope, services, $sce,$state, $stateParams) {

    //学生列表
    services["_get_students"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/classes/classList', param, "POST");
    };
    //获取试卷
    services["_get_papers"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/pbankList', param, "POST");
    };
    //新增----修改考试
    services["_new_exampaper"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/newExamination', param, "POST");
    };
    //修改考试试卷
    services["_rev_paper"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/updatePaperPbank', param, "POST");
    };

    //考试详情
    services["_get_examList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/paperDetails', param, "POST");
    };

    //提交的对象----默认
    $scope._submit = {};
    //验证码
    $scope.getRand = function () {
        return randCode();
    };

    function randCode() {
        var vCode = "";
        for (var i = 0; i < 6; i++) {
            vCode += Math.floor(Math.random() * 10);
        }
        return vCode;
    }

    $scope.param = {
            pages: 1,
            pageSize: 10,
            pageNum: 1,
            total:0
            // token:$rootScope.token
    };
    //获取自己的试卷
    services._get_papers($scope.param).success(function(res){
        if(res.code==0){
            $scope.paperData = res.data.rows;
        }
    });

    //考试类别
    $scope.paper_modeList = [{id:0,name:'笔试'},{id:1,name:'机试'}]



    //获取考试是否为新增
    $scope.revFalse = false;

    $scope.exam_classes = [];
    $scope.exam_classes_ids = [];
    //考生选择
    $scope.classes = [];
    $scope.classes_ids = [];
    $scope._submit.studentIds = [];

    $scope.$watch('paper_tf', function (bool) {
        if(bool){
            $rootScope.paper_tf = false;

            $state.go("new_Exampaper",{id:null},{reload:true});
        }
    });

    if($stateParams.id){
        services._get_examList({id:$stateParams.id}).success(function(res){
            if(res.code==0){
                console.log(res);
                //考试标题
                $scope._submit.paper_title = res.data.paper_title;
                //考试地址
                $scope._submit.paper_addr = res.data.paper_addr;
                //考试开始时间
                if(res.data.paper_start){
                    $scope._submit.paper_start = res.data.paper_start;
                }
                //考试时长
                $scope._submit.paper_duration = res.data.paper_duration;
                //考试方式
                $scope._submit.paper_mode = res.data.paper_mode;
                $scope._submit.paper_mode_name = ["笔试","机试"][res.data.paper_mode];
                //验证码
                $scope._submit.paper_vcode = res.data.paper_vcode;
                //未更换试卷的情况下 试卷id、试卷名称
                $scope._submit.pbank_id = res.data.pbank_id;
                $scope._submit.papername = res.data.pbankName;
                //该试卷下参加考试的学生
                $scope.exam_classes = res.data.personList; 
                $scope.get_load($scope.exam_classes,$scope.exam_classes.length)
                    //改试卷准备更改时的默认学生
                // $scope.classes = angular.copy(res.data.personList);
                //未更换考生的情况下 考生id集合

                angular.forEach($scope.exam_classes,function(item){
                    // $scope.classes_ids.push(item.id);
                    //对象相同 所有相同位置的学生id相同
                    $scope.exam_classes_ids.push(item.id);


                });
                //当前考试的学生ids
                // $scope._submit.studentIds = $scope.exam_classes_ids;

                //该次考试的id
                $scope._submit.id = res.data.id;

                //当前考试的状态
                $scope._submit.status = res.data.status;
                console.log($scope._submit);
            }
        });
    }

    //获取学生
    $scope.result = null;
    $scope.stu_open = function(){
        $scope.classes = angular.copy($scope.exam_classes);
        $scope.classes_ids = angular.copy($scope.exam_classes_ids);
        if($scope.result==null){
            services._get_students($scope.param).success(function (res) {
                if(res.code==0){
                    
                    $scope.result = res.data;
                    localStorage.setItem("now_class",JSON.stringify($scope.result));
                }
            })
        }else{
            var now = localStorage.getItem("now_class");
            $scope.result = JSON.parse(now);
        }
        $scope.layer_export = layer.open({
            type: 1,
            title: "",
            area: ["700px", "600px"],
            content: $("#stu_nums")
        });
    };

    //选择试卷后 下拉消失
    $scope.slow_check = function(){
        $("#new_Exampaper .layui-form-select").removeClass("layui-form-selected");
    }

    $scope.select = function(data){
        //页面显示默认选中年级
        data.selected = !data.selected;
            if(data.selected){
                if($scope.classes && $scope.classes.length>0){
                    angular.forEach(data.personList,function(items,indes){
                        angular.forEach($scope.classes,function(item,index){
                            if(item.id==items.id){
                                $scope.classes.splice(index,1);
                                $scope.classes_ids.splice(index,1);
                            }
                        })
                    })
                }
                angular.forEach(data.personList,function(items,indexs){
                    items['class_name'] = data.class_name;
                    items.selected = data.selected;
                    $scope.classes.push(items);
                    $scope.classes_ids.push(items.id)
                })
            }else{
                angular.forEach(data.personList,function(items,indexs){
                    items.selected = data.selected;
                    angular.forEach($scope.classes,function(item,index){
                        if(item.id==items.id){
                            $scope.classes.splice(index,1);
                            $scope.classes_ids.splice(index,1);
                        }
                    })
                })
            }
    };

    //未保存前的操作------删除学生
    $scope.del_class = function(data,index){

        $scope.class_export = layer.confirm('是否移除学生？', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            $scope.$apply(function () {
                $scope.classes.splice(index,1);
                $scope.classes_ids.splice(index,1);
            })

            layer.close($scope.class_export);
        })

    };

    //选择学生 保存
    $scope.save_class = function(){

        $scope.exam_classes = angular.copy($scope.classes);
        $scope.exam_classes_ids = angular.copy($scope.classes_ids);
        $scope.get_load($scope.exam_classes,$scope.exam_classes.length)
        layer.close($scope.layer_export);
    };


    //保存后的学生操作-----删除学生
    del_Examclass = function(data,index){
        $scope.exam_export = layer.confirm('是否移除学生？', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            $scope.$apply(function () {
                $scope.exam_classes.splice(index, 1);
                $scope.exam_classes_ids.splice(index, 1);
                $scope.get_load($scope.exam_classes,$scope.exam_classes.length)
            })

            layer.close($scope.exam_export);
        })
    };
    $scope.now_pages = 1;
    //调用分页
    $scope.get_load = function(all,cunt){
        laypage.render({
            elem: 'pager'
            ,count: cunt,
            curr:$scope.now_pages
            ,jump: function(obj){
                //模拟渲染
                document.getElementById('show_class').innerHTML = function(){

                    var arr = []
                        ,thisData = all.concat().splice(obj.curr*obj.limit - obj.limit, obj.limit);
                    if (obj.curr != $scope.now_pages) {
                        setTimeout(function(){
                            $scope.$apply(function(){
                                $scope.now_pages = parseInt(obj.curr);
                            })
                        },1)
                    }
                    $scope.all_count = obj.count;

                    // console.log(obj.limit);//默认每页10个
                    // console.log(obj.curr);//默认翻页数
                    // console.log(obj.count);//总数
                    layui.each(thisData, function(index, item){
                        arr.push('<tr><td >' + item.person_name + '</td>' +
                            '<td>' + item.person_spell + '</td>' +
                            '<td>' + item.person_studentid + '</td>' +
                            '<td>' +item.class_name + '</td>' +
                            '<td>' +["男","女"][item.person_sex-1] + '</td>' +
                            '<td>' +item.person_email + '</td>' +
                            '<td>' +item.person_phone + '</td>' +
                            '<td><a href="javascript:;" onclick="del_Examclass(\''+item+'\',\''+index+'\')">删除</a></td></tr>')
                    });
                    return arr.join('');
                }();
            }
        });
    };

    //分数判断
    $scope.show_socre = function(i){
        $scope._submit.paper_duration = i.replace(/\D/g,'');
    }



    //保存考试
    $scope.new_Exam = function(){
        $scope._submit.studentIds = $scope.exam_classes_ids;
        if($scope._submit.paper_start && $scope._submit.paper_duration){
            var now_start = parseInt(Date.parse(new Date(($scope._submit.paper_start).replace(/\-/g,'/'))));
            var now_duration = parseInt($scope._submit.paper_duration)*60*1000;

            function Time(now){
                var Data = new Date(now);
                var year=Data.getFullYear();
                var month=Data.getMonth()+1;
                var date=Data.getDate();
                var hour=Data.getHours()<10 ? '0'+Data.getHours() :Data.getHours();
                var minute=Data.getMinutes()<10 ? '0'+Data.getMinutes() :Data.getMinutes();
                var second=Data.getSeconds()<10 ? '0'+Data.getSeconds() :Data.getSeconds();
                return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
            }
            var now_end = Time(now_start+now_duration);
            $scope._submit.paper_end = now_end;
        }
        if(!$scope._submit.pbank_id){
                layer.msg("请选择试卷");
                return false;
        }
        if(!$scope._submit.paper_title){
            layer.msg("请填写考试标题");
            return false;
        }
        if(!$scope._submit.paper_addr){
            layer.msg("请填写考试地址");
            return false;
        }
        if(!$scope._submit.paper_start){
            layer.msg("请填写考试开始时间");
            return false;
        }
        if(!$scope._submit.paper_duration){
            layer.msg("请填写考试时长");
            return false;
        }
        if(!$scope._submit.paper_mode_name){
            layer.msg("请选择考试方式");
            return false;
        }
        // if(!$scope._submit.paper_vcode){
        //     layer.msg("请生成验证码");
        //     return false;
        // }
        if(!$scope._submit.studentIds || $scope._submit.studentIds.length==0){
            layer.msg("请选择参考学生");
            return false;
        }

        $rootScope.loadingStart();
        services._new_exampaper($scope._submit).success(function (res) {

            if (res.code == 0) {
                
                layer.msg(res.message);
                $state.go('myExamManage');

            } else {
                layer.msg(res.message);
                // $rootScope.loadingEnd();
                layer.close($rootScope.loading);
                $rootScope.loading = null;
            }
        })

    };
    
});

