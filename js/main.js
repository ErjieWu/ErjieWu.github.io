let _width = $(window).width();
let _height = $(window).height();
let width = 0.9 * _width;
let height = 0.96 * _height;
let padding = {'left': 0.2*width, 'bottom': 0.1*height, 'top': 0.2*height, 'right': 0.1*width};
let width_figure = width - padding.left - padding.right;  
let height_figure = height - padding.top - padding.bottom;
let fontFamily;
let x_attr = 'name';
let categories;
let duration = 500; // 动画持续时间
let allLocations;
let allNames;
let totalLocations;
let CaptionSize = 0.03 * height;
let TitleSize = 0.05 * height;
let TickSize = 0.015 * height;
_LANGUAGES = 'zh';

// 页面加载完成后执行，页面组件设置
window.onload = function() {
    // Language Button
    var control0 = document.getElementById("Language");
    control0.style.width = "100%";         
    control0.style.height = "100%";  
    control0.style.position = "absolute";   
    control0.style.left = "0%";            

    // About Me Button
    var control1 = document.getElementById("AboutMe");
    control1.style.width = "13%";           // width of the button in the container
    control1.style.position = "absolute";   // position of the button
    control1.style.left = "15%";            // left position of the button

    // Research Button
    var control2 = document.getElementById("Research");
    control2.style.width = "13%";
    control2.style.position = "absolute";
    control2.style.left = "29%";

    // Publications Button
    var control3 = document.getElementById("Publications");
    control3.style.width = "13%";
    control3.style.position = "absolute";
    control3.style.left = "43%";

    // Activities Button
    var control4 = document.getElementById("Activities");
    control4.style.width = "13%";
    control4.style.position = "absolute";
    control4.style.left = "57%";

    // Personal Button
    var control5 = document.getElementById("Personal");
    control5.style.width = "13%";
    control5.style.position = "absolute";
    control5.style.left = "71%";
};

function main() {
    set_ui();
    ShowPageAboutMe();
    listening();
}

main()

