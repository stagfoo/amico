import dashjs from 'dashjs';
export function loadDashVideo(){
    let url = "https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd";
    var player = dashjs.MediaPlayer().create();
    player.initialize((document.querySelector("#dash") as any), url, true);
}