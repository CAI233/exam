myApp.controller('examKnowledgeController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    //公共题库列表
    // services["_systemSubject"] = function (param) {
    //     return $rootScope.serverAction(ctxPath + '/admin/subject/systemSubject', param, "POST");
    // };
    //学校题库和公共题库（知识点）列表
    services["_get_Subject"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/knowledgeList', param, "POST");
    };
    //试题详情
    services["_sub_detail"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/getDetail', param, "POST");
    };
    //子题列表
    services["_sublis_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/single_Item', param, "POST");
    };

    $scope.all_banks =[{id:0,dic_name:"全部"},{id:1,dic_name:"公共题库"},{id:2,dic_name:"学校题库"}]
    $scope.all_param = {
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
        subject_curriculum: 0, //课程
        bank_id:0
    };
    $scope.param = {
        searchText: $stateParams.s
    };



    $scope.up_tf = false;
    $scope.down_tf = false;
    $scope.all_load = function(){
        services._get_Subject($scope.all_param).success(function (res) {
            if(res.code == 0){
                $scope.subjectList = res.data.rows;
                $scope.all_param.total = res.data.total;
                $scope.all_param.pages = res.data.pages;

                if($scope.up_tf){
                    $scope.selRow = $scope.subjectList[$scope.subjectList.length-1];
                    $scope.selRow['now_index'] = $scope.subjectList.length-1;
                    if($scope.selRow.subjectList){
                        $scope.parent_id = $scope.subjectList[$scope.subjectList.length-1].id;
                        $scope.selRows = $scope.subjectList[$scope.subjectList.length-1].subjectList;
                    }
                }
                if($scope.down_tf){
                    $scope.selRow = $scope.subjectList[0];
                    $scope.selRow['now_index'] = 0;
                    if($scope.selRow.subjectList){
                        $scope.parent_id = $scope.subjectList[0].id;
                        $scope.selRows = $scope.subjectList[0].subjectList;
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
    $scope.sort_nums = function(){
        $scope.all_param.timeOrder = null;
        $scope.all_param.countOrder = $scope.all_param.countOrder == 'desc' ? 'asc' : 'desc';
        //重新加载
        $scope.reload();
    }

    //按组卷次数排序

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
    //课程
    $scope.$watch('curriculum', function (data) {
        if(data){
            console.log(data);
            $scope.all_param.subject_curriculum = data.id;
            $scope.all_param.subject_type = 0;
            $scope.all_param.subject_level = 0;
            $scope.all_param.subject_knowledge = 0;
            $scope.reload();
        }
    });
    //知识点
    $scope.$watch('checked_knowledge', function (data) {
        if(data){
            console.log(data);
            $scope.all_param.subject_knowledge = data.id;
            $scope.reload();
        }
    },true);

    //搜索
    $scope.reload =function(){
        $scope.all_param.searchText = $scope.param.searchText;
        $scope.all_param.pageNum = 1;
        $scope.all_load();
    };

    //预览
    $scope.knowSub = function(data,index){
        $scope.selRow = data;
        console.log($scope.selRow);
        $scope.selRow['now_index'] = index;
        if(data.subjectList){
            $scope.parent_id = data.id;
            $scope.selRows = data.subjectList;
        }
        $scope.formOpen();
    }

    //上一题
    $scope.see_add = function(data){
        if(data.now_index==0){
            if($scope.all_param.pageNum==1){
                layer.msg("已经是最新的一题了")
            }else{
                $scope.all_param.pageNum = $scope.all_param.pageNum-1;
                $scope.up_tf = true;
                $scope.all_load();
            }
        }else{
            $scope.up_tf = false;
            data.now_index = data.now_index-1
            $scope.selRow = $scope.subjectList[data.now_index];
            $scope.selRow.now_index = data.now_index;
            if($scope.selRow.subjectList){
                $scope.parent_id = $scope.subjectList[data.now_index].id;
                $scope.selRows = $scope.subjectList[data.now_index].subjectList;
            }
        }
    };
    //下一题
    $scope.see_min = function(data){
        if(data.now_index== $scope.subjectList.length-1){
            if($scope.all_param.pageNum==$scope.all_pages){
                layer.msg("已经是最后的一题了")
            }else{
                $scope.all_param.pageNum = $scope.all_param.pageNum+1;
                $scope.down_tf = true;
                $scope.all_load();
            }
        }else{
            $scope.down_tf = false;
            data.now_index = data.now_index+1;
            $scope.selRow = $scope.subjectList[data.now_index];
            $scope.selRow.now_index = data.now_index;
            if($scope.selRow.subjectList){
                $scope.parent_id = $scope.subjectList[data.now_index].id;
                $scope.selRows = $scope.subjectList[data.now_index].subjectList;
            }
        }
    };

});

