var updateEnabled;
myApp.controller('cmsClassifyController', function ($rootScope, $scope, services, $sce, $stateParams) {
    $scope.services = services;
    //资讯分类树
    services["_cms_Classify_Tree"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/articleCat/getTree', param, "POST");
    }
    //资讯分类新增/修改
    services["_cms_add"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/articleCat/save_article_cat', param, "POST");
    }
    //资讯分类 启用
    services["_cms_updateEnabled"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/articleCat/json/updateEnabled', param, "POST");
    }
    //资讯分类删除
    services["_cms_del"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/articleCat/delete_article_cat', param, "POST");
    }
    $scope.tableControl = {
        config: {
            lines: true,
            check: true,
            param: {
                pages: 1, //总页数
                pageNum: 1, //当前页
                pageSize: 10, //每页条数
                total: 0, //总条数
                searchText: null
            },
            columns: [
                {field: 'article_cat_name', title: "名称", align: 'left'},
                {
                    field: 'enabled', title: "是否启用",
                    formatter: function (value, row, index) {
                        var bool = row.enabled == 1 ? 'layui-form-onswitch' : '';
                        return '<div class="layui-unselect layui-form-switch ' + bool + '" onclick="updateEnabled(' + row.article_cat_id + ', event)"><i></i></div>';
                    }
                },
                {field: 'create_time', title: "创建时间"}
            ]
        },
        reload: function (param) {
            if ($rootScope._USERINFO.org_id != 1) {
                $scope.tableControl.config.columns.splice(3, 1)
                $scope.tableControl.config.columns.splice(3, 1)
            }
            $scope.load()
        }
    };


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
            $scope.selRow.pid = node.id;
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
                changeTreeStyle1(treeNode['children'][j]);
            }
        }
        //设置属性
        treeNode["text"] = treeNode.article_cat_name;
        treeNode["id"] = treeNode.article_cat_id;
    }

    //加载
    $scope.load = function () {
        services._cms_Classify_Tree().success(function (res) {
            var arrdata = [];
            if (res.data) {
                arrdata = res.data;
            }
            var allData = [{
                article_cat_name: "所有资源",
                article_cat_id: 0,
                children: arrdata
            }]
            $("#comTree").tree("loadData", allData);
        })
    }
    //新增
    $scope.addRow = function () {
        $scope.selRow = {
            pid: selNode.id,
            parent_name: selNode.text
        }
        $scope.status = true
        $rootScope.formOpen();
        services._cms_Classify_Tree().success(function (res) {
            var arrdata = [];
            if (res.data) {
                arrdata = res.data;
            }
            var allData = [{
                article_cat_name: "所有资源",
                article_cat_id: 0,
                children: arrdata
            }]
            selNode = $("#comTree").tree("getSelected");
            $("#resTree").tree("loadData", allData);
        })
    }
    //修改
    $scope.row_update = function () {
        var ids = new Array();
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                ids.push($scope.tableControl.data[item.index].id)
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
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                $scope.selRow = $scope.tableControl.data[index]
            }
        })

        services._cms_Classify_Tree().success(function (res) {
            var arrdata = [];
            if (res.data) {
                arrdata = res.data;
            }
            var allData = [{
                article_cat_name: "所有资源",
                article_cat_id: 0,
                children: arrdata
            }]
            selNode = $("#comTree").tree("getSelected");
            $("#resTree").tree("loadData", allData);

            //隐藏当前节点
            var nowNN = $("#resTree").tree("find", $scope.selRow.article_cat_id);
            $("#resTree").tree("remove", nowNN.target);
        })

    }
    //提交
    $scope._form_submit = function (bool) {
        if (!$scope.selRow.article_cat_name) {
            layer.alert("请填写分类名称")
            return false;
        }
        if ($scope.selRow.pid == $scope.selRow.article_cat_id) {
            layer.alert('请选择正确的父级')
            return false;
        }
        if (!$scope.selRow.order_weight) {
            $scope.selRow.order_weight = (new Date()).getTime();
        }

        services._cms_add($scope.selRow).success(function (res) {
            if (res.code == 0) {
                if (bool) {
                    $rootScope.formClose();
                }
                else {
                    $scope.selRow = {
                        pid: $scope.selRow.pid,
                        parent_name: $scope.selRow.parent_name
                    };
                }
                $scope.load();
                layer.msg('信息保存成功');
            }
            else {
                layer.msg(res.message);
            }
        })
    }
    //是否启用
    updateEnabled = function (article_cat_id, event) {
        $rootScope.stopEvent(event);
        angular.forEach($scope.tableControl.data, function (item, index) {
            if (item.article_cat_id == article_cat_id) {
                $scope.selRow = item;
            }
        });
        if ($scope.selRow.enabled == 1) {
            $scope.selRow.enabled = 2;
        } else {
            $scope.selRow.enabled = 1;
        }
        services._cms_updateEnabled($scope.selRow).success(function (res) {
            if (res.code == 0) {
                layer.msg(res.message);
                selNode = $("#comTree").tree("getSelected");
                $scope.load();
            }
            else {
                layer.msg(res.message);
            }
        })
    }

    //删除
    $scope.delRow = function () {
        var article_cat_ids = new Array();
        var mark = null;
        angular.forEach($scope.tableControl.rows, function (item, index) {
            if (item.select) {
                article_cat_ids.push($scope.tableControl.data[item.index].article_cat_id)
            }
        });
        if (article_cat_ids.length == 0) {
            layer.alert("请选择你将要删除的数据");
        }
        else {
            layer.confirm('删除后数据无法找回,确认删除吗？', {
                btn: ['确定', '取消'] //按钮
            }, function () {
                services._cms_del({article_cat_ids: article_cat_ids, mark: mark}).success(function (res) {
                    if (res.code == 0) {
                        layer.msg("删除成功")
                        $scope.load();
                    }
                    else if (res.code == 1) {
                        layer.confirm(res.message, {
                            btn: ['确定', '取消']
                        }, function () {
                            mark = 'del'
                            services._cms_del({article_cat_ids: article_cat_ids, mark: mark}).success(function (res) {
                                if (res.code == 0) {
                                    layer.msg("删除成功")
                                    $scope.load();
                                }
                            })
                        })
                    } else {
                        layer.msg(res.message)
                    }
                })
            })
        }
    }
});