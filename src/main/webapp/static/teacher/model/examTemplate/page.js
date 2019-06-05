myApp.controller('examTemplateController', function ($rootScope, $scope, services,$state, $sce, $stateParams) {
    $scope.services = services;
    //试卷列表
    services["_sub_list"] = function (param) {
        // return $rootScope.serverAction(ctxPath + '/admin/papers/my_Test_Paper', param, "POST");
        return $rootScope.serverAction(ctxPath + '/admin/template/getPageList', param, "POST");
    };
    //模板信息
    services["_open_Subject"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/templatedetail/getByIdPageList', param, "POST");
    }
    //模板试题列表
    services["_temp_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/getPageList', param, "POST");
    };
    //根据模板生成试题
    services["_getSubjectsByTemplate"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/template/getSubjectsByTemplate', param, "POST");
    }
    //课程
    $scope.lnow_currum = null;
    $scope.$watch('curriculum', function (data) {
        if (data) {
            $scope.lnow_currum = data.id;
            $scope.tempList();
            // $scope.all_param.subject_curriculum = data.id;
        }
    });
    $scope.param = {
        pages: 1,
        pageSize: 8,
        total: 0,
        pageNum: 1,
        searchText: null
    };


    $scope.examTempList = [];
    $scope.tempList = function (){
        $scope.examTempList = [];
        $scope.param.curriculum = $scope.lnow_currum;
        services._sub_list($scope.param).success(function (res) {
            var data = res.data;
            $scope.templist = data.rows;
            $scope.param.total = res.data.total;
            $scope.param.pages = res.data.pages;
            angular.forEach($scope.templist,function(item,index){
                $scope.examTempList.push(item)
            })

            laypage.render({
                elem: "pager",
                count:$scope.param.total,
                curr: $scope.param.pageNum || 1,
                limit: $scope.param.pageSize,
                layout: ['prev', 'page', 'next', 'skip'],
                skip: true,
                jump: function (resPager) {
                    if (resPager.curr != $scope.param.pageNum) {
                        $scope.param.pageNum = parseInt(resPager.curr);
                        $scope.tempList();
                    }
                }
            });

        })
    };

    $scope.retu_currm = function(data){
        var now = data.split(",").map(function(data){
            return +data
        });
        return now;
    };

    //预览
    $scope.previewTemp = function (item){
        services._open_Subject({id:item.id}).success(function (res) {
            if(res.code==0){
                $scope.template_list = res.data;
                $scope.Tem_list = res.data.templateDetailCondition.datiList;
                $scope.formOpen()
                console.log($scope.Tem_list);
            }else{
                layer.msg(res.message);
            }
        })
    }
    //立即使用
    $scope.useTemp = function (item) {
        $rootScope.loadingStart();
        services._getSubjectsByTemplate({
            id: item.id,
            paper_level: 10075
        }).success(function (bas) {
            if(bas.code != 0 && bas.code != 1){
                layer.closeAll();
                layer.alert(bas.message);
                return false;
            }
            if(bas.code==1){
                layer.closeAll();
                //layer.alert("当前模板未配置试题");
                layer.alert(bas.message);
                return false;
            }
            services._getDicTree({
                dic_parentcode: '30000'
            }).success(function (res) {
                var PrivateBasketExams = res.data;
                angular.forEach(bas.data.templateDetailList, function (dati) {
                    angular.forEach(PrivateBasketExams, function (kc) {
                        if(kc.id == dati.subject_curriculum){
                            angular.forEach(kc.children, function (tx) {
                                if(tx.id == dati.subject_type){
                                    tx.children = dati.subjectList;
                                    tx.detail_marks = dati.detail_marks ? dati.detail_marks:dati.subject_marks;
                                    tx.detail_number = 0;
                                    tx.pbank_title = dati.subject_large_title;
                                    tx.paper_explain = dati.subject_remark;
                                    tx.detail_order = dati.subject_sort;
                                    angular.forEach(dati.subjectList, function (st) {
                                        if(st.subjectList && st.subjectList.length > 0){
                                            tx.detail_number += st.subjectList.length;
                                        }
                                        else{
                                            tx.detail_number += 1;
                                        }
                                    })
                                }
                            })
                        }
                    })
                })
                var str = null, arr = [], dt = [];
                ////////////////////////////清空多余课程////////////////////////////////////
                angular.forEach(PrivateBasketExams, function (kc) {
                    ////////////////////////////清空多余大题////////////////////////////////////
                    dt = [];
                    angular.forEach(kc.children, function (tx) {
                        if (tx.children && tx.children.length > 0) {
                            dt.push(tx)
                        }
                    })
                    kc.children = dt;
                    if(dt.length > 0){
                        arr.push(kc);
                        str = str ? (str += ',' + kc.id) : kc.id;
                    }
                    ////////////////////////////清空多余大题////////////////////////////////////
                });
                ////////////////////////////清空多余课程////////////////////////////////////
                PrivateBasketExams = arr;
                angular.forEach(PrivateBasketExams, function (kc, i) {
                    var kc_1 = {
                        paper_detail_id: null,
                        paper_id: null,
                        subject_id: kc.id,
                        subject_pid: null,
                        option_type: 1,
                        detail_marks: 0,
                        detail_number: 0,
                        detail_order: (i + 1),
                        subject_type: 0,
                        pbank_title: null,
                        paper_explain: null,
                        children: []
                    }
                    angular.forEach(kc.children, function (tx, ii) {
                        var tx_1 = {
                            paper_detail_id: null,
                            paper_id: null,
                            subject_id: tx.id,
                            subject_pid: null,
                            option_type: 2,
                            detail_marks: tx.detail_marks,
                            detail_number: tx.detail_number,
                            detail_order: tx.detail_order,
                            subject_type: 0,
                            pbank_title: tx.pbank_title,
                            paper_explain: tx.paper_explain,
                            children: []
                        }
                        angular.forEach(tx.children, function (st, iii) {
                            var st_1 = {
                                paper_detail_id: null,
                                paper_id: null,
                                subject_id: st.id,
                                subject_pid: null,
                                option_type: 3,
                                detail_marks: st.detail_marks ? st.detail_marks:st.subject_marks,
                                detail_number: st.subjectList ? st.subjectList.length : 0,
                                detail_order: parseInt(st.sub_sort),
                                subject_type: st.subject_type,
                                pbank_title: null,
                                paper_explain: null,
                                children: []
                            }
                            if(st.subjectList && st.subjectList.length > 0) {
                                angular.forEach(st.subjectList, function (xst, iiii) {
                                    var xst_1 = {
                                        paper_detail_id: null,
                                        paper_id: null,
                                        subject_id: xst.id,
                                        subject_pid: null,
                                        option_type: 4,
                                        detail_marks: xst.detail_marks ? xst.detail_marks:xst.subject_marks,
                                        detail_number: 0,
                                        detail_order: parseInt(st_1.detail_order) + iiii,
                                        subject_type: xst.subject_type,
                                        pbank_title: null,
                                        paper_explain: null,
                                        children: []
                                    }
                                    st_1.children.push(xst_1)
                                    kc_1.detail_number = xst_1.detail_order > kc_1.detail_number ? xst_1.detail_order : kc_1.detail_number;
                                })
                                //st_1.detail_order = 0;
                            }
                            kc_1.detail_number = st_1.detail_order > kc_1.detail_number ? st_1.detail_order : kc_1.detail_number;
                            tx_1.children.push(st_1);
                        })
                        kc_1.children.push(tx_1);
                        kc_1.detail_marks += tx_1.detail_marks;
                    })
                    param.children.push(kc_1);
                    param.paper_full +=  kc_1.detail_marks;
                })

                param.is_template = item.id;
                param.totalNum = item.id;
                param.paper_curriculum = str;
                param.paper_pass = bas.data.test_pass;
                param.paper_duration = bas.data.test_long;
                param.paper_full = bas.data.test_total;
                param.paper_type = bas.data.template_type;
                param.totalNum +=  param.children[param.children.length - 1].detail_number;
                console.log(param)

                //模板组卷
                services._savePaper(param).success(function (res) {
                    if(res.code == 0){
                        //清空试题篮
                        //$rootScope._delQuestionAll();
                        $rootScope._toPage("examPaper",{
                            source: 2,
                            id: res.data
                        })
                    }
                    else{
                        layer.closeAll();
                        layer.alert(res.message);
                        $rootScope.showShopFn();
                    }
                })
            })

        });
    }
    var configParam = {
        paper_title: true, //主标题  1
        paper_subtitle: false, //副标题  1
        paper_attention: false, //注意事项 1
        success: false, //考试顺利  1
        student_info: false, //考生信息
        show_kc: true, //显示课程 1
        show_num: true, //小题分数
        show_max_tg: true, //显示大题 1
        paper_full: true //总分总时 1
    }
    var param = {
        id: null,
        paper_full: 0, //总分
        totalNum: 0, //总数
        paper_title: "未命名", //主标题
        paper_subtitle: (new Date()).getFullYear() + "年湖北省普通高等学校招收中职毕业生技能高考", //副标题
        paper_explain: '', //试卷描述
        paper_pass: 60, //及格分
        paper_duration: 120, //考试用时
        paper_curriculum: null, //所属课程
        paper_type: 10042, //试卷类型
        paper_type_name: '课堂练习',
        assistant: null, // 协作者
        paper_level: 10075, //难易度
        paper_level_name: '简单',
        source: 2,
        is_template: null, //模版id
        // is_open: 0, //是否公开
        is_open: $rootScope.superManage()==true ? 1:0, //是否公开
        configure: JSON.stringify(configParam), //试卷配置
        subjectList: [], //试题集合
        children: [], //试题集合
        fragment: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>试卷预览</title><style>body{background:#f4f4f4;margin:0;padding:0}.paper-html{padding:30px 100px;width:842px;box-sizing:border-box}</style></head><body><div style="font-size: 14px;margin: 0 auto;background: #fff" class="paper-html"></div></body></html>' //试卷片段
    }



})
