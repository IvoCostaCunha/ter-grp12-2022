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
  @Prop() width: number = 2000;
  @Prop() height: number = 1000;
  @Prop() data: string = "[]";

  @State() newArtist: string;
  @State() currentArtist: string;


  // Constain valuable information to use in the parallel graph
  @State() dataObj = { artist: "" };
  @State() dataObjInt;
  @State() dataa;
  public chartData: any;

  componentDidLoad() {
    /*
    // Test data 
    let tabFormat = ["fa","fb","fc","fd","fe"];
    let tabGenre = ["ga","gb","gc","gd"];
    let testData = {"artist": "testArtist", 1: {"format": tabFormat, "genre": tabGenre, "id": "1", "isClassic": false, 
    "language": "eng", "length": "200", "title": "test"}};
    
    this.getDataPhaseB(testData);*/
    this.currentArtist = "Queen";
    this.changeArtistName("Queen");
    this.loadGraph();
  }
//------------------------------------- BASE DE DONNEES ----------------------------------------//
  private httpGet(url: string): string {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", url, false);
    xmlHttpReq.send(null);
    if(xmlHttpReq.status == 200) {
      return xmlHttpReq.responseText;
    }
    else {
      return xmlHttpReq.status.toString();
    }
  }
  private getData(artist: string): string {
    try {
      let data = this.httpGet("https://wasabi.i3s.unice.fr/api/v1/artist_all/name/" + artist)
      return data;
    }
    catch (e) {
      alert("Data not received due to : " + e);
    }
  }

  private loadGraph() {
    let divT= select(this.element.shadowRoot.querySelectorAll(".tool")[0])
    let svg = select(this.element.shadowRoot.querySelectorAll(".chart")[0])
      .attr("width", this.width)
      .attr("height", this.height);
    this.buildParalleGraph(svg,divT);
  }

  private changeArtistName(artistName) {
    this.element.shadowRoot.querySelectorAll(".tool")[0].innerHTML = "loading...";
    this.analyseData(artistName);
    this.element.shadowRoot.querySelectorAll(".tool")[0].innerHTML = '<svg class="chart" />';
    this.loadGraph();
  }

  private handleSubmit(event: Event) {
    event.preventDefault();
    this.currentArtist = this.newArtist;
    this.changeArtistName(this.currentArtist);
  }

  private handleChange(event) {
    this.newArtist = event.target.value;
    // TODO: Should load there a list of artist which names are like the one typed

  }

  private analyseData(artist: string) {

    let json;

    if(this.getData(artist) == "404") {
      this.element.shadowRoot.querySelectorAll(".log")[0].setAttribute("style","color: orange");
      this.element.shadowRoot.querySelectorAll(".log")[0].innerHTML =  "Artist name not found on Wasabi.";
      console.log("Artist name not found on Wasabi.");
      return null;
    }
    else if(this.getData(artist) == "429") {
      this.element.shadowRoot.querySelectorAll(".log")[0].setAttribute("style","color: red");
      this.element.shadowRoot.querySelectorAll(".log")[0].innerHTML =  "Too many requests on Wasabi.";
      console.log("Too many requests on Wasabi.")
      return null;
    }
    else {
      this.element.shadowRoot.querySelectorAll(".log")[0].setAttribute("style","color: green");
      this.element.shadowRoot.querySelectorAll(".log")[0].innerHTML =  "Request OK.";
      console.log("Request OK.");

      json = JSON.parse(this.getData(artist));
    }

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
          if (song["language_detect"] != "") {
            songObj.language = song["language_detect"];
          }
          else{
            songObj.language="empty";
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
  }

  private getSongs(obj: object) {
    let songs = {};

    for (let i = 1; i < Object.keys(obj).length; i++) {
      songs[i] = obj[i];
    }
    return songs;
  }

  private getDataPhaseA(obj: object) {
    let songs = this.getSongs(obj);
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
      if (songs[index]["isClassic"] == true) {
        song["isClassic"] = "true"
      }
      else {
        song["isClassic"] = "false"
      }
      songsA.push(song);
    })
    return songsA;
  }

  private getDataPhaseB(obj: object) {
    let songs = this.getSongs(obj);
    let songsB = [];

    Object.keys(songs).forEach(index => {
      let song = {};
      let choice;
      let nbGenre;
      let nbFormat;

      // Choose a type of how to treat data
      if ((songs[index]["genre"] != undefined) && (songs[index]["format"] != undefined)) {
        nbGenre = Object.keys(songs[index]["genre"]).length;
        nbFormat = Object.keys(songs[index]["format"]).length;

        if (nbGenre != 0 && nbFormat != 0) {
          choice = "format&genre";
        }
        else choice = "check";
      }

      else choice = "undefined detected";

      song["title"] = songs[index]["title"];
      //song["id"] = songs[index]["id"];

      song["language"] = songs[index]["language"] != undefined ? songs[index]["language"] : "undefined";
      song["length"] = songs[index]["length"] != undefined ? songs[index]["length"].toString() : "undefined";

      song["isClassic"] = songs[index]["isClassic"];

      if (choice == "format&genre") {
        for (let i = 0; i < nbFormat; i++) {
          for (let j = 0; j < nbGenre; j++) {
            let songDuplicate = { ...song };
            songDuplicate["format"] = songs[index]["format"][i];
            songDuplicate["genre"] = songs[index]["genre"][j];
            songsB.push(songDuplicate);
          }
        }
      }

      else if (choice == "equal") {
        for (let i = 0; i < nbFormat; i++) {
          let songDuplicate = { ...song };

          songDuplicate["format"] = songs[index]["format"][i];
          songDuplicate["genre"] = songs[index]["genre"][i];

          songsB.push(songDuplicate);
        }
      }
      else if (choice == "check") {
        if (nbGenre != 0) {
          for (let i = 0; i < nbGenre; i++) {
            let songDuplicate = { ...song };

            songDuplicate["format"] = "undefined";
            songDuplicate["genre"] = songs[index]["genre"][i];

            songsB.push(songDuplicate);

          }
        }
        else if (nbFormat != 0) {
          for (let i = 0; i < nbFormat; i++) {
            let songDuplicate = { ...song };

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
        if ((songs[index]["genre"] == undefined) && (songs[index]["format"] != undefined)) {
          nbFormat = Object.keys(songs[index]["format"]).length;
          for (let i = 0; i < nbFormat; i++) {
            let songDuplicate = { ...song };

            songDuplicate["format"] = songs[index]["format"][i];
            songDuplicate["genre"] = "undefined";

            songsB.push(songDuplicate);
          }
        }
        else if ((songs[index]["format"] == undefined) && (songs[index]["genre"] != undefined)) {
          nbGenre = Object.keys(songs[index]["genre"]).length;
          for (let i = 0; i < nbGenre; i++) {
            let songDuplicate = { ...song }; // copy of object and not of reference !

            songDuplicate["format"] = "undefined";
            songDuplicate["genre"] = songs[index]["genre"][i];

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
    return songsB;
  }

  // Not functionnal for inside objects yet !
  private printAttributeValues(obj: object, attribute: string): string {
    let value = "";
    Object.keys(obj).forEach(index => {
      // index is 1 2 3 ect here so the index ! It's not an object !

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






  //-------------------------------------- CREATION DU DIAGRAMME ------------------------------------------------------//




  buildParalleGraph(svg,divT) {
    var margin = { top: 10, right: 10, bottom: 10, left: 0 },
      width = 1900 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom;
    let data1 = this.getDataPhaseB(this.dataObj);
    svg.append("g")
    
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


    // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
    const dimensions = Object.keys(data1[0]).filter(function (d) { return d })

    // For each dimension, I build a linear scale. I store all in a y object
    const y = {}
    
    
    var k = 0 ;
    var val =   Object.values(data1[1]);
    console.log("data1 10 : " +data1[1].length);
    
    var valStr =  val.toString( ) ;
    
    //console.log("type of value : " + typeof val);


    const title = [];
    let longueur = [];
    const format = [];
    const genre = [];
    const isClassic = [];
    const language = []
    for (var t = 0; t < data1.length; t++) {
     
      longueur.push(data1[t].length)
      title.push(data1[t].title)
      format.push(data1[t].format)
      genre.push(data1[t].genre)
      isClassic.push(data1[t].isClassic)
      language.push(data1[t].language)

    }
    
    let bonneLongueur = longueur.filter(d => d != "undefined")
    bonneLongueur.sort((a,b)=> +b-(+a))

    bonneLongueur.splice(0, 0, "undefined")
    longueur = bonneLongueur

    for (var i in dimensions) {

      k++;
      var j = 0 ;

      var catToTest = valStr.substring(0,valStr.indexOf(","));
     valStr = valStr.substring(catToTest.length+1,valStr.length);
     //console.log("catToTest : " + catToTest);
     var type = "";
     
      var cTT: number = 0;
      cTT = +catToTest;
      console.log("cTT : " + cTT);
 
      if(isNaN(cTT)){
        type = "string";
      }else{
        type = "nombre";
      }
     
      const name = dimensions[i] ;


      
      if (name == "length") {
        y[name] = d3.scalePoint()// scale point
          .domain(longueur)
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
      else {
        y[name] = d3.scalePoint()// scale point
          .domain(language) // 
          .range([height, 20])
      }




      //TODO: prend la bonne catégorie mais bug quand même, à fix 
      if(type == "nombre"){
        console.log("nombre");
      }else{
        console.log("texte");
      }
      // automatisation des noms des colonnes (à fix)
   /*
      if(type == "nombre"){
        y[name] = d3.scaleLinear()// scale point
          .domain( d3.extent(data1, function(d) {return +d[name]; }) ) // 
          .range([height, 20])
        }
        else{
          y[name] = d3.scalePoint()// scale point
          .domain( ["setosa","versicolor", "virginica"] */
          /*d3.extent(data, function(d) { console.log(d["Species"]) ;return d["Species"]; }) */
         /* ) 
          .range([height, 20])
        }
*/

    
    }

    // Build the X scale -> it find the best position for each Y axis
    const x = d3.scalePoint()
      .range([0, width])
      .padding(1)
      .domain(dimensions);

    function addslashes(ch) {
      ch= "a"+ch
      ch = ch.replace(/\s+/g, '')
      ch = ch.replace(/['"]+/g, '')
      ch = ch.replace(/[^\w\s!?]/g, '')
      ch = ch.replace(/\?/g, '')
      return ch.toLowerCase()
    }
//-------------------Tooltip --------------------------//


    var Tooltip = divT.append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "#d2ebbe")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    var mousemove = function(event,d) {
      let tmptitle = [];
      let tmplong = [];
         for (var t = 0; t < data1.length; t++) {
         if (d==data1[t].title){
           tmptitle.push(data1[t].title)
           if (!tmplong.includes(data1[t].length)){
           tmplong.push(data1[t].length)
         }
         }
 
         }
         if(tmptitle.includes(d)){
            //récupères l'id à partir du titre pour connaitre les valeurs à mettre en avant sur les axes en y et ajouter les infos dans la tooltip
      var selected ;
      data1.forEach(function (value) { if(value.title==d){ selected = value}});
  
         if(tmplong.length>1){
       Tooltip
       // titre en gras
       .style("stroke", "black")
       .html("The tittle is: " + d+ /*"<br>"+"number of id : "+tmplong.length+"<br>"+"first id length : "+tmplong[0]+ */ "<br>"+"second id length : "+tmplong[1])
       .style("left", (event.pageX-240 )+ "px")
       .style("top",  (event.pageY+ 20)+"px")
       .style("position", "absolute")
     }
     else{
       Tooltip
       // titre en gras
       .style("stroke", "black")
       .html("The tittle is: " + d +  /*"<br>"+"number of id : "+tmplong.length+"<br>"+"first id length : "+tmplong[0] +*/ " <br> language : " + selected.language + "<br> style de musique : " + selected.genre )
       .style("left", (event.pageX-240 )+ "px")
       .style("top",  (event.pageY+ 20)+"px")
       .style("position", "absolute")
     }
     
         }
    }
    const mouseover = function (event, d) {

     
      // verifier si c'est un chiffre si c'est un chiffre return
      const selected_title = addslashes(d)
      // first every group turns grey
      svg.selectAll(".line")
        .style("stroke", "#69b3a2")
        .style("opacity", "0.1")
        .style("stroke-width", "0.7px")
      // Second the hovered title takes its red
      svg.selectAll("." + selected_title)
        .style("stroke", "#FF0000")
        .style("opacity", "1")
        .style("stroke-width", "3px")
        Tooltip
        .style("opacity", 1)
     
        d3.select(this)
    .style("stroke", "black")
    .style("opacity", 1)

    }
    const mouseleave = function (event) {
      svg.selectAll(".line")
        .style("stroke", "#69b3a2")
        .style("opacity", "1")
        .style("stroke-width", "0.7px")
        Tooltip
        .style("opacity", 0)
        d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }
    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
      return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
    }
    // Draw the lines
    svg
      .selectAll("myPath")
      .data(data1)
      .join("path")
      .attr("class", function (d) { return "line " + addslashes(d.title) + " " +  addslashes(d.language) + " "+ addslashes(d.format)+" "+ addslashes(d.genre) +" "+ addslashes(d.length)+" "+ addslashes(d.isClassic)})
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", "#69b3a2")
      .style("opacity", 0.5)

    // Draw the axis:

    svg.selectAll("myAxis")
      // For each dimension of the dataset I add a 'g' element:
      .data(dimensions).enter()
      //TODO: trier liste dimensions selon l'ordre visuel désiré
      .append("g")
      //TODO:  voir comment marche join et remplacer append par join où necessaire (réaffichage dynamique de la page)
      // I translate this element to its right position on the x axis
      .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
      // And I build the axis with the call function
      .each(function (d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])).selectAll(".tick text").on("mouseover", mouseover).on("mousemove", mousemove).on("mouseleave", mouseleave); })
      // Add axis title
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", 10)
      .text(function (d) { return d; })
      .style("fill", "black")



  }

  // used https://stenciljs.com/docs/forms for form

  render() {
    return (
      <Host>
        <div class="search-zone">
          <h1>Parallel graph</h1>

          <form onSubmit={(e) => this.handleSubmit(e)}>
            <label> 
              Search artist name:  <input class="input-search" type="text" value={this.newArtist} onInput={(event) => this.handleChange(event)} />
            </label>
            <input type="submit" value="Search" />
          </form>
          <div class="log"> No problems </div>
          <div class="current-artist" >Current artist : {this.currentArtist}</div>
          <h2>Stats (TODO) </h2>
          <p>Missing data : </p>
        </div>

        <div class="tool">
          <svg class="chart" />
        </div>
      </Host>
    )
  }
}
