var token = $.cookie("USERINFO_TOKEN"),
    userInfo = $.cookie("USERINFO") && JSON.parse($.cookie("USERINFO")),
    // && JSON.parse($.cookie("USERINFO"))
    userPhone = $.cookie("USERINFO_PHONE"),
    userPwd = $.cookie("USERINFO_PWD"),
    usestatics = $.cookie("USERINFO_STATICS");
//     loginTime = $.cookie("LOGINTIME")||'';
//
// var date = new Date(loginTime+':000');
// var now_allTime = Date.parse(date);
var all_currms = null;
var paper_type = null;
+function (pub) {
    var set_time = null;
    if(token){
        $.ajax({
            type: 'post',
            url: ctxPath + '/site/papers/getSystemTime',
            data: {},
            success: function (res) {
                $('#pub_header_time').html(timestampToTime(res));
                set_time = setInterval(function(){
                    res = res+1000;
                    $('#pub_header_time').html(timestampToTime(res));
                },1000)
            }
        })
    }else{
        clearInterval(set_time);
    }


    /**
     * 注销
     */
    pub.outLogin = function (bool) {
        console.log(typeof(usestatics));
        var layerConfirm = layer.confirm('确认注销吗!', {btn: ['确定', '取消']}, function () {
            $.ajax({type: 'post', url: ctxPath + '/site/logout'});
            $.cookie('USERINFO', '');
            $.cookie("USERINFO_TOKEN", '');
            layer.close(layerConfirm);
            location.href = ctxPath + '/login'
        })
    }

    $.pubAjax = function (a) {
        var load;
        a.data= JSON.stringify(a.data);
        a["contentType"]='application/json; charset=utf-8',
        a['beforeSend'] = function (xhr) {
            if (a.button) {
                $(a.button).attr("disabled", true);
            }
            if (a.layer) {
                load = layer.load(1)
            }
            !$.cookie('USERINFO_TOKEN') || xhr.setRequestHeader("token", $.cookie('USERINFO_TOKEN') || '');
        };
        a['complete'] = function (xhr) {
            if (a.button) {
                $(a.button).attr("disabled", false);
            }
            if (a.layer) {
                layer.close(load);
            }
            xhr.responseText && JSON.parse(xhr.responseText).code == 600 && $.cookie('USERINFO_TOKEN', '') && (location.href = ctxPath + '/login');
        };
        $.ajax(a);
    };

    /**
     * menu选中
     */

}(window);

var _by = function (name) {
    return function (o, p) {
        var a, b;
        if (typeof o === "object" && typeof p === "object" && o && p) {
            a = o[name];
            b = p[name];
            if (a === b) {
                return 0;
            }
            if (typeof a === typeof b) {
                return a < b ? -1 : 1;
            }
            return typeof a < typeof b ? -1 : 1;
        }
        else {
            throw ("error");
        }
    }
}
//时间戳转换
function timestampToTime(timestamp) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    D = date.getDate() + ' ';
    h = date.getHours() < 10 ? '0'+date.getHours()+ ':' : date.getHours()+ ':';
    m = date.getMinutes() < 10 ? '0'+date.getMinutes()+ ':' : date.getMinutes()+ ':';
    s = date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds();
    return Y+M+D+h+m+s;
}


