var row_update;
myApp.controller('paperSettingController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {

    $scope.isUse=$stateParams.isUse;
    $scope.status=$stateParams.status;
    $scope.services = services;
    //改动 代码

    //获取试卷id
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/getPaperInfo', param, "POST");
    }
    //删除
    services["_del_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/delPaperdetail', param, "POST");
    }

    //综合题列表
    services["_zall_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/zongheInformation', param, "POST");
    }

    //新增，修改
    services["_add_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/saveSubject', param, "POST");
    }

    //试题详情
    services["_sub_detail"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getDetail', param, "POST");
    }

    //子题
    services["_sub_detstail"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/reviseStatus', param, "POST");
    }

    //试卷保存
    services["_generate_exam"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/savePaper1', param, "POST");
    }


    $scope.param={paper_id: $stateParams.id,isUse:$scope.isUse};
    $scope.reload = function(){
        $scope.resd = "";
        $scope.subject_list = [];
        $scope.totalScore = 0;
        $scope.last_tips = []
        services._sub_list($scope.param).success(function(res){
            if(res.code==0){
                var nums = 0;
                $scope.resd = res.data.paper_subjects;
                angular.forEach($scope.resd,function(item,index){
                    for(var k in item){
                        if(item[k].subject_type==6){
                            $scope.last_tips.push({
                                id:item[k].id,
                                nums:item[k].subjectList.length
                            })
                        }
                        nums++;
                        item[k]['my_index'] = nums;
                        $scope.totalScore += parseInt(item[k].detail_marks);
                        $scope.subject_list.push(item[k]);
                    }
                })
                $scope.resds = $scope.resd;
                console.log($scope.resds);
                $scope.subjectList = $scope.subject_list;
            }else {
                layer.msg(res.message);
            }
        })
    }

    $scope.reload();
    $scope.selRow = {};

    $scope.typeData = [
        {"id": 1, "text": "单选题"},
        {"id": 2, "text": "多选题"},
        {"id": 3, "text": "判断题"},
        {"id": 4, "text": "填空题"},
        {"id": 5, "text": "问答题"},
        {"id": 6, "text": "综合题"},
        {"id": 7, "text": "写作题"},
        ];

    $scope.levelData = [
        {id: 1, text: "简单"},
        {id: 2, text: "偏难"},
        {id: 3, text: "较难"}];

    $scope.aparam ={
            pages: 1,
            total: 0,
            pageNum: 1,
            pageSize: 10,
            searchText: null,
            subject_type:null,
            subject_level:null
    }

    $scope.now_marks = null;

    //页面操作内容
    $scope.grade_param = {pageNum: 1, pageSize: 1000, dic_code: 10000
    }
    //年级
    $scope.gradeData = null;
    services._dic_list($scope.grade_param).success(function (res) {
        $scope.gradeData = res.data.rows;
    })
    //页面操作内容
    $scope.specialty_param = {pageNum: 1, pageSize: 1000, dic_code: 20000}
    //专业
    $scope.specialtyData = null;
    services._dic_list($scope.specialty_param).success(function (res) {
        $scope.specialtyData = res.data.rows;
    })

    //课程
    $scope.curriculum_param = {pageNum: 1, pageSize: 1000, dic_code: 30000}
    $scope.curriculumData = null;
    services._dic_list($scope.curriculum_param).success(function (res) {
        $scope.curriculumData = res.data.rows;
    })


    //-------- start 修改弹出页面
    //添加选项
    $scope._addOption = function () {
        var addop = $scope.selRow.option.length + 1;
        var option_right = $scope.selRow.subject_type == 4 ? 1 : 0;
        $scope.selRow.option.push({
            "id": addop,
            "option_context": null,
            "option_right": option_right
        })
    }
    //删除选项
    $scope._delOption = function (item) {
        $scope.selRow.option.splice($scope.selRow.option.indexOf(item), 1);
    }

    //修改-删除-进入按钮操作
    $scope.optionList= [];
    $scope.opt= []
    $scope.re_false = false;
    $scope.sum = function(i,v,n){
        if(v=="upd"){//修改
            $scope._level_answer = null;
            if($scope.status==1){
                if(n==1){
                    $scope.re_false = true;
                }else{
                    $scope.re_false = false;
                }
                services._sub_detail({id:i}).success(function (res) {
                    if (res.code == 0) {
                        $scope.selRow = res.data;
                        //课程
                        $scope.selRow.subject_curriculum = res.data.subject_curriculum;
                        $scope.selRow.curriculum_name = res.data.curriculum_name;
                        //年级
                        var default_grade = res.data.subject_grade.split(',');
                        default_grade.some(function(item,index){default_grade[index] = parseInt(item)});
                        $scope.selRow.grade = default_grade;
                        //专业
                        var default_specialty = res.data.subject_specialty.split(',');
                        default_specialty.some(function(item,index){default_specialty[index] = parseInt(item)});
                        $scope.selRow.specialty = default_specialty;

                        //难易度
                        $scope.selRow.subject_level = res.data.subject_level;

                        //单选题
                        if ($scope.selRow.subject_type == 1 ) {
                            $scope._level_answer = [{id:0, answer:'A'},{id:1, answer:'B'},{id:2, answer:'C'},{id:3, answer:'D'}];
                            $scope.optionList = $scope.selRow.option
                            //遍历答案
                            angular.forEach($scope._level_answer,function(item,index){
                                if($scope.selRow.subject_answer == item.answer){
                                    item.check = true;
                                }
                            })
                            //设置题干
                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_question">题干:' + $scope.selRow.subject_question + '</span></p>'));
                            //选项
                            angular.forEach($scope.optionList, function (item, index) {
                                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;margin-left: 30px"><span class="subject_option">' + $scope._level_answer[index].answer + '.' + $scope.optionList[index].option_context + '</span></p>', true))
                            });
                            //解析
                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_analysis">解析:' + $scope.selRow.subject_analysis + '</span></p>', true));
                        }
                        //多选
                        if ($scope.selRow.subject_type == 2) {
                            $scope._level_answer = [{id:0, answer:'A'},{id:1, answer:'B'},{id:2, answer:'C'},{id:3, answer:'D'},{id:4, answer:'E'}];
                            $scope.optionList = $scope.selRow.option;
                            //遍历答案
                            angular.forEach($scope._level_answer,function(item,index){
                                if($scope.selRow.subject_answer.indexOf(item.answer)!=-1){
                                    item.check = true;
                                }
                            })
                            //设置题干
                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_question">题干:' + $scope.selRow.subject_question + '</span></p>'));
                            //选项
                            angular.forEach($scope.optionList, function (item, index) {
                                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;margin-left: 30px"><span class="subject_option">' + $scope._level_answer[index].answer + '.' + $scope.optionList[index].option_context + '</span></p>', true))
                            });
                            //解析
                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_analysis">解析:' + $scope.selRow.subject_analysis + '</span></p>', true));
                        }
                        //判断
                        if ($scope.selRow.subject_type == 3) {
                            $scope._level_answer = [{id:0, answer:'正确',decide:true},{id:1, answer:'错误',decide:false}];
                            //答案
                            angular.forEach($scope._level_answer,function(item,index){
                                if($scope.selRow.subject_answer.indexOf(item.answer)!=-1){
                                    item.check = true;
                                }
                            })
                            //设置题干
                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_question">题干:' + $scope.selRow.subject_question + '</span></p>'));
                            //解析
                            (document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_analysis">解析:' + $scope.selRow.subject_analysis + '</span></p>', true));
                        }
                        //填空 问答
                        if ($scope.selRow.subject_type == 4) {
                            $scope.optionList = []
                            $scope.optionList = $scope.selRow.option
                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_question">题干:' + $scope.selRow.subject_question + '</span></p>'));
                            angular.forEach($scope.optionList, function (item, index) {
                                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;margin-left: 30px"><span class="subject_option">'+(index+1)+',' + $scope.optionList[index].option_context + '</span></p>', true))
                            })
                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_analysis">解析:' + $scope.selRow.subject_analysis + '</span></p>', true));
                        }
                        if ($scope.selRow.subject_type == 5) {
                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_question">题干:' + $scope.selRow.subject_question + '</span></p>'));

                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;margin-left: 30px"><span class="subject_option">答案:' +$scope.selRow.subject_answer + '</span></p>', true))

                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_analysis">解析:' + $scope.selRow.subject_analysis + '</span></p>', true));
                        }
                        if ($scope.selRow.subject_type == 6) {
                            //设置题干
                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_question">题干:' + $scope.selRow.subject_question + '</span></p>'));
                        }
                        if($scope.selRow.subject_type == 7 ){

                            $scope.optionList = []
                            $scope.optionList = $scope.selRow.option
                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_question">题干:' + $scope.selRow.subject_question + '</span></p>'));
                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;margin-left: 30px"><span class="subject_answer">答案:' +$scope.selRow.subject_answer + '</span></p>', true))
                            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_analysis">解析:' + $scope.selRow.subject_analysis + '</span></p>', true));
                        }
                        $rootScope.formOpen();
                    } else {
                        layer.alert(res.message);
                    }
                })
            }else{
                layer.msg("该试卷已发布或已考试结束，不能修改")
            }
        }else if(v=="del"){//删除
            if($scope.status==1){
                layer.confirm('删除后数据无法找回,确认删除吗？', {
                        btn: ['确定', '取消'] ,//按钮
                    }, function () {
                        services._del_sub({subject_id:i,paper_id:$stateParams.id}).success(function (res) {
                            if (res.code == 0) {
                                layer.msg(res.message);
                                $scope.reload();
                            } else {
                                layer.msg(res.message);
                            }
                        })
                    }
                )
            }else{
                layer.msg("该试卷已发布或已考试结束，不能删除")
            }

        }else {//综合题进入
            $scope.zitiData = null;
            $scope.aparam.id = i;
            $scope.aparam.paper_id = $stateParams.id;
            services._zall_list($scope.aparam).success(function (res) {
                    if(res.code==0){
                        $scope.zitiData = res.data.rows;
                    // 打开层
                        $scope.exports =   layer.open({
                        type: 1,
                        title: "",
                        area: ["800px", "600px"],
                        content: $("#generateExams")
                    });
                    // 分页
                    if (res.data.pages > 1 || res.data.rows.length > 1) {
                        //处理分页
                        layui.laypage({
                            cont: "test1",
                            pages: res.data.pages,
                            curr: res.data.pageNum,
                            groups: 0,
                            first: false,
                            last: false,
                            jump: function (resPager) {
                                if (resPager.curr != res.data.pageNum) {
                                    res.data.pageNum = parseInt(resPager.curr);
                                    $scope.aparam.pageNum = res.data.pageNum;
                                    services._zall_list($scope.aparam).success(function (res) {
                                        if(res.code==0) {
                                            $scope.zitiData = res.data.rows;
                                        }else{
                                            layer.msg(res.message);
                                        }
                                    })
                                }
                            }
                        });
                    }
                    else {
                        $("#test1").empty();
                    }

                    }else {
                    layer.msg(res.message);
                }
            })
        }
    }

    $scope.all_aparam ={
        pages: 1,
        total: 0,
        pageNum: 1,

        searchText: null,
        subject_type:null,
        subject_level:null
    }

    //预览
    $scope.knowSub = function(id){
        services._sub_detail({id: id}).success(function (res) {
            if(res.code==0){
                $scope.selRow = res.data;
                console.log($scope.selRow);
                if($scope.selRow.subject_type==6){
                    $scope.all_aparam.id = id;
                    $scope.all_aparam.paper_id = $stateParams.id;
                    $scope.all_aparam.pageSize = 100;
                    services._zall_list($scope.all_aparam).success(function (res) {
                        if(res.code==0){
                            $scope.selRows = [];
                            angular.forEach(res.data.rows,function(item,index){
                                if(item.detail_status==1){
                                    $scope.selRows.push(item);
                                }
                            })
                            $scope.selRows = $scope.selRows.sort($rootScope._by("subject_type"));
                        }
                    })
                }
            }
        }
        )
        $scope.formOpen1();
    };

    //上一题
    $scope.see_add = function(id){
        var This_index = 0;
        var now_id = null;
        angular.forEach($scope.subjectList,function(item,index){
            if(item.id==id){
                This_index=index;
                now_id = $scope.subjectList[index-1].id
            }
        });
        services._sub_detail({id: now_id}).success(function (res) {
            if(res.code==0){
                $scope.selRow = res.data;
                if($scope.selRow.subject_type==6){
                    $scope.all_aparam.id = id;
                    $scope.all_aparam.paper_id = $stateParams.id;
                    $scope.all_aparam.pageSize = 100;
                    services._zall_list($scope.all_aparam).success(function (res) {
                        if(res.code==0){
                            $scope.selRows = [];
                            angular.forEach(res.data.rows,function(item,index){
                                if(item.detail_status==1){
                                    $scope.selRows.push(item);
                                }
                            })
                            $scope.selRows = $scope.selRows.sort($rootScope._by("subject_type"));
                        }
                    })
                }
            }
        })
    }
    //下一题
    $scope.see_min = function(id){
        var This_index = 0;
        var now_id = null;
        angular.forEach($scope.subjectList,function(item,index){
            if(item.id==id){
                This_index=index;
                now_id = $scope.subjectList[index+1].id
            }
        });
        services._sub_detail({id: now_id}).success(function (res) {
            if(res.code==0){
                $scope.selRow = res.data;
                if($scope.selRow.subject_type==6){
                    $scope.all_aparam.id = id;
                    $scope.all_aparam.paper_id = $stateParams.id;
                    $scope.all_aparam.pageSize = 100;
                    services._zall_list($scope.all_aparam).success(function (res) {
                        if(res.code==0){
                            $scope.selRows = [];
                            angular.forEach(res.data.rows,function(item,index){
                                if(item.detail_status==1){
                                    $scope.selRows.push(item);
                                }
                            })
                            $scope.selRows = $scope.selRows.sort($rootScope._by("subject_type"));
                        }
                    })
                }
            }
        })
    }


    $scope.formOpen1 = function () {
        $("#form_content1").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");
    }

    $scope.formClose1 = function(){
        $("#form_content1").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
        // $scope.re_reload();
    }

    //查询
    $scope._chaData = function () {
        console.log($scope.aparam);
        $scope.zitiData = null;
        services._zall_list($scope.aparam).success(function (resd) {
            if (resd.code == 0) {
                $scope.zitiData = resd.data.rows;

            }
        })
    }
    // 清除查询
    $scope._DechaData = function(){
        $scope.aparam.searchText=null,
        $scope.aparam.subject_type_name=null,
        $scope.aparam.subject_level_name=null,
        $scope.aparam.subject_type=null,
        $scope.aparam.subject_level=null,
        $scope.zitiData = null;
        services._zall_list($scope.aparam).success(function (resd) {
            if (resd.code == 0) {
                $scope.zitiData = resd.data.rows;
            }
        })
    }

    //加入与去除试题
    $scope.draw_param = {
        paper_id:$stateParams.id,
        subject_id:null,
        zongheId:null,
        detail_status:null,
        detail_marks:null
    }

    $scope.draw = function(id,index,marks){
        $scope.del_nums = 0;
        if($scope.status==1){
            $scope.draw_param.subject_id = id;
            $scope.draw_param.detail_marks = marks;
            $scope.draw_param.zongheId =  $scope.aparam.id;
            if($(".draw").eq(index).hasClass("btn-warn")){
                angular.forEach($scope.last_tips,function(item,index){
                    if(item.id==$scope.draw_param.zongheId){
                        $scope.del_nums = item.nums;
                    }
                })
                if($scope.del_nums==1){
                    $scope.last_export = layer.confirm('删除小题后本大题将会被删除,确认删除吗？', {
                            btn: ['确定', '取消'] ,//按钮
                        }, function () {
                            services._del_sub({subject_id:$scope.draw_param.zongheId,paper_id:$stateParams.id}).success(function (res) {
                            })
                            layer.close($scope.last_export);
                            layer.close($scope.exports);
                            $scope.reload();
                        }
                    )
                }else{
                    $scope.draw_param.detail_status = 2;
                    services._sub_detstail($scope.draw_param).success(function (res) {
                        $scope.reload();
                    })
                    $(".draw").eq(index).removeClass("btn-warn").addClass("btn-primary").html("加入");
                }
            }else{
                $scope.draw_param.detail_status = 1;
                services._sub_detstail($scope.draw_param).success(function (res) {
                    $scope.reload();
                })
                $(".draw").eq(index).removeClass("btn-primary").addClass("btn-warn").html("去除");
            }
        }else{
            layer.msg("该试卷已发布或已考试结束，不能操作")
        }
    }


    //按钮定位页面
    $scope.show = function(i,t){
        angular.forEach($scope.subjectList,function(value,index){
            if(value.subject_type == t){
                if(value.id==i){
                    var scoll = $("#J_QuestionList>li").eq(index).position().top;
                    console.log(scoll);
                    var oultop = index*150;
                    // var olitop = $("#J_QuestionList>li").eq(index).offset().top;
                    $("#J_QuestionList>li").eq(index).addClass("active").siblings().removeClass("active");
                    $("#paperSetting").parent().animate({scrollTop:scoll-200},500 )
                }
            }
        })

    }

    $scope.new1 = function(){
        $state.go("handworkCallPaper",{id:$stateParams.id,isUse:$scope.isUse,status:$scope.status});
    }
    $scope.new2 = function(){
        $state.go("chapterCallPaper",{id:$stateParams.id,isUse:$scope.isUse,status:$scope.status});
    }

    //分数判断
    $scope.show_socre = function(i){
        $scope.selRow.subject_marks = i.replace(/\D/g,'');
    }


    //保存
    $scope._form_submit = function (bool) {
        if (!$scope.selRow.subject_type) {
            layer.alert("请选择题型")
            return false;
        }
        if (!$scope.selRow.subject_chapter) {
            layer.msg("请选择章节")
            return false;
        }
        if (!$scope.selRow.subject_knowledge) {
            layer.msg("请选择知识点")
            return false;
        }
        if(!$scope.selRow.subject_marks || $scope.selRow.subject_marks==0){
            layer.msg("分数不能为空，不能为0")
            return false;
        }
        if (!$scope.selRow.subject_level) {
            layer.alert("请填写难易度")
            return false;
        }

        if($scope.selRow.subject_type==1 || $scope.selRow.subject_type==2 || $scope.selRow.subject_type==3){
            if(!$scope.selRow.subject_answer){
                layer.msg("请选择答案")
                return false;
            }
        }
        var context = null;
        context = document.getElementById('myIframe2').contentWindow.ue.getContent();
        $scope.selRow.opContext = []
        $scope.selRow.opContext = context
        if(bool){
            var now_id = $scope.selRow.id;
            $scope.selRow.id = null;
            services._add_sub($scope.selRow).success(function (res) {
                if (res.code == 0){
                    $scope.new_id = res.data;
                }
                var now_arry = [{
                    id:now_id,
                    is_delete:1
                },{
                    id:$scope.new_id,
                    is_delete:2
                }]
                services._generate_exam({subjectList:now_arry,id:$stateParams.id}).success(function (res) {
                    if(res.code==0){
                        $rootScope.formClose();
                        $scope.reload();
                        layer.msg('另存成功');
                    }
                })
            })
        }else{
            services._add_sub($scope.selRow).success(function (res) {
                if (res.code == 0) {
                    $rootScope.formClose();
                    $scope.reload();
                    layer.msg(res.message);
                }
                else {
                    layer.msg(res.message);
                }
            })
        }
    }

    //返回
    $scope.backPage = function () {
       $state.go("papers");
    };


    //关闭窗口
    $scope.generateExamClose = function () {
        $scope.examRow = {
            subjects: []
        };
        layer.closeAll()
    }


    //答案
    $scope.changeRight = function (data) {
        angular.forEach($scope._level_answer,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
            }
        })
    }
    $scope.selectClick = function (data) {
        $scope.answer_list = []
        angular.forEach($scope._level_answer,function(item,index){
            if (item.check) {
                $scope.answer_list.push(item.answer);
            }
        })
        $scope.selRow.subject_answer = $scope.answer_list.toString();
    }



});






