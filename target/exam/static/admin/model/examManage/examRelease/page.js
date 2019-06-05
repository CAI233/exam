myApp.controller('examReleaseController', function ($rootScope, $scope, services, $sce, $stateParams) {
    //学生列表
    services["_get_students"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/classes/classList', param, "POST");
    };
    //获取试卷-----学校试卷
    services["_get_papers"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/schoolPbank', param, "POST");
    };
    //新增----修改考试
    services["_new_exampaper"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/newExamination', param, "POST");
    };
    //修改考试试卷
    services["_rev_paper"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/updatePaperPbank', param, "POST");
    };

    //提交的对象----默认
    $scope._submit = {};
    //验证码
    $scope.getRand = function () {
        return randCode();
    };

    function randCode() {
        var vCode = "";
        for (var i = 0; i < 6; i++) {
            vCode += Math.floor(Math.random() * 10);
        }
        return vCode;
    }

    $scope.param = {
        pages: 1,
        pageSize: 10,
        pageNum: 1,
        total:0
        // token:$rootScope.token
    };
    //获取自己的试卷
    services._get_papers($scope.param).success(function(res){
        if(res.code==0){
            console.log(res);
            $scope.paperData = res.data.rows;
        }
    });



    //获取考试是否为新增
    $scope.revFalse = false;

    $scope.exam_classes = [];
    $scope.exam_classes_ids = [];
    //考生选择
    $scope.classes = [];
    $scope.classes_ids = [];

    //获取学生
    $scope.result = null;
    $scope.stu_open = function(){
        console.log($scope.classes)
        if($scope.result==null){
            services._get_students($scope.param).success(function (res) {
                if(res.code==0){
                    $scope.result = res.data;
                    localStorage.setItem("now_class",JSON.stringify($scope.result));
                }
            })
        }else{
            var now = localStorage.getItem("now_class");
            $scope.result = JSON.parse(now);
        }
        $scope.layer_export = layer.open({
            type: 1,
            title: "",
            area: ["700px", "600px"],
            content: $("#stu_nums")
        });
    };


    $scope.select = function(data){
        //页面显示默认选中年级
        data.selected = !data.selected;
        if(data.selected){
            if($scope.classes && $scope.classes.length>0){
                angular.forEach(data.personList,function(items,indes){
                    angular.forEach($scope.classes,function(item,index){
                        if(item.id==items.id){
                            $scope.classes.splice(index,1);
                            $scope.classes_ids.splice(index,1);
                        }
                    })
                })
            }
            angular.forEach(data.personList,function(items,indexs){
                items.selected = data.selected;
                $scope.classes.push(items);
                $scope.classes_ids.push(items.id)
            })
        }else{
            angular.forEach(data.personList,function(items,indexs){
                items.selected = data.selected;
                angular.forEach($scope.classes,function(item,index){
                    if(item.id==items.id){
                        $scope.classes.splice(index,1);
                        $scope.classes_ids.splice(index,1);
                    }
                })
            })
        }
    };

    //未保存前的操作------删除学生
    $scope.del_class = function(data,index){
        $scope.classes.splice(index,1);
        $scope.classes_ids.splice(index,1);
    };

    //选择学生 保存
    $scope.save_class = function(){
        $scope.exam_classes = angular.copy($scope.classes);
        console.log($scope.exam_classes);
        $scope.exam_classes_ids = $scope.classes_ids;
        console.log($scope.classes_ids);
        layer.close($scope.layer_export);
    };


    //保存后的学生操作-----删除学生
    $scope.del_Examclass = function(data,index){
        $scope.exam_classes.splice(index,1);
        $scope.exam_classes_ids.splice(index,1);
    };


    //保存考试
    $scope.new_Exam = function(){

        $scope._submit.studentIds = $scope.exam_classes_ids;
        if($scope.exam_classes.length==0){
            layer.msg("请选择考生加入");
            return false;
        }

        var now_start = parseInt(Date.parse(new Date(($scope._submit.paper_start+':00 ').replace(/\-/g,'/'))));
        var now_duration = parseInt($scope._submit.paper_duration)*60*1000;

        function Time(now){
            var Data = new Date(now);
            var year=Data.getFullYear();
            var month=Data.getMonth()+1;
            var date=Data.getDate();
            var hour=Data.getHours()<10 ? '0'+Data.getHours() :Data.getHours();
            var minute=Data.getMinutes()<10 ? '0'+Data.getMinutes() :Data.getMinutes();
            var second=Data.getSeconds()<10 ? '0'+Data.getSeconds() :Data.getSeconds();
            return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
        }
        var now_end = Time(now_start+now_duration);
        $scope._submit.paper_end = now_end;
        console.log($scope._submit);
        This_form.on('submit(formDemo)', function (data) {
            services._new_exampaper($scope._submit).success(function (res) {
                if(res.code==0){
                    layer.msg(res.message);
                    $state.go('examInation');
                }else{
                    layer.msg(res.message);
                }
            })
        });

    };

});
