var row_update, showSee;
myApp.controller('tempPaperController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    $scope.services = services;
    //列表
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/template/getPageList1', param, "POST");
    };
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
    //复制模板信息
    services["_copy_template"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/template/copyTemplate', param, "POST");
    }
    //模板是否启用
    services["_temp_isOpen"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/template/isOpen', param, "POST");
    }

    //列表参数
    $scope.param = {
        pageNum: 1,
        pageSize: 10,
        type: null,//题型
        subject_level: 0,//难易度
        bank_id: 0,//题库
        subject_knowledge: 0,//知识点
        subject_curriculum: 0, //课程
        searchText: '',
        subject_ids: []
    }
    //模板配置
    $scope.template = null;
    $scope.xt = null;
    $scope.dt = null;
    $scope.tree_curriculum = 10039;
    $scope.now_knowledge = null;
    //试卷类型
    $scope.categoryData = [];
    //试卷类别
    services._dic_list({
        pageNum: 1,
        pageSize: 1000,
        dic_parentcode: 70000
    }).success(function (res) {
        $scope.categoryData = res.data;
    })
    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                total: 0,
                pageNum: 1,
                searchText: null,
                bank_id: 0 //题库
            },
            columns: [
                {field: 'template_title', title: " 模板标题", align: 'left'},
                {field: 'type_name', title: " 试卷类别"},
                {field: 'test_total', title: "总分"},
                {field: 'test_pass', title: "及格分数"},
                {field: 'test_long', title: "时长(分钟)"},
                {
                    field: 'id', title: "操作",
                    formatter: function (value, row, index) {
                        if ($rootScope.getBtnToken('tempPaper_config'))
                            return '<a onclick="showSee(\'' + row.id + '\',+\'' + row.template_curriculum + '\')" style="margin-right: 20px">试题配置</a>';
                        else
                            return null
                    }
                },
                {
                    field: 'is_open', title: "启用状态",
                    formatter: function (value, row, index) {

                        var bool = row.is_open == 1 ? 'layui-form-onswitch' : '';
                        return '<div class="layui-unselect layui-form-switch ' + bool + '" onclick="startTemp(' + row.id + ', event)"><i></i></div>';
                    }
                }
            ]
        },
        reload: function (param) {
            services._sub_list(param).success(function (res) {
                $scope.tableControl.loadData(res.data);

            })
        }
    };

    //模板启用---停用
    startTemp = function(id){
        services._temp_isOpen({id:id}).success(function (res) {
            if(res.code==0){
                layer.msg(res.message);
                $scope.reload();
            }else{
                layer.msg(res.message);
            }
        })
    };
    //课程
    $scope.curriculumData = null;
    //题型
    $scope.subTypeList = null;
    services._dic_list({
        pageNum: 1,
        pageSize: 1000,
        dic_parentcode: 30000
    }).success(function (res) {
        $scope.curriculumData = res.data;
    });
    //选择课程
    $scope.setExamCurriculum = function (dati, item) {
        if (dati.subject_curriculum != item.id) {
            dati.subject_curriculum = item.id;
            dati.subject_curriculum_name = item.dic_name;

            dati.subject_type = null;
            dati.subject_type_name = null;
            dati.xiaotiList = [];
            dati.subject_amount = null;
            dati.subject_marks = null;
            dati.marks = null;

            $scope.subTypeList = [];
            angular.forEach($scope.curriculumData, function (kc) {
                if (kc.id == dati.subject_curriculum) {
                    angular.forEach(kc.children, function (tx) {
                        $scope.subTypeList.push(tx);
                    })
                }
            })
        }
    }
    //选择题型
    $scope.setExamType = function (dati, item) {
        dati.subject_type = item.id;
        dati.subject_type_name = item.dic_name;
    }
    //重新查询
    $scope.reload = function () {
        $scope.tableControl.config.param["curriculum"] = $scope.param.curriculum;
        $scope.tableControl.config.param["paper_type"] = $scope.param.paper_type;
        $scope.tableControl.config.param["searchText"] = $scope.param.searchText;
        $scope.tableControl.reload($scope.tableControl.config.param);
    }
    //清空
    $scope.Dreload = function () {
        $scope.param.paper_type = null;
        $scope.param.paper_type_name = null;
        $scope.param.searchText = null
        $scope.reload();
    };
    //新增模板
    $scope.addTemplate = function () {
        $scope.template = {};
        $rootScope.formOpen();
    };
    //修改
    $scope.updateTemplate = function () {
        var ids = [];
        var id = null;
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                ids.push($scope.tableControl.data[item.index].id);
                id = $scope.tableControl.data[item.index].id;
                $scope.template = $scope.tableControl.data[item.index];
            }
        });
        if (ids.length == 0) {
            layer.alert("请选择你将要修改的数据");
            return false
        }
        if (ids.length > 1) {
            layer.alert("只能选择一条数据进行修改");
            return false
        }
        $rootScope.formOpen();
    };

    //复制模板
    $scope.copyTemplate = function(){
        var ids = [];
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                ids.push($scope.tableControl.data[item.index].id);
            }
        });
        if(ids.length==0 ){
            layer.msg("请选择一个模板")
            return false;
        }else if(ids.length==1){
            $scope._bank_param = {}
            $scope.expored = layer.prompt({
                formType: 0,
                title: '请输入题库名称',
            }, function (value, index, elem) {
                $scope._bank_param.bank_title = value;
                if (!$scope._bank_param.bank_title) {
                    layer.msg("请填写题库标题");
                    return false;
                }
                services._copy_template({id:ids[0],template_title:$scope._bank_param.bank_title}).success(function (res) {
                    if (res.code == 0) {
                        $scope.reload();
                        layer.close($scope.expored);
                        layer.msg(res.message);
                    } else {
                        layer.msg(res.message);
                    }

                })
            });

        }else{
            layer.msg("只能选择一个模板")
            return false;
        }
    }

    //生成模板提交
    $scope.templateSubmit = function () {
        if (!$scope.template.template_title) {
            layer.msg('请填写模板标题');
            return !1;
        }
        if (!$scope.template.template_type) {
            layer.msg('请选择试卷类别');
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
        if (!$scope.template.test_pass) {
            layer.msg('请填写及格分数');
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
        if (ids.length == 0) {
            layer.alert("请选择你将要删除的数据");
        } else {
            layer.confirm('删除后数据无法找回,确认删除吗？', {
                btn: ['确定', '取消'] //按钮
            }, function () {
                services._del_template({
                    ids: ids
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
                                ids: ids
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
    showSee = function (id, curriculum) {
        services._open_Subject({id: id}).success(function (res) {
            if (res.data.templateDetailCondition.datiList.length == 0) {
                $scope.addMaxExam(res.data.templateDetailCondition.datiList);
            }
            else {
                angular.forEach(res.data.templateDetailCondition.datiList, function (item) {
                    item.subject_type_name = $scope._get_exam_name_byid(item.subject_curriculum, item.subject_type);
                    item.subject_curriculum_name = $scope._get_curriculum_name(item.subject_curriculum);
                    item.subject_amount = item.xiaotiList.length ? item.xiaotiList.length : null;
                    item.marks = parseInt((parseInt(item.subject_marks) / item.xiaotiList.length));
                })
            }
            $scope.template = res.data;
            console.log($scope.template.templateDetailCondition.datiList)
        })
        $rootScope.formOpen3();
        $scope.loadTree(curriculum ? curriculum.toString().split(',')[0] : '10039');
    }
    //加载知识点
    $scope.loadTree = function (curriculum) {
        $scope.tree_curriculum = curriculum;
        services._get_getKnowledge({struct_curriculum: curriculum}).success(function (res) {
            var data = res.data;
            $scope.knowledge = res.data;
            var allData = [{
                struct_name: "全部",
                id: 0,
                children: data
            }]
            $("#selknowTree2").tree("loadData", allData);
        })
    }
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
        "onCheck": function (node) {
            if ($scope.xt) {
                var nodes = $(this).tree('getChecked');
                var str = '';
                var ids = '';
                for (var i = 0; i < nodes.length; i++) {
                    if (str != '') {
                        str += ', ';
                    }
                    str += nodes[i].text;
                    if (ids != '') {
                        ids += ',';
                    }
                    ids += nodes[i].id;
                }
                $scope.xt.know_name = str;
                $scope.xt.subject_knowledge = ids;
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
        if ($scope.xt && $scope.xt.subject_knowledge) {
            if ($scope.xt.subject_knowledge.indexOf(treeNode.id) != -1)
                treeNode["checked"] = true;
            else
                treeNode["checked"] = false;
        }
        else {
            treeNode["checked"] = false;
        }
    }

    //添加大题
    $scope.addMaxExam = function (arr) {
        arr.push({
            chapter_name: null,
            curr_name: null,
            id: null,
            know_name: null,
            p_id: null,
            subject_chapter: null,
            subject_curriculum: null, //课程
            subject_knowledge: null, //知识点
            subject_amount: null, //小题数量
            marks: null, //小题分数
            subject_level: null,
            subject_marks: null,
            subject_remark: null,
            subject_sort: null,
            subject_type: null,
            templateDetailList: null,
            template_id: null,
            template_subid: null,
            xiaotiList: []
        })
    }
    //删除大题
    $scope.removeMaxExam = function (dati) {
        $scope.template.templateDetailCondition.datiList.splice($scope.template.templateDetailCondition.datiList.indexOf(dati), 1);
    }
    //新增小题
    $scope.addSmallExam = function (dati) {
        console.log(dati.subject_amount)
        dati.subject_marks = 0;
        dati.xiaotiList = [];
        if (dati.subject_amount) {
            if (dati.xiaotiList.length < dati.subject_amount) {
                for (var i = (dati.subject_amount - dati.xiaotiList.length); i > 0; i--) {
                    dati.xiaotiList.push({
                        chapter_name: null,
                        curr_name: null,
                        id: null,
                        know_name: null,
                        p_id: null,
                        subject_chapter: null,
                        subject_curriculum: null,
                        subject_knowledge: null,
                        subject_level: null,
                        subject_marks: dati.marks,
                        subject_remark: null,
                        subject_sort: null,
                        subject_type: null,
                        templateDetailList: null,
                        template_id: null,
                        template_subid: null,
                        xiaotiList: null
                    });
                    if (dati.marks) {
                        dati.subject_marks += dati.marks;
                    }
                }
            }
        }
    }
    //修改大题分数
    $scope.changeMarks = function (dati) {
        dati.subject_marks = 0;
        angular.forEach(dati.xiaotiList, function (xiaoti, index) {
            xiaoti.subject_marks = dati.marks;
            dati.subject_marks += xiaoti.subject_marks;
        })
    }
    //修改小题分数
    $scope.changeSmallMarks = function (dati) {
        dati.subject_marks = 0;
        angular.forEach(dati.xiaotiList, function (xiaoti, index) {
            if (xiaoti.subject_marks && !isNaN(xiaoti.subject_marks))
                dati.subject_marks += parseInt(xiaoti.subject_marks);
        })
        dati.marks = parseInt(dati.subject_marks / dati.xiaotiList.length);
    }
    //选中小题
    $scope.selectXiaoti = function (xiaoti, dati) {
        $scope.xt = xiaoti;
        if ($scope.tree_curriculum == dati.subject_curriculum) {
            $("#selknowTree2").tree("loadData", $scope.knowledge);
        }
        else if (dati.subject_curriculum) {
            $scope.loadTree(dati.subject_curriculum)
        }
    }
    $scope.selectDati = function (dati) {
        $scope.dt = dati;
        if (dati.subject_curriculum && $scope.tree_curriculum != dati.subject_curriculum) {
            $scope.loadTree(dati.subject_curriculum);
        }
    };
    //上换题
    $scope.upMaxExam = function(data,index){
        $scope.template.templateDetailCondition.datiList.splice(index,1,$scope.template.templateDetailCondition.datiList[index-1]);
        $scope.template.templateDetailCondition.datiList.splice(index-1,1,data)
    }
    //下换题
    $scope.downMaxExam = function(data,index){
        $scope.template.templateDetailCondition.datiList.splice(index,1,$scope.template.templateDetailCondition.datiList[index+1]);
        $scope.template.templateDetailCondition.datiList.splice(index+1,1,data);
    }
    //保存
    $scope.subjectSubmit = function () {
        $('#template_save').click();
    }
    $scope.subjectSubmitToForm = function () {
        //课程
        var tempType = null;
        angular.forEach($scope.template.templateDetailCondition.datiList, function (dati) {
            if (tempType && tempType.toString().indexOf(dati.subject_curriculum) == -1) {
                tempType += ',' + dati.subject_curriculum;
            }
            else {
                tempType = dati.subject_curriculum;
            }
        })
        var param = {
            template_id: $scope.template.id,
            //tempType: tempType ? tempType.toString().split(',') : [],
            datiList: $scope.template.templateDetailCondition.datiList
        }
        services._save_Subject(param).success(function (res) {
            if (res.code == 0) {
                layer.msg('生成成功');
                $rootScope.formClose3();
            } else {
                layer.msg(res.message)
            }
        })
    }

    //根据课程ID 题型ID 获取题型名称
    $scope._get_exam_name_byid = function (kcid, txid) {
        var name = null;
        if (kcid && txid) {
            angular.forEach($scope.curriculumData, function (item) {
                if (item.id == kcid) {
                    angular.forEach(item.children, function (st) {
                        if (st.id == txid)
                            name = st.dic_name;
                    })
                }
            })
        }
        return name;
    }
    //根据课程ID 获取课程名称
    $rootScope._get_curriculum_name = function (id) {
        var name = null;
        if (id) {
            angular.forEach($scope.curriculumData, function (item) {
                if (item.id == id)
                    name = item.dic_name;
            })
        }
        return name;
    }
});






