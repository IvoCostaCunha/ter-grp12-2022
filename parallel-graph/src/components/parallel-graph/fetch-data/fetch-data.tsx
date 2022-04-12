import { Component, Host, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'fetch-data',
  styleUrl: 'fetch-data.css',
  shadow: true,
})
export class FetchData {
  @Prop() artist;

  // Constain valuable information to use in the parallel graph
  @State() dataObj = {artist:""};
  @State() dataObjInt;

  componentDidLoad() {
    this.analiseData();
    this.convertLengthToInt();
    this.getSongs(this.dataObj);

  }

  private httpGet(url): string {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", url, false); 
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
  }
  private getData(): string {
    try{
      let data = this.httpGet("https://wasabi.i3s.unice.fr/api/v1/artist_all/name/"+this.artist)
      return data;
    }
    catch(error) {
      console.log(error);
    } 
  }

  private analiseData() {

    let json = JSON.parse(this.getData());
    this.artist = json["name"];
    this.dataObj.artist = json["name"];
    let albums = json["albums"];

    albums.forEach(album => {
      let songs = album["songs"];
      let index = 1;
      let globalGenre = album["genre"];

      songs.forEach(song => {
        let songObj = {id:"", title:"", length:"", language:"", isClassic:""};

        songObj.id = song["_id"];
        songObj.title = song["title"];
        songObj.isClassic = song["isClassic"];

        // We test if lenght is defined 
        if(song["length"] != "") {
          songObj.length = song["length"];
        }
        else {
          songObj.length = undefined;
        }

        // We test if genre is defined in the song otherwise we use album genre
        if(song.hasOwnProperty("genre")) {
          let genreArray = song["genre"];
          let genre = {};
          let i = 0;
          genreArray.forEach(g => {
            genre[i] = g;
            i++;
          });
          songObj["genre"] = genre;
        }
        else{
          if(globalGenre != "") {
            songObj["genre"] = globalGenre;
          }
          else {
            songObj["genre"] = undefined;
          }
        }

        // We test if format is defined otherwise we set it undefined
        if(song.hasOwnProperty("format")) {
          let formatArray = song["format"];
          let format = {};
          let i = 0;
          formatArray.forEach(f => {
            format[i] = f;
            i++;
          });
          songObj["format"]  = format;
        }
        else {
          songObj["format"] = undefined;
        }

        // We verify if "language" isn't undefined, if it is we take "language_detect" instead
        if(song["language"] == "") {
          if(song["language_detect"] != undefined) {
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
    console.log("dataObj -> ");
    console.log(this.dataObj);
  }

  private convertLengthToInt(): void {
    this.dataObjInt = this.dataObj;
    for(let i=1; i<=Object.keys(this.dataObjInt).length-1; i++) {
      if(this.dataObjInt[i].length != undefined) {
        this.dataObjInt[i].length = parseInt(this.dataObjInt[i].length);    
      }
    }
    console.log("dataObjInt -> ");
    console.log(this.dataObjInt);
  }

  private getSongs(dataObj: object) {
    let songs = {};
    for(let i=1; i<=Object.keys(dataObj).length-1; i++) {
      songs[i] = this.dataObj[i];
    }
    return songs;
  }

  // Not functionnal for inside objects yet !
  private printAttributeValues(obj: object, attribute: string): string {
    let value = "";
    Object.keys(obj).forEach(index => {
      // index is 1 2 3 ect here so the index ! It's not an object !
      // console.log(obj[index][attribute])

      if(Object.keys(obj[index][attribute]) == undefined) {
        value = value + obj[index][attribute] + " - ";
      }
      else {
        value = value + obj[index][attribute] + " - ";
      }
    })
    return value
  }


  render() {
    return (
      <Host>
        <h1>Artist/Group Name</h1> 
        {this.dataObj.artist}
        <h1>Song List</h1> 
        {this.printAttributeValues(this.getSongs(this.dataObj), "title")}
        <h1>Languages</h1> 
        {this.printAttributeValues(this.getSongs(this.dataObj), "language")}
        <h1>Genres</h1> 
        
        <br/><br/><br/>
        <h1>Raw JSON</h1> 
      </Host>
    );
  }

}
