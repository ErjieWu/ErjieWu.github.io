function ShowPagePublications() {
    let text;
    if ( _LANGUAGES === 'en') {
        text = "Publications";
    } else {
        text = "论文";
    }
    // 删除已有的svg
    d3.select("#page3").selectAll("svg").remove();

    let svg = d3.select("#page3")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", TitleSize)
        .text(text);
}