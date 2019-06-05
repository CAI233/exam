$(document).ready(function () {
    $(this).keydown(function(e){
        var e = e || window.event;
        if(e.keyCode == 13){
        login();
        }
    })
    if($.cookie("USERINFO_STATICS")=="false"){
        $('#user-name').val($.cookie("USERINFO_NAME"));
        $('#user-pwd').val();
    }else{
        $('#user-name').val($.cookie("USERINFO_NAME"));
        $('#user-pwd').val($.cookie("USERINFO_PWD"));
        $(".user_check").prop("checked",true);
    }


})


var login = function (phone, member_pwd) {
    var user_phone = phone || $('#user-name').val();
    var user_pwd = member_pwd || $('#user-pwd').val();
    var user_statics = $(".user_check").prop("checked");
    if (!user_phone) {
        layer.alert('请输入登录账号');
        return !1;
    }
    if (!user_pwd) {
        layer.alert('请输入密码');
        return !1;
    }
    $.ajax({
        type: 'post',
        url: ctxPath + '/site/login',
        data: {user_name: user_phone, user_pwd: user_pwd,statics:user_statics},
        success: function (res) {
            if (res.code == 0) {
                console.log(res);
                $.cookie('USERINFO', JSON.stringify(res.data));
                $.cookie("USERINFO_TOKEN", res.data.token);
                $.cookie("USERINFO_NAME", user_phone);
                $.cookie("USERINFO_PWD", user_pwd);
                $.cookie("USERINFO_STATICS", user_statics);
                location.href = ctxPath + '/examArrange';

            } else {
                layer.alert(res.message);
            }
        }
    })
}
