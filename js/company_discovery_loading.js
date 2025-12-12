// 페이지 로드 시 애니메이션
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        document.querySelector('.left-section').classList.add('animate');
        document.querySelector('.right-section').classList.add('animate');
    }, 100);

    // 초기 렌더링 요소
    const imageEl = document.getElementById('imageArea');
    const videoEl = document.getElementById('stepVideo');

    // STEP 1 초기 이미지 설정
    imageEl.style.backgroundImage = `url('${stepsData[0].image}')`;
});

// 각 단계별 콘텐츠 데이터
const stepsData = [
    {
        title: '벤치마킹 기업 정의',
        description:
            '미래 성장 모형은 IBK데이터베이스에서 과거 성공사례 30개를 선정하고,<br>해당 중소기업들의 성장 과정을 분석하여 공통적인 성공 패턴을 도출했습니다.',
        image: '../img/company_discovery/image-area.png',
        video: null
    },
    {
        title: '성공 DNA 추출',
        description:
            '벤치마킹 과정을 통해 대체 데이터 라이브러리에서 14개의<br>공통 핵심 성장 요인과 107개의 잠재적 성장 DNA가 추출되었습니다.',
        image: '../img/company_discovery/image-area2.png',
        video: null
    },
    {
        title: '성공 DNA 검증',
        description:
            '벤치마킹 과정을 통해 대체 데이터 라이브러리에서 14개의<br> 공통 핵심 성장 요인과 107개의 잠재적 성장 DNA가 추출되었습니다.',
        image: '../img/company_discovery/image-area3.png',
        video: null
    },
    {
        title: '유망 기업 발굴',
        description:
            '미래성장모형을 IBK 데이터베이스에 등록된 74,394개<br>기업에 적용하였으며, 그중 선택된 산업 분야에서<br> 점수가 가장 높은 상위 30개 기업이 선정되었습니다.',
        image: null,
        video: '../img/company_discovery/loading_step4.mp4'
    }
];

let currentStep = 0;

// 스텝 변경 함수
function changeStep(stepIndex) {
    document.querySelectorAll('.step-item').forEach((item, index) => {
        item.classList.remove('active', 'completed');

        if (index < stepIndex) {
            item.classList.add('completed');

            if (index < 3) {
                item.style.setProperty('--line-height', '45px');
                item.style.setProperty(
                    '--line-gradient',
                    'linear-gradient(180deg, #6E42D9 0%, rgba(110, 66, 217, 0) 100%)'
                );
            } else {
                item.style.setProperty('--line-height', '0px');
            }
        } else if (index === stepIndex) {
            item.classList.add('active');

            if (index < 3) {
                setTimeout(() => {
                    let height = 0;
                    const duration = 1000;
                    const startTime = performance.now();

                    item.style.setProperty(
                        '--line-gradient',
                        'linear-gradient(180deg, #6E42D9 0%, rgba(110, 66, 217, 0) 100%)'
                    );

                    function animateLine(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const easeProgress = 1 - Math.pow(1 - progress, 3);
                        height = 45 * easeProgress;

                        item.style.setProperty('--line-height', `${height}px`);

                        if (progress < 1) requestAnimationFrame(animateLine);
                    }

                    requestAnimationFrame(animateLine);
                }, 100);
            } else {
                item.style.setProperty('--line-height', '0px');
            }
        } else {
            item.style.setProperty('--line-height', '0px');
        }
    });

    // 요소 페이드아웃
    const titleEl = document.getElementById('sectionTitle');
    const descEl = document.getElementById('sectionDescription');
    const imageEl = document.getElementById('imageArea');
    const videoEl = document.getElementById('stepVideo');

    titleEl.style.opacity = '0';
    descEl.style.opacity = '0';
    imageEl.style.opacity = '0';
    videoEl.style.opacity = '0';

    // 500ms 후 변경 적용
    setTimeout(() => {
        titleEl.innerHTML = stepsData[stepIndex].title;
        descEl.innerHTML = stepsData[stepIndex].description;

        if (stepsData[stepIndex].video) {
            // ★ 영상 모드 - 회색 박스 추가
            videoEl.querySelector('source').src = stepsData[stepIndex].video;
            videoEl.load();
            videoEl.style.display = 'block';
            imageEl.style.backgroundImage = 'none';
            imageEl.classList.add('video-mode');
        } else {
            // ★ 이미지 모드 - 회색 박스 제거
            videoEl.style.display = 'none';
            imageEl.style.backgroundImage = `url('${stepsData[stepIndex].image}')`;
            imageEl.classList.remove('video-mode');
        }

        titleEl.style.opacity = '1';
        descEl.style.opacity = '1';
        imageEl.style.opacity = '1';
        videoEl.style.opacity = '1';
    }, 500);
}

// 자동 진행 로직
document.addEventListener('DOMContentLoaded', function () {
    const firstStep = document.querySelector('.step-item[data-step="1"]');

    if (firstStep) {
        firstStep.style.setProperty(
            '--line-gradient',
            'linear-gradient(180deg, #6E42D9 0%, rgba(110, 66, 217, 0) 100%)'
        );

        setTimeout(() => {
            let height = 0;
            const duration = 1000;
            const startTime = performance.now();

            function animateFirstLine(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                height = 45 * easeProgress;

                firstStep.style.setProperty('--line-height', `${height}px`);

                if (progress < 1) requestAnimationFrame(animateFirstLine);
            }

            animateFirstLine(performance.now());
        }, 300);
    }

    // 자동 스텝 진행
    const interval = setInterval(() => {
        currentStep++;

        if (currentStep < 4) {
            changeStep(currentStep);
        } else {
            clearInterval(interval);

            // 3초 후 페이지 전환
            setTimeout(() => {
                let overlay = document.querySelector('.page-transition-overlay');

                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'page-transition-overlay';
                    document.body.appendChild(overlay);
                }

                overlay.classList.remove('fade-out');
                overlay.classList.add('fade-in');

                setTimeout(() => {
                    location.href = 'company_discovery_after.html';
                }, 600);
            }, 3000);
        }
    }, 3000);
});