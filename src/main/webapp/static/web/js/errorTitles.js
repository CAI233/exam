/**
 * Created by Administrator on 2018/1/30 0030.
 */
var param = {
    pageNum: 1,
    pageSize: 10,
    pages: 1,
    total: 0,
    subject_curriculum:10039,//默认语文课程

    subject_type:0,
    subject_level:0
}
var now_stu = JSON.parse($.cookie('USERINFO'));
var levelData = [
    {"id": 10079, "text": "基础题"},
    {"id": 10080, "text": "中等题"},
    {"id": 10081, "text": "较难题"}];

$(document).ready(function () {
    $(".menu>li").eq(2).find("a").addClass("active").siblings().removeClass("active");
    setTimeout(function(){
        load();

    },500);
    get_loadCurrm();

    //难易度
    var now_levelList = $('<a data-name="question_channel_type" class="active">全部</a>').click(function(){
        $(this).addClass("active").siblings().removeClass("active")
        param.subject_level = 0;
        load();
    }).appendTo("#subLevel")
    $.each(levelData,function(index,item){
        now_levelList =$('<a data-name="question_channel_type">'+item.text+'</a>').click(function(){
            $(this).addClass("active").siblings().removeClass("active")
            param.subject_level = item.id;
            load();
        });
        $("#subLevel").append(now_levelList);
    })
})

var load = function () {
    var loading = layer.load(1);
    $.pubAjax({
        type: 'post',
        url: ctxPath + '/admin/subject/mistakesCollection',
        layui: true,
        data: {pageNum:param.pageNum,
            pageSize:param.pageSize,
            student_id:now_stu.user_name,
            subject_curriculum:param.subject_curriculum,
            subject_type:param.subject_type,
            subject_level:param.subject_level},
        success: (function (res) {
            if (res.code == 0) {
                layer.close(loading);
                param.pageNum = res.data.pageNum;
                param.pageSize = res.data.pageSize;
                param.total = res.data.total;
                param.pages = res.data.pages;
                $("#pager_pages").html(param.pages)
                $("#pager_total").html(param.total)
                console.log(res)
                $('#textList').empty();

                if(res.data.rows.length>0){
                    $("#not_show").css({"display":"none"})
                    $.each(res.data.rows, function(index, item){
                        var nowList = '';
                        var littleList = '';
                        var analisis = '';
                        var showList = '';

                        if(item.subjectSanpshotList !=null && item.subjectSanpshotList!=''){
                            var num = 0;
                            showList = '<a class="addbtn" onclick="select('+index+')"><i class="iconfont icon-12"></i>查看小题</a>';
                            $.each(item.subjectSanpshotList,function(indexs,items){
                                num++ ;
                                if(items.subject_analysis==null || items.subject_analysis==''){
                                    items.subject_analysis = '<p>暂无</p>'
                                }
                                littleList +='<li style="border:1px dashed #ccc;text-align:justify;list-style:inherit;padding:0 5px;">'+
                                    '<div class="exam-tg" >'+
                                    '<div style="text-align:justify" >'+re_laceTG(num,items.subject_question)+'</div>'+
                                    '</div>'+
                                    '<div class="exam-q" style="padding:5px 0;">'+
                                    '<div style="text-align:justify" >【我的答案】'+re_lace(items.c_student_answer)+'</div>'+
                                    '</div>'+
                                    '<div class="exam-q" style="padding:5px 0;">'+
                                    '<div style="text-align:justify" >【正确答案】'+re_lace(items.subject_answer)+'</div>'+
                                    '</div>'+
                                    '<div class="exam-jx" style="padding:5px 0;border-top:1px dashed #ccc;">'+
                                    '<div style="text-align:justify" >'+re_laceJX(items.subject_analysis)+'</div>'+
                                    '</div>'+
                                    '</li>';

                                nowList = '<ul class="exam-t" style="margin:0;">'+littleList+'</ul>'
                            })

                        }else{
                            if(item.subject_analysis==null || item.subject_analysis==''){
                                item.subject_analysis = '<p>暂无</p>'
                            }
                            analisis =  '<div class="esam_m_t"  style="text-align:justify;padding:5px 0;">【我的答案】'+re_lace(item.c_student_answer)+'</div>'+
                                '<div class="esam_m_t"  style="text-align:justify;padding:5px 0;">【正确答案】'+re_lace(item.subject_answer)+'</div>'+
                                '<div class="esam_m_jx"  style="text-align:justify;;margin-left:-20px;margin-right:-20px;padding:15px 20px 0;border-top:1px dashed #ccc;">'+re_laceJX(item.subject_analysis)+'</div>';
                        }
                        var list = '<li style="border:1px solid #dcdcdc;margin-bottom:10px;position:relative;">' +
                            '<div class="search-exam">'+
                            '<div class="exam-head">'+
                            '<p class="exam-head-left">'+
                            '<span>题型：<i >'+item.typeName+'</i></span>'+
                            '<span>难易度：<i >'+item.levelName+'</i></span>'+
                            '<span>分数：<i >'+item.detail_marks+'</i></span>'+
                            // '<span>我的答案：<i >'+item.c_student_answer+'</i></span>'+
                            // '<span>正确答案：<i >'+item.subject_answer+'</i></span>'+
                            '<span class="exam-foot-right" style="float: right;margin: 0 5px">'+
                            showList+'<a class="addbtn" >试题来源：<i>'+item.paper_title+'</i></a>'+
                            '</span>'+
                            '</p>'+
                            '</div>'+
                            '<div class="exam-con">'+
                            '<div class="exam-q">'+
                            '<div class="esam_m_t"  style="text-align:justify;margin-bottom:15px;">'+item.subject_question+'</div>'+
                            nowList+'</div>'+
                            analisis+'</div>'+
                            '</li>'

                        $('#textList').append(list)
                    });
                    $("#data_pager").empty().next().css({"display":"block"});
                    if (param.pages > 1) {
                        laypage.render({
                            elem: "data_pager",
                            count: param.total,
                            layout: ['prev', 'page', 'next', 'skip'],
                            curr: param.pageNum,
                            limit: param.pageSize,
                            skip: true,
                            jump: function (resPager) {
                                if (resPager.curr != param.pageNum) {
                                    param.pageNum = parseInt(resPager.curr);
                                    load();
                                }
                            }
                        });
                    }
                }else{
                    $("#not_show").css({"display":"block"})
                    $("#data_pager").empty().next().css({"display":"none"});
                }

            } else {
                alert(res.message);
            }
        })
    })
}

var re_lace = function(html){
    return html ? html.replace(/<p.*?>(.*?)<\/p>/g,function(match,p1){return p1}):html
}
//解析
var re_laceJX = function(html){
    return html ? html.replace(">",">【解析】"):html
}
// 小题题干
var re_laceTG = function(num,html){
    return html ? html.replace(">",">"+num+"."):html
}

function select(num){
    $("#textList>li").eq(num).find(".exam-t").slideToggle(500);
}


//课程接口
var get_loadCurrm = function(){
    // /admin/eMDictionary/getDicTree
    $.pubAjax({
        type: 'post',
        url: ctxPath + '/admin/eMDictionary/getDicTree',
        data: {dic_parentcode: '30000'},
        success: (function (res) {
            console.log(res);
            if (res.code == 0) {
                var currm = res.data;
                console.log(currm)
                var now_currm = '';
                // $('<a data-name="question_channel_type" class="active">全部</a>').click(function(){
                //     $(this).addClass("active").siblings().removeClass("active")
                //     param.subject_curriculum = 0;
                //     selectCurrm(null,0)
                // }).appendTo("#currms");
                $.each(currm,function(index,item){
                    now_currm =$('<a data-name="question_channel_type">'+item.dic_name+'</a>').click(function(){
                        $(this).addClass("active").siblings().removeClass("active")
                        param.subject_curriculum = item.id;
                        param.subject_type = 0;
                        load();
                        selectCurrm(item)
                    })
                    $("#currms").append(now_currm);

                    //初始状态
                    selectCurrm(currm[0]);
                    $("#currms a:nth-child(1)").addClass("active").siblings().removeClass("active")
                })
            } else {
                alert(res.message);
            }
        })
    })
}
var selectCurrm = function(data){
    var now_subType = '';
    if(data){
        $("#subType").empty();
        $('<a data-name="question_channel_type" class="active">全部</a>').click(function(){
            $(this).addClass("active").siblings().removeClass("active")
            param.subject_type = 0;
            load()
        }).appendTo("#subType");
        $.each(data.children,function(index,item){
            now_subType =$('<a data-name="question_channel_type">'+item.dic_name+'</a>').click(function(){
                $(this).addClass("active").siblings().removeClass("active")
                param.subject_type = item.id;
                load();
            })
            $("#subType").append(now_subType);
        })
    }
};




