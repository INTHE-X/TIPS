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

    // progressBar 비디오 초기 숨김
    const progressBarVideo = document.getElementById('progressBar');
    if (progressBarVideo) {
        progressBarVideo.style.opacity = '0';
        progressBarVideo.style.transition = 'opacity 0.5s ease-in-out';
    }

    // 첫 스텝 시작
    changeStep(0);
});

// ================================
// 스텝 데이터
// ================================
const stepsData = [
    {
        title: 'TIPS 성공 사례 학습',
        description:
            '투자유치형 관점에서 TIPS 출신 업력 7년 이상의 핵심 성공 사례<br> 30개 기업을 선정하여 빅데이터 기반의 조사를 수행합니다.',
        video: '../img/company_discovery/loading_step1.webm',
        stayTime: 15000
    },
    {
        title: 'TIPS 성장 요인 추출',
        description:
            'TIPS 핵심 성공 사례의 공통적인 성장 패턴과 성공 요인을 <br> 잠재 변수로 개발하여 제시합니다.',
        video: '../img/company_discovery/loading_step2.mp4',
        stayTime: 8000
    },
    {
        title: 'TIPS 성장 요인 검증',
        description:
            '통계적 유의성 검증을 통해 실질적인 성공 요인을 선별하고,<br> 개별 변수로서의 중요도에 따른 가중치를 부여합니다.',
        video: '../img/company_discovery/loading_step3.webm',
        stayTime: 10000
    },
    {
        title: 'TIPS MRI 진단',
        description:
            '인공지능 모형에 의거하여 TIPS 선정 및 잠재 TIPS 후보 <br> 기업들을 진단하고,향후 성장 지원을 위한 AI Agent 기반의 <br> 시사점을 제공합니다.',
        video: '../img/company_discovery/loading_step4.mp4',
        stayTime: 4000
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
    const progressBarVideo = document.getElementById('progressBar');

    // 페이드 아웃
    [titleEl, descEl, imageEl, videoEl].forEach(el => el.style.opacity = '0');
    
    // progressBar는 4번째 스텝이 아닐 때 숨김
    if (stepIndex !== 3 && progressBarVideo) {
        progressBarVideo.style.opacity = '0';
    }

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

        // 4번째 스텝일 때 progressBar도 페이드 인
        if (stepIndex === 3 && progressBarVideo) {
            progressBarVideo.style.opacity = '1';
            progressBarVideo.currentTime = 0;
            progressBarVideo.play();
        }

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
                    onAllAnimationsComplete();
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
// function goNextPage() {
//     let overlay = document.querySelector('.page-transition-overlay');

//     if (!overlay) {
//         overlay = document.createElement('div');
//         overlay.className = 'page-transition-overlay';
//         document.body.appendChild(overlay);
//     }

//     overlay.classList.remove('fade-out');
//     overlay.classList.add('fade-in');

//     setTimeout(() => {
//         location.href = 'company_discovery_after.html';
//     }, 600);
// }

function onAllAnimationsComplete() {
    // 특정 div에 클래스 추가
    const targetDiv = document.querySelector('.step_link');
    setTimeout(() => {
        if (targetDiv) {
            targetDiv.classList.add('active');
        }
    }, 300);
}