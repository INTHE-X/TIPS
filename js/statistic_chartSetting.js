$(window).on('load', function(){
    Chart.register(ChartDataLabels);
    Chart.defaults.defaultFontFamily = "Pretendard";

    var stcChartOption1 = {
        maintainAspectRatio: false,
        responsive: true,
        hover: {
            mode: null,
        },
        indexAxis: 'y',
        plugins: {
        legend: {
            display: false,
        },

        datalabels: {
            color: function(context) {
                return context.dataIndex === 0 ? '#FFFFFF' : '#5E5E5E';
            },
            anchor: 'end',
            align: 'end',
            offset: 4,
            font: {
                weight: 600,
                size: 13,
                family: 'Clash Grotesk, sans-serif',
            },
                backgroundColor: function(context) {
                    return context.dataIndex === 0 ? '#5F6B7F' : null;
                },
                borderRadius: function(context) {
                    return context.dataIndex === 0 ? 999 : 0;
                },
                padding: function(context) {
                    return context.dataIndex === 0 ? { top: 4, bottom: 4, left: 8, right: 8 } : 0;
                }
        },
    }

    }


    const stcChart1 = document.getElementById('statistic_chart1');

    if (!stcChart1) return;

    const canvas1 = stcChart1;
    const ctx1 = canvas1.getContext('2d');

    const width = canvas1.width || canvas1.offsetWidth || 400;

    var gradient1 = ctx1.createLinearGradient(0, 0, width, 0);
    gradient1.addColorStop(0, '#909EB7');
    gradient1.addColorStop(1, '#5F6B7F');

    var stcData1 = [1632, 588, 284, 137, 114, 99, 97, 92, 82, 66, 65, 62, 58, 51, 47, 22, 19];

    if(stcChart1){
        new Chart(stcChart1, {
            data: {
                labels: ['서울특별시', '경기도', '대전광역시', '부산광역시', '대구광역시', '경상북도', '인천광역시', '충청남도', '강원특별자치도', '경상남도', '광주광역시', '제주특별자치도', '충청북도', '전북특별자치도', '울산광역시', '세종특별자치시', '전라남도'],
                datasets: [
                    {
                        type: 'bar',
                        data: stcData1,
                        borderRadius: 8,
                        borderSkipped: false,
                        backgroundColor: stcData1.map((item, index) => 
                            index === 0 ? gradient1 : 'rgba(178, 185, 199, 0.5)'
                        ), 
                    }
                ]
            },
            options: {
                ...stcChartOption1,
                    layout: {
                        padding: {
                            right: 10
                        }
                    },
                scales: {
                    x: {
                        min: 0,
                        max: 2000,
                        ticks: {
                            stepSize: 200,
                            display: false
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.06)',
                        },
                        border: {
                            display: false,
                        }
                    },

                    y: {
                      grid: {
                        display: false,
                      },
                      border: {
                        display: false,
                      },
                      ticks: {
                        color: function(context) {
                            return context.index === 0 ? '#8059E0' : 'rgba(178, 185, 199, 1)';
                        },

                        crossAlign: 'far',
                        font: function(context) {
                            return {
                                weight: context.index === 0 ? 700 : 600,
                            };
                        },
                      }
                      
                    }
                }
            }

        }); 
    }

    const stcChart2 = document.getElementById('statistic_chart2');

    if (!stcChart2) return;

    const canvas2 = stcChart2;
    const ctx2 = canvas2.getContext('2d');

    const width2 = canvas2.width || canvas2.offsetWidth || 400;

    var gradient1 = ctx2.createLinearGradient(0, 0, width2, 0);
    gradient1.addColorStop(0, '#909EB7');
    gradient1.addColorStop(1, '#5F6B7F');

    var stcData2 = [1754, 882, 587, 161, 22, 19, 15, 5, 5, 5, 4, 4, 4, 4, 3, 2, 1];

    if(stcChart2){
        new Chart(stcChart2, {
            data: {
                labels: ['정보통신업', '제조업', '전문, 과학 및 기술', '도매 및 소매업', '사업시설 관리', '교육 서비스업', '농업, 임업 및 어업', '금융 및 보험업', '예술, 스포츠', '협회 및 단체', '광업', '수도, 하수 및 폐기물', '건설업', '운수 및 창고업', '부동산업', '보건업 및 사회복지', '숙박 및 음식점업'],
                datasets: [
                    {
                        type: 'bar',
                        data: stcData2,
                        borderRadius: 8,
                        borderSkipped: false,
                        backgroundColor: stcData2.map((item, index) => 
                            index === 0 ? gradient1 : 'rgba(178, 185, 199, 0.5)'
                        ), 
                    }
                ]
            },
            options: {
                ...stcChartOption1,
                layout: {
                        padding: {
                            right: 10
                        }
                    },
                scales: {
                    x: {
                        min: 0,
                        max: 2000,
                        ticks: {
                            stepSize: 200,
                            display: false
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.06)',
                        },
                        border: {
                            display: false,
                        }
                    },

                    y: {
                      grid: {
                        display: false,
                      },
                      border: {
                        display: false,
                      },
                      ticks: {
                        color: function(context) {
                            return context.index === 0 ? '#8059E0' : 'rgba(178, 185, 199, 1)';
                        },

                        crossAlign: 'far',
                        font: function(context) {
                            return {
                                weight: context.index === 0 ? 700 : 600,
                            };
                        },
                      }
                      
                    }
                }
            }

        }); 
    }

    const stcChart3 = document.getElementById('statistic_chart3');

    if (!stcChart3) return;

    const canvas3 = stcChart3;
    const ctx3 = canvas3.getContext('2d');

    const width3 = canvas3.width || canvas3.offsetWidth || 400;

    var gradient1 = ctx3.createLinearGradient(0, 0, width3, 0);
    gradient1.addColorStop(0, '#909EB7');
    gradient1.addColorStop(1, '#5F6B7F');

    var stcData3 = [2068, 695, 106, 93, 89, 73, 37, 31, 27, 2];

    if(stcChart3){
        new Chart(stcChart3, {
            data: {
                labels: ['데이터/네트워크/AI', '바이오헬스', '에너지', '로보틱스', '친환경', '반도체', '신소재', '모빌리티', '우주항공해양', '양자기술'],
                datasets: [
                    {
                        type: 'bar',
                        data: stcData3,
                        borderRadius: 8,
                        borderSkipped: false,
                        backgroundColor: stcData2.map((item, index) => 
                            index === 0 ? gradient1 : 'rgba(178, 185, 199, 0.5)'
                        ), 
                    }
                ]
            },
            options: {
                ...stcChartOption1,
                layout: {
                        padding: {
                            right: 50
                        }
                    },
                scales: {
                    x: {
                        min: 0,
                        max: 2200,
                        ticks: {
                            stepSize: 200,
                            display: false
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.06)',
                        },
                        border: {
                            display: false,
                        }
                    },

                    y: {
                      grid: {
                        display: false,
                      },
                      border: {
                        display: false,
                      },
                      ticks: {
                        color: function(context) {
                            return context.index === 0 ? '#8059E0' : 'rgba(178, 185, 199, 1)';
                        },

                        crossAlign: 'far',
                        font: function(context) {
                            return {
                                weight: context.index === 0 ? 700 : 600,
                            };
                        },
                      }
                      
                    }
                }
            }

        }); 
    }
});