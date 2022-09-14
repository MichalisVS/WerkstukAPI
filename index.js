//Opslaan tijd van opzoeking lyrics via button
function saveTimeNow() {
    var today = new Date();
    var date = today.getUTCDate() + "/" + today.getUTCMonth();
    var time = today.getHours() + ":" + today.getMinutes();
    timeStamp = date + " " + time;
    //document.getElementById("submitknop").value = time;
    console.log(time);
    console.log(date);
}

"use strict";
//Firebase
firebase.initializeApp({
    apiKey: 'AIzaSyAkrX2qKiO73l36uBZ_uy2oC5jqyaM5cLQ ',
    projectId: 'dev2-werkstukapi-michalisvs'
});

const database = firebase.firestore();
const songsCollection = database.collection("Song");

const convertQuerySnapshotToRegularArray = (querySnapshot) => querySnapshot.docs.map((item) => ({
    id: item.id,
    ...item.data()
}));

const sortByTimeStamp = (a, b) => {
    if (a.timeStamp < b.timeStamp) {
        return 1;
    }
    if (a.timeStamp > b.timeStamp) {
        return -1;
    }
};

async function renderSongs() {
    songsCollection.onSnapshot((querySnapshot) => {
        let htmlString = '';
        const songs = convertQuerySnapshotToRegularArray(querySnapshot);
        songs.sort(sortByTimeStamp);
        songs.forEach((Song) => {
            htmlString += `
          <li value=${Song.id}>
               ${Song.artistSong} - ${Song.titleSong} - ${Song.timeStamp}
          </li>
        `;
        });
        document.getElementById('searchList').innerHTML = htmlString;
    });
}

renderSongs();

//Bepaling variablen, const aanmaken voor resultaat data van api & bepalen variable van de form.
let timeStamp = 0;
const lyricsResultElement = document.getElementById("lyricsResult");
let artistInput = "";
let titleInput = "";
let artistSearched = "";
let titleSearched = "";
const formElement = document.getElementById("form");
formElement.addEventListener("submit", submitForm);

function checkInput() {

}

//Eigenschappen form + toevoegen eventlistener & data uit inputvelden halen.
async function submitForm(event) {
    artistInput = document.getElementById("searchArtist");
    titleInput = document.getElementById("searchTitle");
    artistSearched = artistInput.value;
    titleSearched = titleInput.value;
    event.preventDefault();
    const songDetails = {
        artist: artistInput.value,
        title: titleInput.value
    };
    const artistSong = songDetails.artist;
    const titleSong = songDetails.title;
    console.log(songDetails.artist + " " + songDetails.title);
    saveTimeNow();
    await songsCollection.add({
        artistSong,
        titleSong,
        timeStamp,
    });
    fetchLyricsData(songDetails.artist, songDetails.title);

}

//De data ophalen van de api via de meegegeven data uit de inputvelden aan de hand van de fetch methode.
async function fetchLyricsData(nameArtist, nameTitle) {
    try {
        const response = await fetch(`https://api.lyrics.ovh/v1/${nameArtist}/${nameTitle}`);
        if (!response.ok) throw new Error(response.statusText);
        const lyricsJson = await response.json();
        showLyricsData(lyricsJson);
        console.log(lyricsJson);
    } catch (e) {
        lyricsResultElement.innerHTML = e;
    }
}

//De data opslaan en tonen op de webpagina.
function showLyricsData(lyricsData) {
    const {
        lyrics,
    } = lyricsData;

    const htmlString = `
    <h2>
    ${artistSearched} - ${titleSearched}
    </h2>
    <p>
        ${lyrics}
    </p>
    `;
    lyricsResultElement.innerHTML = htmlString;
}