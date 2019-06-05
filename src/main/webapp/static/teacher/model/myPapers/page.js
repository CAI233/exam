myApp.controller('myPapersController', function ($rootScope, $scope, services, $sce,$state,$stateParams) {
    //获取我的试卷 接口
    services["_sub_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/pbankList', param, "POST");
    };
    //删除试卷
    services["_del_testList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/delPbank', param, "POST");
    };
    //试卷设置
    services["_update_testList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/updateInfoPbank', param, "POST");
    };
    //试卷的html
    services["_get_paperHtml"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/getHtmlStrByUrl', param, "POST");
    };
    //重新保存试卷碎片
    services["_savePbank_html"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/savePbank_html', param, "POST");
    }
    //协助者 接口
    services["_assistantList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/assistantList', param, "POST");
    };
    //试卷片段 接口
    services["_get_papers"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/getHtmlStrByUrl', param, "POST");
    };
    //当前试卷信息
    services["_get_answerMcards"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/papers/examAnswers', param, "POST");
    };
    //试题答案答题卡
    services["_down_answerMcard"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/saveAnswerHtml', param, "POST");
    };
    //试题答案答题卡
    services["_save_paperList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/savePbank_html', param, "POST");
    };
    $scope.param={
        pageNum: 1,
        pageSize: 10,
        paper_level:null,
        paper_type:null,
        searchText:null
    };

    //当前登录人的id
    $scope.now_creat_id = JSON.parse(window.sessionStorage.getItem("_USERINFO")).user_id;

    //返回课程名
    $scope.retu_currm = function(data){
        var now = data.split(",").map(function(data){
            return +data
        });
        return now;
    };

    //返回试卷类型
    $scope.retu_type = function(data){
        var This_name = null;
        angular.forEach($rootScope.paperDataTypes,function(item,index){
            if(data==item.id){
                This_name = item.dic_name;

            }
        });
        return This_name;
    };
    //试卷列表
    $scope.all_load = function(){
        $scope.exampsLis = [];
        $scope.loadding=layer.load(1,{success: function(layero){
            var cle=parseInt(layero.css('left'));
            layero.css("left",cle)
        }
        });
        services._sub_list($scope.param).success(function (res) {
            if(res.code==0){
                var data = res.data;
                $scope.exampsList = data.rows;
                layer.close($scope.loadding);
                $scope.loadding=false;
                $scope.subjectList = res.data.rows;
                $scope.param.total = res.data.total;
                $scope.param.pages = res.data.pages;

                laypage.render({
                    elem: "pager",
                    count:$scope.param.total,
                    curr: $scope.param.pageNum || 1,
                    limit: $scope.param.pageSize
                    ,jump: function (resPager) {
                        if (resPager.curr != $scope.param.pageNum) {
                            $scope.param.pageNum = parseInt(resPager.curr);
                            $scope.all_load();
                        }
                    }
                });
            }
        })
    };
    $scope.all_load();

    $scope.teachers = null;
    $scope.update_param = {};
    //加载协助者
    $scope.get_assistant = function(data){
        services._assistantList({user_id:data}).success(function (res) {
            if(res.code==0){
                $scope.teachers = res.data;
                if($scope.update_param.assistant){
                    angular.forEach($scope.teachers,function(item,index){
                        if($scope.update_param.assistant.indexOf(item.user_id)!=-1){
                            if(!item.select){
                                $scope.addTeacher(item);
                            }
                        }
                    });
                }

            }else{
                layer.msg(res.message);
            }
        });
    };


    //添加协助者
    $scope.addTeacher = function (item) {
        item.select = !item.select;
        if(item.select){
            $scope.assistant_ids.push(item.user_id);
        }else{
            angular.forEach($scope.assistant_ids,function(items,index){
                if(items==item.user_id){
                    $scope.assistant_ids.splice(index,1);
                }
            })
        }
    };
    //搜索 试题
    $scope.reload =function(){

        $scope.all_load();
    };
    //重组试卷
    $scope.rePaper = function (data) {
        if(data.source==2 ){
            $state.go("examPaper",{id:data.id,source:data.source,template:data.is_template});
        }else{
            $state.go("examPaperOther",{id:data.id,source:data.source});
        }
    };

    //试卷预览
    $scope.lookPaper = function (item) {
        window.open(item.paper_url)
    }

    //设置试卷
    $scope.setPaper = function (data) {
        //清空一次
        $scope.update_param = {};
        $scope.assistant_ids = [];

        //打开弹出层
        $scope.export = layer.open({
            type: 1,
            title: "试卷设置",
            area: ["700px", "580px"],
            content: $("#paper_config")
        });
        var now_data = angular.copy(data);
        //试卷的创建id
        $scope.now_paperStatus = JSON.parse(now_data.configure);

        $scope.update_param.create_by = now_data.create_by;
        //试卷id
        $scope.update_param.id = now_data.id;
        //试卷标题
        $scope.update_param.paper_title = now_data.paper_title;
        //试卷副标题
        $scope.update_param.paper_subtitle = now_data.paper_subtitle;
        //试卷总分
        $scope.update_param.paper_full = now_data.paper_full;
        //考试时长
        $scope.update_param.paper_duration = now_data.paper_duration;

        //试卷类型
        $scope.now_paperDataTypes = angular.copy($rootScope.paperDataTypes);
        angular.forEach($scope.now_paperDataTypes,function(item,index){
            if(data.paper_type==item.id){
                $scope.update_param.paper_type = item.id;
                $scope.update_param.paper_type_name = item.dic_name;
            }
        });
        //试卷难易度
        $scope.now_paperLevelTypes = angular.copy($rootScope.paperLevelTypes);
        angular.forEach($scope.now_paperLevelTypes,function(item,index){
            if(data.paper_level==item.id){
                $scope.update_param.paper_level_name = item.dic_name;
                $scope.update_param.paper_level = item.id;
            }
        });
        //可见性
        $scope.update_param.is_open = now_data.is_open;
        //试卷解析
        $scope.update_param.paper_explain = now_data.paper_explain;
        //及格分数
        $scope.update_param.paper_pass = now_data.paper_pass;
        //试卷配置
        $scope.update_param.configure = now_data.configure;
        //试卷配置
        $scope.update_param.fragment = now_data.fragment;

        //协作者
        $scope.update_param.assistant = now_data.assistant;

        //判断协助者
        if($scope.update_param.assistant){
            $scope.update_param.assistant = now_data.assistant.split(",").map(function(data){
                return +data
            });

        }
        $scope.get_assistant(data.create_by);

        //试卷的url
        $scope.update_param.paper_url = now_data.paper_url;

        //试卷的vcode
        $scope.update_param.paper_code = now_data.paper_code;
    };
    $scope.subPaper = [{id:0,name:'私有',bool:true},{id:1,name:'公开',bool:true}];
    $scope.select_bank = function(data){
        angular.forEach($scope.subPaper,function(item,index){
            if(!data.check){
                item.check = false;
                data.bool = false;
            }else{
                item.check = true;
                data.bool = true;
            }
        })
    }
    //试卷保存
    $scope.savePaper = function(){
        console.log($scope.update_param);
        if($scope.assistant_ids.length==0){
            $scope.update_param.assistant = null;
        }else{
            $scope.update_param.assistant = $scope.assistant_ids.join(",");
        }

        //更新html
        services._get_paperHtml({paper_url:$scope.update_param.paper_url}).success(function (res) {
            var html = res;
            // console.log(html)
            // console.log($scope.update_param.paper_code);
            var paper_subtitle = html.match(/(class=\"paper_subtitle.+?<\/h1>)/);
            var paper_title = html.match(/(class=\"paper_title.+?<\/h1>)/);
            var paper_duration = html.match(/(class=\"paper_duration.+?<\/label>)/);

            if(paper_subtitle && paper_subtitle.length > 0){
                html = html.replace(html.match(/(class=\"paper_subtitle.+?<\/h1>)/)[0],'<h1 class=\"paper_subtitle\">'+$scope.update_param.paper_subtitle+'</h1>');

            }
            if(paper_title && paper_title.length > 0){
                html = html.replace(html.match(/(class=\"paper_title.+?<\/h1>)/)[0],'<h1 class=\"paper_title\">'+$scope.update_param.paper_title+'</h1>');
            }
            if(paper_duration && paper_duration.length > 0){
                html = html.replace(html.match(/(class=\"paper_duration.+?<\/label>)/)[0],'<label class=\"paper_duration\">'+$scope.update_param.paper_duration+'</label>');
            }

            $scope.update_param.fragment = html;

            services._update_testList($scope.update_param).success(function (res) {
                if(res.code==0){
                    layer.msg(res.message);
                    layer.close($scope.export);
                    $scope.reload();
                }else{
                    layer.msg(res.message);
                }

            })
        });
    }

    //_save_paperList
    $scope.save = function(){
        services._save_paperList({paper_code:$scope.paper_code,fragment:$("#paper_list").html()}).success(function (res) {
            if(res.code==0){
                layer.msg(res.message);
                $rootScope.formClose();
                $scope.reload();
            }else{
                layer.msg(res.message);
            }
        })
    }
    //删除试卷
    $scope.delPaper = function (data) {
        layer.confirm('删除试卷后将无法找回,确认删除吗？', {
            btn: ['确定', '取消'] //按钮
        }, function () {
            services._del_testList({id:data.id}).success(function (res) {
                if(res.code==0){
                    layer.msg(res.message);
                    //刷新页面
                    $scope.reload();
                }else{
                    layer.msg(res.message)
                }
            })
        })
    };
    //排版试卷
    $scope.all_papers = null;
    $scope.line_font = '';
    $scope.line_height = '';
    $scope.paper_code = null;
    $scope.revPaper = function(data){
        $scope.paper_code = data.paper_code
        services._get_papers({paper_url:data.paper_url}).success(function (res) {
            $scope.all_papers = res;
            $rootScope.formOpen();
            $("#paper_list").html(res);
            setTimeout(function(){
                $scope.$apply(function(){
                    for(var i=0;i<$(".paper-html p").length;i++){
                        if($(".paper-html p").eq(i).css('font-weight')==400){
                            $scope.line_font = parseInt($(".paper-html p").eq(i).css('font-size'));
                            $scope.line_height = parseInt($(".paper-html p").eq(i).css('line-height'));
                        }
                    }
                    }
                )
                // if(parseInt($("#paper_list").height())>1339){
                //     var num = Math.floor(parseInt($("#paper_list").height())/1339)
                //     for(var i=0;i<num;i++){
                //         console.log(i);
                //         var md = 1305*(i+1)+'px'
                //         $("<p style='width:100%;border-bottom:1px dashed red;position:absolute;top:"+md+"'></p>").appendTo($("#inline_list"));
                //         $("#line_list p").eq(i).css({"height":md+'px'})
                //     }
                // }
            },500)
        })
    }
    //字体调整
    $scope.sel_font = function(bool){
        if(bool){
            if($scope.line_font>=20){
                layer.alert("最小字体不大于20px")
            }else{
                $scope.line_font = $scope.line_font+1;
                for(var i=0;i<$(".paper-html p").length;i++){
                    if($(".paper-html p").eq(i).css('font-weight')==400){
                        $(".paper-html p").eq(i).css('font-size',$scope.line_font+'px')
                    }
                }
            }
        }else{
            if($scope.line_font<=12){
                layer.alert("最小字体不小于12px")
            }else{
                $scope.line_font = $scope.line_font-1;
                for(var i=0;i<$(".paper-html p").length;i++){
                    if($(".paper-html p").eq(i).css('font-weight')==400){
                        $(".paper-html p").eq(i).css('font-size',$scope.line_font+'px')
                    }
                }
            }
        }
    }
    //行高调整
    $scope.sel_height = function(bool){
        if(bool){
            if($scope.line_height>=40){
                layer.alert("最小行间距不大于40px")
            }else{
                $scope.line_height = $scope.line_height+1;
                for(var i=0;i<$(".paper-html p").length;i++){
                    if($(".paper-html p").eq(i).css('font-weight')==400){
                        $(".paper-html p").eq(i).css('line-height',$scope.line_height+'px')
                    }
                }
            }
        }else{
            if($scope.line_height<=16){
                layer.alert("最小行间距不小于16px")
            }else{
                $scope.line_height = $scope.line_height-1;
                for(var i=0;i<$(".paper-html p").length;i++){
                    if($(".paper-html p").eq(i).css('font-weight')==400){
                        $(".paper-html p").eq(i).css('line-height',$scope.line_height+'px')
                    }
                }
            }
        }
    }
    //转换
    $scope.replac_allN = function(html){
        return html ? html.replace(/<p.*?>(.*?)<\/p>/g,function(match,p1){return p1}):html;
    }
    $scope.replac_allA = function(html){
        return html ? html.replace(">",">解析：").replace(/<p.*?>(.*?)<\/p>/g,function(match,p1){return p1}):html;
    }
    $scope.replac_allS = function(html){
        return html ? html.replace(">",">答案：").replace(/<p.*?>(.*?)<\/p>/g,function(match,p1){return p1}):html;
    }

    //下载试卷
    $scope.downPaper = function (id){
        var iframe = $('<iframe style="display: none" src="' + $rootScope.ctxPath + '/admin/pbank/downPBank?id=' + id + '"></iframe>');
        $("#myPapers").append(iframe);
    }
    $scope.downPaperAnswer = function(data){
        //_get_answerMcards
        services._get_answerMcards({pbank_id:data.id,paper_curriculum:data.paper_curriculum}).success(function (res) {
            if(res.code==0){
                $scope.now_examAll = res.data;
                setTimeout(function(){
                    $scope.all_socus = $("#now_answer").html();
                    console.log($scope.all_socus)
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
                            a.href = $rootScope.ctxPath + '/admin/pbank/downloadAnswerCard?answerPath=' + res.data + '&answerType=1';
                            a.target = '_blank';
                            a.download = 'answerCardDown.pdf';
                            $("#myPapers").append(a);
                            a.click();
                        }
                    })
                },0)
            }
        })
    }
    setTimeout(function(){
        This_form.render();
    },50)


});

