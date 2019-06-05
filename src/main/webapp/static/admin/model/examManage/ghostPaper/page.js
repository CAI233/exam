myApp.controller('ghostPaperController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    $scope.services = services;
    //试题列表
    services["_data_subject"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getSubjectPageList', param, "POST");
    }
    //题库列表
    services["_bank_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/getBankPageList', param, "POST");
    }
    //分类树
    services["_dic_tree"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/getDicTree', param, "POST");
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

    var selNode = null;
    //知识点树
    $("#resTree").tree({
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle1(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            $scope.selRow.article_cat_id = node.id;
            $scope.selRow.parent_name = node.text;
            $(".layui-form-selected").removeClass("layui-form-selected")
        },
        onLoadSuccess: function (node, data) {
            selNode = selNode ? selNode : $("#resTree").tree("getRoot");
            selNode = $("#resTree").tree("find", selNode.id);
            $("#resTree").tree("select", selNode.target);
            //查找未分配的分类
            var unNode = $("#resTree").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });


    function changeTreeStyle1(treeNode) {
        if (!treeNode['children'] || treeNode['children'].length == 0) {
            treeNode['res_icon'] = 'tree-folder';
        }
        if (treeNode['children'] && treeNode['children'].length > 0) {
            for (var j = 0; j < treeNode['children'].length; j++) {
                changeTreeStyle1(treeNode['children'][j]);
            }
        }
        //设置属性
        treeNode["text"] = treeNode.article_cat_name;
        treeNode["id"] = treeNode.article_cat_id;
    }

    //题型
    $scope.typeList = [{
        id: 0,
        name: '全部'
    }, {
        id: 1,
        name: '单选题'
    }, {
        id: 2,
        name: '多选题'
    }, {
        id: 3,
        name: '判断题'
    }, {
        id: 4,
        name: '填空题'
    }, {
        id: 5,
        name: '问答题'
    }]
    //难易程度
    $scope.levelList = [{
        id: 0,
        name: '全部'
    }, {
        id: 1,
        name: '简单'
    }, {
        id: 2,
        name: '偏难'
    }, {
        id: 3,
        name: '较难'
    }]
    $scope.param = {
        pageNum: 1,
        pageSize: 10,
        type: 0,//题型
        subject_level: 0,//题型
        bank_id: 0,//题库
        know_type: 0,//知识点
    }


    $scope.subjectList = [];//试题列表
    $scope.kepList = [];//试题篮
    $scope.conut_nums = 0;

    //添加/移除试题
    $scope.addKep = function (obj) {
        obj.select = obj.select || 'add';
        if (obj.select == 'add') {
            if ($scope.kepList.length == 0) {
                $scope.kepList = [{
                    type: obj.subject_type,
                    paper_full: parseInt(obj.subject_marks),
                    type_name: ['单选题', '多选题', '判断题', '填空题', '问答题'][obj.subject_type - 1],
                    ids: [obj.id]
                }]
                $scope.conut_nums++;
            } else {
                var bool = false;
                angular.forEach($scope.kepList, function (item, index) {
                    if (item.type == obj.subject_type) {
                        bool = true;
                        item.ids.push(obj.id)
                        item.paper_full += parseInt(obj.subject_marks)

                    }
                })
                if (!bool) {
                    $scope.kepList.push({
                        type: obj.subject_type,
                        paper_full: parseInt(obj.subject_marks),
                        type_name: ['单选题', '多选题', '判断题', '填空题', '问答题'][obj.subject_type - 1],
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
                            $scope.conut_nums--
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
    $scope.load();

    $scope.bankDataList = [];
    $scope.bankList = function () {
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
        })
        services._dic_tree({dic_parentcode: '50000'}).success(function (res) {
            var arrdata = [];
            if (res.data) {
                arrdata = res.data;
            }
            var allData = [{
                dic_name: "全部",
                id: 0,
                children: arrdata
            }]
            $("#comTree").tree("loadData", allData);
        })
    }
    $scope.bankList();

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
            $scope.param.know_type = node.id
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
                changeTreeStyle1(treeNode['children'][j]);
            }
        }
        //设置属性
        treeNode["text"] = treeNode.dic_name;
        treeNode["id"] = treeNode.id;
    }

    //生成试卷
    $scope.generateExam = function () {
        layer.open({
            type: 1,
            title: "",
            area: ["700px", "600px"],
            content: $(".generateExam")
        });
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
    //生成试卷提交
    $scope.generateSubmit = function () {
        if (!$scope.examRow.paper_title) {
            layer.msg('请填写试卷标题');
            return !1;
        }
        if (!$scope.examRow.paper_pass) {
            layer.msg('请填写及格分数');
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
        if ($scope.examRow.paper_end <= $scope.examRow.paper_start) {
            layer.msg('考试结束时间必须大于开始时间');
            return !1;
        }
        if ($scope.examRow.paper_end.substring(0, 10) != $scope.examRow.paper_start.substring(0, 10)) {
            layer.msg('考试日期必须在同一天');
            return !1;
        }

        angular.forEach($scope.kepList, function (item, index) {
            if (item.ids.length != 0) {
                $scope.examRow.paper_full=parseInt(item.paper_full);
                angular.forEach(item.ids, function (value) {
                    $scope.examRow.subjects.push(value)
                })
            }
        })
        console.log($scope.examRow)
        if ($scope.examRow.subjects.length == 0) {
            layer.msg('你还没有选择试题');
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
            var tt = Date.parse(new Date($scope.examRow.paper_end)) - Date.parse(new Date($scope.examRow.paper_start))
            $scope.examRow.paper_duration = tt / 1000 / 60
        }
    }
})
