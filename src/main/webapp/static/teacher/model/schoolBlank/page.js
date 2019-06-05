myApp.controller('schoolBlankController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    //学校题库列表
    services["_systemSubject"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/schoolQuestionBank', param, "POST");
    };
    //试题详情
    services["_sub_detail"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getDetail', param, "POST");
    };
    //子题列表
    services["_sublis_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/single_Item', param, "POST");
    };
    // 学校题库试题删除
    services["_del_test"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/delBankSubject', param, "POST");
    };
    
    $scope.all_param = {
        reload: true,
        pages: 0,
        total: 0,
        pageSize: 10,
        pageNum: 1,
        timeOrder: null, // asc desc
        countOrder: null, // asc desc
        searchText: $stateParams.s,
        subject_type:null,//题型
        subject_level:null,//难易度
        subject_knowledge:0,//知识点ID
        subject_curriculum: 0 //课程
    };
    $scope.param = {
        searchText: $stateParams.s
    }

    $scope.up_tf = false;
    $scope.down_tf = false;
    $scope.subjectList = null;
    //页面加载---
    $scope.all_load = function(){
        if(!$scope.all_param.reload){
            return false;
        }
        $scope.all_param.reload = false;
        $scope.subjectList = null;
        services._systemSubject($scope.all_param).success(function (res) {
            $scope.all_param.reload = true;
            if(res.code == 0){
                $scope.subjectList = res.data.rows;
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
            }
        })
    };
    //按时间顺序排序
    $scope.sort_time = function(){
        $scope.all_param.countOrder = null;
        $scope.all_param.timeOrder = $scope.all_param.timeOrder == 'desc' ? 'asc' : 'desc';
        //重新加载
        $scope.reload();
    };
    //按组卷次数排序
    $scope.sort_nums = function(){
        $scope.all_param.timeOrder = null;
        $scope.all_param.countOrder = $scope.all_param.countOrder == 'desc' ? 'asc' : 'desc';
        //重新加载
        $scope.reload();
    }

    //按组卷次数排序

    $scope.replacehtml = function (html) {
        $scope.replacehtml = function (html) {
            if ($scope.all_param.searchText) {
                var re = new RegExp($scope.all_param.searchText, "gm")
                var rd = "<em class='searchTxt'>" + $scope.all_param.searchText + "</em>";
                return html ? html.replace(/vertical-align:text-bottom;/g, "").replace(/font-weight:bold;/g, "font-weight: bold;line-height: 2em; font-size: 1.2em;").replace(re, rd) : html;
            }
            else {
                return html ? html.replace(/vertical-align:text-bottom;/g, "").replace(/font-weight:bold;/g, "font-weight: bold;line-height: 2em; font-size: 1.2em;") : html;
            }
        };
    };
    //课程
    $scope.$watch('curriculum', function (data) {
        if(data){
            $scope.all_param.subject_curriculum = data.id;
            $scope.all_param.subject_type = 0;
            $scope.all_param.subject_level = 0;
            $scope.all_param.subject_knowledge = 0;
            $scope.all_param.countOrder = null;
            $scope.all_param.timeOrder = 'desc';
            if($rootScope.checked_knowledge){
                $rootScope.checked_knowledge.checked = false;
                $rootScope.checked_knowledge = null;
            }
            $scope.reload();
        }
    });
    //知识点
    $scope.$watch('checked_knowledge', function (data) {
        if(data){
            $scope.all_param.subject_knowledge = data.id;
            $scope.reload();
        }
        else{
            $scope.all_param.subject_knowledge = 0;
            $scope.reload();
        }
    },true);


    //搜索
    $scope.reload =function(){
        $scope.all_param.searchText = $scope.param.searchText;
        $scope.all_param.pageNum = 1;
        $scope.all_load();
    };

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


    //删除试题
    $scope.delSub = function(data){
        layer.confirm('删除后试题后将无法找回,确认删除吗？', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            services._del_test({subject_id:data.id,bank_id:data.bank_id}).success(function (res) {
                if(res.code==0){
                    layer.msg(res.message);
                    $scope.all_load();
                }else{
                    layer.msg(res.message);
                }
            })
        })
    }

});

