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
    $(".menu>li").eq(1).find("a").addClass("active").siblings().removeClass("active");
    get_currrms();
    setTimeout(load,500)
})

var load = function () {
    $.pubAjax({
        type: 'post',
        url: ctxPath + '/admin/papers/studentPaperRecord',
        // url: ctxPath + '/static/web/json/data_examArrange.json',
        layui: true,
        data: {pageNum:param.pageNum,pageSize:param.pageSize,},
        success: (function (res) {
            if (res.code == 0) {
                param.pageNum = res.data.pageNum;
                param.pageSize = res.data.pageSize;
                param.total = res.data.total;
                param.pages = res.data.pages;
                $("#pager_pages").html(param.pages)
                $("#pager_total").html(param.total)
                console.log(res)
                $('#examRecord_tbody').empty();

                if(res.data.rows.length>0){
                    $.each(res.data.rows, function(index, item){
                        var btn = '';
                        var stu_name = '';
                        var now_passname = '';
                        var now_color = '';
                        var now_item = item;
                        switch (item.studentstatus) {
                            case 0:
                                btn = '— —';
                                stu_name = '未考试';
                                break;
                            case 2:
                                // btn = '<a href="javascript:;" style="text-decoration:underline;color:#4facfa;padding:5px 10px;">详情</a><a href="javascript:;" style="text-decoration:underline;color:#4facfa;padding:5px 10px;">试卷分析</a>';
                                btn = '<a style="text-decoration:underline;color:#4facfa;padding:5px 10px;cursor:pointer;" onclick="select(\''+now_item.id +'\',\'' + now_item.paper_curriculum+'\')">试卷分析</a>';
                                stu_name = '已交卷';
                                break;

                        }
                        if(item.paper_mode==0){
                            btn = '— —';
                            stu_name = '— —';
                        }
                        if(item.test_result<item.paper_pass){
                            now_passname = '挂科';
                            now_color = "red";
                        }else{
                            now_passname = '及格';
                            now_color = "black";
                        }
                        var col ='<tr>' +
                            '<td>' + item.paper_title + '</td>' +
                            '<td>' + item.paper_start + '<br>'+item.paper_end+'</td>' +
                            '<td>' + item.paper_addr + '</td>' +
                            '<td>' + ["笔试","机试"][item.paper_mode] + '</td>' +
                            '<td>' + stu_name + '</td>' +
                            '<td>' + item.test_result + '/<span style="color:'+now_color+'">'+now_passname+'</span></td>' +
                            '<td style="text-align:center;">' + btn + '</td>' +
                            '</tr>'
                        $('#examRecord_tbody').append(col)
                    });
                    $("#data_pager").empty();
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
                console.log(res.data);
                localStorage.setItem("all_currms",JSON.stringify(res.data))
            }
        })
    })
};

function select(id,currm){
    localStorage.setItem("now_currm",JSON.stringify(currm));
    window.open("/detail?paperId="+id,"_self");
}