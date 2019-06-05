myApp.controller('chapterCatController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    //分类树
    services["_dic_tree"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/getChapter', param, "POST");
    }
    //分类删除
    services["_dic_del"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/delStruct', param, "POST");
    }
    //章节保存
    services["_save_chapter"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/struct/saveStruct', param, "POST");
    }
    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1, //总页数
                pageNum: 1, //当前页
                pageSize: 10, //每页条数
                total: 0, //总条数
                searchText: null
            },
            columns: [
                {field: 'struct_name', title: "章节名称"},
                {field: 'struct_alias', title: "章节别名", align: 'left'},
                {field: 'create_time', title: "创建时间"},
                {field: 'remark', title: "备注", align: 'left'}
            ]
        },
        reload: function (param) {
            $scope.load ();
        }
    };
    $scope.all_aparam= {
        struct_curriculum:null,
        grade:null,
        specialty:null
    };

    //年级参数内容
    $scope.grade_param = {
        pageNum: 1,
        pageSize: 1000,
        dic_code: 10000
    }
    $scope.gradeData = null;
    services._eMDictionary($scope.grade_param).success(function (res) {
        $scope.gradeData = res.data.rows;
        //默认年级
        $scope.gradeData[0].check = true;
        $scope.all_aparam.grade = [$scope.gradeData[0].id]
    })

    //专业参数内容
    $scope.specialty_param = {
        pageNum: 1,
        pageSize: 1000,
        dic_code: 20000
    }
    $scope.specialtyData = null;
    services._eMDictionary($scope.specialty_param).success(function (res) {
        $scope.specialtyData = res.data.rows;
        //默认专业
        $scope.specialtyData[0].check = true;
        $scope.all_aparam.specialty = [$scope.specialtyData[0].id]
    })
    //课程
    $scope.curriculum_param = {
        pageNum: 1,
        pageSize: 1000,
        dic_parentcode: 30000
    }
    $scope.curriculumData = null;
    services._dic_list($scope.curriculum_param).success(function (res) {
        $scope.curriculumData = res.data;
        //默认课程
        $scope.curriculumData[0].check = true;
        $scope.all_aparam.struct_curriculum = $scope.curriculumData[0].id;
    })

    //课程
    $scope.selectCurr = function(data){
        angular.forEach($scope.curriculumData,function(item,index){
            if(item.id!=data.id){
                item.check = false;
            }else{
                item.check = true;
            }
        })
        $scope.all_aparam.struct_curriculum = data.id;
        $scope.load()
    }
    //年级

    $scope.selectGra = function(data){
        $scope.all_grade = [];
        angular.forEach($scope.gradeData,function(item,index){
            if (item.check) {
                $scope.all_grade.push(item.id);
            }
        })
        $scope.all_aparam.grade = $scope.all_grade;
        $scope.load()
    }
    //专业

    $scope.selectSpe = function(data){
        $scope.all_specialty = [];
        angular.forEach($scope.specialtyData,function(item,index){
            if (item.check) {
                $scope.all_specialty.push(item.id);
            }
        })
        $scope.all_aparam.specialty = $scope.all_specialty;
        $scope.load()
    }

    //专业
    // $scope.speTest = {
    //     dic_name: null,
    //     dic_ownerid: null
    // }
    $scope.selRow = {}
    var selNode = null;

    $("#comTree").tree({
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle1(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            selNode = node;
            $scope.tableControl.loadData(node);
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#comTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#comTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#comTree").tree("getRoot");
            }
            $("#comTree").tree("select", selNode.target);

            //查找未分配的分类
            var unNode = $("#comTree").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });
    $("#resTree").tree({
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle1(data[i]);
            }
            return data;
        },
        "onSelect": function (node) {
            $scope.selRow.dic_parentid = node.id;
            $scope.selRow.parent_name = node.text;
            $(".layui-form-selected").removeClass("layui-form-selected")
        },
        onLoadSuccess: function (node, data) {
            if (!selNode) {
                selNode = $("#resTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#resTree").tree("find", selNode.id);
                selNode = boolNode ? boolNode : $("#resTree").tree("getRoot");
            }
            $("#resTree").tree("select", selNode.target);
            //查找未分配的分类
            var unNode = $("#resTree").tree("find", -1);
            if (unNode) {
                unNode.target.parentNode.className = "unNode";
            }
        }
    });
    function changeTreeStyle1(treeNode) {
        if (treeNode['children'] && treeNode['children'].length > 0) {
            for (var j = 0; j < treeNode['children'].length; j++) {
                //排序
                // treeNode['children'].sort($rootScope._by("create_time"));
                changeTreeStyle1(treeNode['children'][j]);
            }
        }
        //设置属性
        treeNode["text"] = treeNode.struct_name;
        treeNode["id"] = treeNode.id;
    }

    //加载
    $scope.load = function () {
        setTimeout(function(){
            services._dic_tree($scope.all_aparam).success(function(res){
                var arrdata = [];
                if (res.data) {
                    arrdata = res.data;
                }
                var allData = [{
                    struct_name: "全部",
                    id: 0,
                    children: arrdata
                }]
                $("#comTree").tree("loadData", allData);
            })
        },500)
    }

    //新增
    $scope.addRow = function () {
        $scope.selRow = {
            struct_parent: selNode.id,
            parent_name: selNode.text
        }
        $scope.status = true;
        $rootScope.formOpen();
        services._dic_tree($scope.all_aparam).success(function (res) {
            var arrdata = [];
            if (res.data) {
                arrdata = res.data;
            }
            var allData = [{
                struct_name: "全部",
                id: 0,
                children: arrdata
            }]
            selNode = $("#comTree").tree("getSelected");
            $("#resTree").tree("loadData", allData);
        })
        $scope.pull_param.id = null;
    }
    //修改
    $scope.row_update = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                $scope.selRow = $scope.tableControl.data[index]
                $scope.all_aparam['id'] = $scope.tableControl.data[item.index].id;

                ids.push($scope.tableControl.data[item.index].id)
                $scope.selRow.dic_code = $scope.tableControl.data[item.index].struct_alias;
                $scope.selRow.dic_name = $scope.tableControl.data[item.index].struct_name
            }
        });
        if (ids.length == 0) {
            layer.alert("请选择你将要修改的数据");
            return false
        }
        if (ids.length > 1) {
            layer.alert("同时只能修改一条数据");
            return false
        }
        $scope.status = false
        $rootScope.formOpen();
        $scope.all_aparam.id =ids[0];
        services._dic_tree($scope.all_aparam).success(function (res) {
            var arrdata = [];
            if (res.data) {
                arrdata = res.data;
            }
            var allData = [{
                struct_name: "全部",
                id: 0,
                children: arrdata
            }]
            selNode = $("#comTree").tree("getSelected");
            $("#resTree").tree("loadData", allData);

            //隐藏当前节点
            var nowNN = $("#resTree").tree("find", $scope.selRow.id);
            $("#resTree").tree("remove", nowNN.target);
        })
        $scope.pull_param.id = $scope.all_aparam.id;
    }

    $scope.pull_param = {
        struct_type:1
    }
    //提交
    $scope._form_submit = function (bool) {
        if (!$scope.selRow.struct_name) {
            layer.alert("请填写章节名称")
            return false;
        }
        if ($scope.selRow.dic_parentid == $scope.selRow.id) {
            layer.alert('请选择正确的父级')
            return false;
        }

        $scope.pull_param.struct_curriculum = $scope.all_aparam.struct_curriculum;
        $scope.pull_param.grade = $scope.all_aparam.grade;
        $scope.pull_param.specialty = $scope.all_aparam.specialty;
        $scope.pull_param.struct_parent = $scope.selRow.dic_parentid;
        $scope.pull_param.struct_name = $scope.selRow.struct_name;
        $scope.pull_param.struct_alias = $scope.selRow.struct_alias;
        $scope.pull_param.remark =  $scope.selRow.remark;

        services._save_chapter($scope.pull_param).success(function(res){
            if (res.code == 0) {
                if (bool) {
                    $rootScope.formClose();
                    $scope.load();
                }
                else {
                    $scope.selRow = {
                        dic_parentid: $scope.selRow.dic_parentid,
                        parent_name: $scope.selRow.parent_name
                    };
                }
                $scope.load();
                layer.msg(res.message);
            }
            else {
                layer.msg(res.message);
            }
        })
    }

    //删除
    $scope.delRow = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                ids.push($scope.tableControl.data[item.index].id)
            }
        });
        if (ids.length == 0) {
            layer.alert("请选择你将要删除的数据");
        }
        else {
            layer.confirm('是否删除此节点及子节点？', {
                btn: ['确定', '取消'] //按钮
            }, function () {
                services._dic_del({ids: ids}).success(function (res) {
                    if (res.code == 0) {
                        layer.msg(res.message);
                        $scope.load();
                    } else {
                        layer.msg(res.message)
                    }
                })
            })
        }
    }

});