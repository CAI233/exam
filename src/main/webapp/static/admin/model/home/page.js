myApp.controller('homeController', function ($rootScope, $scope, services, $sce, $stateParams) {

    // //var colors = ['#ff8664', '#65b4ec', '#a48ad4', '#1eb3aa', '#fbd779', "#1eb3aa", "#6fd96f", "#eb7070", "#f1dc2e", "#F3A43B"];
    // var colors = ['#65b4ec', '#65b4ec', '#65b4ec', '#65b4ec', '#65b4ec', "#65b4ec", "#65b4ec", "#65b4ec", "#65b4ec", "#65b4ec"];
    // var color = [ "#61A0A8", "#f1dc2e", "#F3A43B"];
    // $scope.one_load =function(){
    //     var myChart = echarts.init(document.getElementById('main'));
    //     var option = {
    //         title:{
    //             text: '专业',
    //             x:10,
    //             y:10
    //         },
    //         tooltip: {
    //             trigger: 'item',
    //             formatter: "{a} <br/>{b}: {c} ({d}%)"
    //         },
    //         grid: {
    //             left: 20,
    //             right: 20,
    //             bottom: 20,
    //             containLabel: true
    //         },
    //         series: [
    //             {
    //                 name:'专业',
    //                 type:'pie',
    //                 selectedMode: 'single',
    //                 radius: [0, '30%'],
    //
    //                 label: {
    //                     normal: {
    //                         position: 'inner'
    //                     }
    //                 },
    //                 labelLine: {
    //                     normal: {
    //                         show: false
    //                     }
    //                 },
    //                 data:[
    //                     {value:263, name:'语文', selected:true},
    //                     {value:489, name:'数学'},
    //                     {value:859, name:'英语'},
    //                     {value:344, name:'会计'}
    //                 ]
    //             },
    //             {
    //                 name:'专业',
    //                 type:'pie',
    //                 radius: ['40%', '55%'],
    //                 label: {
    //                     normal: {
    //                         formatter: '{b|{b}}  {d}%  ',
    //                         backgroundColor: '#eee',
    //                         borderColor: '#aaa',
    //                         borderWidth: 1,
    //                         borderRadius: 4,
    //                         padding: [2,5 ],
    //                         rich: {
    //                             a: {
    //                                 color: '#999',
    //                                 lineHeight: 22,
    //                                 align: 'center'
    //                             },
    //                             b: {
    //                                 fontSize: 12,
    //                                 lineHeight: 33
    //                             }
    //                         }
    //                     }
    //                 },
    //                 data:[
    //                     {value:1536, name:'电子商务'},
    //                     {value:1446, name:'航空乘务'},
    //                     {value:1446, name:'酒店服务与管理'},
    //                     {value:1446, name:'旅游服务管理'},
    //                     {value:1446, name:'旅游英语'},
    //                     {value:1446, name:'文秘'},
    //                     {value:1446, name:'汽车整车与配件营销'},
    //                     {value:1446, name:'烹饪'},
    //                     {value:1446, name:'服装展示与礼仪'},
    //                     {value:1865, name:'金融事务'}
    //                 ]
    //             }
    //         ]
    //     };
    //
    //     myChart.setOption(option);
    // };
    // $scope.two_load =function(){
    //     var myChart = echarts.init(document.getElementById('main_two'));
    //     var option = {
    //         title:{
    //             text: '班级成绩',
    //             x:10,
    //             y:10
    //         },
    //         color:color,
    //         tooltip: {
    //             trigger: 'axis',
    //             axisPointer: {
    //                 type: 'cross',
    //                 label: {
    //                     backgroundColor: '#000'
    //                 }
    //             }
    //         },
    //         legend: {
    //             data:['班级人数', '平均成绩'],
    //             y:10
    //         },
    //         dataZoom: {
    //             show: false,
    //             start: 0,
    //             end: 100
    //         },
    //         grid: {
    //             left: 20,
    //             right: 20,
    //             bottom: 20,
    //             containLabel: true
    //         },
    //         xAxis: [
    //             {
    //                 type: 'category',
    //                 boundaryGap: true,
    //                 data:['三（1）班','三（2）班','三（3）班']
    //             },
    //             {
    //                 type: 'category',
    //                 boundaryGap: true,
    //                 data: (function (){
    //                     var res = [];
    //                     var len = 3;
    //                     while (len--) {
    //                         res.push(len + 1);
    //                     }
    //                     return res;
    //                 })()
    //             }
    //         ],
    //         yAxis: [
    //             {
    //                 type: 'value',
    //                 scale: true,
    //                 name: '成绩',
    //                 max: 100,
    //                 min: 0,
    //                 boundaryGap: [0.2, 0.2]
    //             },
    //             {
    //                 type: 'value',
    //                 scale: true,
    //                 name: '人数',
    //                 max: 80,
    //                 min: 0,
    //                 boundaryGap: [0.2, 0.2]
    //             }
    //         ],
    //         series: [
    //             {
    //                 name:'班级人数',
    //                 type:'bar',
    //                 xAxisIndex: 1,
    //                 yAxisIndex: 1,
    //                 data:(function (){
    //                     var res = [];
    //                     var len = 3;
    //                     while (len--) {
    //                         res.push(Math.round(Math.random() * 80));
    //                     }
    //                     return res;
    //                 })()
    //             },
    //             {
    //                 name:'平均成绩',
    //                 type:'line',
    //                 data:(function (){
    //                     var res = [];
    //                     var len = 0;
    //                     while (len < 3) {
    //                         res.push((Math.random()*10 + 5).toFixed(1) - 0);
    //                         len++;
    //                     }
    //                     return res;
    //                 })()
    //             }
    //         ]
    //     };
    //     myChart.setOption(option);
    // };
    // $scope.three_load =function(){
    //     var myChart = echarts.init(document.getElementById('main_three'));
    //     var dd = [];
    //     var cc = [];
    //     var data = [{
    //         nowNum: 10,
    //         allNum: 50
    //     },{
    //         nowNum: 14,
    //         allNum: 50
    //     },{
    //         nowNum: 15,
    //         allNum: 50
    //     },{
    //         nowNum: 20,
    //         allNum: 50
    //     },{
    //         nowNum: 20,
    //         allNum: 50
    //     },{
    //         nowNum: 30,
    //         allNum: 50
    //     },{
    //         nowNum: 33,
    //         allNum: 50
    //     },{
    //         nowNum: 40,
    //         allNum: 50
    //     },{
    //         nowNum: 10,
    //         allNum: 50
    //     },{
    //         nowNum: 50,
    //         allNum: 50
    //     },{
    //         nowNum: 40,
    //         allNum: 50
    //     }]
    //     var colors = ['#ff8664', '#65b4ec', '#a48ad4', '#1eb3aa', '#fbd779', "#1eb3aa", "#6fd96f", "#eb7070", "#f1dc2e", "#F3A43B"];
    //     for(var i=0;i<data.length;i++){
    //         dd.push(data[i].nowNum);
    //         var n = (data[i].nowNum / data[i].allNum).toFixed(2) * 100;
    //        if(n < 60){
    //             cc.push('#fbd779');
    //         }
    //         else if(n < 80){
    //             cc.push('#65b4ec');
    //         }
    //         else{
    //             cc.push('#1eb3aa');
    //         }
    //     }
    //     var option3 = {
    //         title:{
    //             text: '试卷统计',
    //             x:'center',
    //             y:20
    //         },
    //         color: cc,
    //         tooltip: {
    //             trigger: 'axis',
    //             axisPointer: {
    //                 type: 'shadow'
    //             }
    //         },
    //         grid: {
    //             left: 20,
    //             right: 20,
    //             bottom: 20,
    //             containLabel: true
    //         },
    //         xAxis: {
    //             type: 'value',
    //             boundaryGap: [0, 0.01]
    //         },
    //         yAxis: {
    //             type: 'category',
    //             data: ['数学考试模拟试卷(1)', '数学考试模拟试卷(2)', '英语考试模拟试卷(1)', '英语考试模拟试卷(2)', '英语考试模拟试卷(3)', '语文考试模拟试卷(1)', '语文考试模拟试卷(2)'
    //                 , '语文考试模拟试卷(3)', '语文考试模拟试卷(4)', '语文考试模拟试卷(5)', '语文考试模拟试卷(6)']
    //         },
    //         series: [
    //             {
    //                 name: '试卷',
    //                 type: 'bar',
    //                 label: {
    //                     normal: {
    //                         position: 'right',
    //                         show: true
    //                     }
    //                 },
    //                 itemStyle: {
    //                     normal: {
    //                         color: function (params) {
    //                             return cc[params.dataIndex]
    //                         }
    //                     }
    //                 },
    //                 data: dd
    //             }
    //         ]
    //     };
    //     myChart.setOption(option3);
    // };
    // $scope.one_load();
    // $scope.two_load();
    // $scope.three_load();
});

