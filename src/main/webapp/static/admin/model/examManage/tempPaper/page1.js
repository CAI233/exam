var row_update, analyze, showSee;
myApp.controller('tempPaperController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {

    $scope.isUse=$stateParams.isUse;
    $scope.status=$stateParams.status;
    $scope.services = services;
    //改动 代码

    //获取试卷id
    $scope.resd = "";
    $scope.subject_list = [];
    $scope.totalScore = 0;

    //列表
    services["_sub_list"] = function (param) {
        // return $rootScope.serverAction(ctxPath + '/admin/papers/my_Test_Paper', param, "POST");
        return $rootScope.serverAction(ctxPath + '/admin/template/getPageList', param, "POST");
    };
    //删除
    services["_del_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/delPapers', param, "POST");
    };
    //试卷信息
    services["_see_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/test_Preview', param, "POST");
    };

    services["_get_paper_info"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/getPaperInfo', param, "POST");
    };
    //试题列表
    services["_Manage_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getManageList', param, "POST");
    }
    //试题列表
    services["_data_subject"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getSubjectPageList', param, "POST");
    }
    //分类树
    services["_dic_tree"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/getDicTree', param, "POST");
    }
    //题库列表
    services["_bank_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/getBankPageList', param, "POST");
    }

    //试题详情
    services["_sub_detail"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getDetail', param, "POST");
    };
    //生成试卷
    services["_generate_exam"] = function (param) {
        if (param.paper_start.length < 19) {
            param.paper_start = param.paper_start + ":00";
        }
        if (param.paper_end.length < 19) {
            param.paper_end = param.paper_end + ":00";
        }
        return $rootScope.serverAction(ctxPath + '/admin/template/templatePapers', param, "POST");
    }
    //子题列表
    services["_sublis_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/single_Item', param, "POST");
    }
    //分类树---章节
    services["_get_getChapter"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/getChapter', param, "POST");
    }
    //分类树---知识点
    services["_get_getKnowledge"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/getKnowledge', param, "POST");
    }
    //试题保存（需要传id）
    services["_save_Subject"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/templatedetail/saveTemplateDetail', param, "POST");
    }
    //设置试题
    services["_open_Subject"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/templatedetail/getByIdPageList', param, "POST");
    }
   //新增模板信息
    services["_add_template"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/template/saveTemplate', param, "POST");
    }
    //删除模板信息
    services["_del_template"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/template/delTemplate', param, "POST");
    }


    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                total: 0,
                pageNum: 1,
                searchText: null,
                bank_id: 0,//题库
            },
            columns: [
                {field: 'template_title', title: " 模板标题", align:'left'},
                {field: 'type_name', title: " 试卷类别"},
                {field: 'test_total', title: "总分"},
                {field: 'test_pass', title: "及格分数" },
                {field: 'test_long', title: "时长(分钟)"},
                {field: 'id', title: "操作",
                    formatter: function (value, row, index) {
                        return '<a onclick="showSee(\''+row.id +'\',\'' + row.template_grade +'\',\'' + row.template_specialty +'\',+\'' +row.template_curriculum+ '\')" style="margin-right: 20px">试题配置</a>';
                    },

                }

            ],
        },
        reload: function (param) {
            services._sub_list(param).success(function (res) {
                $scope.tableControl.loadData(res.data);
                
            })
        }
    };
    //重新查询
    $scope.reload = function () {
        // $scope.tableControl.config.param["grade"] = $scope.selRow.subject_grade;
        $scope.tableControl.config.param["curriculum"] = $scope.param.curriculum;
        // $scope.tableControl.config.param["specialty"] = $scope.selRow.subject_specialty;
        $scope.tableControl.config.param["paper_type"] = $scope.param.paper_type;
        $scope.tableControl.config.param["searchText"] = $scope.param.searchText;
        $scope.tableControl.reload($scope.tableControl.config.param);
    }
    //清空
    $scope.Dreload = function () {
        $scope.param.paper_type=null;$scope.param.paper_type_name=null;
        $scope.param.searchText=null
        $scope.reload();
    };
    //新增模板
    $scope.addTemplate = function () {
        $scope.template = {}
        angular.forEach($scope.gradeData,function(item,index){
            item.check = false;
        })
        angular.forEach($scope.specialtyData,function(item,index){
            item.check = false;

        })
        angular.forEach($scope.curriculumData,function(item,index){
            item.check = false;
        })
        $rootScope.formOpen();
    };
    //修改
    $scope.updateTemplate = function () {
        var ids = [];
        var id = null;
        var now_grade= [];
        var now_specialty = [];
        var now_curriculum = null;
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                ids.push($scope.tableControl.data[item.index].id);
                id = $scope.tableControl.data[item.index].id;
                $scope.template = $scope.tableControl.data[item.index];
            }
        });
        if (ids.length==0) {
            layer.alert("请选择你将要修改的数据");
            return false
        }
        if(ids.length>1){
            layer.alert("只能选择一条数据进行修改");
            return false
        }
        $rootScope.formOpen();
    };
    //生成模板提交
    $scope.templateSubmit = function () {
        if (!$scope.template.template_title) {
            layer.msg('请填写试卷标题');
            return !1;
        }
        if (!$scope.template.test_pass) {
            layer.msg('请填写及格分数');
            return !1;
        }
        if (!$scope.template.test_long) {
            layer.msg('请填写时长');
            return !1;
        }
        if (!$scope.template.test_total) {
            layer.msg('请填写试卷总分');
            return !1;
        }
        services._add_template($scope.template).success(function (res) {
            if (res.code == 0) {
                layer.msg('生成成功');
                $rootScope.formClose();
                $scope.reload();
            } else {
                layer.msg(res.message)
            }
        })
    }
    //删除模板
    $scope.delTemplate = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                ids.push($scope.tableControl.data[index].id);
            }
        });
        if(ids.length == 0){
            layer.alert("请选择你将要删除的数据");
        }  else {
            layer.confirm('删除后数据无法找回,确认删除吗？', {
                btn: ['确定', '取消'] //按钮
            }, function () {
                services._del_template({
                    ids:ids
                }).success(function (res) {
                    if (res.code == 0) {
                        layer.msg("删除成功");
                        $scope.reload();
                    }
                    else if (res.code == 1) {
                        layer.confirm(res.message, {
                            btn: ['确定', '取消']
                        }, function () {
                            services._del_template({
                                ids:ids
                            }).success(function (res) {
                                if (res.code == 0) {
                                    layer.msg("删除成功");
                                    $scope.reload();
                                } else {
                                    layer.closeAll('dialog');
                                }
                            })
                        })
                    } else {
                        layer.msg(res.message)
                    }
                })
            })
        }
    }






    //课程
    $scope.curriculumData = null;
    services._dic_list({
        pageNum: 1,
        pageSize: 1000,
        dic_parentcode: 30000
    }).success(function (res) {
        $scope.curriculumData = res.data;
        $scope.curr= $scope.curriculumData[0].id
        //默认课程
    });
    //切换课程
    $scope.changeCurr = function(data){
        angular.forEach($scope.curriculumData,function(item,index){
            if(item.id ==data.id){
                $scope.subTypeList = item.children;
            }
        })
    }
    $scope.now_marks = null;
    $scope.kepList = [];//试题篮
    //设置题目
    $scope.id = null;
    $scope.selRow = {}
    showSee = function (id,grade,specialty,curriculum) {
        $scope.template= {}
        services._open_Subject({id:id}).success(function (res) {
            console.log(res);
            $scope.selRow = res.data;
            var data = res.data;
            var templateDetailCondition = data.templateDetailCondition;
            var datiList = templateDetailCondition.datiList;

            if(datiList.length == 0){
                $scope.datiList  = [];
                $scope.dati = {};
                $scope.datiList.push($scope.dati);
            }else{
                $scope.datiList = datiList;
                console.log($scope.datiList);
                angular.forEach($scope.datiList ,function(item,index){
                    item.id = null;
                    // if(item.subject_level != '' || $scope.datiList == null ){
                    //     var level = parseInt(item.subject_level)
                    //     $('.add'+index).eq(level-1).addClass("type-active").siblings().removeClass("type-active")
                    // }else{
                    //     $('.add'+index).removeClass("type-active")
                    // }

                    //根据课程判断题型
                    var subject_curriculum = parseInt(item.subject_curriculum)
                    angular.forEach($scope.curriculumData,function(itemc,indexc){
                        if(subject_curriculum == itemc.id){
                            item.curriculum_name = itemc.dic_name
                            $scope.subTypeList = itemc.children;
                            angular.forEach($scope.subTypeList, function(itemT,indexT){
                                if(itemT.id == item.subject_type){
                                    item.subject_type_name = itemT.dic_name
                                }
                            })
                        }
                    });
                    //计算小题数量
                    $scope.subject_amount = 0;
                    angular.forEach(item.xiaotiList,function(items,indexs){
                        items.id = null;
                        items.p_id = null;
                        $scope.subject_amount++;
                        item['subject_amount'] = $scope.subject_amount;
                    })
                })
            }
        })
        $scope.id = id ;
        $rootScope.formOpen3();
        $scope.loadTree($scope.curr);
    }
    //返回
    $scope.backPage = function () {
        $state.go("papers");
    };
    //关闭窗口
    $scope.generateExamClose = function () {
        $scope.examRow = {};
        layer.closeAll()
    }
    $scope.click_index = function (index,d_index,item){
        //点击传入小题下标
        $scope.x_index = index;
        $scope.d_index = d_index;
        var xiaoti = {
            subject_knowledge:$scope.datiList[$scope.d_index].xiaotiList[$scope.x_index].subject_knowledge,
            know_name:$scope.datiList[$scope.d_index].xiaotiList[$scope.x_index].know_name,
            subject_marks:$scope.datiList[$scope.d_index].xiaotiList[$scope.x_index].subject_marks,
        }
        $scope.datiList[$scope.d_index].xiaotiList[$scope.x_index] = xiaoti
        console.log($scope.datiList)
    }
    //加载知识点
    $scope.loadTree = function (curriculum) {
        services._get_getKnowledge({struct_curriculum:curriculum}).success(function (res) {
            var data = res.data;
            $scope.param.subject_knowledge = 0;
            $scope.param.know_name = null;
            $("#selknowTree2").tree("loadData",data);
        })
    }
























    //组卷
    $scope.paper = {}
    $scope.selRow = null;
    $scope.aindex = null;



    $scope.aparam ={
        pages: 1,
        pageSize: 10,
        total: 0,
        pageNum: 1,
        searchText: null,
        subject_type:null,
        subject_level:null
    }

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
    //----------- end 修改弹出页面


    //修改-删除-进入按钮操作
    $scope.sum = function(i,v){
        if(v=="upd"){//修改
            services._sub_detail({id:i}).success(function (res) {
                if (res.code == 0) {
                    $scope.selRow = res.data;
                    $rootScope.formOpen();
                } else {
                    layer.alert(res.message);
                }
            })
        }else if(v=="del"){//删除
            layer.confirm('删除后数据无法找回,确认删除吗？', {
                    btn: ['确定', '取消'] ,//按钮
                }, function () {
                    services._del_sub({subject_id:i,paper_id:$stateParams.id}).success(function (res) {
                        if (subject_knowledgeres.code == 0) {
                            layer.msg(res.message);
                            window.location.reload();
                        } else {
                            layer.msg(res.message);
                        }
                    })
                }
            )
        }else {//综合题进入
            $scope.zitiData = null;
            $scope.aparam.id = i;
            $scope.aparam.paper_id = $stateParams.id;

            services._zall_list($scope.aparam).success(function (res) {
                console.log(res);
                if(res.code==0){
                    $scope.zitiData = res.data.rows;
                    $scope.numpages = res.data.pages;
                    // 打开层
                    layer.open({
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
    //



    //生成试卷
    $scope.generateExam = function () {
        $scope.examRow.paper_full = 0;
        $scope.examRow.subjectList = [];
        $scope.examRow.subjectList = $scope.kepList
        if ($scope.examRow.subjectList.length == 0) {
            layer.msg('您还没有选择试题');
            return false;
        }
        if ($scope.examRow.subjectList.length < $scope.paper_num) {
            layer.msg('您的试题还没选完');
            return false;
        }


        layer.open({
            type: 1,
            title: "",
            area: ["800px", "600px"],
            content: $(".generateExam")
        });

    }
    $scope.openQuestion = function (data) {
        //打开层
        $scope.layer_export = layer.open({
            type: 1,
            title: "",
            area: ["900px", "650px"],
            content: $("#editor_sub")
        });
        flag = data;
        var str = null;
        if (data == 1 && $scope.selRow.subject_question) {
            str = $scope.selRow.subject_question;
        }
        else if (data == 2 && $scope.selRow.subject_answer) {
            str = $scope.selRow.subject_answer;
        }
        else if (data == 3 && $scope.selRow.subject_analysis) {
            str = $scope.selRow.subject_analysis;
        }
        if ($scope.selRow.option) {
            angular.forEach($scope.selRow.option, function (item, index) {
                if (index + 1 == data - 3) {
                    str = item.option_context;
                }
            });
        }
        if (str) {
            setTimeout(function () {
                var m =   document.getElementById('myIframe').contentWindow.ue.setContent(str);
            }, 500)
        }
    }

    $scope.sendValue = function () {
        var a = document.getElementById('myIframe').contentWindow.ue.getContent();
        //内容截取
        if(a.substring(0,3)=="<p>"){
            a = a.slice(3);
            a = a.substring(0, a.length-4);
        }

        if (flag == 1) {
            $scope.selRow.subject_question = a;
        } else if (flag == 2) {
            $scope.selRow.subject_answer = a;
        } else if (flag == 3) {
            $scope.selRow.subject_analysis = a;
        }
        if ($scope.selRow.option) {
            angular.forEach($scope.selRow.option, function (item, index) {
                if (index + 1 == flag - 3) {
                    $scope.selRow.option[index].option_context = a;
                }
            });
        }
        layer.close($scope.layer_export);
    }
    $scope.escValue = function () {
        layer.close($scope.layer_export);
    }

    //难易程度
    $scope.levelList = [{
        id: 0,
        name: '全部'
    }, {
        id: 1,
        name: '基础题'
    }, {
        id: 2,
        name: '中等题'
    }, {
        id: 3,
        name: '较难题'
    }]

    $scope.param = {
        pageNum: 1,
        pageSize: 10,
        type:null,//题型
        subject_level: 0,//难易度
        bank_id: 0,//题库
        subject_knowledge: 0,//知识点
        subject_curriculum:0, //课程
        // subject_chapter:0,  //章节id
        searchText:'',
        // subject_specialty:0, //专业
        // subject_grade:0 ,  //年级
        subject_ids:[]
    }

    //加载
    $scope.load = function () {
        $scope.param.subject_ids = [];
        //试题列表
        angular.forEach($scope.kepList, function (item, index) {
                    $scope.param.subject_ids.push(item.id );
        })
        services._data_subject($scope.param).success(function (res) {
            if (res.code == 0) {
                $scope.countAll = res.data.total;
                if ($scope.kepList.length > 0) {
                    angular.forEach(res.data.rows, function (item, index) {
                        angular.forEach($scope.kepList, function (item2, index2) {
                            if (item2.type == item.subject_type) {
                                if ($.inArray(item.id, item2.ids) != -1) {
                                    item.select = 'del'
                                }
                            }
                        })
                    })
                }
                $scope.subjectList = res.data.rows;
                layui.laypage({
                    cont: 'pager',
                    pages: res.data.pages,
                    groups: res.data.pageSize,
                    skip: false,
                    curr: res.data.pageNum || 1,
                    jump: function (resPager) {
                        if (resPager.curr != $scope.param.pageNum) {
                            $scope.param.pageNum = parseInt(resPager.curr);
                            $scope.load();
                        }
                    }
                });
            } else {
                layer.msg(res.message);
            }
        });
    }
    $scope.selRow = {};
    // //页面操作内容
    // $scope.grade_param = {
    //     pageNum: 1,
    //     pageSize: 1000,
    //     dic_parentcode: 10000
    // }
    //年级
    // $scope.gradeData = null;
    // $scope.selgradeData = null;
    // $scope.pargradeData = null;
    // services._dic_list($scope.grade_param).success(function (res) {
    //     $scope.gradeData = res.data;
    //     $scope._gradeData = angular.copy(res.data);
    //     $scope.selgradeData = res.data;
    //     $scope.pargradeData = res.data;
    // });
    //
    // $scope.specialty_param = {
    //     pageNum: 1,
    //     pageSize: 1000,
    //     dic_parentcode: 20000
    // }
    // //专业
    // $scope.specialtyData = null;
    // $scope.selspecialtyData = null;
    // $scope.parspecialtyData = null;
    // services._dic_list($scope.specialty_param).success(function (res) {
    //     $scope.specialtyData = res.data;
    //     $scope._specialtyData = angular.copy(res.data);
    //
    //     $scope.selspecialtyData = res.data;
    //     $scope.parspecialtyData = res.data;
    // })
    $scope.categoryData = [];
    //试卷类别
    services._dic_list({
        pageNum: 1,
        pageSize: 1000,
        dic_parentcode: 70000
    }).success(function (res) {
        $scope.categoryData = res.data;
    })

    var selNode = null;

    // 组卷：章节知识点Tree
    $scope.selectSelCurr = function (data,level,knowledge,know_name,chapter,chapter_name) {
        // var grade = new Array()
        // grade = $scope.grade.split(",");
        // grade.some(function(itemb,indexb){grade[indexb] = parseInt(itemb)});  //年级字符串转数组
        //
        // var specialty = new Array()
        // specialty = $scope.specialty.split(",");
        // specialty.some(function(itemb,indexb){specialty[indexb] = parseInt(itemb)});//专业字符串转数组

        $scope.param.subject_level = level

        // services._get_getChapter({struct_curriculum:$scope.curriculum,grade:grade}).success(function (res) {
        //     var data = res.data
        //     $("#selchaTree").tree("loadData",data);
        //     $scope.param.subject_chapter = chapter;
        //     $scope.param.chapter_name = chapter_name;
        // })
        console.log(22)
        services._get_getKnowledge({struct_curriculum:$scope.curriculum}).success(function (res) {
            var data = res.data
            $("#selknowTree").tree("loadData",data);
            $scope.param.subject_knowledge = knowledge;
            $scope.param.know_name = know_name;
        })
    }
    // $scope.selectSelCurr();

    $scope.delData = function () {
        $scope.param.subject_knowledge = 0;
        $scope.param.know_name = null;
        // $scope.param.subject_chapter = 0;
        // $scope.param.chapter_name =null;
        $scope.param.subject_level =  0;
        $scope.param.searchText =null;
        $scope.load();
    }

    $("#selchaTree").tree({
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            // $scope.param.subject_chapter = node.id;
            // $scope.param.chapter_name = node.text;
            $(".layui-form-selected").removeClass("layui-form-selected")
        },
        "onClick": function (node){
            $scope.param.subject_chapter = node.id;
            $scope.param.chapter_name = node.text;
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#selchaTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#selchaTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#selchaTree").tree("getRoot");
            }
            if (selNode) {
                $("#selchaTree").tree("select", selNode.target);
            }

            //查找未分配的分类
            var unNode = $("#selchaTree").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });

    $("#selknowTree").tree({
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            // $scope.param.subject_knowledge = node.id;
            //  $scope.param.know_name = node.text;
             $(".layui-form-selected").removeClass("layui-form-selected")
        },
        "onClick": function (node){
            $scope.param.subject_knowledge = node.id;
            $scope.param.know_name = node.text;
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#selknowTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#selknowTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#selknowTree").tree("getRoot");
            }
            if (selNode) {
                $("#selknowTree").tree("select", selNode.target);
            }
            //查找未分配的分类
            var unNode = $("#selknowTree").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });
    function changeTreeStyle(treeNode) {
        if (treeNode['children'] && treeNode['children'].length > 0) {
            for (var j = 0; j < treeNode['children'].length; j++) {
                changeTreeStyle(treeNode['children'][j]);
            }
        }
        //设置属性
        treeNode["text"] = treeNode.struct_name;
        treeNode["id"] = treeNode.id;
    }

    $scope.bankDataList = [];
    $scope.papersTypeDataList = [];//试卷类型
    $scope.event = function () {
        //题库列表
        services._bank_list({
            pages: 1,
            pageSize: 50,
            pageNUm: 1,
        }).success(function (res) {
            if (res.code == 0) {
                $scope.bankDataList = res.data.rows;
                $scope.bankDataList.unshift({
                    bank_id: 0,
                    bank_title: '全部',
                })
            }
        })}
    $scope.event();

    //选题
    $scope.update = function (x,d,obj) {
        $scope.selList = {};
        $scope.select = true;
        $scope.dindex= d;
        $scope.xindex= x;
        if(!$scope.datiList[$scope.dindex].xiaotiList[$scope.xindex].subject_title || $scope.datiList[$scope.dindex].xiaotiList[$scope.xindex].subject_title =='' ){
            $scope.param.type =  $scope.datiList[$scope.dindex].subject_type;
            $scope.param.subject_curriculum = $scope.datiList[$scope.dindex].xiaotiList[$scope.xindex].curriculum
            $scope.param.subject_knowledge = parseInt(obj.subject_knowledge);
            $scope.param.know_name = obj.know_name;
            $scope.param.subject_chapter = parseInt(obj.subject_chapter);
            $scope.param.chapter_name = obj.chapter_name;
            $scope.param.subject_level = parseInt(obj.subject_level);
            $scope.selectSelCurr($scope.param.subject_curriculum,$scope.param.subject_level,$scope.param.subject_knowledge,$scope.param.know_name,$scope.param.subject_chapter,$scope.param.chapter_name);
            $scope.load()
            $('#right').animate().scrollTop(0, 0)
        } else{
            layer.msg("请先清除当前试题")
            $scope.select = false;
            return false;
        }
    }

    //随机选题
    $scope.runNum = function (i){
        var b = i;
        var num = $scope.subjectList
        var a =num[Math.floor(Math.random()*num.length)]
        $scope.addSubjectList1[b] = a;
    }

    $scope.subParam = {
        pageSize:$scope.total,
        pages: 1,
        total: 0,
        pageNum: 1,
    }

    $scope.examRow = {
        paper_title: null,
        paper_pass: null,
        paper_start: null,
        paper_end: null,
        paper_duration: null,
        paper_explain: null,
        paper_full: null,
    }

//生成试卷提交
    $scope.generateSubmit = function () {
        $scope.examRow.paper_duration =$scope.paper.test_long;
        $scope.examRow.paper_full =$scope.paper.test_total;
        $scope.examRow.paper_pass =$scope.paper.test_pass;
        $scope.examRow.template_subid = $scope.id ;
        if (!$scope.examRow.paper_title) {
            layer.msg('请填写试卷标题');
            return !1;
        }
        if (!$scope.examRow.paper_start) {
            layer.msg('请选择考试开始时间');
            return !1;
        }
        if (!$scope.examRow.paper_end) {
            layer.msg('请选择考试结束时间');
            return !1;
        }

        if (!$scope.examRow.paper_pass) {
            layer.msg('请填写及格分数');
            return !1;
        }
        var Dtime = parseInt(Date.parse(new Date($scope.examRow.paper_start+":00"))-parseInt(Date.parse(new Date(moment().format('YYYY-MM-DD HH:mm:ss')))));
        // var totaltime = parseInt(Date.parse(new Date($scope.examRow.paper_end+":00"))-parseInt(Date.parse(new Date($scope.examRow.paper_start+":00"))));
        if (Dtime<0) {
            layer.msg('考试开始时间必须大于当前时间');
            return !1;
        }
        if ($scope.examRow.paper_end <= $scope.examRow.paper_start) {
            layer.msg('考试结束时间必须大于开始时间');
            return !1;
        }
        if ($scope.examRow.paper_end.substring(0, 10) != $scope.examRow.paper_start.substring(0, 10)) {
            layer.msg('考试日期必须在同一天');
            return !1;
        }
        // if(totaltime < $scope.examRow.paper_full ){
        //     layer.msg('考试用时不能低于时长')
        //     return !1;
        // }
        // if(totaltime > $scope.examRow.paper_full ){
        //     layer.msg('考试用时不能超过时长')
        //     return !1;
        // }

        services._generate_exam($scope.examRow).success(function (res) {
            if (res.code == 0) {
                layer.closeAll();
                layer.msg('生成成功');
                $state.go('papers');
            } else {
                layer.msg(res.message)
            }
        })
    }

    // //添加/移除试题
    $scope.addKep = function (obj) {
        var subject = {
            subject_answer:obj.subject_answer,
            opContext:obj.opContext,
            option:obj.option,
            subjectList:obj.subjectList,
            subject_question:obj.subject_question,
            subject_title:obj.subject_title,
            subject_marks:$scope.datiList[$scope.dindex].xiaotiList[$scope.xindex].subject_marks,
            subject_type:$scope.datiList[$scope.dindex].xiaotiList[$scope.xindex].subject_type,
            id:obj.id,
            // subject_chapter:obj.subject_chapter,
            // chapter_name:obj.chapter_name,
            subject_knowledge:obj.subject_knowledge,
            know_name:obj.know_name,
            curriculum:$scope.datiList[$scope.dindex].xiaotiList[$scope.xindex].curriculum,
            paper_num:$scope.datiList[$scope.dindex].xiaotiList[$scope.xindex].paper_num,
            subject_level:$scope.datiList[$scope.dindex].xiaotiList[$scope.xindex].subject_level,
        }
        if ($scope.kepList.length == 0) {
            $scope.kepList = [{
                id: subject.id,
                detail_marks:subject.subject_marks,
                template_subid:$scope.datiList[$scope.dindex].xiaotiList[$scope.xindex].paper_num
            }]
            $scope.datiList[$scope.dindex].xiaotiList[$scope.xindex] =subject
            $scope.select = false;
            $scope.load();
            $scope.conut_nums++;
        } else {
                $scope.kepList.push({
                    id: subject.id,
                    detail_marks:subject.subject_marks,
                    template_subid:$scope.datiList[$scope.dindex].xiaotiList[$scope.xindex].paper_num
                })
            $scope.datiList[$scope.dindex].xiaotiList[$scope.xindex] =subject
                $scope.select = false;
            // }
            $scope.conut_nums++;
            $scope.load();
        }
    }

    //获取时长
    $scope.getPaperDuration = function () {
        if ($scope.examRow.paper_end && $scope.examRow.paper_start) {
            var tt = Date.parse(new Date($scope.examRow.paper_end)) - Date.parse(new Date($scope.examRow.paper_start))
            $scope.examRow.paper_duration = tt / 1000 / 60
        }
    }
    $scope.treeClick = function (data) {
        $scope.selRow.dic_name = [];
        angular.forEach($scope.myTree2, function (item, index) {
            if (item.check) {
                if (item != 0) {
                    $.inArray(item.dic_name,item.id, $scope.selRow.dic_name) == $scope.selRow.dic_name.push(item.dic_name)
                }
            }

        });

        $scope.selRow.dic_name = $scope.selRow.dic_name.toString();
    }

    $scope.del = function (i,d,obj) {
        $scope.select = true;
        var subject = {
            subject_answer:'',
            opContext:'',
            option:[],
            subjectList:[],
            subject_question:'',
            subject_title:'',
            subject_marks:obj.subject_marks,
            subject_type:obj.subject_type,
            id:obj.id,
            // subject_chapter:obj.subject_chapter,
            // chapter_name:obj.chapter_name,
            subject_knowledge:obj.subject_knowledge,
            know_name:obj.know_name,
            curriculum:obj.curriculum,
            paper_num:obj.paper_num,
            subject_level:obj.subject_level,
        }
        $scope.datiList[d].xiaotiList[i] =subject
                angular.forEach($scope.kepList, function (item, index) {
                    if (item.id == subject.id) {
                        $scope.kepList.splice(index, 1)
                    }
                })
                console.log($scope.kepList)

    }

    //预览
    $scope.knowSub = function(id){
        services._sub_detail({id: id}).success(function (res) {
            if(res.code==0){
                $scope.selSub = res.data;
                if($scope.selSub.subject_type==6){
                    services._sublis_list({id:id}).success(function (res) {
                        if(res.code==0){
                            $scope.selSubs = res.data.subjectList;
                        }
                    })
                }
            }
        })
        $scope.layer_export = layer.open({
            type: 1,
            title: "",
            area: ["1000px", "600px"],
            content: $("#know_subject")
        });
    }






    $scope.template = {
        template_title: null,
        template_type: null,
        test_long: null,
        test_total: null,
        test_pass: null,
        remark: null,
        template_specialty:'',
        template_grade:'',
        template_curriculum:null

    }



    //模板获取时长
    $scope.getTemDuration = function () {
        if ($scope.template.paper_end && $scope.template.paper_start) {
            var tt = Date.parse(new Date($scope.template.paper_end)) - Date.parse(new Date($scope.template.paper_start))
            $scope.template.paper_duration = tt / 1000 / 60
        }
    }


    //大题章节与知识点设置弹窗
    $scope.openContent = function (num,index,d_index) {
        $scope.num = num;
        $scope.d_index = d_index;
        $scope.param.subject_knowledge = 0;
        $scope.param.know_name = null;
        $scope.param.subject_chapter = 0;
        $scope.param.chapter_name = null;
    }

    //关闭弹窗
    $scope.closeLayer = function () {
        layer.closeAll();
    }


    $("#selchaTree2").tree({
        lines: true,
        checkbox: true,
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            $scope.param.subject_chapter = node.id;
            $scope.param.chapter_name = node.text;
            $(".layui-form-selected").removeClass("layui-form-selected")
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#selchaTree2").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#selchaTree2").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#selchaTree2").tree("getRoot");
            }
            if (selNode) {
                $("#selchaTree2").tree("select", selNode.target);
            }

            //查找未分配的分类
            var unNode = $("#selchaTree2").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });

    $("#selknowTree2").tree({
        lines: true,
        checkbox: true,
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onClick":function(node){
            var nodes = $(this).tree('getChecked');
            // if(nodes.length > 3){
            //     $("#selknowTree2").tree("uncheck",node.target)
            //     layer.msg("只能同时选择三个知识点")
            // }
            var select_check = $("#selknowTree2").tree("find", nodes.id);
            // if(select_check.checkState =="unchecked"){
            //     $("#selknowTree2").tree("check", select_check.target);
            // }else{
            //     $("#selknowTree2").tree("uncheck", select_check.target);
            // }
        },
        "onCheck": function (node) {
            var nodes = $(this).tree('getChecked');
            var str = '';
            var ids = '';
            for (var i = 0; i < nodes.length; i++) {
                if (str != '') {
                    str += ',';
                }
                str += nodes[i].text;
                if (ids != '') {
                    ids += ',';
                }
                ids += nodes[i].id;
            }
            $scope.param.know_name = str;
            $scope.param.subject_knowledge = ids;
            $scope.addContent();
            // if(nodes.length > 3){
            //     $("#selknowTree2").tree("uncheck",node.target)
            //     layer.msg("只能同时选择三个知识点")
            // }
        },

        onLoadSuccess: function (node, data) {
            var selNode = null;
            if (!selNode) {
                selNode = $("#selknowTree2").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#selknowTree2").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#selknowTree2").tree("getRoot");
            }
            if (selNode) {
                $("#selknowTree2").tree("select", selNode.target);
            }
            //查找未分配的分类
            var unNode = $("#selknowTree2").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });
    function changeTreeStyle(treeNode) {
        if (treeNode['children'] && treeNode['children'].length > 0) {
            for (var j = 0; j < treeNode['children'].length; j++) {
                //排序
                treeNode['children'].sort($rootScope._by("create_time"));
                changeTreeStyle(treeNode['children'][j]);
            }
        }
        //设置属性
        treeNode["text"] = treeNode.struct_name;
        treeNode["id"] = treeNode.id;
    }
    //年级
    // $scope.selectGra = function(data){
    //     $scope.all_grade_id = [];
    //     var str = '';
    //     angular.forEach($scope.gradeData,function(item,index){
    //         if (item.check) {
    //             $scope.all_grade_id.push(item.id);
    //             str +=item.id+',';
    //         }
    //     })
    //     str = str.substring(0,str.length-1);
    //     $scope.all_grade_id = str;
    //     $scope.template.template_grade = $scope.all_grade_id;
    // }
    // //专业
    // $scope.selectSpe = function(data){
    //     $scope.all_specialty_id = [];
    //     var str = '';
    //     angular.forEach($scope.specialtyData,function(item,index){
    //         if (item.check) {
    //             $scope.all_specialty_id.push(item.id);
    //             str +=item.id+',';
    //         }
    //     })
    //     str = str.substring(0,str.length-1);
    //     $scope.all_specialty_id = str;
    //     $scope.template.template_specialty = $scope.all_specialty_id;
    // }

    $scope.subTypeList = [];//题型
    //课程
    $scope.selectCurr = function(data){
        angular.forEach($scope.curriculumData,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
                $scope.subTypeList = item.children;
            }
        })
        $scope.template.template_curriculum = data.id;
    }

    //题目提交
    $scope.subjectSubmit = function () {
        var hash = {}
        var curriculum = new Array()
        var res = new Array();
        angular.forEach($scope.datiList,function(item,index){
            curriculum.push(item.subject_curriculum)
        });
        for(var i = 0; i<curriculum.length; i++){
          if(!hash[curriculum[i]]){
              hash[curriculum[i]]= true;
              res.push(curriculum[i])
          }
        }
        console.log(res);

        var datiList ={
            template_id:$scope.id,
            datiList:$scope.datiList,
            tempType:res,
        }
        services._save_Subject(datiList).success(function (res) {
            if (res.code == 0) {
                layer.msg('生成成功');
                $rootScope.formClose3();
            } else {
                layer.msg(res.message)
            }
        })
    }


    $scope.datiList=[]
    $scope.dati = {
        subject_level:null,
        subject_knowledge:null,
        know_name:null,
        chapter_name:null,
        subject_chapter:null,
        subject_marks:null,
        curriculum:null,
        subject_type:null,
        subject_amount:null,
        xiaotiList:[]
    }
    $scope.xiaoti = {
        subject_level:null,
        subject_knowledge:null,
        know_name:null,
        chapter_name:null,
        subject_chapter:null,
        subject_marks:null,
        curriculum:null,
        subject_type:null
    }

    $scope.addDati = function(){
        $scope.dati = {
            subject_level:null,
            subject_knowledge:null,
            know_name:null,
            chapter_name:null,
            subject_chapter:null,
            subject_marks:null,
            curriculum:null,
            subject_type:null,
            subject_amount:null,
            xiaotiList:[]
        }
        $scope.datiList.push($scope.dati)
        console.log($scope.datiList)
    }
    $scope.delDati = function(i){
        if(i != 0)
        {
            $scope.datiList.splice(i,1)
        }
    }

    $scope.addXiaoti = function(index){
        $scope.num = $scope.datiList[index].subject_amount; //小题数量
        $scope.xiaoti = {
            subject_level:null,
            subject_knowledge:null,
            know_name:null,
            chapter_name:null,
            subject_chapter:null,
            subject_marks:null,
            curriculum:null,
            subject_type:null
        }
        var xiaotiLsit = []
        var xiaoti = {
            subject_level:$scope.datiList[index].subject_level,
            subject_knowledge:$scope.datiList[index].subject_knowledge,
            know_name:$scope.datiList[index].know_name,
            chapter_name:$scope.datiList[index].chapter_name,
            subject_chapter:$scope.datiList[index].subject_chapter,
            subject_marks:null,
            curriculum:null,
            subject_type:$scope.datiList[index].subject_level,
        };
        for(var i = 0 ; i< $scope.num ;i++){
            xiaotiLsit.push(xiaoti)
        }
        $scope.datiList[index].xiaotiList = xiaotiLsit;
    };



    //增加大小题知识点
    $scope.addContent = function () {
        if($scope.num == 1){  //1为大题
            var dati = {
                subject_level:$scope.datiList[$scope.d_index].subject_level,
                subject_knowledge:$scope.datiList[$scope.d_index].subject_knowledge,
                know_name:$scope.datiList[$scope.d_index].know_name,
                chapter_name:$scope.datiList[$scope.d_index].chapter_name,
                subject_chapter:$scope.datiList[$scope.d_index].subject_chapter,
                subject_marks:$scope.datiList[$scope.d_index].subject_marks,
                subject_type:$scope.datiList[$scope.d_index].subject_type,
                subject_amount:$scope.datiList[$scope.d_index].subject_amount,
                subject_type_name:$scope.datiList[$scope.d_index].subject_type_name,
                xiaotiList:$scope.datiList[$scope.d_index].xiaotiList
            }
            dati.subject_knowledge = $scope.param.subject_knowledge;
            dati.know_name = $scope.param.know_name;
            dati.chapter_name = $scope.param.chapter_name;
            dati.subject_chapter = $scope.param.subject_chapter;
            $scope.datiList[$scope.d_index] = dati;
            layer.closeAll();
        }
        if($scope.num == 2){ //2为小题
            var xiaoti = {
                subject_level:$scope.datiList[$scope.d_index].subject_level,
                subject_knowledge:null,
                know_name:null,
                chapter_name:null,
                subject_chapter:null,
                subject_marks:$scope.datiList[$scope.d_index].xiaotiList[$scope.x_index].subject_marks,
                subject_type:$scope.datiList[$scope.d_index].subject_type
            }
            xiaoti.subject_knowledge = $scope.param.subject_knowledge;
            xiaoti.know_name = $scope.param.know_name;
            xiaoti.chapter_name = $scope.param.chapter_name;
            xiaoti.subject_chapter = $scope.param.subject_chapter;
            $scope.datiList[$scope.d_index].xiaotiList[$scope.x_index] = xiaoti
            console.log($scope.datiList)
            layer.closeAll();
        }

    }

    // 监听小题分数
    $scope.marksTotal = function (items,d_index,x_index) {
        items.subject_marks =null;
        var list = new Array()
        list = items.xiaotiList;
       angular.forEach(list,function(item,index){
           items.subject_marks += item.subject_marks
           $scope.datiList[d_index] = items;

       })
    }
    //监听小题平均数
    $scope.changeMarks = function (items,d_index){
        var list = new Array()
        list = items.xiaotiList;
        angular.forEach(list,function(item,index){
            item.subject_marks = items.marks
            $scope.datiList[d_index].xiaotiList = list;
        })
        $scope.marksTotal(items,d_index)
    }

    $scope.printTest = function () {
        layer.open({
            type: 1,
            title: "二维码打印",
            area: ["900px", "500px"],
            content: $("#QR_A4")
        });
    }
});






