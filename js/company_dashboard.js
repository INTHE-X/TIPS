// Inner Expand Plugin (안쪽으로만 확대)
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
        
        const originalInner = chart._originalInnerRadius;
        const expandAmount = 10;
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

// Success Factors 도넛 차트 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('successDonutChart');
    if (!ctx) return;
    // 성공 요인 도넛 차트 데이터
const factorsData = {
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

// Canvas 크기 명시적으로 설정
const canvas = document.getElementById('successDonutChart');
canvas.width = 190;
canvas.height = 190;
canvas.style.width = '190px';
canvas.style.height = '190px';

// Chart 생성
const successChart = new Chart(canvas, {
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
        responsive: false,  // ← 중요: false로 설정
        maintainAspectRatio: false,  // ← 중요: false로 설정
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        }
    },
    plugins: [innerExpandPlugin]
});
    
    const factorItems = document.querySelectorAll('.factor_item_new');
    factorItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            updateActiveItem(index);
        });
    });
    
    function updateActiveItem(index) {
        factorItems.forEach(item => item.classList.remove('active'));
        factorItems[index].classList.add('active');
        
        const centerPercent = document.getElementById('donutCenterPercent');
        const centerLabel = document.getElementById('donutCenterLabel');
        
        centerPercent.style.opacity = '0';
        centerLabel.style.opacity = '0';
        
        setTimeout(() => {
            centerPercent.textContent = factorsData.values[index] + '%';
            centerLabel.textContent = factorsData.labels[index];
            centerPercent.style.opacity = '1';
            centerLabel.style.opacity = '1';
        }, 200);
        
        successChart.setActiveElements([{
            datasetIndex: 0,
            index: index
        }]);
        successChart.update('none');
        
        updateArrowPosition(index);
    }
    
    // 화살표 방향 수정 (안쪽을 향하도록)
    function updateArrowPosition(index) {
        const arrow = document.querySelector('.donut_arrow');
        if (!arrow) return;
        
        const totalValue = factorsData.values.reduce((a, b) => a + b, 0);
        let currentAngle = -90;  // 12시 방향 시작
        
        // 선택된 세그먼트까지의 각도 누적
        for (let i = 0; i < index; i++) {
            currentAngle += (factorsData.values[i] / totalValue) * 360;
        }
        
        // 선택된 세그먼트의 중심 각도
        const segmentAngle = (factorsData.values[index] / totalValue) * 360;
        const centerAngle = currentAngle + (segmentAngle / 2);
        
        // 화살표가 안쪽(중심)을 향하도록 회전
        // Polygon_8.png가 위쪽을 향하고 있다고 가정
        // 안쪽을 가리키려면: centerAngle + 180 (반대 방향)
        arrow.style.transform = `translate(-50%, -50%) rotate(${centerAngle + 180}deg)`;
        
        // 만약 방향이 여전히 안 맞으면 아래 중 하나를 선택:
        // arrow.style.transform = `translate(-50%, -50%) rotate(${centerAngle}deg)`;
        // arrow.style.transform = `translate(-50%, -50%) rotate(${centerAngle + 90}deg)`;
        // arrow.style.transform = `translate(-50%, -50%) rotate(${centerAngle + 270}deg)`;
        // arrow.style.transform = `translate(-50%, -50%) rotate(${centerAngle - 90}deg)`;
    }
    
    updateArrowPosition(0);
});