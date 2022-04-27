import { Element, Component, Host, Prop, h, State } from '@stencil/core';
import { select } from 'd3-selection';
import * as d3 from "d3";
@Component({
  tag: 'parallel-graph',
  styleUrl: 'parallel-graph.css',
  shadow: true
})
export class MyComponent {
  @Element() element: HTMLElement;
  @Prop() width: number = 1000;
  @Prop() height: number = 1000;
  @Prop() data: string = "[]";

  @Prop() artist;

  // Constain valuable information to use in the parallel graph
  @State() dataObj = { artist: "" };
  @State() dataObjInt;
  @State() dataa;
  public chartData: any;



  componentDidLoad() {
    this.analiseData();
    //this.convertLengthToInt();
    this.getDataPhaseB(this.dataObj);
    let svg = select(this.element.shadowRoot.querySelectorAll(".chart")[0])
      .attr("width", this.width)
      .attr("height", this.height);
    this.buildParalleGraph(svg);
  }

  private httpGet(url: string): string {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", url, false);
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
  }
  private getData(): string {
    try {
      let data = this.httpGet("https://wasabi.i3s.unice.fr/api/v1/artist_all/name/" + this.artist)
      return data;
    }
    catch (error) {
      console.log(error);
      alert("Data not received due to : " + error);
    }
  }

  private getStats(data: object): object {
    let stats = {};

    // % missing data
    
    return stats;
  }

  private analiseData() {

    let json = JSON.parse(this.getData());
    this.artist = json["name"];

    let albums = json["albums"];

    albums.forEach(album => {
      let songs = album["songs"];
      let index = 1;
      let globalGenre = album["genre"];

      songs.forEach(song => {
        let songObj = { id: "", title: "", length: "", language: "", isClassic: "" };

        songObj.id = song["_id"];
        songObj.title = song["title"];
        songObj.isClassic = song["isClassic"];

        // We test if lenght is defined 
        if (song["length"] != "") {
          songObj.length = song["length"];
        }
        else {
          songObj.length = undefined;
        }

        // We test if genre is defined in the song otherwise we use album genre
        if ((song.hasOwnProperty("genre")) && (song["genre"].length > 0)) {
          let genreArray = song["genre"];
          let genre = {};
          let i = 0;
          genreArray.forEach(g => {
            genre[i] = g;
            i++;
          });
          songObj["genre"] = genre;
        }
        else {
          if (globalGenre != "") {
            songObj["genre"] = globalGenre;
          }
          else {
            songObj["genre"] = undefined;
          }
        }

        // We test if format is defined otherwise we set it undefined
        if ((song.hasOwnProperty("format")) && (song["format"].length > 0)) {
          let formatArray = song["format"];
          let format = {};
          let i = 0;
          formatArray.forEach(f => {
            format[i] = f;
            i++;
          });
          songObj["format"] = format;
        }
        else {
          songObj["format"] = undefined;
        }

        // We verify if "language" isn't undefined, if it is we take "language_detect" instead
        if (song["language"] == "") {
          if (song["language_detect"] != undefined) {
            songObj.language = song["language_detect"];
          }
        }
        else {
          songObj.language = song["language"];
        }

        //this.dataObj["song"+index] = songObj;
        this.dataObj[index] = songObj;
        index++;
      });
    });

    console.log("dataObj -> ")
    console.log(this.dataObj);
  }

  private convertLengthToInt(): void {
    this.dataObjInt = this.dataObj;
    for (let i = 1; i <= Object.keys(this.dataObjInt).length - 1; i++) {
      if (this.dataObjInt[i].length != undefined) {
        this.dataObjInt[i].length = parseInt(this.dataObjInt[i].length);
      }
    }
    console.log("dataObjInt -> ")
    console.log(this.dataObjInt);
  }

  private getSongs(dataObj: object) {
    let songs = {};
    for (let i = 1; i <= Object.keys(dataObj).length - 1; i++) {
      songs[i] = this.dataObj[i];
    }
    return songs;
  }

  private getDataPhaseA(dataObj: object) {
    let songs = this.getSongs(dataObj);
    let songsA = [];

    Object.keys(songs).forEach(index => {
      let song = {};

      song["title"] = songs[index]["title"];

      if (songs[index]["language"] != undefined) {
        song["language"] = songs[index]["language"];
      }
      else {
        song["language"] = "undefined";
      }

      if (songs[index]["length"] != undefined) {
        song["length"] = songs[index]["length"];
      }
      else {
        song["length"] = 0;
      }

      if (songs[index]["format"]) {
        song["format"] = songs[index]["format"][0];
      }
      else {
        song["format"] = "undefined";
      }

      if (songs[index]["genre"]) {
        song["genre"] = songs[index]["genre"][0];
      }
      else {
        song["genre"] = "undefined";
      }

      song["isClassic"] = songs[index]["isClassic"];
      if(songs[index]["isClassic"]==true){
        song["isClassic"]="true"
      }
      else{
        song["isClassic"]="false"
      }
      songsA.push(song);
    })
    return songsA;
  }

  private getDataPhaseB(dataObj: object) {
    let songs = this.getSongs(dataObj);
    let songsB = [];

    Object.keys(songs).forEach(index => {
      let song = {};
      let choice;
      let nbGenre;
      let nbFormat;

      if((songs[index]["genre"] != undefined) && (songs[index]["format"] != undefined)) {
        nbGenre = Object.keys(songs[index]["genre"]).length;
        nbFormat = Object.keys(songs[index]["format"]).length;

        if(nbGenre != 0 && nbFormat !=0) {
          if(nbGenre > nbFormat) choice = "format";
          else if  (nbFormat > nbGenre) choice = "genre";
          else if (nbFormat == nbGenre) choice = "equal";
        }
        else choice = "check"; 
      }

      else choice = "undefined detected";

      song["title"] = songs[index]["title"];

      if (songs[index]["language"] != undefined) {
        song["language"] = songs[index]["language"];
      }
      else {
        song["language"] = "undefined";
      }

      if (songs[index]["length"] != undefined) {
        song["length"] = songs[index]["length"].toString();
      }
      else {
        song["length"] = "undefined";
      }

      song["isClassic"] = songs[index]["isClassic"];
      if(songs[index]["isClassic"]==true){
        song["isClassic"]="true"
      }
      else{
        song["isClassic"]="false"
      }

      if(choice == "genre") {
        console.log("choice == genre");
        for(let i = 0; i < nbGenre;  i++) {
          let songDuplicate = song;

          songDuplicate["format"] = songs[index]["format"][i];
          songDuplicate["genre"] = songs[index]["genre"][i];

          songsB.push(songDuplicate);

        }
      }
      else if (choice  == "format") {
        console.log("choice == format");
        for(let i = 0; i < nbFormat;  i++) {
          let songDuplicate = song;

          songDuplicate["format"] = songs[index]["format"][i];
          songDuplicate["genre"] = songs[index]["genre"][i];

          songsB.push(songDuplicate);
        }
      }
      else if (choice ==  "equal") {
        console.log("choice == equal");
        for(let i = 0; i < nbFormat;  i++) {
          let songDuplicate = song;

          songDuplicate["format"] = songs[index]["format"][i];
          songDuplicate["genre"] = songs[index]["genre"][i];

          songsB.push(songDuplicate);
        }
      }
      else if (choice == "check") {
        console.log("choice == check");
        if(nbGenre != 0) {
          for(let i = 0; i < nbGenre;  i++) {
            let songDuplicate = song;
  
            songDuplicate["format"] = "undefined";
            songDuplicate["genre"] = songs[index]["genre"][i];

            console.log(songDuplicate);
  
            songsB.push(songDuplicate);
  
          }
        }
        else if (nbFormat != 0) {
          for(let i = 0; i < nbFormat;  i++) {
            let songDuplicate = song;
  
            songDuplicate["format"] = songs[index]["format"][i];
            songDuplicate["genre"] = "undefined";
  
            songsB.push(songDuplicate);
          }
        }
        else {
          song["format"] = "undefined";
          song["genre"] = "undefined";

          songsB.push(song);
        }
      }
      else if (choice == "undefined detected") {
        console.log("choice == undefined detected");
        if((songs[index]["genre"] == undefined) && (songs[index]["format"] != undefined)) {
          console.log("genre == undefined");
          nbFormat = Object.keys(songs[index]["format"]).length;
          for(let i = 0; i < nbFormat;  i++) {
            let songDuplicate = song;
  
            songDuplicate["format"] = songs[index]["format"][i];
            songDuplicate["genre"] = "undefined";
  
            songsB.push(songDuplicate);
          }
        }
        else if((songs[index]["format"] == undefined) && (songs[index]["genre"] != undefined)) {
          console.log("format == undefined")
          nbGenre = Object.keys(songs[index]["genre"]).length;
          for(let i = 0; i < nbGenre;  i++) {
            let songDuplicate = song;
  
            songDuplicate["format"] = "undefined";
            console.log(songs[index]["genre"][i]);
            songDuplicate["genre"] = songs[index]["genre"][i];

            console.log(songDuplicate)
  
            songsB.push(songDuplicate);
          }
        }
        else {
          song["format"] = "undefined";
          song["genre"] = "undefined";

          songsB.push(song);
        }
      }
    })
    console.log("songsB -> ");
    console.log(songsB);
    return songsB;
  }

  // Not functionnal for inside objects yet !
  private printAttributeValues(obj: object, attribute: string): string {
    let value = "";
    Object.keys(obj).forEach(index => {
      // index is 1 2 3 ect here so the index ! It's not an object !

      //console.log(obj[index][attribute])

      // A way to deal with reading undefined as an object ?
      if (obj[index][attribute] != undefined) {
        if (Object.keys(obj[index][attribute]).length <= 1) {
          Object.keys(obj[index][attribute]).forEach(e => {
            value = value + e + " - ";
          });
        }
        else {
          value = value + obj[index][attribute] + " - ";
        }
      }
      else {
        value = value + obj[index][attribute] + " - ";
      }

      /*
      // A bad way to deal with reading undefined as an object ?
      try {
        if(Object.keys(obj[index][attribute]).length <= 1) {
          Object.keys(obj[index][attribute]).forEach(e => {
            value = value + e + " - ";
          });
        }
        else {
          value = value + obj[index][attribute] + " - ";
        }
      } 
      
      catch(error) {
        value = value + obj[index][attribute] + " - ";
      }

      if(Object.keys(obj[index][attribute]) == undefined) {
        value = value + obj[index][attribute] + " - ";
      }
      else {
        value = value + obj[index][attribute] + " - ";
      }*/
    })
    return value
  }

  //----- creation du diagramme -------//
  buildParalleGraph(svg) {
    var margin = { top: 10, right: 10, bottom: 10, left: 0 },
      width = 1000 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;
    let data1 = this.getDataPhaseA(this.dataObj);
    //console.log("je suis la");
    //console.log(data1);
    svg.append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


    // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
    const dimensions = Object.keys(data1[0]).filter(function (d) { return d })

    console.log(dimensions)

    // For each dimension, I build a linear scale. I store all in a y object
    const y = {}

    const title = [];
    const format = [];
    const genre = [];
    const isClassic= [];
    const language=[]
    for (var t = 0; t < data1.length; t++) {

      title.push(data1[t].title)
      format.push(data1[t].format)
      genre.push(data1[t].genre)
      isClassic.push(data1[t].isClassic)
      language.push(data1[t].language)

    }
    //console.log("je suis la 2")
    //console.log(format)
    //console.log(genre)
    //console.log(title);
    //console.log(isClassic)

    //console.log(data1[1].length)

    for (var i in dimensions) {
      const name = dimensions[i]
      if (name == "length") {
        y[name] = d3.scaleLinear()// scale point
          .domain(d3.extent(data1, function (d) { return +d[name]; }))
          .range([height, 20])
      }
      else if (name == "title") {
        y[name] = d3.scalePoint()// scale point
          .domain(title) // 
          .range([height, 20])
      }
      else if (name == "format") {
        y[name] = d3.scalePoint()// scale point
          .domain(format) // 
          .range([height, 20])
      }
      else if (name == "genre") {
        y[name] = d3.scalePoint()// scale point
          .domain(genre) // 
          .range([height, 20])
      }
      else if (name == "isClassic") {

        y[name] = d3.scalePoint()// scale point
          .domain(isClassic) // 
          .range([height, 20])
      }
      else {
        y[name] = d3.scalePoint()// scale point
        .domain(language) // 
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
      return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
    }
    // Draw the lines
    svg
      .selectAll("myPath")
      .data(data1)
      .join("path")
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("opacity", 0.5)

    // Draw the axis:

    svg.selectAll("myAxis")
      // For each dimension of the dataset I add a 'g' element:
      .data(dimensions).enter()
      .append("g")
      // I translate this element to its right position on the x axis
      .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
      // And I build the axis with the call function
      .each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
      // Add axis title
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", 10)
      .text(function (d) { return d; })
      .style("fill", "black")


  }


  render() {
    return (
      <Host>
        <h1>Parallel graph</h1>
        <p>Artist : {this.artist}</p>
        <h2>Stats </h2>
        <p>Missing data : </p>
        <svg class="chart" />
      </Host>
    )
  }
}