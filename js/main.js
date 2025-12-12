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

        function setHeight(){
            var listHighHeight = $('.link_list ul li.active').height();
            $('.llb_inner').css({
                'height': listHighHeight,
            });
        }
        setHeight();

        $(window).on('resize', function(){
            setHeight();
        });


        $('.link_list ul li').each(function(){
            $(this).on('mouseenter click', function(){
                $(this).addClass('active').siblings().removeClass('active');
                $(this).css({
                    'overflow': 'visible',
                });
                $(this).siblings().css({
                    'overflow': 'hidden',
                });
                $(this).children().find('.llb_vid').addClass('active').siblings().children().find('.llb_vid').removeClass('active');
                if($(this).hasClass('active')){
                    $(this).find('video').each(function() {
                    this.play();
                });

                $(this).siblings().find('video').each(function() {
                    this.pause();
                });
                }
            });
        });
            
        // function donutChartHeight(){
        //     $('.donutChart_line').each(function(){
        //         var donutHeight = $(this).parent().height();
        //         $(this).css({
        //             'width' : donutHeight,
        //         });
        //     });
        // }

        // donutChartHeight();

        // $(window).on('resize', function(){
        //     donutChartHeight();
        // });

        // $('.subPage_tabBtn ul li button').on('click', function(){
        //     $(this).parent().addClass('active').siblings().removeClass('active');
        //     var idx = $(this).parent().index();
        //     $('.subPage_tabBox').eq(idx).addClass('active').siblings().removeClass('active');
        //     $('.subPage_tab_desc p').eq(idx).addClass('active').siblings().removeClass('active');
        //     }); 

            $('.ratioChart_select ul li a').on('click', function(e){
                e.preventDefault();
                $(this).parent().addClass('active').siblings().removeClass('active');
                var idx = $(this).parent().index();
                $('.ratioChart').eq(idx).addClass('active').siblings().removeClass('active');
                if(idx == 0){
                    $('.ratioChart_arrow').addClass('continue').removeClass('close');
                }
                else{
                    $('.ratioChart_arrow').removeClass('continue').addClass('close');
                }
            })

            var subWideTable = $('.sub_wideTable');

            function setHeightSubWideTableHead(){
                subWideTable.each(function(){
                    var width = $(this).children('table').innerWidth();
                    var sub_wideTableHead = $(this).children().find('thead');
                    sub_wideTableHead.css({
                        'width': width,
                    });
                });
            }

            setHeightSubWideTableHead();

            $(window).on('resize', function(){
                setHeightSubWideTableHead();
            }); 
            
        window.addEventListener('resize', ScrollTrigger.refresh());

});