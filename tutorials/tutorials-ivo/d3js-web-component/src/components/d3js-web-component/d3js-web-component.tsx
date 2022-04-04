import { Element, Component, Host, h } from '@stencil/core';
import * as d3 from 'd3';


@Component({
  tag: 'd3js-web-component',
  styleUrl: 'd3js-web-component.css',
  shadow: true,
})
export class D3jsWebComponent {

  @Element() element: HTMLElement;
  // Data model is a single column with a name and float
  data: string = d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv")
  
  componentDidLoad() 
    {
      //var div = document.createElement('div');
      //div.id = "div"

      //console.log(div)

      var margin = {top: 10, right: 30, bottom: 30, left: 40},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
      let svg = d3.select(this.element.shadowRoot.querySelector("#svg"))
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

      // X axis: scale and draw:
      let x = d3.scaleLinear()
        .domain([0, 1000])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
          .range([0, width]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));
          
      // set the parameters for the histogram
      let histogram = d3.histogram()
        .value(function(d) { return d.price; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(70)); // then the numbers of bins
          
      // And apply this function to data to get the bins
      let bins = histogram(this.data);
          
        // Y axis: scale and draw:
      let y = d3.scaleLinear()
        .range([height, 0]);
        y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
        svg.append("g")
        .call(d3.axisLeft(y));

          // append the bar rectangles to the svg element
      svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
          .attr("x", 1)
          .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
          .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
          .attr("height", function(d) { return height - y(d.length); })
          .style("fill", "#69b3a2")

    }

  render() {
    return (
      <Host>
        <div id="d3js">
        <h1> d3js graph </h1>
          <svg id="svg"></svg>
        </div>
      </Host>
    )
  }

}
