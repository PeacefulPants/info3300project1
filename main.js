
// takes in objects with keys `Global_Sales`, `Year`
//
// ensures those keys are numbers by converting them
function preprocess(data){
    return data.map(function(d){
        d.Global_Sales = parseFloat(d.Global_Sales);
        d.Year = parseInt(d.Year);
        return d;
    });
}

// takes in parent element where we want to append the svg
//
// it also needs d3 to be loaded
class ChartBuilder {
    constructor(svgParentElement, d3) {
        this.svgParentElement = svgParentElement;
        this.d3 = d3;
    }

    // creates svg element and returns it
    //
    // the element will have specified width and height,
    // along with id and class
    createSvg(width, height, id, className) {
        this.svg = this.svgParentElement.append("svg")
                                    .attr("width", width)
                                    .attr("height", height)
                                    .attr("id", id)
                                    .attr("class", className);
        return this.svg;
    }

    // creates chart object and returns it
    //
    // the chart will have specified margins and gridline padding
    createChart(margins, gridlinePadding) {
        this.chart = new Chart(this.svg, this.d3, margins, gridlinePadding);
        return this.chart;
    }
}

class Chart {
    constructor(svgElement, d3, margins, gridlinePadding){
        this.svgElement = svgElement;
        this.d3 = d3;
        this.margins = margins;
        this.gridlinePadding = gridlinePadding;
    }

    // prepares chart for rendering by providing it with data
    //
    // also needs to know which data values are the x and y
    prepareChart(data, xAccessor, yAccessor){
        this.xAccessor = xAccessor;
        this.yAccessor = yAccessor;
        this.data = data;
        this.svgWidth = this.svgElement.attr("width");
        this.svgHeight = this.svgElement.attr("height");
        this.chartWidth = this.svgWidth - this.margins.left - this.margins.right;
        this.chartHeight = this.svgHeight - this.margins.top - this.margins.bottom;
        this.xExtent = this.d3.extent(this.data, xAccessor);
        this.yExtent = this.d3.extent(this.data, yAccessor);
        return this;
    }

    // prepares x axes for linear scale
    prepareXLinear(){
        this.xScale = this.d3.scaleLinear()
                            .domain(this.xExtent)
                            .range([0, this.chartWidth]);

        return this;
    }

    // prepares x axes for log scale
    prepareXLog(){
        this.xScale = this.d3.scaleLog()
                            .domain(this.xExtent)
                            .range([0, this.chartWidth]);

        return this;
    }

    // prepares y axes for linear scale
    //
    // if reverse is true, then y axis starts from 0
    prepareYLinear(reversed){
        this.yScale = this.d3.scaleLinear()
                            .domain(this.yExtent);

        if(reversed) {
            this.yScale.range([0, this.chartHeight]);
        }else{
            this.yScale.range([this.chartHeight, 0]);
        }

        return this;
    }

    // prepares y axes for log scale
    //
    // if reverse is true, then y axis starts from 0
    prepareYLog(reversed){
        this.yScale = this.d3.scaleLog()
                            .domain(this.yExtent);

        if(reversed) {
            this.yScale.range([0, this.chartHeight]);
        }else{
            this.yScale.range([this.chartHeight, 0]);
        }

        return this;
    }

    // draws the axes
    //
    // also returns this for chaining
    drawChartAxes(){
        const xAxis = this.d3.axisBottom()
                            .scale(this.xScale);

        const xGridlines = this.d3.axisBottom()
                                .scale(this.xScale)
                                .tickSize(-this.chartHeight-this.gridlinePadding)
                                .tickFormat("");

        const yAxis = this.d3.axisLeft()
                            .scale(this.yScale);


        const yGridlines = this.d3.axisLeft()
                                .scale(this.yScale)
                                .tickSize(-this.chartWidth-this.gridlinePadding)
                                .tickFormat("");

        this.svgElement.append("g")
                        .attr("class","axis")
                        .attr("transform", `translate(${this.margins.left}, ${this.chartHeight + this.margins.top + this.gridlinePadding})`)
                        .call(xAxis);

        this.svgElement.append("g")
                        .attr("class", "gridlines")
                        .attr("transform", `translate(${this.margins.left}, ${this.chartHeight + this.margins.top + this.gridlinePadding})`)
                        .call(xGridlines);

        this.svgElement.append("g")
                        .attr("class","axis")
                        .attr("transform", `translate(${this.margins.left - this.gridlinePadding}, ${this.margins.top})`)
                        .call(yAxis);

        this.svgElement.append("g")
                        .attr("class", "gridlines")
                        .attr("transform", `translate(${this.margins.left - this.gridlinePadding}, ${this.margins.top})`)
                        .call(yGridlines);

        return this;
    }
}

// given chart object, draws scatter plot
//
// can also take in ordinalAccessor and ordinalScheme
// if the accessor is given, the points will be colored
// according to the scheme
// by default the scheme is set to d3.schemeTableau10
class ScatterDrawer{
    constructor(chart, ordinalAccessor, ordinalScheme){
        this.chart = chart;
        this.ordinalAccessor = ordinalAccessor;
        this.ordinalScheme = ordinalScheme || this.chart.d3.schemeTableau10;
        this.ordinalScale = this.ordinalAccessor ? this.chart.d3.scaleOrdinal(this.ordinalScheme) : null;
    }

    // draws scatter plot with points as circles
    //
    // if no radius is given, then the radius is set to 5
    drawCircle(radius){
        const circleRadius = radius || 5;
        this.chart.svgElement.append("g")
                                .attr("class","circles")
                                .attr("transform", `translate(${this.chart.margins.left}, ${this.chart.margins.top})`)
                                .selectAll("circle")
                                .data(this.chart.data)
                                .join("circle")
                                .attr("cx", d => this.chart.xScale(this.chart.xAccessor(d)))
                                .attr("cy", d => this.chart.yScale(this.chart.yAccessor(d)))
                                .attr("r", circleRadius)
                                .attr("fill", d => this.ordinalAccessor ? this.ordinalScale(this.ordinalAccessor(d)) : "black")
                                .attr("stroke", d => this.ordinalAccessor ? this.ordinalScale(this.ordinalAccessor(d)) : "black")
                                .attr("stroke-width", 1);
    }
}