myApp.controller('myOptionBanksController', function ($rootScope, $scope, services, $sce, $stateParams) {

    //获取自己创建的题库下面的试题
    services["_by_bank_exams"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/V2getBankList', param, "POST");
    };
    //获取自己参加的题库下面的试题
    services["_data_subject"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/assistantList', param, "POST");
    };
    //新建题库
    services["_add_bank"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/saveBank', param, "POST");
    };
    //删除题库
    services["_del_bank"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/V2delBank', param, "POST");
    };
    //获取协助者
    services["_get_assistant"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/assistantList', param, "POST");
    };
    //删除题库里的试题 ----单题操作
    services["_del_test"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/delBankSubject', param, "POST");
    };

    //下载题库试题----获取当前题库下所有试题id
    // services["_get_allIds"] = function (param) {
    //     return $rootScope.serverAction(ctxPath + '/admin/subject/getSubjectIdsByBankId', param, "POST");
    // }
    services["_get_allIds"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/getBankSubject', param, "POST");
    };

    //html传给后台
    // services["_send_fragment"] = function (param) {
    //     return $rootScope.serverAction(ctxPath + '/admin/subject/saveSubjectsHtml', param, "POST");
    // }


    //我创建的题库
    $scope.myBanks = null;
    //我参与的题库
    $scope.otherBanks = null;
    //当前查看的题库
    $scope.df_select_bank = null;
    //判断是否可以删除题库
    $scope.del_false = false;

    $rootScope.get_bank = function(){
        services._getBankList().success(function (res) {
            $scope.myBanks = res.data;
            services._data_subject().success(function (res1) {
                $scope.otherBanks = res1.data;
                if($rootScope.root_param.selDfBank != null){
                    angular.forEach($scope.myBanks,function(item){
                        if($rootScope.root_param.selDfBank.id == item.id){
                            $scope.df_select_bank = item;
                        }
                    })
                }
                else if (res.data.length > 0) {
                    $scope.df_select_bank = res.data[0];
                    $scope.del_false = false;
                }
                else if (res1.data.length > 0) {
                    $scope.df_select_bank = res1.data[0];
                    $scope.del_false = true;
                }
                if(res.data.length==0 && res1.data.length==0){
                    $scope.df_select_bank = null;
                }
            })
        })
    };
    $rootScope.get_bank();
    //设置题库

    $scope.set_df_bank = function (item) {
        if($rootScope._USERINFO.user_id!=item.creator){
            $scope.del_false = true;
        }else{
            $scope.del_false = false;
        }
        $scope.df_select_bank = item;

    };
    //监控试题库变化
    $scope.$watch('df_select_bank', function (n) {
        if (n) {
            $scope.df_select_bank.total = 0;
            $scope.all_load(true);
        }
    })

    $scope.all_param = {
        pageNum: 1,
        pageSize: 10,
        bank_id: null,
        searchText:null
    };

    $scope.up_tf = false;
    $scope.down_tf = false;
    $scope.subjectList = null;
    //页面加载---
    $scope.all_load = function (clear) {
        $scope.subjectList = null;
        if (clear) {
            $scope.all_param.pageNum = 1;
            $scope.all_param.bank_id = $scope.df_select_bank.id;
        }
        services._by_bank_exams($scope.all_param).success(function (res) {
            if(res.code==0){
                $scope.subjectList = res.data.rows;
                $scope.df_select_bank.total = res.data.total;
                $scope.all_param.total = res.data.total;
                $scope.all_param.pages = res.data.pages;
                $scope.all_nums = res.data.total;
                $scope.all_pages = res.data.pages;
                if ($scope.up_tf) {
                    $scope.selRow = $scope.subjectList[$scope.subjectList.length - 1];
                    $scope.selRow['now_index'] = $scope.subjectList.length - 1;
                    if ($scope.selRow.subjectList) {
                        $scope.parent_id = $scope.selRow.id;
                        $scope.selRows = $scope.selRow.subjectList;
                    }
                }
                else if ($scope.down_tf) {
                    $scope.selRow = $scope.subjectList[0];
                    $scope.selRow['now_index'] = 0;
                    if ($scope.selRow.subjectList) {
                        $scope.parent_id = $scope.selRow.id;
                        $scope.selRows = $scope.selRow.subjectList;
                    }
                }
                else if($scope.selRow){
                    var index = $scope.selRow.now_index;
                    $scope.selRow = $scope.subjectList[index];
                    $scope.selRow['now_index'] = index;
                    if ($scope.selRow.subjectList) {
                        $scope.parent_id = $scope.selRow.id;
                        $scope.selRows = $scope.selRow.subjectList;
                    }
                }
                
                laypage.render({
                    elem: "pager",
                    count:$scope.all_param.total,
                    curr: $scope.all_param.pageNum || 1,
                    limit: $scope.all_param.pageSize,
                    layout: ['prev', 'page', 'next', 'skip'],
                    skip: true,
                    jump: function (resPager) {
                        if (resPager.curr != $scope.all_param.pageNum) {
                            $scope.all_param.pageNum = parseInt(resPager.curr);
                            $scope.all_load();
                        }
                    }
                });
            }else{
                layer.msg(res.message);
            }
        })
    };

    $scope.replacehtml = function (html) {
        if($scope.all_param.searchText){
            var re = new RegExp($scope.all_param.searchText,"gm")
            var rd = "<em class='searchTxt'>"+ $scope.all_param.searchText +"</em>";
            return html ? html.replace(/vertical-align:text-bottom;/g, "").replace(re, rd) : html;
        }
        else {
            return html ? html.replace(/vertical-align:text-bottom;/g, "") : html;
        }
    };

    //父级题库id
    $scope.parent_id = null;
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
                $scope.all_load();
            }
        }
        else {
            data.now_index = data.now_index - 1
            $scope.selRow = $scope.subjectList[data.now_index];
            $scope.selRow.now_index = data.now_index;
            if ($scope.selRow.subjectList) {
                $scope.parent_id = $scope.selRow.id;
                $scope.selRows = $scope.selRow.subjectList;
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
                $scope.all_load();
            }
        } else {
            data.now_index = data.now_index + 1;
            $scope.selRow = $scope.subjectList[data.now_index];
            $scope.selRow.now_index = data.now_index;
            if ($scope.selRow.subjectList) {
                $scope.parent_id = $scope.selRow.id;
                $scope.selRows = $scope.selRow.subjectList;
            }
        }
    };



    //检测是否是在自己本身页面创建题库
    $scope.now_param = {};
    $scope.$watch('bank_tf', function (bool) {
        if(bool){
            console.log(bool);
            $rootScope.bank_tf = false;
            $scope.now_param = {};

            $(".cooper .layui-select-title").html("");
            $("#open_title").html("新建题库")
            angular.forEach($scope.persons,function(items,index){
                items['check'] = false;
            })
            $scope.now_param.bank_creat = $rootScope._USERINFO.user_real_name;
            $scope.layer_export = layer.open({
                type: 1,
                title: "",
                // shade:false,
                area: ["500px", "450px"],
                content: $("#bank_open")
            });
        }
    });
    $scope.now_creat_id = JSON.parse(window.sessionStorage.getItem("_USERINFO")).user_id;
    //获取协助者
    services._get_assistant({user_id:$scope.now_creat_id}).success(function (res) {
        if(res.code==0){
            $scope.persons = res.data;
        }
    });

    //删除协作者
    del_check  = function(data){
        $scope.$apply(function(){
            angular.forEach($scope.persons,function(item,index){
                if(data == item.user_id){
                    item.check = false;
                    $scope.persons_check(item);
                }
            })
        })
    };
    //添加协作者
    $scope.persons_check = function(data){
        var str = '';
        var nums = 0;
        var assistants = []
        angular.forEach($scope.persons,function(item,index){
            if(item.check){
                item.check = true;
                assistants.push(item.user_id);
                str+= '<a href="javascript:void(0)" onclick="del_check(\''+item.user_id +'\')">'+item.user_real_name+'<i class="iconfont icon-guanbi1"></i></a>'

            }
            $(".cooper .layui-select-title").html(str);
        })
        $scope.now_param.assistant = assistants.join(",");
    };
    //新增题库
    $scope.add_bank = function(){
        if(!$scope.now_param.bank_title){
            layer.msg("请填写试卷标题")
        }
        services._add_bank($scope.now_param).success(function (res) {
            if(res.code==0){
                layer.close($scope.layer_export);
                layer.msg(res.message);
                $rootScope.get_bank();

            }
        })
    }
    //删除题库
    $scope.del_bank = function(id){
        layer.confirm('删除题库后题库里试题将全部删除,确认删除吗？', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            services._del_bank({bank_id:id}).success(function (res) {
                if(res.code==0){
                    layer.msg(res.message);
                    $rootScope.get_bank();
                }else{
                    layer.msg(res.message);
                }
            })
        })
    }
    //修改题库
    $scope.rev_bank = function(id){
        $scope.now_param = {};
        $(".cooper .layui-select-title").html("");
        $("#open_title").html("题库设置")
        var str = "";
        $scope.now_param.id = id;
        $scope.now_param.bank_title = $scope.df_select_bank.bank_title;
        $scope.now_param.bank_explain = $scope.df_select_bank.bank_explain;
        $scope.now_param.bank_creat = $scope.df_select_bank.creator_name;
        if($scope.df_select_bank.assistant==''){
            $scope.now_param.assistant = null;
        }else{
            $scope.now_param.assistant =$scope.df_select_bank.assistant;
            angular.forEach($scope.persons,function(items,indexs){
                if($scope.now_param.assistant.indexOf(items.user_id)!=-1){
                    items.check = true;
                    str+= '<a href="javascript:void(0)" onclick="del_check(\''+items.user_id +'\')">'+items.user_real_name+'<i class="iconfont icon-guanbi1"></i></a>'
                }
                $(".cooper .layui-select-title").html(str);
            });
        }

        $scope.layer_export = layer.open({
            type: 1,
            title: "",
            // shade:false,
            area: ["500px", "500px"],
            content: $("#bank_open")
        });
    };

    //删除试题
    $scope.delSub = function(id){
        //当前题库的id
        $scope.bank_id = $scope.df_select_bank.id;
        layer.confirm('删除后试题后将无法找回,确认删除吗？', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            services._del_test({subject_id:id,bank_id:$scope.bank_id}).success(function (res) {
                if(res.code==0){
                    layer.msg(res.message);
                    $scope.all_load();
                }else{
                    layer.msg(res.message);
                }
            })
        })
    }

    

    //下载题库--这个题库下所有试题
    $scope.down_bank = function(data){
        var This_bank = '<span style="color:#e63a3a">'+data.bank_title+'</span>';
        $scope.exportd = layer.confirm('此操作会下载'+This_bank+'下所有试题,是否确认下载？', {
            title:'下载窗口',
            btn: ['确定', '取消'] //按钮
        }, function () {
            $rootScope.loadingStart();
            services._get_allIds({bank_id:data.id}).success(function (res) {
                if(res.code==0){
                    $scope.all_list = res.data;
                    layer.close($scope.exportd);
                    setTimeout(function(){
                        $scope.all_socus = $("#now_allList").html();
                        var fragment = '<!DOCTYPE html>' +
                            '<html lang="en">' +
                            '<head>' +
                            '<meta charset="UTF-8">' +
                            '<title>answerCardDown</title>' +
                            '<style>' +
                            '*{margin:0;padding:0;}' +
                            '</style>' +
                            '</head>' +
                            '<body oncopy="return false;"  oncut="return false;" oncontextmenu="return false" ondragstart="return false" onselectstart ="return false" onbeforecopy="return false">' +
                            ''+$scope.all_socus+'</body>' +
                            '</html>';
                        $rootScope.loadingEnd();
                        services._send_fragment({fragment:fragment}).success(function (res) {
                            if(res.code==0){
                                var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + '/admin/subject/downloadSubjectsDoc ?htmlPath='+res.data + '"></iframe>');
                                $("#myOptionsBanks").append(iframe);
                            }
                        })
                    },1000)


                    // var all_ids = res;
                    //
                    // var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + '/admin/subject/downloadSubjects?ids=' + all_ids + '&token='+$rootScope.token+'"></iframe>');
                    // $("body").append(iframe);
                }

            })

        })
    }

});

