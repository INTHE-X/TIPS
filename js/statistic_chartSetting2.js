$(window).on('load', function(){

        Chart.register(ChartDataLabels);
    Chart.defaults.defaultFontFamily = "Pretendard";
// ========================================
// 공유 가능한 차트 애니메이션 시스템
// ========================================

// WeakMap을 사용하여 각 차트 인스턴스별 상태 저장
const chartAnimationStates = new WeakMap();

// 차트 인스턴스별 애니메이션 상태 초기화
function initChartAnimationState(chart) {
    if (!chartAnimationStates.has(chart)) {
        chartAnimationStates.set(chart, {
            barAnimationComplete: false,
            lineAnimationStarted: false,
            dualLabelAnimationStarted: false,
            dualLabelOpacity: 0
        });
    }
    return chartAnimationStates.get(chart);
}

// ========================================
// 공유 플러그인들
// ========================================

const sharedDualLabelPlugin = {
    id: 'dualLabel',
    afterDraw: function(chart, args, options) {
        if (!options || !options.enabled) return;
        
        const state = chartAnimationStates.get(chart);
        if (!state || !state.barAnimationComplete) return;
        if (state.dualLabelOpacity <= 0) return;

        const ctx = chart.ctx;
        let datasetIndex = chart.data.datasets.findIndex(d => d.type === 'bar');
        if (datasetIndex === -1) datasetIndex = 0;
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
        const horizontalPadding = 12; // 좌우 여백

        ctx.save();
        ctx.globalAlpha = state.dualLabelOpacity;
        
        // ========================================
        // Label 1 (하단 레이블)
        // ========================================
        const text1 = options.label1?.text || chart.data.datasets[datasetIndex].data[lastIndex];
        
        // 텍스트 너비 측정
        ctx.font = '700 12px sans-serif';
        const text1Width = ctx.measureText(text1).width;
        const box1Width = text1Width + (horizontalPadding * 2);
        
        const box1Y = barY - offset - boxHeight;
        ctx.fillStyle = options.label1?.backgroundColor || '#5F6B7F';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(barX - box1Width / 2, box1Y, box1Width, boxHeight, 999);
        } else {
            ctx.rect(barX - box1Width / 2, box1Y, box1Width, boxHeight);
        }
        ctx.fill();

        ctx.fillStyle = options.label1?.color || '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text1, barX, box1Y + boxHeight / 2);

        // ========================================
        // Label 2 (상단 레이블)
        // ========================================
        const text2 = options.label2?.text || 'Label 2';
        
        // 텍스트 너비 측정
        const text2Width = ctx.measureText(text2).width;
        const box2Width = text2Width + (horizontalPadding * 2);
        
        const box2Y = box1Y - gap - boxHeight;
        ctx.fillStyle = options.label2?.backgroundColor || '#8059E0';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(barX - box2Width / 2, box2Y, box2Width, boxHeight, 999);
        } else {
            ctx.rect(barX - box2Width / 2, box2Y, box2Width, boxHeight);
        }
        ctx.fill();

        ctx.fillStyle = options.label2?.color || '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text2, barX, box2Y + boxHeight / 2);

        ctx.restore();
    }
};

const sharedLastBarBgPlugin = {
    id: 'lastBarBg',
    beforeDatasetsDraw: function(chart, args, options) {
        if (!options || !options.enabled) return;

        const ctx = chart.ctx;
        const chartArea = chart.chartArea;

        let barDatasetIndex = chart.data.datasets.findIndex(d => d.type === 'bar');
        if (barDatasetIndex === -1) return;

        const meta = chart.getDatasetMeta(barDatasetIndex);
        if (!meta.data.length) return;

        const lastIndex = meta.data.length - 1;
        const bar = meta.data[lastIndex];
        const { x, width } = bar.getProps(['x', 'width'], true);

        const padding = options.padding || 10;

        ctx.save();
        ctx.fillStyle = options.backgroundColor || 'rgba(95, 107, 127, 0.1)';

        const bgX = x - width / 2 - padding;
        const bgWidth = width + padding * 2;
        const bgY = chartArea.top;
        const bgHeight = chartArea.bottom - chartArea.top;

        ctx.beginPath();
        ctx.rect(bgX, bgY, bgWidth, bgHeight);
        ctx.fill();
        ctx.restore();
    }
};

const sharedLineDrawPlugin = {
    id: 'lineDraw',
    
    beforeDatasetsDraw: function(chart, args, options) {
        if (!options || !options.enabled) return;
        
        const state = chartAnimationStates.get(chart);
        
        // 라인 데이터셋 항상 숨김 (직접 그릴 것이므로)
        const lineDatasetIndex = chart.data.datasets.findIndex(d => d.type === 'line');
        if (lineDatasetIndex !== -1) {
            const meta = chart.getDatasetMeta(lineDatasetIndex);
            if (meta) {
                meta.hidden = true;
            }
        }
    },
    
    afterDraw: function(chart, args, options) {
        if (!options || !options.enabled) return;
        
        const state = chartAnimationStates.get(chart);
        if (!state || !state.lineAnimationStarted) return;
        
        const ctx = chart.ctx;
        const progress = options.progress || 0;
        const totalPoints = chart.data.labels.length;
        
        if (progress <= 0) return;
        
        const lineDatasetIndex = chart.data.datasets.findIndex(d => d.type === 'line');
        if (lineDatasetIndex === -1) return;
        
        const dataset = chart.data.datasets[lineDatasetIndex];
        const meta = chart.getDatasetMeta(lineDatasetIndex);
        
        if (!meta || !meta.data || meta.data.length === 0) return;
        
        const points = meta.data;
        const chartArea = chart.chartArea;
        
        const isComplete = progress >= totalPoints - 1;
        const fullSegments = isComplete ? totalPoints - 1 : Math.floor(progress);
        const partialProgress = isComplete ? 1 : progress - Math.floor(progress);
        
        ctx.save();
        
        const tension = options.tension !== undefined ? options.tension : 0.4;
        
        // ========================================
        // 그라데이션 배경 그리기
        // ========================================
        if (options.gradient !== false) {
            // 그라데이션 생성 (위에서 아래로)
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, options.gradientColorStart || 'rgba(110, 66, 217, 0.2)');
            gradient.addColorStop(1, options.gradientColorEnd || 'rgba(110, 66, 217, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            
            // 라인 경로 그리기 (위쪽)
            for (let i = 0; i <= fullSegments; i++) {
                const point = points[i];
                if (!point) continue;
                
                const { x, y } = point.getProps(['x', 'y'], true);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    const prevPoint = points[i - 1];
                    const { x: prevX, y: prevY } = prevPoint.getProps(['x', 'y'], true);
                    
                    const cp1x = prevX + (x - prevX) * tension;
                    const cp1y = prevY;
                    const cp2x = x - (x - prevX) * tension;
                    const cp2y = y;
                    
                    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
                }
            }
            
            // 부분 진행 중인 세그먼트
            if (!isComplete && fullSegments < totalPoints - 1 && partialProgress > 0) {
                const startPoint = points[fullSegments];
                const endPoint = points[fullSegments + 1];
                
                if (startPoint && endPoint) {
                    const startX = startPoint.getProps(['x'], true).x;
                    const startY = startPoint.getProps(['y'], true).y;
                    const endX = endPoint.getProps(['x'], true).x;
                    const endY = endPoint.getProps(['y'], true).y;
                    
                    const currentX = startX + (endX - startX) * partialProgress;
                    const currentY = startY + (endY - startY) * partialProgress;
                    
                    const cp1x = startX + (endX - startX) * tension;
                    const cp1y = startY;
                    const cp2x = currentX - (currentX - startX) * tension;
                    const cp2y = currentY;
                    
                    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, currentX, currentY);
                }
            }
            
            // 아래쪽으로 닫기 (차트 바닥까지)
            const lastDrawnPoint = !isComplete && partialProgress > 0 ? fullSegments + 1 : fullSegments;
            if (points[lastDrawnPoint]) {
                const { x: lastX } = points[lastDrawnPoint].getProps(['x'], true);
                ctx.lineTo(lastX, chartArea.bottom);
            }
            
            if (points[0]) {
                const { x: firstX } = points[0].getProps(['x'], true);
                ctx.lineTo(firstX, chartArea.bottom);
            }
            
            ctx.closePath();
            ctx.fill();
        }
        
        // ========================================
        // 라인 그리기
        // ========================================
        ctx.strokeStyle = dataset.borderColor || '#6E42D9';
        ctx.lineWidth = dataset.borderWidth || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        
        for (let i = 0; i <= fullSegments; i++) {
            const point = points[i];
            if (!point) continue;
            
            const { x, y } = point.getProps(['x', 'y'], true);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                const prevPoint = points[i - 1];
                const { x: prevX, y: prevY } = prevPoint.getProps(['x', 'y'], true);
                
                const cp1x = prevX + (x - prevX) * tension;
                const cp1y = prevY;
                const cp2x = x - (x - prevX) * tension;
                const cp2y = y;
                
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            }
        }
        
        // 부분 진행 중인 세그먼트
        if (!isComplete && fullSegments < totalPoints - 1 && partialProgress > 0) {
            const startPoint = points[fullSegments];
            const endPoint = points[fullSegments + 1];
            
            if (startPoint && endPoint) {
                const startX = startPoint.getProps(['x'], true).x;
                const startY = startPoint.getProps(['y'], true).y;
                const endX = endPoint.getProps(['x'], true).x;
                const endY = endPoint.getProps(['y'], true).y;
                
                const currentX = startX + (endX - startX) * partialProgress;
                const currentY = startY + (endY - startY) * partialProgress;
                
                const cp1x = startX + (endX - startX) * tension;
                const cp1y = startY;
                const cp2x = currentX - (currentX - startX) * tension;
                const cp2y = currentY;
                
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, currentX, currentY);
            }
        }
        
        ctx.stroke();
        
        // ========================================
        // 마지막 포인트만 그리기
        // ========================================
        const lastPointIndex = totalPoints - 1;
        const lastPoint = points[lastPointIndex];
        
        if (lastPoint && isComplete) {
            const { x, y } = lastPoint.getProps(['x', 'y'], true);
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = dataset.borderColor || '#6E42D9';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        ctx.restore();
    }
};

// ========================================
// 공유 애니메이션 함수들
// ========================================

function startDualLabelAnimation(chart) {
    const state = initChartAnimationState(chart);
    if (state.dualLabelAnimationStarted) return;
    state.dualLabelAnimationStarted = true;
    
    const duration = 500;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        state.dualLabelOpacity = 1 - Math.pow(1 - progress, 2);
        chart.update('none');
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            state.dualLabelOpacity = 1;
            chart.update('none');
        }
    }
    
    requestAnimationFrame(animate);
}

function startLineAnimation(chart) {
    const state = initChartAnimationState(chart);
    if (state.lineAnimationStarted) return;
    state.lineAnimationStarted = true;
    
    const totalPoints = chart.data.labels.length;
    const duration = 3000;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const eased = 1 - Math.pow(1 - progress, 4);
        const lineProgress = eased * (totalPoints - 1);
        
        chart.options.plugins.lineDraw.progress = lineProgress;
        chart.update('none');
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            chart.options.plugins.lineDraw.progress = totalPoints;
            chart.update('none');
            startDualLabelAnimation(chart);
        }
    }
    
    requestAnimationFrame(animate);
}

// ========================================
// 차트 생성 헬퍼 함수
// ========================================

function createAnimatedChart(element, config) {
    const chart = new Chart(element, config);
    initChartAnimationState(chart);
    return chart;
}

// ========================================
// 공통 차트 옵션
// ========================================

const chartTabCallbacks = new WeakMap();

var statChartOptions1 = {
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
};

// .company_list가 여러 개인 경우
function connectChartToTab(chart, tabSelector) {
    chartTabCallbacks.set(chart, function(index) {
        $(`${tabSelector}`).eq(index).addClass('active').siblings().removeClass('active');
        setTimeout(function() {
            setHeightSubWideTableHead();
        }, 1);
    });
}


var statChartScales = {
    x: {
        grid: {
            display: false,
        },
        border: {
            display: false,
        },
        ticks: {
            color: '#5e5e5e',
            font: {
                weight: 600,
            }
        }
    },
};



var statData1 = [0.6, 0.5, 1.1, 1.4, 2.4, 3.3, 4.6, 6.6, 9.1, 11.5, 13.8, 20];
var statData2 = [18, 33, 168, 459, 2002, 3927, 7788, 14359, 23673, 33202, 40407, 45864];


// ========================================
// 차트1 생성
// ========================================
const stat_chart1 = document.getElementById('stat_chart1');

if (stat_chart1) {
    const chart1Instance = createAnimatedChart(stat_chart1, {
        plugins: [sharedDualLabelPlugin, sharedLastBarBgPlugin, sharedLineDrawPlugin],
        data: {
            labels: ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            datasets: [
                {
                    type: 'line',
                    label: '평균 (%)',
                    order: 0,
                    data: statData1,
                    hidden: true,
                    animation: false,
                    clip: { left: 5, top: 100, right: 5, bottom: 5 },
                    yAxisID: 'y1',
                    datalabels: {
                        display: false,
                    },
                    borderColor: '#6E42D9',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 4,
                    pointBackgroundColor: '#6E42D9',
                    pointBorderColor: 'rgba(255, 255, 255, 0.6)',
                    pointBorderWidth: 2,
                    pointStyle: function(context) {
                        return context.dataIndex === context.dataset.data.length - 1 ? 'circle' : 'circle';
                    },
                    pointRadius: function(context) {
                        return context.dataIndex === context.dataset.data.length - 1 ? 5 : 4;
                    },
                    pointBorderColor: function(context) {
                        return context.dataIndex === context.dataset.data.length - 1 
                            ? 'rgba(255, 255, 255, 1)' 
                            : 'rgba(255, 255, 255, 0.6)';
                    },
                },
                {
                    type: 'bar',
                    label: '총합',
                    data: statData2,
                    yAxisID: 'y2',
                    datalabels: {
                        display: false,
                    },
                    // datalabels: {
                    //     display: function(context) {
                    //         const state = chartAnimationStates.get(context.chart);
                    //         if (!state || !state.barAnimationComplete) return false;
                    //         return context.dataIndex !== context.dataset.data.length - 1;
                    //     },
                    //     offset: 4,
                    //     align: 'end',
                    //     anchor: 'end',
                    //     color: 'rgba(178, 185, 199, 1)',
                    //     font: {
                    //         weight: 600,
                    //         size: 13,
                    //     },
                    // },
                    backgroundColor: statData2.map((item, index) => {
                        if (index === statData2.length - 1) {
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
            ...statChartOptions1,
            layout: {
                padding: {
                    top: 60, 
                    right: 10,
                    bottom: 0,
                    left: 0
                }
            },
            animation: {
                duration: 1200,
                easing: 'easeOutQuart',
                delay: (context) => {
                    // ★ bar 차트만 애니메이션 적용
                    if (context.type === 'data' && context.dataset.type === 'bar') {
                        return context.dataIndex * 75;
                    }
                    return 0;
                },
                y: {
                    from: (ctx) => {
                        // ★ bar 차트만 y축 애니메이션 적용
                        if (ctx.type === 'data' && ctx.dataset.type === 'bar') {
                            return ctx.chart.chartArea?.bottom || 0;
                        }
                    }
                },
                onComplete: function(animation) {
                    const state = chartAnimationStates.get(animation.chart);
                    if (state && !state.barAnimationComplete) {
                        state.barAnimationComplete = true;
                        startLineAnimation(animation.chart);
                    }
                }
            },
            plugins: {
                ...statChartOptions1.plugins,
                tooltip: {
                    enabled: false
                },
                    lineDraw: {
                        enabled: true,
                        progress: 0,
                        tension: 0.5  // 이 값을 조절 (0~1)
                    },
                datalabels: {
                    display: false
                },
                dualLabel: {
                    enabled: true,
                    label1: {
                        text: '45,864',
                        backgroundColor: '#5F6B7F',
                        color: '#FFFFFF',
                    },
                    label2: {
                        text: '20%',
                        backgroundColor: '#8059E0',
                        color: '#FFFFFF',
                    }
                },
                lastBarBg: {
                    enabled: true,
                    backgroundColor: 'rgba(95, 107, 127, 0.15)',
                    padding: 12,
                    borderRadius: 0,
                },
                lineDraw: {
                    enabled: true,
                    progress: 0,
                }
            },
            scales: {
                ...statChartScales,
                y1: {
                    type: 'linear',
                    position: 'right',
                    min: 0,
                    max: 20,
                    display: true,
                    grid: {
                        display: false,
                    },
                    border: {
                        display: false,
                    },
                    ticks: {
                    padding: 15,
                    color: "rgba(178, 185, 199, 1)",
                    crossAlign: 'far',
                    font: {
                        weight: 600,
                    },
                    callback: function(value) {
                        return value + '%';  // % 기호 추가
                    }
                },
                },
                y2: {
                    type: 'linear',
                    position: 'left',
                    min: 0,
                    max: 50000,
                    border: {
                        display: false,
                    },
                    ticks: {
                        padding: 15,
                        color: "rgba(178, 185, 199, 1)",
                        stepSize: 5000,
                        crossAlign: 'far',
                    },
                },
            },
        }
    });

}

var statData3 = [-5, -39, -119, -414, -2188, -4225, -7820, -11981, -20254, -32482, -32867, -28803];
var statData4 = [-0.2, -0.5, -0.8, -1.2, -2.6, -3.6, -4.6, -5.5, -7.8, -11.3, -11.2, -12.6];

const stat_chart2 = document.getElementById('stat_chart2');

if (stat_chart2) {
    const chart1Instance = createAnimatedChart(stat_chart2, {
        plugins: [sharedDualLabelPlugin, sharedLastBarBgPlugin, sharedLineDrawPlugin],
        data: {
            labels: ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
            datasets: [
                {
                    type: 'line',
                    label: '평균 (%)',
                    order: 0,
                    data: statData3,
                    hidden: true,
                    animation: false,
                    clip: { left: 5, top: 100, right: 5, bottom: 5 },
                    yAxisID: 'y1',
                    datalabels: {
                        display: false,
                    },
                    borderColor: '#6E42D9',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 4,
                    pointBackgroundColor: '#6E42D9',
                    pointBorderColor: 'rgba(255, 255, 255, 0.6)',
                    pointBorderWidth: 2,
                    pointStyle: function(context) {
                        return context.dataIndex === context.dataset.data.length - 1 ? 'circle' : 'circle';
                    },
                    pointRadius: function(context) {
                        return context.dataIndex === context.dataset.data.length - 1 ? 5 : 4;
                    },
                    pointBorderColor: function(context) {
                        return context.dataIndex === context.dataset.data.length - 1 
                            ? 'rgba(255, 255, 255, 1)' 
                            : 'rgba(255, 255, 255, 0.6)';
                    },
                },
                {
                    type: 'bar',
                    label: '총합',
                    data: statData4,
                    yAxisID: 'y2',
                    datalabels: {
                        display: false,
                    },
                    // datalabels: {
                    //     display: function(context) {
                    //         const state = chartAnimationStates.get(context.chart);
                    //         if (!state || !state.barAnimationComplete) return false;
                    //         return context.dataIndex !== context.dataset.data.length - 1;
                    //     },
                    //     offset: 4,
                    //     align: 'end',
                    //     anchor: 'end',
                    //     color: 'rgba(178, 185, 199, 1)',
                    //     font: {
                    //         weight: 600,
                    //         size: 13,
                    //     },
                    // },
                    backgroundColor: statData4.map((item, index) => {
                        if (index === statData4.length - 1) {
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
            ...statChartOptions1,
            layout: {
                padding: {
                    top: 60, 
                    right: 10,
                    bottom: 0,
                    left: 0
                }
            },
            animation: {
                duration: 1200,
                easing: 'easeOutQuart',
                delay: (context) => {
                    // ★ bar 차트만 애니메이션 적용
                    if (context.type === 'data' && context.dataset.type === 'bar') {
                        return context.dataIndex * 75;
                    }
                    return 0;
                },
                y: {
                    from: (ctx) => {
                        // ★ bar 차트만 y축 애니메이션 적용
                        if (ctx.type === 'data' && ctx.dataset.type === 'bar') {
                            return ctx.chart.chartArea?.bottom || 0;
                        }
                    }
                },
                onComplete: function(animation) {
                    const state = chartAnimationStates.get(animation.chart);
                    if (state && !state.barAnimationComplete) {
                        state.barAnimationComplete = true;
                        startLineAnimation(animation.chart);
                    }
                }
            },
            plugins: {
                ...statChartOptions1.plugins,
                tooltip: {
                    enabled: false
                },
                    lineDraw: {
                        enabled: true,
                        progress: 0,
                        tension: 0.5  // 이 값을 조절 (0~1)
                    },
                datalabels: {
                    display: false
                },
                dualLabel: {
                    enabled: true,
                    label1: {
                        text: '45,864',
                        backgroundColor: '#5F6B7F',
                        color: '#FFFFFF',
                    },
                    label2: {
                        text: '20%',
                        backgroundColor: '#8059E0',
                        color: '#FFFFFF',
                    }
                },
                lastBarBg: {
                    enabled: true,
                    backgroundColor: 'rgba(95, 107, 127, 0.15)',
                    padding: 12,
                    borderRadius: 0,
                },
                lineDraw: {
                    enabled: true,
                    progress: 0,
                }
            },
            scales: {
                ...statChartScales,
                y1: {
                    type: 'linear',
                    position: 'right',
                    min: 0,
                    max: -20,
                    display: true,
                    grid: {
                        display: false,
                    },
                    border: {
                        display: false,
                    },
                    ticks: {
                    padding: 15,
                    color: "rgba(178, 185, 199, 1)",
                    crossAlign: 'far',
                    font: {
                        weight: 600,
                    },
                    callback: function(value) {
                        return value + '%';  // % 기호 추가
                    }
                },
                },
                y2: {
                    type: 'linear',
                    position: 'left',
                    min: 0,
                    max: -50000,
                    border: {
                        display: false,
                    },
                    ticks: {
                        padding: 15,
                        color: "rgba(178, 185, 199, 1)",
                        stepSize: -5000,
                        crossAlign: 'far',
                    },
                },
            },
        }
    });

}
});