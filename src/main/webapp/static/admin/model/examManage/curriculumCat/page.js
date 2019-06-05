myApp.controller('curriculumCatController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    //新增课程
    services["_add_eMDictionary"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/save', param, "POST");
    }
    //删除课程
    services["_del_eMDictionary"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/delete', param, "POST");
    }
    //课程列表
    services["_curr_list"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/currList', param, "POST");
    }

    //课程列表
    services["_dic_tree"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/eMDictionary/getDicTree', param, "POST");
    }



    $scope.tableControl = {
        config: {
            check: true,
            param: {
                pages: 1,
                pageSize: 10,
                pageNum: 1,
                total: 0,
                dic_code: "30000"
            },
            columns: [
                {field: 'dic_code', title: "编码", align: 'left'},
                {field: 'dic_name', title: "名称", align: 'left'},
                {field: 'dic_alias', title: "别名", align: 'left'},
                {field: 'creator_name', title: "创建人", align: 'left'},
                {field: 'create_time', title: "创建日期", align: 'left'},
                {field: 'remark', title: "备注", align: 'left'}
            ]
        },
        reload: function (param) {
            services._dic_tree({dic_parentcode: '30000'}).success(function(res){
                var arrdata = [];
                if (res.data) {
                    arrdata = res.data;
                    $scope.arrdata = res.data;
                }
                var allData = [{
                    dic_name: "全部",
                    id: 0,
                    children: arrdata
                }]
                $("#comTree").tree("loadData", allData);
            })
        }
    };

    $scope.selRow = {};

    //年级
    $scope.grade_param = {
        pageNum: 1,
        pageSize: 1000,
        dic_code: '10000'
    }

    //页面操作内容
    $scope.param = {
        pageNum: 1,
        pageSize: 1000,
        dic_code: "30000",
        dic_ownerid: null,
        dic_gradeid: null

    }
    $scope.rest = function () {
        $scope.param.dic_ownerid = null;
        $scope.param.owner_name = null;
        $scope.param.dic_gradeid = null;
        $scope.param.grade_name = null;

    }



    //新增
    $scope.addRow = function () {
        $scope.selRow = {};
        // $scope.status = true;
        $rootScope.formOpen();
    }

    //题型新增
    $scope.C_addRow = function(){
        $scope.selRow = {};

        $scope.get_list();
    }

    // //课程选项或父级标签选择
    $scope.get_list = function(){

        var now_tree = [];
        angular.forEach($scope.arrdata,function(item,index){
            var now_obj = {}
            $.each(item,function(v,k){
                now_obj[v] = k;
                if(v == 'children'){
                    now_obj[v] = [];
                }
            })
            now_tree.push(now_obj);
        })
        
        $scope.selRow.parent_name = $scope.parent_name;
        $scope.selRow.dic_parentid = $scope.parent_id;
        $("#resTree").tree("loadData",now_tree);
        $rootScope.formOpen();
    }


    //提交
    $scope._form_submit = function (bool) {
        if (!$scope.selRow.dic_code) {
            layer.alert("请填写课程编码")
            return false;
        }
        if (!$scope.selRow.dic_name) {
            layer.alert("请填写课程名称")
            return false;
        }
        $scope.selRow.dic_parentcode = "30000";

        services._add_eMDictionary($scope.selRow).success(function (res) {
            if (res.code == 0) {
                if(bool){
                    $scope.selRow = {};
                    $scope.selRow.dic_parentid = $scope.parent_id;
                    $scope.selRow.parent_name = $scope.parent_name;
                    $scope.reload();
                }else{
                    $rootScope.formClose();
                    $scope.selRow = {};
                    layer.msg(res.message);
                    $scope.reload();
                }
            } else {
                layer.msg(res.message);
            }
        })
    }

    //重新查询
    $scope.reload = function (key, value) {
        $scope.tableControl.config.param["dic_code"] = "30000";
        $scope.tableControl.config.param["pageNum"] = 1;
        $scope.tableControl.reload($scope.tableControl.config.param);
    }
    //修改
    $scope.row_update = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                $scope.selRow = $scope.tableControl.data[index]
                ids.push($scope.tableControl.data[item.index].id)
            }
        });
        if (ids.length != 1) {
            layer.alert("请选择你将要修改的数据，同时只能修改一条数据");
            return false;
        }
        $scope.status = false;
        angular.forEach($scope.specialtyData, function (item, index) {
            if (item.id == $scope.selRow.dic_ownerid) {
                $scope.selRow.owner_name = item.dic_name;
            }
        });
        angular.forEach($scope.gradeData, function (item, index) {
            if (item.id == $scope.selRow.dic_gradeid) {
                $scope.selRow.grade_name = item.dic_name;
            }
        });
        $scope.get_list();


    }


    //删除
    $scope.delRow = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                ids.push($scope.tableControl.data[item.index].id);
            }
        });
        if (ids.length == 0) {
            layer.alert("请选择你将要删除的数据");
        }
        else {
            layer.confirm('删除后数据无法找回,确认删除吗？', {
                btn: ['确定', '取消'] //按钮
            }, function () {
                services._del_eMDictionary({ids: ids}).success(function (res) {
                    if (res.code == 0) {
                        layer.msg(res.message);
                        $scope.reload();
                    } else {
                        layer.msg(res.message)
                    }
                })
            })
        }
    }

    //开关判断
    $scope.check_index = 0;

    var selNode = null;
    var selNodeR = null;
    $("#comTree").tree({
        lines:true,
        //数据过滤
        "loadFilter": function (data, parent) {
            for (var i = 0; i < data.length; i++) {
                changeTreeStyle1(data[i]);
            }
            return data;
        },
        "onClick":function(node){
            if(node.my_index==0){
                $scope.check_index = node.my_index;
            }
            if(node.my_index==1){
                $scope.check_index = node.my_index;
                $scope.parent_id = node.id;
                $scope.parent_name = node.text;
                selNodeR = null;
            }
            if(node.my_index==2){
                $scope.check_index = node.my_index;
            }
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
        "onClick":function(node){
            $scope.selRow.dic_parentid = node.id;
            $scope.selRow.parent_name = node.text;
        },
        "onSelect": function (node) {
            selNodeR = node;
            $(".layui-form-selected").removeClass("layui-form-selected")
        },
        onLoadSuccess: function (node, data) {
            //选择课程后对题型的操作
            if (!selNodeR) {
                angular.forEach(data,function(item,index){
                    if(item.id==$scope.parent_id){
                        selNodeR =  $("#resTree").tree("find", item.id)
                    }
                })
                // selNodeR = $("#resTree").tree("getRoot");
            }
            else {
                //匹配节点是否存在
                var boolNode = $("#resTree").tree("find", selNodeR.id);
                selNodeR = boolNode ? boolNode : $("#resTree").tree("getRoot");
            }
            $("#resTree").tree("select", selNodeR.target);
        }
    });
    changeTreeStyle1 = function (treeNode) {
        if (treeNode['children'] && treeNode['children'].length > 0) {
            if(treeNode.id==0){
                treeNode['my_index'] = 0;
                for (var j = 0; j < treeNode['children'].length; j++) {
                    treeNode['children'][j]['my_index'] = 1;
                    changeTreeStyle1(treeNode['children'][j]);
                }
            }else{
                for (var j = 0; j < treeNode['children'].length; j++) {
                    //排序
                    treeNode['children'][j]['my_index'] = 2;
                    treeNode['children'].sort($rootScope._by("create_time"));
                    changeTreeStyle1(treeNode['children'][j]);
                }
            }
        }
        //设置属性
        treeNode["text"] = treeNode.dic_name;
        treeNode["id"] = treeNode.id;
    }

})
