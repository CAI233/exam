/**
 * Created by Administrator on 2018/1/31 0031.
 */

var now_email = null;
var now_phone = null;
$(document).ready(function () {
    $(".menu>li").eq(3).find("a").addClass("active").siblings().removeClass("active");
    var now_stu = JSON.parse($.cookie('USERINFO'))
    console.log(now_stu)
    $("#person").html('<dd><p>考生姓名：</p><span>'+now_stu.user_real_name+'</span></dd>'+
        '<dd><p>性&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别：</p><span>'+now_stu.sex+'</span></dd>'+
        '<dd><p>学&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;号：</p><span>'+now_stu.user_name+'</span></dd>'+
        // '<dd><p>邮&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;箱：</p><span>'+now_stu.email+'</span></dd>'+
        '<dd><p>邮&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;箱：</p><input id="stu_email" value="'+now_stu.email+'"/><button class="layui-btn layui-btn-normal" onclick="save_email();">保存</button></dd>'+
        '<dd><p>手机号码：</p><input id="stu_phone" value="'+now_stu.phone+'"/><button class="layui-btn layui-btn-normal" onclick="save_phone();">保存</button></dd>')

    $("#stu_email").bind('input propertychange',function(){

    })
    $("#stu_phone").bind('input propertychange',function(){

    })
    save_email = function(){
        now_email = $("#stu_email").val();
        now_phone = $("#stu_phone").val();
        var filter_person_email = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
        if (now_email == "" || now_email == null) {
            layer.alert("请填写邮箱")
            return false;
        } else {
            if (!filter_person_email.test(now_email)) {
                layer.alert("请填写正确的邮箱")
                return false;
            }
        }
        load_post();
    }
    save_phone = function() {
        now_email = $("#stu_email").val();
        now_phone = $("#stu_phone").val();
        var filter_phone = /^1[3|4|5|7|8][0-9]{9}$/
        if (now_phone == '' || now_phone == null) {
            layer.alert("请填写手机号");
            return false;
        } else {
            if (!filter_phone.test(now_phone)) {
                layer.alert("请填写正确手机号")
                return false;
            }
        }
        load_post();
    }

    function load_post(){
        $.pubAjax({
            type: 'post',
            url: ctxPath + '/admin/user/update',
            layui: true,
            data: {
                user_id:now_stu.user_id,
                org_id:now_stu.org_id,
                email:now_email,
                phone:now_phone
            },
            success: (function (res) {
                console.log(res);
                now_stu.email = now_email;
                now_stu.phone = now_phone;
                $.cookie('USERINFO',JSON.stringify(now_stu));
                layer.msg(res.message)
            })
        })
    }

})