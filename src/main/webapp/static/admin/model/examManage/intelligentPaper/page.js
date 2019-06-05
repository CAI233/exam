myApp.controller('intelligentPaperController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
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
        return $rootScope.serverAction(ctxPath + '/admin/subject/intelligent', param, "POST");
    }

    var selNode = null;

    //题型
        //数学
    $scope.A_typeList = [
        {id: 1, name: '单选题', sname:"danxuan", num:0, score:0},
        {id: 2, name: '多选题', sname:"duoxuan", num:0, score:0},
        {id: 3, name: '判断题', sname:"panduan", num:0, score:0},
        {id: 4, name: '填空题', sname:"tiankong",num:0, score:0},
        {id: 5, name: '问答题', sname:"wenda", num:0, score:0},
        {id: 6, name: '综合题', sname:"zonghe", num:0, score:0}];
        //语文
    $scope.B_typeList = [
        {id: 1, name: '单选题', sname:"danxuan", num:0, score:0},
        {id: 2, name: '多选题', sname:"duoxuan", num:0, score:0},
        {id: 3, name: '判断题', sname:"panduan", num:0, score:0},
        {id: 4, name: '填空题', sname:"tiankong",num:0, score:0},
        {id: 5, name: '问答题', sname:"wenda", num:0, score:0},
        {id: 6, name: '综合题', sname:"zonghe", num:0, score:0},
        {id: 7, name: '写作题', sname:"xizuo", num:0, score:0}];
        //英语
    $scope.C_typeList = [
        {id: 1, name: '单选题', sname:"danxuan", num:0, score:0},
        {id: 2, name: '多选题', sname:"duoxuan", num:0, score:0},
        {id: 3, name: '判断题', sname:"panduan", num:0, score:0},
        {id: 4, name: '填空题', sname:"tiankong",num:0, score:0},
        {id: 5, name: '问答题', sname:"wenda", num:0, score:0},
        {id: 6, name: '综合题', sname:"zonghe", num:0, score:0}]

    //难易程度
    $scope.levelList = [{
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
        subject_type: 0,//题型
        subject_level: 0,//题型
        bank_id: 0,//题库
        know_type: 0,//知识点
    }

    $scope.bankDataList = [];
    $scope.curriculumData = null;
    $scope.gradeData = [];//年级
    $scope.specialtyData = [];//专业
    $scope.papersTypeDataList = [];//试卷类型

    //年级
    services._dic_list({
        pageNum: 1,
        pageSize: 1000,
        dic_code: '10000'
    }).success(function (res) {
        $scope.gradeData = res.data.rows;
    })
    // 专业
    services._dic_list({
        pageNum: 1,
        pageSize: 1000,
        dic_code: '20000'
    }).success(function (res) {
        $scope.specialtyData = res.data.rows;
    })
    //课程
    services._dic_list({
        pageNum: 1,
        pageSize: 1000,
        dic_code: '30000'
    }).success(function (res) {
        $scope.curriculumData = res.data.rows;
    })
    //试卷类别
    services._dic_list({
        pageNum: 1,
        pageSize: 1000,
        dic_code: '70000'
    }).success(function (res) {
        $scope.papersTypeDataList = res.data.rows;
    })

    //选择课程
    $scope.typeList = {};
    var all_curriculum = [];
    $scope.selectCurr = function(data){
        if(data.check){
            if(all_curriculum.length<3){
                switch (data.dic_name){
                    case "语文" : $scope.typeList[data.id] =  $scope.B_typeList;
                        break;
                    case "数学" : $scope.typeList[data.id] = $scope.A_typeList;
                        break;
                    case "英语" : $scope.typeList[data.id] = $scope.C_typeList;
                        break;
                    default: $scope.typeList[data.id] = $scope.A_typeList
                }
                all_curriculum.push(data.id);
            }else{
                layer.msg("最多同时选择3个课程");
                data.check = false;
            }
        }else{
            all_curriculum.some(function(item,index){
                if(item==data.id){
                    all_curriculum.splice(index,1);
                }
            })
            var new_array = {}
            angular.forEach($scope.typeList,function(key,value,index){
                if(parseInt(value)!=data.id){
                    new_array[parseInt(value)] = key;
                }
                if(parseInt(value)==data.id){
                    key.some(function(item,index){
                        item.num = 0;
                        item.score = 0;
                    })
                }

            })
            $scope.typeList = new_array;
        }
        $scope.selRow.subject_curriculum = all_curriculum;
    }
    //选择年级
    $scope.selectGra = function(data){
        angular.forEach($scope.gradeData,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
            }
        })
        $scope.selRow.subject_grade = data.id;
    }
    //选择专业
    $scope.selectSpe = function(data){
        angular.forEach($scope.specialtyData,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
            }
        })
        $scope.selRow.subject_specialty = data.id;
    }

    //难易度
    $scope.selectLevel = function(data){
        angular.forEach($scope.levelList,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
            }
        })
        $scope.selRow.subject_level = data.id;
    }
    $scope.selRow = {};

    //生成试卷
    $scope.generateExam = function () {
        if (!$scope.selRow.subject_grade) {
            layer.msg("请选择年级")
            return false;
        }
        if (!$scope.selRow.subject_specialty) {
            layer.msg("请选择专业")
            return false;
        }
        if (!$scope.selRow.subject_curriculum || $scope.selRow.subject_curriculum.length==0 ) {
            layer.msg("请选择课程")
            return false;
        }
        if(!$scope.selRow.subject_level){
            layer.msg("请填写难易度")
            return false;
        }
        var now_nums = []
        angular.forEach($scope.typeList,function(key,value) {
            var allnums = 0;
            key.some(function(item){
                allnums += item.num;
            })
             now_nums.push({
                 id:value,
                 nums:allnums
             });
        })
        var now_true = false;
        if(now_nums.length==0){
            now_true = false;
        }else{
            for(var i=0;i<now_nums.length;i++){
                if(now_nums[i].nums==0){
                    $scope.curriculumData.some(function(item){
                        if(item.id == now_nums[i].id){
                            layer.msg(item.dic_name+"没有选题，请选题");
                        }
                    })
                    now_true = false;
                    break;
                }
                now_true = true;
            }

        }
        if(now_true){
            layer.open({
                type: 1,
                title: "",
                area: ["800px", "600px"],
                content: $(".generateExam")
            });
        }
        //清空
        $scope.examRow.paper_title= null;
        $scope.examRow.paper_addr = null;
        $scope.examRow.paper_pass=null;
        $scope.examRow.paper_start=null;
        $scope.examRow.paper_end= null;
        $scope.examRow.paper_duration=null;
        $scope.examRow.paper_explain=null;
        $scope.examRow.paper_full=null

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
        // subjects: []
    }

    //分数判断
    $scope.show_socre = function(i){
        $scope.examRow.paper_pass = i.replace(/\D/g,'');
    }

    //生成试卷提交
    $scope.generateSubmit = function () {
        if (!$scope.examRow.paper_title) {
            layer.msg('请填写试卷标题');
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
        var Dtime = parseInt(Date.parse(new Date(($scope.examRow.paper_start+":00").replace(/\-/g,'/')))-parseInt(Date.parse(new Date(moment().format('YYYY-MM-DD HH:mm:ss').replace(/\-/g,'/')))));
        if (Dtime<0) {
            layer.msg('考试开始时间必须大于当前时间');
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
        if (!$scope.examRow.paper_pass || $scope.examRow.paper_pass==0) {
            layer.msg('请填写及格分数');
            return !1;
        }
        $scope.examRow.subject_levels = $scope.selRow.subject_level;
        $scope.examRow.subject_specialtys = $scope.selRow.subject_specialty;
        $scope.examRow.subject_grades = $scope.selRow.subject_grade;
        //
        var Aarr = {};
        angular.forEach($scope.typeList,function(key,value) {
            Aarr[value]={}
            angular.forEach(key, function (item,index) {
                if(item.num !=0 ){
                    Aarr[value][item.sname] = []
                    Aarr[value][item.sname].push(item.num);
                    Aarr[value][item.sname].push(item.score);
                }
            })
        })

        $scope.examRow.subject_curriculums = $scope.selRow.subject_curriculum
        $scope.examRow.subject_curriculumsinfo =  JSON.stringify(Aarr);

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
            var tt = Date.parse(new Date($scope.examRow.paper_end.replace(/\-/g,'/'))) - Date.parse(new Date($scope.examRow.paper_start.replace(/\-/g,'/')))
            $scope.examRow.paper_duration = tt / 1000 / 60
        }
    }
})
