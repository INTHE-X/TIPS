$(function () {
    setTimeout(initMindmap, 500);
    setTimeout(initCircleProgress, 600);

    function initCircleProgress() {
        const charts = document.querySelectorAll('.circle_chart');
        charts.forEach(chart => {
            const percent = parseInt(chart.dataset.percent);
            const progressCircle = chart.querySelector('.progress');
            const percentText = chart.querySelector('.percent_text');
            if (!progressCircle || !percentText) return;

            const radius = 45;
            const circumference = 2 * Math.PI * radius;
            progressCircle.style.strokeDasharray = circumference;
            progressCircle.style.strokeDashoffset = circumference;
            percentText.textContent = percent + '%';
        });
    }

    function initMindmap() {
        const svg = document.querySelector('.connection_lines');
        const centerNode = document.getElementById('centerNode');
        if (!svg || !centerNode) return;

        const svgNS = "http://www.w3.org/2000/svg";
        let isInitialLoad = true;

        function getMatchScore(li) {
            const scoreElement = li.querySelector('.score strong');
            if (!scoreElement) return 0;
            const scoreText = scoreElement.textContent.replace('%', '').trim();
            return parseInt(scoreText) || 0;
        }

        function calculateStrokeWidth(score) {
            return score <= 50 ? 20 : 20 + ((score - 50) / 50) * 30;
        }

        let defs = svg.querySelector('defs') || document.createElementNS(svgNS, 'defs');
        if (!svg.querySelector('defs')) svg.appendChild(defs);

        function setupGradients(rect, centerX) {
    let defs = svg.querySelector('defs') || document.createElementNS(svgNS, 'defs');
    if (!svg.querySelector('defs')) svg.appendChild(defs);

    // 왼쪽 그라디언트
    let gLeft = document.getElementById('gradientLeft');
    if (!gLeft) {
        gLeft = document.createElementNS(svgNS, 'linearGradient');
        gLeft.setAttribute('id', 'gradientLeft');
        gLeft.setAttribute('gradientUnits', 'objectBoundingBox'); // 변경!
        defs.appendChild(gLeft);
    }
    gLeft.setAttribute('x1', '0');
    gLeft.setAttribute('y1', '0');
    gLeft.setAttribute('x2', '1'); // 0~1 범위로 변경
    gLeft.setAttribute('y2', '0');
    gLeft.innerHTML = `
        <stop offset="0%" style="stop-color:#6E42D9;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#E8E3F5;stop-opacity:1" />
    `;

    // 오른쪽 그라디언트
    let gRight = document.getElementById('gradientRight');
    if (!gRight) {
        gRight = document.createElementNS(svgNS, 'linearGradient');
        gRight.setAttribute('id', 'gradientRight');
        gRight.setAttribute('gradientUnits', 'objectBoundingBox'); // 변경!
        defs.appendChild(gRight);
    }
    gRight.setAttribute('x1', '0'); // 0~1 범위로 변경
    gRight.setAttribute('y1', '0');
    gRight.setAttribute('x2', '1');
    gRight.setAttribute('y2', '0');
    gRight.innerHTML = `
        <stop offset="0%" style="stop-color:#E3F2FD;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#226AD6;stop-opacity:1" />
    `;
}

        function drawConnections() {
            const GAP = 30;
            const mindmap = document.querySelector('.recommend_mindmap');
            if (!mindmap) return;
            const rect = mindmap.getBoundingClientRect();

            svg.querySelectorAll('path').forEach(el => el.remove());
            svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
            svg.style.width = rect.width + 'px';
            svg.style.height = rect.height + 'px';

            const centerRect = centerNode.getBoundingClientRect();
            const centerX = centerRect.left + centerRect.width / 2 - rect.left;
            const centerY = centerRect.top + centerRect.height / 2 - rect.top;

            // 그라디언트 재설정 (centerX 기준으로 좌우 분리)
            setupGradients(rect, centerX);

            const operatorList = document.querySelectorAll('#operatorList li');
            const productList = document.querySelectorAll('#productList li');

            const createPath = (li, isLeft, isHover) => {
                const score = getMatchScore(li);
                const strokeWidth = calculateStrokeWidth(score);
                const liRect = li.getBoundingClientRect();
                
                let d;
                const startY = liRect.top + liRect.height / 2 - rect.top;
                const adjustedEndY = (startY === centerY) ? centerY + 0.1 : centerY;

                if(isLeft) {
                    const startX = liRect.right - rect.left + GAP;
                    const endX = centerX - GAP;
                    const c1 = startX + (endX - startX) * 0.4;
                    const c2 = startX + (endX - startX) * 0.6;
                    d = `M ${isHover ? startX : endX} ${isHover ? startY : adjustedEndY} 
                         C ${isHover ? c1 : c2} ${isHover ? startY : adjustedEndY}, 
                           ${isHover ? c2 : c1} ${isHover ? adjustedEndY : startY}, 
                           ${isHover ? endX : startX} ${isHover ? adjustedEndY : startY}`;
                } else {
                    const startX = centerX + GAP;
                    const endX = liRect.left - rect.left - GAP;
                    const c1 = startX + (endX - startX) * 0.4;
                    const c2 = startX + (endX - startX) * 0.6;
                    d = `M ${startX} ${adjustedEndY} 
                         C ${c1} ${adjustedEndY}, ${c2} ${startY}, ${endX} ${startY}`;
                }

                const path = document.createElementNS(svgNS, 'path');
                path.setAttribute('d', d);
                path.setAttribute('class', `line ${isLeft ? 'left' : 'right'} ${isHover ? 'line-hover' : 'line-init'}`);
                path.setAttribute(isLeft ? 'data-from' : 'data-to', li.dataset.id);
                
                path.style.strokeWidth = strokeWidth + 'px';
                path.style.fill = 'none';

                const pathLength = path.getTotalLength();
                path.style.strokeDasharray = pathLength;
                path.style.strokeDashoffset = isInitialLoad ? pathLength : '0';

                if(isHover) {
                    path.style.opacity = '0';
                    path.style.stroke = isLeft ? 'url(#gradientLeft)' : 'url(#gradientRight)';
                } else {
                    path.style.stroke = '#E5E5E5';
                }
                return path;
            };

            // 회색 선 및 그라디언트 선 생성
            operatorList.forEach(li => {
                svg.appendChild(createPath(li, true, false));
                svg.appendChild(createPath(li, true, true));
            });
            productList.forEach(li => {
                svg.appendChild(createPath(li, false, false));
                svg.appendChild(createPath(li, false, true));
            });

            // color-bar
            const drawBar = (li, isLeft) => {
                const liRect = li.getBoundingClientRect();
                const x = isLeft ? liRect.right - rect.left + GAP : liRect.left - rect.left - GAP;
                const y = liRect.top + liRect.height / 2 - rect.top;
                const strokeWidth = calculateStrokeWidth(getMatchScore(li));
                const bar = document.createElementNS(svgNS, 'path');
                bar.setAttribute('d', `M ${x} ${y - strokeWidth/2} L ${x} ${y + strokeWidth/2}`);
                bar.setAttribute('class', `color-bar ${isLeft ? 'left-color' : 'right-color'}`);
                bar.setAttribute(isLeft ? 'data-from' : 'data-to', li.dataset.id);
                bar.style.stroke = isLeft ? '#5A2FB8' : '#1B55AB';
                bar.style.opacity = isInitialLoad ? '0' : '1';
                svg.appendChild(bar);
            };
            operatorList.forEach(li => drawBar(li, true));
            productList.forEach(li => drawBar(li, false));

            if (isInitialLoad) {
                startAnimation();
                isInitialLoad = false;
            } else {
                updateActiveStates(operatorList, productList);
            }
        }

        function updateActiveStates(ops, prods) {
            [...ops, ...prods].forEach(li => {
                const score = getMatchScore(li);
                if (score >= 50) {
                    li.classList.add('active');
                    const id = li.dataset.id;
                    const selector = li.parentElement.id === 'operatorList' ? `[data-from="${id}"]` : `[data-to="${id}"]`;
                    svg.querySelectorAll(`path.line-hover${selector}`).forEach(line => {
                        line.style.opacity = '1';
                        line.style.strokeDashoffset = '0';
                        line.style.stroke = line.classList.contains('left') ? 'url(#gradientLeft)' : 'url(#gradientRight)';
                    });
                }
            });
        }

        function startAnimation() {
            const ops = document.querySelectorAll('#operatorList li');
            const prods = document.querySelectorAll('#productList li');

            // 1. 회색 선 애니메이션
            setTimeout(() => {
                svg.querySelectorAll('path.line-init').forEach(path => {
                    const len = path.getTotalLength();
                    path.style.transition = 'none';
                    path.style.strokeDasharray = len;
                    path.style.strokeDashoffset = len;
                    path.getBoundingClientRect();
                    path.style.transition = 'stroke-dashoffset 2.5s ease';
                    path.style.strokeDashoffset = '0';
                });
            }, 400);

            // 2. 리스트 아이템 & 차트 & 바 애니메이션
            setTimeout(() => {
                [...ops, ...prods].forEach((li, i) => {
                    setTimeout(() => {
                        li.classList.add('animate');
                        const chart = li.querySelector('.circle_chart');
                        if (chart) {
                            const progress = chart.querySelector('.progress');
                            const off = (2 * Math.PI * 45) * (1 - parseInt(chart.dataset.percent) / 100);
                            progress.style.transition = 'stroke-dashoffset 0.7s ease';
                            setTimeout(() => progress.style.strokeDashoffset = off, 50);
                        }
                        const bar = svg.querySelector(`.color-bar[data-from="${li.dataset.id}"], .color-bar[data-to="${li.dataset.id}"]`);
                        if(bar) { bar.style.transition = 'opacity 0.7s ease'; bar.style.opacity = '1'; }
                    }, i * 80);
                });
            }, 2000);

            // 3. 그라디언트 선 연결 애니메이션
            setTimeout(() => {
                [...ops, ...prods].forEach(li => {
                    if (getMatchScore(li) >= 50) {
                        li.classList.add('active');
                        const id = li.dataset.id;
                        const selector = li.parentElement.id === 'operatorList' ? `[data-from="${id}"]` : `[data-to="${id}"]`;
                        
                        svg.querySelectorAll(`path.line-hover${selector}`).forEach(line => {
                            const len = line.getTotalLength();
                            line.style.opacity = '1';
                            line.style.stroke = line.classList.contains('left') ? 'url(#gradientLeft)' : 'url(#gradientRight)';
                            
                            line.style.transition = 'none';
                            line.style.strokeDasharray = len;
                            line.style.strokeDashoffset = len;
                            line.getBoundingClientRect();

                            setTimeout(() => {
                                line.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)';
                                line.style.strokeDashoffset = '0';
                            }, 50);
                        });
                    }
                });
            }, 3000);
        }

        drawConnections();
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(drawConnections, 200);
        });
    }
});