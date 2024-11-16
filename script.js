let pokemonIndex = 0;
let currentPokemons = [];
const BASE_URL = "https://pokeapi.co/api/v2/";
const LIMIT_URL = "pokemon?limit=";
const LIMIT = 2;
let OFFSET = 0;

function init() {
  getPokemons();
}

async function getPokemons() {
  showLoadingSpinner(true);

  try {
    let response = await fetch(BASE_URL + LIMIT_URL + LIMIT + "&offset=" + OFFSET);
    let responseToJson = await response.json();
    console.log(responseToJson);

    for (let index = 0; index < responseToJson.results.length; index++) {
      let pokeName = responseToJson.results[index].name;
      const pokeUrl = responseToJson.results[index].url;
      let detailResponse = await fetch(pokeUrl);
      let pokeDetails = await detailResponse.json();
      let pokeImg = pokeDetails.sprites.other.dream_world.front_default;
      let pokeType = pokeDetails.types.map(typeInfo => typeInfo.type.name).join(' ');
      let pokeId = pokeDetails.id
      pushPokeToArr(pokeName, pokeUrl, pokeId, pokeImg, pokeType);
    }
    console.log(currentPokemons);
    renderPokemons();
  } catch (e) {
    let errorMessageRef = document.getElementById('error_message');
    document.getElementById('error_message').classList.remove('d_none');
    errorMessageRef.innerHTML = getErrorMessage();
    currentPokemons = [];
  } finally {
    showLoadingSpinner(false);
  }
}

function showLoadingSpinner(show) {
  const spinnerRef = document.getElementById('loading_spinner');
  if (show) {
    spinnerRef.classList.remove('d_none');
    document.getElementById('load_more_btn').classList.add('d_none');
  } else {
    spinnerRef.classList.add('d_none');
    document.getElementById('load_more_btn').classList.remove('d_none');
  }
}

function pushPokeToArr(pokeName, pokeUrl, pokeId, pokeImg, pokeType) {
  currentPokemons.push({ pokeName, pokeUrl, pokeId, pokeImg, pokeType })
}

function renderPokemons() {
  let pokemonRef = document.getElementById('pokemon');
  pokemonRef.innerHTML = "";

  currentPokemons.forEach((pokemon) => {
    pokemonRef.innerHTML += getPokemonCardsTemplate(pokemon);
  });
}

function openOverlay() {

}

function loadMorePokes() {
  showLoadingSpinner(true);
  OFFSET += LIMIT;
  getPokemons();
}



// function searchPokemon() {
//   let searchTerm = document.getElementById('searchId').value;
//   if (searchTerm.length >= 3) {
//     console.log('Suchbegriff: ', searchTerm);
//     let searchTermLow = searchTerm.toLowerCase();
//     console.log('Suchbegriff: ', searchTermLow);
//     allPokemons.filter(pokemon => {
//       if (pokemon.name.toLowerCase().includes(searchTermLow)) {
//         searchArray.push(pokemon);
//       }
//     });
//     console.log('gesuchte Pokemon: ', searchArray);
//     let pokeContainer = document.getElementById('PokeId');
//     pokeContainer.innerHTML = '';
//     for (let i = 0; i < searchArray.length; i++) {
//       let singlePokemon = searchArray[i];
//       pokeContainer.innerHTML += `
//                 <div>${singlePokemon['name']}</div>
//         `;
//     }
//   }
// }