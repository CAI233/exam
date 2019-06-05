var row_update;
myApp.controller('subjectAddController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    $scope.services = services;
    //新增，修改
    services["_add_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/saveSubject', param, "POST");
    };
    //全部题库列表
    services["_bank_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/getBankList', param, "POST");
    };
    //试题详情
    services["_sub_detail"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getDetail', param, "POST");
    };
    //分类树---章节
    services["_get_getChapter"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/getChapter', param, "POST");
    }
    //分类树---知识点
    services["_get_getKnowledge"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/getKnowledge', param, "POST");
    }
    //新增题库
    services["_add_bank"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/saveBank', param, "POST");
    }
    $scope.typeData = [
        {"id": 1, "text": "单选题"},
        {"id": 2, "text": "多选题"},
        {"id": 3, "text": "判断题"},
        {"id": 4, "text": "填空题"},
        {"id": 5, "text": "问答题"},
        {"id": 6, "text": "综合题"},
        {"id": 7, "text": "写作题"}
    ];

    $scope.levelData = [
        {"id": 10079, "text": "基础题"},
        {"id": 10080, "text": "中等题"},
        {"id": 10081, "text": "较难题"}];

    $scope.selRow = {}

    //-----------------------------------------------------------------------------------
    //初始默认值
    $scope.init = function(call){
        //题库列表
        $scope.bankData = null;
        services._bank_list({
            pages: 1,
            pageSize: 50,
            pageNUm: 1,
        }).success(function (res) {
            $scope.bankData = res.data;
            $scope.bankData[0].check = true;
            $scope.selRow.bank_id = $scope.bankData[0].id;
        })
        //年级
        // $scope.grade_param = {
        //     pageNum: 1,
        //     pageSize: 1000,
        //     dic_code: 10000
        // }
        // $scope.gradeData = null;
        // services._dic_list($scope.grade_param).success(function (res) {
        //     $scope.gradeData = res.data.rows;
        //     $scope.gradeData[0].check = true;
        //     $scope.selRow.grade = [$scope.gradeData[0].id];
        // });
        //
        // //专业
        // $scope.specialty_param = {
        //     pageNum: 1,
        //     pageSize: 1000,
        //     dic_code: 20000
        // }
        // $scope.specialtyData = null;
        // services._dic_list($scope.specialty_param).success(function (res) {
        //     $scope.specialtyData = res.data.rows;
        //     $scope.specialtyData[0].check = true;
        //     $scope.selRow.specialty = [$scope.specialtyData[0].id];
        // })
        //课程
        $scope.curriculum_param = {
            pageNum: 1,
            pageSize: 1000,
            dic_parentcode: 30000
        }
        $scope.curriculumData = null;
        services._dic_list($scope.curriculum_param).success(function (res) {
            $scope.curriculumData = res.data;
            $scope.curriculumData[0].check = true;
            $scope.subTypeList =  res.data[0].children;
            $scope.selRow.subject_curriculum = $scope.curriculumData[0].id;
        });

        setTimeout(function(){
            call();
            // 难易度
            $scope.selectLevel($scope.levelData[0]);
            // //题库
            // $scope.selectBank($scope.bankData[0])
            // 题型
            $scope.initOption($scope.subTypeList[0])
        },2000)
    }



    //课程
    $scope.subTypeList =  [] //题型
    $scope.selectCurr = function(data){
        angular.forEach($scope.curriculumData,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;

            }
        })
        $scope.subTypeList = data.children;
        $scope.initOption($scope.subTypeList[0])
        $scope.selRow.subject_curriculum = data.id;
        console.log($scope.selRow.subject_curriculum)
        $scope.load();
    }
    //年级
    // $scope.selectGra = function(data){
    //     var all_grade_id = [];
    //     angular.forEach($scope.gradeData,function(item,index){
    //         if (item.check) {
    //             all_grade_id.push(item.id);
    //         }
    //     })
    //     $scope.selRow.grade = all_grade_id;
    //     $scope.load();
    // }
    // //专业
    // $scope.selectSpe = function(data){
    //     var  all_specialty_id = [];
    //     angular.forEach($scope.specialtyData,function(item,index){
    //         if (item.check) {
    //             all_specialty_id.push(item.id);
    //         }
    //     })
    //     $scope.selRow.specialty = all_specialty_id;
    //     $scope.load();
    // }
    //难易度
    $scope.selectLevel = function(data){
        angular.forEach($scope.levelData,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
            }
        })
        $scope.selRow.subject_level = data.id;
    }
    //题库
    $scope.selectBank = function(data){
        angular.forEach($scope.bankData,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
            }
        })
        $scope.selRow.bank_id = data.id;
    }


    $scope.load = function(){
        $scope.aparam= {
            struct_curriculum:$scope.selRow.subject_curriculum,
            grade:$scope.selRow.grade,
            specialty:$scope.selRow.specialty
        };
        //获取章节
        // $scope.selRow.subject_chapter = null;
        // $scope.selRow.chapter_name = null;
        $scope.selRow.subject_knowledge = null;
        $scope.selRow.know_name = null;
        // $("#chaTree").tree("loadData", []);
        $("#knowTree").tree("loadData", []);
        // services._get_getChapter($scope.aparam).success(function (res) {
        //     if(res.code==0){
        //         $("#chaTree").tree("loadData", res.data);
        //     }
        // })
        //获取知识点
        services._get_getKnowledge($scope.aparam).success(function (res) {
            if(res.code==0){
                $("#knowTree").tree("loadData", res.data);
            }

        })
    }

    $scope.init($scope.load);
    var selNode = null;

    // //章节树
    // $("#chaTree").tree({
    //     //数据过滤
    //     "loadFilter": function (data, parent) {
    //         for (var i = 0; i < data.length; i++) {
    //             changeTreeStyle(data[i]);
    //         }
    //         return data;
    //     },
    //     "onSelect": function (node) {
    //         $scope.selRow.subject_chapter = node.id;
    //         $scope.selRow.chapter_name = node.text;
    //         $(".layui-form-selected").removeClass("layui-form-selected")
    //     },
    //     onLoadSuccess: function (node, data) {
    //         if (!selNode) {
    //             selNode = $("#chaTree").tree("getRoot");
    //         }
    //         else {
    //             //匹配节点是否存在
    //             var boolNode = $("#chaTree").tree("find", selNode.id);
    //             selNode = boolNode ? boolNode : $("#chaTree").tree("getRoot");
    //         }
    //         if (selNode) {
    //             $("#chaTree").tree("select", selNode.target);
    //         }
    //
    //         //查找未分配的分类
    //         var unNode = $("#chaTree").tree("find", -1);
    //         if (unNode) {
    //             unNode.target.parentNode.className = "unNode";
    //         }
    //     }
    // });

    //知识点树
    $("#knowTree").tree({
        lines: true,
        checkbox: true,
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        // "onSelect": function (node) {
        //     $scope.selRow.subject_knowledge = node.id;
        //     $scope.selRow.know_name = node.text;
        //     $(".layui-form-selected").removeClass("layui-form-selected")
        // },
        "onClick":function(node){
            var nodes = $(this).tree('getChecked');
            var select_check = $("#knowTree").tree("find", node.id);
            if(select_check.checkState =="unchecked"){
                $("#knowTree").tree("check", select_check.target);
            }else{
                $("#knowTree").tree("uncheck", select_check.target);
            }
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
            $scope.selRow.know_name = str;
            $scope.selRow.subject_knowledge = ids;
            // if(nodes.length > 3){
            //     $("#knowTree").tree("uncheck",node.target)
            //     layer.msg("只能同时选择三个知识点")
            // }
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#knowTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#knowTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#knowTree").tree("getRoot");
            }
            if (selNode) {
                $("#knowTree").tree("select", selNode.target);
            }
            //查找未分配的分类
            var unNode = $("#knowTree").tree("find", -1);
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


    //选择是否有子题
    $scope.bank_tf = false;
    $scope.subChildren = [{id:0,name:'是',bool:true}];
    $scope.select_bank = function(data){
        angular.forEach($scope.subChildren,function(item,index){
            if(!data.check){
                item.check = false;
                data.bool = false;
            }else{
                item.check = true;
                data.bool = true;
            }
        })
        if(data.bool == true){
            $scope.bank_tf = true;
                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_question">【题干】</span></p>'));
                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_question">【子题题干】</span></p>',true));
                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;margin-left: 30px"><span class="subject_answer">【子题答案】</span></p>', true))
                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_analysis">【子题解析】</span></p>', true));
        }else{
            $scope.bank_tf = false;
                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_question">【题干】</span></p>'));
                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_answer">【答案】</span></p>', true))
                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_analysis">【解析】</span></p>', true));
        }
    }
    //题型
    $scope.end_data = null;
    $scope.initOption = function (data) {
        angular.forEach($scope.subTypeList,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
                angular.forEach($scope.subChildren,function(item,index){
                    if(data.id!=item.id){
                        item.check = false;
                    }
                })
            }
        })
        console.log($scope.subTypeList);
        $scope.selRow.subject_type = data.id;
        console.log(data.id);
        $scope.end_data = data;

        //单选
            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_question">【题干】</span></p>'));
            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_answer">【答案】</span></p>', true))
            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_analysis">【解析】</span></p>', true));


    };


    //分数判断
    $scope.show_socre = function(i){
        $scope.selRow.subject_marks = i.replace(/\D/g,'');
    }

    //提交
    $scope._form_submit = function (bool) {
        if (!$scope.selRow.subject_curriculum) {
            layer.msg("请选择课程")
            return false;
        }
        if (!$scope.selRow.subject_knowledge ) {
            layer.msg("请选择知识点")
            return false;
        }
        if(!$scope.selRow.subject_level){
            layer.msg("请填写难易度")
            return false;
        }

        if ($rootScope._USERINFO.user_type == 1 && $rootScope._USERINFO.dept_id != 1) {
            if (!$scope.selRow.bank_id) {
                layer.msg("请选择题库")
                return false;
            }
        }

        if (!$scope.selRow.subject_type) {
            layer.msg("请选择题型")
            return false;
        }

        var context = null;
        context = document.getElementById('myIframe2').contentWindow.ue.getContent();
        $scope.selRow.opContext = []
        $scope.selRow.opContext = context;
        console.log($scope.selRow);
        if(bool){
            $scope.selRow.id = null;
        }
        services._add_sub($scope.selRow).success(function (res) {
            if (res.code == 0) {
                layer.msg(res.message);
                if(bool) {
                    document.getElementById('myIframe2').contentWindow.ue.setContent('');
                    $scope.initOption($scope.end_data);
                }
                $scope.selRow.id = res.data;
                console.log($scope.selRow.id)
                // $scope.knowSub(res.data)
            }
            else {
                layer.msg(res.message);
            }
        })
    }
    //预览
    $scope.knowSub = function(id){
        services._sub_detail({id: id}).success(function (res) {
            if(res.code==0){
                $scope.selRow_all = res.data;
                $scope.parent_curriculum = res.data.subject_curriculum;
                if($scope.selRow_all.subject_type==6){
                    services._sublis_list({id:id}).success(function (res) {
                        if(res.code==0){
                            $scope.selRows_all = res.data.subjectList;
                            console.log($scope.selRows_all);
                        }
                    })
                }
            }
        })
        $scope.formOpen1();
        layer.msg("3秒后本窗口将关闭或请点击关闭");
    }

    $scope.formOpen1 = function () {
        $("#form_content1").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");
    }
    $scope.formClose1 = function(){
        $("#form_content1").removeClass("fadeInRightBig").addClass("fadeOutRightBig");

    }
    //打开添加题库弹窗
    $scope.openSetBank = function () {
        $scope.layer_exportd = layer.open({
            type: 1,
            title: "",
            area: ["600px", "400px"],
            content: $("#addBank")
        });
    }
    //题库保存
    $scope.save_bank = function () {
        if (!$scope._bank_param.bank_title) {
            layer.msg("请填写题库标题");
            return false;
        }
        services._add_bank($scope._bank_param).success(function (res) {
            if (res.code == 0) {
                $scope.init();
                layer.close($scope.layer_exportd);
                layer.msg(res.message);
            } else {
                layer.msg(res.message);
            }

        })
    }
});