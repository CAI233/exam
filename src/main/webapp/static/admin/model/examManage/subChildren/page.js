var row_update;
myApp.controller('subChildrenController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    if (!$stateParams || !$stateParams.pid) {
        $state.go("subjectManage");
    }
    $scope.services = services;
    //列表
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getManageList', param, "POST");
    }
    //删除
    services["_del_sub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/delSubjects', param, "POST");
    }
    //新增，修改
    // services["_add_sub"] = function (param) {
    //     return $rootScope.serverAction(ctxPath + '/admin/subject/saveSubject', param, "POST");
    // }
    //试题详情
    services["_sub_detail"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getDetail', param, "POST");
    }

    //分类树
    services["_dic_tree"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/getDicTree', param, "POST");
    }

    //子题列表
    services["_sublis_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/single_Item', param, "POST");
    }

    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                pageNum: 1,
                total: 0,
                searchText: null,
                pid: $stateParams.pid
            },
            columns: [
                {
                    field: 'subject_type', title: "题型",
                    formatter: function (value, row, index) {
                        return ["单选题", "多选题", "判断题", "填空题", "问答题"][value - 1];
                    }
                },
                {
                    field: 'subject_level', title: "难易度", formatter: function (value, row, index) {
                    return ["简单", "偏难", "较难"][value - 1] || "";
                }
                },
                {field: 'subject_title', title: "题目标题", align: 'left'},
                {field: 'subject_marks', title: "分数", align: 'left'},
                {
                    field: 'action', title: "操作",
                    formatter: function (value, row, index) {
                        var manager = '<a href="javascript:void(0)" onclick="knowSub(' + row.id + ')">预览</a>&nbsp;&nbsp;&nbsp;<a href="javascript:void(0)" onclick="updateSub(' + row.id + ')">修改</a>';
                        return manager;
                    }
                }
            ]
        },
        reload: function (param) {
            services._sub_list(param).success(function (res) {
                console.log(res);
                $scope.tableControl.loadData(res.data);
            })
        }
    };
    $scope.typeData = [
        {"id": 1, "text": "单选题"},
        {"id": 2, "text": "多选题"},
        {"id": 3, "text": "判断题"},
        {"id": 4, "text": "填空题"},
        {"id": 5, "text": "问答题"}];


    $scope.levelData = [
        {"id": 1, "text": "简单"},
        {"id": 2, "text": "偏难"},
        {"id": 3, "text": "较难"}];

    $scope.selRow = {}
    var selNode = null;
    $scope.specialty_param = {
        pageNum: 1,
        pageSize: 1000,
        dic_code: 20000
    }

    //预览
    knowSub = function(id){
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
        $scope.layer_export = layer.open({
            type: 1,
            title: "",
            area: ["1000px", "600px"],
            content: $("#know_sub")
        });
    }


    //页面操作内容
    $scope.param = {
        subject_type_name: null,
        subject_type: null,
        searchText: null
    }
    //清空
    $scope.rest = function () {
        $scope.param.subject_type_name = null;
        $scope.param.subject_type = null;
    }

    $scope.backPage = function(){
        $state.go("subjectManage");
    }
    //重新查询
    $scope.reload = function () {
        $scope.tableControl.config.param["subject_type"] = $scope.param.subject_type;
        $scope.tableControl.config.param["searchText"] = $scope.param.searchText;
        $scope.tableControl.config.param["pageNum"] = 1;
        $scope.tableControl.reload($scope.tableControl.config.param);
    }

    $scope.initOption = function (data) {
        if (data.id == 1 ) {
            var right = 0;
            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px;"><span class="subject_question">题干:</span></p>'));
            var options = ['A', 'B', 'C', 'D']
            angular.forEach(options, function (item, index) {
                var option = ['A', 'B', 'C', 'D'][index];
                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:10px;margin-left: 30px"><span class="subject_option">' + option + '.</span></p>', true))
            });
            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_analysis">解析:</span></p>', true));

        }
        if (data.id == 2 ) {
            var right = 0;
            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px;"><span class="subject_question">题干:</span></p>'));
            var options = ['A', 'B', 'C', 'D','E']
            angular.forEach(options, function (item, index) {
                var option = ['A', 'B', 'C', 'D','E'][index];
                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:10px;margin-left: 30px"><span class="subject_option">' + option + '.</span></p>', true))
            });
            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_analysis">解析:</span></p>', true));

        }
        if (data.id == 3 ) {
            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_question">题干:</span></p>'));
            (document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_analysis">解析:</span></p>', true));
        }
        if (data.id == 5 ) {
            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_question">题干:</span></p>'));
            (document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_analysis">解析:</span></p>', true));
        }
        if (data.id == 6 ) {
            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_question">题干:</span></p>'));
            (document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_analysis">解析:</span></p>', true));
        }
        if (data.id == 4){
            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px;"><span class="subject_question">题干:</span></p>'));
            var options = ['1', '2', '3', '4']
            angular.forEach(options, function (item, index) {
                var option = ['1', '2', '3', '4'][index];
                $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:10px;margin-left: 30px"><span class="subject_option">' + option + '.</span></p>', true))
            });
            $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_analysis">解析:</span></p>', true));

        }

    }


    services._sub_detail({id:$stateParams.pid}).success(function (res) {
        if(res.code==0){
            $scope.sub_subject_curriculum = res.data.subject_curriculum;
        }
    })
    //修改
    $scope.optionList= [];
    $scope.opt= []
   updateSub = function (id) {
       $(".form_btns>button").eq(1).hide();
       $scope.show_update = true
       $scope.show_addRow = false
        services._sub_detail({id: id}).success(function (res) {
            $scope.selRow = []
            if (res.code == 0) {
                $scope.selRow = res.data;
                $scope.status = false;
                console.log(res.data);
                $rootScope.formOpen();

                //章节分类
                services._dic_tree({dic_ownerid:$scope.sub_subject_curriculum, dic_parentcode:"40000"}).success(function (resd) {
                    $("#selchaTree").tree("loadData", resd.data);
                });
                //知识点分类
                services._dic_tree({dic_ownerid:$scope.sub_subject_curriculum, dic_parentcode:"50000"}).success(function (resd) {
                    $("#selknowTree").tree("loadData", resd.data);
                });
                //单选题  //多选
                if ($scope.selRow.subject_type == 1 ) {
                    var option = null;
                    $scope.opt.option_answer = null;
                    $scope.optionList = []
                    $scope.optionList = $scope.selRow.option
                    //设置题干
                    $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px;"><span class="subject_question">题干:' + $scope.selRow.subject_question + '</span></p>'));
                    //遍历答案
                    angular.forEach($scope.optionList, function (item, index) {
                        option = ['A', 'B', 'C', 'D'][index];
                        if($scope.optionList[index].option_right == 1){
                            $scope.selRow.answer = ['A', 'B', 'C', 'D'][index]
                            $scope.opt.option_answer = $scope.selRow.answer
                        }
                        $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:10px;margin-left: 30px"><span class="subject_option">' + option + '.' + $scope.optionList[index].option_context + '</span></p>', true))
                    });
                    //解析
                    $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_analysis">解析:' + $scope.selRow.subject_analysis + '</span></p>', true));
                }
                if ($scope.selRow.subject_type == 2) {
                    var option = null;
                    $scope.opt.option_answer = null;
                    $scope.optionList = []
                    $scope.optionList = $scope.selRow.option

                    //设置题干
                    $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px;"><span class="subject_question">题干:' + $scope.selRow.subject_question + '</span></p>'));
                    //遍历答案
                    angular.forEach($scope.optionList, function (item, index) {
                        option = ['A', 'B', 'C', 'D', 'E'][index];
                        $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:10px;margin-left: 30px"><span class="subject_option">' + option + '.' + $scope.optionList[index].option_context + '</span></p>', true))
                    });
                    //解析
                    $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_analysis">解析:' + $scope.selRow.subject_analysis + '</span></p>', true));
                }

                if ($scope.selRow.subject_type == 5 || $scope.selRow.subject_type == 3 || $scope.selRow.subject_type == 6) {
                    $scope.optionList = []
                    $scope.optionList = $scope.selRow.option
                    $scope.opt.option_answer = null;
                    //设置题干
                    $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_question">题干:' + $scope.selRow.subject_question + '</span></p>'));
                    //解析
                    $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_analysis">解析:' + $scope.selRow.subject_analysis + '</span></p>', true));
                }
                if ($scope.selRow.subject_type == 4 ) {
                    var option = null;
                    $scope.optionList = []
                    $scope.optionList = $scope.selRow.option
                    $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_question">题干:' + $scope.selRow.subject_question + '</span></p>'));
                    angular.forEach($scope.optionList, function (item, index) {
                        option = ['1', '2', '3', '4'][index];
                        $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:10px;margin-left: 30px"><span class="subject_option">' + option + '.' + $scope.optionList[index].option_context + '</span></p>', true))
                    })
                    $(document.getElementById('myIframe2').contentWindow.ue.setContent('<p style="padding:20px"><span class="subject_analysis">解析:' + $scope.selRow.subject_analysis + '</span></p>', true));
                }
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
    //新增
    $scope.addRow = function () {
        $(".form_btns>button").eq(1).show();
        $scope.selRow = {};
        $scope.show_update = false
        $scope.show_addRow = true
        $scope.status = true;
        document.getElementById('myIframe2').contentWindow.ue.setContent('')
        services._sub_detail({id:$stateParams.pid}).success(function (res) {
            if (res.code == 0) {
            //章节唯一id
            $scope.selRow.subject_chapter = res.data.subject_chapter;

            //知识点唯一id;
            $scope.selRow.subject_knowledge = res.data.subject_knowledge;

            //章节分类
            services._dic_tree({dic_ownerid:res.data.subject_curriculum, dic_parentcode:"40000"}).success(function (resd) {
                $("#selchaTree").tree("loadData", resd.data);
            });
            //知识点分类
            services._dic_tree({dic_ownerid:res.data.subject_curriculum, dic_parentcode:"50000"}).success(function (resd) {
                $("#selknowTree").tree("loadData", resd.data);
            });

            $rootScope.formOpen();
            } else {
                layer.alert(res.message);
            }
        })
    }

    $("#selchaTree").tree({
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
                selNode = $("#selchaTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#selchaTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#selchaTree").tree("getRoot");
            }
            if (selNode) {
                if($scope.selRow.subject_chapter!=null){
                    $("#selchaTree").tree("select", selNode.target);
                }else{
                    var solNode = $("#selchaTree").tree('getChildren');
                    for(var k in solNode){
                        if(solNode[k].id == $scope.selRow.subject_chapter){
                            // solNode[k].checkState = "check";
                            aolNode = $("#selchaTree").tree("find", solNode[k].id);
                            $("#selchaTree").tree("check", aolNode.target);
                        }
                    }
                }


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
                selNode = $("#selknowTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#selknowTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#selknowTree").tree("getRoot");
            }
            if (selNode) {
            //     $("#selknowTree").tree("check", selNode.target);
                var solNode = $("#selknowTree").tree('getChildren');
                for(var k in solNode){
                    if(solNode[k].id == $scope.selRow.subject_knowledge){
                        // solNode[k].checkState = "check";
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
    function changeTreeStyle(treeNode) {
        if (treeNode['children'] && treeNode['children'].length > 0) {
            for (var j = 0; j < treeNode['children'].length; j++) {
                changeTreeStyle(treeNode['children'][j]);
            }
        }
        //设置属性
        treeNode["text"] = treeNode.dic_name;
        treeNode["id"] = treeNode.id;
    }

    //分数判断
    $scope.show_socre = function(i){
        $scope.selRow.subject_marks = i.replace(/\D/g,'');
    }

    //提交
    $scope._form_submit = function (bool) {
        if ($scope.selRow.subject_type == 1)
        {
            $scope.selRow.subject_answer = $scope.opt.option_answer
        }
        var subTrue = true;
        if (!$scope.selRow.subject_type) {
            layer.alert("请选择题型")
            return false;
        }
        // if (!$scope.selRow.subject_question) {
        //     layer.alert("请填写题目题干")
        //     return false;
        // }
        if (!$scope.selRow.subject_chapter) {
            layer.msg("请选择章节")
            return false;
        }
        if (!$scope.selRow.subject_knowledge) {
            layer.msg("请选择知识点")
            return false;
        }
        if(!$scope.selRow.subject_marks){
            layer.msg("请填写分数")
            return false;
        }
        if (!$scope.selRow.subject_level_name) {
            console.log($scope.selRow.subject_level_name);
            layer.alert("请填写难易度")
            return false;
        }
        if($scope.selRow.subject_type==3 || $scope.selRow.subject_type==5){
            if(!$scope.selRow.subject_answer){
                subTrue=false;
            }
        }else{
            angular.forEach($scope.selRow.option,function(item,index) {
                if(!item.option_context && $scope.selRow.subject_type!=6){
                    subTrue=false
                }
            })
        }
        if (!subTrue){
            layer.msg("请填写答案")
            return false
        }

        if($scope.selRow.subject_type==1){
            if($scope.show_addRow == true){
                if(!$scope.opt.option_answer){
                    layer.msg("请选择选择一个作为正确答案");
                    return false;
                }
            }else{
                var allright = 0;
                angular.forEach($scope.selRow.option,function(item,index){
                    allright += item.option_right;
                })
                if(allright<1){
                    layer.msg("请选择选择一个正确答案");
                    return false;
                }
            }

        }
        if($scope.selRow.subject_type==2){
            if($scope.show_addRow == true){
                if(!$scope.selRow.subject_answer){
                    layer.msg("请选择选择一个作为正确答案");
                    return false;
                }
            }else{
                var allright = 0;
                angular.forEach($scope.selRow.option,function(item,index){
                    allright += item.option_right;
                })
                if(allright<2){
                    layer.msg("请至少选择选择一个正确答案");
                    return false;
                }
            }

        }

        $scope.selRow.subject_pid = $stateParams.pid;
        var context = null;
        context = document.getElementById('myIframe2').contentWindow.ue.getContent();
        $scope.selRow.opContext = []
        $scope.selRow.opContext = context
        services._add_sub($scope.selRow).success(function (res) {

            if (res.code == 0) {
                if(bool) {
                    $scope.selRow.subject_question = null;
                    $scope.selRow.subject_analysis = null;
                    $scope.selRow.subject_answer = null;
                    if ($scope.selRow.option) {
                        angular.forEach($scope.selRow.option, function (item, index) {
                            $scope.selRow.option[index].option_context = null;
                            $scope.selRow.option[index].option_right = null;
                        });
                    }
                    $scope.reload();
                }else{
                    $scope.selRow = {};
                    $rootScope.formClose();
                    $scope.reload();
                }
            }
            else {
                layer.msg(res.message);
            }
        })
    }
    //删除
    $scope.delRow = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                ids.push($scope.tableControl.data[item.index].id)
            }
        });
        if (ids.length == 0) {
            layer.alert("请选择你将要删除的数据");
        }
        else {
            layer.confirm('删除后数据无法找回,确认删除吗？', {
                btn: ['确定', '取消'] //按钮
            }, function () {
                services._del_sub({ids: ids}).success(function (res) {

                    if (res.code == 0) {
                        layer.msg("删除成功")
                        $scope.reload();
                    } else {
                        layer.msg(res.message)
                    }
                })
            })
        }
    }
    var flag = null;

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
                document.getElementById('myIframe').contentWindow.ue.setContent(str);
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
    $scope.changeRight = function (data) {
        if ($scope.selRow.option) {
            angular.forEach($scope.selRow.option, function (item, index) {
                if ($scope.selRow.subject_type == 1) {
                    if (index  == data) {
                        $scope.selRow.option[index].option_right = 1;
                    } else {
                        $scope.selRow.option[index].option_right = 0;
                    }
                } else {
                    if (index  == data) {
                        $scope.selRow.option[index].option_right = $scope.selRow.option[index].option_right == 1 ? 0 : 1;
                    }
                }
            });
        }
    }
    $scope.selectAnswer = function (item) {
        $scope.selRow.option.option_context = item;
        $scope.selRow.option.option_right = 1;
        $scope.selRow.option.option_sequence = 1;
    }
    $scope.load = function () {
        $("body").delegate(".xxx-form-select", "click", function () {
            $(".xxx-form-select").not(this).removeClass("xxx-form-selected");
            $(this).addClass("xxx-form-selected");
            return false;
        })
        $("body").bind("click", function () {
            $(".xxx-form-select").removeClass("xxx-form-selected");
        });
    }
    $scope.load()

    $scope.answerlist = [{
        subject_answer:'A'
    },{
        subject_answer:'B'
    },{
        subject_answer:'C'
    },{
        subject_answer:'D'
    },{
        subject_answer:'E'
    }]
    $scope.selectClick = function (data) {
        $scope.selRow.subject_answer = [];
        angular.forEach($scope.answerlist, function (item, index) {
            if (item.check) {
                if($scope.show_update == true){
                    if (item != 0) {
                        $.inArray(item.subject_answer, $scope.selRow.subject_answer) == -1 && $scope.selRow.subject_answer.push(item.subject_answer)
                        $scope.selRow.option[index].option_right = 1;
                    }else{
                        $scope.selRow.option[index].option_right = 0;
                    }
                }else{
                    if (item != 0) {
                        $.inArray(item.subject_answer, $scope.selRow.subject_answer) == -1 && $scope.selRow.subject_answer.push(item.subject_answer)
                    }
                }
            }

        });

        $scope.selRow.subject_answer = $scope.selRow.subject_answer.toString();
    }
});