let currentStep = 0;
let stepTimer = null;

// ================================
// 페이지 로드
// ================================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.left-section')?.classList.add('animate');
        document.querySelector('.right-section')?.classList.add('animate');
    }, 100);

    // 첫 스텝 시작
    changeStep(0);
});

// ================================
// 스텝 데이터
// ================================
const stepsData = [
    {
        title: '벤치마킹 기업 정의',
        description:
            '미래 성장 모형은 IBK데이터베이스에서 과거 성공사례 30개를 선정하고,<br>해당 중소기업들의 성장 과정을 분석하여 공통적인 성공 패턴을 도출했습니다.',
        video: '../img/company_discovery/loading_step1.mp4',
        stayTime: 13000
    },
    {
        title: '성공 DNA 추출',
        description:
            '벤치마킹 과정을 통해 대체 데이터 라이브러리에서 14개의<br>공통 핵심 성장 요인과 107개의 잠재적 성장 DNA가 추출되었습니다.',
        video: '../img/company_discovery/loading_step2.mp4',
        stayTime: 9000
    },
    {
        title: '성공 DNA 검증',
        description:
            '벤치마킹 과정을 통해 대체 데이터 라이브러리에서 14개의<br> 공통 핵심 성장 요인과 107개의 잠재적 성장 DNA가 추출되었습니다.',
        video: '../img/company_discovery/loading_step3.mp4',
        stayTime: 6000
    },
    {
        title: '유망 기업 발굴',
        description:
            '미래성장모형을 IBK 데이터베이스에 등록된 74,394개<br>기업에 적용하였으며, 그중 선택된 산업 분야에서<br> 점수가 가장 높은 상위 30개 기업이 선정되었습니다.',
        video: '../img/company_discovery/loading_step4.mp4',
        stayTime: 6000
    }
];

// ================================
// 스텝 변경
// ================================
function changeStep(stepIndex) {
    currentStep = stepIndex;

    // 기존 타이머 제거
    if (stepTimer) {
        clearTimeout(stepTimer);
        stepTimer = null;
    }

    // STEP UI 처리
    document.querySelectorAll('.step-item').forEach((item, index) => {
        item.classList.remove('active', 'completed');

        if (index < stepIndex) {
            item.classList.add('completed');
            item.style.setProperty('--line-height', '45px');
        } else if (index === stepIndex) {
            item.classList.add('active');
            animateStepLine(item);
        } else {
            item.style.setProperty('--line-height', '0px');
        }
    });

    // 콘텐츠 요소
    const titleEl = document.getElementById('sectionTitle');
    const descEl = document.getElementById('sectionDescription');
    const imageEl = document.getElementById('imageArea');
    const videoEl = document.getElementById('stepVideo');
    const sourceEl = videoEl.querySelector('source');

    // 페이드 아웃
    [titleEl, descEl, imageEl, videoEl].forEach(el => el.style.opacity = '0');

    // ================================
    // 콘텐츠 변경
    // ================================
    setTimeout(() => {
        const step = stepsData[stepIndex];

        titleEl.innerHTML = step.title;
        descEl.innerHTML = step.description;

        sourceEl.src = step.video;
        videoEl.load();
        videoEl.style.display = 'block';
        imageEl.style.backgroundImage = 'none';
        imageEl.classList.add('video-mode');

        // 페이드 인
        [titleEl, descEl, imageEl, videoEl].forEach(el => el.style.opacity = '1');

        // ================================
        // 영상 길이 기준 자동 진행
        // ================================
        videoEl.onloadedmetadata = () => {
            const step = stepsData[currentStep];

            const durationMs = step.stayTime
                ? step.stayTime           // 강제 체류 시간
                : videoEl.duration * 1000; // 영상 길이

            stepTimer = setTimeout(() => {
                if (currentStep < stepsData.length - 1) {
                    changeStep(currentStep + 1);
                } else {
                    goNextPage();
                }
            }, durationMs);
        };


        videoEl.play();
    }, 500);
}

// ================================
// 스텝 라인 애니메이션
// ================================
function animateStepLine(item) {
    let height = 0;
    const duration = 1000;
    const startTime = performance.now();

    item.style.setProperty(
        '--line-gradient',
        'linear-gradient(180deg, #6E42D9 0%, rgba(110, 66, 217, 0) 100%)'
    );

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        height = 45 * ease;
        item.style.setProperty('--line-height', `${height}px`);

        if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

// ================================
// 마지막 페이지 전환
// ================================
function goNextPage() {
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
}
