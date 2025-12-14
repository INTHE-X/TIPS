$(window).on('load', function(){
    setTimeout(function() {
        initAllCharts();
    }, 8600); 
});

function initAllCharts() {
    Chart.register(ChartDataLabels);
    Chart.defaults.defaultFontFamily = "Pretendard";

    var subWideTable = $('.sub_wideTable, .distr_graph, .company_list_scroll');

    function setHeightSubWideTableHead(){
        subWideTable.each(function(){
            var width = $(this).children('table').innerWidth();
            var sub_wideTableHead = $(this).children().find('thead');
            sub_wideTableHead.css({
                'width': width,
            });
        });
    }

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

            ctx.save();
            ctx.globalAlpha = state.dualLabelOpacity;
            
            const box1Y = barY - offset - boxHeight;
            ctx.fillStyle = options.label1?.backgroundColor || '#5F6B7F';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(barX - width / 2, box1Y, width, boxHeight, 999);
            else ctx.rect(barX - width / 2, box1Y, width, boxHeight);
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
            if (ctx.roundRect) ctx.roundRect(barX - width / 2, box2Y, width, boxHeight, 999);
            else ctx.rect(barX - width / 2, box2Y, width, boxHeight);
            ctx.fill();

            ctx.fillStyle = options.label2?.color || '#FFFFFF';
            ctx.font = '700 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(options.label2?.text || 'Label 2', barX, box2Y + boxHeight / 2);

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
        
        // afterDatasetsDraw → afterDraw로 변경
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
            
            const isComplete = progress >= totalPoints - 1;
            const fullSegments = isComplete ? totalPoints - 1 : Math.floor(progress);
            const partialProgress = isComplete ? 1 : progress - Math.floor(progress);
            
            ctx.save();
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
                    ctx.lineTo(x, y);
                }
            }
            
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
                    
                    ctx.lineTo(currentX, currentY);
                }
            }
            
            ctx.stroke();
            
            const pointsToDrawCount = isComplete ? totalPoints - 1 : fullSegments;
            
            for (let i = 0; i <= pointsToDrawCount; i++) {
                const point = points[i];
                if (!point) continue;
                
                const { x, y } = point.getProps(['x', 'y'], true);
                const isLast = i === totalPoints - 1;
                const radius = isLast ? 5 : 4;
                
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = dataset.borderColor || '#6E42D9';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = isLast ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.6)';
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
        onHover: function(event, activeElements, chart) {
            // 콜백이 등록된 차트만 커서 변경
            if (!chartTabCallbacks.has(chart)) return;
            
            const rect = chart.canvas.getBoundingClientRect();
            const x = event.native.clientX - rect.left;
            const chartArea = chart.chartArea;
            
            if (x >= chartArea.left && x <= chartArea.right) {
                event.native.target.style.cursor = 'pointer';
            } else {
                event.native.target.style.cursor = 'default';
            }
        },
        onClick: function(event, activeElements, chart) {
            // 콜백이 등록된 차트만 처리
            const callback = chartTabCallbacks.get(chart);
            if (!callback) return;
            
            const rect = chart.canvas.getBoundingClientRect();
            const x = event.native.clientX - rect.left;
            const chartArea = chart.chartArea;
            
            if (x < chartArea.left || x > chartArea.right) return;
            
            const xScale = chart.scales.x;
            const labels = chart.data.labels;
            
            let clickedIndex = -1;
            let minDistance = Infinity;
            
            labels.forEach((label, index) => {
                const labelX = xScale.getPixelForValue(index);
                const distance = Math.abs(x - labelX);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    clickedIndex = index;
                }
            });
            
            if (clickedIndex >= 0) {
                callback(clickedIndex);
            }
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

    var prvChartScales = {
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

    var prvData1 = [0, 160, 102.6, 7.6, 141.2, 24.9, -0.4, 17.6, 33.3, 25, 20, 25];
    var prvData2 = [15, 9, 79, 85, 205, 256, 255, 300, 400, 500, 600, 750];

    // ========================================
    // 차트1 생성
    // ========================================
    const chart1 = document.getElementById('chart1');

    if (chart1) {
        const chart1Instance = createAnimatedChart(chart1, {
            plugins: [sharedDualLabelPlugin, sharedLastBarBgPlugin, sharedLineDrawPlugin],
            data: {
                labels: ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
                datasets: [
                    {
                        type: 'line',
                        label: '증감 (%)',
                        order: 0,
                        data: prvData1,
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
                        label: '기업(개)',
                        data: prvData2,
                        yAxisID: 'y2',
                        datalabels: {
                            display: function(context) {
                                const state = chartAnimationStates.get(context.chart);
                                if (!state || !state.barAnimationComplete) return false;
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
                    ...prvChartOptions.plugins,
                    tooltip: {
                        enabled: false
                    },
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
                    ...prvChartScales,
                    y1: {
                        type: 'linear',
                        position: 'right',
                        min: -50,
                        max: 200,
                        display: false,
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
                            crossAlign: 'far',
                        },
                    },
                },
            }
        });

        connectChartToTab(chart1Instance, '.company_list');
    }

    // ========================================
    // 차트2 생성
    // ========================================
    const prv_barLine2 = document.getElementById('prv_barLine2');

    var prvData02 = [5, 12, 21, 27, 46, 53, 58, 64, 75, 90, 118, 139]; 
    var prvData03 = [3, 3.3, 3.8, 3.1, 4.5, 4.8, 4.4, 4.7, 5.3, 5.6, 5.1, 5.4];

    if (prv_barLine2) {
        const chart2Instance = createAnimatedChart(prv_barLine2, {
            type: 'bar',
            plugins: [sharedDualLabelPlugin, sharedLastBarBgPlugin, sharedLineDrawPlugin],
            data: {
                labels: ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
                datasets: [
                    {
                        type: 'line',
                        label: '운영 기관 당 기업 선정(개)',
                        data: prvData03,
                        animation: false,
                        order: 0,
                        yAxisID: 'y1',
                        clip: { left: 5, top: false, right: 5, bottom: 5 },
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
                        label: '운영 기관',
                        data: prvData02,
                        yAxisID: 'y2',
                        animation: false,
                        datalabels: {
                            display: function(context) {
                                const state = chartAnimationStates.get(context.chart);
                                if (!state || !state.barAnimationComplete) return false;
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
                        backgroundColor: prvData02.map((item, index) => {
                            if (index === prvData02.length - 1) {
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
                    ...prvChartOptions.plugins,
                    tooltip: {
                        enabled: false
                    },
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
                    ...prvChartScales,
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

    // ========================================
    // 도넛 차트 플러그인
    // ========================================

    const innerExpandPlugin = {
        id: 'innerExpand',
        beforeDraw(chart) {
            const meta = chart.getDatasetMeta(0);
            const activeElements = chart.getActiveElements();
            const dataset = chart.data.datasets[0];
            
            // 현재 innerRadius 가져오기
            const currentInner = meta.data[0]?.innerRadius;
            
            // 유효한 값일 때만 저장 (0보다 크고, 기존 값보다 클 때)
            if (currentInner > 0 && (!chart._originalInnerRadius || currentInner > chart._originalInnerRadius)) {
                chart._originalInnerRadius = currentInner;
            }
            
            // 아직 유효한 값이 없으면 스킵
            if (!chart._originalInnerRadius) {
                return;
            }
            
            // 각 arc의 현재 애니메이션 값 저장 객체
            if (!chart._arcAnimations) {
                chart._arcAnimations = {};
            }
            
            const originalInner = chart._originalInnerRadius;
            const expandAmount = 6;
            const easingSpeed = 0.15;
            
            meta.data.forEach((arc, index) => {
                const isHovered = activeElements.some(el => el.index === index);
                const targetOffset = isHovered ? expandAmount : 0;
                
                if (chart._arcAnimations[index] === undefined) {
                    chart._arcAnimations[index] = 0;
                }
                
                const currentOffset = chart._arcAnimations[index];
                chart._arcAnimations[index] += (targetOffset - currentOffset) * easingSpeed;
                
                arc.innerRadius = originalInner - chart._arcAnimations[index];
                arc.options.backgroundColor = dataset.backgroundColor[index];
            });
            
            const isAnimating = meta.data.some((_, index) => {
                const current = chart._arcAnimations[index];
                const isHovered = activeElements.some(el => el.index === index);
                const target = isHovered ? expandAmount : 0;
                return Math.abs(target - current) > 0.1;
            });
            
            if (isAnimating) {
                requestAnimationFrame(() => chart.draw());
            }
        }
    };

    var prv_doughnutOptions = {
        maintainAspectRatio: false,
        hover: {
            mode: 'nearest',
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,  // ← 기본 tooltip 비활성화
                external: function(context) {
                    // Tooltip Element
                    let tooltipEl = document.getElementById('chartjs-tooltip');

                    // 툴팁 요소가 없으면 생성
                    if (!tooltipEl) {
                        tooltipEl = document.createElement('div');
                        tooltipEl.id = 'chartjs-tooltip';
                        tooltipEl.style.cssText = `
                            position: absolute;
                            background: #000;
                            color: white;
                            border-radius: 6px;
                            pointer-events: none;
                            opacity: 0;
                            transition: opacity 0.2s;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                            z-index: 1000;
                        `;
                        document.body.appendChild(tooltipEl);
                    }

                    const tooltipModel = context.tooltip;

                    // 툴팁 숨기기
                    if (tooltipModel.opacity === 0) {
                        tooltipEl.style.opacity = '0';
                        return;
                    }

                    // 내용 설정
                    if (tooltipModel.body) {
                        const dataIndex = tooltipModel.dataPoints[0].dataIndex;
                        const value = tooltipModel.dataPoints[0].raw;
                        const label = tooltipModel.dataPoints[0].label;
                        const bgColor = tooltipModel.dataPoints[0].dataset.backgroundColor[dataIndex];

                        tooltipEl.style.background = bgColor;
                        tooltipEl.innerHTML = `
                            <div style="padding: 10px 14px; text-align: center;">
                                <div style="font-size: 13px; font-weight: 600; font-family: 'Clash Grotesk', sans-serif; margin-bottom: 1px;">
                                    ${value}%
                                </div>
                                <div style="font-size: 13px; font-weight: 500;">
                                    ${label}
                                </div>
                            </div>
                        `;
                    }

                    // 위치 설정
                    const position = context.chart.canvas.getBoundingClientRect();
                    tooltipEl.style.opacity = '1';
                    tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                    tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                }
            }
        },
        layout: {
            padding: 0
        },
        borderWidth: 0,
        cutout: '80%',
    };

    // ========================================
    // 도넛 차트 1
    // ========================================
    const prv_doughnut1 = document.getElementById('doughnut1');
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
            plugins: [innerExpandPlugin],
        });
    }

    // ========================================
    // 도넛 차트 2
    // ========================================
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
            plugins: [innerExpandPlugin],
        });
    }

    // ========================================
    // 도넛 차트 3
    // ========================================
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
            plugins: [innerExpandPlugin],
        });
    }

    // ========================================
    // 도넛 차트 4
    // ========================================
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
            plugins: [innerExpandPlugin],
        });
    }

    // ========================================
    // 도넛 차트 5
    // ========================================
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
            plugins: [innerExpandPlugin],
        });
    }

    // ========================================
    // 도넛 차트 6
    // ========================================
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
            plugins: [innerExpandPlugin],
        });
    }
}