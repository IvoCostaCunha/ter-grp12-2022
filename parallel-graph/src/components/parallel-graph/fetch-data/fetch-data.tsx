import { Component, Host, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'fetch-data',
  styleUrl: 'fetch-data.css',
  shadow: true,
})
export class FetchData {
  @Prop() artist:string;

  // @State renders the components each time it's updated
  @State() songList:string[];
  @State() songLanguages:string[];
  @State() albumGenres:string[];

  private httpGet(url) {
    let xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", url, false); 
    xmlHttpReq.send(null);
    return xmlHttpReq.responseText;
  }
  private getData(): string {
    let data = this.httpGet("https://wasabi.i3s.unice.fr/api/v1/artist_all/name/"+this.artist)
    return data;
  }

  private analiseData() {
    let json = JSON.parse(this.getData());
    this.artist = json["name"];
    let albums = json["albums"];
    albums.forEach(album => {
      this.albumGenres = [this.albumGenres, album["genre"]];
      let songs = album["songs"];
      songs.forEach(song => {

        // We verify if "language" isn't undefined, if it is we take "language_detect" instead
        if(song["language"] == undefined) {
          if(song["language_detect"] != undefined) {
            this.songLanguages = [this.songLanguages, song["language_detect"]];
          }
        }
        else {
          this.songLanguages = [this.songLanguages, song["language"]];
        }
        this.songList = [this.songList, song["title"]];
      });
    });
    //this.occurencesCalculator();
  }

  private occurencesCalculator() {
    let languages = new Map();
    let genres = new Map();

    this.songLanguages.forEach(lang => {
      if(languages.has(lang)) {
        languages.set(lang, languages.get(lang)+1);
      }
      else {
        languages.set(lang, 1);
      }
    });

    this.albumGenres.forEach(genre => {
      console.log(genre);
      if(genres.has(genre)) {
        genres.set(genre, parseInt(genres.get(genre))+1);
      }
      else {
        genres.set(genre, 1);
      }
    });

    //console.log(genres);

    /* [["eng","34"],["spa","27"]]*/
  }

  /* [{"value": 80, "tag": "eng"}, {"value": 5, "tag": "undefined"}] */

  render() {
    return (
      <Host>
        {this.analiseData()}
        <h1>Artist/Group Name</h1> {this.artist}
        <h1>Song List</h1> {this.songList}<br/><br/><br/>
        <h1>Languages</h1> {this.songLanguages}
        <h1>Genres</h1> {this.albumGenres}
        <h1>Raw JSON</h1> 
      </Host>
    );
  }

}
