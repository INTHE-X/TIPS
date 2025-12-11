$(document).ready(function(){




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

        $('.subPage_tabBtn ul li a').on('click', function(e){
            e.preventDefault();
            $(this).parent().addClass('active').siblings().removeClass('active');
            var idx = $(this).parent().index();
            $('.subPage_tabBox').eq(idx).addClass('active').siblings().removeClass('active');
            $('.subPage_tab_desc p').eq(idx).addClass('active').siblings().removeClass('active');
                        setTimeout(function() {
                setHeightSubWideTableHead();
            }, 1);
            }); 

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

            var subWideTable = $('.sub_wideTable, .distr_graph, .company_list_scroll');

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
            

        $('.distr_tabBtn .tabOpen').on('click', function(){
            $(this).toggleClass('active');
            if($(this).hasClass('active')){
                $('.distr_tabList').stop().slideDown(300);
            }
            else{
                $('.distr_tabList').stop().slideUp(300);
            }
        });

        $('.distr_tabList li button').on('click', function(e){
            e.preventDefault();
            $(this).parent('li').addClass('active').siblings().removeClass('active');
            var txt = $(this).children('span').text();
            $('.distr_tabBtn .tabOpen span').text(txt);

            var idx = $(this).parent().index();

            var numChange = $('.distr_tabNum span');
            var txtChange = $('.distr_graph_top h2');
            if(idx == 0){
                numChange.text('3,516');
                txtChange.text('지역별 선정 현황');
            }
            if(idx == 1){
                numChange.text('3,477');
                txtChange.text('산업별 선정 현황');
            }
            if(idx == 2){
                numChange.text('3,221');
                txtChange.text('기술별 선정 현황');
            }

            $('.distr_tab').eq(idx).addClass('active').siblings().removeClass('active');
            $('.distr_graph').eq(idx).addClass('active').siblings().removeClass('active');

            setTimeout(function() {
                setHeightSubWideTableHead();
            }, 1);
        });

        $('.statistic_graphTabBtnList.wide li a, .stat_graphTabWideBtnList li a').on('click', function(e){
            e.preventDefault();
            $(this).parent('li').addClass('active').siblings().removeClass('active');
            var idx = $(this).parent().index();
            $(this).closest('.divider.type2').siblings('.divider.type1').find('.stat_graphTabArea').eq(idx).addClass('active').siblings().removeClass('active');
        });

        $('#company_modal_nav ul li button').on('click', function(){
            $(this).parent('li').addClass('active').siblings().removeClass('active');
            var idx = $(this).parent().index();
            $('.cim_tab').eq(idx).addClass('active').siblings().removeClass('active');
        });

    
        $('.company_btns .btn_info').on('click', function(e){
            e.preventDefault();
            $('.company_info_modal_container').addClass('active');
            $('html, body').css('overflow', 'hidden');
        });

        $('.cim_close button').on('click', function(e){
            e.preventDefault();
            $('.company_info_modal_container').removeClass('active');
            $('html, body').css('overflow-y', 'visible');
            $('html, body').css('overflow-x', 'hidden');
        });

        $('.company_modal_nav ul li button').on('click', function(e){
            e.preventDefault();
            $(this).parent('li').addClass('active').siblings().removeClass('active');
            var idx = $(this).parent('li').index();
            $('.cim_tab').eq(idx).addClass('active').siblings().removeClass('active');
        });

});

$(window).on('load', function(){



const table = document.querySelectorAll('.distr_graph table');


table.forEach(table => {
if (!table) return;

const rows = table.querySelectorAll('tbody tr');
const totalRows = rows.length;
const baseDelay = 0.1; // 딜레이 간격 (초)

rows.forEach((tr, rowIndex) => {
  const cells = tr.querySelectorAll('td');
  
  cells.forEach((td, colIndex) => {
    const value = parseFloat(td.textContent.trim());
    
    if (isNaN(value)) return;
    
    
    if (value >= 0 && value <= 5) {
      td.classList.add('range1');
    } else if (value >= 6 && value <= 20) {
      td.classList.add('range2');
    } else if (value >= 21 && value <= 50) {
      td.classList.add('range3');
    } else if (value >= 51 && value <= 120) {
      td.classList.add('range4');
    } else if (value >= 121) {
      td.classList.add('range5');
    }

    const diagonalIndex = (totalRows - 1 - rowIndex) + colIndex;
    td.style.transitionDelay = `${diagonalIndex * baseDelay}s`;
  });
});
})


});