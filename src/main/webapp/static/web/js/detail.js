/**
 * Created by Administrator on 2018/2/1 0001.
 */

// //学生个人统计分析
// services["_person_analisis"] = function (param) {
//     return $rootScope.serverAction(ctxPath + 'admin/statistics/structStatistics', param, "POST");
// };
// //学生个人题型准确率
// services["_person_type"] = function (param) {
//     return $rootScope.serverAction(ctxPath + '/admin/statistics/studentTypeStatistics', param, "POST");
// };
// //学生个人难易度准确率
// services["_person_level"] = function (param) {
//     return $rootScope.serverAction(ctxPath + '/admin/statistics/studentLevelStatistics', param, "POST");
// };


var now_stu = JSON.parse($.cookie('USERINFO'));
var all_currms = JSON.parse(localStorage.getItem("all_currms"));
var now_currm = JSON.parse(localStorage.getItem("now_currm"));
var currm_arry = [];
if(now_currm.indexOf(",")!=-1){
    currm_arry = now_currm.split(",");
}else{
    currm_arry[0] = now_currm;
}

var now_url = window.location.href;
var now_paper_id = now_url.substring(now_url.indexOf("=")+1,now_url.length);

var nowCurrm = null;
$(document).ready(function () {
    $.each(currm_arry,function(index,item){
        $('<a class="robtn">'+_get_curriculum_name(item)+'</a>').click(function(){
            nowCurrm = item;
            // $(this).css({'background':'#E63A3A','color':'#fff'}).siblings().css({'background':'#fff','color':'#000'});
            $(this).css({'border-bottom':'2px solid #E63A3A'}).siblings().css({'border-bottom':'none'});
            get_load3();
        }).appendTo(".hrad_cont");
    });

    setTimeout(function(){
        nowCurrm = currm_arry[0];
        $('.robtn').eq(0).css({'border-bottom':'2px solid #E63A3A'})
        get_load1();
        get_load2();
        get_load3();
    },500)
})

//个人题型准确率
var type_all = [];
var type_all_cont = [] ;
var type_all_true = [];

var get_load1 = function(){
    $.pubAjax({
        type: 'post',
        url: ctxPath + '/admin/statistics/studentTypeStatistics',
        layui: true,
        data: {paper_id:now_paper_id,person_studentid:now_stu.user_name},
        success: (function (res) {
            if (res.code == 0) {
                console.log(res);
                var all_type = res.data;
                console.log(all_type);
                if(all_type && all_type.length>0){

                    $.each(all_type,function(index,item){
                        type_all.push('︵'+_get_curriculum_name(item.c_curriculum)+'︶'+item.dic_name);
                        type_all_cont.push(item.total_count);
                        type_all_true.push(item.right_count);
                    });
                    load1();
                }else{
                    type_all = ['初始题型', '初始题型', '初始题型','初始题型'];
                    type_all_cont = [0, 0, 0,0] ;
                    type_all_true = [0, 0, 0,0];
                    load1();
                    layer.msg("当前图表数据为默认值，或为最近没有考试");
                }
            }else{
                layer.msg(res.message)
            }
        })
    })
};
//个人题型准确率
var level_all = [];
var level_all_cont = [] ;
var level_all_true = [];
var get_load2 = function(){
    $.pubAjax({
        type: 'post',
        url: ctxPath + '/admin/statistics/studentLevelStatistics',
        layui: true,
        data: {paper_id:now_paper_id,person_studentid:now_stu.user_name},
        success: (function (res) {
            if (res.code == 0) {
                console.log(res);
                // console.log(res);
                var all_level = res.data;
                if(all_level && all_level.length>0){
                    $.each(all_level,function(index,item){
                        level_all.push(item.dic_name);
                        level_all_cont.push(item.total_count);
                        level_all_true.push(item.right_count);
                    })
                    load2();
                }else{
                    level_all = ["基础题","中等题","较难题"];
                    level_all_cont = [0, 0, 0] ;
                    level_all_true = [0, 0, 0];
                    load2();
                    layer.msg("当前图表数据为默认值，或为最近没有考试")
                }
            }else{
                layer.msg(res.message)
            }
        })
    })


}

var get_load3 = function(){
    $.pubAjax({
        type: 'post',
        url: ctxPath + 'admin/statistics/structStatistics',
        layui: true,
        data: {exam_id:now_paper_id,student_id:now_stu.user_name,struct_curriculum:nowCurrm},
        success: (function (res) {
            $("#personAnalisis").html("");
            $.each(res.data,function(index,item){
                var dtr =  $('<tr></tr>').appendTo("#personAnalisis");
                dtr.append($('<td style="border:none;border-top:1px dashed #e2e2e2;">'+replace_num(item.struct_alias)+'</td><td style="border:none;border-top:1px dashed #e2e2e2;">'+_get_curriculum_name(nowCurrm)+'</td><td style="border:none;border-top:1px dashed #e2e2e2;">'+item.student_totalnum+'</td><td style="border:none;border-top:1px dashed #e2e2e2;">'+item.subject_codes+'</td><td style="border:none;border-top:1px dashed #e2e2e2;">'+(item.student_rightnum/item.student_totalnum*100).toFixed(2)+'%</td>'))
            })
        })
    })
};

var load1 = function(){
    var myChart1 = echarts.init(document.getElementById('mage_left'));
    var option1 = {
        title: {
            text: '试题题型掌握比例',
            textStyle: {
                fontSize: 17,
                fontStyle: 'normal',
                fontWeight: 'normal',
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'line'        // 默认为直线，可选为：'line' | 'shadow'
            },
            formatter:function(value){
                return value[0].seriesName+'：'+value[0].value+'<br>'+value[1].seriesName+'：'+value[1].value;
            },

        },
        calculable: true,
        grid: {bottom:'29%'},
        xAxis: [
            {
                type: 'category',
                data: type_all,
                axisLabel: {
                    interval:0,
                    formatter:function(value)
                    {
                        return value.split("").join("\n");
                    }
                }

            },
            {
                type: 'category',
                axisLine: {show: false},
                axisTick: {show: false},
                axisLabel: {show: false},
                splitArea: {show: false},
                splitLine: {show: false},
                data:type_all
            }

        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {formatter: '{value}'}
            }
        ],
        series: [
            {
                name: '总题数',
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: '#EAF0F0',
                        label: {show: true, textStyle: {color: '#999'}, position: 'top'}
                    },
                    emphasis:{color:'#EAF0F0'},
                },
                barWidth: 25,
                data:type_all_cont
            },
            {
                name: '正确数',
                type: 'bar',
                xAxisIndex: 1,
                barWidth: 25,
                itemStyle: {
                    normal: {
                        color: '#67D99E',

                        label: {show: true}
                    },
                    emphasis:{color:'#67D99E'},
                },
                data:type_all_true
            }
        ]
    };

    myChart1.setOption(option1);

}

var load2 = function(){
    var myChart2 = echarts.init(document.getElementById('mage_right'));
    var option2 = {
        title: {
            text: '试题难易度掌握比例',
            textStyle: {
                fontSize: 17,
                fontStyle: 'normal',
                fontWeight: 'normal',
            }
        },
        tooltip: {
            trigger: 'axis'
        },
        calculable: true,
        grid: {y: 70, y2: 30, x2: 20},
        xAxis: [
            {
                type: 'category',
                data:level_all
            },
            {
                type: 'category',
                axisLine: {show: false},
                axisTick: {show: false},
                axisLabel: {show: false},
                splitArea: {show: false},
                splitLine: {show: false},
                data:level_all
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {formatter: '{value}'}
            }
        ],
        series: [
            {
                name: '总题数',
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: '#EAF0F0',
                        label: {show: true, textStyle: {color: '#999'}, position: 'top'}
                    },
                    emphasis:{color:'#EAF0F0'},
                },
                barWidth: 50,
                data:level_all_cont
            },
            {
                name: '正确数',
                type: 'bar',
                xAxisIndex: 1,
                barWidth: 50,
                itemStyle: {
                    normal: {
                        color: '#67D99E', label: {show: true}
                    },
                    emphasis:{color:'#67D99E'},
                },
                data:level_all_true
            }
        ]
    };
    myChart2.setOption(option2);
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


//页面知识点去点数字和小数点
var replace_num = function(data){
    var now_data = null;
    now_data = data.replace(data.replace(/[^\d\.]/g,''),'');
    return now_data;
}