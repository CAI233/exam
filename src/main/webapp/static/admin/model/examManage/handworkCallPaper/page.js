myApp.controller('handworkCallPaperController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    $scope.isUse= $stateParams.isUse;
    $scope.status = $stateParams.status ;
    $scope.services = services;

    //试题列表
    services["_data_subject"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getSubjectPageList', param, "POST");
    }
    //题库列表
    services["_bank_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/getBankPageList', param, "POST");
    }

    // 试题详情
    services["_sub_detail"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getDetail', param, "POST");
    };

    //子题列表
    services["_sublis_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/single_Item', param, "POST");
    }
    //试卷的详情
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/getPaperInfo', param, "POST");
    }

    // //分类树
    // services["_dic_tree"] = function (param) {
    //     return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/getDicTree', param, "POST");
    // }
    //分类树---知识点
    services["_get_getKnowledge"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/getKnowledge', param, "POST");
    }
    //试卷保存
    services["_generate_exam"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/savePaper1', param, "POST");
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
    $scope.levelList = [{id: 0, name: '全部'},{id: 1, name: '简单'},{id: 2, name: '偏难'},{id: 3, name: '较难'}]

    $scope.param = {
        pageNum: 1,
        pageSize: 10,
        type: 0,//题型
        subject_level: 0,//题型
        bank_id:0,//题库
        // subject_knowledge: 0//知识点
    }
    //获取知识点 参数对象
    $scope.aparam= {
        struct_curriculum:null,
        grade:[],
        specialty:[],
    };

    $scope.now_marks = null;

    $scope.bankData = [];
    $scope.curriculumData = null;//课程
    $scope.gradeDataList = [];//年级
    $scope.specialtyDataList = [];//专业
    $scope.papersTypeDataList = [];//试卷类型

    //题库列表

    $scope.init = function(){
        services._bank_list({
            pages: 1,
            pageSize: 50,
            pageNUm: 1,
        }).success(function (res) {
            if (res.code == 0) {
                $scope.bankData = res.data.rows;
                $scope.bankData.unshift({
                    bank_id: 0,
                    bank_title: '全部',
                })
                $scope.param.bank_id = $scope.bankData[0].id;
                $scope.load_spe();
            }
        })
    }

    //课程
    services._dic_list({
        pageNum: 1,
        pageSize: 1000,
        dic_code: '30000'
    }).success(function (res) {
        $scope.curriculumData = res.data.rows;
    })
    //年级
    services._dic_list({
        pageNum: 1,
        pageSize: 1000,
        dic_code: '10000'
    }).success(function (res) {
        $scope.gradeData = res.data.rows;
    })
    //专业
    services._dic_list({
        pageNum: 1,
        pageSize: 1000,
        dic_code: '20000'
    }).success(function (res) {
        $scope.specialtyData = res.data.rows;
    })
    //试卷类别
    services._dic_list({
        pageNum: 1,
        pageSize: 1000,
        dic_code: '70000'
    }).success(function (res) {
        $scope.papersTypeDataList = res.data.rows;
    })


    $scope.subjectList = [];//试题列表
    $scope.kepList = [];//试题篮
    $scope.conut_nums = 0;
    $scope.marks = 0;
    //添加/移除试题
    $scope.ids_all = [];
    $scope.addKep = function (obj) {
        obj.select = obj.select || 'add';
        if(!obj.detail_marks ||obj.detail_marks==0){
            layer.msg('试题分数为0，不能进行组卷，请返回【试题管理】设置分数');
            return false;
        }
        if (obj.select == 'add') {
            $scope.ids_all.push({
                id:obj.id,
                is_delete:2
            })
            if ($scope.kepList.length == 0) {
                $scope.kepList = [{
                    type: obj.subject_type,
                    paper_full: parseInt(obj.detail_marks),
                    type_name: ['单选题', '多选题', '判断题', '填空题', '问答题', '综合题','写作题'][obj.subject_type - 1],
                    ids: [obj.id],
                }]
                $scope.conut_nums++;
            } else {
                var bool = false;
                angular.forEach($scope.kepList, function (item, index) {
                    if (item.type == obj.subject_type) {
                        bool = true;
                        item.ids.push(obj.id)
                        item.paper_full += parseInt(obj.detail_marks);
                    }
                })
                if (!bool) {
                    $scope.kepList.push({
                        type: obj.subject_type,
                        paper_full: parseInt(obj.detail_marks),
                        type_name: ['单选题', '多选题', '判断题', '填空题', '问答题', '综合题','写作题'][obj.subject_type - 1],
                        ids: [obj.id]
                    })
                }
                $scope.conut_nums++;
            }
            obj.select = 'del';

        }
        else {
            $scope.ids_all.push({
                id:obj.id,
                is_delete:1
            })
            angular.forEach($scope.kepList, function (item, index) {
                if (item.type == obj.subject_type) {
                    for (var i = 0; i < item.ids.length; i++) {
                        if (item.ids[i] == obj.id) {
                            item.ids.splice(i, 1);
                            item.paper_full -= parseInt(obj.detail_marks);
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
                $.each(item.ids,function(index,value){
                    $scope.ids_all.push({
                        id:value,
                        is_delete:1
                    })
                })
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

    $scope.callparam={paper_id: $stateParams.id,isUse:$scope.isUse}
    $scope.resd = "";

    services._sub_list($scope.callparam).success(function(res){
        if(res.code==0){
            //默认题库 课程 年级 专业
            $scope.aparam.struct_curriculum = parseInt(res.data.paper_curriculum);
            $scope.param.subject_curriculum = parseInt(res.data.paper_curriculum);

            $scope.aparam.grade = [parseInt(res.data.paper_grade)]
            $scope.param.subject_grade = [parseInt(res.data.paper_grade)];

            $scope.aparam.specialty = [parseInt(res.data.paper_specialty)]
            $scope.param.subject_specialty = [parseInt(res.data.paper_specialty)];

            //初始执行函数 load
            $scope.init();
            $scope.resd = res.data.paper_subjects;
            angular.forEach($scope.resd,function(item,index){
               for(var k in item){
                   $scope.addKep(item[k]);
                   $scope.ids_all.splice(0,$scope.ids_all.length);
               }
            })

        }else {
            layer.msg(res.message);
        }
    })

    //选择年级
    $scope.selectGra = function(data){
        var all_grade_id = [];
        angular.forEach($scope.gradeData,function(item,index){
            if (item.check) {
                all_grade_id.push(item.id);
            }
        })
        $scope.param.subject_grade = all_grade_id;
        $scope.aparam.grade = all_grade_id;
        $scope.load_spe();
    }
    //选择专业
    $scope.selectSpe = function(data){
        var all_specialty_id = [];
        angular.forEach($scope.specialtyData,function(item,index){
            if (item.check) {
                all_specialty_id.push(item.id);
            }
        })
        $scope.param.subject_specialty = all_specialty_id;
        $scope.aparam.specialty = all_specialty_id;
        $scope.load_spe();
    }

    //加载
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
        })

    }

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
            $scope.param.subject_knowledge = node.id
            $scope.load();
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

    $scope.reload = function () {
        $scope.load();
    }


    //生成试卷
    $scope.generateExam = function () {
        $scope.allIds = []
        angular.forEach($scope.kepList, function (item, index) {
            if (item.ids.length != 0) {
                angular.forEach(item.ids,function(items){
                    $scope.allIds.push(items);
                })
            }
        })
        var paper_id = $stateParams.id;

        var paper_all = $scope.ids_all;
        services._generate_exam({id:paper_id,subjectList:paper_all}).success(function (res) {
            $state.go("paperSetting",{id:$stateParams.id,isUse:$scope.isUse,status:$scope.status});
            layer.msg('操作试题成功');

        })


    }

    //返回
    $scope.backPage = function () {
        $state.go("paperSetting",{id:$stateParams.id,isUse:$scope.isUse,status:$scope.status});
    };

    
    //获取时长
    $scope.getPaperDuration = function () {
        if ($scope.examRow.paper_end && $scope.examRow.paper_start) {
            var tt = Date.parse(new Date($scope.examRow.paper_end.replace(/\-/g,'/'))) - Date.parse(new Date($scope.examRow.paper_start.replace(/\-/g,'/')))
            $scope.examRow.paper_duration = tt / 1000 / 60
        }
    }
})
