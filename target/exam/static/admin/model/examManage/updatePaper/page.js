myApp.controller('updatePaperController', function ($rootScope, $scope, services, $sce, $stateParams, $state) {
//老师数据
    services["_assistantList"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/assistantList', param, "POST");
    };
    //换题列表
    services["_huanti"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/filterBpankSubject', param, "POST");
    };
    //换题
    services["_knowledgeChange"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/knowledgeChangeTitle', param, "POST");
    };
    //试卷详情
    services["_pbankPreview"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/pbankPreview', param, "POST");
    };
    //修改单个试题
    services["_knowledgeChangeTitle"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/knowledgeChangeTitle', param, "POST");
    };
    //修改分数
    services["_knowledgeChangeChange"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/knowledgeChangeChange', param, "POST");
    };
    //组卷次数
    services["_subjectFrequency"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/subjectFrequency', param, "POST");
    };
    //组卷记录
    services["_subjectRecord"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/subject/subjectRecord', param, "POST");
    };
    //根据模板生成试题
    services["_getSubjectsByTemplate"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/template/getSubjectsByTemplate', param, "POST");
    };
    //试卷基本信息设置
    services["_updatePaper"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/updateInfoPbank', param, "POST");
    };
    //生成试卷
    services["_savePaper"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/savePaper', param, "POST");
    },

    //得到默认的课程、题型、试卷类型
    $scope.event = function(){

            //试卷类别
            services._dic_list({
                pageNum: 1,
                pageSize: 1000,
                dic_parentcode: 70000
            }).success(function (res) {
                $scope.categoryData = res.data;
            })
        };
    $scope.event();



    $scope.exam_all_ids = [];
    $scope.paperEdit = false;
    $scope.configParam = {
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
    var date = new Date();
    $scope.param = {
        id: $stateParams.id, //试卷id 修改试卷用
        paper_code: null,//试卷编码
        paper_title: '未命名', //主标题
        paper_subtitle: date.getFullYear() + '年湖北省普通高等学校招收中职毕业生技能高考', //副标题
        paper_duration: 120, //考试用时
        paper_curriculum: null, //所属课程
        paper_type: 10042, //试卷类型
        paper_type_name: '课堂练习',
        paper_explain: '', //试卷解析
        paper_full: 0, //满分
        paper_pass: 60, //及格分
        paper_url: null, //下载地址
        org_id: null,//所属机构
        paper_level: 10075, //难易度
        paper_level_name: '简单',
        assistant: null, // 协作组
        is_open: 0, //是否公开
        is_template: 0, // 模板id
        source: $stateParams.source, // 来源 1:知识点组卷;2.模板组卷 3.手动组卷 4.章节组卷
        status: 1, //1未发布2已发布3考试结束
        configure: null, //试卷配置
        update_by: null,//修改人
        update_time: null, //修改时间
        create_by: null,//创建人
        create_time: null, //创建时间

        fragment: null, //试卷片段
        template: $stateParams.template, //模板组卷 模板id
        knowledge: $stateParams.knowledge, //knowledge 1 标识作用
        totalNum: 0, //总数
        teacher_search: '', //老师搜索
        subjectList: [] //试题集合

    }
    //换题查询条件
    $scope.huantiParam = {
        pageNum: 1,
        pageSize: 1,
        pages: 1,
        total: 0,
        type: 0,
        id: null,
        subject_ids: null,
        subject_curriculum: 0
    }
    //换题列表
    $scope.huantiData = null;
    $scope.txtArray = [{
        id: '10062', //语文单选题
        txt: '在每小题给出的四个备选项中，只有一项是符合题目要求的，请将其选出。未选、错选或多选均不得分。'
    }, {
        id: '10067', //数学单选题
        txt: '在每小题给出的四个备选项中，只有一项是符合题目要求的，请将其选出。未选、错选或多选均不得分。'
    }, {
        id: '10070', //英语单选题
        txt: '在每小题给出的四个备选项中，只有一项是符合题目要求的，请将其选出。未选、错选或多选均不得分。'
    }, {
        id: '10072', //专业课单选题
        txt: '在每小题给出的四个备选项中，只有一项是符合题目要求的，请将其选出。未选、错选或多选均不得分。'
    }, {
        id: '10068',
        txt: '把答案填在答题卡相应题号的横线上。'
    }];
    $scope.teachers = null;
    $scope.getTxtByid = function (id) {
        var txt = null;
        angular.forEach($scope.txtArray, function (item) {
            if (item.id == id)
                txt = item.txt;
        })
        return txt;
    }
    //试题列表
    $scope.PrivateBasketExams = null;
    $scope.gtArray = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    $scope.set_marks_object = null;
    $scope.set_marks_object_parent = null;
    $scope.use_subject_data = null;
    //替换p标签
    $scope.replacehtml = function (order, html, marks) {
        if (html) {
            //加索引
            html = html.replace('>', ' class="mlfirst"><em style="font-style:normal">'+ order +'.</em> ');
            //加分数
            html = html.replace('</p>', '<em style="margin-left:5px;color: #999;white-space:nowrap;font-style:normal;">('+ marks +'分)</em></p>');
        }
        html = html ? html.replace(/font-weight:bold;/g, "font-weight:normal;") : html;
        return html ? html.replace(/vertical-align:text-bottom;/g, "vertical-align:middle;") : html;
    }
    //替换选项
    $scope.replacehtml2 = function (html) {
        if (html) {
            html = html.replace('>', ' class="mlfirst">');
        }
        return html ? html.replace(/vertical-align:text-bottom;/g, "vertical-align:middle;") : html;
    }
    //替换小题索引
    $scope.replaceindex = function (index) {
        if (index) {
            return index + '.';
        }
        else {
            return '&nbsp;';
        }
    }
    //计算所有
    $scope.covert_exam_all = function () {
        var ii = 0, iii = 0, str = null;
        ////////////////////////////清空多余课程////////////////////////////////////
        angular.forEach($scope.PrivateBasketExams, function (kc) {
            ////////////////////////////清空多余大题////////////////////////////////////
            angular.forEach(kc.children, function (tx) {
                if(tx.subjectList.length == 0){
                    kc.children.splice(kc.children.indexOf(tx), 1);
                }
            })
            if(kc.children.length == 0){
                $scope.PrivateBasketExams.splice($scope.PrivateBasketExams.indexOf(kc), 1);
            }
            ////////////////////////////清空多余大题////////////////////////////////////
        });
        ////////////////////////////清空多余课程////////////////////////////////////


        $scope.param.paper_full = 0;
        $scope.param.totalNum = 0;
        $scope.exam_all_ids = [];
        angular.forEach($scope.PrivateBasketExams, function (kc, index1) {
            str = str ? (str += ',' + kc.subject_id) : kc.subject_id;
            kc.subject_name = $rootScope._get_curriculum_name(kc.subject_id);
            //循环前清空数量 和 分数
            kc.detail_marks = 0;
            kc.detail_number = 0;
            kc.detail_order = index1;
            angular.forEach(kc.children, function (tx, index2) {
                tx.subject_name = $rootScope._get_exam_name_byid(kc.subject_id, tx.subject_id);
                tx.detail_marks = 0;
                tx.detail_number = 0;
                tx.detail_order = index2;
                angular.forEach(tx.subjectList, function (st) {
                    $scope.exam_all_ids.push(st.id);
                    st.subject_name = tx.subject_name;
                    if(st.subjectList && st.subjectList.length > 0){
                        st.detail_marks = 0;
                        st.detail_number = 0;
                        angular.forEach(st.subjectList, function (xst) {
                            xst.subject_name = $rootScope._get_exam_name_byid(kc.subject_id, xst.subject_type);
                            xst.detail_marks = xst.detail_marks ? parseInt(xst.detail_marks) : (parseInt(xst.subject_marks) || 0);
                            xst.detail_number = 1;
                            st.detail_marks += xst.detail_marks;
                            st.detail_number += xst.detail_number;
                            ii += 1;
                            xst.detail_order = ii;
                        })
                        st.detail_order = 0;
                    }
                    else{
                        ii += 1;
                        st.detail_order = ii;
                        st.detail_marks = st.detail_marks ? parseInt(st.detail_marks) : (parseInt(st.subject_marks) || 0);
                        st.detail_number = 1;
                    }
                    tx.detail_marks += st.detail_marks;
                    tx.detail_number += st.detail_number;
                })
                kc.detail_marks += tx.detail_marks;
                kc.detail_number += tx.detail_number;
            })
            //结束循环后将每个课程的 小题数  和 分数加到试卷总数上
            $scope.param.paper_full += parseInt(kc.detail_marks);
            $scope.param.totalNum += kc.detail_number;
        });
        $scope.param.paper_curriculum = str;
        //没有存在的课程都删除
    }
    //删除试题
    $scope.delExamST = function (parent, item) {
        layer.confirm('你确定要删除这道试题吗',['确定','取消'], function () {
            layer.closeAll();
            parent.splice(parent.indexOf(item), 1);
            $scope.covert_exam_all();
            $scope.paperEdit = true;
        })
    }
    //选择对应试题
    $scope.select_to_st = function (item) {
        var mm = $('.xt[data-id="' + item.id + '"]').addClass('hover');
        var top = mm.offset().top;
        window.scrollTo(0, top - 60);
        setTimeout(function () {
            $('.xt[data-id="' + item.id + '"]').removeClass('hover');
        }, 3000);
    }
    //设定得分
    $scope.set_subject_marks = function (parent, item) {
        $scope.set_marks_object = item;
        $scope.set_marks_object_parent = parent;
        var h = 200, w = 400;
        if (item.subjectList && item.subjectList.length > 0) {
            h = 160 + item.subjectList.length * 50;
        }
        $scope.paper_set_marks = layer.open({
            type: 1,
            title: "设定得分",
            area: ["400px", h + "px"],
            content: $("#paper_set_marks")
        });
    }
    //保存得分
    $scope.form_set_subject_marks = function () {
        var children = [];
        var n = $scope.set_marks_object.detail_marks;
        if ($scope.set_marks_object.subjectList && $scope.set_marks_object.subjectList.length > 0) {
            n = 0;
            angular.forEach($scope.set_marks_object.subjectList, function (item) {
                if (!item.detail_marks || isNaN(item.detail_marks)) {
                    item.detail_marks = parseInt(item.subject_marks);
                }
                n += parseInt(item.detail_marks);
                children.push({
                    id: item.id,
                    detail_marks: item.detail_marks
                })
            })
            $scope.set_marks_object.detail_marks = n;
            children.push({
                id: $scope.set_marks_object.id,
                detail_marks: $scope.set_marks_object.detail_marks
            })
            $scope.set_marks_service(children);
        }
        else {
            if (!n || isNaN(n)) {
                $scope.set_marks_object.detail_marks = parseInt(item.subject_marks);
            }
            //判断是否需要将 大题下所有小题设置为相同分数
            if ($scope.set_marks_object_parent.length > 1) {
                layer.confirm('该大题下还有相同类型'+ $scope.set_marks_object_parent.length +'个小题，是否一起设置?', {
                    btn: ['批量设置', '暂时不用'] //按钮
                }, function () {
                    angular.forEach($scope.set_marks_object_parent, function (item) {
                        children.push({
                            id: item.id,
                            detail_marks: $scope.set_marks_object.detail_marks
                        })
                        item.detail_marks = $scope.set_marks_object.detail_marks;
                    })
                    $scope.set_marks_service(children);
                }, function () {
                    children.push({
                        id: $scope.set_marks_object.id,
                        detail_marks: $scope.set_marks_object.detail_marks
                    })
                    $scope.set_marks_service(children);
                });
            }
            else {
                children.push({
                    id: $scope.set_marks_object.id,
                    detail_marks: $scope.set_marks_object.detail_marks
                })
                $scope.set_marks_service(children);
            }
        }
        layer.close($scope.paper_set_marks);
    }
    //存储分数
    $scope.set_marks_service = function (arr) {
        //重新计算
        $scope.covert_exam_all();
        layer.closeAll();
        $scope.paperEdit = true;
    }
    //更新试题使用次数
    $scope.showST_mark = function (item) {
        if (!item.load_useNum) {
            item.load_useNum = true;
            services._subjectFrequency({
                subject_id: item.id,
                pbank_id: $scope.param.id
            }).success(function (res) {
                item.useNum = res.data;
            })
        }
    }
    //试卷设置
    $scope.configPaper = function () {
        $scope.paper_config = layer.open({
            type: 1,
            title: "试卷设置",
            area: ["700px", "550px"],
            content: $("#paper_config")
        });
        //加载一次老师数据
        if (!$scope.teachers) {
            services._assistantList().success(function (res) {
                $scope.teachers = res.data;
                if ($scope.param.assistant) {
                    angular.forEach($scope.teachers, function (item) {
                        if ($scope.param.assistant.indexOf(item.user_id) != -1) {
                            item.select = true;
                        }
                    })
                }
            });
        }
    }
    //选择老师
    $scope.addTeacher = function (item) {
        item.select = !item.select;
    }
    //使用记录
    $rootScope.show_subject_use = function (st) {
        if(st.useNum == 0){
            layer.msg('这道试题还没有组卷记录~')
        }
        else {
            var paper_use = layer.open({
                type: 1,
                title: "组卷记录",
                area: ["600px", "400px"],
                content: $("#suject_use_list")
            });
            services._subjectRecord({
                subject_id: st.id,
                pbank_id: $scope.param.id
            }).success(function (res) {
                $scope.use_subject_data = res.data;
            })
        }
    }
    //换题
    $scope.paper_update_exam = function (item) {
        var paper_config = layer.open({
            type: 1,
            title: "换题",
            area: ["800px", "500px"],
            content: $("#paper_update_exam")
        });
        $scope.huantiParam.pageNum = 0;
        $scope.huantiParam.id = item.id;
        $scope.huantiParam.subject_ids = $scope.exam_all_ids;
        $scope.huantiParam.type = item.subject_type;
        $scope.huantiParam.subject_curriculum = item.subject_curriculum;

        $scope.huantiData = null;
        $scope.get_next_huanti_service();
    }
    //获取换题列表
    $scope.get_next_huanti_service = function () {
        $scope.huantiParam.pageNum += 1;
        services._huanti($scope.huantiParam).success(function (res) {
            $scope.huantiParam.pages = res.data.pages;
            $scope.huantiParam.total = res.data.total;
            $scope.huantiData = res.data.rows;

            if(res.data.rows.length > 0){
                services._subjectFrequency({
                    subject_id: res.data.rows[0].id,
                    pbank_id: $scope.param.id
                }).success(function (bbs) {
                    $scope.huantiData[0].useNum = bbs.data;
                    $scope.huantiData[0].load_useNum = true;
                })
            }
        })
    }
    //获取换题列表
    $scope.get_last_huanti_service = function () {
        $scope.huantiParam.pageNum -= 1;
        services._huanti($scope.huantiParam).success(function (res) {
            $scope.huantiParam.pages = res.data.pages;
            $scope.huantiParam.total = res.data.total;
            $scope.huantiData = res.data.rows;

            if(res.data.rows.length > 0){
                services._subjectFrequency({
                    subject_id: res.data.rows[0].id,
                    pbank_id: $scope.param.id
                }).success(function (bbs) {
                    $scope.huantiData[0].useNum = bbs.data;
                    $scope.huantiData[0].load_useNum = true;
                })
            }
        })
    }
    //替换单个试题
    $scope.knowledgeChange = function () {
        if ($scope.huantiData && $scope.huantiData.length > 0) {
            //循环所有试题
            angular.forEach($scope.PrivateBasketExams, function (kc) {
                angular.forEach(kc.children, function (tx) {
                    angular.forEach(tx.subjectList, function (st) {
                        if($scope.huantiParam.id == st.id){
                            $scope.huantiData[0].detail_marks = st.detail_marks;
                            for(var kk in $scope.huantiData[0]){
                                st[kk] = $scope.huantiData[0][kk];
                            }
                        }
                    })
                })
            })
            $scope.covert_exam_all();
            //全部保存
            $scope.savePaper();
            layer.closeAll();
        }
        else {
            layer.msg('没有试题可以替换~');
        }
    }
    //重新选题
    $scope.resetQuestion = function () {
        if($scope.param.source == 1){
            layer.msg('试卷所有已选择试题，将重新放入试题篮；请重新选择试题~')
            //清空试题篮
            $rootScope._delQuestionAll();
            //循环将目前的题添加到试题篮
            angular.forEach($scope.PrivateBasketExams, function (kc) {
                angular.forEach(kc.children, function (tx) {
                    angular.forEach(tx.subjectList, function (st) {
                        $rootScope._addBasket(st);
                    })
                })
            });
            //页面跳转
            $rootScope._toPage("examKnowledge",{
                id: $scope.param.id
            })
        }
        else if($scope.param.source == 2){
            var loading = layer.open({
                type: 1,
                title: false,
                closeBtn: 0,
                shadeClose: false,
                skin: 'yourclass',
                content: '<div class="paper_loading"><p>正在组装试卷，此过程可能需要等待几秒...</p></div>'
            });
            services._getSubjectsByTemplate({
                id: $scope.param.is_template,
                paper_level: $scope.param.paper_level
            }).success(function (bas) {
                if(bas.code == 0){
                    //清空原题
                    angular.forEach($scope.PrivateBasketExams, function (kc) {
                        angular.forEach(kc.children, function (tx) {
                            tx.subjectList = [];
                        })
                    })
                    //首次组装
                    var iii = 0;
                    angular.forEach(bas.data, function (item) {
                        if(item.subjectList && item.subjectList.length > 0){
                            item.detail_order = 0;
                            item.detail_marks = 0;
                            angular.forEach(item.subjectList, function (xss) {
                                xss.detail_order = ++iii;
                                xss.detail_marks = xss.subject_marks ? xss.subject_marks : 0;
                                item.detail_marks += parseInt(xss.detail_marks);
                            })
                        }
                        else{
                            item.detail_order = ++iii;
                            item.detail_marks = item.subject_marks ? item.subject_marks : 0;
                        }
                        angular.forEach($scope.PrivateBasketExams, function (kc) {
                            if(item.subject_curriculum = kc.subject_id) {
                                angular.forEach(kc.children, function (tx) {
                                    if(item.subject_type == tx.subject_id) {
                                        tx.subjectList.push(item);
                                    }
                                })
                            }
                        })
                    })
                    console.log($scope.PrivateBasketExams)
                    $scope.covert_exam_all();
                    setTimeout(function () {
                        layer.closeAll();
                        //1秒后开始保存
                        $scope.savePaper();
                    },1000)
                }
                else{
                    layer.closeAll();
                    layer.alert(bas.message)
                }
            });
        }
        else if($scope.param.source == 3){
            console.log('3')
        }
        else{
            console.log('4')
        }
    }
    //试卷预览
    $scope.lookPaper = function () {
        window.open(window.location.origin+'/'+$scope.param.paper_url)
    }
    //保存试卷
    $scope.savePaper = function () {
        var loading = layer.load(1, {
            shade: [0.1, '#fff'] //0.1透明度的白色背景
        });
        //试卷配置
        $scope.param.configure = JSON.stringify($scope.configParam);
        //试题
        $scope.param.children = [];
        angular.forEach($scope.PrivateBasketExams, function (kc, i) {
            var kc_1 = {
                subject_id: kc.subject_id,
                detail_marks: kc.detail_marks,
                detail_number: kc.detail_number,
                detail_order: kc.detail_order,
                subject_type: kc.subject_type,
                children: []
            }
            angular.forEach(kc.children, function (tx) {
                var tx_1 = {
                    subject_id: tx.subject_id,
                    detail_marks: tx.detail_marks,
                    detail_number: tx.detail_number,
                    detail_order: tx.detail_order,
                    subject_type: tx.subject_type,
                    children: []
                }
                angular.forEach(tx.subjectList, function (st) {
                    var st_1 = {
                        subject_id: st.id,
                        detail_marks: st.detail_marks,
                        detail_number: st.detail_number,
                        detail_order: st.detail_order,
                        subject_type: st.subject_type,
                        children: []
                    }
                    angular.forEach(st.subjectList, function (xst) {
                        st_1.children.push({
                            subject_id: xst.id,
                            detail_marks: xst.detail_marks,
                            detail_number: xst.detail_number,
                            detail_order: xst.detail_order,
                            subject_type: xst.subject_type,
                            children: []
                        })
                    })
                    tx_1.children.push(st_1);
                })
                kc_1.children.push(tx_1);
            })
            $scope.param.children.push(kc_1);
        })
        //协作者
        $scope.param.assistant = null;
        angular.forEach($scope.teachers, function (th) {
            if (th.select) {
                $scope.param.assistant = $scope.param.assistant ? $scope.param.assistant + ',' + th.user_id : th.user_id;
            }
        })
        //html片段
        var col = $('.paper-html').clone();
        $('.bb-actions', col).remove();
        $scope.param.fragment = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>试卷预览</title><style>body{background:#f4f4f4;margin:0;padding:0}.paper-html{padding:30px 60px;width:842px;box-sizing:border-box}</style></head><body>' +
            '<div style="font-size: 16px;margin: 0 auto;background: #fff" class="paper-html">' +
            col.html() + '</div></body></html>';
        services._savePaper($scope.param).success(function (res) {
            layer.closeAll();
            if (res.code == 0) {
                layer.msg('试卷已重新保存!');
                $state.go("myPapers")
            }
            else {
                layer.alert(res.message);
            }
        })
    }

    //试卷基本信息设置保存
    $scope.updatePaper = function(){
        console.log($scope.param);
        services._subjectFrequency($scope.param).success(function (res) {
            if(res.code==0){
                layer.msg(res.message);
                layer.close($scope.paper_config);
            }else{
                layer.msg(res.message);
            }
        })
    };

    $scope.paper_edit_time = 0;
    $scope.paper_edit_inter = null;
    //监控30秒保存一次
    $scope.$watch('paperEdit', function (n) {
        if(n){
            $scope.paperEdit = false;
            $scope.paper_edit_time = 0;
            clearInterval($scope.paper_edit_inter);
            $scope.paper_edit_inter = setInterval(function () {
                $scope.$apply(function () {
                    $scope.paper_edit_time += 1;
                    if($scope.paper_edit_time >= 60){
                        $scope.paperEdit = 0;
                        clearInterval($scope.paper_edit_inter);
                        layer.msg('每一分钟系统将自动保存一次当前试卷修改的内容')
                        $scope.savePaper();
                    }
                })
            },1000)
        }
    });
    //知识点组卷
    if ($scope.param.id) {
        // if ($scope.param.source == 1) {
        var loading = layer.load(1, {
            shade: [0.1, '#fff'] //0.1透明度的白色背景
        });
        services._pbankPreview({
            pbank_id: $scope.param.id
        }).success(function (bas) {
            //试卷配置
            $scope.configParam = JSON.parse(bas.data.configure);
            if (bas.data.children.length > 0) {
                $scope.PrivateBasketExams = bas.data.children;
                layer.closeAll();
                //属性处理
                if (bas.data.children.length > 0) {
                    $scope.covert_exam_all();
                    //属性操作
                    //$scope.param.paper_title = ($scope.PrivateBasketExams.length > 1 ? '文化综合' : $scope.PrivateBasketExams[0].dic_name) + "模拟试卷";
                    $scope.param['paper_title'] = bas.data.paper_title;
                    $scope.param['paper_subtitle'] = bas.data.paper_subtitle;
                    $scope.param['paper_duration'] = bas.data.paper_duration;
                    $scope.param['paper_curriculum'] = bas.data.paper_curriculum;
                    $scope.param['paper_pass'] = bas.data.paper_pass;
                    $scope.param['paper_type'] = bas.data.paper_type ? bas.data.paper_type : 10042 ;
                    $scope.param['paper_level'] = bas.data.paper_level ? bas.data.paper_level : 10075 ;
                    $scope.param['paper_code'] = bas.data.paper_code;
                    $scope.param['paper_explain'] = bas.data.paper_explain;
                    //$scope.param['paper_full'] = bas.data.paper_full;
                    $scope.param['paper_url'] = bas.data.paper_url;
                    $scope.param['org_id'] = bas.data.org_id;
                    $scope.param['assistant'] = bas.data.assistant;
                    $scope.param['is_open'] = bas.data.is_open;
                    $scope.param['is_template'] = bas.data.is_template;
                    $scope.param['source'] = bas.data.source;
                    $scope.param['status'] = bas.data.status;
                    //$scope.param['configure'] = bas.data.configure;
                    // $scope.param['create_by'] = bas.data.create_by;
                    // $scope.param['create_time'] = bas.data.create_time;
                    $scope.param['paper_type_name'] = $rootScope._get_paper_type_name($scope.param['paper_type']);
                    $scope.param['paper_level_name'] = $rootScope._get_paper_leve_name($scope.param['paper_level']);

                }
                else {
                    layer.alert("试卷操作失败, 请重新加载~");
                }
            }
            else {
                layer.closeAll();
                layer.alert('所选知识点下面没有相应试题!');
            }
        })
        // }
    }
    else{
        layer.alert('试卷异常， 请重新进入~');
    }
})




