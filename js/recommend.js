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

            setTimeout(() => {
                const offset = circumference - (percent / 100) * circumference;
                progressCircle.style.strokeDashoffset = offset;
            }, 100);
        });
    }

    function initMindmap() {
        const svg = document.querySelector('.connection_lines');
        const centerNode = document.getElementById('centerNode');
        const operatorList = document.querySelectorAll('#operatorList li');
        const productList = document.querySelectorAll('#productList li');

        if (!svg || !centerNode) {
            console.log('Elements not found:', { svg, centerNode });
            return;
        }

        console.log('Mindmap initialized');

        const svgNS = "http://www.w3.org/2000/svg";

        // ✅ 그라데이션 정의 추가
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS(svgNS, 'defs');
            svg.appendChild(defs);
        }
        let gradientLeft = svg.querySelector('#gradientLeft');
        if (!gradientLeft) {
            gradientLeft = document.createElementNS(svgNS, 'linearGradient');
            gradientLeft.setAttribute('id', 'gradientLeft');
            gradientLeft.setAttribute('x1', '0%');
            gradientLeft.setAttribute('y1', '0%');
            gradientLeft.setAttribute('x2', '100%');
            gradientLeft.setAttribute('y2', '0%');
            defs.appendChild(gradientLeft);
        }
        gradientLeft.innerHTML = `
    <stop offset="0%" style="stop-color:#6E42D9;stop-opacity:1" />
    <stop offset="100%" style="stop-color:#E8E3F5;stop-opacity:1" />
`;
        let gradientRight = svg.querySelector('#gradientRight');
        if (!gradientRight) {
            gradientRight = document.createElementNS(svgNS, 'linearGradient');
            gradientRight.setAttribute('id', 'gradientRight');
            gradientRight.setAttribute('x1', '0%');
            gradientRight.setAttribute('y1', '0%');
            gradientRight.setAttribute('x2', '100%');
            gradientRight.setAttribute('y2', '0%');
            defs.appendChild(gradientRight);
        }
        // 오른쪽 그라데이션 - 상품(진한)에서 중앙 블렌딩 영역까지
        gradientRight.innerHTML = `
    <stop offset="0%" style="stop-color:#E3F2FD;stop-opacity:1" />
    <stop offset="100%" style="stop-color:#226AD6;stop-opacity:1" />
`;
        function drawConnections() {
            const GAP = 30;
            const existingPaths = svg.querySelectorAll('path');
            existingPaths.forEach(el => el.remove());

            const mindmap = document.querySelector('.recommend_mindmap');
            if (!mindmap) return;

            const rect = mindmap.getBoundingClientRect();
            svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
            svg.style.width = rect.width + 'px';
            svg.style.height = rect.height + 'px';

            const centerRect = centerNode.getBoundingClientRect();
            const centerX = centerRect.left + centerRect.width / 2 - rect.left;
            const centerY = centerRect.top + centerRect.height / 2 - rect.top;

            const strokeWidths = {
                0: 50, 1: 50, 2: 50, 3: 22,
                4: 20, 5: 50, 6: 50, 7: 30,
            };
            const defaultWidth = 50;

            // 왼쪽 연결선
            operatorList.forEach((li, index) => {
                const liRect = li.getBoundingClientRect();
                const startX = liRect.right - rect.left + GAP;
                const startY = liRect.top + liRect.height / 2 - rect.top;
                const endX = centerX - GAP;
                const endY = centerY;

                const controlX1 = startX + (endX - startX) * 0.4;
                const controlX2 = startX + (endX - startX) * 0.6;

                const dInit = `M ${endX} ${endY} C ${controlX2} ${endY}, ${controlX1} ${startY}, ${startX} ${startY}`;
                const dHover = `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`;
                const dHoverReverse = `M ${endX} ${endY} C ${controlX2} ${endY}, ${controlX1} ${startY}, ${startX} ${startY}`;

                const strokeWidth = strokeWidths[index] !== undefined ? strokeWidths[index] : defaultWidth;

                const pathInit = document.createElementNS(svgNS, 'path');
                pathInit.setAttribute('d', dInit);
                pathInit.setAttribute('class', 'line left line-init');
                pathInit.setAttribute('data-from', li.dataset.id);
                pathInit.setAttribute('data-to', 'center');
                pathInit.style.strokeWidth = strokeWidth + 'px';
                pathInit.style.strokeDasharray = '1000';
                pathInit.style.strokeDashoffset = '1000';
                svg.appendChild(pathInit);

                const pathHover = document.createElementNS(svgNS, 'path');
                pathHover.setAttribute('d', dHover);
                pathHover.setAttribute('class', 'line left line-hover');
                pathHover.setAttribute('data-from', li.dataset.id);
                pathHover.setAttribute('data-to', 'center');
                pathHover.style.strokeWidth = strokeWidth + 'px';
                pathHover.style.strokeDasharray = '1000';
                pathHover.style.strokeDashoffset = '1000';
                pathHover.style.opacity = '0';
                svg.appendChild(pathHover);

                const pathHoverReverse = document.createElementNS(svgNS, 'path');
                pathHoverReverse.setAttribute('d', dHoverReverse);
                pathHoverReverse.setAttribute('class', 'line left line-hover-reverse');
                pathHoverReverse.setAttribute('data-from', li.dataset.id);
                pathHoverReverse.setAttribute('data-to', 'center');
                pathHoverReverse.style.strokeWidth = strokeWidth + 'px';
                pathHoverReverse.style.strokeDasharray = '1000';
                pathHoverReverse.style.strokeDashoffset = '1000';
                pathHoverReverse.style.opacity = '0';
                svg.appendChild(pathHoverReverse);

                const connections = li.dataset.connects.split(',').filter(c => c);
                if (connections.length > 0) {
                    const colorBase = document.createElementNS(svgNS, 'path');
                    const barHeight = strokeWidth;
                    const baseD = `M ${startX} ${startY - barHeight / 2} L ${startX} ${startY + barHeight / 2}`;
                    colorBase.setAttribute('d', baseD);
                    colorBase.setAttribute('class', 'color-bar left-color');
                    colorBase.setAttribute('data-from', li.dataset.id);
                    colorBase.style.opacity = '0';
                    svg.appendChild(colorBase);
                }
            });

            // 오른쪽 연결선
            productList.forEach((li, index) => {
                const liRect = li.getBoundingClientRect();
                const startX = centerX + GAP;
                const startY = centerY;
                const endX = liRect.left - rect.left - GAP;
                const endY = liRect.top + liRect.height / 2 - rect.top;

                const controlX1 = startX + (endX - startX) * 0.4;
                const controlX2 = startX + (endX - startX) * 0.6;

                const dInit = `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`;
                const dHover = `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`;
                const dHoverReverse = `M ${endX} ${endY} C ${controlX2} ${endY}, ${controlX1} ${startY}, ${startX} ${startY}`;

                const strokeWidth = strokeWidths[index] !== undefined ? strokeWidths[index] : defaultWidth;

                const pathInit = document.createElementNS(svgNS, 'path');
                pathInit.setAttribute('d', dInit);
                pathInit.setAttribute('class', 'line right line-init');
                pathInit.setAttribute('data-from', 'center');
                pathInit.setAttribute('data-to', li.dataset.id);
                pathInit.style.strokeWidth = strokeWidth + 'px';
                pathInit.style.strokeDasharray = '1000';
                pathInit.style.strokeDashoffset = '1000';
                svg.appendChild(pathInit);

                const pathHover = document.createElementNS(svgNS, 'path');
                pathHover.setAttribute('d', dHover);
                pathHover.setAttribute('class', 'line right line-hover');
                pathHover.setAttribute('data-from', 'center');
                pathHover.setAttribute('data-to', li.dataset.id);
                pathHover.style.strokeWidth = strokeWidth + 'px';
                pathHover.style.strokeDasharray = '1000';
                pathHover.style.strokeDashoffset = '1000';
                pathHover.style.opacity = '0';
                svg.appendChild(pathHover);

                const pathHoverReverse = document.createElementNS(svgNS, 'path');
                pathHoverReverse.setAttribute('d', dHoverReverse);
                pathHoverReverse.setAttribute('class', 'line right line-hover-reverse');
                pathHoverReverse.setAttribute('data-from', 'center');
                pathHoverReverse.setAttribute('data-to', li.dataset.id);
                pathHoverReverse.style.strokeWidth = strokeWidth + 'px';
                pathHoverReverse.style.strokeDasharray = '1000';
                pathHoverReverse.style.strokeDashoffset = '1000';
                pathHoverReverse.style.opacity = '0';
                svg.appendChild(pathHoverReverse);

                const connections = li.dataset.connects.split(',').filter(c => c);
                if (connections.length > 0) {
                    const colorBar = document.createElementNS(svgNS, 'path');
                    const barHeight = strokeWidth;
                    const barD = `M ${endX} ${endY - barHeight / 2} L ${endX} ${endY + barHeight / 2}`;
                    colorBar.setAttribute('d', barD);
                    colorBar.setAttribute('class', 'color-bar right-color');
                    colorBar.setAttribute('data-to', li.dataset.id);
                    colorBar.style.opacity = '0';
                    svg.appendChild(colorBar);
                }
            });

            console.log('Lines drawn:', svg.querySelectorAll('path').length);
            startAnimation();
        }

        function startAnimation() {
            console.log('Animation starting...');

            setTimeout(() => {
                const paths = svg.querySelectorAll('path.line-init');
                console.log('Animating paths:', paths.length);

                paths.forEach(path => {
                    path.style.strokeDashoffset = '0';
                    path.style.transition = 'stroke-dashoffset 2.5s ease';
                });
            }, 400);

            setTimeout(() => {
                const colorBars = svg.querySelectorAll('path.color-bar');
                colorBars.forEach(bar => {
                    bar.style.opacity = '1';
                    bar.style.transition = 'opacity 0.3s ease';
                });
            }, 2000);

            setTimeout(() => {
                operatorList.forEach((li, index) => {
                    setTimeout(() => {
                        li.classList.add('animate');
                    }, index * 80);
                });

                productList.forEach((li, index) => {
                    setTimeout(() => {
                        li.classList.add('animate');
                    }, index * 80);
                });
            }, 2000);
        }

        // 운영사 호버
        operatorList.forEach(li => {
            li.addEventListener('mouseenter', function () {
                const connections = this.dataset.connects.split(',').filter(c => c);
                centerNode.classList.add('purple');
                centerNode.classList.remove('blue');

                document.querySelectorAll('.circle_chart .progress').forEach(circle => {
                    circle.style.stroke = '#777';
                });
                document.querySelectorAll('.percent_text').forEach(text => {
                    text.style.fill = '#777';
                });

                svg.querySelectorAll('path.color-bar').forEach(bar => {
                    bar.style.stroke = '#777';
                });

                const currentCircle = this.querySelector('.circle_chart .progress');
                const currentText = this.querySelector('.percent_text');
                if (currentCircle) currentCircle.style.stroke = '';
                if (currentText) currentText.style.fill = '';

                svg.querySelectorAll(`path.line-hover[data-from="${this.dataset.id}"]`).forEach(line => {
                    line.style.opacity = '1';
                    line.classList.add('active');
                    line.style.stroke = 'url(#gradientLeft)';
                    line.style.strokeDashoffset = '1000';
                    setTimeout(() => {
                        line.style.strokeDashoffset = '0';
                        line.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)';

                    }, 80);
                });

                svg.querySelectorAll(`path.color-bar[data-from="${this.dataset.id}"]`).forEach(bar => {
                    bar.style.stroke = '';
                });

                setTimeout(() => {
                    connections.forEach(productId => {
                        const productLi = document.querySelector(`#productList li[data-id="${productId}"]`);
                        if (productLi) {
                            productLi.classList.add('connected');

                            const productCircle = productLi.querySelector('.circle_chart .progress');
                            const productText = productLi.querySelector('.percent_text');
                            if (productCircle) productCircle.style.stroke = '';
                            if (productText) productText.style.fill = '';

                            svg.querySelectorAll(`path.line-hover[data-to="${productId}"]`).forEach(line => {
                                line.style.opacity = '1';
                                line.classList.add('active');
                                line.style.stroke = 'url(#gradientRight)';
                                line.style.strokeDashoffset = '1000';
                                setTimeout(() => {
                                    line.style.strokeDashoffset = '0';
                                    line.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)';

                                }, 80);
                            });

                            setTimeout(() => {
                                svg.querySelectorAll(`path.color-bar[data-to="${productId}"]`).forEach(bar => {
                                    bar.style.stroke = '';
                                });
                            }, 850);
                        }
                    });
                }, 800);
            });

            li.addEventListener('mouseleave', function () {
                centerNode.classList.remove('purple', 'blue');

                document.querySelectorAll('.circle_chart .progress').forEach(circle => {
                    circle.style.stroke = '';
                });
                document.querySelectorAll('.percent_text').forEach(text => {
                    text.style.fill = '';
                });

                svg.querySelectorAll('path.line-hover, path.line-hover-reverse').forEach(el => {
                    el.style.opacity = '0';
                    el.classList.remove('active');
                    el.style.strokeDashoffset = '1000';
                    el.style.transition = 'none';
                });

                svg.querySelectorAll('path.color-bar').forEach(bar => {
                    bar.style.stroke = '';
                });

                productList.forEach(item => item.classList.remove('connected'));
                operatorList.forEach(item => item.classList.remove('connected'));
            });
        });

        // 상품 호버
        productList.forEach(li => {
            li.addEventListener('mouseenter', function () {
                const connections = this.dataset.connects.split(',').filter(c => c);
                centerNode.classList.add('blue');
                centerNode.classList.remove('purple');

                document.querySelectorAll('.circle_chart .progress').forEach(circle => {
                    circle.style.stroke = '#777';
                });
                document.querySelectorAll('.percent_text').forEach(text => {
                    text.style.fill = '#777';
                });

                svg.querySelectorAll('path.color-bar').forEach(bar => {
                    bar.style.stroke = '#777';
                });

                const currentCircle = this.querySelector('.circle_chart .progress');
                const currentText = this.querySelector('.percent_text');
                if (currentCircle) currentCircle.style.stroke = '';
                if (currentText) currentText.style.fill = '';

                svg.querySelectorAll(`path.line-hover-reverse[data-to="${this.dataset.id}"]`).forEach(line => {
                    line.style.opacity = '1';
                    line.classList.add('active');
                    line.style.stroke = 'url(#gradientRight)';
                    line.style.strokeDashoffset = '1000';
                    setTimeout(() => {
                        line.style.strokeDashoffset = '0';
                        line.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)';

                    }, 80);
                });

                svg.querySelectorAll(`path.color-bar[data-to="${this.dataset.id}"]`).forEach(bar => {
                    bar.style.stroke = '';
                });

                setTimeout(() => {
                    connections.forEach(operatorId => {
                        const operatorLi = document.querySelector(`#operatorList li[data-id="${operatorId}"]`);
                        if (operatorLi) {
                            operatorLi.classList.add('connected');

                            const operatorCircle = operatorLi.querySelector('.circle_chart .progress');
                            const operatorText = operatorLi.querySelector('.percent_text');
                            if (operatorCircle) operatorCircle.style.stroke = '';
                            if (operatorText) operatorText.style.fill = '';

                            svg.querySelectorAll(`path.line-hover-reverse[data-from="${operatorId}"]`).forEach(line => {
                                line.style.opacity = '1';
                                line.classList.add('active');
                                line.style.stroke = 'url(#gradientLeft)';
                                line.style.strokeDashoffset = '1000';
                                setTimeout(() => {
                                    line.style.strokeDashoffset = '0';
                                    line.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)';

                                }, 80);
                            });

                            setTimeout(() => {
                                svg.querySelectorAll(`path.color-bar[data-from="${operatorId}"]`).forEach(bar => {
                                    bar.style.stroke = '';
                                });
                            }, 850);
                        }
                    });
                }, 800);
            });

            li.addEventListener('mouseleave', function () {
                centerNode.classList.remove('purple', 'blue');

                document.querySelectorAll('.circle_chart .progress').forEach(circle => {
                    circle.style.stroke = '';
                });
                document.querySelectorAll('.percent_text').forEach(text => {
                    text.style.fill = '';
                });

                svg.querySelectorAll('path.line-hover, path.line-hover-reverse').forEach(el => {
                    el.style.opacity = '0';
                    el.classList.remove('active');
                    el.style.strokeDashoffset = '1000';
                    el.style.transition = 'none';
                });

                svg.querySelectorAll('path.color-bar').forEach(bar => {
                    bar.style.stroke = '';
                });

                productList.forEach(item => item.classList.remove('connected'));
                operatorList.forEach(item => item.classList.remove('connected'));
            });
        });

        drawConnections();

        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(drawConnections, 200);
        });
    }
});