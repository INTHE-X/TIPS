$(document).ready(function(){
gsap.registerPlugin(ScrollTrigger);

let tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".scrollBox",
                start: "top top",      
                end: "+=6000",         
                pin: true,             
                scrub: 1,        
            }
});
        tl.to('.fixed_bg', {
            width: '100%',
            height: '100%',
            duration: 7,
        });

        tl.to('#main .section_inner', {
            delay: -7,
            width: '100%',
            height: '100%',
            duration: 7,
        });

        tl.to('.fixed_bg', {
            delay: -3,
            borderRadius: 0,
            duration: 3,
        });

        tl.to("#main .fadeOut", {
            opacity: 0,
            scale: 1.5,
            filter: "blur(20px)",
            stagger: 1,
            duration: 8,
        })

        .to("#main", {
            opacity: 0, 
            visibility: 'hidden',
        });

        tl.set("#link", {
            visibility: 'visible',
        });

        tl.to('#link',{
            delay: -1,
            background: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(10px)",
            duration: 5,
        })

        tl.to('.link_tit p', {
            y: 0,
            duration: 2,
        });

        tl.to('.upEffect', {
            y: 0,
            duration: 2,
            stagger: 0.5,
        });

        tl.to('.link_tit', {
            y: 0,
            duration: 3,
        });

        tl.to('.linkFadeEffect', {
            opacity: 1,
            duration: 2,
        });

        tl.to("#link .link_list", {
            delay: -2,
            opacity: 1,
            ease: "power2.out",
            duration: 5,
        });

        window.addEventListener('resize', ScrollTrigger.refresh());

});