myApp.controller('homeController', function ($rootScope, $scope, services, $sce,$state, $stateParams) {
    $scope.services = services;
    //最近考试
    services["_sub_detail"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/V2getList', param, "POST");
    };
    //最新试卷
    services["_homePaperList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/homePaperList', param, "POST");
    };
    //删除试卷
    services["_del_papers"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/v2delpaper', param, "POST");
    };
    //考试发布
    services["_pub_papers"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/paperRelease', param, "POST");
    };
    //考试撤销发布
    services["_put_papers"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/paperRevoke', param, "POST");
    };
    //动态答题卡
    services["_down_answerMcard"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/saveAnswerHtml', param, "POST");
    };
    //当前考试的信息
    services["_get_answerMcards"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/examAnswers', param, "POST");
    };
    $scope.search_param = {
        s: null,
        search_type: 2,
        search_name: '试卷'
    }
    $scope.param = {
        paper_curriculum: null,
        pageNum: 1,
        pageSize: 20
    }
    //最新试卷
    $scope.papers = null;
    $scope.load = function (type) {
        if (type)
            $scope.param.paper_curriculum = type;
        else
            $scope.param.paper_curriculum = null;
        services._homePaperList($scope.param).success(function (res) {
            $scope.papers = res.data.rows;
        })
    }
    $scope.load();
    $scope.toSearchPage = function () {
        if ($scope.search_param.search_type == 1) {
            $rootScope._toPage('exams', {
                s: $scope.search_param.s
            })
        }
        else {
            $rootScope._toPage('examps', {
                s: $scope.search_param.s
            })
        }
    }
    $scope.sub_detail_list = null;
    //最近考试
    $scope.exam_load = function(){
        services._sub_detail({
            pageNum: 1,
            pageSize: 5,
            searchText: null,
            paper_curriculum: null,
            paper_type: null
        }).success(function (res) {
            $scope.sub_detail_list = res.data.rows;
        });
    };
    $scope.exam_load();

    $scope.getStates = function (t) {
        if(t == 1)
            return $rootScope._trustAsHtml('<label class="state s1"><i class="iconfont icon-dengdai1"></i>未发布</label>')
        else if(t == 2)
            return $rootScope._trustAsHtml('<label class="state s2"><i class="iconfont icon-dengdai2"></i>待考试</label>')
        else if(t == 3)
            return $rootScope._trustAsHtml('<label class="state s3"><i class="iconfont icon-dengdai"></i>考试中</label>')
        else
            return $rootScope._trustAsHtml('<label class="state s4"><i class="iconfont icon-wancheng"></i>考试结束</label>')
    }

    //发布考试
    $scope.pub_list = function(data){
        services._pub_papers({id:data.id,status:data.status}).success(function (res) {
            if(res.code==0){
                layer.msg(res.message);
                //重新加载
                $scope.exam_load();
            }else{
                layer.msg(res.message);
            }
        });
    };
    //撤销发布
    $scope.put_list = function(data){
        services._put_papers({id:data.id,status:data.status}).success(function (res) {
            if(res.code==0){
                layer.msg(res.message);
                //重新加载
                $scope.exam_load();
            }else{
                layer.msg(res.message);
            }
        });
    };
    //删除考试
    $scope.del_list = function(data){
        layer.confirm('删除后将无法找回,确认删除吗？', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            services._del_papers({id:data.id}).success(function (res) {
                if(res.code==0){
                    layer.msg(res.message);
                    //重新加载试卷
                    $scope.exam_load();
                }else{
                    layer.msg(res.message);
                }
            })
        });
    };
    //修改考试
    $scope.rev_list = function(data){
        //把本试卷信息存储
        if(data.status==1){
            //跳转
            $state.go("new_Exampaper",{id:data.id});
            $rootScope.paper_tf = false;
        }else{
            layer.msg("考试只有未发布状态下才可以修改")
        }
    };

    //试卷预览
    $scope.lookPaper = function (item) {
        window.open(window.location.origin +item.paper_url)
    }

    //跳转 查看考试分析
    $scope.ana_list = function(data){
        if(data.status == 5){
            layer.msg("成绩还在导入中，请稍后")
            return false;
        }

        $state.go("examAnalisis",{paper_id:data.pbank_id});
    }
    //导入成绩
    $scope.import_list = function (item){
        if(item.status == 5){
            layer.msg("成绩还在导入中，请稍后再导入")
            return false;
        }
        $('#exam-import').click().prettyFileExcl({
            text:item.id,
            change: function (res,obj) {
                //加载刷新
                $scope.exam_load();
                /*services._put_Import({
                    paper_id: item.id,
                    url: res.data[0].url,
                    file_name: res.data[0].name
                }).success(function (res) {
                    if (res.code == 0) {
                        layer.alert(res.message);
                    }
                    else {
                        layer.alert(res.message);
                    }
                })*/
            },
            init: function (obj) {
                $(".file-btn-ku", obj).remove();
                $(".file-btn-text", obj).removeClass("layui-btn");
            }
        })
    }

    $scope.now_examAll = {};

    $scope.select = function(data,index){
        $scope.now_index = index;
    }

    $scope.sortObjectType = function(obj){
        var name = null;
        name =  obj.sort($rootScope._by("subject_type"));
        return name;
    }
    //获取当前考试信息
    $scope.getAnswers = function(data){
        services._get_answerMcards({pbank_id:data.pbank_id,id:data.id,paper_curriculum:data.paper_curriculum,source:data.source}).success(function (res) {
            if(res.code==0){
                $rootScope.loadingEnd();
                $scope.now_examAll = res.data;
                console.log(res.data);
                $scope.layer_export = layer.open({
                    type: 1,
                    title: "",
                    area: ["500px", "200px"],
                    content: $("#down_test")
                });
            }
        })
    }
    //下载试卷
    $scope.downPaper = function (item){
        $scope.now_index = null;
        $scope.down_paper = 1;
        $rootScope.loadingStart();
        $scope.getAnswers(item);
    };
    //下载答案
    $scope.downAnswer = function(item){
        $scope.now_index = null;
        $scope.down_paper = 2;
        $rootScope.loadingStart();
        $scope.getAnswers(item);
    }

    $scope.replac_allN = function(html){
        // return html ? html.replace(/text-align:justify;/g, "text-align:left;").replace(/text-align:start;/g, "text-align:left;").replace(/text-align: justify/g, "text-align:left;").replace(">",">答案：") : html;
        // return html ? html.replace(">",">答案：").replace(/<p.*?>(.*?)<\/p>/g,function(match,p1){return p1}):html;
        return html ? html.replace(/<p.*?>(.*?)<\/p>/g,function(match,p1){return p1}):html;
    }
    $scope.replac_allA = function(html){
        // return html ? html.replace(/text-align:justify;/g, "text-align:left;").replace(/text-align:start;/g, "text-align:left;").replace(/text-align: justify/g, "text-align:left;").replace(">",">解析：") : html;
        return html ? html.replace(">",">解析：").replace(/<p.*?>(.*?)<\/p>/g,function(match,p1){return p1}):html;
    }
    $scope.replac_allS = function(html){
        // return html ? html.replace(/text-align:justify;/g, "text-align:left;").replace(/text-align:start;/g, "text-align:left;").replace(/text-align: justify/g, "text-align:left;").replace(">",">答案：") : html;
        return html ? html.replace(">",">答案：").replace(/<p.*?>(.*?)<\/p>/g,function(match,p1){return p1}):html;

    }

    $scope.down_get = function(){
        //下载试卷
        if($scope.now_index==1 && $scope.down_paper==1){
            console.log('下载试卷');
            var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + '/admin/pbank/downPBank?id=' + $scope.now_examAll.pbank_id + '"></iframe>');

            $("#home").append(iframe);
        }
        //下载答题卡
        if($scope.now_index==2 && $scope.down_paper==1){
            if($scope.now_examAll.source!=2){
                console.log('动态答题卡');
                $scope.all_socus = $("#now_answerCard").html();
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
                services._down_answerMcard({fragment:fragment}).success(function (res) {
                    if(res.code==0){

                        var a = document.createElement('a');
                        a.href = $rootScope.ctxPath + '/admin/pbank/downloadAnswerCard?answerPath=' + res.data + '&answerType=1';
                        a.target = '_blank';
                        a.download = 'answerCardDown.pdf';
                        $("#home").append(a);
                        a.click();
                        // var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + '/admin/pbank/downloadAnswerCard?answerPath=' + res.data + '&answerType=1"></iframe>');
                        // $("#myExamManage").append(iframe);
                        // console.log(res);
                    }
                })
            }else{
                console.log('模板答题卡')
                if($rootScope._get_curriculum_name($scope.now_examAll.paper_curriculum)=='语文'){
                    var src_name = 'yuwen';
                    var now_name = "yuwen";
                }else if($rootScope._get_curriculum_name($scope.now_examAll.paper_curriculum)=='数学'){
                    var src_name = 'shuxue';
                    var now_name = "shuxue";
                }else if($rootScope._get_curriculum_name($scope.now_examAll.paper_curriculum)=='英语'){
                    var src_name = 'yingyu';
                    var now_name = "yingyu";

                }else if($rootScope._get_curriculum_name($scope.now_examAll.paper_curriculum)=='专科'){
                    var src_name = 'zhuanke';
                    var now_name = "zhuanke";
                }else{
                    var src_name = 'zonghe';
                    var now_name = "zonghe";
                }
                var src_addr = $rootScope.ctxPath + "/static/excelFile/" + src_name+'.pdf';

                var a = document.createElement('a');
                a.href = src_addr;
                a.target = '_blank';
                a.download = now_name+'.pdf';
                $("#home").append(a);
                a.click();
            }
        }

        //下载答题情况表格
        if($scope.now_index==3 && $scope.down_paper==2){
            console.log('下载答题情况表格');
            var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + '/admin/excelImport/studentInfoExport?paper_id='+$scope.now_examAll.id + '"></iframe>');

            $("#home").append(iframe);
        }
        //下载客观题答案
        if($scope.now_index==4 && $scope.down_paper==2){
            if($scope.now_examAll.source!=2){
                var arr = [];
                for(var k in $scope.now_examAll.answerCard){
                    for(var j in $scope.now_examAll.answerCard[k]){
                        arr.push(j);
                    }
                }
                if(!(arr.indexOf('1')!=-1)){
                    layer.msg("当前试卷中没有客观题");
                    return false;
                }
            }

            var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + '/admin/excelImport/paperAnswer?paper_id='+$scope.now_examAll.id + '"></iframe>');
            $("#home").append(iframe);
        }
        //下载所有答案
        if($scope.now_index==5 && $scope.down_paper==2){

            $scope.all_socus = $("#now_answer").html();
            var fragment = '<!DOCTYPE html>' +
                '<html lang="en">' +
                '<head>' +
                '<meta charset="UTF-8">' +
                '<title>allAnswer</title>' +
                '<style>' +
                '*{margin:0;padding:0;}' +
                '</style>' +
                '</head>' +
                '<body oncopy="return false;"  oncut="return false;" oncontextmenu="return false" ondragstart="return false" onselectstart ="return false" onbeforecopy="return false">' +
                ''+$scope.all_socus+'</body>' +
                '</html>';

            services._down_answerMcard({fragment:fragment}).success(function (res) {
                if(res.code==0){
                    var a = document.createElement('a');
                    a.href = $rootScope.ctxPath + '/admin/pbank/downloadAnswerCard?answerPath=' + res.data + '&answerType=2';
                    a.target = '_blank';
                    a.download = 'allAnswer.pdf';
                    $("#home").append(a);
                    a.click();
                    // var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + '/admin/pbank/downloadAnswerCard?answerPath=' + res.data + '&answerType=2"></iframe>');
                    // $("#myExamManage").append(iframe);
                    // console.log(res);
                }
            })

            // var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + '/admin/papers/downloadAnswers?id='+$scope.now_examAll.pbank_id + '&token='+$rootScope.token+'"></iframe>');
            // $("#myExamManage").append(iframe);


        }
        // layer.close($scope.layer_export);

    }
});

