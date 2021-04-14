window.addEventListener("resize", resizeSvg)
function SVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
};

function setSvgSize() {
    var width = $(".col").outerWidth() - $(".col").width();
    var left = ($("body").width() - width ) / 2;
    var top = $($(".row")[0]).outerHeight() + $($(".row")[1]).outerHeight();
    var svg_container_style = `
        position: absolute;
        width: ${width}px;
        height: 100%;
        left: ${left}px;
        top: ${top}px;
    `;
    $('#svg_container').attr('style', svg_container_style);
}

function resizeSvg() {
    setSvgSize();
    var new_svg = $(SVG('svg'))
                    .attr('style', "width:100%; height:100%")
                    .append($('line'));
    $('svg').remove();
    new_svg.appendTo($('#svg_container'));
    
};

function CreateSVG() {
    setSvgSize();
    $(SVG('svg'))
        .attr('style', "width:100%; height:100%")
        .appendTo($('#svg_container'));
};

var leftEl, rightEl;
function drawLine(leftEl, rightEl) {
    var top = $($(".row")[0]).outerHeight() + $($(".row")[1]).outerHeight();
    var line_color = $("input[type='radio'][name='Type']:checked").val();
    var x1 = "0";
    var y1 = $(leftEl).offset().top + $(leftEl).height()/2 - top;
    var x2 = "100%";
    var y2 = $(rightEl).offset().top + $(rightEl).height()/2 - top;

    $(SVG('line'))
        .attr('stroke-width', "4px")
        .attr('stroke', line_color)
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .on("dblclick", function(d){
            if (confirm('Are you sure you want to remove the line?')) {
                this.remove();
            }
        })
        .appendTo($('svg'));
    $('line').each(function (index) {
        this.id = `line${index}`;
    })
}

$(".box-left, .box-right").on('click', function() {
    if ($(this).hasClass('box-left')) {
        leftEl = this;
        if($(this).hasClass('table-active')){
            $(this).removeClass('table-active'); 
        } else {
            $(this).addClass('table-active').siblings().removeClass('table-active');
        }
    }
    if($(this).hasClass('box-right')) {
        rightEl = this;
        if($(this).hasClass('table-active')){
            $(this).removeClass('table-active'); 
        } else {
            $(this).addClass('table-active').siblings().removeClass('table-active');
        }
    }
    if (leftEl && rightEl) {
        drawLine(leftEl, rightEl);
        leftEl = rightEl = null;
    }
})

