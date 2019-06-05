var row_update, seeDetai;
myApp.controller('subImportController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
    $scope.services = services;
    //列表
    services["_sub_import_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/file/getFileList', param, "POST");
    }

    //全部题库列表
    services["_bank_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/getBankList', param, "POST");
    }
    //新增题库
    services["_add_bank"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/saveBank', param, "POST");
    }
    //删除文件
    services["_del_File"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/file/delFile', param, "POST");
    }

    //上传
    services["_save_file"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/file/saveFile', param, "POST");
    }
    //删除
    services["_del_file"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/file/delFile', param, "POST");
    }
    //分类树---章节
    services["_get_getChapter"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/getChapter', param, "POST");
    }
    //分类树---知识点
    services["_get_getKnowledge"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/getKnowledge', param, "POST");
    }
    //查看失败详情
    services["_see_FailList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/file/getFailList', param, "POST");
    }
    //
    $scope.tableControl = {
        config: {
            check: false,
            param: {
                pages: 1,
                pageSize: 10,
                pageNum: 1,
                total: 0,
                searchText: null
            },
            columns: [
                {field: 'file_name', title: "文件名称", align: 'left'},
                {
                    field: 'status', title: "状态", formatter: function (value, row, index) {
                    return ['未解析', '已解析成html,未读取试题', '读取试题成功', '读取试题失败', '解析失败','试题导入成功'][value - 1] || "";
                }
                },
                {
                    field: 'sub_num', title: "成功数量", formatter: function (value, row, index) {
                    if(row.sub_num && row.status!=6 && row.sub_num!=0){
                        return '<a onclick="seeGetai(\''+row.id+'\')" class="ckeck_Getai" style="color:#4498ee;">'+row.sub_num+'</a>';
                    }else{
                        row.sub_num = row.sub_num ==null ? 0 : row.sub_num ;
                        return '<a style="color:#000;text-decoration:none;">'+row.sub_num+'</a>';
                    }
                }
                },
                {
                    field: 'fail_num', title: "失败数量", formatter: function (value, row, index) {
                    if(row.fail_num && row.fail_num!=0){
                        return '<a onclick="seeDetai(\''+row.id+'\')" class="ckeck_Detai" style="color:#e63a3a;">'+row.fail_num+'</a>';
                    }else{
                        row.fail_num = row.fail_num !=null ? row.fail_num : 0;
                        return '<a style="color:#000;text-decoration:none;">'+0+'</a>';
                    }
                }
                },
                {field: 'create_time', title: "上传时间"}
            ]
        },
        reload: function (param) {
            services._sub_import_list(param).success(function (res) {

                $scope.tableControl.loadData(res.data);
            })
        }
    };


//新的代码
    //分类树
    services["_dic_tree"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/getKnowledge', param, "POST");
    }

    //查看临时导入成功的试题
    services["_get_Getai"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subjectcache/getList', param, "POST");
    }
    //删除临时导入成功的试题---单个
    services["_del_Getai"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subjectcache/delSubjectCache', param, "POST");
    }
    //保存临时导入成功的试题
    services["_save_Getai"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subjectcache/confirmSubjectCache', param, "POST");
    }

    //上传页面---临时试题---保存
    services["_update_Savesub"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subjectcache/updateSubjectCache', param, "POST");
    },

    
    $scope.param = {};
    //模板下载
    $scope.sub_check = function (i) {
        var src = ctxPath + "/static/excelFile/" + i;
        var iframe = $('<iframe style="display: none" src="' + src + '?v=' + (new Date()).getTime().toString() + '"></iframe>');
        $("#subImport").append(iframe);

    }

    //点击上传
    $scope.check_Dom = function () {
        $('#excel_upload').click();
    };

    //文件上传
    $scope.all_test = [];
    $('#excel_upload').prettyFileDoc({
        text: "",
        change: function (res, obj) {
            if (res.code == 0) {
                layer.msg('文件上传成功!');
                $scope.$apply(function () {
                    $scope.param.ids = [res.data.id];
                    $scope.param.ids_name = [res.data.name];
                })
            }
            else {
                layer.msg(res.message);
            }
        },
        init: function (obj) {
            $(".file-btn-ku", obj).remove();
            $(".file-btn-text", obj).addClass("layui-btn").removeClass("layui-btn-normal").removeClass("layui-btn-primary")
        }
    });


    //课程
    $scope.curriculumData = null;
    services._dic_list({pageNum: 1, pageSize: 1000, dic_parentcode: 30000}).success(function (res) {
        $scope.curriculumData = res.data;
        $scope.param.struct_curriculum = res.data[0].id;
        $scope.load();
    });

    services._eMDictionary({ dic_code: '80000',pageNum: 1,pageSize: 100}).success(function (res) {
        $scope.questionLevelTypes = res.data.rows;
    })


    //根据课程ID 题型ID 获取题型名称
    $scope._get_exam_name_byid = function (kcid, txid) {
        var name = '--';
        angular.forEach($scope.curriculumData, function (item) {
            if (item.id == kcid) {
                angular.forEach(item.children, function (st) {
                    if (st.id == txid)
                        name = st.dic_name;
                })
            }
        })
        return name;
    }
    //根据ID获取试题难易度
    $scope._get_qustion_leve = function (id) {
        var name = null;
        angular.forEach($scope.questionLevelTypes, function (item) {
            if (id == item.id) {
                name = item.dic_name;
            }
        })
        return name;
    }


    $scope.load = function(){
        services._dic_tree($scope.param).success(function (res) {
            $("#knowTreeSetting").tree("loadData", res.data);
        });
    }

    var selNode = null;
    $("#knowTreeSetting").tree({
        lines: true,
        checkbox: true,
        // onlyLeafCheck:true,
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            // $(".layui-form-selected").removeClass("layui-form-selected")
        },
        "onClick": function (node) {
            var nodes = $(this).tree('getChecked');
            var select_check = $("#knowTreeSetting").tree("find", node.id);
            if(select_check.checkState =="unchecked"){
                $("#knowTreeSetting").tree("check", select_check.target);
            }else{
                $("#knowTreeSetting").tree("uncheck", select_check.target);
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
            $scope.param.know_name = str;
            $scope.param.know_id = ids;
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#knowTreeSetting").tree("getRoot");
            }
            if (selNode) {
                if ($scope.param.know_id == "") {
                    $("#knowTreeSetting").tree("select", selNode.target);

                } else {
                    if ($scope.param.know_id == null) {
                        $("#knowTreeSetting").tree("select", selNode.target);
                    } else {
                        var ids_str = $scope.param.know_id;
                        var all_ids = []
                        all_ids = ids_str.split(",");
                        for (i = 0; i < all_ids.length; i++) {
                            all_ids[i] = parseInt(all_ids[i]);
                        }

                        for (var i = 0; i < all_ids.length; i++) {
                            var molNode = $("#knowTreeSetting").tree("find", all_ids[i]);
                            $("#knowTreeSetting").tree("check", molNode.target)
                        }
                    }

                }
            }
            //查找未分配的分类
            var unNode = $("#knowTreeSetting").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });

    var selNodeD = null
    // $scope.editExamObject = {};
    $("#knowTreeD").tree({
        lines: true,
        checkbox: true,
        // onlyLeafCheck:true,
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            // $(".layui-form-selected").removeClass("layui-form-selected")
        },
        "onClick": function (node) {
            var nodes = $(this).tree('getChecked');
            var select_check = $("#knowTreeD").tree("find", node.id);
            if(select_check.checkState =="unchecked"){
                $("#knowTreeD").tree("check", select_check.target);
            }else{
                $("#knowTreeD").tree("uncheck", select_check.target);
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
            $scope.editExamObject.subject_knowledge_name = str;
            $scope.editExamObject.subject_knowledge = ids;
        },
        onLoadSuccess: function (node, data) {
            if (!selNodeD) {
                selNodeD = $("#knowTreeD").tree("getRoot");
            }
            if (selNodeD) {
                if ($scope.editExamObject.subject_knowledge == "") {
                    $("#knowTreeD").tree("select", selNodeD.target);

                } else {
                    if ($scope.editExamObject.subject_knowledge == null) {
                        $("#knowTreeD").tree("select", selNodeD.target);
                    } else {
                        var ids_str = $scope.editExamObject.subject_knowledge;
                        var all_ids = []
                        all_ids = ids_str.split(",");
                        for (i = 0; i < all_ids.length; i++) {
                            all_ids[i] = parseInt(all_ids[i]);
                        }

                        for (var i = 0; i < all_ids.length; i++) {
                            var molNode = $("#knowTreeD").tree("find", all_ids[i]);
                            $("#knowTreeD").tree("check", molNode.target)
                        }
                    }

                }
            }
            //查找未分配的分类
            var unNode = $("#knowTreeSetting").tree("find", -1);
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


    //上传记录

    $scope.saveExamsItem = function(){
        if (!$scope.param.know_id || $scope.param.know_id == "") {
            layer.alert('请选择试题知识点');
            return false;
        }
        if (!$scope.param.ids || $scope.param.ids.length == 0) {
            layer.alert('请上传试题文件(.doc文件)');
            return false;
        }

        var now_param = {};
        now_param.curriculum_id = $scope.param.struct_curriculum;
        now_param.know_id = $scope.param.know_id;
        now_param.ids = $scope.param.ids;
        now_param.ids_name = $scope.param.ids_name;

        services._save_file(now_param).success(function (res) {
            if (res.code == 0) {
                layer.msg('试题文件已上传，正在列队解析， 请稍候~');
                $scope.param.ids = [];
                $scope.param.ids_name = [];

                $scope.param.know_name = null;
                $scope.param.know_id = null;
                $scope.load();
                $scope.tableControl.reload($scope.tableControl.config.param);

            }
            else {
                layer.alert(res.message);
            }
        })
    }


    $scope.all_param = {
        pageNum:1,
        pageSize:10,
        pages:0,
        total:0
    };
    //弹出临时试题的列表
    seeGetai = function(data){
            $scope.all_param.id = data;
            $scope.all_param.bank_id = data.bank_id;
            $scope.Getai_list();
            $scope.formOpen();

    }

    //临时试题加载---

    ///临时试题首行缩进
    $scope.replace_back = function(data){
        return  data ? data.replace(/text-align: justify/g,"text-align:justify;text-indent:2em;").replace(/text-align:justify/g,"text-align:justify;text-indent:2em;").replace(/text-align:start/g,"text-align:start;text-indent:2em;").replace(/text-align: start/g,"text-align:start;text-indent:2em;") : data;
    }

    //搜索显示
    $scope.replacehtml = function (html) {
        if ($scope.all_param.searchText) {
            var re = new RegExp($scope.all_param.searchText, "gm")
            var rd = "<em class='searchTxt'>" + $scope.all_param.searchText + "</em>";
            return html ? html.replace(/vertical-align:text-bottom;/g, "").replace(/font-weight:bold;/g, "font-weight: bold;line-height: 2em; font-size: 1.2em;").replace(re, rd) : html;
        }
        else {
            return html ? html.replace(/vertical-align:text-bottom;/g, "").replace(/font-weight: bold;/g, "font-weight: bold;line-height: 2em; font-size: 1.2em;") : html;
        }
    };


    $scope.up_tf = false;
    $scope.down_tf = false;
    $scope.subjectList = null;

    $scope.Getai_list = function(){
        $scope.subjectList = null;
        services._get_Getai($scope.all_param).success(function (res) {
            if(res.code==0){
                $scope.subjectList = res.data.rows;
                $scope.all_param.total = res.data.total;
                $scope.all_param.pages = res.data.pages;
                $scope.all_nums = res.data.total;
                $scope.all_pages = res.data.pages;
                
                if ($scope.up_tf) {
                    $scope.selRow = $scope.subjectList[$scope.subjectList.length - 1];
                    $scope.selRow['now_index'] = $scope.subjectList.length - 1;
                    if ($scope.selRow.emSubjectCacheList) {
                        $scope.parent_id = $scope.selRow.id;
                        $scope.selRows = $scope.selRow.emSubjectCacheList;
                    }
                }
                else if ($scope.down_tf) {
                    $scope.selRow = $scope.subjectList[0];
                    $scope.selRow['now_index'] = 0;
                    if ($scope.selRow.emSubjectCacheList) {
                        $scope.parent_id = $scope.selRow.id;
                        $scope.selRows = $scope.selRow.emSubjectCacheList;
                    }
                }
                else if($scope.selRow){
                    var index = $scope.selRow.now_index;
                    $scope.selRow = $scope.subjectList[index];
                    $scope.selRow['now_index'] = index;
                    if ($scope.selRow.emSubjectCacheList) {
                        $scope.parent_id = $scope.selRow.id;
                        $scope.selRows = $scope.selRow.emSubjectCacheList;
                    }
                }

                if($scope.subjectList.length>0){
                    layui.laypage({
                        cont: 'pager_Getai',
                        pages: $scope.all_param.pages,
                        groups: res.data.pageSize,
                        skip: true,
                        layout: ['prev', 'page', 'next', 'skip'],
                        curr: $scope.all_param.pageNum || 1,
                        jump: function (resPager) {
                            if (resPager.curr != res.data.pageNum) {
                                $scope.all_param.pageNum = parseInt(resPager.curr);
                                $scope.Getai_list();
                            }
                        }
                    })
                }

            }else{
                layer.msg(res.message);
            }
        });
    };

    //预览页面打开
    $scope.openSeeList = function(data,index){
        $scope.selRow = data;
        $scope.selRow['now_index'] = index;
        $(".seeList").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");

    }

    //上一题
    $scope.see_add = function (data) {
        $scope.up_tf = false;
        $scope.down_tf = false;
        if (data.now_index == 0) {
            if ($scope.all_param.pageNum == 1) {
                layer.msg("已经是最新的一题了")
            } else {
                $scope.all_param.pageNum = $scope.all_param.pageNum - 1;
                $scope.up_tf = true;
                $scope.Getai_list();
            }
        }
        else {
            data.now_index = data.now_index - 1
            $scope.selRow = $scope.subjectList[data.now_index];
            $scope.selRow.now_index = data.now_index;
            if ($scope.selRow.emSubjectCacheList) {
                $scope.parent_id = $scope.selRow.id;
                $scope.selRows = $scope.selRow.emSubjectCacheList;
            }
        }
    };
    //下一题
    $scope.see_min = function (data) {
        $scope.up_tf = false;
        $scope.down_tf = false;
        if (data.now_index == $scope.subjectList.length - 1) {
            if ($scope.all_param.pageNum == $scope.all_pages) {
                layer.msg("已经是最后的一题了")
            } else {
                $scope.all_param.pageNum = $scope.all_param.pageNum + 1;
                $scope.down_tf = true;
                $scope.Getai_list();
            }
        } else {
            data.now_index = data.now_index + 1;
            $scope.selRow = $scope.subjectList[data.now_index];
            $scope.selRow.now_index = data.now_index;
            if ($scope.selRow.emSubjectCacheList) {
                $scope.parent_id = $scope.selRow.id;
                $scope.selRows = $scope.selRow.emSubjectCacheList;
            }
        }
    };

    //搜索
    $scope.reload = function () {
        $scope.all_param.searchText = $scope.param.searchText;
        $scope.all_param.pageNum = 1;
        $scope.Getai_list();
    };

    //关闭预览页面
    $scope.closeSeeList = function () {
        $scope.selRow = null;
        $(".seeList").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
    }


    //删除---临时试题
    $scope.Getai_delSub = function(data){
        $scope.all_param.subject_id = data.id;
        $scope.class_export = layer.confirm('是否移除试题', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            services._del_Getai($scope.all_param).success(function (res){
                if(res.code==0){
                    $scope.Getai_list();
                    $scope.tableControl.reload($scope.tableControl.config.param);
                    layer.close($scope.class_export);
                }
            })
        })
    }

    //保存---临时试题
    $scope.Getai_saveSub = function(){
        $scope.saveList = layer.load(1);
        services._save_Getai($scope.all_param).success(function (res){
            if(res.code==0){
                $scope.tableControl.reload($scope.tableControl.config.param);
                layer.close($scope.saveList);
                $rootScope.formClose();
            }else{
                layer.msg(res.message);
            }
        })
    }

    //修改试题页面--大题
    $scope.openExamForm = function(data){
        $scope.editExamObject = angular.copy(data);

        services._dic_tree({struct_curriculum:$scope.editExamObject.subject_curriculum}).success(function (res) {
            $("#knowTreeD").tree("loadData", res.data);
        });
        $(".EditExam").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");

        $scope.html =  '<p style="padding:5px;background: #c4c4c4"  contenteditable="false"><span class="subject_question">【题干】</span></p>' + $scope.editExamObject.subject_question;
        //设置答案
        if ($scope.editExamObject.subject_answer != "" && $scope.editExamObject.subject_answer != null) {
            $scope.html += '<p style="padding:5px;background: #c4c4c4"  contenteditable="false"><span class="subject_answer">【答案】</span></p>' + $scope.editExamObject.subject_answer;
        }
        else{
            $scope.html += '<p style="padding:5px;background: #c4c4c4"  contenteditable="false"><span class="subject_answer">【答案】</span></p><p>略</p>';
        }
        //解析
        if ($scope.editExamObject.subject_analysis != "" && $scope.editExamObject.subject_analysis != null) {
            $scope.html += '<p style="padding:5px;background: #c4c4c4"  contenteditable="false"><span class="subject_analysis">【解析】</span></p>' + $scope.editExamObject.subject_analysis;
        }
        else{
            $scope.html += '<p style="padding:5px;background: #c4c4c4"  contenteditable="false"><span class="subject_analysis">【解析】</span></p><p>略</p>';
        }
        setTimeout(function () {
            $('#myhtmlload p').css("line-height","25px");
            $('#myhtmlload img').css("vertical-align","middle");
            $('#myhtmlload span').css("text-indent","0");
            var html = $('#myhtmlload').html();
            html = html ? html.replace(/<p><\/p>/g, ""): html;
            $(document.getElementById('editExamIframe').contentWindow.ue.setContent(html));
        },500)
    }
    //关闭修改页面---大题
    $scope.closeEditExam = function () {
        $(".EditExam").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
    }

    //上传页面---临时试题保存
    $scope.save_upadteList = function(){
        var context = document.getElementById('editExamIframe').contentWindow.ue.getContent();
        $scope.editExamObject.opContext = context;
        if(!$scope.editExamObject.subject_knowledge || $scope.editExamObject.subject_knowledge.length == 0){
            layer.msg('请选择知识点');
            return false;
        };
        $rootScope.services._update_Savesub ($scope.editExamObject).success(function (res) {
            if(res.code==0){
                layer.msg(res.message);
                $scope.Getai_list();
                $scope.closeEditExam();
            }else{
                layer.msg(res.message);
            }
        })

    }

    //修改小题页面--
    $scope.crossSetlist = function(data){
        $scope.cross_selRow = data;
        $(".crossSet").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");

        $scope.Bhtml =  '<p style="padding:5px;background: #c4c4c4" contenteditable="false"><span class="subject_question">【题干】</span></p>' + $scope.cross_selRow.subject_question;
        //设置答案
        if ($scope.cross_selRow.subject_answer != "" && $scope.cross_selRow.subject_answer != null) {
            $scope.Bhtml += '<p style="padding:5px;background: #c4c4c4" contenteditable="false"><span class="subject_answer">【答案】</span></p>' + $scope.cross_selRow.subject_answer;
        }
        else{
            $scope.Bhtml += '<p style="padding:5px;background: #c4c4c4" contenteditable="false"><span class="subject_answer">【答案】</span></p><p>略</p>';
        }
        //解析
        if ($scope.cross_selRow.subject_analysis != "" && $scope.cross_selRow.subject_analysis != null) {
            $scope.Bhtml += '<p style="padding:5px;background: #c4c4c4" contenteditable="false"><span class="subject_analysis">【解析】</span></p>' + $scope.cross_selRow.subject_analysis;
        }
        else{
            $scope.Bhtml += '<p style="padding:5px;background: #c4c4c4" contenteditable="false"><span class="subject_analysis">【解析】</span></p><p>略</p>';
        }
        setTimeout(function () {
            $('#B_html p').css("line-height","25px");
            $('#B_html img').css("vertical-align","middle");
            $('#B_html span').css("text-indent","0");
            var html = $('#B_html').html();
            html = html ? html.replace(/<p><\/p>/g, "") : html;
            $(document.getElementById('cross_iframs').contentWindow.ue.setContent(html));
        },500)

    }

    $scope.save_upadteBlist = function(){
        var context = document.getElementById('cross_iframs').contentWindow.ue.getContent();
        $scope.cross_selRow.opContext = context;
        $rootScope.services._update_Savesub($scope.cross_selRow).success(function (res) {
            if(res.code==0){
                layer.msg(res.message);
                $scope.Getai_list();

                $scope.closeSetList();
            }else{
                layer.msg(res.message);
            }
        })
    }

    //关闭小题修改页面
    $scope.closeSetList = function () {
        $(".crossSet").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
    }
});