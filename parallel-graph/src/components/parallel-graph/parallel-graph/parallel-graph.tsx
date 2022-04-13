import { Element, Component, Host, Prop, h } from '@stencil/core';
import { select } from 'd3-selection';
import * as d3 from "d3";
@Component({
  tag: 'parallel-graph',
  styleUrl: 'parallel-graph.css',
  shadow: true
})
export class MyComponent {
  @Element() element: HTMLElement;
  @Prop() width: number = 1000 ;
  @Prop() height: number = 1000;
  @Prop() data: string = "[]";

  public chartData: any;

  

  componentDidLoad(){
    let svg = select(this.element.shadowRoot.querySelectorAll(".chart")[0])
      .attr("width", this.width)
      .attr("height", this.height);
    this.buildParalleGraph(svg);
    
  }

  
  buildParalleGraph(svg){
    var margin = {top: 10, right: 10, bottom: 10, left: 0},
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

    svg.append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  
  // Parse the Data
  d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv").then( function(data) {
console.log(data.Species)
  // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
 const dimensions = Object.keys(data[0]).filter(function(d) { return d  })
//console.log(dimensions)
  // For each dimension, I build a linear scale. I store all in a y object
  const y = {}
  for (var i in dimensions) {
    const name = dimensions[i]
    if (name !="Species"){
    y[name] = d3.scaleLinear()// scale point
      .domain( d3.extent(data, function(d) {return +d[name]; }) ) // 
      .range([height, 20])
    }
    else{
      y[name] = d3.scalePoint()// scale point
      .domain( ["setosa","versicolor", "virginica"]/*d3.extent(data, function(d) { console.log(d["Species"]) ;return d["Species"]; }) */) // 
      .range([height, 20])
    }

  }

  // Build the X scale -> it find the best position for each Y axis
 const x = d3.scalePoint()
    .range([0, width])
    .padding(1)
    .domain(dimensions);

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }
//console.log(data)
  // Draw the lines
  svg
    .selectAll("myPath")
    .data(data)
    .join("path")
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", "#69b3a2")
    .style("opacity", 0.5)

  // Draw the axis:
 
  svg.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", 10)
      .text(function(d) { return d; })
      .style("fill", "black")

})
  }


  render() {
    return  (
      <Host>
        <h1>Parallel graph</h1>
        <svg class="chart"/>
      </Host>
    )
  }
}