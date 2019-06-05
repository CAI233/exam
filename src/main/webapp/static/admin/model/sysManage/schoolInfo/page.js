myApp.controller('schoolInfoController', function ($rootScope, $scope, services, $sce, $stateParams) {
        $scope.services = services;
        //学校信息
        services["_data_schoolInfo"] = function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/schoolInfo/getSchoolInfo', param, "POST");
        };
        ///修改
        services["_schoolInfo_save"] = function (param) {
            return $rootScope.serverAction(ctxPath + '/admin/schoolInfo/update', param, "POST");
        };
        $scope.selRow = {};
        $scope.load = function () {
            services._data_schoolInfo().success(function (res) {
                $scope.selRow = res.data
            })
        }
        $scope.load();
    
        //提交
        $scope._form_submit = function () {
            services._schoolInfo_save($scope.selRow).success(function (res) {
                if (res.code == 0) {
                    layer.msg(res.message);
                    $scope.load();
                }
                else {
                    layer.msg(res.message);
                }
            })
        }
    $scope.show_phone = function(i){
        $scope.selRow.phone = i.replace(/\D/g,'');
    }
    }
);
