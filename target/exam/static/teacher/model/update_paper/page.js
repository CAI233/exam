myApp.controller('update_paperController', function ($rootScope, $scope, services, $sce, $stateParams) {

    //试卷信息
    services["_get_currum"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/getDicTree', param, "POST");
    };
    //上传
    services["_save_file"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/file/saveFile', param, "POST");
    };
    //删除
    services["_del_file"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/file/delFile', param, "POST");
    };
    //我自己的和我参与的题库
    services["_getBankList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/getBankList', param, "POST");
    };
    //导入后试题信息列表
    services["_sub_import_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/file/getFileList', param, "POST");
    };
    //查看失败详情
    services["_see_FailList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/file/getFailList', param, "POST");
    };
    //新增题库
    services["_add_bank"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/saveBank', param, "POST");
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

    //题库不显示
    $scope.show_bank = true;

    $scope.param = {
        bank_id: null,
        bank_name: null,
        curriculum_id: null,
        ids: [],
        ids_name: [],
        know_id: null
    };
    $scope.upload_knowledges = null;
    //课程
    $scope.$watch('curriculum', function (data) {
        if (data) {
            $scope.param.curriculum_id = data.id;
            //加载知识点
            services._getKnowledge({
                struct_curriculum: $scope.param.curriculum_id
            }).success(function (res) {
                $scope.upload_knowledges = res.data;
            })
        }
    });
    //我的题库
    $scope.bank_exams_array = null;
    $scope.bank_load = function () {
        services._getBankList().success(function (res) {
            $scope.bank_exams_array = res.data;
            angular.forEach($scope.bank_exams_array,function(item,index){
                if($scope._bank_param.bank_title==item.bank_title){
                    $scope.param.bank_id = item.id;
                    $scope.param.bank_name = item.bank_title;
                }
            })
            $scope.check_curr();
        });
    };
    $scope.bank_load();
    //选择课程后进行切换
    $scope.check_curr = function () {
        $rootScope.checked_knowledges = null;
        $scope.param.know_id = null;
        services._getKnowledge({
            struct_curriculum: $scope.param.curriculum_id
        }).success(function (res) {
            $scope.upload_knowledges = res.data;
        })
    };


    //选中 知识点
    $scope.$watch('checked_knowledges', function (data) {
        if (data) {

            $scope.param.know_id = null;
            var arr = [];
            angular.forEach(data, function (item) {
                arr.push(item.id);
            });
            $scope.param.know_id = arr.toString();
        }
    }, true);

    $scope._bank_param = {};
    //新增题库
    $scope.addBank = function ($event) {
        $rootScope.stopEvent($event);
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
            services._add_bank($scope._bank_param).success(function (res) {
                if (res.code == 0) {

                    layer.close($scope.expored);
                    $scope.bank_load();
                    layer.msg(res.message);
                } else {
                    layer.msg(res.message);
                }

            })
        });

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
    //点击上传
    $scope.check_Dom = function () {
        $('#excel_upload').click();
    };

    $scope.load_param = {
        pages: 0,
        total: 0,
        pageSize: 10,
        pageNum: 1,
    };
    //根据题库id得到题库名称
    $scope.bank_name = function (id) {
        var This_name = null;
        angular.forEach($scope.bank_exams_array, function (item, index) {
            if (item.id == id) {
                This_name = item.bank_title;
            }
        });
        return This_name;
    };


    //上传记录
    $scope.re_load = function () {
        services._sub_import_list($scope.load_param).success(function (res) {
            if (res.code == 0) {
                $scope.load_message = res.data.rows;
                $scope.load_param.total = res.data.total;
                $scope.load_param.pages = res.data.pages;


                laypage.render({
                    elem: "pager",
                    count: $scope.load_param.total,
                    curr: $scope.load_param.pageNum || 1,
                    limit: $scope.load_param.pageSize,
                    layout: ['prev', 'page', 'next', 'skip'],
                    skip: true,
                    jump: function (resPager) {
                        if (resPager.curr != $scope.load_param.pageNum) {
                            $scope.load_param.pageNum = parseInt(resPager.curr);
                            $scope.re_load();
                        }
                    }
                });

            } else {
                layer.msg(res.message);
            }
        })
    };
    $scope.re_load();

    //查看导入成功的试题集合
    $scope.all_param = {
        pages: 0,
        total: 0,
        pageSize: 10,
        pageNum: 1,
    }
    $scope.up_tf = false;
    $scope.down_tf = false;
    $scope.subjectList = null;
    //弹出临时试题的列表
    $scope.seeGetai = function(data){
        if (data.sub_num != null && data.status!=6 && data.sub_num != 0 ) {
            console.log(data);
            $scope.all_param.id = data.id;
            $scope.all_param.bank_id = data.bank_id;
            $scope.Getai_list();
            $scope.formOpen();
        }
    }

    //临时试题加载---
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

                laypage.render({
                    elem: "pager_Getai",
                    count: $scope.all_param.total,
                    curr: $scope.all_param.pageNum || 1,
                    limit: $scope.all_param.pageSize,
                    layout: ['prev', 'page', 'next', 'skip'],
                    skip: true,
                    jump: function (resPager) {
                        if (resPager.curr != $scope.all_param.pageNum) {
                            $scope.all_param.pageNum = parseInt(resPager.curr);
                            $scope.Getai_list();
                        }
                    }
                });
            }else{
                layer.msg(res.message);
            }
        });
    };

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

    ///临时试题首行缩进
    $scope.replace_back = function(data){
        return  data ? data.replace(/text-align: justify/g,"text-align:justify;text-indent:2em;").replace(/text-align:justify/g,"text-align:justify;text-indent:2em;").replace(/text-align:start/g,"text-align:start;text-indent:2em;").replace(/text-align: start/g,"text-align:start;text-indent:2em;") : data;
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

    //删除---临时试题
    $scope.Getai_delSub = function(data){
        $scope.all_param.subject_id = data.id;
        console.log($scope.all_param);
        $scope.class_export = layer.confirm('是否移除试题', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            services._del_Getai($scope.all_param).success(function (res){
                if(res.code==0){
                    $scope.Getai_list();
                    $scope.re_load();
                    layer.close($scope.class_export);
                }
            })
        })
    }
    //保存---临时试题
    $scope.Getai_saveSub = function(){
        $rootScope.loadingStart();
        services._save_Getai($scope.all_param).success(function (res){
            if(res.code==0){
                $rootScope.loadingEnd();
                $scope.re_load();
                $rootScope.formClose();
            }else{
                layer.msg(res.message);
            }
        })
    }
    //查看导入错误试题集合
    //查看解析失败详情
    $scope.seeDetai = function (data) {

        if (data.fail_num != null) {
            services._see_FailList({id: data.id}).success(function (res) {
                $scope.FailList = res.data;
            });
            $scope.layer_export = layer.open({
                type: 1,
                title: "",
                area: ["800px", "400px"],
                content: $("#seeDetails")
            });
        }
    };
    //试题上传状态
    $scope.pages_nums = ['未解析', '已解析成html,未读取试题', '读取试题成功', '读取试题失败', '解析失败','试题导入成功'];

    //保存
    $scope.saveExamsItem = function () {
        if (!$scope.param.know_id || $scope.param.know_id == "") {
            layer.alert('请选择试题知识点');
            return false;
        }
        if (!$scope.param.ids || $scope.param.ids.length == 0) {
            layer.alert('请上传试题文件(.doc文件)');
            return false;
        }
        if (!$rootScope.superManage() && !$scope.param.bank_id) {
            layer.alert('请选择试题导入存放的试题库，若没有题库，可点击+新增题库');
            return false;
        }
        services._save_file($scope.param).success(function (res) {
            if (res.code == 0) {
                layer.msg('试题文件已上传，正在列队解析， 请稍候~');
                $scope.param.ids = [];
                $scope.param.ids_name = [];
                $rootScope.checked_knowledges = null;
                $scope.param.know_id = null;
                angular.forEach($scope.upload_knowledges, function (item) {
                    item.checked_box = false;
                    $scope.param.bank_name = null;
                    $scope.param.bank_id = null;
                    $scope.eachChild_all_clear1(item);
                });
                $scope.re_load();
            }
            else {
                layer.alert(res.message);
            }
        })
    }
    //清空知识点
    $scope.eachChild_all_clear1 = function (item) {
        if (item.children && item.children.length > 0) {
            angular.forEach(item.children, function (mm) {
                mm.checked_box = false;
                if (mm.children) {
                    $scope.eachChild_all_clear1(mm);
                }
            })
        }
    }

    //模板下载
    $scope.sub_check = function (i) {
        var src = ctxPath + "/static/excelFile/" + i;
        var iframe = $('<iframe style="display: none" src="' + src + '?v=' + (new Date()).getTime().toString() + '"></iframe>');
        $("#update_paper").append(iframe);

    }
});

