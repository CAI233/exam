var myDirectives = angular.module('myDirectives', [])
    //知识点 单选 + 多选
    .directive('accordion', function ($compile, $rootScope) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                expander: '=',
                children: '=',
                knowledge: '='
            },
            template: '<ul class="accordion_tree" ng-class="{\'selected\':expander.selected}"><li>' +
            '<span class="iconfont" ng-class="{\'icon-jia\': !expander.selected, \'icon-jian\':expander.selected}" ng-click="treeSelected(expander)" ng-show="expander.children && expander.children.length > 0"></span>' +
            '<span class="iconfont box" ng-if="checkbox" ng-class="{\'icon-check-box-uncheck\': !expander.checked_box, \'icon-checked\':expander.checked_box}" ng-click="treeClick(expander)"></span>' +
            '<a ng-click="treeClick(expander)" ng-class="{\'checked\': expander.checked && !checkbox,\'checkedbox\': expander.checked_box && checkbox}" title="{{expander.struct_name}}"><i></i>{{expander.struct_name}}</a></ul>',
            link: function (scope, element, attr) {
                scope.checked_knowledge = null;
                //避免在上传页面数据影响---新建变量
                scope.checked_update_knowledges = null;
                scope.checkbox = false;
                if (scope.children) {
                    if (attr.checkbox) {
                        scope.checkbox = true;
                        var html = $compile("<accordion expander='expander' knowledge='knowledge' checkbox='true' children='expander.children' ng-repeat='expander in children | orderBy : \"create_time\"'></accordion>")(scope);
                        element.append(html)
                    }
                    else {
                        var html = $compile("<accordion expander='expander' knowledge='knowledge' children='expander.children' ng-repeat='expander in children | orderBy : \"create_time\"'></accordion>")(scope);
                        element.append(html)
                    }
                }
                scope.treeClick = function (item) {
                    if (scope.checkbox) {
                        item.checked_box = !item.checked_box;
                        //处理下级
                        scope.eachChild_all(item);
                        //处理上级
                        scope.covertTreeAll(item);
                        // //选项清算
                        $rootScope.checked_knowledges = [];
                        $rootScope.checked_update_knowledges = [];
                        scope.covertSelectAll(scope.knowledge);
                    }
                    else {
                        item.checked = !item.checked;
                        if (item.checked) {
                            $rootScope.checked_knowledge = item;
                        }
                        else {
                            $rootScope.checked_knowledge = null;
                        }
                        scope.eachChild(scope.knowledge, item);
                    }
                }
                scope.covertSelectAll = function (arr) {
                    angular.forEach(arr, function (item) {

                        if(item.checked_box){
                            $rootScope.checked_knowledges.push({
                                id: item.id,
                                struct_name: item.struct_name
                            });
                            $rootScope.checked_update_knowledges.push({
                                id: item.id,
                                struct_name: item.struct_name
                            });

                        }
                        if (item.checked_box && (!item.children)) {
                            $rootScope.checked_knowledges.push({
                                id: item.id,
                                struct_name: item.struct_name
                            });
                            $rootScope.checked_update_knowledges.push({
                                id: item.id,
                                struct_name: item.struct_name
                            });
                        }
                        else if (item.children && item.children.length > 0) {
                            scope.covertSelectAll(item.children);
                        }
                    })
                }
                scope.treeSelected = function (item) {
                    item.selected = !item.selected;
                }
                scope.eachChild_all = function (item) {
                    if (item.children && item.children.length > 0) {
                        angular.forEach(item.children, function (mm) {
                            mm.checked_box = item.checked_box;
                            if (mm.children) {
                                scope.eachChild_all(mm);
                            }
                        })
                    }
                }
                scope.covertTreeAll = function (item) {
                    var node = scope.eachChild_all_clear(scope.knowledge, item, true);
                    while (node && node.id){
                        var check = 0;
                        angular.forEach(node.children, function (mm) {
                            if(mm.checked_box)
                                check += 1;
                        })
                        node.checked_box = (check == node.children.length) ? true : false;
                        node = scope.eachChild_all_clear(scope.knowledge, node, true);
                    }
                }
                scope.eachChild_all_clear = function (parent, item, root) {
                    var mm = null;
                    angular.forEach(root? parent : parent.children, function (node) {
                        if(!mm) {
                            if (item.id == node.id) {
                                mm = parent;
                            }
                            else if (node.children && node.children.length > 0) {
                                var nn = scope.eachChild_all_clear(node, item);
                                mm = nn ? nn : mm;
                            }
                        }
                    })
                    console.log('xx1')
                    return mm;
                }
                scope.eachChild = function (parent, item) {
                    angular.forEach(parent, function (mm) {
                        if (mm.id != item.id) {
                            mm.checked = false;
                        }
                        if (mm.children) {
                            scope.eachChild(mm.children, item);
                        }
                    })
                }
            }
        };
    })
    //树形表格
   .directive('treeGrid', function ($compile, $rootScope) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                row: '=',
                children: '=',
                show_leve_tf:'=',
                show_true_tf:'='
            },
            template: '<div class="tree_grid" ng-class="{\'selected\':row.selected}"><div class="tree-grid-row">'+
            '<div class="tree-grid-col know_name">'+
            '<span class="iconfont" ng-class="{\'icon-jia\': !row.selected, \'icon-jian\':row.selected}" ng-click="treeGridSelected(row)" ng-show="row.children && row.children.length > 0"></span>{{row.struct_name}}</div>'+
            '<div class="tree-grid-col" style="text-align:center;">{{show_currum_name(row.struct_curriculum)}}</div>'+
            '<div class="tree-grid-col" ng-if="!show_true_tf">{{row.struct_totalnum}}</div>'+
            '<div class="tree-grid-col" style="text-align:center;">{{row.subject_codes}}</div>'+
            '<div class="tree-grid-col" ng-if="show_true_tf" style="text-align:center;">{{row.student_rightnum}}</div>'+
            '<div class="tree-grid-col" ng-if="show_true_tf" style="text-align:center;">{{row.student_totalnum}}</div>'+
            '<div class="tree-grid-col" ng-if="show_true_tf" style="text-align:center;">{{((row.student_rightnum/row.student_totalnum)*100).toFixed(2)}}%</div>'+
            '<div class="tree-grid-col" ng-if="!show_true_tf">' +
                '<div class="layui-progress" lay-showpercent="true">'+
                    '<div class="layui-progress-bar" lay-percent="{{show_percent(row.student_rightnum,row.student_totalnum)}}%" style="width: {{show_percent(row.student_rightnum,row.student_totalnum)}}%;" ng-class="{\'color_red\': show_percent(row.student_rightnum,row.student_totalnum)<30,\'color_yel\': show_percent(row.student_rightnum,row.student_totalnum)>=30 && show_percent(row.student_rightnum,row.student_totalnum)<60,\'color_gre\': show_percent(row.student_rightnum,row.student_totalnum)>=60 && show_percent(row.student_rightnum,row.student_totalnum)<80,\'color_sky\': show_percent(row.student_rightnum,row.student_totalnum)>=80 && show_percent(row.student_rightnum,row.student_totalnum)<=100}">' +
                    '</div>' +
                    '<span class="layui-progress-text">{{show_percent(row.student_rightnum,row.student_totalnum)}}%</span>' +
                    // '<span class="tree_level" ng-if="show_percent(row.struct_rightnum,row.struct_totalnum)<30 && show_leve_tf" >极差</span>' +
                    // '<span class="tree_level" ng-if="show_percent(row.struct_rightnum,row.struct_totalnum)>=30 && show_percent(row.struct_rightnum,row.struct_totalnum)<60 && show_leve_tf">差</span>' +
                    // '<span class="tree_level" ng-if="show_percent(row.struct_rightnum,row.struct_totalnum)>=60 && show_percent(row.struct_rightnum,row.struct_totalnum)<80 && show_leve_tf">良</span>' +
                    // '<span class="tree_level" ng-if="show_percent(row.struct_rightnum,row.struct_totalnum)>=80 && show_percent(row.struct_rightnum,row.struct_totalnum)<=100 && show_leve_tf">优</span>' +
                '</div>' +
            '</div></div></div>',
            link: function (scope, element, attr) {
                scope.show_leve_tf = $rootScope.show_leve_tf;
                scope.show_true_tf = $rootScope.show_true_tf;
                if (scope.children) {
                    var html = $compile("<tree-grid row='row' children='row.children' ng-repeat='row in children'></tree-grid>")(scope);
                    element.append(html);
                }
                scope.treeGridSelected = function (item) {
                    item.selected = !item.selected;
                }
                //得到课程名称
                scope.show_currum_name = function(id){
                    var name = null;
                    angular.forEach($rootScope.curriculums, function (item) {
                        if (item.id == id)
                            name = item.dic_name;
                    })

                    return name;
                }
                scope.show_percent = function(right,total){
                    var now_percent = null;
                    if(total==0){
                        now_percent = 0;
                    }else{
                        now_percent = ((right/total)*100).toFixed(2);
                    }
                    return now_percent;
                }
            }
        };
    })

    //日历控件
    .directive('dateTimePicker', function () {
        return {
            restrict: 'ECA',
            link: function (scope, element, attr) {
                laydate.render({
                    elem: '#' + element.attr("id")
                    , type: 'datetime'
                    , theme: '#393D49'
                    , done: function (value, date) {
                        element.val(value).trigger('change');
                    }
                });
            }
        };
    })
    //大题修改
    .directive('editExam', function ($rootScope) {
        return {
            restrict: 'E',
            templateUrl: ctxPath + "/static/teacher/plugin/editExam/main.html",
            replace: true,
            link: function (scope, element, attr) {

                scope.con_knowledges = null;
                scope.editExamLoad = null;
                //获取知识点
                scope.get_con_knowledges = function () {
                    $rootScope.services._getKnowledge({
                        struct_curriculum: scope.editExamObject.subject_curriculum
                    }).success(function (res) {
                        // $rootScope.checked_knowledges = [];
                        $rootScope.checked_update_knowledges = [];
                        scope.get_checke_knowledge(res.data  , true);
                        scope.con_knowledges = res.data;
                    })
                }
                //选择知识点
                scope.get_checke_knowledge = function (arr, bool) {
                    angular.forEach(arr, function (item) {
                        if(bool)
                            item.selected = true;
                        if(scope.editExamObject.subject_knowledge.toString().indexOf(item.id) != -1){
                            item.checked_box = true;
                        }
                        if(item.checked_box){
                            // $rootScope.checked_knowledges.push({
                            //     id: item.id,
                            //     struct_name: item.struct_name
                            // });
                            $rootScope.checked_update_knowledges.push({
                                id: item.id,
                                struct_name: item.struct_name
                            });
                        }
                        if (item.checked_box && (!item.children)) {
                            // $rootScope.checked_knowledges.push({
                            //     id: item.id,
                            //     struct_name: item.struct_name
                            // });
                            $rootScope.checked_update_knowledges.push({
                                id: item.id,
                                struct_name: item.struct_name
                            });
                        }
                        else if (item.children && item.children.length > 0) {
                            scope.get_checke_knowledge(item.children);
                        }
                    })
                }
                //打开编辑器
                scope.openExamForm = function (data, callback) {
                    if(data.bank_id && $rootScope.superManage()){
                        layer.msg('无法修改学校试题');
                        return false;
                    }
                    $rootScope.getMyBanks();
                    scope.editExamLoad = callback;
                    scope.editExamObject = angular.copy(data);
                    $(".EditExam").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");
                    //加载知识点
                    scope.get_con_knowledges();
                    //富文本框里 试题内容
                    //设置题干
                    scope.html =  '<p style="padding:5px;background: #c4c4c4"  contenteditable="false"><span class="subject_question">【题干】</span></p>' + scope.editExamObject.subject_question;
                    //设置答案
                    if (scope.editExamObject.subject_answer != "" && scope.editExamObject.subject_answer != null) {
                        scope.html += '<p style="padding:5px;background: #c4c4c4"  contenteditable="false"><span class="subject_answer">【答案】</span></p>' + scope.editExamObject.subject_answer;
                    }
                    else{
                        scope.html += '<p style="padding:5px;background: #c4c4c4"  contenteditable="false"><span class="subject_answer">【答案】</span></p><p>略</p>';
                    }
                    //解析
                    if (scope.editExamObject.subject_analysis != "" && scope.editExamObject.subject_analysis != null) {
                        scope.html += '<p style="padding:5px;background: #c4c4c4"  contenteditable="false"><span class="subject_analysis">【解析】</span></p>' + scope.editExamObject.subject_analysis;
                    }
                    else{
                        scope.html += '<p style="padding:5px;background: #c4c4c4"  contenteditable="false"><span class="subject_analysis">【解析】</span></p><p>略</p>';
                    }
                    setTimeout(function () {
                        $('#myhtmlload p').css("line-height","25px");
                        $('#myhtmlload img').css("vertical-align","middle");
                        $('#myhtmlload span').css("text-indent","0");
                        var html = $('#myhtmlload').html();
                        html = html ? html.replace(/<p><\/p>/g, ""): html;
                        $(document.getElementById('editExamIframe').contentWindow.ue.setContent(html));
                    },500)
                }
                scope.closeEditExam = function () {
                    $(".EditExam").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
                }
                //保存
                scope.save_Blist = function(){
                    var context = document.getElementById('editExamIframe').contentWindow.ue.getContent();
                    scope.editExamObject.opContext = context;
                    //重新计算知识点
                    // if(!$rootScope.checked_knowledges || $rootScope.checked_knowledges.length == 0){
                    //     layer.msg('请选择知识点');
                    //     return false;
                    // }
                    if(!$rootScope.checked_update_knowledges || $rootScope.checked_update_knowledges.length == 0){
                        layer.msg('请选择知识点');
                        return false;
                    }
                    scope.editExamObject.subject_knowledge = [];
                    // angular.forEach($rootScope.checked_knowledges, function (item) {
                    //     scope.editExamObject.subject_knowledge.push(item.id);
                    // })
                    angular.forEach($rootScope.checked_update_knowledges, function (item) {
                        scope.editExamObject.subject_knowledge.push(item.id);
                    })
                    scope.editExamObject.subject_knowledge = scope.editExamObject.subject_knowledge.toString();
                    if(scope.editExamObject.bank_id && $rootScope.superManage()){
                        layer.msg("无法修改学校试题")
                        return false;
                    }else{
                        $rootScope.services._addset_sub(scope.editExamObject).success(function (res) {
                            if(res.code==0){
                                layer.msg(res.message);
                                if(scope.editExamLoad)
                                    scope.editExamLoad(res.data);
                                scope.closeEditExam();
                            }else{
                                layer.msg(res.message);
                            }
                    })
                    }
                }
                scope.add_banks = function(){
                    scope.bank_param = {}
                    scope.expored = layer.prompt({
                        formType: 0,
                        title: '请输入题库名称',
                    }, function(value, index, elem){
                        scope.bank_param.bank_title = value;
                        if (!scope.bank_param.bank_title) {
                            layer.msg("请填写题库标题");
                            return false;
                        }
                        $rootScope.services._saveBank(scope.bank_param).success(function (res) {
                            if (res.code == 0) {
                                layer.close(scope.expored);
                                // $rootScope.getMyBanks();
                                //获取我的题库
                                $rootScope.services._getBankList().success(function (res) {
                                    $rootScope.myBankList = res.data;
                                    for(var i=0;i<res.data.length;i++){
                                        if(res.data[i].bank_title==scope.bank_param.bank_title){
                                            scope.editExamObject.bank_id = res.data[i].id;
                                        }
                                    }
                                });

                                layer.msg(res.message);
                            } else {
                                layer.msg(res.message);
                            }

                        })
                    });
                }
                //上传页面---临时试题保存
                scope.save_upadteList = function(){
                    var context = document.getElementById('editExamIframe').contentWindow.ue.getContent();
                    scope.editExamObject.opContext = context;
                    if(!$rootScope.checked_update_knowledges || $rootScope.checked_update_knowledges.length == 0){
                        layer.msg('请选择知识点');
                        return false;
                    };
                    scope.editExamObject.subject_knowledge = [];
                    angular.forEach($rootScope.checked_update_knowledges, function (item) {
                        scope.editExamObject.subject_knowledge.push(item.id);
                    });
                    scope.editExamObject.subject_knowledge = scope.editExamObject.subject_knowledge.toString();

                    $rootScope.services._update_Savesub (scope.editExamObject).success(function (res) {
                        if(res.code==0){
                            layer.msg(res.message);
                            if(scope.editExamLoad)
                                scope.editExamLoad(res.data);
                            if(scope.show_bank){
                                scope.Getai_list();
                            }
                            scope.closeEditExam();
                        }else{
                            layer.msg(res.message);
                        }
                    })

                }
            }
        };
    })
    //预览
    .directive('seeList', function () {
        return {
            restrict: 'E',
            templateUrl: ctxPath + "/static/teacher/plugin/seeList/main.html",
            replace: true,
            link: function (scope, element, attr) {
                scope.openSeeList = function(data,index){
                    scope.selRow = data;
                    // scope.parent_id = scope.selRow.bank_id;
                    console.log(data);
                    scope.selRow['now_index'] = index;
                    $(".seeList").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");

                }
                scope.closeSeeList = function () {
                    scope.selRow = null;
                    $(".seeList").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
                }

            }
        };
    })
    //小题修改
    .directive('crossSet', function ($rootScope) {
        return {
            restrict: 'E',
            templateUrl: ctxPath + "/static/teacher/plugin/crossSet/main.html",
            replace: true,
            link: function (scope, element, attr) {

                scope.crossSetlist = function (data, callback,bank_id) {
                    if(data.bank_id && $rootScope.superManage()){
                        layer.msg('无法修改学校试题');
                        return false;
                    }
                    console.log(bank_id);
                    scope.cross_selRow = data;
                    //当前小题的题库id
                    scope.cross_selRow.bank_id = bank_id;
                    console.log(scope.cross_selRow);
                    scope.crossSetLoad = callback;

                    $rootScope.getMyBanks();
                    scope.level_data = angular.copy($rootScope.questionLevelTypes)
                    $(".crossSet").removeClass("fadeOutRightBig").removeClass("none").addClass("fadeInRightBig");
                    //设置题干
                    scope.Bhtml =  '<p style="padding:5px;background: #c4c4c4" contenteditable="false"><span class="subject_question">【题干】</span></p>' + scope.cross_selRow.subject_question;
                    //设置答案
                    if (scope.cross_selRow.subject_answer != "" && scope.cross_selRow.subject_answer != null) {
                        scope.Bhtml += '<p style="padding:5px;background: #c4c4c4" contenteditable="false"><span class="subject_answer">【答案】</span></p>' + scope.cross_selRow.subject_answer;
                    }
                    else{
                        scope.Bhtml += '<p style="padding:5px;background: #c4c4c4" contenteditable="false"><span class="subject_answer">【答案】</span></p><p>略</p>';
                    }
                    //解析
                    if (scope.cross_selRow.subject_analysis != "" && scope.cross_selRow.subject_analysis != null) {
                        scope.Bhtml += '<p style="padding:5px;background: #c4c4c4" contenteditable="false"><span class="subject_analysis">【解析】</span></p>' + scope.cross_selRow.subject_analysis;
                    }
                    else{
                        scope.Bhtml += '<p style="padding:5px;background: #c4c4c4" contenteditable="false"><span class="subject_analysis">【解析】</span></p><p>略</p>';
                    }
                    setTimeout(function () {
                        $('#B_html p').css("line-height","25px");
                        $('#B_html img').css("vertical-align","middle");
                        $('#B_html span').css("text-indent","0");
                        var html = $('#B_html').html();
                        html = html ? html.replace(/<p><\/p>/g, "") : html;
                        $(document.getElementById('cross_iframs').contentWindow.ue.setContent(html));
                    },500)
                }
                scope.closeSetList = function () {
                    $(".crossSet").removeClass("fadeInRightBig").addClass("fadeOutRightBig");
                }
                scope.crossSetLoad = null;
                scope.save_Slist = function(){
                    var context = document.getElementById('cross_iframs').contentWindow.ue.getContent();
                    scope.cross_selRow.opContext = context;

                    if(scope.cross_selRow.bank_id && $rootScope.superManage()){
                        layer.msg("无法修改学校试题")
                        return false;
                    }else{
                        $rootScope.services._addset_sub(scope.cross_selRow).success(function (res) {
                            if(res.code==0){
                                layer.msg(res.message);
                                if(scope.crossSetLoad)
                                    scope.crossSetLoad(res.data);
                                $rootScope.getMyBanks();
                                scope.closeSetList();
                            }else{
                                layer.msg(res.message);
                            }
                        })
                    }

                }
                scope.save_upadteBlist = function(){
                    var context = document.getElementById('cross_iframs').contentWindow.ue.getContent();
                    scope.cross_selRow.opContext = context;

                    $rootScope.services._update_Savesub(scope.cross_selRow).success(function (res) {
                        if(res.code==0){
                            layer.msg(res.message);
                            if(scope.crossSetLoad)
                                scope.crossSetLoad(res.data);
                            if(scope.show_bank){
                                scope.Getai_list();
                            }
                            $rootScope.getMyBanks();
                            scope.closeSetList();
                        }else{
                            layer.msg(res.message);
                        }
                    })
                }

            }
        };
    })
