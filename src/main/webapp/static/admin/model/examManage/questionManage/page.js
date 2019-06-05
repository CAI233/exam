var row_update;
myApp.controller('questionManageController', function ($rootScope, $scope, services, $sce, $stateParams, $state,dataService) {
    if (!$stateParams || !$stateParams.id) {
        $state.go("questionBank");
    }
    $scope.services = services;
    //新增
    services["_add_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/saveSubject', param, "POST");
    }
    //列表
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getBankSubjectList', param, "POST");
    }
    //删除
    services["_del_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/delSubjectDetails', param, "POST");
    }
    //导入
    services["_import_excel"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/excelImport/importSubject', param, "POST");
    }
    // //分类树
    // services["_dic_tree"] = function (param) {
    //     return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/getDicTree', param, "POST");
    // }

    //分类树---章节
    // services["_get_getChapter"] = function (param) {
    //     return $rootScope.serverAction(ctxPath + '/admin/struct/getChapter', param, "POST");
    // }
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

    //学校题库列表
    services["_all_Banklist"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/schoolQuestionBank', param, "POST");
    }

    // 下载模板
    $scope.load_model = function () {
        var src = ctxPath + "/static/excelFile/temple.doc";
        var iframe = $('<iframe style="display: none" src="' + src + '?v=' + (new Date()).getTime().toString() + '"></iframe>');
        $("#questionManage").append(iframe);
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
                pid:0,
                bank_id: $stateParams.id
            },
            columns: [
                {
                    field: 'subject_type_name', title: "题型",
                    formatter: function (value, row, index) {
                        var data = dataService.data;
                        angular.forEach(data,function(item,index){
                            if(item.id == row.subject_type){
                                row.subject_type_name = item.name
                            }
                        })
                        return row.subject_type_name;
                    }
                },
                {
                    field: 'subject_level_name', title: "难易度", formatter: function (value, row, index) {
                    var level = dataService.level;
                    angular.forEach(level,function(item,index){
                        if(item.id == row.subject_level){
                            row.subject_level_name = item.text
                        }
                    })
                    return row.subject_level_name;
                }
                },
                // {field: 'subject_marks', title: "分数"},
                {field: 'subject_title', title: "题目标题", align: 'left', formatter: function (value, row, index) {
                   var res = value.replace(/<[^>]+>/g,"");
                    return res.substring(0,20);
                }},
                {field: 'id', title: "预览", align: 'left',formatter: function (value, row, index) {
                    if($stateParams.id == 0){
                        value = '<a onclick="knowSub(\''+row.id+'\')" style="margin-right: 20px;">预览</a>'
                        return value;
                    }else{
                        value = '<a onclick="knowSub(\''+row.id+'\')" style="margin-right: 20px;">预览</a>'+
                            '<a onclick="delSub(\''+row.id+'\')">删除</a> ';
                        return value;
                    }

                }}
            ]
        },
        reload: function (param) {
            if($scope.tableControl.config.param.bank_id == 0){
                $scope.banksTitle = '学校题库'
                services._all_Banklist(param).success(function (res) {
                    $scope.tableControl.loadData(res.data);
                    console.log(res);
                })
            }else{
                $scope.banksTitle = '个人题库'
                services._sub_list(param).success(function (res) {
                    $scope.tableControl.loadData(res.data);
                })
            }

        }
    };
    delSub = function (id){
        var ids = new Array();
        ids.push(id)
        if (ids.length == 0) {
            layer.alert("请选择你将要移除的试题");
        }
        else {
            layer.confirm('本试题将移除题库,确认移除吗？', {
                btn: ['确定', '取消'] //按钮
            }, function () {
                services._del_sub({ids: ids, bank_id: $stateParams.id}).success(function (res) {
                    if (res.code == 0) {
                        layer.msg(res.message);
                        $scope.reload();
                    } else {
                        layer.msg(res.message);
                    }
                })
            })
        }
    }

    //预览
    knowSub = function(id){
        services._sub_detail({id: id}).success(function (res) {
            if(res.code==0){
                $scope.selRow = res.data;
                if(res.data.subjectList){
                    $scope.parent_id = id;
                    $scope.selRows = res.data.subjectList;
                }
            }
        })
        $rootScope.formOpen();
    }
    $scope.replacehtml = function (html) {
        return html ? html.replace(/vertical-align:text-bottom;/g,"") : html;
    };

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

    //年级
   //  $scope.grade_param = {
   //      pageNum: 1,
   //      pageSize: 1000,
   //      dic_code: 10000
   //  }
   //  $scope.gradeData = null;
   //  services._dic_list($scope.grade_param).success(function (res) {
   //      $scope.gradeData = res.data.rows;
   //  })
   //
   // //专业
   //  $scope.specialty_param = {
   //      pageNum: 1,
   //      pageSize: 1000,
   //      dic_code: 20000
   //  }
   //  $scope.specialtyData = null;
   //  services._dic_list($scope.specialty_param).success(function (res) {
   //      $scope.specialtyData = res.data.rows;
   //  })

    var selNode = null;

    //课程
    $scope.curriculum_param = {
        pageNum: 1,
        pageSize: 1000,
        dic_parentcode: 30000
    }
    $scope.curriculumData = null;
    services._dic_list($scope.curriculum_param).success(function (res) {
        $scope.curriculumData = res.data;
        $scope.subTypeList =  res.data[0].children;
    })

    $scope.subTypeList = [];//题型
    //选课程
    $scope.selectCurr = function (data) {
        angular.forEach($scope.curriculumData,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
                $scope.subTypeList = item.children;
            }
        })
        $scope.param.curriculum_id = data.id;
        $scope.load();
    }
    //选年级
    // $scope.selectGra = function (data) {
    //     var all_grade_id = [];
    //     angular.forEach($scope.gradeData,function(item,index){
    //         if (item.check) {
    //             all_grade_id.push(item.id);
    //         }
    //     })
    //     $scope.param.grade_id = all_grade_id;
    //     $scope.load();
    // }
    //选专业
    // $scope.selectSpe = function (data) {
    //     var all_specialty_id = [];
    //     angular.forEach($scope.specialtyData,function(item,index){
    //         if (item.check) {
    //             all_specialty_id.push(item.id);
    //         }
    //     })
    //     $scope.param.specialty_id = all_specialty_id;
    //     $scope.load();
    // }
    //章节和知识点
    $scope.load = function(){
        $scope.aparam= {
            struct_curriculum:$scope.param.curriculum_id,
            grade:$scope.param.grade_id,
            specialty:$scope.param.specialty_id
        };
        // $scope.param.chapter_id = null;
        // $scope.param.chapter_name = null;
        $scope.param.know_id = null;
        $scope.param.know_name = null;
        // services._get_getChapter($scope.aparam).success(function (res) {
        //     if(res.code==0){
        //         var arrdata = [];
        //         if (res.data) {
        //             arrdata = res.data;
        //         }
        //         var allData = [{
        //             struct_name: "全部",
        //             id: 0,
        //             children: arrdata
        //         }];
        //         $("#parchaTree").tree("loadData", allData);
        //     }
        // })

        //获取知识点
        services._get_getKnowledge($scope.aparam).success(function (res) {
            if(res.code==0){
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

    //题型
    $scope.selectType = function(data){
        // var all_type = []
        angular.forEach($scope.subTypeList,function(item,index){

            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
                // $scope.param.subject_type = data.id
            }
        })

        $scope.param.subject_type = data.id;
        $scope.reload();
    }
    //章节树
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

    //导入绑定知识点
    $("#parknowTree").tree({
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
            $scope.param.know_id = node.id;
             $scope.param.know_name = node.text;
            $scope.reload();
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

    $scope.now_marks = null;
    $scope.selRow = {}
    //页面操作内容
    $scope.param = {
        subject_type_name: null,
        subject_type: null,
        // grade_name: null,
        // grade_id: null,
        // specialty_name: null,
        // specialty_id: null,
        curriculum_name: null,
        curriculum_id: null,
        // chapter_name: null,
        // chapter_id: null,
        know_name: null,
        know_id: null,
        searchText: null
    }
    //清空
    $scope.rest = function () {
        $scope.curriculumData.some(function(item){item.check=false;});
        // $scope.gradeData.some(function(item){item.check=false;})
        // $scope.specialtyData.some(function(item){item.check=false;})
        $scope.subTypeList.some(function(item){item.check=false;})
        $scope.param.subject_type_name = null;
        $scope.param.subject_type = null;
        // $scope.param.grade_name = null;
        // $scope.param.grade_id = null;
        // $scope.param.specialty_name = null;
        // $scope.param.specialty_id = null;
        $scope.param.curriculum_name = null;
        $scope.param.curriculum_id = null;
        // $scope.param.chapter_name = null;
        // $scope.param.chapter_id = null;
        $scope.param.know_name = null;
        $scope.param.searchText = null;
        $scope.param.know_id = null;
        $scope.tableControl.config.param["subject_type"] = null;
        // $scope.tableControl.config.param["grade_id"] = null;
        // $scope.tableControl.config.param["specialty_id"] = null;
        $scope.tableControl.config.param["curriculum_id"] = null;
        // $scope.tableControl.config.param["chapter_id"] = null;
        $scope.tableControl.config.param["know_id"] = null;
        $scope.tableControl.config.param["searchText"] = null;
        $scope.tableControl.reload($scope.tableControl.config.param);
    }
    //重新查询
    $scope.reload = function () {
        $scope.tableControl.config.param["subject_type"] = $scope.param.subject_type;
        // $scope.tableControl.config.param["grade_id"] = $scope.param.grade_id;
        // $scope.tableControl.config.param["specialty_id"] = $scope.param.specialty_id;
        $scope.tableControl.config.param["curriculum_id"] = $scope.param.curriculum_id;
        // $scope.tableControl.config.param["chapter_id"] = $scope.param.chapter_id;
        $scope.tableControl.config.param["know_id"] = $scope.param.know_id;
        $scope.tableControl.config.param["searchText"] = $scope.param.searchText;
        $scope.tableControl.config.param["pageNum"] = 1;
        $scope.tableControl.reload($scope.tableControl.config.param);
    }

    //选择分类
    $scope.chooseCat = function () {
        // $scope.selectInfo.grade_name = null;
        // $scope.selectInfo.grade_id = null;
        // $scope.selectInfo.specialty_name = null;
        // $scope.selectInfo.specialty_id = null;
        $scope.selectInfo.curriculum_name = null;
        $scope.selectInfo.curriculum_id = null;
        // $scope.selectInfo.chapter_name = null;
        // $scope.selectInfo.chapter_id = null;
        $scope.selectInfo.know_name = null;
        $scope.selectInfo.know_id = null;
        //打开层
        $scope.layer_export = layer.open({
            type: 1,
            title: "",
            area: ["460px", "400px"],
            content: $("#choose_cat")
        });
    }

    $scope.exam_import = function () {
        /*if (!$scope.selectInfo.grade_id) {
            layer.alert("请选择年级！");
            return false;
        } else if (!$scope.selectInfo.specialty_id) {
            layer.alert("请选择专业！");
            return false;
        } else if (!$scope.selectInfo.curriculum_id) {
            layer.alert("请选择课程！");
            return false;
        } else if (!$scope.selectInfo.chapter_id) {
            layer.alert("请选择章节！");
            return false;
        } else if (!$scope.selectInfo.know_id) {
            layer.alert("请选择知识点！");
            return false;
        } else {*/
            $('#excel_upload').click();
        //}
    }

    //文件上传
    $('#excel_upload').prettyFileDoc({
        text: "",
        change: function (res, obj) {
            if (res) {
                if (res.code == 0) {
                    layer.msg("上传成功！")
                } else {
                    layer.msg("上传失败！")
                }
            } else {
                layer.alert("上传失败，请上传doc格式的文件")
            }
            /*services._import_excel({
                data: res.data,
                bank_id: $stateParams.id,
                grade_id: $scope.selectInfo.grade_id,
                specialty_id: $scope.selectInfo.specialty_id,
                curriculum_id: $scope.selectInfo.curriculum_id,
                chapter_id: $scope.selectInfo.chapter_id,
                know_id: $scope.selectInfo.know_id
            }).success(function (res) {
                if (res.code == 0) {
                    layer.msg(res.message);
                    layer.close($scope.layer_export);
                    $scope.reload();
                } else {
                    layer.alert(res.message);
                }
            });*/
        },
        init: function (obj) {
            $(".file-btn-ku", obj).remove();
            $(".file-btn-text", obj).addClass("layui-btn").removeClass("layui-btn-normal").removeClass("layui-btn-primary")
        }
    });

    //删除
    $scope.delRow = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                ids.push($scope.tableControl.data[item.index].id)
            }
        });
        if (ids.length == 0) {
            layer.alert("请选择你将要移除的试题");
        }
        else {
            layer.confirm('本试题将移除题库,确认移除吗？', {
                btn: ['确定', '取消'] //按钮
            }, function () {
                services._del_sub({ids: ids, bank_id: $stateParams.id}).success(function (res) {
                    if (res.code == 0) {
                        layer.msg(res.message);
                        $scope.reload();
                    } else {
                        layer.msg(res.message);
                    }
                })
            })
        }
    }

    //返回
    $scope.backPage = function () {
        $state.go("questionBank");
    }
});