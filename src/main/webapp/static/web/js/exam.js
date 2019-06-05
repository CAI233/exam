/**
 * Created by Administrator on 2018/1/31 0031.
 */
var now_data = null;
var all_num = 0; //总数
var now_index = 0;//下标
var now_type_num = 0;//当前题型序号
var now_type_list = 0;//当前题型数量
var now_type_socre = 0;//当前题型分数
var now_list_answer = null;
var all_currms = JSON.parse(localStorage.getItem("all_currms"));
$(document).ready(function () {

    //当前考生信息
    var now_stu = JSON.parse($.cookie('USERINFO'));
    $(".stu_message").html('<dd><p>考生姓名：</p><span>' + now_stu.user_real_name + '</span></dd>' +
        '<dd><p>性&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别：</p><span>' + now_stu.sex + '</span></dd>' +
        '<dd><p>学&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;号：</p><span>' + now_stu.user_name + '</span></dd>' +
        '<dd><p>邮&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;箱：</p><span>' + now_stu.email + '</span></dd>' +
        '<dd><p>手机号码：</p><span>' + now_stu.phone + '</span></dd>')
    //初始化将测试集包含的用例存在数组里面
    // setTimeout(load, 500);

    now_data = data; //数据对象
    console.log(now_data)
    //考试基本信息
    $(".cont-left-top").html('<h3>'+papers.paper_title+'</h3>'+
        '<h4><span>开始时间：'+data.paper_start+'</span>----<span>结束时间：'+data.paper_end+'</span></h4>')


    //初始化列表
    create_num_list();
    for(var i=1; i<= all_num; i++){
        var exam = getExamByIndex(i);
        if(exam.c_student_answer && exam.c_student_answer != ''){
            now_index = i;
            openExxam(exam);
        }
        else{
            now_index = i;
            openExxam(exam);
            break;
        }
    }
    var slow_time = Date.parse(new Date(now_data.paper_end.replace(/\-/g,'/')))-Date.parse(new Date(now_data.currentTime.replace(/\-/g,'/')));
    var oldTime = (new Date(slow_time)).getTime()/1000;
    var d = Math.floor(oldTime/60/60) <10 ? '0'+(Math.floor(oldTime/60/60)) : Math.floor(oldTime/60/60);

    var m = (Math.floor(oldTime/60)-d*60) <10 ? '0'+(Math.floor(oldTime/60)-d*60):Math.floor(oldTime/60)-d*60;


    var s = (oldTime-m*60-d*3600) <10 ? '0'+(oldTime-m*60-d*3600): oldTime-m*60-d*3600 ;


    $(".low_time").html(d+':'+m+':'+s)


    setInterval(function(){
        oldTime--;
        if(oldTime<=0){
            $.pubAjax({
                type: 'post',
                url: ctxPath + '/admin/papers/studentAssignment',
                layui: true,
                data: {paper_id: now_paper_id},
                success: (function (res) {
                    if (res.code == 0) {
                        localStorage.setItem("paperpass",JSON.stringify(data.paper_pass));
                        window.open("/examEnd?paperId=" + now_paper_id, "_self")
                    }
                })
            })
        }
        d = Math.floor(oldTime/60/60) <10 ? '0'+(Math.floor(oldTime/60/60)) : Math.floor(oldTime/60/60);

        m = (Math.floor(oldTime/60)-d*60) <10 ? '0'+(Math.floor(oldTime/60)-d*60):Math.floor(oldTime/60)-d*60;

        s = (oldTime-m*60-d*3600) <10 ? '0'+(oldTime-m*60-d*3600): oldTime-m*60-d*3600;


        $(".low_time").html(d+':'+m+':'+s)


      },1000)

})
var now_url = window.location.href;
var now_paper_id = now_url.substring(now_url.indexOf("=") + 1, now_url.length);

//初始化列表
function create_num_list() {
    all_num = 0;
    //第一层  试卷的类别 单科或综合
    $.each(now_data.subjectSanpshotList, function (index, item) {
        var kc = $('<div class="keche"><h3>'+_get_curriculum_name(item.subjectSanpshotList[0].subjectSanpshotList[0].subject_curriculum)+'部分<b>('+item.detail_marks+'分)</b></h3></div>').appendTo('.exams_list')
        //第二层 当前试卷 每一种题型
        $.each(item.subjectSanpshotList, function (ind, ite) {
            // if(item.paper_mode==0){
            //
            // }
            // var tx = $('<div class="tixing"><h4><b>'+nums[ite.detail_order]+'、</b>'+_get_exam_name_byid(ite.subjectSanpshotList[0].subject_curriculum,ite.subjectSanpshotList[0].subject_type)+'（本大题共'+ite.detail_number+'小题，共'+ite.detail_marks+'分）</h4></div>').appendTo(kc)
            var tx = $('<div class="tixing"><h4><b>'+nums[ind]+'、</b>'+_get_exam_name_byid(ite.subjectSanpshotList[0].subject_curriculum,ite.subjectSanpshotList[0].subject_type)+'（本大题共'+ite.detail_number+'小题，共'+ite.detail_marks+'分）</h4></div>').appendTo(kc)
            //第三层  每种题型下的试题数
            $.each(ite.subjectSanpshotList, function (ins, its) {
                if (its.subjectSanpshotList && its.subjectSanpshotList.length > 0) {
                    //第四层 每个大题下的小题
                    $.each(its.subjectSanpshotList, function (inc, itd) {

                        var xst = $('<span style="border:1px #ddd solid" class="lis_span">' + itd.detail_order + '</span>').click(
                            function(){
                                // $(".tixing").find("span").removeClass("span_active2");
                                // $(this).addClass("span_active2");
                                now_index = itd.detail_order;
                                openExxam(getExamByIndex(itd.detail_order))
                            }
                        ).appendTo(tx)
                        all_num += 1;
                        if(itd.c_student_answer && itd.c_student_answer!=''){
                            $(".lis_span").eq(itd.detail_order-1).addClass("span_active");
                        }else{
                            $(".lis_span").eq(itd.detail_order-1).removeClass("span_active");
                        }
                    })
                }
                else {

                    var st = $('<span class="lis_span">' + its.detail_order + '</span>').click(
                        function(){
                            // $(".tixing").find("span").removeClass("span_active");
                            // $(this).addClass("span_active")
                            now_index = its.detail_order;
                            openExxam(getExamByIndex(its.detail_order))
                        }
                    ).appendTo(tx);
                    all_num += 1;
                    if(its.c_student_answer && its.c_student_answer!=''){

                        $(".lis_span").eq(its.detail_order-1).addClass("span_active");
                    }else{
                        $(".lis_span").eq(its.detail_order-1).removeClass("span_active");
                    }
                }
            })
        })
    })
}
//根据索引获取题
function getExamByIndex(i) {
    if(i==1){
        $("#prev").css({"visibility":"hidden"})
        $("#next").css({"visibility":"visible"})
    }else if(i>1 && i<all_num){
        $("#prev").css({"visibility":"visible"})
        $("#next").css({"visibility":"visible"})
    }else{
        $("#prev").css({"visibility":"visible"})
        $("#next").css({"visibility":"hidden"})
    }

    var exam = null;
    //第一层  试卷的类别 单科或综合
    $.each(now_data.subjectSanpshotList, function (index, item) {
        //第二层 当前试卷 每一种题型
        $.each(item.subjectSanpshotList, function (ind, ite) {
            //第三层  每种题型下的试题数
            $.each(ite.subjectSanpshotList, function (ins, its) {
                if (its.subjectSanpshotList && its.subjectSanpshotList.length > 0) {
                    //第四层 每个大题下的小题
                    $.each(its.subjectSanpshotList, function (inc, itd) {
                        if (itd.detail_order == i) {
                            exam = itd;
                            exam.parentQuetion = its.subject_question;
                            exam.parentCurrum = its.subject_curriculum;
                            exam.parentType = its.subject_type;
                        }
                    })
                }
                else if (its.detail_order == i) {
                    exam = its;
                }
            })
        })
    })
    return exam;
}


function prev() {
    if(now_index > 1){
        //传递当前试题答案
        post_answer(getExamByIndex(now_index).id,getExamByIndex(now_index).c_student_answer)
        var exam = getExamByIndex(--now_index);

        openExxam(exam);
    }
}
function next() {
    if(now_index < all_num){
        //传递当前试题答案
        post_answer(getExamByIndex(now_index).id,getExamByIndex(now_index).c_student_answer)
        var exam = getExamByIndex(++now_index);
        openExxam(exam);
    }
}
function  openExxam(exam) {
    title_Num(exam);
    $("#cont_cont").html('');
    $(".answe_list>input").val('');
    $(".answe_list>ul").html('');
    $(".tixing").find("span").removeClass("span_active2");
    $(".lis_span").eq(exam.detail_order-1).addClass("span_active2");

    if(exam.option_type==4){
        $('<div class="xt-tg xstst ng-binding"  style="margin-bottom: 10px;line-height: 1.68em">'+replac_all(exam.parentQuetion)+'</div>').appendTo($("#cont_cont"))
        $(".head_left").html('<h3><b>'+now_type_num+'、</b>'+_get_exam_name_byid(exam.parentCurrum,exam.parentType)+'（本大题共'+now_type_list+'小题，共'+now_type_socre+'分）</h3>')
        if(_get_exam_name_byid(exam.subject_curriculum,exam.subject_type)=='单选题'){
            answer_List(exam)
        }else if(_get_exam_name_byid(exam.subject_curriculum,exam.subject_type)=='多选题'){
            answer_ListM(exam)
        }else if(_get_exam_name_byid(exam.subject_curriculum,exam.subject_type)=='判断题'){
            answer_ListF(exam)
        }else{
            answer_moreList(exam);
        }
    }else{
        if(_get_exam_name_byid(exam.subject_curriculum,exam.subject_type)=='单选题'){
            $(".head_left").html('<h3><b>'+now_type_num+'、</b>'+_get_exam_name_byid(exam.subject_curriculum,exam.subject_type)+'（本大题共'+now_type_list+'小题，共'+now_type_socre+'分）</h3>'+
                '<p>在每小题给出的四个备选项中，只有一项是符合题目要求的，请将其选出。未选、错选或多选均不得分。</p>')

            answer_List(exam)
        }else if(_get_exam_name_byid(exam.subject_curriculum,exam.subject_type)=='多选题'){
            $(".head_left").html('<h3><b>'+now_type_num+'、</b>'+_get_exam_name_byid(exam.subject_curriculum,exam.subject_type)+'（本大题共'+now_type_list+'小题，共'+now_type_socre+'分）</h3>'+
                '<p>在每小题给出的四个备选项中，至少有两个选项是符合题目要求的，请将其选出。未选、错选均不得分。</p>')
            answer_ListM(exam)
        }else if(_get_exam_name_byid(exam.subject_curriculum,exam.subject_type)=='判断题'){
            $(".head_left").html('<h3><b>'+now_type_num+'、</b>'+_get_exam_name_byid(exam.subject_curriculum,exam.subject_type)+'（本大题共'+now_type_list+'小题，共'+now_type_socre+'分）</h3>'+
                '<p>下列说法对的打√,错的打×。</p>')
            answer_ListF(exam)
        } else{
            $(".head_left").html('<h3><b>'+now_type_num+'、</b>'+_get_exam_name_byid(exam.subject_curriculum,exam.subject_type)+'（本大题共'+now_type_list+'小题，共'+now_type_socre+'分）</h3>')
            answer_moreList(exam);
        }

    }

    $('<div class="xt-tg" style="position: relative;padding-left: 2em;">'+
        '<em style="position: absolute;line-height: 1.68em;left: 0;font-style: normal;" class="ng-binding">'+exam.detail_order+'.</em>'+
        '<span style="line-height: 1.68em" class="ng-binding ng-scope">'+exam.subject_question.replace(/\\/g, "")+'</span>'+
        '</div>').appendTo($("#cont_cont"))



}
//根据课程id获取课程名称
var _get_curriculum_name = function (id) {
    var name = null;
    if (id && id.toString().indexOf(',') != -1) {
        name = "综合";
    }
    else {
        $.each(all_currms, function (index,item) {
            if (item.id == id)
                name = item.dic_name;
        })
    }
    return name;
}

//根据课程ID 题型ID 获取题型名称
var _get_exam_name_byid = function (kcid, txid) {
    var name = '--';
    $.each(all_currms, function (index,item) {
        if (item.id == kcid) {
            $.each(item.children, function (ind,st) {
                if (st.id == txid)
                    name = st.dic_name;
            })
        }
    })
    return name;
};
//
var nums = ["一","二","三","四","五","六","七","八","九","十","十一"];
function title_Num(exam){
    console.log(exam);
    $.each(now_data.subjectSanpshotList, function (index, item) {
        //第二层 当前试卷 每一种题型
        $.each(item.subjectSanpshotList, function (ind, ite) {
            //第三层  每种题型下的试题数
            console.log(ite)

            // if(exam.paper_detail_pid==ite.paper_detail_id){
            //     now_type_num = nums[ind];
            //     now_type_list = ite.detail_number;
            //     now_type_socre = ite.detail_marks;
            // }
            if(exam.option_type==4){
                $.each(ite.subjectSanpshotList,function(ins,itd){
                    if(exam.paper_detail_pid==itd.paper_detail_id){
                        // now_type_num = nums[ite.detail_order];
                        now_type_num = nums[ind];
                        now_type_list = ite.detail_number;
                        now_type_socre = ite.detail_marks;
                    }
                })
            }else{
                if(exam.paper_detail_pid==ite.paper_detail_id){
                    // now_type_num = nums[ite.detail_order];
                    now_type_num = nums[ind];
                    now_type_list = ite.detail_number;
                    now_type_socre = ite.detail_marks;
                }
            }
        })
    })
}

//正则匹配
var replac_all = function(html){
    return html ? html.replace(/text-align:start;/g, "text-align:justify;text-indent:2em;").replace(/text-align: justify/g, "text-align:justify;text-indent:2em;").replace(/\\/g, "") : html;
};

function answer_List(exam){
    $(".answe_list>p").html('单选题,请选择你认为正确的答案！');
    $(".answe_list>ul").css("display","block");
    $(".answe_list>input").css("display","none");
    var answer = ["A","B","C","D"];
    $.each(answer,function(index,item){
        $('<li class="anserList"><i class="iconfont"></i>'+item+'</li>').click(function(){
            if($(this).find("i").hasClass("icon-danxuan")){
                $(this).find("i").removeClass("icon-danxuan").addClass("icon-danxuan2");
                exam.c_student_answer = '';
                $(".lis_span").eq(exam.detail_order-1).removeClass("span_active");
            }else{
                $(this).find("i").removeClass("icon-danxuan2").addClass("icon-danxuan");
                $(this).siblings().find("i").removeClass("icon-danxuan").addClass("icon-danxuan2");
                exam.c_student_answer = item;
                $(".lis_span").eq(exam.detail_order-1).addClass("span_active");
            }
            post_answer(exam.id,exam.c_student_answer)
        }).appendTo(".answe_list>ul");
        if(exam.c_student_answer == item || exam.c_student_answer == item.toLowerCase()){
            $(".anserList").eq(index).find("i").addClass("icon-danxuan");

        }else{
            $(".anserList").eq(index).find("i").addClass("icon-danxuan2");
        }
    })
}

function answer_ListM(exam){
    $(".answe_list>p").html('多选题,请选择你认为正确的答案！');
    $(".answe_list>ul").css("display","block");
    $(".answe_list>input").css("display","none");
    var answer = ["A","B","C","D"];
    exam.c_student_answer = exam.c_student_answer != null ? exam.c_student_answer : '' ;
    $.each(answer,function(index,item){
        $('<li class="anserList"><i class="iconfont"></i>'+item+'</li>').click(function(){
            if($(this).find("i").hasClass("icon-danxuan")){
                $(this).find("i").removeClass("icon-danxuan").addClass("icon-danxuan2");
                exam.c_student_answer = exam.c_student_answer.replace(item,"");
            }else{
                $(this).find("i").removeClass("icon-danxuan2").addClass("icon-danxuan");
                exam.c_student_answer += item;
            }
            post_answer(exam.id,exam.c_student_answer);
            if(exam.c_student_answer && exam.c_student_answer!=''){
                $(".lis_span").eq(exam.detail_order-1).addClass("span_active");
            }else{
                $(".lis_span").eq(exam.detail_order-1).removeClass("span_active");
            }
        }).appendTo(".answe_list>ul");
        if(exam.c_student_answer.indexOf(item)!=-1 || exam.c_student_answer.indexOf(item.toLowerCase())!=-1){
            $(".anserList").eq(index).find("i").addClass("icon-danxuan");
        }else{
            $(".anserList").eq(index).find("i").addClass("icon-danxuan2");
        }
    })

}
function answer_ListF(exam) {
    $(".answe_list>p").html('判断题,请选择你认为正确的答案！');
    $(".answe_list>ul").css("display", "block");
    $(".answe_list>input").css("display", "none");
    $('<li class="anserList"><i class="iconfont"></i>正确</li>').click(function(){
        if($(this).find("i").hasClass("icon-duihaocheckmark17")){
            $(this).find("i").removeClass("icon-duihaocheckmark17").addClass("icon-duihao2");
            $(this).siblings().find("i").removeClass("icon-error").addClass("icon-cuowu");
            exam.c_student_answer = '正确';
            $(".lis_span").eq(exam.detail_order-1).addClass("span_active");
        }else{
            $(this).find("i").removeClass("icon-duihao2").addClass("icon-duihaocheckmark17");
            exam.c_student_answer = '';
            $(".lis_span").eq(exam.detail_order-1).removeClass("span_active");
        }
        post_answer(exam.id,exam.c_student_answer)
    }).appendTo(".answe_list>ul");
    $('<li class="anserList"><i class="iconfont"></i>错误</li>').click(function(){
        if($(this).find("i").hasClass("icon-cuowu")){
            $(this).find("i").removeClass("icon-cuowu").addClass("icon-error");
            $(this).siblings().find("i").removeClass("icon-duihao2").addClass("icon-duihaocheckmark17");
            exam.c_student_answer = '错误';
            $(".lis_span").eq(exam.detail_order-1).addClass("span_active");
        }else{
            $(this).find("i").removeClass("icon-error").addClass("icon-cuowu");
            exam.c_student_answer = '';
            $(".lis_span").eq(exam.detail_order-1).removeClass("span_active");
        }
        post_answer(exam.id,exam.c_student_answer)
    }).appendTo(".answe_list>ul");
    if(exam.c_student_answer == '正确'){
        $(".anserList").eq(0).find("i").addClass("icon-duihao2").removeClass("icon-duihaocheckmark17");
        $(".anserList").eq(1).find("i").addClass("icon-cuowu").removeClass("icon-error");
    }else if(exam.c_student_answer == '错误'){
        $(".anserList").eq(0).find("i").addClass("icon-duihaocheckmark17").removeClass("icon-duihao2");
        $(".anserList").eq(1).find("i").addClass("icon-error").removeClass("icon-cuowu");
    }else{
        $(".anserList").eq(0).find("i").addClass("icon-duihaocheckmark17");
        $(".anserList").eq(1).find("i").addClass("icon-cuowu").removeClass("icon-error");
    }

}


function answer_moreList(exam){
    $(".answe_list>p").html('请在下方横线上填写答案！');
    $(".answe_list>ul").css("display","none");
    $(".answe_list>input").css("display","block").bind('input propertychange', function() {
        exam.c_student_answer = $(".answe_list>input").val();
        post_answer(exam.id,exam.c_student_answer);
    });

    if(exam.c_student_answer !='' && exam.c_student_answer !=null){
        $(".answe_list>input").val(exam.c_student_answer);
    }else{
        exam.c_student_answer = $(".answe_list>input").val();
    }

}
var post_answer = function(id,answer){
        $.pubAjax({
        type: 'post',
        url: ctxPath + '/admin/papers/studentAnswer',
        layui: true,
        data: {paper_id: now_paper_id,subject_id:id,student_answer:answer},
        success: (function (res) {
            if (res.code == 0) {
            }
        })
    })
};

//考试提交
var submitExam = function(){

    var errorList = [];
    var show_list = '';
    for(var i=1; i<= all_num; i++){
        var exam = getExamByIndex(i);
        if(exam.c_student_answer && exam.c_student_answer != ''){
        }
        else{
            errorList.push(exam.detail_order);
        }
    }

    if(errorList.length>0){
         var list = '';
        for(var i in errorList){
            list +='第'+errorList[i]+'题,'
        }
        list = list.substring(0,list.length-1);
        show_list = '该试卷里还有<span style="color:red;">'+list+' </span>这些题目没有作答！'
    }else{
        show_list = '';
    }
    layer.confirm(''+show_list+'确定交卷吗？', {
        btn: ['确定', '取消'] //按钮
    }, function () {
        $.pubAjax({
            type: 'post',
            url: ctxPath + '/admin/papers/studentAssignment',
            layui: true,
            data: {paper_id: now_paper_id},
            success: (function (res) {
                if (res.code == 0) {
                    localStorage.setItem("paperpass",JSON.stringify(data.paper_pass));
                    window.open("/examEnd?paperId=" + now_paper_id, "_self")
                }
            })
        })
    })
}

function Time(now){
    var Data = new Date(now);
    var year=Data.getFullYear();
    var month=Data.getMonth()+1;
    var date=Data.getDate();
    var hour=Data.getHours()<10 ? '0'+Data.getHours() :Data.getHours();
    var minute=Data.getMinutes()<10 ? '0'+Data.getMinutes() :Data.getMinutes();
    var second=Data.getSeconds()<10 ? '0'+Data.getSeconds() :Data.getSeconds();
    return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
}


