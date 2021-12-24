import dashjs from 'dashjs';
export function loadDashVideo(){
    let url = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd";
    var player = dashjs.MediaPlayer().create();
    player.initialize((document.querySelector("#dash") as any), url, true);
}