myApp.controller('myClassesController', function ($rootScope, $scope, services, $sce,$state, $stateParams) {
    $scope.services = services;
    //学生列表
    // services["_get_students"] = function (param) {
    //     return $rootScope.serverAction(ctxPath + '/admin/classes/classList', param, "POST");
    // };
    services["_get_students"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/classesStudent', param, "POST");
    };
    //默认参数
    $scope.param = {
        pages: 1,
        pageSize: 10,
        pageNum: 1,
        total:0
        // token:$rootScope.token
    };

    services._get_students($scope.param).success(function (res) {
        if(res.code==0){
            if(res.data==null || res.data.length==0 || res.data==''){
                // layer.msg("当前角色没有班级")
                return false;
            }else{
                console.log(res);
                $scope.result = res.data;
                // console.log($scope.result);
                //默认第一个班级
                $scope.get_stu($scope.result[0]);
            }
        }
    })

    //选择班级 查看学生
    $scope.all_students = null;
    $scope.get_stu = function(data){
        $scope.now_class_id = data.id;
        // console.log(data);
        //显示当前选择的班级
        $scope.now_class = data.class_name;
        //当前班级下的学生人数;
        $scope.now_classNums = data.personList.length;
        //当前班级下的所有学生
        $scope.all_students = data.personList;
        console.log($scope.all_students);
        $scope.get_load($scope.all_students,$scope.now_classNums);
    }

    $scope.load_param = {
        pages:1,
        total:0
    }
    //调用分页
    $scope.get_load = function(all,cunt){
        laypage.render({
            elem: 'pager'
            ,count: cunt
            ,curr:$scope.load_param.pages
            ,jump: function(obj){
                //模拟渲染
                document.getElementById('show_class').innerHTML = function(){
                    var arr = []
                        ,thisData = all.concat().splice(obj.curr*obj.limit - obj.limit, obj.limit);
                    if (obj.curr != $scope.load_param.pages) {
                        setTimeout(function(){
                            $scope.$apply(function(){
                                $scope.load_param.pages = parseInt(obj.curr);
                            })
                        },1)
                    }
                    $scope.load_param.total = obj.count;
                    // console.log(obj.limit);//默认每页10个
                    // console.log(obj.curr);//默认翻页数
                    // console.log(obj.count);//总数
                    layui.each(thisData, function(index, item){
                        arr.push('<tr><td >' + item.person_studentid + '</td>' +
                            '<td>' + item.person_name + '</td>' +
                            '<td>' +["男","女"][item.person_sex-1] + '</td>' +
                            '<td>' +["已停用","已启用"][item.status-1] + '</td>' +
                            // '<td><a href="javascript:;" style="text-decoration:underline;color:#e63a3a;" onclick="recent(\''+item.person_studentid+'\')">查看</a></td>' +
                            '</tr>')
                    });
                    return arr.join('');
                }();
            }
        });
    };

    $scope.param = {};
    //搜索
    $scope.load = function(){
        var search_all = [];
        angular.forEach($scope.all_students,function(item,index){
            if(item.person_name.indexOf($scope.param.searchText)!=-1 || item.person_studentid.indexOf($scope.param.searchText)!=-1){
                search_all.push(item);
            }
        })
        console.log($scope.all_students);
        $scope.get_load(search_all,search_all.length);
    };


    recent = function(id){
        //学号
        $state.go("recentTest",{id:id});
    }
});

