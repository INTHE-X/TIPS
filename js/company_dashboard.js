// Inner Expand Plugin (안쪽으로만 확대) - 클릭 시 고정
const innerExpandPlugin = {
    id: 'innerExpand',
    beforeDraw(chart) {
        const meta = chart.getDatasetMeta(0);
        const activeElements = chart.getActiveElements();
        const dataset = chart.data.datasets[0];

        const currentInner = meta.data[0]?.innerRadius;

        if (currentInner > 0 && (!chart._originalInnerRadius || currentInner > chart._originalInnerRadius)) {
            chart._originalInnerRadius = currentInner;
        }

        if (!chart._originalInnerRadius) {
            return;
        }

        if (!chart._arcAnimations) {
            chart._arcAnimations = {};
        }

        // 클릭된 인덱스 저장 (전역)
        if (!chart._selectedIndex && chart._selectedIndex !== 0) {
            chart._selectedIndex = 0; // 초기값
        }

        const originalInner = chart._originalInnerRadius;
        const expandAmount = 3;
        const easingSpeed = 0.15;

        meta.data.forEach((arc, index) => {
            // 선택된 인덱스인지 확인
            const isSelected = index === chart._selectedIndex;
            const targetOffset = isSelected ? expandAmount : 0;

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
            const target = (index === chart._selectedIndex) ? expandAmount : 0;
            return Math.abs(target - current) > 0.1;
        });

        if (isAnimating) {
            requestAnimationFrame(() => chart.draw());
        }
    }
};

// 전역 변수로 선언
let successChart;
let factorsData;
let labelsData;

// 라벨과 도넛 차트 매핑 객체
const labelToDonutMapping = {
    'F1': 0,  // 추가 투자금 유치
    'F2': 1,  // 브랜드 홍보 전략
    'F3': 2,  // 높은 기술 준비도
    'F4': 3,  // 정부 출연금 확보
    'F5': 4,  // 외형 지표 가시화
    'F6': 5,  // 우수한 인재 유치
    'F7': 6,  // 해외 진출 활성화
    'F8': 7   // 초격차 기술 개발
};

// 도넛 인덱스를 라벨 텍스트로 역매핑
const donutToLabelMapping = {
    0: 'F1',  // 추가 투자금 유치
    1: 'F2',  // 브랜드 홍보 전략
    2: 'F3',  // 높은 기술 준비도
    3: 'F4',  // 정부 출연금 확보
    4: 'F5',  // 외형 지표 가시화
    5: 'F6',  // 우수한 인재 유치
    6: 'F7',  // 해외 진출 활성화
    7: 'F8'   // 초격차 기술 개발
};

// updateActiveItem을 전역 함수로 이동
function updateActiveItem(index, skipGauges = false) {
    const factorItems = document.querySelectorAll('.factor_item_new');
    factorItems.forEach(item => item.classList.remove('active'));
    factorItems[index].classList.add('active');

    const centerPercent = document.getElementById('donutCenterPercent');
    const centerLabel = document.getElementById('donutCenterLabel');

    // 페이드 아웃
    centerPercent.style.opacity = '0';
    centerLabel.style.opacity = '0';

    // 텍스트 변경 및 페이드 인
    setTimeout(() => {
        centerPercent.textContent = factorsData.values[index] + '%';
        centerLabel.textContent = factorsData.labels[index];

        // 선택된 섹션의 색상으로 변경 (퍼센트와 라벨 모두)
        centerPercent.style.setProperty('color', factorsData.colors[index], 'important');
        centerLabel.style.setProperty('color', factorsData.colors[index], 'important');

        centerPercent.style.opacity = '1';
        centerLabel.style.opacity = '1';
    }, 200);

    // 차트에 선택된 인덱스 저장
    if (successChart) {
        successChart._selectedIndex = index;
        successChart.update('none');
    }

    // 화살표 위치 업데이트
    updateArrowPosition(index);

    // radar_label 활성화 추가
    updateRadarLabel(index);

    // 테이블 업데이트 추가
    updateTableByDonutIndex(index);

    // 게이지 차트 업데이트 추가 (skipGauges가 false일 때만)
    if (!skipGauges) {
        const labelText = donutToLabelMapping[index];
        if (labelText && typeof updateGauges === 'function') {
            updateGauges(labelText);
        }
    }
}

// 도넛 인덱스로 테이블 업데이트하는 함수 추가
function updateTableByDonutIndex(donutIndex) {
    if (!labelsData) return;

    const labelText = donutToLabelMapping[donutIndex];
    const labelData = labelsData.find(l => l.text === labelText);

    if (labelData) {
        updateTableData(labelData.tableData, labelData.subtext);
    }
}

// radar_label 업데이트 함수 추가
function updateRadarLabel(donutIndex) {
    const labelText = donutToLabelMapping[donutIndex];
    if (!labelText) return;

    const allLabels = document.querySelectorAll('.radar_label');
    const radius = 250;

    allLabels.forEach((labelEl, index) => {
        const labelMainText = labelEl.querySelector('.radar_label_main')?.textContent;
        
        if (labelMainText === labelText) {
            // 모든 라벨 초기화
            allLabels.forEach((el, i) => {
                el.classList.remove('active');
                const angle = i * 45; // F1=0, F2=45, F3=90, ...
                const angleRad = (angle - 90) * Math.PI / 180;
                const ax = radius * Math.cos(angleRad);
                const ay = radius * Math.sin(angleRad);
                el.style.transform = `translate(calc(-50% + ${ax}px), calc(-50% + ${ay}px)) scale(1)`;
            });

            // 선택된 라벨 활성화
            labelEl.classList.add('active');
            const angle = index * 45;
            const angleRad = (angle - 90) * Math.PI / 180;
            const x = radius * Math.cos(angleRad);
            const y = radius * Math.sin(angleRad);
            labelEl.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.05)`;
        }
    });
}

function updateArrowPosition(index) {
    const arrow = document.querySelector('.donut_arrow');
    if (!arrow) {
        console.error('Arrow not found!');
        return;
    }

    const totalValue = factorsData.values.reduce((a, b) => a + b, 0);
    let currentAngle = -90;

    for (let i = 0; i < index; i++) {
        currentAngle += (factorsData.values[i] / totalValue) * 360;
    }

    const segmentAngle = (factorsData.values[index] / totalValue) * 360;
    const centerAngle = currentAngle + (segmentAngle / 2);

    arrow.style.transform = `translate(-50%, -50%) rotate(${centerAngle}deg)`;
}

// 테이블 업데이트 함수
function updateTableData(data, title) {
    const tableBody = document.querySelector('.table_body');
    const tableTitle = document.querySelector('.section_title_right');

    if (!tableBody) return;

    if (tableTitle) {
        tableTitle.textContent = title;
    }

    tableBody.innerHTML = '';

    data.forEach((row, rowIndex) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'table_row';

        let barColor = '#2F8DFF';
        if (row.score >= 90) barColor = '#2F8DFF';
        else if (row.score >= 70) barColor = '#2F8DFF';
        else if (row.score >= 50) barColor = '#42CFD9';
        else barColor = '#B4B8BF';

        rowEl.innerHTML = `
            <span class="row_label">${row.label}</span>
            <span class="row_value">${row.value}</span>
            <div class="row_bar">
                <div class="bar_fill"></div>
                <span class="bar_score">${row.score}</span>
            </div>
        `;

        tableBody.appendChild(rowEl);

        const barFill = rowEl.querySelector('.bar_fill');
        barFill.innerHTML = '';

        for (let i = 0; i < 10; i++) {
            const segment = document.createElement('span');
            segment.className = 'bar_segment';
            barFill.appendChild(segment);
        }

        setTimeout(() => {
            const segments = barFill.querySelectorAll('.bar_segment');
            const filledCount = row.barSegments;

            segments.forEach((segment, i) => {
                if (i < filledCount) {
                    setTimeout(() => {
                        segment.classList.add('filled');
                        segment.style.background = barColor;
                    }, i * 80);
                }
            });
        }, rowIndex * 100);
    });
}

// Success Factors 도넛 차트 JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('successDonutChart');
    if (!ctx) return;

    // 성공 요인 도넛 차트 데이터
    factorsData = {
        labels: [
            '추가 투자금 유치',
            '브랜드 홍보 전략',
            '높은 기술 준비도',
            '정부 출연금 확보',
            '외형 지표 가시화',
            '우수한 인재 유치',
            '해외 진출 활성화',
            '초격차 기술 개발'
        ],
        values: [49.37, 11.73, 10.91, 8.39, 6.07, 3.61, 3.40, 2.22],
        colors: ['#6E42D9', '#35359C', '#226BDA', '#6991FF', '#2193CB', '#42CFD9', '#55D9C9', '#B4B8BF']
    };

    // Canvas 크기 설정
    const canvas = document.getElementById('successDonutChart');
    canvas.width = 190;
    canvas.height = 190;
    canvas.style.width = '190px';
    canvas.style.height = '190px';

    // 즉시 회색 차트 생성 (애니메이션 없이)
    successChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: factorsData.labels,
            datasets: [{
                data: factorsData.values,
                backgroundColor: ['#D7D7D7', '#D7D7D7', '#D7D7D7', '#D7D7D7', '#D7D7D7', '#D7D7D7', '#D7D7D7', '#D7D7D7'],
                borderWidth: 0,
                spacing: 0
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            cutout: '85%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            animation: {
                duration: 0  // 초기 생성 시 애니메이션 없음
            },
            onClick: (event, activeElements) => {
                if (activeElements.length > 0) {
                    const index = activeElements[0].index;
                    updateActiveItem(index);
                }
            }
        },
        plugins: [innerExpandPlugin]
    });

    // 3.1초 후 색상 애니메이션 시작
    setTimeout(() => {
        // 색상으로 변경하고 애니메이션 활성화
        successChart.data.datasets[0].backgroundColor = factorsData.colors;
        successChart.options.animation.duration = 1000; // 색상 전환 애니메이션 시간
        successChart.update('active');

        // 왼쪽 리스트 클릭 이벤트
        const factorItems = document.querySelectorAll('.factor_item_new');
        factorItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                updateActiveItem(index);
            });
        });

        // 색상 애니메이션 완료 후 초기 활성화
        setTimeout(() => {
            updateArrowPosition(0);
            updateActiveItem(0, true); // skipGauges = true로 호출
        }, 1000);
        
    }, 3100);
});

// ==================== F1~F8 라벨 배치 ====================
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        const radarArea = document.querySelector('.radar_chart_area');
        if (!radarArea) return;

        labelsData = [
            {
                text: 'F1',
                subtext: '추가 투자금 유치',
                angle: 0,
                tableData: [
                    { label: '4-7년차투자건수', value: '0.1', barSegments: 9, score: 91.6 },
                    { label: '4-7년차투자기사검색건수', value: '4.5', barSegments: 9, score: 98.2 },
                    { label: '4-7년차투자단계', value: '1', barSegments: 9, score: 98.9 },
                    { label: '4-7년차투자유치금액', value: '2,875', barSegments: 9, score: 99.5 },
                    { label: '5년차자본잉여금', value: '-84', barSegments: 4, score: 4.1 },
                ]
            },
            {
                text: 'F2',
                subtext: '브랜드 홍보 전략',
                angle: 45,
                tableData: [
                    { label: '4-7년차브랜드지재권종류', value: '0.5', barSegments: 7, score: 78.4 },
                    { label: '4-7년차상표권등록건수', value: '0.5', barSegments: 7, score: 74.8 },
                    { label: '4-7년차상표권출원건수', value: '0.5', barSegments: 7, score: 75.6 },
                    { label: '4-7년차전체기사검색건수', value: '22.5', barSegments: 9, score: 94.5 },
                    { label: '5년차상표권출원대비등록', value: '0', barSegments: 0, score: 0 },
                    { label: '6년차상표권출원대비등록', value: '0', barSegments: 0, score: 0 },
                    { label: '7년차상표권출원대비등록', value: '0', barSegments: 0, score: 0 },
                ]
            },
            {
                text: 'F3',
                subtext: '높은 기술 준비도',
                angle: 90,
                tableData: [
                    { label: '4-7년차기술인증종류현황', value: '1', barSegments: 4, score: 45.3 },
                    { label: '4-7년차연구소인증건수', value: '0', barSegments: 0, score: 0 },
                    { label: '4-7년차특허등록건수', value: '9.8', barSegments: 9, score: 99.9 },
                    { label: '4-7년차특허출원건수', value: '9.3', barSegments: 9, score: 99.9 },
                    { label: '4년차특허출원대비등록', value: '0.8', barSegments: 9, score: 92.2 },
                    { label: '5년차특허출원대비등록', value: '0.9', barSegments: 9, score: 93.5 },
                    { label: '6년차특허출원대비등록', value: '0.6', barSegments: 9, score: 95.3 },
                    { label: '7년차특허출원대비등록', value: '0', barSegments: 0, score: 0 },
                ]
            },
            {
                text: 'F4',
                subtext: '정부 출연금 확보',
                angle: 135,
                tableData: [
                    { label: '4-7년차RND수행건수', value: '0.5', barSegments: 9, score: 91.7 },
                    { label: '4년차RND금액', value: '470백만', barSegments: 9, score: 97.4 },
                    { label: '5년차RND금액', value: '438백만', barSegments: 9, score: 97.3 },
                    { label: '6년차RND금액', value: '481백만', barSegments: 9, score: 98.5 },
                    { label: '7년차RND금액', value: '0', barSegments: 10, score: 100 },
                ]
            },
            {
                text: 'F5',
                subtext: '외형 지표 가시화',
                angle: 180,
                tableData: [
                    { label: '4-7년차성과기사제목검색건수', value: '1.3', barSegments: 9, score: 95.9 },
                    { label: '5년차고용인원증가율', value: '0.5', barSegments: 9, score: 94.1 },
                    { label: '6년차고용인원증가율', value: '0', barSegments: 8, score: 84 },
                    { label: '7년차고용인원증가율', value: '-', barSegments: 0, score: 0 },
                ]
            },
            {
                text: 'F6',
                subtext: '우수한 인재 유치',
                angle: 225,
                tableData: [
                    { label: '4년차공시지가', value: '1,939', barSegments: 4, score: 42.3 },
                    { label: '4년차임금', value: '3.5', barSegments: 6, score: 69.6 },
                    { label: '4년차퇴사대비입사율', value: '3', barSegments: 9, score: 90.4 },
                    { label: '5년차공시지가', value: '1,939', barSegments: 4, score: 43.3 },
                    { label: '5년차임금', value: '3.7', barSegments: 7, score: 72.7 },
                    { label: '5년차퇴사대비입사율', value: '4.8', barSegments: 9, score: 98.4 },
                    { label: '6년차공시지가', value: '29,070', barSegments: 9, score: 95.1 },
                    { label: '6년차임금', value: '4.3', barSegments: 8, score: 87.4 },
                    { label: '6년차임금증가율', value: '0.2', barSegments: 8, score: 84.5 },
                    { label: '6년차퇴사대비입사율', value: '1.2', barSegments: 7, score: 74.4 },
                    { label: '7년차공시지가', value: '30,530', barSegments: 9, score: 95.5 },
                    { label: '7년차퇴사대비입사율', value: '1.8', barSegments: 8, score: 85.2 },
                ]
            },
            {
                text: 'F7',
                subtext: '해외 진출 활성화',
                angle: 270,
                tableData: [
                    { label: '4-7년차해외진출기사검색건수', value: '3.3', barSegments: 9, score: 96.1 },
                ]
            },
            {
                text: 'F8',
                subtext: '초격차 기술 개발',
                angle: 315,
                tableData: [
                    { label: '4-7년차초격차RND건수', value: '0.3', barSegments: 9, score: 90.7 },
                ]
            },
        ];

        let hoveredLabelIndex = 0;
        const radius = 250;

        labelsData.forEach((label, index) => {
            const labelEl = document.createElement('div');
            labelEl.className = 'radar_label'; // 초기에는 show 클래스 없음

            const angleRad = (label.angle - 90) * Math.PI / 180;
            const x = radius * Math.cos(angleRad);
            const y = radius * Math.sin(angleRad);

            labelEl.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

            labelEl.innerHTML = `
                <div class="radar_label_main">${label.text}</div>
                <div class="radar_label_sub">${label.subtext}</div>
            `;

            labelEl.addEventListener('click', () => {
                // 모든 라벨 초기화
                document.querySelectorAll('.radar_label').forEach((el, i) => {
                    el.classList.remove('active');
                    const angle = labelsData[i].angle;
                    const ax = radius * Math.cos((angle - 90) * Math.PI / 180);
                    const ay = radius * Math.sin((angle - 90) * Math.PI / 180);
                    el.style.transform = `translate(calc(-50% + ${ax}px), calc(-50% + ${ay}px)) scale(1)`;
                });

                // 현재 클릭된 라벨만 확대 + active
                hoveredLabelIndex = index;
                labelEl.classList.add('active');
                labelEl.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.05)`;

                // 테이블 업데이트
                updateTableData(label.tableData, label.subtext);

                // 도넛 차트와 factor_item_new 연동
                const donutIndex = labelToDonutMapping[label.text];
                if (donutIndex !== undefined) {
                    updateActiveItem(donutIndex);
                }
            });

            labelEl.addEventListener('mouseleave', () => {
                // mouseleave 시에는 아무것도 하지 않음 (다음 호버까지 유지)
            });

            radarArea.appendChild(labelEl);
        });

        // 라벨 요소들이 DOM에 추가된 직후 show 클래스 추가 (페이드 인 효과)
        setTimeout(() => {
            const allLabels = document.querySelectorAll('.radar_label');
            allLabels.forEach(label => {
                label.classList.add('show');
            });
        }, 50); // DOM 추가 후 약간의 딜레이

        // 색상 애니메이션 완료 후 F1 활성화
        setTimeout(() => {
            const initialFactor = labelsData.find(l => l.text === 'F1');
            if (initialFactor) {
                updateTableData(initialFactor.tableData, initialFactor.subtext);

                // F1 라벨에 active 클래스 추가
                setTimeout(() => {
                    const allLabels = document.querySelectorAll('.radar_label');
                    if (allLabels[0]) {
                        allLabels[0].classList.add('active');
                        const angleRad = (labelsData[0].angle - 90) * Math.PI / 180;
                        const x = radius * Math.cos(angleRad);
                        const y = radius * Math.sin(angleRad);
                        allLabels[0].style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.05)`;
                    }
                }, 100);
            }
        }, 1000);
        
    }, 3100);

});

setTimeout(function() {
    const video = document.getElementById('radarVideo');
    if (video) {
        video.style.display = 'block'; // 또는 'inline-block'
        video.play().catch(function(error) {
            console.log('Video play failed:', error);
        });
    } else {
        console.error('Video element not found');
    }
}, 3100);