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

// 🔥 updateActiveItem을 전역 함수로 이동
function updateActiveItem(index) {
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
}

// Success Factors 도넛 차트 JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('successDonutChart');
    if (!ctx) return;

    // 성공 요인 도넛 차트 데이터
    factorsData = {
        labels: [
            '외형 지표 가시화',
            '사업 초기 수익성',
            '정부 출연금 확보',
            '조직자 기술 개발',
            '추가 투자금 유치',
            '사업화 역량 수행',
            '높은 기술 준비도',
            '사업 포트폴리오 제고'
        ],
        values: [23.21, 10.01, 15.3, 8.23, 11.43, 7, 10.4, 14.42],
        colors: ['#6E42D9', '#35359C', '#226BDA', '#6991FF', '#2193CB', '#42CFD9', '#55D9C9', '#B4B8BF']
    };

    // Canvas 크기 설정
    const canvas = document.getElementById('successDonutChart');
    canvas.width = 190;
    canvas.height = 190;
    canvas.style.width = '190px';
    canvas.style.height = '190px';

    // Chart 생성
    successChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: factorsData.labels,
            datasets: [{
                data: factorsData.values,
                backgroundColor: factorsData.colors,
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
            onClick: (event, activeElements) => {
                if (activeElements.length > 0) {
                    const index = activeElements[0].index;
                    updateActiveItem(index);
                }
            }
        },
        plugins: [innerExpandPlugin]
    });

    // 왼쪽 리스트 클릭 이벤트
    const factorItems = document.querySelectorAll('.factor_item_new');
    factorItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            updateActiveItem(index);
        });
    });

    // 초기 활성화 - 색상 적용
    updateArrowPosition(0);
    updateActiveItem(0);  // 🔥 이제 작동합니다!
});

function updateActiveItem(index) {
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

// ==================== F1~F8 라벨 배치 ====================
document.addEventListener('DOMContentLoaded', function () {
    const radarArea = document.querySelector('.radar_chart_area');
    if (!radarArea) return;

const labels = [
        {
            text: 'F1',
            subtext: '추가 투자금 유치',
            angle: 0,
            tableData: [
                { label: '4-7년차투자건수', value: '0.1', barSegments: 9, score: 91.6 },
                { label: '4-7년차투자기사검색건수', value: '1.5', barSegments: 9, score: 94.7 },
                { label: '4-7년차투자단계', value: '0.5', barSegments: 9, score: 95.8 },
                { label: '4-7년차투자유치금액', value: '1025', barSegments: 9, score: 98.6 },
                { label: '5년차자본잉여금', value: '400', barSegments: 9, score: 90.7 },
            ]
        },
        {
            text: 'F2',
            subtext: '브랜드 홍보 전략',
            angle: 45,
            tableData: [
                { label: '4-7년차브랜드지재권종류', value: '1.3', barSegments: 9, score: 97.4 },
                { label: '4-7년차상표권등록건수', value: '7.8', barSegments: 9, score: 99.2 },
                { label: '4-7년차상표권출원건수', value: '12.8', barSegments: 9, score: 99.5 },
                { label: '4-7년차전체기사검색건수', value: '72.8', barSegments: 9, score: 98.8 },
                { label: '5년차상표권출원대비등록', value: '18', barSegments: 10, score: 100 },
                { label: '6년차상표권출원대비등록', value: '0', barSegments: 0, score: 0 },
                { label: '7년차상표권출원대비등록', value: '0', barSegments: 0, score: 0 },
            ]
        },
        {
            text: 'F3',
            subtext: '높은 기술 준비도',
            angle: 90,
            tableData: [
                { label: '4-7년차기술인증종류현황', value: '1.8', barSegments: 9, score: 95.1 },
                { label: '4-7년차연구소인증건수', value: '0.8', barSegments: 9, score: 98.5 },
                { label: '4-7년차특허등록건수', value: '7', barSegments: 9, score: 99.8 },
                { label: '4-7년차특허출원건수', value: '5.3', barSegments: 9, score: 99.6 },
                { label: '4년차특허출원대비등록', value: '0.4', barSegments: 8, score: 89.8 },
                { label: '5년차특허출원대비등록', value: '1.9', barSegments: 9, score: 98.3 },
                { label: '6년차특허출원대비등록', value: '2', barSegments: 9, score: 98.5 },
                { label: '7년차특허출원대비등록', value: '7', barSegments: 10, score: 100 },
            ]
        },
        {
            text: 'F4',
            subtext: '정부 출연금 확보',
            angle: 135,
            tableData: [
                { label: '4-7년차RND수행건수', value: '0.5', barSegments: 9, score: 91.7 },
                { label: '4년차RND금액', value: '462500000', barSegments: 9, score: 97.4 },
                { label: '5년차RND금액', value: '422150000', barSegments: 9, score: 97.3 },
                { label: '6년차RND금액', value: '277832000', barSegments: 9, score: 97.6 },
                { label: '7년차RND금액', value: '0', barSegments: 10, score: 100 },
            ]
        },
        {
            text: 'F5',
            subtext: '외형 지표 가시화',
            angle: 180,
            tableData: [
                { label: '4-7년차성과기사제목검색건수', value: '2.3', barSegments: 9, score: 97.7 },
                { label: '5년차고용인원증가율', value: '-0.6', barSegments: 3, score: 32.5 },
                { label: '6년차고용인원증가율', value: '-0.1', barSegments: 7, score: 70.9 },
                { label: '7년차고용인원증가율', value: '-', barSegments: 0, score: 0 },
            ]
        },
        {
            text: 'F6',
            subtext: '우수한 인재 유치',
            angle: 225,
            tableData: [
                { label: '4년차공시지가', value: '18310', barSegments: 8, score: 88.1 },
                { label: '4년차임금', value: '3.5', barSegments: 6, score: 69.5 },
                { label: '4년차퇴사대비입사율', value: '2.4', barSegments: 8, score: 88.1 },
                { label: '5년차공시지가', value: '18310', barSegments: 8, score: 89.1 },
                { label: '5년차임금', value: '4.2', barSegments: 8, score: 88.1 },
                { label: '5년차퇴사대비입사율', value: '0.5', barSegments: 3, score: 31.1 },
                { label: '6년차공시지가', value: '299', barSegments: 1, score: 15.4 },
                { label: '6년차임금', value: '4.2', barSegments: 8, score: 84.5 },
                { label: '6년차임금증가율', value: '0', barSegments: 2, score: 26 },
                { label: '6년차퇴사대비입사율', value: '1', barSegments: 5, score: 54.5 },
                { label: '7년차공시지가', value: '299', barSegments: 1, score: 16.9 },
                { label: '7년차퇴사대비입사율', value: '0', barSegments: 0, score: 0 },
            ]
        },
        {
            text: 'F7',
            subtext: '해외 진출 활성화',
            angle: 270,
            tableData: [
                { label: '4-7년차해외진출기사검색건수', value: '13', barSegments: 9, score: 99.2 },
            ]
        },
        {
            text: 'F8',
            subtext: '초격차 기술 개발',
            angle: 315,
            tableData: [
                { label: '4-7년차초격차RND건수', value: '0', barSegments: 0, score: 0 },
            ]
        },
    ];

    let hoveredLabelIndex = 4; // 초기값 F5
    const radius = 250;

    labels.forEach((label, index) => {
        const labelEl = document.createElement('div');
        labelEl.className = 'radar_label';

        const angleRad = (label.angle - 90) * Math.PI / 180;
        const x = radius * Math.cos(angleRad);
        const y = radius * Math.sin(angleRad);

        labelEl.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

        labelEl.innerHTML = `
            <div class="radar_label_main">${label.text}</div>
            <div class="radar_label_sub">${label.subtext}</div>
        `;

        labelEl.addEventListener('click', () => {
            updateTableData(label.tableData, label.subtext);
        });

        labelEl.addEventListener('mouseenter', () => {
            // 모든 라벨 초기화
            document.querySelectorAll('.radar_label').forEach((el, i) => {
                el.classList.remove('active');
                const angle = labels[i].angle;
                const ax = radius * Math.cos((angle - 90) * Math.PI / 180);
                const ay = radius * Math.sin((angle - 90) * Math.PI / 180);
                el.style.transform = `translate(calc(-50% + ${ax}px), calc(-50% + ${ay}px)) scale(1)`;
            });

            // 현재 호버된 라벨만 확대 + active
            hoveredLabelIndex = index;
            labelEl.classList.add('active');
            labelEl.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.05)`;

            // 테이블 업데이트
            updateTableData(label.tableData, label.subtext);
        });

        labelEl.addEventListener('mouseleave', () => {
            // mouseleave 시에는 아무것도 하지 않음 (다음 호버까지 유지)
        });

        radarArea.appendChild(labelEl);
    });

    // 초기 데이터 로드 및 F5를 active 상태로 설정
    const initialFactor = labels.find(l => l.text === 'F5');
    if (initialFactor) {
        updateTableData(initialFactor.tableData, initialFactor.subtext);

        // F5 라벨에 active 클래스 추가
        setTimeout(() => {
            const allLabels = document.querySelectorAll('.radar_label');
            if (allLabels[4]) {
                allLabels[4].classList.add('active');
                const angleRad = (labels[4].angle - 90) * Math.PI / 180;
                const x = radius * Math.cos(angleRad);
                const y = radius * Math.sin(angleRad);
                allLabels[4].style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.05)`;
            }
        }, 100);
    }
});

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

        let barColor = '#6E42D9';
        if (row.score >= 90) barColor = '#6E42D9';
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
