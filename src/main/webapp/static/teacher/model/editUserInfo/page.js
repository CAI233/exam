myApp.controller('editUserInfoController', function ($rootScope, $scope, services, $sce, $stateParams) {
    form.render();
    //教师列表
    // services["_data_teachinfo"] = function (param) {
    //     return $rootScope.serverAction(ctxPath + '/admin/person/listAll', param, "POST");
    // };

    //教师信息编辑
    services["_compile_teacher"] = function (param) {
        return $rootScope.serverAction(ctxPath + '/admin/person/updateTeacher', param, "POST");
    };
    $scope.load = function(){
        $scope.now_user = JSON.parse(window.sessionStorage.getItem("_USERINFO"));
        console.log($scope.now_user);
        setTimeout(function(){
            This_form.render();
        },50);
    };
    $scope.load();

    $scope.now_sex = function(num,event){
        var event = event || window.event;
        $rootScope.stopEvent(event);

        $(".layui-form-checkbox").eq(num).addClass("layui-form-checked").siblings().removeClass("layui-form-checked");
        if(num==0){
            $scope.now_user.sex = '男';
        }else{
            $scope.now_user.sex = '女';
        }
        console.log($scope.now_user.sex)
    };


    //编辑完成 保存
    $scope._compile = function(){
        This_form.on('submit(formDemo)', function (data) {
        console.log($scope.now_user);
        window.sessionStorage.setItem("_USERINFO", JSON.stringify($scope.now_user));
        $rootScope._USERINFO.user_real_name = $scope.now_user.user_real_name;
        services._compile_teacher($scope.now_user).success(function (res) {
            if(res.code==0){
                layer.msg(res.message);
                $scope.load();
            }else{
                layer.msg(res.message);
            }
        })
        });
    }



});

