// 设置字体
function set_ui() {
    // 设置字体
    let ua = navigator.userAgent.toLowerCase();
    fontFamily = "Khand-Regular";
    if (/\(i[^;]+;( U;)? CPU.+Mac OS X/gi.test(ua)) {
        fontFamily = "PingFangSC-Regular";
    }
    d3.select("body")
        .style("font-family", fontFamily);
}

// 隐藏除了指定页面之外的其他页面
function hideOtherPages(exceptFigureNumber) {
    for (let i = 1; i <= 5; i++) {
        if (i !== exceptFigureNumber) {
            document.getElementById(`page${i}`).style.display = 'none';
        } else {
            document.getElementById(`page${i}`).style.display = 'block';
        }
    }
}

function RefreshPage() {
    for (let i = 1; i <= 5; i++) {if (document.getElementById(`page${i}`).style.display === 'block') {CallPage(i);}}
}

function CallPage(pageNumber) {
    hideOtherPages(pageNumber);
    switch (pageNumber) {
        case 1:
            ShowPageAboutMe();
            break;
        case 2:
            ShowPageResearch();
            break;
        case 3:
            ShowPagePublications();
            break;
        case 4:
            ShowPageActivities();
            break;
        case 5:
            ShowPagePersonal();
            break;
    }
}

// 设置事件监听器
function listening() {
    document.getElementById('AboutMe').addEventListener('click', () => {
        hideOtherPages(1);
        ShowPageAboutMe();
    });

    document.getElementById('Research').addEventListener('click', () => {
        hideOtherPages(2);
        ShowPageResearch();
    });

    document.getElementById('Publications').addEventListener('click', () => {
        hideOtherPages(3);
        ShowPagePublications();
    });

    document.getElementById('Activities').addEventListener('click', () => {
        hideOtherPages(4);
        ShowPageActivities();
    });

    document.getElementById('Personal').addEventListener('click', () => {
        hideOtherPages(5);
        ShowPagePersonal();
    });

    document.getElementById('Language').addEventListener('click', () => {
        control0 = document.getElementById("Language");
        control1 = document.getElementById("AboutMe");
        control2 = document.getElementById("Research");
        control3 = document.getElementById("Publications");
        control4 = document.getElementById("Activities");
        control5 = document.getElementById("Personal");
        if (_LANGUAGES === 'en') {
            _LANGUAGES = 'zh';
            control0.innerHTML = "Switch to English";
            control1.innerHTML = "关于我";
            control2.innerHTML = "研究";
            control3.innerHTML = "论文";
            control4.innerHTML = "学术活动";
            control5.innerHTML = "兴趣空间";
        } else {
            _LANGUAGES = 'en';
            control0.innerHTML = "切换到中文";
            control1.innerHTML = "About Me";
            control2.innerHTML = "Research";
            control3.innerHTML = "Publications";
            control4.innerHTML = "Activities";
            control5.innerHTML = "Personal Space";
        }
        RefreshPage();
    });
}
