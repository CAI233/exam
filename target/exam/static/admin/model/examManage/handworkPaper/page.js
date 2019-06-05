myApp.controller('handworkPaperController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    $scope.services = services;
    //试题列表
    services["_data_subject"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getSubjectPageList', param, "POST");
    }
    //题库列表
    services["_bank_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/getBankPageList', param, "POST");
    }
    
    //试题详情
    services["_sub_detail"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getDetail', param, "POST");
    };

    //子题列表
    services["_sublis_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/single_Item', param, "POST");
    }

    //分类树
    // services["_dic_tree"] = function (param) {
    //     return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/getDicTree', param, "POST");
    // }

    //分类树---知识点
    services["_get_getKnowledge"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/getKnowledge', param, "POST");
    }
    //生成试卷
    services["_generate_exam"] = function (param) {
        if (param.paper_start.length < 19) {
            param.paper_start = param.paper_start + ":00";
        }
        if (param.paper_end.length < 19) {
            param.paper_end = param.paper_end + ":00";
        }
        return $rootScope.serverAction(ctxPath + '/admin/papers/savePaper', param, "POST");
    }

    //知识点
    $scope.speTest = {
        dic_name: null,
        dic_ownerid: null
    }

    //题型
    $scope.typeList = [{id: 0, name: '全部'},
                        {id: 1, name: '单选题'},
                        {id: 2, name: '多选题'},
                        {id: 3, name: '判断题'},
                        {id: 4, name: '填空题'},
                        {id: 5, name: '问答题'},
                        {id: 6, name: '综合题'},
                        {id: 7, name: '写作题'}]
    //难易程度
    $scope.levelList = [{id: 0, name: '全部'},
                        {id: 1, name: '简单'},
                        {id: 2, name: '偏难'},
                        {id: 3, name: '较难'}]

    $scope.bankData = null;
    $scope.curriculumData = null;//课程
    $scope.gradeData = null;//年级
    $scope.specialtyData = null;//专业
    $scope.papersTypeDataList = [];//试卷类型

    $scope.now_marks = null;
    $scope.aparam= {
        struct_curriculum:null,
        grade:null,
        // specialty:null,
    };
    $scope.init = function(_call){
        //题库
        services._bank_list({pages: 1, pageSize: 50, pageNUm: 1,}).success(function (res) {
            if (res.code == 0) {
                $scope.bankData = res.data.rows;
                $scope.bankData.unshift({
                    id: 0,
                    bank_title: '全部',
                })
            }
        })
        //课程
        services._dic_list({dic_parentcode: 30000,pageSize: 1000,pageNum: 1 }).success(function (res) {
            $scope.curriculumData = res.data;
            $scope.curriculumData[0].check = true;
            $scope.aparam.struct_curriculum = $scope.curriculumData[0].id;
            $scope.param.subject_curriculum = $scope.curriculumData[0].id;
        })
        //年级
        // services._dic_list({dic_parentcode: 10000,pageNum: 1, pageSize: 1000}).success(function (res) {
        //     $scope.gradeData = res.data.rows;
        //     $scope._gradeData = angular.copy(res.data);
        //     $scope.gradeData[0].check = true;
        //     $scope.aparam.grade = [$scope.gradeData[0].id];
        //     $scope.param.subject_grade = [$scope.gradeData[0].id];
        // })
        //专业
        // services._dic_list({dic_parentcode: 20000,pageNum: 1, pageSize: 1000}).success(function (res) {
        //     $scope.specialtyData = res.data.rows;
        //     $scope._specialtyData = angular.copy(res.data);
        //     $scope.specialtyData[0].check = true;
        //     $scope.aparam.specialty = [$scope.specialtyData[0].id];
        //     $scope.param.subject_specialty = [$scope.specialtyData[0].id];
        // })
        setTimeout(function(){
            _call();
        },500)

    }


    //试卷类别
    services._dic_list({
        pageNum: 1,
        pageSize: 1000,
        dic_code: 70000
    }).success(function (res) {
        $scope.papersTypeDataList = res.data.rows;
    })

    $scope.param = {
        pageNum: 1,
        pageSize: 10,
        type: 0,//题型
        subject_level: 0,//难易度
        bank_id: 0,//题库
        
    }


    $scope.subjectList = [];//试题列表
    $scope.kepList = [];//试题篮
    $scope.conut_nums = 0;
    $scope.marks = 0;
    //添加/移除试题
    $scope.addKep = function (obj) {
        obj.select = obj.select || 'add';
        if(!obj.subject_marks ||obj.subject_marks==0){
            layer.msg('试题分数为0，不能进行组卷，请返回【试题管理】设置分数');
            return false;
        }
        if (obj.select == 'add') {
            if ($scope.kepList.length == 0) {
                $scope.kepList = [{
                    type: obj.subject_type,
                    paper_full: parseInt(obj.subject_marks),
                    type_name: ['单选题', '多选题', '判断题', '填空题', '问答题', '综合题', '写作题'][obj.subject_type - 1],
                    ids: [obj.id],
                }]
                $scope.conut_nums++;
            } else {
                var bool = false;
                angular.forEach($scope.kepList, function (item, index) {
                    if (item.type == obj.subject_type) {
                        bool = true;
                        item.ids.push(obj.id)
                        item.paper_full += parseInt(obj.subject_marks);
                    }
                })
                if (!bool) {
                    $scope.kepList.push({
                        type: obj.subject_type,
                        paper_full: parseInt(obj.subject_marks),
                        type_name: ['单选题', '多选题', '判断题', '填空题', '问答题', '综合题', '写作题'][obj.subject_type - 1],
                        ids: [obj.id]
                    })
                }
                $scope.conut_nums++;
            }
            obj.select = 'del';
        }
        else {
            angular.forEach($scope.kepList, function (item, index) {
                if (item.type == obj.subject_type) {
                    for (var i = 0; i < item.ids.length; i++) {
                        if (item.ids[i] == obj.id) {
                            item.ids.splice(i, 1);
                            item.paper_full -= parseInt(obj.subject_marks);
                            $scope.conut_nums--;
                        }
                    }
                    if (item.ids.length == 0) {
                        $scope.kepList.splice(index, 1)
                    }
                }
            })
            obj.select = 'add';
        }
    }
    //移除试题(按类型移除集合)
    $scope.delKep = function (type) {
        angular.forEach($scope.kepList, function (item, index) {
            if (item.type == type) {
                $scope.conut_nums -= $scope.kepList[index].ids.length;
                $scope.kepList.splice(index, 1)
            }
        })
        angular.forEach($scope.subjectList, function (it, ind) {
            if (it.subject_type == type)
                $scope.subjectList[ind].select = null;
        })
    }

    //添加本页全部试题
    $scope.addKepAll = function () {
        angular.forEach($scope.subjectList, function (item, index) {
            if (!item.select || item.select == 'add') {
                $scope.addKep(item)
            }

        })
    }
    //加载
    $scope.load = function () {
        //试题列表
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

    //预览
    $scope.knowSub = function(id){
        services._sub_detail({id: id}).success(function (res) {
            if(res.code==0){
                $scope.selRow = res.data;
                if($scope.selRow.subject_type==6){
                    services._sublis_list({id:id}).success(function (res) {
                        if(res.code==0){
                            $scope.selRows = res.data.subjectList;
                        }
                    })
                }
            }
        })
        $rootScope.formOpen();
    }


    $scope.reload = function () {
        $scope.load();
    }

    $scope.load_spe = function () {
        services._get_getKnowledge($scope.aparam).success(function (res) {
            var arrdata = [];
            if (res.data) {
                arrdata = res.data;
            }
            var allData = [{
                struct_name: "全部",
                id: 0,
                children: arrdata
            }]
            $("#comTree").tree("loadData", allData);
        });
    }

    //加载
    $scope.init($scope.load_spe)

    //课程
    $scope.selectCurr = function(data){
        angular.forEach($scope.curriculumData,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
            }
        })
        $scope.param.subject_curriculum = data.id;
        $scope.aparam.struct_curriculum = data.id;
        $scope.load_spe();
        //切换课程时 试题篮 清空
        $scope.kepList = [];
        $scope.conut_nums = 0;
    }
    // //年级
    // $scope.selectGra = function(data){
    //     var all_grade_id = [];
    //     angular.forEach($scope.gradeData,function(item,index){
    //         if (item.check) {
    //             all_grade_id.push(item.id);
    //         }
    //     })
    //     $scope.param.subject_grade = all_grade_id;
    //     $scope.aparam.grade = all_grade_id;
    //     $scope.load_spe();
    // }
    // //专业
    // $scope.selectSpe = function(data){
    //     var all_specialty_id = [];
    //     angular.forEach($scope.specialtyData,function(item,index){
    //         if (item.check) {
    //             all_specialty_id.push(item.id);
    //         }
    //     })
    //     $scope.param.subject_specialty = all_specialty_id;
    //     $scope.aparam.specialty = all_specialty_id;
    //     $scope.load_spe();
    // }

    var selNode = null;

    $("#comTree").tree({
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle1(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            $scope.param.subject_knowledge = node.id;
            $scope.load()
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#comTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#comTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#comTree").tree("getRoot");
            }
            $("#comTree").tree("select", selNode.target);

            //查找未分配的分类
            var unNode = $("#comTree").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });
    function changeTreeStyle1(treeNode) {
        if (treeNode['children'] && treeNode['children'].length > 0) {
            for (var j = 0; j < treeNode['children'].length; j++) {
                //排序
                treeNode['children'].sort($rootScope._by("create_time"));
                changeTreeStyle1(treeNode['children'][j]);
            }
        }
        //设置属性
        treeNode["text"] = treeNode.struct_name;
        treeNode["id"] = treeNode.id;
    }


    //生成试卷
    $scope.generateExam = function () {
        $scope.examRow.paper_full = 0;
        //课程
        $scope.examRow.paper_curriculum = $scope.param.subject_curriculum;
        $scope.examRow.subjects = [];
        angular.forEach($scope.kepList, function (item, index) {
            if (item.ids.length != 0) {
                $scope.examRow.paper_full += parseInt(item.paper_full);
                angular.forEach(item.ids, function (value) {
                    $scope.examRow.subjects.push(value)
                })
            }
        })
        if ($scope.examRow.subjects.length == 0) {
            layer.msg('你还没有选择试题');
            return !1;
        } else {
            layer.open({
                type: 1,
                title: "",
                area: ["800px", "600px"],
                content: $(".generateExam")
            });

        }
    }
    $scope.generateExamClose = function () {
        $scope.examRow = {
            subjects: []
        };
        layer.closeAll()
    }

    $scope.examRow = {
        paper_title: null,
        paper_pass: null,
        paper_start: null,
        paper_end: null,
        paper_duration: null,
        paper_explain: null,
        paper_full: null,
        subjects: []
    }

    //提交时的

    //年级
    $scope._selectGra = function(data){
        angular.forEach($scope._gradeData,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
            }
        })
    }
    //专业
    $scope._selectSpe = function(data){
        angular.forEach($scope._specialtyData,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
            }
        })
    }

    //分数判断
    $scope.show_socre = function(i){
        $scope.examRow.paper_pass = i.replace(/\D/g,'');
    }

    //生成试卷提交
    $scope.generateSubmit = function () {
        if (!$scope.examRow.paper_title) {
            layer.msg('请填写试卷标题');
            return !1;
        }
        if (!$scope.examRow.paper_grade || $scope.examRow.paper_grade.length==0) {
            layer.msg("请选择年级")
            return false;
        }
        if (!$scope.examRow.paper_specialty || $scope.examRow.paper_specialty.length==0) {
            layer.msg("请选择专业")
            return false;
        }
        if (!$scope.examRow.paper_start) {
            layer.msg('请选择考试开始时间');
            return !1;
        }
        if (!$scope.examRow.paper_end) {
            layer.msg('请选择考试结束时间');
            return !1;
        }
        if (!$scope.examRow.paper_typename) {
            layer.msg("请填写试卷类别")
            return false;
        }
        if (!$scope.examRow.paper_pass || $scope.examRow.paper_pass==0) {
            layer.msg('请填写及格分数');
            return !1;
        }
        var Dtime = parseInt(Date.parse(new Date(($scope.examRow.paper_start+":00").replace(/\-/g,'/')))-parseInt(Date.parse(new Date(moment().format('YYYY-MM-DD HH:mm:ss').replace(/\-/g,'/')))));
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


    //获取时长
    $scope.getPaperDuration = function () {
        if ($scope.examRow.paper_end && $scope.examRow.paper_start) {
            var tt = Date.parse(new Date($scope.examRow.paper_end.replace(/\-/g,'/'))) - Date.parse(new Date($scope.examRow.paper_start.replace(/\-/g,'/')))
            $scope.examRow.paper_duration = tt / 1000 / 60
        }
    }
})
