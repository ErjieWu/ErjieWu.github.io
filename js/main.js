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

window.onload = function() {
    var slider = document.getElementById("yearSlider");
    // slider.style.transform = "rotate(90deg)";
    slider.style.width = width_figure+"px"; // 调整滑动条长度
    slider.style.height = "20px";
    slider.style.position = "absolute";
    slider.style.right = "10%";
    slider.style.top = "0%";
    slider.style.transformOrigin = "top right";

    var choice1 = document.getElementById("university1-select");
    choice1.style.width = 0.4*width_figure + "px";
    choice1.style.height = "70%";
    choice1.style.position = "absolute";
    choice1.style.left = "15%";
    choice1.style.fontSize = "70%";

    var choice2 = document.getElementById("university2-select");
    choice2.style.width = 0.4*width_figure + "px";
    choice2.style.height = "70%";
    choice2.style.position = "absolute";
    choice2.style.right = "15%";
    choice2.style.fontSize = "70%";

    var control1 = document.getElementById("btn1");
    control1.style.width = "13%";
    control1.style.position = "absolute";
    control1.style.left = "15%";

    var control2 = document.getElementById("btn2");
    control2.style.width = "13%";
    control2.style.position = "absolute";
    control2.style.left = "29%";

    var control3 = document.getElementById("btn3");
    control3.style.width = "13%";
    control3.style.position = "absolute";
    control3.style.left = "43%";

    var control4 = document.getElementById("btn4");
    control4.style.width = "13%";
    control4.style.position = "absolute";
    control4.style.left = "57%";

    var control5 = document.getElementById("btn5");
    control5.style.width = "13%";
    control5.style.position = "absolute";
    control5.style.left = "71%";
};

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

function draw_fig1(data, year) {
    // 清空既有图像
    d3.select('#figure1').html('');

    // 筛选出指定年份的数据并根据rank排序
    let datayear = data.filter(d => d.year === year.toString()).sort((a, b) => a.rank - b.rank);

    // 计算堆叠数据
    let stackData1 = datayear.map(d => ({
        name: d.name,
        teaching: d['scores_teaching_rate'] * d.scores_teaching,
        international_outlook: d['scores_international_outlook_rate'] * d.scores_international_outlook,
        industry_income: d['scores_industry_income_rate'] * d.scores_industry_income,
        research: d['scores_research_rate'] * d.scores_research,
        citations: d['scores_citations_rate'] * d.scores_citations,
        originalData: {
            rank: d.rank,
            scores_teaching: d.scores_teaching,
            scores_international_outlook: d.scores_international_outlook,
            scores_industry_income: d.scores_industry_income,
            scores_research: d.scores_research,
            scores_citations: d.scores_citations,
            scores_overall: d.scores_overall,
            scores_teaching_rank: d.scores_teaching_rank,
            scores_international_outlook_rank: d.scores_international_outlook_rank,
            scores_industry_income_rank: d.scores_industry_income_rank,
            scores_research_rank: d.scores_research_rank,
            scores_citations_rank: d.scores_citations_rank
        }
    }));

    // 清空之前的内容
    let fig1 = d3.select('#figure1').html('').append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');

    // 创建x轴和y轴比例尺
    let x = d3.scaleBand()
        .range([0, width_figure])
        .domain(stackData1.map(d => d.name))
        .padding(0.1);
    let y = d3.scaleLinear()
        .range([height_figure, 0])
        .domain([0, 100]); // 纵轴的总高度为100

    // 创建工具提示
    let tooltip = d3.select("#tooltip");

    // 创建堆叠图布局
    let keys1 = ['teaching', 'international_outlook', 'industry_income', 'research', 'citations'];
    let series1 = d3.stack()
        .keys(keys1)
        (stackData1);

    function getColorForKey(key) {
        let index = keys1.indexOf(key);
        return d3.schemeCategory10[index];
    }

    function redrawStackedChart(selectedAttribute) {
        let reorderedKeys = [selectedAttribute].concat(keys1.filter(k => k !== selectedAttribute));
        series1 = d3.stack().keys(reorderedKeys)(stackData1);

        fig1.selectAll('.layer').remove();
        // 绘制堆叠图
        fig1.selectAll('.layer')
            .data(series1)
            .enter().append('g')
            .attr('class', d => 'layer '+ d.key)
            .style('fill', (d, i) => getColorForKey(d.key))
            .selectAll('.data-rect')  // 使用特定的类
            .data(d => d)
            .enter().append('rect')
            .attr('class', 'data-rect')   // 添加类名
            .attr('x', d => x(d.data.name))
            .attr('y', d => y(d[1]))
            .attr('height', d => {
                let height = y(d[0]) - y(d[1]);
                return isNaN(height) ? 0 : height;
            })
            .attr('width', x.bandwidth())
            .on('mouseover', function (event, d) {
                if (d.data && d.data.originalData) {
                    let originalData = d.data.originalData;

                    // 高亮所有相关的矩形
                    fig1.selectAll('.data-rect').filter(rect => rect && rect.data && rect.data.name === d.data.name)
                        .style("filter", "url(#glow)")
                        .style("stroke", "orange")
                        .style("stroke-width", "2");

                    tooltip.html("Name: " + d.data.name +
                                "<br>Rank: " + originalData.rank +
                                "<br>Teaching: " + originalData.scores_teaching + " (" + originalData.scores_teaching_rank + ")" +
                                "<br>International Outlook: " + originalData.scores_international_outlook + " (" + originalData.scores_international_outlook_rank + ")" +
                                "<br>Industry Income: " + originalData.scores_industry_income + " (" + originalData.scores_industry_income_rank + ")" +
                                "<br>Research: " + originalData.scores_research + " (" + originalData.scores_research_rank + ")" +
                                "<br>Citations: " + originalData.scores_citations + " (" + originalData.scores_citations_rank + ")" +
                                "<br>Scores Overall: " + originalData.scores_overall)
                        .style("visibility", "visible")
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY + 10) + "px");
                }
            })
            .on('mouseout', function () {
                fig1.selectAll('.data-rect')
                    .style("filter", "")
                    .style("stroke", "")
                    .style("stroke-width", "");
                tooltip.style("visibility", "hidden");
            });
    }

    redrawStackedChart('teaching')

    // 添加x轴和y轴
    fig1.append('g')
        .attr('transform', 'translate(0,' + height_figure + ')')
        .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat(''));
    fig1.append('g')
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .selectAll("text")
        .style("font-size", TickSize+'px'); 

    // 添加标题
    fig1.append('text')
        .attr('x', (width_figure / 2))
        .attr('y', 0 - (padding.top / 2))
        .attr('text-anchor', 'middle')
        .style('font-size', TitleSize+'px')
        // .style('text-decoration', 'underline')
        .text('Ranking of Universities (THE '+year+')');

    // 添加坐标轴说明
    fig1.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width_figure/2)
        .attr('y', height_figure+padding.bottom/2)
        .style('font-size', CaptionSize+'px')
        .text('University');
    fig1.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height_figure/2)
        .attr('y', -CaptionSize*1.5)
        .style('font-size', CaptionSize+'px')
        .text('Score');

    // 添加图例
    let tempSize = 0.04 * height;
    let legend = fig1.selectAll('.legend')
        .data(keys1)
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => 'translate(' + -0.2*tempSize + ',' +((i+0.17) * tempSize*1.1)  + ')');

    legend.append('rect')
        .attr('x', width_figure - tempSize)
        .attr('width', tempSize*1.125)
        .attr('height', tempSize)
        .style('fill', (d, i) => getColorForKey(d))
        .on('mouseover', function(event, attribute) {
            d3.select(this)
              .style('stroke', 'orange')
              .style('stroke-width', '2px');

            fig1.selectAll(`.layer.${attribute} .data-rect`)
              .style("filter", "url(#glow)")
              .style("stroke", "orange")
              .style("stroke-width", "2");
        })
        .on('mouseout', function(event, attribute) {
            d3.select(this)
              .style('stroke-width', '0px');

            const attributes = ['teaching', 'international_outlook', 'industry_income', 'research', 'citations'];
            let attributeIndex = attributes.indexOf(attribute);
            fig1.selectAll(`.layer.${attribute} .data-rect`)
              .style("filter", "")
              .style("stroke", "")
              .style("stroke-width", "");
        })
        .on('click', function(event, attribute) {
            redrawStackedChart(attribute);
        });

    legend.append('text')
        .attr('x', width_figure - tempSize*1.2)
        .attr('y', tempSize/2)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .style('font-size', tempSize*0.5 + 'px') 
        .text(d => d);

    // 添加上方和右方的框线
    fig1.append('g')
        .attr('class', 'frame')
        .append('rect')
        .attr('width', width_figure)
        .attr('height', height_figure)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 1);
}

function draw_fig2(data, year) {
    // 筛选出指定年份的数据
    let datayear = data.filter(d => d.year === year.toString());

    // 计算每个location的数量
    let locationCounts = datayear.reduce((acc, curr) => {
        acc[curr.location] = (acc[curr.location] || 0) + 1;
        return acc;
    }, {});

    // 根据location的数量降序排序
    let locationsSorted = Object.keys(locationCounts).sort((a, b) => locationCounts[b] - locationCounts[a]);

    // 对每个location内部的数据根据rank排序，并按照location的数量排序将它们合并
    let sortedData = locationsSorted.flatMap(location => {
        return datayear.filter(d => d.location === location).sort((a, b) => a.rank - b.rank);
    });

    // 创建SVG容器并添加g元素用于绘制图表
    let fig2 = d3.select('#figure2').html('').append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');

    // 创建x轴和y轴比例尺
    let xScale = d3.scaleBand()
        .range([0, width_figure])
        .domain(sortedData.map(d => d.name))
        .padding(0.1);
    let yScale2 = d3.scaleLinear()
        .range([height_figure, 0])
        .domain([0, 100]);

    // 绘制x轴和y轴
    fig2.append('g')
        .attr('transform', 'translate(0,' + height_figure + ')')
        .call(d3.axisBottom(xScale).tickSizeOuter(0).tickFormat(''));
    fig2.append('g')
        .call(d3.axisLeft(yScale2).tickSizeOuter(0))
        .selectAll("text")
        .style("font-size", TickSize+'px');

    // 生成location到索引的映射
    let locations = [...new Set(sortedData.map(d => d.location))];
    let locationToIndex = {};
    locations.forEach((d, i) => {
        locationToIndex[d] = i;
    });
    let displayedLocations = [...new Set(sortedData.map(d => d.location))];

    // 绘制条形背景
    fig2.selectAll('.bar-background')
        .data(sortedData)
        .enter().append('rect')
        .attr('class', 'bar-background')
        .attr('x', d => xScale(d.name))
        .attr('y', yScale2.range()[1])
        .attr('width', xScale.bandwidth())
        .attr('height', yScale2.range()[0])
        .attr('fill', d => getColorForLocation(d.location));

    // 计算图例的位置
    let legendX = width_figure*1.02; // 在图表右侧留出一定间距
    let legendY = 0; // 起始位置
    let legendHeight = height_figure/39; // 每个图例项的高度
    let legendWidth = legendHeight*1.125; // 每个图例项的宽度
    let legendSpacing = legendHeight*0.3; // 图例项之间的间距
    let fontSize = legendHeight*0.8; // 图例项文本的字体大小

    // 使用currentYearLocations数组绘制图例
    let currentYearLocations = [...new Set(sortedData.map(d => d.location))].sort();
    let legend = fig2.selectAll('.legend')
        .data(currentYearLocations)  // 使用按字母排序的allLocations数组
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => 'translate(0,' + (i * (legendHeight + legendSpacing) + legendY) + ')');

    // 绘制图例的颜色矩形
    legend.append('rect')
        .attr('x', legendX)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', d => getColorForLocation(d))  // 使用颜色映射函数
        .on('mouseover', function(event, d) {
            d3.select(this)
              .style('stroke', 'orange')
              .style('stroke-width', '2px');

            fig2.selectAll('.bar')
              .filter(data => data.location === d)
              .style('fill', 'orange');
        })
        .on('mouseout', function() {
            d3.select(this)
              .style('stroke-width', '0px');

            fig2.selectAll('.bar')
              .style('fill', d => 'steelblue');
        })

    // 绘制图例的文本标签
    legend.append('text')
        .attr('x', legendX + legendWidth*1.5)
        .attr('y', legendHeight / 2 + legendSpacing)
        .style('font-size', fontSize + 'px')
        .text(d => d);

    // 绘制条形图并交替着色
    fig2.selectAll('.bar')
        .data(sortedData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.name))
        .attr('y', d => yScale2(Number(d.scores_overall)))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height_figure - yScale2(Number(d.scores_overall)))
        // .attr('fill', d => locationToIndex[d.location] % 2 === 0 ? 'steelblue' : 'lightsteelblue')
        .attr('fill', 'steelblue')
        .on('mouseover', function (event, d) {
            // 显示工具提示
            d3.select('#tooltip')
                .html("Name: " + d.name + "<br>" +
                    "Overall Score: " + d.scores_overall + "<br>" +
                    "Rank: " + d.rank + "<br>" +
                    "Location: " + d.location)
                .style("visibility", "visible")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");

            // 高亮显示
            d3.select(this).style('fill', 'orange');
        })
        .on('mouseout', function (d) {
            // 隐藏工具提示
            d3.select('#tooltip').style("visibility", "hidden");

            // 恢复原始颜色
            // d3.select(this).style('fill', d => locationToIndex[d.location] % 2 === 0 ? 'steelblue' : 'lightsteelblue');
            d3.select(this).style('fill', 'steelblue');
        });

    // 添加标题
    fig2.append('text')
        .attr('x', width_figure / 2)
        .attr('y', -padding.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', TitleSize+'px')
        .text('University Scores Overview (' + year + ')');

    // 添加坐标轴说明
    fig2.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width_figure / 2)
        .attr('y', height_figure + padding.bottom / 2)
        .style('font-size', CaptionSize+'px')
        .text('University');
    fig2.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height_figure / 2)
        .attr('y', -CaptionSize*1.5)
        .style('font-size', CaptionSize+'px')
        .text('Overall Score');    

    // 添加框线
    fig2.append('g')
        .attr('class', 'frame')
        .append('rect')
        .attr('width', width_figure)
        .attr('height', height_figure)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 1);

}

function draw_fig3(data, year) {
    // 左侧图
    // 筛选出指定年份的数据
    let datayear = data.filter(d => d.year === year.toString());

    // 对每个location内部的数据根据location值和rank排序，并按照location的值排序将它们合并
    let sortedData = datayear.sort((a, b) => {
        // 首先按照location值排序
        if (a.location < b.location) return 1;
        if (a.location > b.location) return -1;
        
        // 如果location值相同，则按照rank排序
        return b.rank - a.rank;
    });

    // 创建SVG容器并添加g元素用于绘制图表
    let fig3 = d3.select('#figure3').html('').append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');

    // 计算缩放比例，使旋转后的图像宽度匹配height_figure
    let scaleFactor = height_figure / width_figure;

    // 创建x轴和y轴比例尺
    let xScale = d3.scaleBand()
        .range([0, width_figure])
        .domain(sortedData.map(d => d.name))
        .padding(0.1);
    let yScale3 = d3.scaleLinear()
        .range([height_figure, 0])
        .domain([0, 100]);

    // 绘制条形背景
    fig3.selectAll('.bar-background')
        .data(sortedData)
        .enter().append('rect')
        .attr('class', 'bar-background')
        .attr('x', d => xScale(d.name)) // 使用xScale确定条形的x坐标
        .attr('y', d => 0.5*(height_figure-yScale3(Number(d.scores_overall)))) // 使用yScale3确定条形的y坐标
        .attr('width', xScale.bandwidth()) // 条形的宽度
        .attr('height', d => 0.5*yScale3(Number(d.scores_overall))) // 条形的高度
        .attr('fill', d => getColorForLocation(d.location)) // 设置条形的颜色
        .attr('transform', 'rotate(-90) scale(' + scaleFactor + ') translate(-' + width_figure + ',0)');

    // 文本显示
    let infoText = fig3.append('text')
        .attr('id', 'info-text')
        .attr('x', -padding.left) 
        .attr('y', 0) // 起始位置
        .attr('text-anchor', 'start')
        .style('font-size', CaptionSize+'px')
        .text(''); 

    // 绘制条形图并应用旋转和缩放
    fig3.selectAll('.bar')
        .data(sortedData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.name))
        .attr('y', d => 0)
        .attr('width', xScale.bandwidth())
        .attr('height', d => 0.5*(height_figure - yScale3(Number(d.scores_overall))))
        .attr('fill', 'steelblue')
        .attr('transform', 'rotate(-90) scale(' + scaleFactor + ') translate(-' + width_figure + ',0)')
        .on('mouseover', function (event, d) {
            // 显示工具提示
            d3.select('#tooltip')
                .html("Name: " + d.name + "<br>" +
                    "Overall Score: " + d.scores_overall + "<br>" +
                    "Rank: " + d.rank + "<br>" +
                    "Location: " + d.location)
                .style("visibility", "visible")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");

            // 高亮显示
            d3.select(this).style('fill', 'orange');

            fig3.selectAll('.stacked-area')
                .filter(stack => stack.key === d.location)
                .style('stroke', 'orange')
                .style('stroke-width', '2px');
        })
        .on('mouseout', function () {
            // 隐藏工具提示
            d3.select('#tooltip').style("visibility", "hidden");

            // 恢复原始颜色
            d3.select(this).style('fill', 'steelblue');

            fig3.selectAll('.stacked-area')
                .style('stroke', 'rgba(0, 0, 0, 0.2)')
                .style('stroke-width', '1px');
        })
        .on('click', function(event, d) {
            // 清除旧文本
            infoText.selectAll('*').remove();
    
            // 显示被点击的条形的详细信息
            let details = [
                `Name: ${d.name}`,
                `Overall Score: ${d.scores_overall}`,
                `Rank: ${d.rank}`,
                `Location: ${d.location}`,
                '', // 空行
                '30 Other Universitys in the Same Location:'
            ];
    
            // 找出当前年份中相同location的所有其它条形的name
            let sameLocationNames = sortedData
                .filter(data => data.location === d.location && data.name !== d.name)
                .map(data => data.name)
                .slice(0,30);
    
            // 将这些name添加到要显示的文本中
            details = details.concat(sameLocationNames);
    
            // 为每行文本创建一个tspan元素
            details.forEach((line, index) => {
                infoText.append('tspan')
                    .attr('x', -padding.left*0.95)
                    .attr('y', TickSize*1.1 + index * TickSize*1.1) // 每行文本的垂直位置
                    .style('font-size', TickSize+'px')
                    .text(line);
            });
        });

        // 添加外边框
        fig3.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width_figure)
            .attr('height', 0.5*height_figure)
            .attr('transform', 'rotate(-90) scale(' + scaleFactor + ') translate(-' + width_figure + ',0)')
            .style('fill', 'none')
            .style('stroke', 'black')
            .style('stroke-width', 1);


    // 右侧图
    let yearLocationCounts = {};
    for (let y = 2011; y <= 2023; y++) {
        let yearData = data.filter(d => +d.year === y);

        // 初始化所有location的计数为0
        let yearLocationCount = {};
        allLocations.forEach(loc => yearLocationCount[loc] = 0);

        // 更新对应location的计数
        yearData.forEach(d => {
            yearLocationCount[d.location]++;
        });

        // 计算总数并归一化
        let total = Object.values(yearLocationCount).reduce((sum, current) => sum + current, 0);
        allLocations.forEach(loc => {
            yearLocationCount[loc] = total > 0 ? yearLocationCount[loc] / total : 0;
        });

        yearLocationCounts[y] = { ...yearLocationCount, total: total };
    }


    // 转换yearLocationCounts数据为堆叠图所需格式
    let stackData3 = [];
    for (let y = +year; y <= 2023; y++) {
        let yearData = yearLocationCounts[y];
        let dataItem = { year: y };
        for (let location in yearData) {
            dataItem[location] = yearData[location];
        }
        stackData3.push(dataItem);
    }

    // 如果只有2023年的数据，则人为添加2024年的数据
    if (+year === 2023) {
        let nextYearData = JSON.parse(JSON.stringify(stackData3[0])); // 深拷贝2023年的数据
        nextYearData.year = 2024; // 将年份改为2024
        stackData3.push(nextYearData); // 添加到数据中
    }

    // 创建堆叠布局
    let stack = d3.stack()
        .keys(allLocations.slice().reverse())
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    let series3 = stack(stackData3);

    // 创建右侧图的比例尺
    let xScaleRight = d3.scaleLinear()
        .domain([+year, (+year === 2023 ? 2024 : 2023)]) // 考虑到可能添加的2024年
        .range([height_figure * height_figure / 2 / width_figure, width_figure]);


    let yScaleRight = d3.scaleLinear()
        .domain([0, d3.max(series3, layer => d3.max(layer, d => d[1]))])
        .range([height_figure, 0]);
    
    // 绘制堆叠区域
    let area = d3.area()
        .x(d => xScaleRight(d.data.year))
        .y0(d => yScaleRight(d[0]))
        .y1(d => yScaleRight(d[1]))
        .curve(d3.curveMonotoneX); // 使用 curveMonotoneX 生成平滑曲线

    fig3.selectAll('.stacked-area')
        .data(series3)
        .enter().append('path')
        .attr('class', 'stacked-area')
        .attr('d', area)
        .attr('fill', (d, i) => getColorForLocation(d.key))
        .attr('stroke', 'rgba(0, 0, 0, 0.2)') // 设置边框颜色为黑色
        .attr('stroke-width', '1px') // 设置边框宽度
        .on('mouseover', function(event, d) {
            d3.select(this)
              .style('stroke', 'orange')
              .style('stroke-width', '2px');
            
            let location = d.key;
            d3.select('#tooltip')
              .style("visibility", "visible")
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY + 10) + 'px')
              .html(`Location: ${location}`);

            fig3.selectAll('.bar')
              .filter(data => data.location === d.key)
              .style('fill', 'orange');
        })
        .on('mouseout', function() {
            d3.select(this)
              .style('stroke', 'rgba(0, 0, 0, 0.2)')
              .style('stroke-width', '1px');
            
            d3.select('#tooltip')
              .style("visibility", "hidden");

            fig3.selectAll('.bar')
              .style('fill', d => 'steelblue');
        })
        .on('click', function(event, d) {
            let location = d.key;
    
            // 清除旧文本
            infoText.selectAll('*').remove();
    
            // 添加新文本
            let textLines = [`${location}`];
            for (let y = year; y <= 2023; y++) {
                let yearData = yearLocationCounts[y];
                let count = Math.round(yearData[location] * yearData.total);
                textLines.push(`Year ${y}: ${count}`);
            }
    
            // 为每行文本创建一个tspan元素
            textLines.forEach((line, index) => {
                infoText.append('tspan')
                    .attr('x', -padding.left*0.8)
                    .attr('y', CaptionSize*1.1 + index * CaptionSize*1.1) // 每行文本的垂直位置
                    .text(line);
            });
        });

    // 定义x轴
    let xAxisRight = d3.axisBottom(xScaleRight)
                        .tickValues(d3.range(+year, 2024)) 
                        .tickFormat(d3.format('d')); 

    let yAxisRight = d3.axisRight(yScaleRight);

    // 添加右侧图的x轴和y轴
    fig3.append('g')
        .attr('transform', `translate(0, ${height_figure})`)
        .style('font-size', TickSize+'px')
        .call(xAxisRight);

    fig3.append('g')
        .attr('transform', `translate(${width_figure}, 0)`) // 移动到右侧
        .style('font-size', TickSize+'px')
        .call(yAxisRight);
    
    // 添加外边框
    fig3.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width_figure)
        .attr('height', height_figure)
        .attr('transform', 'translate(0,0)')
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 1);

    // 计算图例的位置
    let legendX = width_figure*1.04; // 在图表右侧留出一定间距
    let legendY = 0; // 起始位置
    let legendHeight = height_figure/39; // 每个图例项的高度
    let legendWidth = legendHeight*1.125; // 每个图例项的宽度
    let legendSpacing = legendHeight*0.3; // 图例项之间的间距
    let fontSize = legendHeight*0.8; // 图例项文本的字体大小

    // 绘制图例
    let legend = fig3.selectAll('.legend')
        .data(allLocations)  // 使用按字母排序的allLocations数组
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => 'translate(0,' + (i * (legendHeight + legendSpacing) + legendY) + ')');

    // 绘制图例的颜色矩形
    legend.append('rect')
        .attr('x', legendX)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', d => getColorForLocation(d))  // 使用颜色映射函数
        .on('mouseover', function(event, d) {
            d3.select(this)
              .style('stroke', 'orange')
              .style('stroke-width', '2px');

            fig3.selectAll('.bar')
              .filter(data => data.location === d)
              .style('fill', 'orange');

            fig3.selectAll('.stacked-area')
              .filter(stack => stack.key === d)
              .style('stroke', 'orange')
              .style('stroke-width', '2px');
        })
        .on('mouseout', function() {
            d3.select(this)
              .style('stroke-width', '0px');

            fig3.selectAll('.bar')
              .style('fill', d => 'steelblue');

            fig3.selectAll('.stacked-area')
              .style('stroke', 'rgba(0, 0, 0, 0.2)')
              .style('stroke-width', '1px');
        })

    // 绘制图例的文本标签
    legend.append('text')
        .attr('x', legendX + legendWidth*1.5)
        .attr('y', legendHeight / 2 + legendSpacing)
        .style('font-size', fontSize + 'px')
        .text(d => d);

    // 添加坐标轴说明
    fig3.append('text')
        .attr('x', height_figure*height_figure/4/width_figure + width_figure/2) 
        .attr('y', -CaptionSize/2) 
        .attr('text-anchor', 'middle') 
        .style('font-size', CaptionSize+'px') 
        .text(`year`); 

    // 标题
    fig3.append('text')
        .attr('x', width_figure / 2) 
        .attr('y', -padding.top / 2) 
        .attr('text-anchor', 'middle') 
        .style('font-size', TitleSize+'px') 
        .text(`Number of Top 200 Universities in different countries from ${year} to 2023`); 
}

function draw_fig4(data, year) {
    d3.select('#figure4').html('');

    let fig4= d3.select('#figure4').html('').append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');

    // 创建x轴和y轴的比例尺
    let xScale = d3.scaleLinear()
        .domain([year, (+year === 2023 ? 2024 : 2023)])
        .range([0, width_figure]);
    let yScale4 = d3.scaleLinear()
        .domain([1, 201]) // 包含>200的点
        .range([0, height_figure]);

    // 添加x轴和y轴
    fig4.append('g')
        .attr('transform', `translate(0, ${height_figure})`)
        .style('font-size', TickSize+'px')
        .call(d3.axisBottom(xScale).tickFormat(d3.format('d'))
            .tickValues(d3.range(year, 2024))); // 生成年份的数组
    fig4.append('g')
        .style('font-size', TickSize+'px')
        .call(d3.axisLeft(yScale4)
            .tickValues([1].concat(d3.range(21, 202, 20))) // 生成刻度值数组 [1, 21, 41, ..., 201]
            .tickFormat(d => d === 201 ? '>200' : d)); // 格式化刻度标签

    // 定义曲线生成器
    let line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale4(d.rank))
        .curve(d3.curveMonotoneX);

    // 处理数据并绘制曲线
    let names = new Set(data.map(d => d.name)); // 获取所有唯一的name值
    let highlighted = null;
    let highlightedInfo = null;

    names.forEach(name => {
        let nameData = [];
        let location = null;
    
        for (let y = +year; y <= 2023; y++) {
            let yearData = data.find(d => d.name === name && +d.year === y);
            if (yearData) {
                nameData.push({ year: y, rank: +yearData.rank });
                if (!location) {
                    location = yearData.location; // 获取首个有效年份的location
                }
            } else {
                // 对于没有数据的年份，设置rank为>200
                nameData.push({ year: y, rank: 201 });
            }
        }

        if (+year === 2023 && nameData.length === 1 && nameData[0].year === 2023) {
            nameData.push({ year: 2024, rank: nameData[0].rank }); // 添加与2023年相同的数据点
        }
    
        if (!location) {
            // 如果没有找到有效的location，可以选择一个默认颜色或跳过绘制
            return; // 这里选择跳过绘制这个name的曲线
        }

        let locationClass = `location-${location.replace(/\s+/g, '-').toLowerCase()}`;
    
        // 绘制曲线
        fig4.append('path')
            .datum(nameData)
            .attr('fill', 'none')
            .attr('stroke', getColorForLocation(location))
            .attr('stroke-width', 1.5)
            .attr('d', line)
            .attr('class', locationClass)
            .on('mouseover', function(event) {
                // 高亮显示曲线
                d3.select(this)
                  .attr('stroke-width', 7)
                  .style('stroke', 'black')
                  .style('stroke-opacity', 0.5)
                  .raise(); // 将元素移动到前面
    
                // 构建并显示工具提示
                let tooltipContent = highlightedInfo ? highlightedInfo + '<br><br>' : '';
                tooltipContent += `Name: ${name}<br>Location: ${location}`;
                d3.select('#tooltip')
                  .style('visibility', 'visible')
                  .style('left', (event.pageX + 10) + 'px')
                  .style('top', (event.pageY + 10) + 'px')
                  .html(tooltipContent);
            })
            .on('mouseout', function() {
                // 取消高亮显示曲线
                if (highlighted !== this) {
                    d3.select(this)
                      .attr('stroke-width', 1.5)
                      .style('stroke', getColorForLocation(location))
                      .style('stroke-opacity', 1);
                }
    
                // 隐藏工具提示
                d3.select('#tooltip').style('visibility', 'hidden');
            })
            .on('click', function() {
                if (highlighted === this) {
                    // 如果已经是高亮状态，则取消高亮
                    d3.select(this)
                      .attr('stroke-width', 1.5)
                      .style('stroke', getColorForLocation(location))
                      .style('stroke-opacity', 1);
                    highlighted = null;
                    highlightedInfo = null;
                    d3.select('#tooltip').style('visibility', 'hidden');
                } else {
                    // 设置为高亮并更新信息
                    if (highlighted) {
                        d3.select(highlighted)
                          .attr('stroke-width', 1.5)
                          .style('stroke', getColorForLocation(highlighted.__data__[0].location))
                          .style('stroke-opacity', 1);
                    }
                    highlighted = this;
                    d3.select(this)
                      .attr('stroke-width', 7)
                      .style('stroke', 'black')
                      .style('stroke-opacity', 0.5)
                      .raise(); // 将元素移动到前面
                    highlightedInfo = `Name: ${name}<br>Location: ${location}`;
                    d3.select('#tooltip')
                        .style('visibility', 'visible')
                        .html(highlightedInfo);
                }
            });
    });

    // 计算图例的位置
    let legendX = width_figure*1.022; // 在图表右侧留出一定间距
    let legendY = 0; // 起始位置
    let legendHeight = height_figure/39; // 每个图例项的高度
    let legendWidth = legendHeight*1.125; // 每个图例项的宽度
    let legendSpacing = legendHeight*0.3; // 图例项之间的间距
    let fontSize = legendHeight*0.8; // 图例项文本的字体大小
    let legendhighlighted = null;

    // 绘制图例
    let legend = fig4.selectAll('.legend')
        .data(allLocations)  // 使用按字母排序的allLocations数组
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => 'translate(0,' + (i * (legendHeight + legendSpacing) + legendY) + ')');

    // 绘制图例的颜色矩形
    legend.append('rect')
        .attr('x', legendX)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', d => getColorForLocation(d))  // 使用颜色映射函数
        .on('mouseover', function(event, location) {
            d3.select(this)
                .style('stroke', 'orange')
                .style('stroke-width', '2px');
            
            if (!legendhighlighted) {
                fig4.selectAll('path')
                    .style('opacity', function() {
                        // 仅降低非高亮曲线的透明度
                        return this === legendhighlighted ? 1 : 0.1;
                    });
            } 

            let locationClass = `.location-${location.replace(/\s+/g, '-').toLowerCase()}`;
            fig4.selectAll(locationClass)
                .style('opacity', 1)
                .attr('stroke-width', function(){
                    return d3.select(this).style('stroke') === 'black' ? 7 : 3
                });
    
        })
        .on('mouseout', function(event, location) {
            // 仅在鼠标移出的图例不是被点击高亮的图例时移除临时高亮效果
            if (legendhighlighted){
                if (legendhighlighted.__data__.location !== location) {
                    d3.select(this)
                        .style('stroke-width', '0px');
                    let locationClass = `.location-${location.replace(/\s+/g, '-').toLowerCase()}`;
                    fig4.selectAll(locationClass)
                        .style('opacity', 0.1)
                        .attr('stroke-width', function(){
                            return d3.select(this).style('stroke') === 'black' ? 7 : 1.5
                        });
                }
            } else {
                d3.select(this)
                    .style('stroke-width', '0px');

                fig4.selectAll('path')
                    .style('opacity', 1)
                    .attr('stroke-width', function() {
                        if (this === legendhighlighted) {
                            // 被点击高亮的曲线宽度设置为3
                            return 3;
                        } else {
                            // 如果曲线的颜色为黑色，宽度设置为7，否则为1.5
                            return d3.select(this).style('stroke') === 'black' ? 7 : 1.5;
                        }
                    });
            }


        })
        .on('click', function(event, location) {
            let locationClass = `.location-${location.replace(/\s+/g, '-').toLowerCase()}`;
    
            if (legendhighlighted && legendhighlighted.__data__.location === location) {
                // 取消高亮
                d3.select(this)
                    .style('stroke-width', '0px');
                fig4.selectAll('path')
                    .style('opacity', 1)
                    .attr('stroke-width', function(){
                        return d3.select(this).style('stroke') === 'black' ? 7 : 1.5
                    });
                legendhighlighted = null;
            } else {
                // 应用新的高亮
                if (legendhighlighted) {
                    // 移除旧的高亮效果
                    let oldLocationClass = `.location-${legendhighlighted.__data__.location.replace(/\s+/g, '-').toLowerCase()}`;
                    fig4.selectAll(oldLocationClass)
                        .style('opacity', 1)
                        .attr('stroke-width', function(){
                            return d3.select(this).style('stroke') === 'black' ? 7 : 1.5
                        });

                    d3.selectAll('rect')
                        .filter(d => d === legendhighlighted.__data__.location)
                        .style('stroke-width', '0px');
                }
    
                // 应用新的高亮
                fig4.selectAll('path')
                    .style('opacity', 0.1);
                fig4.selectAll(locationClass)
                    .style('opacity', 1)
                    .attr('stroke-width', function(){
                        return d3.select(this).style('stroke') === 'black' ? 7 : 3
                    });
    
                // 更新legendhighlighted变量
                legendhighlighted = { __data__: { location: location } };
            }
        });

    // 绘制图例的文本标签
    legend.append('text')
        .attr('x', legendX + legendWidth*1.5)
        .attr('y', legendHeight / 2 + legendSpacing)
        .style('font-size', fontSize + 'px')
        .text(d => d);

    fig4.append('g')
        .attr('class', 'frame')
        .append('rect')
        .attr('width', width_figure)
        .attr('height', height_figure)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 1);

    // 添加标题
    fig4.append('text')
        .attr('x', width_figure / 2)
        .attr('y', -padding.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', TitleSize+'px')
        .text('Change of rank for Top-200 Universities (' + year + '-2023)');

    // 添加坐标轴说明
    fig4.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width_figure / 2)
        .attr('y', height_figure + padding.bottom / 2)
        .style('font-size', CaptionSize+'px')
        .text('Year');
    fig4.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height_figure / 2)
        .attr('y', -CaptionSize*1.5)
        .style('font-size', CaptionSize+'px')
        .text('Rank');    

}

function draw_fig5(data, year, university1, university2) {
    d3.select('#figure5').html('');

    let fig5 = d3.select('#figure5').html('').append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');

    // 创建x轴和y轴的比例尺
    let xScale = d3.scaleLinear()
        .domain([+year - 0.5, 2023 + 0.5])
        .range([0, width_figure]);
    let yScale5 = d3.scaleLinear()
        .domain([1, 201]) // 包含>200的点
        .range([0, height_figure]);
    let yStackScale = d3.scaleLinear()
        .range([height_figure, 0])
        .domain([0, 100]); // 堆叠图的纵轴范围为0到100

    // 添加x轴和y轴
    fig5.append('g')
        .attr('transform', `translate(0, ${height_figure})`)
        .style('font-size', TickSize+'px')
        .call(d3.axisBottom(xScale).tickFormat(d3.format('d'))
            .tickValues(d3.range(year, 2024))); 
    fig5.append('g')
        .style('font-size', TickSize+'px')
        .call(d3.axisLeft(yScale5)
            .tickValues([1].concat(d3.range(21, 202, 20)))
            .tickFormat(d => d === 201 ? '>200' : d)); 
    fig5.append('g')
        .style('font-size', TickSize+'px')
        .attr('transform', `translate(${width_figure}, 0)`)
        .call(d3.axisRight(yStackScale));

    // 定义曲线生成器
    let line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale5(d.rank))
        .curve(d3.curveMonotoneX);

    const universities = {};
    universities[university1] = 'green'; // 为第一个学校分配颜色
    universities[university2] = 'red';   // 为第二个学校分配颜色

    const keys = ['teaching', 'international_outlook', 'industry_income', 'research', 'citations'];

    let data5 = JSON.parse(JSON.stringify(data));;
    // 处理数据缺失的情况
    for (let y = +year; y <= 2023; y++) {
        Object.keys(universities).forEach(name => {
            if (!data5.some(d => d.year === y.toString() && d.name === name)) {
                // 如果某年的数据缺失，创建一个包含默认值的数据项
                data5.push({
                    year: y.toString(),
                    name: name,
                    rank: 201,
                    scores_teaching: '-',
                    scores_international_outlook: '-',
                    scores_industry_income: '-',
                    scores_research: '-',
                    scores_citations: '-',
                    scores_overall: '-',
                    scores_teaching_rate: 0,
                    scores_international_outlook_rate: 0,
                    scores_industry_income_rate: 0,
                    scores_research_rate: 0,
                    scores_citations_rate: 0,
                    scores_teaching_rank: '-',
                    scores_international_outlook_rank: '-',
                    scores_industry_income_rank: '-',
                    scores_research_rank: '-',
                    scores_citations_rank: '-'
                });
            }
        });
    }

    data5.sort((a, b) => {
        // 首先按照年份排序
        if (a.year !== b.year) {
            return a.year.localeCompare(b.year);
        }
        // 如果年份相同，则按照学校名称排序
        return a.name.localeCompare(b.name);
    });

    // 堆叠图
    Object.keys(universities).forEach((name, index) => {
        for (let y = +year; y <= 2023; y++) {
            let uniData = data5.filter(d => d.year === y.toString() && d.name === name);

            let stackData5 = uniData.map(d => ({
                teaching: isNaN(d.scores_teaching) ? 0 : d['scores_teaching_rate'] * d.scores_teaching,
                international_outlook: isNaN(d.scores_international_outlook) ? 0 : d['scores_international_outlook_rate'] * d.scores_international_outlook,
                industry_income: isNaN(d.scores_industry_income) ? 0 : d['scores_industry_income_rate'] * d.scores_industry_income,
                research: isNaN(d.scores_research) ? 0 : d['scores_research_rate'] * d.scores_research,
                citations: isNaN(d.scores_citations) ? 0 : d['scores_citations_rate'] * d.scores_citations,
                originalData: {
                    scores_teaching: d.scores_teaching,
                    scores_international_outlook: d.scores_international_outlook,
                    scores_industry_income: d.scores_industry_income,
                    scores_research: d.scores_research,
                    scores_citations: d.scores_citations,
                    scores_overall: d.scores_overall,
                    scores_teaching_rank: d.scores_teaching_rank,
                    scores_international_outlook_rank: d.scores_international_outlook_rank,
                    scores_industry_income_rank: d.scores_industry_income_rank,
                    scores_research_rank: d.scores_research_rank,
                    scores_citations_rank: d.scores_citations_rank
                }
            }));

            let series5 = d3.stack().keys(keys)(stackData5);
            let offset = index === 0 ? -0.4 : 0;

            series5.forEach((layer, layerIndex) => {
                fig5.selectAll(`rect.${name.replace(/\s+/g, '-').replace(/[(),&]/g, '')}-${layer.key}-${y}`)
                    .data(layer)
                    .enter().append('rect')
                    .attr('class', `${name.replace(/\s+/g, '-').replace(/[(),&]/g, '')}-${layer.key}-${y}`)
                    .attr('x', d => xScale(y + offset))
                    .attr('y', d => yStackScale(d[1]))
                    .attr('height', d => yStackScale(d[0]) - yStackScale(d[1]))
                    .attr('width', xScale(y + offset + 0.4) - xScale(y + offset))
                    .style('fill', d3.schemeCategory10[layerIndex])
                    .style('stroke', universities[name])
                    .style('stroke-width', '2px')
                    .on('mouseover', function(event, d) {
                        let currentAttribute = keys[layerIndex];
    
                        // 高亮显示同年份的相同属性的条形
                        Object.keys(universities).forEach(uni => {
                            fig5.selectAll(`rect.${uni.replace(/\s+/g, '-').replace(/[(),&]/g, '')}-${currentAttribute}-${y}`)
                                .style('fill', 'orange');
                        });
    
                        let tooltipContent = `Year: ${y}<br>Attribute: ${currentAttribute}<br>`;
                        Object.keys(universities).forEach(uniName => {
                            let uniAttributeData = data5.find(uniData => uniData.year === y.toString() && uniData.name === uniName);
                            if (uniAttributeData) {
                                tooltipContent += `<strong>${uniName}</strong>: ${uniAttributeData[`scores_${currentAttribute}`]} (${uniAttributeData[`scores_${currentAttribute}_rank`]})<br>`;
                            }
                        });
    
                        d3.select('#tooltip')
                            .style('visibility', 'visible')
                            .style('left', (event.pageX + 10) + 'px')
                            .style('top', (event.pageY + 10) + 'px')
                            .html(tooltipContent);
                    })
                    .on('mouseout', function() {
                        Object.keys(universities).forEach(uni => {
                            fig5.selectAll(`rect.${uni.replace(/\s+/g, '-').replace(/[(),&]/g, '')}-${keys[layerIndex]}-${y}`)
                                .style('fill', d3.schemeCategory10[layerIndex]);
                        });
                        d3.select('#tooltip').style('visibility', 'hidden');
                    });
            });
        }
    });


    // 曲线图
    Object.keys(universities).forEach(name => {
        let nameData = data5.filter(d => d.name === name && +d.year >= +year && +d.year <= 2023)
            .map(d => ({ year: +d.year, rank: +d.rank }));

        // 筛选出除去端点的年份数据
        let validDataPoints = nameData.filter(d => d.year !== +year - 0.5 && d.year !== 2023.5);

        // 为每个有效年份添加圆形节点
        fig5.selectAll(`circle.${name.replace(/\s+/g, '-').replace(/[(),&]/g, '')}`)
            .data(validDataPoints)
            .enter().append('circle')
            .attr('class', name.replace(/\s+/g, '-').replace(/[(),&]/g, ''))
            .attr('cx', d => xScale(d.year))
            .attr('cy', d => yScale5(d.rank))
            .attr('r', 8)
            .attr('fill', universities[name])
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('r', 12) // 增加半径以高亮显示
                    .style('stroke', 'black')
                    .style('stroke-width', '2px');

                keys.forEach(key => {
                    fig5.selectAll(`rect.${name.replace(/\s+/g, '-').replace(/[(),&]/g, '')}-${key}-${d.year}`)
                        .style('fill', 'orange');
                });

                // 显示工具提示
                d3.select('#tooltip')
                    .style('visibility', 'visible')
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY + 10) + 'px')
                    .html(`Name: ${name}<br>Rank: ${d.rank === 201? '>200': d.rank}`);
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .attr('r', 8) // 恢复原始半径
                    .style('stroke-width', '0px');

                keys.forEach(key => {
                    fig5.selectAll(`rect.${name.replace(/\s+/g, '-').replace(/[(),&]/g, '')}-${key}-${d.year}`)
                        .style('fill', d3.schemeCategory10[keys.indexOf(key)]);
                });

                // 隐藏工具提示
                d3.select('#tooltip').style('visibility', 'hidden');
            });
        
        // 找到year和2023年的排名，用于填充year-0.5和2023.5的数据点
        let rankAtStart = nameData.find(d => d.year === +year)?.rank || 201; // 如果找不到则默认排名为201
        let rankAtEnd = nameData.find(d => d.year === 2023)?.rank || 201; 

        // 添加year-0.5的数据点
        nameData.unshift({ year: +year - 0.5, rank: rankAtStart });

        // 添加2023.5的数据点
        nameData.push({ year: 2023.5, rank: rankAtEnd });

        // 绘制曲线
        fig5.append('path')
            .datum(nameData)
            .attr('fill', 'none')
            .attr('stroke', universities[name]) 
            .attr('stroke-width', 5)
            .attr('d', line);
    });

    // 添加标题
    fig5.append('text')
        .attr('x', width_figure / 2)
        .attr('y', -padding.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', TitleSize+'px')
        .text('Comparation of two selected universities from ' + year + ' to 2023');

    // 添加坐标轴说明
    fig5.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width_figure / 2)
        .attr('y', height_figure + padding.bottom / 2)
        .style('font-size', CaptionSize+'px')
        .text('Year');
    fig5.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height_figure / 2)
        .attr('y', -CaptionSize*1.5)
        .style('font-size', CaptionSize+'px')
        .text('Rank'); 
    fig5.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(90)')
        .attr('x', height_figure / 2)
        .attr('y', -width_figure-40)
        .style('font-size', CaptionSize+'px')
        .text('Overall Score');     
    fig5.append('text')
        .attr('x', width_figure / 2)
        .attr('y', -CaptionSize*1.5)
        .attr('text-anchor', 'middle')
        .style('font-size', CaptionSize+'px')
        .text(university1 + '  v.s.  ' + university2);

    // 添加框线
    fig5.append('g')
        .attr('class', 'frame')
        .append('rect')
        .attr('width', width_figure)
        .attr('height', height_figure)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', 1);

}

function getColorForLocation(location) {
    // 使用location的索引在颜色比例尺中找到颜色
    let index = allLocations.indexOf(location);
    // 计算色相，这里我们在色轮上均匀地选择颜色
    let hue = (index / totalLocations) * 360;
    let saturation = 70;
    let lightness = 50;
    let alpha = 0.5; // 设置不透明度
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}

function hideOtherFigures(exceptFigureNumber) {
    for (let i = 1; i <= 5; i++) {
        if (i !== exceptFigureNumber) {
            document.getElementById(`figure${i}`).style.display = 'none';
        } else {
            document.getElementById(`figure${i}`).style.display = 'block';
        }
    }
}

function updateSliderForFigure() {
    let slider = document.getElementById('yearSlider');
    let figure = document.getElementById('figure1');
    let svg = figure.querySelector('svg');

    if (slider && svg) {
        let svgRect = svg.getBoundingClientRect();

        // 根据SVG图像的实际位置和大小更新滑动条的样式
        slider.style.position = 'absolute';
        // slider.style.left = (svgRect.right + window.scrollX) + 'px'; // 左侧对齐，紧贴图表的右边界
        // slider.style.top = (svgRect.top + window.scrollY) + 'px'; // 顶部对齐，与图表顶部相同
        // slider.style.height = svgRect.height + 'px'; // 高度与SVG高度一致
        slider.style.left = 0 + 'px'; 
        slider.style.top = 300 + 'px'; 
        slider.style.height = 800 + 'px'; // 高度与SVG高度一致
        slider.style.transform = 'rotate(90deg)'; // 向右旋转90度使之竖直
        // slider.style.transformOrigin = 'top left'; // 设置旋转的原点为顶部左侧
    }
}

function createSliderLabels() {
    const container = document.getElementById('slider-labels');
    container.innerHTML = ''; // 清除既有标签

    for (let year = 2011; year <= 2023; year++) {
        let label = document.createElement('div');
        label.textContent = year;
        container.appendChild(label);
    }
}

function main() {
    set_ui();
    // 准备一个空数组用于存储筛选后的数据
    let filteredData = [];

    // 创建一个文件名数组
    let fileNames = [];
    for (let year = 11; year <= 23; year++) {
        fileNames.push(`./data/20${year}_rankings.csv`);
    }

    // 权重配置
    const weights = {
        '2011': { teaching: 0.3, international_outlook: 0.05, industry_income: 0.025, research: 0.3, citations: 0.325 },
        'other': { teaching: 0.3, international_outlook: 0.075, industry_income: 0.025, research: 0.3, citations: 0.3 }
    };

    function adjustWeights(year, dataItem) {
        // 根据年份选择权重
        let weightConfig = (year === '2011') ? weights['2011'] : weights['other'];
    
        // 检查每个属性是否为有效的数字
        let validWeights = {};
        let totalWeight = 0;
        for (let key in weightConfig) {
            if (dataItem[`scores_${key}`] && !isNaN(dataItem[`scores_${key}`])) {
                validWeights[key] = weightConfig[key];
                totalWeight += weightConfig[key];
            } else {
                validWeights[key] = 0; // 如果数据缺失，则权重设为0
            }
        }
    
        // 重新归一化权重
        for (let key in validWeights) {
            dataItem[`scores_${key}_rate`] = totalWeight ? (validWeights[key] / totalWeight) : 0;
        }
    }

    // 使用Promise.all来同时处理所有的文件读取操作
    Promise.all(fileNames.map(file => {
        let year = file.match(/20(\d{2})_rankings.csv/)[1]; // 从文件名中提取年份
        return d3.csv(file, d => {
            // 清洗rank数据，去除非数字字符
            let cleanRank = d.rank.replace(/[^\d]/g, '');
    
            // 转换为数字并检查是否在1到200之间
            let rankNumber = +cleanRank;
            if (rankNumber >= 1 && rankNumber <= 200) {
                // 创建一个新的数据项，包括年份和清洗后的rank
                let newDataItem = { year: `20${year}`, ...d, rank: rankNumber };

                // 更改location属性
                if (['Hong Kong', 'Macao', 'Macau', 'Taiwan'].includes(newDataItem.location)) {
                    newDataItem.location = 'China';
                }

                // 调整权重
                adjustWeights(`20${year}`, newDataItem);
    
                return newDataItem;
            }
        });
    }))
    .then(dataArrays => {
        // dataArrays是一个数组，每个元素都是一个文件的数据
        filteredData = dataArrays.flat().filter(d => d); // 合并所有文件的数据,过滤掉undefined的项
        console.log(filteredData);
        allLocations = [...new Set(filteredData.map(d => d.location))].sort();
        allNames = Array.from(new Set(filteredData.map(d => d.name))).sort();

        totalLocations = allLocations.length;   

        // 设置按钮的事件监听器
        document.getElementById('btn1').addEventListener('click', () => {
            let selectedYear = document.getElementById('yearSlider').value;
            draw_fig1(filteredData, selectedYear);
            hideOtherFigures(1);
            // createSliderLabels();
            // updateSliderForFigure('figure1');
            document.getElementById('university-select').style.display = 'none';
        });

        document.getElementById('btn2').addEventListener('click', () => {
            let selectedYear = document.getElementById('yearSlider').value;
            draw_fig2(filteredData, selectedYear);
            hideOtherFigures(2);
            document.getElementById('university-select').style.display = 'none';
        });

        document.getElementById('btn3').addEventListener('click', () => {
            let selectedYear = document.getElementById('yearSlider').value;
            draw_fig3(filteredData, selectedYear);
            hideOtherFigures(3);
            document.getElementById('university-select').style.display = 'none';
        });

        document.getElementById('btn4').addEventListener('click', () => {
            let selectedYear = document.getElementById('yearSlider').value;
            draw_fig4(filteredData, selectedYear);
            hideOtherFigures(4);
            document.getElementById('university-select').style.display = 'none';
        });

        document.getElementById('btn5').addEventListener('click', () => {
            let selectedYear = document.getElementById('yearSlider').value;
            let university1 = document.getElementById('university1-select').value;
            let university2 = document.getElementById('university2-select').value;
            draw_fig5(filteredData, selectedYear, university1, university2);
            hideOtherFigures(5);
            document.getElementById('university-select').style.display = 'block';
        });

        document.getElementById('yearSlider').addEventListener('input', function() {
            let selectedYear = this.value;
            let university1 = document.getElementById('university1-select').value;
            let university2 = document.getElementById('university2-select').value;
            draw_fig1(filteredData, selectedYear); 
            draw_fig2(filteredData, selectedYear); 
            draw_fig3(filteredData, selectedYear); 
            draw_fig4(filteredData, selectedYear); 
            draw_fig5(filteredData, selectedYear, university1, university2); 
        });

        document.getElementById('university1-select').addEventListener('change', function() {
            let selectedYear = document.getElementById('yearSlider').value;
            let university1 = this.value;
            let university2 = document.getElementById('university2-select').value;
            draw_fig5(filteredData, selectedYear, university1, university2);
        });

        document.getElementById('university2-select').addEventListener('change', function() {
            let selectedYear = document.getElementById('yearSlider').value;
            let university1 = document.getElementById('university1-select').value;
            let university2 = this.value;
            draw_fig5(filteredData, selectedYear, university1, university2);
        });
        
        // 填充下拉选择框
        let university1Select = d3.select('#university1-select');
        let university2Select = d3.select('#university2-select');

        allNames.forEach(name => {
            university1Select.append('option').text(name);
            university2Select.append('option').text(name);
        });

        // 设置初始值或默认值
        university1Select.property('value', 'Tsinghua University');
        university2Select.property('value', 'Peking University');

        // 默认显示第一个图表
        draw_fig1(filteredData,2023);
        // updateSliderForFigure('figure1');
        hideOtherFigures(1);
    })
    .catch(error => {
        console.error('Error loading the data: ', error);
    });

}

main()

