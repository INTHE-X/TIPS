$(document).ready(function(){
            Chart.register(ChartDataLabels);

            Chart.defaults.defaultFontFamily = "Noto Sans KR";

            const chart1 = document.getElementById('chart1');

            var prvChartOptions = {
                maintainAspectRatio: false,
                    responsive: true,
                    hover: {
                        mode: null,
                    },

                    plugins: {
                        legend: {
                            display: false,
                        },
                    }
                }

                var prvChartScales = {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        min: 0,
                        max: 200,
                        display: false,
                        border: {
                            display: false,
                        },
                    },
                }
                
                var prvData1 = [5, 12, 19, 23, 44, 50, 49, 54, 80, 120, 117];
                var prvData2 = [39, 79, 85, 205, 256, 255, 300, 400, 500, 600, 750];

                if(chart1){
new Chart(chart1, {
                data: {
                    labels: ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
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
                                color: 'rgba(178, 185, 199, 1)',
                                anchor: 'end',
                                align: 'end',
                                offset: 6,
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
                    scales: {
                        ...prvChartScales,
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
                                min: 0
                            },
                        },
                    },
                }
                    
            });
                }
            

            var prv_barLine2 = document.getElementById('prv_barLine2');

            var prvData2 = [5, 12, 19, 23, 44, 50, 49, 54, 80, 102, 139]; 

            if(prv_barLine2){
new Chart(prv_barLine2, {
                data: {
                    labels: ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
                    datasets: [
                        {
                            type: 'line',
                            label: '운영 기관 당 기업 선정',
                            data: prvData2,
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
                            label: '운영 기관',
                            data: prvData2,
                            yAxisID: 'y2',
                            datalabels: {
                                color: 'rgba(178, 185, 199, 1)',
                                anchor: 'end',
                                align: 'end',
                                offset: 6,
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
                    scales: {
                        ...prvChartScales,
                        y2: {
                            type: 'linear',
                            position: 'left',
                            min: 0,
                            max: 150,
                            border: {
                                display: false,
                            },
                            ticks: {
                                padding: 15,
                                color: "rgba(178, 185, 199, 1)",
                                stepSize: 30,
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
                        callbacks: {
                            label: function(context) {
                                return [
                                context.label,           
                                context.raw + '%'        
                            ];
                            }
                        }
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