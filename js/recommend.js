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
            return parseFloat(scoreText) || 0;
        }

        function calculateStrokeWidth(score) {
            return score <= 60 ? 20 : 20 + ((score - 60) / 40) * 30;
        }

        // 각 li의 원래 적합도 숫자 저장
        function storeOriginalScores() {
            const allLi = document.querySelectorAll('#operatorList li, #productList li');
            allLi.forEach(li => {
                const scoreElement = li.querySelector('.score strong');
                if (scoreElement) {
                    const originalScore = scoreElement.textContent.replace('%', '').trim();
                    li.dataset.originalScore = originalScore;
                    scoreElement.textContent = '0%';
                }
            });
        }

        // 숫자 카운팅 애니메이션
        function animateScore(element, targetScore, duration = 2000) {
            const start = 0;
            const end = parseFloat(targetScore);
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // easeOutCubic
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentValue = start + (end - start) * easeProgress;
                
                element.textContent = Math.round(currentValue) + '%';
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.textContent = Math.round(end) + '%';
                }
            }
            
            requestAnimationFrame(update);
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
                gLeft.setAttribute('gradientUnits', 'objectBoundingBox');
                defs.appendChild(gLeft);
            }
            gLeft.setAttribute('x1', '0');
            gLeft.setAttribute('y1', '0');
            gLeft.setAttribute('x2', '1');
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
                gRight.setAttribute('gradientUnits', 'objectBoundingBox');
                defs.appendChild(gRight);
            }
            gRight.setAttribute('x1', '0');
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

            setupGradients(rect, centerX);

            const operatorList = document.querySelectorAll('#operatorList li');
            const productList = document.querySelectorAll('#productList li');

            const createPath = (li, isLeft, isHover) => {
                const score = parseFloat(li.dataset.originalScore || getMatchScore(li));
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
                    d = `M ${endX} ${adjustedEndY} 
                         C ${c2} ${adjustedEndY}, ${c1} ${startY}, ${startX} ${startY}`;
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

            operatorList.forEach(li => {
                svg.appendChild(createPath(li, true, false));
                svg.appendChild(createPath(li, true, true));
            });
            productList.forEach(li => {
                svg.appendChild(createPath(li, false, false));
                svg.appendChild(createPath(li, false, true));
            });

            const drawBar = (li, isLeft) => {
                const liRect = li.getBoundingClientRect();
                const x = isLeft ? liRect.right - rect.left + GAP : liRect.left - rect.left - GAP;
                const y = liRect.top + liRect.height / 2 - rect.top;
                const score = parseFloat(li.dataset.originalScore || getMatchScore(li));
                const strokeWidth = calculateStrokeWidth(score);
                const bar = document.createElementNS(svgNS, 'path');
                bar.setAttribute('d', `M ${x} ${y - strokeWidth/2} L ${x} ${y + strokeWidth/2}`);
                bar.setAttribute('class', `color-bar ${isLeft ? 'left-color' : 'right-color'}`);
                bar.setAttribute(isLeft ? 'data-from' : 'data-to', li.dataset.id);
                
                // 초기 색상은 모두 #666
                bar.style.stroke = '#666';
                
                // 최종 색상을 data 속성으로 저장
                if (score >= 60) {
                    bar.dataset.activeColor = isLeft ? '#5A2FB8' : '#1B55AB';
                } else {
                    bar.dataset.activeColor = '#666';
                }
                
                bar.style.opacity = isInitialLoad ? '0' : '1';
                svg.appendChild(bar);
            };
            operatorList.forEach(li => drawBar(li, true));
            productList.forEach(li => drawBar(li, false));

            if (isInitialLoad) {
                storeOriginalScores();
                startAnimation();
                isInitialLoad = false;
            } else {
                updateActiveStates(operatorList, productList);
            }
        }

        function updateActiveStates(ops, prods) {
            [...ops, ...prods].forEach(li => {
                const score = parseFloat(li.dataset.originalScore || getMatchScore(li));
                if (score >= 60) {
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

            // 1. 리스트 아이템 & 바 애니메이션 (0~1.6초) - 차트 제외
            setTimeout(() => {
                [...ops, ...prods].forEach((li, i) => {
                    setTimeout(() => {
                        li.classList.add('animate');
                        const bar = svg.querySelector(`.color-bar[data-from="${li.dataset.id}"], .color-bar[data-to="${li.dataset.id}"]`);
                        if(bar) { bar.style.transition = 'opacity 0.7s ease'; bar.style.opacity = '1'; }
                    }, i * 80);
                });
            }, 400);

            // 2. 숫자 카운팅 + 원형 차트 애니메이션 동시 시작 (2초~4초)
            setTimeout(() => {
                // 숫자 카운팅 애니메이션
                [...ops, ...prods].forEach(li => {
                    const scoreElement = li.querySelector('.score strong');
                    if (scoreElement && li.dataset.originalScore) {
                        animateScore(scoreElement, li.dataset.originalScore, 2000);
                    }
                    
                    // 원형 차트 애니메이션 (2초 동안)
                    const chart = li.querySelector('.circle_chart');
                    if (chart) {
                        const progress = chart.querySelector('.progress');
                        const off = (2 * Math.PI * 45) * (1 - parseInt(li.dataset.originalScore) / 100);
                        progress.style.transition = 'stroke-dashoffset 2s ease';
                        setTimeout(() => progress.style.strokeDashoffset = off, 50);
                    }
                });
            }, 2000);

            // 3. centerNode active + 회색 선 + 그라디언트 선 + color-bar 색상 변경 애니메이션 (4초~6초)
            setTimeout(() => {
                // centerNode에 active 클래스 추가
                centerNode.classList.add('active');
                
                // color-bar 색상 변경 애니메이션
                [...ops, ...prods].forEach(li => {
                    const bar = svg.querySelector(`.color-bar[data-from="${li.dataset.id}"], .color-bar[data-to="${li.dataset.id}"]`);
                    if (bar && bar.dataset.activeColor) {
                        // transition을 먼저 설정
                        bar.style.transition = 'stroke 2s ease';
                        // 강제 리플로우
                        bar.getBoundingClientRect();
                        // 그 다음 색상 변경
                        setTimeout(() => {
                            bar.style.stroke = bar.dataset.activeColor;
                        }, 50);
                    }
                });
                
                // 회색 선 애니메이션
                svg.querySelectorAll('path.line-init').forEach(path => {
                    const len = path.getTotalLength();
                    path.style.transition = 'none';
                    path.style.strokeDasharray = len;
                    path.style.strokeDashoffset = len;
                    path.getBoundingClientRect();
                    path.style.transition = 'stroke-dashoffset 2s ease';
                    path.style.strokeDashoffset = '0';
                });

                // 그라디언트 선 애니메이션
                [...ops, ...prods].forEach(li => {
                    const score = parseFloat(li.dataset.originalScore);
                    if (score >= 60) {
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
            }, 4000);
        }

        drawConnections();
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(drawConnections, 200);
        });
    }
});