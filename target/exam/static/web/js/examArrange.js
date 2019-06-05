/**
 *考试安排js
 */

var param = {
    pageNum: 1,
    pageSize: 10,
    pages: 1,
    total: 0,
}
$(document).ready(function () {
    $(".menu>li").eq(0).find("a").addClass("active").siblings().removeClass("active");
    get_currrms();
    setTimeout(function(){
        load();
    },500)
})

var load = function () {
    $.pubAjax({
        type: 'post',
        url: ctxPath + '/admin/papers/studentPaperArrange',
        layui: true,
        data: {
            pageNum:param.pageNum,
            pageSize:param.pageSize
        },
        success: (function (res) {
            if (res.code == 0) {
                param.pageNum = res.data.pageNum;
                param.pageSize = res.data.pageSize;
                param.total = res.data.total;
                param.pages = res.data.pages;

                $('#examArrange_tbody').empty();
                if(res.data.rows.length>0){
                    var time_arr = [];
                    var time_set = null;
                    //当前服务器的时间戳
                    var now_time = parseInt(Date.parse(new Date((res.data.rows[0].currentTime).replace(/\-/g,'/'))))
                    $.each(res.data.rows, function (index, item) {
                        // console.log(item.status+'-------------'+item.studentstatus)
                        if(item.paper_mode==1){
                            time_arr.push(parseInt(Date.parse(new Date((item.paper_start+":00").replace(/\-/g,'/')))))
                        }

                        var btn = '';
                        var stu_name = '';
                        var mode = '';
                        switch (item.status) {
                            case '2':
                                switch (item.studentstatus) {
                                    case 0:
                                        btn = '<a class="layui-btn layui-btn-primary" onclick="examCheck()" >考试准备中</a>';
                                        break;
                                }
                                stu_name = '考试准备中';

                                break;
                            case '3':
                                switch (item.studentstatus) {
                                    case 0:
                                        btn = '<a class="layui-btn layui-btn-normal" href="/examhead?paperId='+item.id+'" >开始考试</a>';
                                        break;
                                    case 1:
                                        btn = '<a class="layui-btn layui-btn-primary" href="/examhead?paperId='+item.id+'" style="background:#e63a3a;color:#fff;">继续考试</a>';
                                        break;
                                }
                                stu_name = '考试中';
                                break;
                            case '9':
                                var now_startime = parseInt(Date.parse(new Date((item.paper_start).replace(/\-/g,'/'))));
                                if(now_time<now_startime){
                                    btn = '<a class="layui-btn layui-btn-primary" onclick="examCheck()" >待&nbsp;&nbsp;考&nbsp;&nbsp;试</a>';
                                    stu_name = '待考试';
                                }else{
                                    btn = '<a class="layui-btn layui-btn-normal" href="/examhead?paperId='+item.id+'" >开始考试</a>';
                                    stu_name = '开始考试';
                                }
                                break;
                            case '10':
                                btn = '<a class="layui-btn layui-btn-primary" onclick="examCheck()" >考试准备中</a>';
                                stu_name = '考试准备中';
                        }

                        if(item.paper_mode==0){
                            mode = '<td style="text-align:center;">' + '— —'+ '</td>' ;
                        }else{
                            mode =  '<td style="text-align:center;">' + btn + '</td>'
                        }
                        var col = '<tr>' +
                            '<td>' + item.paper_title + '</td>' +
                            '<td>' + item.paper_start + '<br/>'+item.paper_end+'</td>' +
                            '<td>' + item.paper_addr + '</td>' +
                            '<td>' + ["笔试","机试"][item.paper_mode] + '</td>' +
                            '<td>' + stu_name + '</td>' +
                            '<td>' + item.paper_pass + '分/'+item.paper_full+'分</td>' +
                            mode+
                            '</tr>'
                        $('#examArrange_tbody').append(col)
                    })

                    if(time_arr.length>0){

                        time_set = setInterval(function(){
                            now_time = now_time+1000;
                            // console.log(new XDate(now_time).toString('yyyy-MM-dd HH:mm:ss'));
                            if(time_arr.indexOf(now_time+5000)!=-1 || time_arr.indexOf(now_time+4000)!=-1 || time_arr.indexOf(now_time+3000)!=-1 || time_arr.indexOf(now_time+2000)!=-1 || time_arr.indexOf(now_time+1000)!=-1 || time_arr.indexOf(now_time)!=-1 || time_arr.indexOf(now_time-1000)!=-1 || time_arr.indexOf(now_time-2000)!=-1 || time_arr.indexOf(now_time-3000)!=-1 ){
                                //刷新页面
                                load();
                                clearInterval(time_set);
                            }
                        },1000)
                    }else{
                        clearInterval(time_set);
                    }
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
                }

            } else {
                layer.alert(res.message);
            }
        })
    })
}

var get_currrms = function(){
    $.pubAjax({
        type: 'post',
        url: ctxPath + '/admin/eMDictionary/getDicTree',
        data: {dic_parentcode: '30000'},
        success: (function (res) {
            if (res.code == 0) {
                localStorage.setItem("all_currms",JSON.stringify(res.data))
            }
        })
    })
};
function examCheck(){
    layer.alert("还没到考试时间，请稍后刷新");
}

// function start_exam(vcode,id){
//     var exam_port = layer.prompt({
//         formType: 0,
//         title: '请输入验证码',
//         yes:function (index, elem) {
//             if(elem.find(".layui-layer-input").val()===vcode){
//                 layer.close(exam_port);
//                 window.open("/examhead?paperId="+id,"_self")
//             }else{
//                 layer.msg("请输入正确的验证码")
//             }
//         }
//     });
//
// }

