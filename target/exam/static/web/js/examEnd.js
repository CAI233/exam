/**
 * Created by Administrator on 2018/2/1 0001.
 */
$(document).ready(function () {
    var now_url = window.location.href;
    var now_paper_id = now_url.substring(now_url.indexOf("=")+1,now_url.length);
    var now_paperpass = JSON.parse(localStorage.getItem("paperpass"));
    var now_paperscore = 0;
    $.pubAjax({
    type: 'post',
    url: ctxPath + '/admin/papers/studentAssignment',
    data: {paper_id:now_paper_id},
    success: (function (res) {

            now_paperscore = res.data;
            if(now_paperscore<now_paperpass){
                $("#content").html('<p class="score" style="color:red;">'+now_paperscore+'分</p><p class="hint">考试结束，很遗憾您没有通过考试！</p>')

            }else{
                $("#content").html('<p class="score" style="color:#1E9FFF;">'+now_paperscore+'分</p><p class="hint">考试结束，恭喜您通过考试！</p>')
            }

        })
    })
})