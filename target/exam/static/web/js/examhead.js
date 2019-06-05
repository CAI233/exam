/**
 * Created by Administrator on 2018/1/31 0031.
 */
var now_url = window.location.href;
var now_paper_id = now_url.substring(now_url.indexOf("=")+1,now_url.length);
console.log(now_paper_id);
function ToExam(){
    window.open("/exam?paperId="+now_paper_id,"_self")
}

