/**
 * Created by Administrator on 2018/3/21 0021.
 */
myApp.controller('subject_addController', function ($rootScope, $scope, services, $sce, $stateParams) {

    //新增题库
    services["_add_bank"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/questionBank/saveBank', param, "POST");
    }

    //保存试题
    services["_save_addPaper"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/saveSubject', param, "POST");
    }

    $scope.all_param = {};
    //课程
    $scope.$watch('curriculum', function (data) {
        if (data) {
            console.log(data);
            $scope.all_param.subject_curriculum = data.id;
            $scope.reload();
            if($rootScope.checked_knowledge){
                $rootScope.checked_knowledge.checked = false;
                $rootScope.checked_knowledge = null;
            }

        }
    });

    //选中 知识点
    $scope.$watch('checked_knowledges', function (data) {
        if (data) {

            $scope.all_param.subject_knowledge = null;
            var arr = [];
            angular.forEach(data, function (item) {
                arr.push(item.id);
            });
            $scope.all_param.subject_knowledge = arr.toString();
        }
    }, true);

    //课程切换
    $scope.reload = function(){
        $rootScope.checked_knowledges = null;
        $scope.all_param.subject_knowledge = null;
        $scope.get_types($scope.all_param.subject_curriculum);
        $scope.get_knowledges($scope.all_param.subject_curriculum);
        $scope.textPaper();

    }

    $scope.bank_load = function () {
        services._getBankList().success(function (res) {
            $scope.bank_exams_array = res.data;
            angular.forEach($scope.bank_exams_array,function(item,index){
                if($scope._bank_param.bank_title==item.bank_title){
                    $scope.all_param.bank_id = item.id;
                    $scope.all_param.bank_name = item.bank_title;
                }
            })
        });
    };
    $scope.bank_load();

    $scope._bank_param = {
        bank_title:null
    }
    //新增题库
    $scope.addBank = function ($event) {
        $rootScope.stopEvent($event);

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

    $scope.get_knowledges = function(id){
        //加载知识点
        services._getKnowledge({
            struct_curriculum: id
        }).success(function (res) {
            $scope.upload_knowledges = res.data;
        })
    }

    //得到题型
    $scope.get_types = function(id){
        $scope.subject_types = [];
        angular.forEach($rootScope.curriculums,function(items){
            if(id == items.id){
                angular.forEach(items.children, function (item) {
                    $scope.subject_types.push(item);
                })
            }
        })


    }

    $scope.textPaper = function() {
        setTimeout(function () {
            // scope.Bhtml =  '<p style="padding:5px;background: #c4c4c4" contenteditable="false"><span class="subject_question">【题干】</span></p>'
            $(document.getElementById('addPaperIframe').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_question">【题干】</span></p>'));
            $(document.getElementById('addPaperIframe').contentWindow.ue.setContent('<p style="padding:5px;"><span class="subject_answer">【答案】</span></p>', true));
            $(document.getElementById('addPaperIframe').contentWindow.ue.setContent('<p style="padding:5px"><span class="subject_analysis">【解析】</span></p>', true));
        }, 500)
    }


    $scope.sub_add = function(){
        var context = null;
        context = document.getElementById('addPaperIframe').contentWindow.ue.getContent();
        console.log($scope.all_param)
        $scope.all_param.opContext = context;
        var now_currum = angular.copy($scope.all_param.subject_curriculum);
        services._save_addPaper($scope.all_param).success(function (res) {
            if(res){
                $scope.all_param = {
                    subject_curriculum:now_currum,
                    subject_type:null,
                    subject_level:null,
                    bank_name:null,
                    bank_id:null,
                    opContext:null
                };
                $scope.reload();
                angular.forEach($scope.upload_knowledges, function (item) {
                    item.checked_box = false;
                    $scope.eachChild_all_clear1(item);
                });
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







})