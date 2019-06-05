myApp.controller('examPaperOtherController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    $rootScope.examKnowledge_id = null;
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
    }
    //重新保存试卷碎片
    services["_savePbank_html"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/savePbank_html', param, "POST");
    }
    //重新保存试卷碎片
    services["_savePaper_level"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/pbank/levelProportion', param, "POST");
    }
    var date = new Date();
    //试卷规格配置项
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
        paper_level: 10076, //难易度
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
        template: null, //模板组卷 模板id
        totalNum: 0, //总数
        teacher_search: '', //老师搜索
        subjectList: [], //试题集合
        children: [] //试题集合
    }
    //试题列表
    $scope.PrivateBasketExams = null;
    //大题题号
    $scope.gtArray = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    //设定分数的试题对象
    $scope.set_marks_object = null;
    //操作数据对象
    $scope.set_marks_array = null;
    //设定得分的试题父级
    $scope.set_marks_object_parent = null;
    //使用记录的试题对象
    $scope.use_subject_data = null;
    //试题所有id
    $scope.exam_all_ids = [];
    //协作者
    $scope.teachers = null;
    //窗口配置
    var paper_config = null;
    //换题查询条件
    $scope.huantiParam = {
        pageNum: 1,
        pageSize: 1,
        pages: 1,
        total: 0,
        type: 0,
        id: null,
        subject_ids: null,
        subject_curriculum: 0,
        knowledges: 0,
        subject_level: 0
    }
    //数据计算
    $scope.convertNum = function (n) {
        return Math.round(n);
    }
    //设置试题排序
    $scope.setOrder = function (tx, st, i, $index) {
        if (i > 0) {
            var obj_1 = tx.subjectList[$index];
            var obj_2 = tx.subjectList[$index + 1];
            obj_1.detail_order += 1;
            obj_2.detail_order -= 1;
            //判断是否需要设置子项的排序
            if (obj_1.subjectList && obj_1.subjectList.length > 0 && obj_2.subjectList && obj_2.subjectList.length > 0) {
                var start_num = obj_1.subjectList[0].detail_order;
                angular.forEach(obj_2.subjectList, function (cm) {
                    cm.detail_order = start_num++;
                })
                angular.forEach(obj_1.subjectList, function (cm) {
                    cm.detail_order = start_num++;
                })
            }
            //替换
            tx.subjectList.splice($index, 2, obj_2, obj_1);
        }
        else {
            var obj_1 = tx.subjectList[$index];
            var obj_2 = tx.subjectList[$index - 1];
            obj_1.detail_order = obj_1.detail_order - 1;
            obj_2.detail_order = obj_2.detail_order + 1;
            //判断是否需要设置子项的排序
            if (obj_1.subjectList && obj_1.subjectList.length > 0 && obj_2.subjectList && obj_2.subjectList.length > 0) {
                var start_num = obj_2.subjectList[0].detail_order;
                angular.forEach(obj_1.subjectList, function (cm) {
                    cm.detail_order = start_num++;
                })
                angular.forEach(obj_2.subjectList, function (cm) {
                    cm.detail_order = start_num++;
                })
            }
            //替换
            tx.subjectList.splice($index - 1, 2, obj_1, obj_2);
        }
    }
    //整体计算
    $scope.covert_exam_all = function () {
        $scope.param.paper_full = 0;//试卷满分
        $scope.param.totalNum = 0;//试卷总题数
        $scope.exam_all_ids = [];//试题所有id
        var ii = 0, iii = 0;
        angular.forEach($scope.PrivateBasketExams, function (kc, i) {
            kc.subject_name = $rootScope._get_curriculum_name(kc.subject_id);
            kc.detail_number = 0;
            kc.detail_marks = 0;
            kc.detail_order = i;
            angular.forEach(kc.children, function (tx) {
                tx.detail_number = 0;
                tx.detail_marks = 0;
                tx.detail_order = ii++;
                angular.forEach(tx.subjectList, function (st, iiii) {
                    if (st.subjectList && st.subjectList.length > 0) {
                        st.detail_number = 0;
                        st.detail_marks = 0;
                        st.detail_order = iiii;
                        angular.forEach(st.subjectList, function (xst) {
                            //定义小题题库id---继承父级
                            xst.bank_id = st.bank_id;
                            xst.detail_number = 1;
                            xst.detail_order = ++iii;
                            //默认没有分数每个小题2分
                            xst.detail_marks = xst.detail_marks ? xst.detail_marks : 2;

                            st.detail_number += xst.detail_number;
                            st.detail_marks += xst.detail_marks;
                        })
                    }
                    else {
                        st.detail_number = 1;
                        st.detail_order = ++iii;
                        //没有设置分数的题默认给两分
                        st.detail_marks = st.detail_marks ? st.detail_marks : 2;
                    }
                    $scope.exam_all_ids.push(st.id);
                    //大题分数和数量
                    tx.detail_number += st.detail_number;
                    tx.detail_marks += st.detail_marks;
                })
                kc.detail_number += tx.detail_number;
                kc.detail_marks += tx.detail_marks;
            })
            $scope.param.totalNum += kc.detail_number;
            $scope.param.paper_full += kc.detail_marks;
        })
    }
    //设定得分
    $scope.set_subject_marks = function (list, item) {
        $scope.set_marks_object = item;
        $scope.set_marks_object_parent = parent;
        var h = 200, w = 400;
        if (item.subjectList && item.subjectList.length > 0) {
            h = 160 + item.subjectList.length * 50;
        }
        //赋值对象
        $scope.set_marks_array = {
            id: item.id,
            detail_order: item.detail_order,
            detail_marks: item.detail_marks,
            subjectList: []
        };
        if (item.subjectList && item.subjectList.length > 0) {
            angular.forEach(item.subjectList, function (mm) {
                $scope.set_marks_array.subjectList.push({
                    detail_order: mm.detail_order,
                    detail_marks: mm.detail_marks,
                    id: mm.id
                })
            })
        }
        var paper_config = layer.open({
            type: 1,
            title: "设定得分",
            area: ["400px", h + "px"],
            content: $("#paper_set_marks")
        });
    }
    //保存试题得分
    $scope.save_subject_marks = function () {
        if ($scope.set_marks_object.subjectList && $scope.set_marks_object.subjectList.length > 0) {
            angular.forEach($scope.set_marks_array.subjectList, function (item, index) {
                if (parseInt(item.detail_marks) && !isNaN(item.detail_marks))
                    $scope.set_marks_object.subjectList[index].detail_marks = parseInt(item.detail_marks);
            })
        }
        else {
            if (parseInt($scope.set_marks_array.detail_marks) && !isNaN($scope.set_marks_array.detail_marks))
                $scope.set_marks_object.detail_marks = parseInt($scope.set_marks_array.detail_marks);
        }
        layer.closeAll();
        $scope.covert_exam_all();
        $scope.savePaper();
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
    //使用记录
    $rootScope.show_subject_use = function (st) {
        if (st.useNum == 0) {
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
    //替换p标签
    $scope.replacehtml = function (html, marks) {
        if (html) {
            //加分数
            html = html.replace('</p>', '<em style="color: #999;white-space:nowrap;font-style:normal;">(' + marks + '分)</em></p>');
        }
        return html ? html.replace(/vertical-align:text-bottom;/g, "vertical-align:middle;") : html;
    }
    //替换选项
    $scope.replacehtml2 = function (html) {
        if (html) {
            html = html.replace('>', ' class="mlfirst">');
        }
        return html ? html.replace(/vertical-align:text-bottom;/g, "vertical-align:middle;") : html;
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
    //换题
    $scope.paper_update_exam = function (item) {
        paper_config = layer.open({
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
        $scope.huantiParam.knowledges = item.subject_knowledge;
        $scope.huantiParam.subject_level = item.subject_level;
        console.log(item)
        $scope.huantiData = null;
        $scope.get_next_huanti_service();
    }
    //获取换题列表 下
    $scope.get_next_huanti_service = function () {
        $scope.huantiParam.pageNum += 1;
        $scope.now_index = 0;
        angular.forEach($rootScope.questionLevelTypes, function (item, index) {
            if (item.id == $scope.huantiParam.subject_level) {
                $scope.now_index = index;
            }
        })
        services._huanti($scope.huantiParam).success(function (res) {
            $scope.huantiParam.pages = res.data.pages;
            $scope.huantiParam.total = res.data.total;
            $scope.huantiData = res.data.rows;

            if (res.data.rows.length > 0) {
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
    //获取换题列表 上
    $scope.get_last_huanti_service = function () {
        $scope.huantiParam.pageNum -= 1;
        services._huanti($scope.huantiParam).success(function (res) {
            $scope.huantiParam.pages = res.data.pages;
            $scope.huantiParam.total = res.data.total;
            $scope.huantiData = res.data.rows;

            if (res.data.rows.length > 0) {
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
    //增加难度
    $scope.get_up_level_service = function () {
        for (var i = 0; i < $rootScope.questionLevelTypes.length; i++) {
            if ($rootScope.questionLevelTypes[i].id == $scope.huantiParam.subject_level) {
                $scope.now_index = i + 1;
                $scope.huantiParam.subject_level = $rootScope.questionLevelTypes[i + 1].id;
                break;
            }
        }
        services._huanti($scope.huantiParam).success(function (res) {
            $scope.huantiParam.pages = res.data.pages;
            $scope.huantiParam.total = res.data.total;
            $scope.huantiData = res.data.rows;

            if (res.data.rows.length > 0) {
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
    //降低难度
    $scope.get_down_level_service = function () {
        for (var i = 0; i < $rootScope.questionLevelTypes.length; i++) {
            if ($rootScope.questionLevelTypes[i].id == $scope.huantiParam.subject_level) {
                $scope.now_index = i - 1;
                $scope.huantiParam.subject_level = $rootScope.questionLevelTypes[i - 1].id;
                break;
            }
        }
        services._huanti($scope.huantiParam).success(function (res) {
            $scope.huantiParam.pages = res.data.pages;
            $scope.huantiParam.total = res.data.total;
            $scope.huantiData = res.data.rows;

            if (res.data.rows.length > 0) {
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
                        if ($scope.huantiParam.id == st.id) {
                            console.log(st)
                            $scope.huantiData[0].detail_marks = st.detail_marks;
                            $scope.huantiData[0].detail_number = st.detail_number;
                            $scope.huantiData[0].detail_order = st.detail_order;
                            $scope.huantiData[0].paper_detail_id = st.paper_detail_id;
                            $scope.huantiData[0].paper_detail_pid = st.paper_detail_pid;
                            $scope.huantiData[0].paper_id = st.paper_id;
                            $scope.huantiData[0].option_type = st.option_type;
                            for (var kk in $scope.huantiData[0]) {
                                st[kk] = $scope.huantiData[0][kk];
                            }
                            //小题分数 和索引计算
                            if (st.subjectList && st.subjectList.length > 0) {
                                var n = 0;
                                angular.forEach(st.subjectList, function (xst, iii) {
                                    if (iii + 1 < st.subjectList.length) {
                                        xst.detail_marks = parseInt(parseInt(st.detail_marks) / st.subjectList.length);
                                        n += xst.detail_marks;
                                    }
                                    else {
                                        xst.detail_marks = parseInt(st.detail_marks) - n;
                                    }
                                    xst.detail_number = 0;
                                    xst.option_type = 4;
                                    xst.detail_order = parseInt(st.detail_order) + iii;
                                })
                            }
                        }
                    })
                })
            })
            $scope.covert_exam_all();
            //全部保存
            services._savePaper_level({id: $scope.param.id}).success(function (res) {
                if (res.code == 0) {
                    console.log(res);
                    $scope.param.paper_level = res.data;
                    $scope.param.paper_level_name = $rootScope._get_paper_leve_name(res.data);
                    $scope.savePaper();
                }
            })
            layer.closeAll();
        }
        else {
            layer.msg('没有试题可以替换~');
        }
    }
    //重新选题
    $scope.resetQuestion = function () {
        $rootScope.loadingStart();
        //先清楚目前试题篮
        $rootScope._delQuestionAll(function () {
            $scope._pExams = [];
            $scope._pExamsIndex = 0;
            //找出目前卷子所有试题
            angular.forEach($scope.PrivateBasketExams, function (kc) {
                angular.forEach(kc.children, function (tx) {
                    angular.forEach(tx.subjectList, function (st) {
                        $scope._pExams.push(st);
                    })
                })
            })
            //试题重新放入试题栏
            addExamBack();
        })
    }
    $scope._pExams = [];
    $scope._pExamsIndex = 0;
    //试题重新放入试题栏
    function addExamBack() {
        if ($scope._pExamsIndex < $scope._pExams.length) {
            $rootScope._addBasket($scope._pExams[$scope._pExamsIndex], addExamBack);
            $scope._pExamsIndex += 1;
        }
        else {
            $rootScope.loadingEnd();
            $rootScope.examKnowledge_id = $stateParams.id;
            $rootScope.examconfigParam = $scope.configParam;
            $rootScope._toPage("exams");
        }
    }

    //试卷预览
    $scope.lookPaper = function () {
        console.log($scope.param.paper_url)
        window.open($scope.param.paper_url)
    }
    //保存试卷
    $scope.savePaper = function (cllback) {

        $rootScope.loadingStart();
        if (!cllback) {
            //试卷配置
            $scope.param.configure = JSON.stringify($scope.configParam);
            //试题
            $scope.param.children = [];
            $scope.param.paper_full = 0;
            $scope.param.totalNum = 0;
            angular.forEach($scope.PrivateBasketExams, function (kc, i) {
                var kc_1 = {
                    paper_detail_id: null,
                    paper_id: null,
                    subject_id: kc.subject_id,
                    subject_pid: null,
                    option_type: 1,
                    detail_marks: kc.detail_marks,
                    detail_number: 0,
                    detail_order: kc.detail_order,
                    subject_type: 0,
                    pbank_title: null,
                    paper_explain: null,
                    children: []
                }
                angular.forEach(kc.children, function (tx, ii) {
                    var tx_1 = {
                        paper_detail_id: null,
                        paper_id: null,
                        subject_id: tx.subject_id,
                        subject_pid: null,
                        option_type: 2,
                        detail_marks: tx.detail_marks,
                        detail_number: 0,
                        detail_order: tx.detail_order,
                        subject_type: 0,
                        pbank_title: tx.pbank_title,
                        paper_explain: tx.paper_explain,
                        children: []
                    }
                    angular.forEach(tx.subjectList, function (st, iii) {
                        var st_1 = {
                            paper_detail_id: null,
                            paper_id: null,
                            subject_id: st.id,
                            subject_pid: null,
                            option_type: 3,
                            detail_marks: st.detail_marks,
                            detail_number: 1,
                            detail_order: st.detail_order,
                            subject_type: st.subject_type,
                            pbank_title: null,
                            paper_explain: null,
                            children: []
                        }
                        if (st.subjectList && st.subjectList.length > 0) {
                            angular.forEach(st.subjectList, function (xst, iiii) {
                                var xst_1 = {
                                    paper_detail_id: null,
                                    paper_id: null,
                                    subject_id: xst.id,
                                    subject_pid: null,
                                    option_type: 4,
                                    detail_marks: xst.detail_marks,
                                    detail_number: 1,
                                    detail_order: xst.detail_order,
                                    subject_type: xst.subject_type,
                                    pbank_title: null,
                                    paper_explain: null,
                                    children: []
                                }
                                st_1.children.push(xst_1)
                            })
                            st_1.detail_number = st.subjectList.length;
                        }
                        tx_1.children.push(st_1);
                        tx_1.detail_number += st_1.detail_number;
                    })
                    kc_1.detail_number += tx_1.detail_number;
                    kc_1.children.push(tx_1);
                })
                $scope.param.children.push(kc_1);
                $scope.param.totalNum += kc_1.detail_number;
                $scope.param.paper_full += kc_1.detail_marks;
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
            $('.bb-actions,.bbb-actions', col).remove();
            $scope.param.fragment = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>试卷预览</title>' +
                '<style>body{background:#f4f4f4;margin:0;padding:0;-webkit-touch-callout: none;  -webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;  }.paper-html{padding:30px 60px;width:870px;box-sizing:border-box}</style></head>' +
                '<body oncopy="return false;"  oncut="return false;" oncontextmenu="return false" ondragstart="return false" onselectstart ="return false" onbeforecopy="return false">' +
                '<noscript><iframe src="*.htm"></iframe></noscript> ' +
                '<div style="font-size: 16px;margin: 0 auto;background: #fff" class="paper-html">' +
                col.html() + '</div></body></html>';
        }
        else {
            $scope.param.fragment = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>试卷预览</title><body>试卷未更新</body></html>'
        }

        console.log($scope.param)
        services._savePaper($scope.param).success(function (res) {
            if (res.code == 0) {
                layer.close(paper_config);
                if (cllback) {
                    cllback();
                }
                else {
                    $rootScope.loadingEnd();
                    if (res.code != 0) {
                        layer.alert(res.message);
                    }
                }
            }
            else {
                layer.msg(res.message);
            }
        })
    }
    //试卷设置
    $scope.configPaper = function () {
        paper_config = layer.open({
            type: 1,
            title: "试卷设置",
            area: ["700px", "580px"],
            content: $("#paper_config")
        });
        //加载一次老师数据
        if (!$scope.teachers) {
            services._assistantList({user_id: JSON.parse(window.sessionStorage.getItem("_USERINFO")).user_id}).success(function (res) {
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
    //初始化
    $scope.init = function (callback) {
        if ($scope.param.id) {
            $rootScope.loadingStart();
            services._pbankPreview({
                pbank_id: $scope.param.id
            }).success(function (bas) {
                if (bas.code == 0) {
                    if (bas.data.children.length > 0) {
                        $scope.PrivateBasketExams = bas.data.children;
                        //属性操作
                        //$scope.param.paper_title = ($scope.PrivateBasketExams.length > 1 ? '文化综合' : $scope.PrivateBasketExams[0].dic_name) + "模拟试卷";
                        $scope.param['paper_title'] = bas.data.paper_title;  //试卷标题
                        $scope.param['paper_subtitle'] = bas.data.paper_subtitle; //子标题
                        $scope.param['paper_duration'] = bas.data.paper_duration; //考试用时
                        $scope.param['paper_curriculum'] = bas.data.paper_curriculum; //试卷课程
                        $scope.param['paper_pass'] = bas.data.paper_pass; //及格分
                        $scope.param['paper_type'] = bas.data.paper_type ? bas.data.paper_type : 10042; //试卷类型
                        $scope.param['paper_level'] = bas.data.paper_level ? bas.data.paper_level : 10076; //试卷难易度
                        $scope.param['paper_code'] = bas.data.paper_code; //试卷编码
                        $scope.param['paper_explain'] = bas.data.paper_explain; //试卷解析
                        $scope.param['paper_full'] = bas.data.paper_full; //满分
                        $scope.param['paper_url'] = bas.data.paper_url; //预览地址
                        $scope.param['org_id'] = bas.data.org_id; //所属机构
                        $scope.param['assistant'] = bas.data.assistant; //协作组
                        $scope.param['is_open'] = bas.data.is_open; //是否公开
                        $scope.param['is_template'] = bas.data.is_template; //模板id
                        $scope.param['source'] = bas.data.source; //组卷方式
                        $scope.param['status'] = bas.data.status; //状态
                        $scope.param['configure'] = bas.data.configure;
                        //试卷配置
                        $scope.configParam = JSON.parse(bas.data.configure);
                        $scope.param['paper_type_name'] = $rootScope._get_paper_type_name($scope.param['paper_type']);
                        $scope.param['paper_level_name'] = $rootScope._get_paper_leve_name($scope.param['paper_level']);
                        $scope.covert_exam_all();
                        if (callback) {
                            callback();
                        }
                        else {
                            $rootScope.loadingEnd();
                            setTimeout(function () {
                                //html片段
                                var col = $('.paper-html').clone();
                                $('.bb-actions,.bbb-actions', col).remove();
                                var fragment = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>试卷预览</title>' +
                                    '<style>body{background:#f4f4f4;margin:0;padding:0;-webkit-touch-callout: none;  -webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;  }.paper-html{padding:30px 60px;width:870px;box-sizing:border-box}</style></head>' +
                                    '<body oncopy="return false;"  oncut="return false;" oncontextmenu="return false" ondragstart="return false" onselectstart ="return false" onbeforecopy="return false">' +
                                    '<noscript><iframe src="*.htm"></iframe></noscript> ' +
                                    '<div style="font-size: 16px;margin: 0 auto;background: #fff" class="paper-html">' +
                                    col.html() + '</div></body></html>';
                                services._savePbank_html({
                                    paper_code: $scope.param.paper_code,
                                    fragment: fragment
                                })
                            }, 1000)
                        }
                    }
                    else {
                        layer.closeAll();
                        layer.alert('未选择试题，无法进行组卷!', function () {
                            layer.closeAll();
                            window.history.go(-1);
                        });
                    }
                }
                else {
                    layer.alert('试卷异常， 请重新进入~', function () {
                        layer.closeAll();
                        window.history.go(-1);
                    });
                }
            })
        }
        else {
            layer.alert('试卷异常， 请重新进入~', function () {
                layer.closeAll();
                window.history.go(-1);
            });
        }
    }
    $scope.init();
    //修改试题
    $scope.update_exam_st = function (st) {
        $scope.huantiParam.id = st.id;
        $scope.huantiData = null;
        $scope.openExamForm(st, function (data) {
            $scope.huantiData = [data];
            $scope.knowledgeChange();
        });
    }
    //修改小试题
    $scope.update_exam_xst = function (xst) {
        $scope.huantiParam.id = xst.subject_pid;
        $scope.huantiData = null;
        $scope.crossSetlist(xst, function (data) {
            $scope.huantiData = [data];
            $scope.knowledgeChange();
        }, xst.bank_id);
    }
});

