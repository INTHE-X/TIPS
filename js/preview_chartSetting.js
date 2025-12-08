$(window).on('load', function(){


            const chart1 = document.getElementById('chart1');

            var prvChartOptions = {
                maintainAspectRatio: false,
                    responsive: true,

                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                    hover: {
                        mode: null,
                    },
                }

                var prvChartScales = {
                    x: {
                        grid: {
                            display: false,
                        },
                        border: {
                            display: false,
                        },
                        ticks: {
                            color: '5e5e5e',
                            font: {
                                weight: 600,
                            }
                        }
                    },
                    
                }

    const dualLabelPlugin = {
    id: 'dualLabel',
    afterDraw: function(chart, args, options) {
        if (!options || !options.enabled) {
            console.log('DualLabel Plugin: Disabled or No Options');
            return;
        }

        const ctx = chart.ctx;
        
        let datasetIndex = chart.data.datasets.findIndex(d => d.type === 'bar');
        if (datasetIndex === -1) {
            datasetIndex = 0; 
        }

        const meta = chart.getDatasetMeta(datasetIndex);
        
        if (!meta.data.length || meta.hidden) return;

        const lastIndex = meta.data.length - 1;
        const bar = meta.data[lastIndex];

        const { x, y, width } = bar.getProps(['x', 'y', 'width'], true);
        
        
        const barX = x;
        const barY = y; 

        const boxHeight = 24;
        const offset = 4;
        const gap = 4;    

        ctx.save();

        const box1Y = barY - offset - boxHeight; 

        ctx.fillStyle = options.label1?.backgroundColor || '#5F6B7F';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(barX - width / 2, box1Y, width, boxHeight, 999); 
        } else {
            ctx.rect(barX - width / 2, box1Y, width, boxHeight); 
        }
        ctx.fill();

        ctx.fillStyle = options.label1?.color || '#FFFFFF';
        ctx.font = '700 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const text1 = options.label1?.text || chart.data.datasets[datasetIndex].data[lastIndex];
        ctx.fillText(text1, barX, box1Y + boxHeight / 2);

        const box2Y = box1Y - gap - boxHeight;

        ctx.fillStyle = options.label2?.backgroundColor || '#8059E0';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(barX - width / 2, box2Y, width, boxHeight, 999);
        } else {
            ctx.rect(barX - width / 2, box2Y, width, boxHeight);
        }
        ctx.fill();

        ctx.fillStyle = options.label2?.color || '#FFFFFF';
        ctx.font = '700 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(options.label2?.text || 'Label 2', barX, box2Y + boxHeight / 2);

        ctx.restore();
    }
};
                
                var prvData1 = [0, 160, 102.6, 7.6, 141.2, 24.9, -0.4, 17.6, 33.3, 25, 20, 25];
                var prvData2 = [15, 9, 79, 85, 205, 256, 255, 300, 400, 500, 600, 750];

                if(chart1){
new Chart(chart1, {
    type: 'bar',
    plugins: [dualLabelPlugin],
                data: {
                    labels: ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
                    datasets: [
                        {
                            type: 'line',
                            label: '증감 (%)',
                            data: prvData1,
                            yAxisID: 'y1',
                            datalabels: {
                                display: false,
                            },
                            backgroundColor: "#6E42D9",
                            borderColor: "#6e42d9",
                            borderWidth: 2,
                            borderSkipped: false,
                            

                            pointBorderColor: prvData1.map((item, index) => {
                                if (index === prvData1.length - 1) {
                                    return 'rgba(255, 255, 255, 1)';
                                } else {
                                    return 'rgba(255, 255, 255, 0.6)';
                                }
                            }),
                            pointBorderWidth: 2,
                            pointRadius: prvData1.map((item, index) => {
                                if (index === prvData1.length - 1) {
                                    return 5;
                                } else {
                                    return 4;
                                }
                            }),
                        },
                        {
                            type: 'bar', 
                            label: '기업(개)',
                            data: prvData2,
                            yAxisID: 'y2',
                            datalabels: {
                                display: function(context) {
                                    return context.dataIndex !== context.dataset.data.length - 1;
                                },
                                offset: 4,
                                align: 'end',
                                anchor: 'end',
                                color: 'rgba(178, 185, 199, 1)',
                                font: {
                                    weight: 600,
                                    size: 13,
                                },
                            },

                            backgroundColor: prvData2.map((item, index) => {
                                if (index === prvData2.length - 1) {
                                    return 'rgba(95, 107, 127, 1)';
                                } else {
                                    return 'rgba(178, 185, 199, 0.5)';
                                }
                            }),
                            borderRadius: 8,
                            borderSkipped: false,
                            
                        },

                    ]
                },
                
                options: {
                ...prvChartOptions,
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart',
                        delay: (context) => {
                            return context.dataIndex * 50;
                        },
                        y: {
                            from: (ctx) => {
                                if (ctx.type === 'data' && ctx.datasetIndex === 1) {
                                    return ctx.chart.chartArea.bottom; 
                                }
                            }
                        }
                    },
                plugins: {
                    ...prvChartOptions.plugins,
                    dualLabel: {
                        enabled: true,
                        label1: {
                            text: '750',
                            backgroundColor: '#5F6B7F',
                            color: '#FFFFFF',
                        },
                        label2: {
                            text: '25.0%',
                            backgroundColor: '#8059E0',
                            color: '#FFFFFF',
                        }
                    }
                },
                scales: {
                    ...prvChartScales,
                    y1: {
                        type: 'linear',
                        position: 'right',
                        min: 0,
                        max: 200,
                        display: false,
                        border: {
                            display: false,
                        },
                        ticks: {
                            color: '#B4B8BF',
                            weight: 500,
                        }
                    },
                    y2: {
                        type: 'linear',
                        position: 'left',
                        min: 0,
                        max: 1000,
                        border: {
                            display: false,
                        },
                        ticks: {
                            padding: 15,
                            color: "rgba(178, 185, 199, 1)",
                            stepSize: 200,
                            min: 0,
                            crossAlign: 'far',

                        },
                    },
                },
            }
                    
            });
                }
            

            var prv_barLine2 = document.getElementById('prv_barLine2');

            var prvData02 = [5, 12, 21, 27, 46, 53, 58, 64, 75, 90, 118, 139]; 
            var prvData03 = [3, 3.3, 3.8, 3.1, 4.5, 4.8, 4.4, 4.7, 5.3, 5.6, 5.1, 5.4]

            if(prv_barLine2){
new Chart(prv_barLine2, {
    type: 'bar',
    plugins: [dualLabelPlugin],
                data: {
                    labels: ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
                    datasets: [
                        {
                            type: 'line',
                            label: '운영 기관 당 기업 선정(개)',
                            data: prvData03,
                            yAxisID: 'y1',
                            datalabels: {
                                display: false,
                            },
                            backgroundColor: "#6E42D9",
                            borderColor: "#6e42d9",
                            borderWidth: 2,
                            borderSkipped: false,

                            pointBorderColor: prvData03.map((item, index) => {
                                if (index === prvData03.length - 1) {
                                    return 'rgba(255, 255, 255, 1)';
                                } else {
                                    return 'rgba(255, 255, 255, 0.6)';
                                }
                            }),
                            pointBorderWidth: 2,
                            pointRadius: prvData03.map((item, index) => {
                                if (index === prvData03.length - 1) {
                                    return 5;
                                } else {
                                    return 4;
                                }
                            }),

                        },
                        {
                            type: 'bar', 
                            label: '운영 기관',
                            data: prvData02,
                            yAxisID: 'y2',
                            datalabels: {
                            display: function(context) {
                                return context.dataIndex !== context.dataset.data.length - 1;
                            },
                            offset: 4,
                            align: 'end',
                            anchor: 'end',
                            color: 'rgba(178, 185, 199, 1)',
                            font: {
                                weight: 600,
                                size: 13,
                            },
                            },

                            backgroundColor: prvData2.map((item, index) => {
                                if (index === prvData2.length - 1) {
                                    return 'rgba(95, 107, 127, 1)';
                                } else {
                                    return 'rgba(178, 185, 199, 0.5)';
                                }
                            }),
                            borderRadius: 8,
                            borderSkipped: false,
                            
                        }
                    ]
                },
                options: {
                    ...prvChartOptions,
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart',
                        delay: (context) => {
                            return context.dataIndex * 50;
                        },
                        y: {
                            from: (ctx) => {
                                if (ctx.type === 'data' && ctx.datasetIndex === 1) {
                                    return ctx.chart.chartArea.bottom; 
                                }
                            }
                        }
                    },
                    plugins: {
                    ...prvChartOptions.plugins,
                    dualLabel: {
                        enabled: true,
                        label1: {
                            text: '139',
                            backgroundColor: '#5F6B7F',
                            color: '#FFFFFF',
                            borderRadius: 999,
                            
                        },
                        label2: {
                            text: '5.4',
                            backgroundColor: '#8059E0',
                            color: '#FFFFFF',
                        }
                    }
                },
                    scales: {
                        ...prvChartScales,
                        y1: {
                        type: 'linear',
                        position: 'right',
                        min: 0,
                        max: 200,
                        display: false,
                        border: {
                            display: false,
                        },
                        ticks: {
                            color: '#B4B8BF',
                            weight: 500,
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        min: 0,
                        max: 6,
                        display: false,
                        border: {
                            display: false,
                        },
                        ticks: {
                            color: '#B4B8BF',
                            weight: 500,
                        }
                    },
                        y2: {
                            type: 'linear',
                            position: 'left',
                            min: 0,
                            max: 180,
                            border: {
                                display: false,
                            },
                            ticks: {
                                padding: 15,
                                color: "rgba(178, 185, 199, 1)",
                                stepSize: 30,
                                crossAlign: 'far',
                            },
                        },
                    },
                }
            });

            }
            
            const prv_doughnut1 = document.getElementById('doughnut1');

            var prv_doughnutOptions = {
                maintainAspectRatio: false,
                hover: {
                    mode: null,
                },

                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        backgroundColor: function(context) {
                            if (context.tooltip.dataPoints && context.tooltip.dataPoints.length > 0) {
                                const dataIndex = context.tooltip.dataPoints[0].dataIndex;
                                return context.tooltip.dataPoints[0].dataset.backgroundColor[dataIndex];
                            }
                            return '#000';
                        },
                        titleAlign: 'center',
                        bodyAlign: 'center',
                        callbacks: {
                            title: function(context) {
                                return context[0].raw + '%';
                            },
                            beforeBody: function() {
                                return '';  // 한 줄 띄우기
                            },
                            label: function(context) {
                                return context.label;
                            }
                        },
                        titleFont: {
                            size: 13,
                            weight: 600,
                            family: 'Clash Grotesk',
                        },
                        bodyFont: {
                            size: 13,
                            weight: 500,
                        },
                        titleMarginBottom: 1,  // title 아래 간격
                        padding: {
                            top: 10,
                            bottom: 10,
                            left: 14,
                            right: 14
                        },
                        displayColors: false,
                    }

                },
                layout: {
                    padding: 0
                },
                borderWidth: 0,
                cutout: '80%',
                
            }

            var prvData3 = [64.2, 21.6, 3.3, 10.9];
            
            if(prv_doughnut1){
new Chart(prv_doughnut1, {
                data: {
                    labels: ['데이터/네트워크/AI', '바이오헬스', '에너지','기타'],
                    datasets: [
                        {
                            type: 'doughnut',
                            data: prvData3,
                            backgroundColor: [
                                'rgba(110, 66, 217, 1)',
                                'rgba(105, 145, 255, 1)',
                                'rgba(66, 207, 217, 1)',
                                'rgba(180, 184, 191, 1)'
                            ],
                            datalabels: {
                                display: false,
                            },
                        }
                    ],

                },
                options: prv_doughnutOptions,

            });
            }
            

            const prv_doughnut2 = document.getElementById('doughnut2');

            var prvData4 = [44.5, 22.2, 10.5, 22.8];

            if(prv_doughnut2){
                new Chart(prv_doughnut2, {
                    data: {
                        labels: ['정보통신', '바이오ㆍ의료', '지식서비스','기타'],
                        datasets: [
                            {
                                type: 'doughnut',
                                data: prvData4,
                                backgroundColor: [
                                    'rgba(34, 107, 218, 1)',
                                    'rgba(105, 145, 255, 1)',
                                    'rgba(66, 207, 217, 1)',
                                    'rgba(180, 184, 191, 1)'
                                ],
                                datalabels: {
                                    display: false,
                                },
                            }
                        ],

                    },
                    options: prv_doughnutOptions,

                });
            }
            

            var prv_doughnut3 = document.getElementById('doughnut3');

            var prvData5 = [55, 12, 8, 25];

            if(prv_doughnut3){
                new Chart(prv_doughnut3, {
                    data: {
                        labels: ['서울특별시', '경기도', '대전광역시','기타'],
                        datasets: [
                            {
                                type: 'doughnut',
                                data: prvData5,
                                backgroundColor: [
                                    'rgba(53, 53, 156, 1)',
                                    'rgba(105, 145, 255, 1)',
                                    'rgba(66, 207, 217, 1)',
                                    'rgba(180, 184, 191, 1)'
                                ],
                                datalabels: {
                                    display: false,
                                },
                            }
                        ],

                    },
                    options: prv_doughnutOptions,

                });
            }


            var prvData6 = [47.7, 9.3, 5.6, 37.4];


            var prv_doughnut4 = document.getElementById('doughnut4');
            
            if(prv_doughnut4){
                new Chart(prv_doughnut4, {
                    data: {
                        labels: ['전분야', '데이터/네트워크/AI', '바이오헬스 & 데이터/네트워크/AI','기타'],
                        datasets: [
                            {
                                type: 'doughnut',
                                data: prvData6,
                                backgroundColor: [
                                    'rgba(110, 66, 217, 1)',
                                    'rgba(105, 145, 255, 1)',
                                    'rgba(66, 207, 217, 1)',
                                    'rgba(180, 184, 191, 1)'
                                ],
                                datalabels: {
                                    display: false,
                                },
                            }
                        ],

                    },
                    options: prv_doughnutOptions,

                });
            }

            const prv_doughnut5 = document.getElementById('doughnut5');

            var prvData7 = [43.5, 34.3, 9.3, 13.0];

            if(prv_doughnut5){
                new Chart(prv_doughnut5, {
                    data: {
                        labels: ['전문, 과학 및 기술 서비스업', '금융 및 보험업', '정보통신업','기타'],
                        datasets: [
                            {
                                type: 'doughnut',
                                data: prvData7,
                                backgroundColor: [
                                    'rgba(34, 107, 218, 1)',
                                    'rgba(105, 145, 255, 1)',
                                    'rgba(66, 207, 217, 1)',
                                    'rgba(180, 184, 191, 1)'
                                ],
                                datalabels: {
                                    display: false,
                                },
                            }
                        ],

                    },
                    options: prv_doughnutOptions,

                });
            }
            
            var prv_doughnut6 = document.getElementById('doughnut6');

            var prvData8 = [58.9, 8.4, 4.7, 18.9];

            if(prv_doughnut6){
                new Chart(prv_doughnut6, {
                    data: {
                        labels: ['서울특별시', '경기도', '대전광역시','기타'],
                        datasets: [
                            {
                                type: 'doughnut',
                                data: prvData8,
                                backgroundColor: [
                                    'rgba(53, 53, 156, 1)',
                                    'rgba(105, 145, 255, 1)',
                                    'rgba(66, 207, 217, 1)',
                                    'rgba(180, 184, 191, 1)'
                                ],
                                datalabels: {
                                    display: false,
                                },
                            }
                        ],

                    },
                    options: prv_doughnutOptions,

                });
            }
});