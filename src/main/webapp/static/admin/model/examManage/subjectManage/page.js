var row_update;
myApp.controller('subjectManageController', function ($rootScope, $scope, services, $sce, $stateParams, $state, dataService) {
    $scope.services = services;
    //列表
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getManageList', param, "POST");
    }

    //试题列表
    services["_data_subject"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getSubjectPageList', param, "POST");
    }
    //题库列表
    services["_sub_fenpei_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/getSubBankList', param, "POST");
    }
    //全部题库列表
    services["_bank_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/getBankList', param, "POST");
    }
    //入库
    services["_add_sub_bank"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/addSubBank', param, "POST");
    }
    //移除
    services["_remove_sub_bank"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/removeSubBank', param, "POST");
    }
    //删除
    services["_del_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/delSubjects', param, "POST");
    }
    //新增，修改reload
    services["_add_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/saveSubject', param, "POST");
    }
    //导入
    services["_import_excel"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/excelImport/importSubject', param, "POST");
    }
    //分类树
    services["_dic_tree"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/getDicTree', param, "POST");
    }
    //分类树---章节
    services["_get_getChapter"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/getChapter', param, "POST");
    }
    //分类树---知识点
    services["_get_getKnowledge"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/getKnowledge', param, "POST");
    }
    //试题详情
    services["_sub_detail"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getDetail', param, "POST");
    };

    //子题列表
    services["_sublis_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/single_Item', param, "POST");
    }

    //设置试题属性
    services["_sub_setting"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/subSetting', param, "POST");
    }


    // 下载模板
    $scope.load_model = function () {
        var src = ctxPath + "/static/excelFile/temple.doc";
        var iframe = $('<iframe style="display: none" src="' + src + '?v=' + (new Date()).getTime().toString() + '"></iframe>');
        $("#subjectManage").append(iframe);
    }

    $scope.all_param = {
        pages: 1,
        pageSize: 10,
        pageNum: 1,
        total: 0,
        searchText: null,
        pid: 0,
    }
    $scope.up_tf = false;
    $scope.down_tf = false;
    $scope.now_marks = null;

    //小题是否修改 保存成功
    $scope.selList_tf = false;
    $scope.all_load = function () {
        services._sub_list($scope.all_param).success(function (res) {
            if (res.code == 0) {

                $scope.subjectList = res.data.rows;
                $scope.all_total = res.data.total;
                $scope.all_pages = res.data.pages;

                if ($scope.up_tf) {
                    $scope.selRow_all = $scope.subjectList[$scope.subjectList.length - 1];
                    $scope.selRow_all['now_index'] = $scope.subjectList.length - 1;
                    if ($scope.selRow_all.subjectList) {
                        $scope.parent_id = $scope.subjectList[$scope.subjectList.length - 1].id;
                        $scope.selRows_all = $scope.subjectList[$scope.subjectList.length - 1].subjectList;
                    }
                }
                if ($scope.down_tf) {
                    $scope.selRow_all = $scope.subjectList[0];
                    $scope.selRow_all['now_index'] = 0;
                    if ($scope.selRow_all.subjectList) {
                        $scope.parent_id = $scope.subjectList[0].id;
                        $scope.selRows_all = $scope.subjectList[0].subjectList;
                    }
                }

                //判断小题是否保存
                if ($scope.selList_tf) {
                    console.log('小题保存');
                    console.log($scope.selRow_all);
                    console.log($scope.subjectList);
                    $scope.knowSub($scope.subjectList[$scope.selRow_all.now_index], $scope.selRow_all.now_index);
                    $scope.selList_tf = false;
                }


                console.log($scope.subjectList);
                //匹配题型
                angular.forEach($scope.subjectList, function (item, index) {
                    var data = dataService.data;
                    angular.forEach(data, function (items, indexs) {
                        if (item.subject_type == items.id) {
                            item.subTypeName = items.name
                        }
                    });
                    angular.forEach($scope.levelData, function (items, indexs) {
                        if (item.subject_level == items.id) {
                            item.subject_level_name = items.text
                        }
                    })
                });
                var a = location.href;
                if (a.indexOf('subjectManage') !== -1) {
                    layui.use('laypage', function () {
                        var laypage = layui.laypage;
                        layui.laypage({
                            cont: 'pager',
                            pages: res.data.pages,
                            groups: res.data.pageSize,
                            skip: false,
                            curr: res.data.pageNum || 1,
                            jump: function (resPager) {
                                if (resPager.curr != $scope.all_param.pageNum) {
                                    $scope.all_param.pageNum = parseInt(resPager.curr);
                                    $scope.all_load();
                                }
                            }
                        });
                    })
                }
            }
        })
    }
    $scope.all_load();

    $scope.typeData = [
        {"id": 1, "text": "单选题"},
        {"id": 2, "text": "多选题"},
        {"id": 3, "text": "判断题"},
        {"id": 4, "text": "填空题"},
        {"id": 5, "text": "问答题"},
        {"id": 6, "text": "综合题"},
        {"id": 7, "text": "写作题"}];

    $scope.CtypeData = [
        {"id": 1, "text": "单选题"},
        {"id": 2, "text": "多选题"},
        {"id": 3, "text": "判断题"},
        {"id": 4, "text": "填空题"},
        {"id": 5, "text": "问答题"}];

    $scope.levelData = [
        {"id": 10079, "text": "基础题"},
        {"id": 10080, "text": "中等题"},
        {"id": 10081, "text": "较难题"}];
    $scope.levelDatas = angular.copy($scope.levelData)
    $scope.statics = [{"id": 0, "text": "全部"}, {"id": 1, "text": "已分配"}, {"id": 2, "text": "未分配"}];
    $scope.selectInfo = {
        grade_name: null,
        grade_id: null,
        specialty_name: null,
        specialty_id: null,
        curriculum_name: null,
        curriculum_id: null,
        chapter_name: null,
        chapter_id: null,
        know_name: null,
        know_id: null
    };
    $scope.subSetting = {
        grade_name: null,
        grade_id: null,
        specialty_name: null,
        specialty_id: null,
        curriculum_name: null,
        curriculum_id: null,
        chapter_name: null,
        chapter_id: null,
        know_name: null,
        subject_level: null,
        know_id: null
    };

    $scope.selRow = {}
    //页面操作内容
    $scope.param = {
        subject_type_name: null,
        subject_type: null,
        grade_name: null,
        grade_id: null,
        specialty_name: null,
        specialty_id: null,
        curriculum_name: null,
        curriculum_id: null,
        chapter_name: null,
        chapter_id: null,
        know_name: null,
        know_id: null,
        searchText: null,
        is_distribution_name: null,
        is_distribution: null
    }

    //查询
    $scope.reload = function () {
        // $scope.all_param["subject_type"] = $scope.param.subject_type;
        // $scope.all_param["subject_grade"] = $scope.param.grade_id;
        // $scope.all_param["subject_specialty"] = $scope.param.specialty_id;
        // $scope.all_param["subject_curriculum"] = $scope.param.curriculum_id;
        // $scope.all_param["subject_level"] = $scope.param.subject_level;
        // $scope.all_param["subject_type"] = $scope.param.subject_type;
        // $scope.all_param["chapter_id"] = $scope.param.chapter_id;
        // $scope.all_param["know_id"] = $scope.param.know_id;
        $scope.all_param["searchText"] = $scope.param.searchText;
        // $scope.all_param["pageNum"] = 1;
        // $scope.all_param["is_distribution"] = $scope.param.is_distribution;
        $scope.all_load();
    }

    //清空
    $scope.rest = function () {
        //课程 年级 专业 章节 知识点 题型 分配 清空
        $scope.curriculumData.some(function (item) {
            item.check = false;
        });
        // $scope.gradeData.some(function(item){item.check=false;})
        // $scope.specialtyData.some(function(item){item.check=false;})
        $scope.subTypeList.some(function (item) {
            item.check = false;
        })
        $scope.levelData.some(function (item) {
            item.check = false;
        })
        $scope.statics.some(function (item) {
            item.check = false;
        })
        $scope.param.subject_type = null;
        $scope.param.curriculum_id = null;
        // $scope.param.grade_id = null;
        // $scope.param.specialty_id = null;
        // $scope.param.chapter_id = null;
        // $scope.param.chapter_name = null;
        $scope.param.know_id = null;
        $scope.param.know_name = null;
        $scope.param.searchText = null;
        $scope.param.is_distribution = null;
        $scope.all_param.subject_type = null;
        // $scope.all_param.subject_grade = null;
        // $scope.all_param.subject_specialty = null;
        $scope.all_param.subject_curriculum = null;
        $scope.all_param.subject_level = null;
        // $scope.all_param.chapter_name = null;
        // $scope.all_param.chapter_id = null;
        $scope.all_param.know_name = null;
        $scope.all_param.know_id = null;
        $scope.all_param.searchText = null;
        $scope.all_param.is_distribution = null
        $scope.all_load();

    }

    //页面操作内容
    $scope.grade_param = {
        pageNum: 1, pageSize: 1000, dic_parentcode: 10000
    }
    //年级
    $scope.gradeData = null;
    services._dic_list($scope.grade_param).success(function (res) {
        $scope.gradeData = res.data;
        //调整页面年级
        $scope._GgradeData = angular.copy(res.data);
    })
    //页面操作内容
    $scope.specialty_param = {pageNum: 1, pageSize: 1000, dic_parentcode: 20000}
    //专业
    $scope.specialtyData = null;
    services._dic_list($scope.specialty_param).success(function (res) {
        $scope.specialtyData = res.data;
        //调整页面专业
        $scope._GspecialtyData = angular.copy(res.data);
    })

    //课程
    $scope.curriculum_param = {pageNum: 1, pageSize: 1000, dic_parentcode: 30000}
    $scope.curriculumData = null;
    services._dic_list($scope.curriculum_param).success(function (res) {
        $scope.curriculumData = res.data;
        // $scope.curriculumData[0].check = true;
        $scope.subTypeList = res.data[0].children;
        // $scope.param.curriculum_id = res.data[0].id;
        $scope._curriculumData = angular.copy(res.data);
        // $scope.load();
    })
    //题型

    $scope.subTypeList = [];//题型
    //课程
    $scope.selectCurr = function (data) {
        $scope.all_curriculum_id = [];
        $scope.rest();
        angular.forEach($scope.curriculumData, function (item, index) {
            if (item.id != data.id) {
                item.check = false;
            } else {
                item.check = true;
                $scope.subTypeList = item.children;
            }
        })
        $scope.all_param["subject_curriculum"] = data.id;
        $scope.load();
    }

    //题型
    $scope.selectType = function (data) {
        $scope.all_type = []
        angular.forEach($scope.subTypeList, function (item, index) {
            if (item.id != data.id) {
                item.check = false;
            } else {
                item.check = true;
                // $scope.param.subject_type = data.id
            }
            // if (item.check) {
            //     $scope.all_type.push(item.id);
            // }
        })
        $scope.all_param["subject_type"] = data.id
        $scope.all_load()
        // if($scope.all_type.length==0){
        //     $scope.all_type = null;
        // }
        // $scope.param.subject_type = $scope.all_type;
    }

    //难易度
    $scope.selectLevel = function (data) {
        angular.forEach($scope.levelData, function (item, index) {
            if (item.id != data.id) {
                item.check = false;
            } else {
                item.check = true;
            }
        })
        $scope.all_param["subject_level"] = data.id;
        $scope.all_load()
    }

    //章节和知识点
    $scope.load = function () {
        $scope.aparam = {
            struct_curriculum: $scope.all_param.subject_curriculum,
            grade: null,
            specialty: null
        };
        // $scope.param.chapter_id = null;
        // $scope.param.chapter_name = null;
        $scope.all_param.know_id = null;
        $scope.all_param.know_name = null;
        //获取知识点
        services._get_getKnowledge($scope.aparam).success(function (res) {
            if (res.code == 0) {
                var arrdata = [];
                if (res.data) {
                    arrdata = res.data;
                }
                var allData = [{
                    struct_name: "全部",
                    id: 0,
                    children: arrdata
                }];
                $("#parknowTree").tree("loadData", allData);
            }

        })
    }

    //列表绑定章节
    $("#parchaTree").tree({
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            $scope.param.chapter_id = node.id;
            $scope.param.chapter_name = node.text;
            $(".layui-form-selected").removeClass("layui-form-selected")
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#parchaTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#parchaTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#parchaTree").tree("getRoot");
            }
            if (selNode) {
                $("#parchaTree").tree("select", selNode.target);
            }

            //查找未分配的分类
            var unNode = $("#parchaTree").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });
    //列表绑定知识点
    $("#parknowTree").tree({
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            $scope.all_param.know_id = node.id;
            $scope.all_param.know_name = node.text;
            console.log(node.id);
            $scope.all_load();
            $(".layui-form-selected").removeClass("layui-form-selected")
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#parknowTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#parknowTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#parknowTree").tree("getRoot");
            }
            if (selNode) {
                $("#parknowTree").tree("select", selNode.target);
            }
            //查找未分配的分类
            var unNode = $("#parknowTree").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });
    var selNode = null;
    //===========================导入的下拉值===========================
    //导入绑定章节树
    $("#chaTree").tree({
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            $scope.selectInfo.chapter_id = node.id;
            $scope.selectInfo.chapter_name = node.text;
            $(".layui-form-selected").removeClass("layui-form-selected")
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#chaTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#chaTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#chaTree").tree("getRoot");
            }
            if (selNode) {
                $("#chaTree").tree("select", selNode.target);
            }

            //查找未分配的分类
            var unNode = $("#chaTree").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });

    $("#chaTreeSetting").tree({
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            $scope.subSetting.chapter_id = node.id;
            $scope.subSetting.chapter_name = node.text;
            $(".layui-form-selected").removeClass("layui-form-selected")
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#chaTreeSetting").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#chaTreeSetting").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#chaTreeSetting").tree("getRoot");
            }
            if (selNode) {
                $("#chaTreeSetting").tree("select", selNode.target);
            }

            //查找未分配的分类
            var unNode = $("#chaTreeSetting").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });

    //导入绑定知识点
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
        "onSelect": function (node) {
            /*$scope.selectInfo.know_id = node.id;
             $scope.selectInfo.know_name = node.text;
             $(".layui-form-selected").removeClass("layui-form-selected")*/
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
            $scope.selectInfo.know_name = str;
            $scope.selectInfo.know_id = ids;
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#knowTree").tree("getRoot");
            } else {
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
    $("#knowTreeSetting").tree({
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
            // $scope.subSetting.know_id = node.id;
            // $scope.subSetting.know_name = node.text;
            // $(".layui-form-selected").removeClass("layui-form-selected")
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#knowTreeSetting").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#knowTreeSetting").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#knowTreeSetting").tree("getRoot");
            }
            if (selNode) {
                $("#knowTreeSetting").tree("select", selNode.target);
            }
            //查找未分配的分类
            var unNode = $("#knowTreeSetting").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });

    $scope.initOption = function (data) {
        if (data.id == 1 || data.id == 2 || data.id == 4) {
            var right = 0;
            if (data.id == 4) {
                right = 1;
            }
            $scope.selRow.option = [{
                "option_sequence": 1,
                "option_context": null,
                "option_right": right,
            }]
        }
    }

    $scope.settings = function () {
        $scope.curriculumData = null;
        $("#chaTreeSetting").tree("loadData", []);
        $("#knowTreeSetting").tree("loadData", []);
        $scope.subSetting.grade_name = null;
        $scope.subSetting.grade_id = null;
        $scope.subSetting.specialty_name = null;
        $scope.subSetting.specialty_id = null;
        $scope.subSetting.curriculum_name = null;
        $scope.subSetting.curriculum_id = null;
        $scope.subSetting.chapter_name = null;
        $scope.subSetting.chapter_id = null;
        $scope.subSetting.know_name = null;
        $scope.subSetting.know_id = null;
        ids = new Array();
        angular.forEach($scope.subjectList, function (item, index) {
            ids.push(item.id)
        });
        if (ids.length == 0) {
            layer.msg("请选择要设置属性的试题");
            return !1;
        }
        //打开层
        $scope.layer_export = layer.open({
            type: 1,
            title: "",
            area: ["700px", "600px"],
            content: $("#subject_setting")
        });
    };

    $scope.save_setting = function () {
        // if(!$scope.subSetting.grade_name){
        //     layer.msg("请选择年级");
        //     return false;
        // }
        // if(!$scope.subSetting.specialty_name){
        //     layer.msg("请选择专业");
        //     return false;
        // }
        if (!$scope.subSetting.curriculum_name) {
            layer.msg("请选择课程");
            return false;
        }
        // if(!$scope.subSetting.chapter_name){
        //     layer.msg("请选择章节");
        //     return false;
        // }
        if (!$scope.subSetting.know_name) {
            layer.msg("请选择知识点");
            return false;
        }
        if (!$scope.subSetting.subject_level_name) {
            layer.msg("请选择难易度");
            return false;
        }

        var settingParam = {
            grade_id: $scope.subSetting.grade_id,
            specialty_id: $scope.subSetting.specialty_id,
            curriculum_id: $scope.subSetting.curriculum_id,
            chapter_id: $scope.subSetting.chapter_id,
            know_ids: $scope.subSetting.know_id,
            subject_level: $scope.subSetting.subject_level,
            ids: ids
        }

        services._sub_setting(settingParam).success(function (res) {
            if (res.code == 0) {
                $scope.subSetting = {};
                $scope.all_load();
                layer.close($scope.layer_export);
            } else {
                layer.alert(res.message);
            }
        })
    }

    //查询分配参数
    $scope.fenpeiParam = {
        subject_id: null,
        searchtext: null,
        pageNum: 1,
        pageSize: 10,
        pages: 1
    }

    $scope.fenpeiParamCol = {
        searchtext: null
    }

    //数据列表
    $scope.fenpeiDataArray = null;
    //获取分配结构数据列表
    $scope._fenpeiData = function (num) {
        if (num) {
            $scope.fenpeiParam.pageNum = num;
        }
        else {
            $scope.fenpeiParam.pageNum = 1;
            $scope.fenpeiParam.searchtext = $scope.fenpeiParamCol.searchtext;
        }
        services._sub_fenpei_list($scope.fenpeiParam).success(function (res) {
            $scope.fenpeiDataArray = res.data.rows;
            //更新总页数
            $scope.fenpeiParam.pages = res.data.pages;
        })
    }

    //添加分配
    $scope.add_cat_org = function (row) {
        row.subject_id = $scope.fenpeiParam.subject_id;
        var ids = new Array();
        if (row.subject_id) {
            ids = new Array();
            ids.push(row.subject_id);
        }
        services._add_sub_bank({ids: ids, id: row.id}).success(function (res) {
            if (res.code == 0) {
                layer.close($scope.layer_export);
                $scope.all_load();
                $scope._fenpeiData($scope.fenpeiParam.pageNum);
            } else {
                layer.msg(res.message);
                $scope.all_load();
            }
        })
    }
    //移除分配
    $scope.remove_org_cat = function (row) {
        services._remove_sub_bank(row).success(function (res) {
            if (res.code == 0) {
                $scope.all_load();
                $scope._fenpeiData($scope.fenpeiParam.pageNum);
            }
            else {
                layer.msg(res.message);
                $scope.all_load();
            }
        })

    }

    //预览
    $scope.knowSub = function (data, index) {
        console.log(data);
        $scope.selRow_all = data;
        $scope.selRow_all['now_index'] = index;
        if (data.subjectList) {
            $scope.parent_id = data.id;
            $scope.selRows_all = data.subjectList;
        }

        if (!$scope.selList_tf) {
            $scope.formOpen1();
        }

    }
    $scope.replacehtml = function (html) {
        return html ? html.replace(/vertical-align:text-bottom;/g, "") : html;
    };

    //上一题
    $scope.see_add = function (data) {
        if (data.now_index == 0) {
            if ($scope.all_param.pageNum == 1) {
                layer.msg("已经是最新的一题了")
            } else {
                $scope.all_param.pageNum = $scope.all_param.pageNum - 1;
                $scope.up_tf = true;
                $scope.all_load();

            }
        } else {
            data.now_index = data.now_index - 1
            $scope.selRow_all = $scope.subjectList[data.now_index];
            $scope.selRow_all.now_index = data.now_index;
            if (data.subjectList) {
                $scope.parent_id = $scope.subjectList[data.now_index].id;
                $scope.selRows_all = $scope.subjectList[data.now_index].subjectList;
            }
        }
    }
    //下一题
    $scope.see_min = function (data) {
        console.log(data);
        if (data.now_index == $scope.subjectList.length - 1) {
            if ($scope.all_param.pageNum == $scope.all_pages) {
                layer.msg("已经是最后的一题了")
            } else {
                $scope.all_param.pageNum = $scope.all_param.pageNum + 1;
                $scope.down_tf = true;
                $scope.all_load();
            }
        } else {
            data.now_index = data.now_index + 1;
            $scope.selRow_all = $scope.subjectList[data.now_index];
            $scope.selRow_all.now_index = data.now_index;
            if ($scope.selRow_all.subjectList) {
                $scope.parent_id = $scope.subjectList[data.now_index].id;
                $scope.selRows_all = $scope.subjectList[data.now_index].subjectList;
            }
        }
    }


    //调整难易度
    $scope.levelList = [
        {"id": 1, "text": "基础题"},
        {"id": 2, "text": "中等题"},
        {"id": 3, "text": "较难题"}];
    $scope.selLevel = function (data) {
        angular.forEach($scope.levelDatas, function (item, index) {
            if (item.id != data.id) {
                item.check = false;
            } else {
                item.check = true;
            }
        })
        $scope.selRow.subject_level = data.id;
    }

    //章节、知识点
    $scope._update_get = function () {
        $scope._updateSub = {
            struct_curriculum: $scope.now_selRow.curriculum
            // grade:$scope.now_selRow.grade,
            // specialty:$scope.now_selRow.specialty
        }
        // services._get_getChapter($scope._updateSub).success(function (res) {
        //     if(res.code==0){
        //         $("#selchaTree").tree("loadData", res.data);
        //     }
        // })
        //获取知识点
        services._get_getKnowledge($scope._updateSub).success(function (res) {
            if (res.code == 0) {
                $("#selknowTree").tree("loadData", res.data);
            }
        })
    }
    //新增 大题
    $scope.addRow = function () {
        $state.go("subjectAdd");
    }


    $scope.optionList = [];
    $scope.opt = [];
    //大题调整
    $scope.updateSub = function (id) {
        $scope._level_answer = null;
        $scope.now_selRow = {
            curriculum: null,
            // grade:[],
            // specialty:[]
        }
        services._sub_detail({id: id}).success(function (res) {
            if (res.code == 0) {
                $scope.selRow = res.data;
                //课程
                angular.forEach($scope._curriculumData, function (item, index) {
                    item.check = false;
                    if ($scope.selRow.subject_curriculum == item.id) {
                        item.check = true;
                        $scope.now_selRow.curriculum = $scope.selRow.subject_curriculum;
                    }
                });
                $scope.selRow.subject_curriculum = $scope.now_selRow.curriculum;
                //匹配题型
                var data = dataService.data;
                angular.forEach(data, function (item, index) {
                    if ($scope.selRow.subject_type == item.id) {
                        $scope.selRow.subTypeName = item.name
                    }
                })
                $scope._update_get();

                //难易度
                angular.forEach($scope.levelDatas, function (item, index) {
                    item.check = false;
                    if ($scope.selRow.subject_level == item.id) {
                        item.check = true;
                    }
                })
                // if ($scope.selRow.old_subject_type == 11 ||$scope.selRow.old_subject_type == 12  ||$scope.selRow.old_subject_type == 13 ||$scope.selRow.old_subject_type == 14 ||$scope.selRow.old_subject_type == 15) {
                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="background: #c4c4c4;padding: 5px;"><span class="subject_question">【题干】' + $scope.selRow.subject_question + '</span></p>'));
                //答案
                if ($scope.selRow.subject_answer != '' && $scope.selRow.subject_answer != null) {
                    $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="background: #c4c4c4;padding: 5px;"><span class="subject_answer">【答案】' + $scope.selRow.subject_answer + '</span></p>', true))
                }
                //解析
                if ($scope.selRow.subject_analysis != '' && $scope.selRow.subject_analysis != null) {
                    $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="background: #c4c4c4;padding: 5px;"><span class="subject_analysis">【解析】' + $scope.selRow.subject_analysis + '</span></p>', true));
                }

                // }else{
                //     $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p ><span class="subject_question">【题干】' + $scope.selRow.subject_question + '</span></p>'));
                // }
                $rootScope.formOpen();
                angular.forEach($scope.levelData, function (item, index) {
                    if ($scope.selRow.subject_level == item.id) {
                        $scope.selRow.subject_level_name = item.text;
                    }
                });
            } else {
                layer.alert(res.message);
            }
        })
    };


    $("#selchaTree").tree({
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onClick": function (node) {
            $scope.selRow.subject_chapter = node.id;
            $scope.selRow.chapter_name = node.text;
        },
        "onSelect": function (node) {
            // $scope.selRow.subject_chapter = node.id;
            // $scope.selRow.chapter_name = node.text;
            $(".layui-form-selected").removeClass("layui-form-selected")
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
        lines: true,
        checkbox: true,
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onClick": function (node) {
            var nodes = $(this).tree('getChecked');

            var select_check = $("#selknowTree").tree("find", node.id);
            if (select_check.checkState == "unchecked") {
                $("#selknowTree").tree("check", select_check.target);
            } else {
                $("#selknowTree").tree("uncheck", select_check.target);
            }
        },
        "onCheck": function (node) {
            console.log($scope.selRow)
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
            //     $("#selknowTree").tree("uncheck",node.target)
            //     layer.msg("只能同时选择三个知识点")
            // }
        },
        onSelect: function (node) {
            console.log(node);
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
                // $("#selknowTree").tree("select", selNode.target);
                var solNode = $("#selknowTree").tree('getChildren');
                var aolNode = {};
                var now_knowledges = $scope.selRow.subject_knowledge.split(",").map(function (data) {
                    return +data
                });
                for (var k in solNode) {
                    if (now_knowledges.indexOf(solNode[k].id) != -1) {
                        solNode[k].checkState = "check";
                        aolNode = $("#selknowTree").tree("find", solNode[k].id);
                        $("#selknowTree").tree("check", aolNode.target);
                    }
                }
            }

            //查找未分配的分类
            var unNode = $("#selknowTree").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });


    //提交
    $scope._form_submit = function (bool) {
        if (!$scope.selRow.subject_knowledge) {
            layer.alert("请选择知识点")
            return false;
        }

        if (!$scope.selRow.subject_level_name) {
            layer.alert("请填写难易度")
            return false;
        }
        var context = null;
        context = document.getElementById('myIframe2').contentWindow.ue.getContent();
        $scope.selRow.opContext = []
        $scope.selRow.opContext = context;
        services._add_sub($scope.selRow).success(function (res) {
            if (res.code == 0) {
                $rootScope.formClose();
                $scope.all_load();
                if ($scope.parent_id) {
                    $scope.parent_id = null;
                }
                layer.msg(res.message);
            }
            else {
                layer.msg(res.message);
            }
        })
    }
    //删除
    $scope.delRow = function (id) {
        var ids = new Array();
        ids.push(id)

        layer.confirm('删除后数据无法找回,确认删除吗？', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            services._del_sub({ids: ids}).success(function (res) {
                if (res.code == 0) {
                    layer.msg("删除成功")
                    $scope.formClose1();
                } else {
                    layer.msg(res.message)
                }
            })
        })

    };

    $scope.selectClick = function (data) {
        var answer_list = []
        angular.forEach($scope._level_answer, function (item, index) {
            if (item.check) {
                answer_list.push(item.answer);
            }
        })
        $scope.selRow.subject_answer = answer_list.toString();

    }


    //新增子题
    $scope.CaddRow = function (id) {
        $scope.formOpen3();
        $("#form_content3 .form_btns>button").eq(1).show();
        $scope.selList = {};
        $scope.show_update = false;
        $scope.show_addRow = true;
        $scope.status = true;
        document.getElementById('CmyIframe2').contentWindow.ue.setContent('')
        // services._sub_detail({id:$scope.parent_id}).success(function (res) {
        services._sub_detail({id: id}).success(function (res) {

            if (res.code == 0) {
                //课程
                $scope.selList.subject_curriculum = res.data.subject_curriculum;
                $scope.selList.curriculum_name = res.data.curriculum_name;
                angular.forEach($scope.curriculumData, function (item, index) {
                    if (item.id == $scope.selList.subject_curriculum) {
                        $scope.childTypeList = item.children;
                        $scope.childSubList = angular.copy($scope.childTypeList)
                    }
                })

                //知识点
                $scope.selList.subject_knowledge = res.data.subject_knowledge;
                $scope.selList.know_name = res.data.know_name;
                //默认题型
                $scope.CinitOption($scope.childSubList[0])
                //难易度
                $scope.selList.subject_level = res.data.subject_level;
            } else {
                layer.alert(res.message);
            }
        })
    }


    //子题修改
    $scope.CupdateSub = function (id) {
        $scope.formOpen3();
        $("#form_content3 .form_btns>button").eq(1).hide();
        $scope.show_update = true
        $scope.show_addRow = false
        $scope._level_answer = null;
        services._sub_detail({id: id}).success(function (res) {
            if (res.code == 0) {
                $scope.selList = res.data;
                $scope.status = false;

                //匹配题型
                var data = dataService.data;
                angular.forEach(data, function (item, index) {
                    if ($scope.selList.subject_type == item.id) {
                        $scope.selList.subTypeName = item.name
                    }
                })

                // if ($scope.selList.old_subject_type == 11 ||$scope.selList.old_subject_type == 12  ||$scope.selList.old_subject_type == 13 ||$scope.selList.old_subject_type == 14 ||$scope.selList.old_subject_type == 15) {
                $(document.getElementById('CmyIframe2').contentWindow.ue.setContent('<p ><span class="subject_question">【题干】' + $scope.selList.subject_question + '</span></p>'));
                //答案
                $(document.getElementById('CmyIframe2').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_answer">【答案】' + $scope.selList.subject_answer + '</span></p>', true))
                //解析
                $(document.getElementById('CmyIframe2').contentWindow.ue.setContent('<p ><span class="subject_analysis">【解析】' + $scope.selList.subject_analysis + '</span></p>', true));
                // }else{
                //     $(document.getElementById('CmyIframe2').contentWindow.ue.setContent('<p ><span class="subject_question">【题干】' + $scope.selList.subject_question + '</span></p>'));
                // }
                angular.forEach($scope.levelData, function (item, index) {
                    if ($scope.selList.subject_level == item.id) {
                        $scope.selList.subject_level_name = item.text;
                    }
                });
            } else {
                layer.alert(res.message);
            }
        })
    };

    $scope.formOpen1 = function () {
        $("#form_content1").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");
    }

    $scope.formOpen3 = function () {
        $("#form_content3").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");
    }

    $scope.formClose1 = function () {
        $("#form_content1").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
        $scope.parent_id = null;
        // $scope.reload();

    }
    $scope.formClose3 = function () {
        $("#form_content3").removeClass("fadeInRightBig").addClass("fadeOutRightBig");

    }


    //子题清除
    $scope.CdelRow = function (id) {
        console.log(id);
        var ids = [];
        ids.push(id);
        // var ids = $scope.ids;
        if (ids.length == 0) {
            layer.alert("请选择你将要删除的数据");
        }
        else {
            layer.confirm('删除后数据无法找回,确认删除吗？', {
                btn: ['确定', '取消'] //按钮
            }, function () {
                services._del_sub({ids: ids}).success(function (res) {
                    if (res.code == 0) {
                        $scope.selList_tf = true;
                        $scope.all_load();
                        layer.msg("删除成功")
                    } else {
                        layer.msg(res.message)
                    }
                })
            })
        }
    }

    $scope.end_data = null;
    //子题题型选择
    $scope.CinitOption = function (data) {
        $scope._level_answer = null;
        angular.forEach($scope.childSubList, function (item, index) {
            if (item.id != data.id) {
                item.check = false;
            } else {
                item.check = true;
            }
        });
        $scope.selList.subject_type = data.id;
        $scope.end_data = data;
        // if(data.dic_typepid == 11 || data.dic_typepid == 12 || data.dic_typepid == 13 || data.dic_typepid == 14 || data.dic_typepid == 15){
        $(document.getElementById('CmyIframe2').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_question">【题干】</span></p>'));
        $(document.getElementById('CmyIframe2').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_answer">【答案】</span></p>', true))
        $(document.getElementById('CmyIframe2').contentWindow.ue.setContent('<p ><span class="subject_analysis">【解析】</span></p>', true));
        // }
        // if(data.dic_typepid ==16 || data.dic_typepid ==17 ){
        //     $(document.getElementById('CmyIframe2').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_question">【题干】</span></p>'));
        // }

    }

    //分数判断
    $scope.show_socre = function (i) {
        $scope.selRow.subject_marks = i.replace(/\D/g, '');
    }
    //提交
    $scope.C_form_submit = function (bool) {
        var context = null;
        context = document.getElementById('CmyIframe2').contentWindow.ue.getContent();
        $scope.selList.opContext = []
        $scope.selList.opContext = context;
        $scope.selList.subject_pid = $scope.parent_id;
        services._add_sub($scope.selList).success(function (res) {
            if (res.code == 0) {
                if (bool) {
                    $scope.CinitOption($scope.end_data);
                    layer.msg('保存成功');
                } else {
                    $scope.selList = {};
                    layer.msg('保存成功');
                    $scope.selList_tf = true;
                    $scope.all_load();
                    $scope.formClose3();
                }
            }
            else {
                layer.msg(res.message);
            }
        })
    }

    $("#CselchaTree").tree({
        // lines: true,
        // checkbox: true,
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            $scope.selRow.subject_chapter = node.id;
            $scope.selRow.chapter_name = node.text;
            $(".layui-form-selected").removeClass("layui-form-selected")
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#CselchaTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#CselchaTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#CselchaTree").tree("getRoot");
            }
            if (selNode) {
                $("#CselchaTree").tree("check", selNode.target);
            }

            //查找未分配的分类
            var unNode = $("#CselchaTree").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });

    $("#CselknowTree").tree({
        lines: true,
        checkbox: true,
        onlyLeafCheck: true,
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onClick": function (node) {
            var nodes = $(this).tree('getChecked');
            // if(nodes.length > 3){
            //     $("#CselknowTree").tree("uncheck",node.target)
            //     layer.msg("只能同时选择三个知识点")
            // }
            var select_check = $("#CselknowTree").tree("find", node.id);
            if (select_check.checkState == "unchecked") {
                $("#CselknowTree").tree("check", select_check.target);
            } else {
                $("#CselknowTree").tree("uncheck", select_check.target);
            }
        },
        "onSelect": function (node) {
            // $scope.selRow.know_id = node.id;
            // $scope.selRow.know_name = node.text;
            // $(".layui-form-selected").removeClass("layui-form-selected")
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
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#CselknowTree").tree("getRoot");
            }
            if (selNode) {
                if ($scope.selRow.subject_knowledge == "") {
                    $("#CselknowTree").tree("select", selNode.target);

                } else {
                    if ($scope.selRow.subject_knowledge == null) {
                        $("#CselknowTree").tree("select", selNode.target);
                    } else {
                        var ids_str = $scope.selRow.subject_knowledge;
                        var all_ids = []
                        all_ids = ids_str.split(",");
                        for (i = 0; i < all_ids.length; i++) {
                            all_ids[i] = parseInt(all_ids[i]);
                        }

                        for (var i = 0; i < all_ids.length; i++) {
                            var molNode = $("#CselknowTree").tree("find", all_ids[i]);
                            $("#CselknowTree").tree("check", molNode.target)
                        }
                    }

                }
            }
            //查找未分配的分类
            var unNode = $("#CselknowTree").tree("find", -1);
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

    $scope.selBank = {};
    var ids;
    //选择题库
    $scope.joinBank = function (id) {
        $scope.fenpeiDataArray = null;
        $scope.fenpeiParam.subject_id = null;

        ids = new Array();
        ids.push(id);
        $scope.fenpeiParam.subject_id = ids[0];

        $scope.selBank.bank_name = null;
        $scope.selBank.bank_id = null;
        //打开层
        $scope.layer_export = layer.open({
            type: 1,
            title: "",
            area: ["700px", "600px"],
            content: $("#question_bank")
        });
        //执行查询
        $scope._fenpeiData();
    }

    $scope.add_bank = function () {
        services._add_bank({ids: ids, bank_id: $scope.selBank.bank_id}).success(function (res) {
            console.log(res);
            if (res.code == 0) {
                layer.msg(res.message);
                layer.close($scope.layer_export);
                $scope.reload();
            }
            else {
                layer.msg(res.message);
            }
        })
    }

    $scope.replacehtml = function (html) {
        return html ? html.replace(/vertical-align:text-bottom;/g, "") : html;
    }

});