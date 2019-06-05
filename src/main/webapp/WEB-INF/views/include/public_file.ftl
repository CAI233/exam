<script type="text/javascript">
    var ctxPath = '${ctxPath}';
</script>
<title>技能高考管理平台</title>
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
<meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no">
<link href="${ctxPath}/static/admin/img/favicon.ico" rel="shortcut icon" type="image/x-icon"/>
<link rel="stylesheet" href="${ctxPath}/static/web/font/iconfont.css"/>
<link rel="stylesheet" href="${ctxPath}/static/web/plugin/layui/css/layui.css"/>
<!--时间 -->
<link rel="stylesheet" href="${ctxPath}/static/admin/plugin/datetimepicker/jquery.datetimepicker.css"/>
<link rel="stylesheet" href="${ctxPath}/static/web/css/base.css"/>
<script type="text/javascript" src="${ctxPath}/static/web/plugin/jquery/jquery.min.js"></script>
<script type="text/javascript" src="${ctxPath}/static/web/plugin/jquery/jquery-ui.min.js"></script>
<script type="text/javascript" src="${ctxPath}/static/web/plugin/jquery/jquery.cookie.js"></script>
<script type="text/javascript" src="${ctxPath}/static/web/plugin/jquery/jquery.validate.min.js"></script>
<script type="text/javascript" src="${ctxPath}/static/web/plugin/jquery/jquery.form.js"></script>
<script type="text/javascript" src="${ctxPath}/static/web/plugin/jquery/xdate.js"></script>

<!--加载层-->
<link rel="stylesheet" href="${ctxPath}/static/web/plugin/layer/skin/default/layer.css"/>
<script type="text/javascript" src="${ctxPath}/static/web/plugin/layer/layer.js"></script>
<script type="text/javascript" src="${ctxPath}/static/web/plugin/layui/layui.js"></script>
<script type="text/javascript" src="${ctxPath}/static/web/plugin/layui/lay/modules/laypage.js"></script>
<script type="text/javascript" src="${ctxPath}/static/admin/plugin/datetime/moment.min.js"></script>

<script type="text/javascript" src="${ctxPath}/static/web/js/public.js"></script>
<!-- 日历 -->
<script type="text/javascript" src="${ctxPath}/static/admin/plugin/datetimepicker/jquery.datetimepicker.js"></script>

<!--chart-->
<script type="text/javascript" src="${ctxPath}/static/admin/plugin/chart/echarts.min.js"></script>
<script>
    var laypage, element,layer,laydate;
    layui.use(['laypage','layer','element','laydate'], function () {
        layer=layui.layer;
        element = layui.element;
        laypage = layui.laypage;
        laydate = layui.laydate
    })
</script>
