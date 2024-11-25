let currentPokemons = [];
const BASE_URL = "https://pokeapi.co/api/v2/";
const POKE_URL = "pokemon";
const EVOLUTION_URL = "evolution-chain";
const LIMIT_URL = "?limit=";
const LIMIT = 10;
let OFFSET = 0;
let evolutionChains = [];
let i = 0;
let allfilteredPokemons = [];
const MAX_RESULTS = 3;
let currentDisplayedIndex = MAX_RESULTS;

function init() {
  getPokemons();
  getEvoChains();
}

async function getPokemons() {
  showLoadingSpinner(true);
  try {
    const responseToJson = await fetchPokemonsData();
    for (let index = 0; index < responseToJson.results.length; index++) {
      const pokeDetails = await fetchPokemonDetails(responseToJson.results[index].url);
      processPokemonDetails(pokeDetails);
    }
    renderPokemons();
  } catch (e) {
    handleError(e);
  } finally {
    showLoadingSpinner(false);
  }
}

async function fetchPokemonsData() {
  let response = await fetch(BASE_URL + POKE_URL + LIMIT_URL + LIMIT + "&offset=" + OFFSET);
  let responseToJson = await response.json();
  return responseToJson;
}

async function fetchPokemonDetails(url) {
  let detailResponse = await fetch(url);
  let pokeDetails = await detailResponse.json();
  return pokeDetails;
}

function processPokemonDetails(pokeDetails) {
  let pokeName = pokeDetails.name;
  let pokeId = pokeDetails.id;
  let pokeImg = pokeDetails.sprites.other.dream_world.front_default;
  let pokeType = pokeDetails.types.map(typeInfo => typeInfo.type.name).join(' ');
  let pokeHeight = pokeDetails.height;
  let pokeWeight = pokeDetails.weight;
  let baseExperience = pokeDetails.base_experience;
  let abilities = pokeDetails.abilities.map(ableTo => ableTo.ability.name).join(', ');
  let moves = pokeDetails.moves.slice(0, 3).map(firstMoves => firstMoves.move.name).join(', ');
  let pokeStats = pokeDetails.stats;

  pushPokeToArr(pokeName, pokeDetails.url, pokeId, pokeImg, pokeType, pokeHeight, pokeWeight, baseExperience, abilities, moves, pokeStats);
}

function handleError(e) {
  let errorMessageRef = document.getElementById('error_message');
  document.getElementById('error_message').classList.remove('d_none');
  errorMessageRef.innerHTML = getErrorMessage(e);
  currentPokemons = [];
  document.getElementById('button_regulation').classList.add('d_none');
}

async function getEvoChains() {
  try {
    let response = await fetch(BASE_URL + EVOLUTION_URL + LIMIT_URL + LIMIT + "&offset=" + OFFSET);
    let responseToJson2 = await response.json();
    for (let index = 0; index < responseToJson2.results.length; index++) {
      const evoUrl = responseToJson2.results[index].url;
      let evoResponse = await fetch(evoUrl);
      let evoDetails = await evoResponse.json();
      let evoChainStarter = evoDetails.chain.species.name;
      let evoTo1 = evoDetails.chain.evolves_to.map(evo1 => evo1.species.name).join(' ');
      let evoTo2 = evoDetails.chain.evolves_to.map(evo2 => evo2.evolves_to.map(evo2details => evo2details.species.name).join(' ')).join(' ');
      pushEvoToArr(evoChainStarter, evoTo1, evoTo2);
    }
  } catch (e) {
    return ``;
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

function pushPokeToArr(pokeName, pokeUrl, pokeId, pokeImg, pokeType, pokeHeight, pokeWeight, baseExperience, abilities, moves, pokeStats) {
  currentPokemons.push({ pokeName, pokeUrl, pokeId, pokeImg, pokeType, pokeHeight, pokeWeight, baseExperience, abilities, moves, pokeStats });
}

function pushEvoToArr(evoChainStarter, evoTo1, evoTo2) {
  evolutionChains.push({ evoChainStarter, evoTo1, evoTo2 });
}

function renderPokemons() {
  let pokemonRef = document.getElementById('pokemon');
  pokemonRef.innerHTML = "";

  currentPokemons.forEach((pokemon, i) => {
    pokemonRef.innerHTML += getPokemonCardsTemplate(pokemon, i);
  });
  document.getElementById('load_more_btn').classList.remove('d_none');
}

function searchPokemon() {
  let searchTerm = getSearchTerm();

  if (searchTerm.length >= 3) {
    toggleLoadMoreButton(true);
    let filteredPokemons = filterPokemonsBySearchTerm(searchTerm);
    renderFilteredPokemons(filteredPokemons);
  } else {
    renderPokemons(currentPokemons);
    toggleLoadMoreButton(false);
  }
}

function getSearchTerm() {
  return window.innerWidth > 820 ? document.getElementById('search_input_desktop').value : document.getElementById('search_input_mobile').value;
}

function filterPokemonsBySearchTerm(searchTerm) {
  let searchTermLow = searchTerm.toLowerCase();
  let filteredPokemons = [];

  currentPokemons.forEach(pokemon => {
    if (pokemon.pokeName.toLowerCase().includes(searchTermLow) &&
      !filteredPokemons.find(existingPokemon => existingPokemon.pokeName === pokemon.pokeName)) {
      filteredPokemons.push(pokemon);
    }
  });
  return filteredPokemons;
}

function renderFilteredPokemons(filteredPokemons) {
  allfilteredPokemons = filteredPokemons;
  currentDisplayedIndex = MAX_RESULTS;

  let filteredPokemonContainer = document.getElementById('pokemon');
  filteredPokemonContainer.innerHTML = '';

  if (filteredPokemons.length === 0) {
    filteredPokemonContainer.innerHTML = getNoFoundTemplate();
  } else {
    displayPokemons(filteredPokemons.slice(0, MAX_RESULTS), filteredPokemonContainer);
    if (filteredPokemons.length > MAX_RESULTS) {
      showMoreResults(filteredPokemonContainer);
    }
  }
}

function displayPokemons(pokemons, container) {
  pokemons.forEach((pokemon, i) => {
    container.innerHTML += getPokemonCardsTemplate(pokemon, i);
  });
}

function showMoreResults(container) {
  const moreResultsRef = getMoreResultsTemplate();
  container.innerHTML += moreResultsRef;
}

function showMoreFilteredPokemons() {
  const nextPokemons = allfilteredPokemons.slice(currentDisplayedIndex, currentDisplayedIndex + MAX_RESULTS);
  displayPokemons(nextPokemons, document.getElementById('pokemon'));
  currentDisplayedIndex += MAX_RESULTS;

  if (currentDisplayedIndex >= allfilteredPokemons.length) {
    const loadMoreResultsButton = document.getElementById('show_more_search_results');
    loadMoreResultsButton.classList.add('d_none');
    document.getElementById('more_results_infotext').classList.add('d_none');
  }
}

function toggleGreyOverlay(i) {
  let greyOverlayRef = document.getElementById('grey_overlay');
  greyOverlayRef.classList.toggle('d_none');
  renderOverlay(i);
}

function renderOverlay(i) {
  let pokemonOverlayRef = document.getElementById('pokemon_overlay');
  pokemonOverlayRef.innerHTML = '';

  // Wenn es gefilterte Pokémon gibt
  if (allfilteredPokemons.length > 0) {
    // Hole das Pokémon aus allfilteredPokemons anhand des Index
    const selectedPokemon = allfilteredPokemons[i];

    let currentPokemonIndex = currentPokemons.findIndex(pokemon => pokemon.pokeId === selectedPokemon.pokeId);
    console.log(currentPokemonIndex);

    // Wenn das Pokémon in currentPokemons gefunden wird
    if (currentPokemonIndex !== -1) {
      i = currentPokemonIndex;
      // Rendern das Overlay mit dem richtigen Pokémon basierend auf currentPokemonIndex
      pokemonOverlayRef.innerHTML = getPokemonOverlay(i);

      // Spezifische UI-Anpassungen
      document.getElementById('previous_poke').classList.add('d_none');
      document.getElementById('next_poke').classList.add('d_none');
      document.getElementById('sequence_attributes').classList.remove('space-between_center');
      document.getElementById('sequence_attributes').classList.add('center_center');
    }
  } else {
    // Falls keine gefilterten Ergebnisse, direkt das Overlay mit dem Index i anzeigen
    pokemonOverlayRef.innerHTML = getPokemonOverlay(i);
  }
}

function addOverlay(event) {
  let overlayRef = document.getElementById('pokemon_overlay');
  overlayRef.classList.remove('d_none');
  event.stopPropagation();
}

function removeOverlay(event) {
  let greyOverlayRef = document.getElementById('grey_overlay');
  greyOverlayRef.classList.add('d_none');
  event.stopPropagation();
}

function switchTab(event, tabName) {
  const tabs = document.querySelectorAll('.tab_button');
  tabs.forEach(tab => tab.classList.remove('active'));

  const panels = document.querySelectorAll('.tab_panel');
  panels.forEach(panel => panel.classList.remove('active'));

  event.currentTarget.classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

function onePokeBack(i) {
  let x = (i - 1);
  if (i > 0) {
    renderOverlay(x);
  } else {
    x = currentPokemons.length - 1;
    renderOverlay(x);
  }
}

function onePokeForward(i) {
  let y = (i + 1);
  if (i < currentPokemons.length - 1) {
    renderOverlay(y);
  } else {
    y = 0;
    renderOverlay(y);
  }
}

function getPokemonImage(pokeName) {
  let pokemon = currentPokemons.find(poke => normalizePokemonName(poke.pokeName) === normalizePokemonName(pokeName));
  return pokemon ? pokemon.pokeImg : ``;
}

function normalizePokemonName(pokeName) {
  if (pokeName) {
    return pokeName.split(' ')[0].toLowerCase();
  }
  return ``;
}

function loadMorePokes() {
  showLoadingSpinner(true);
  OFFSET += LIMIT;
  getPokemons();
  getEvoChains();
}

function toggleLoadMoreButton(show) {
  const loadMoreButton = document.getElementById('load_more_btn');
  show ? loadMoreButton.classList.add('d_none') : loadMoreButton.classList.remove('d_none');
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  let backToTopRef = document.getElementById('back_to_top');
  if (window.scrollY > 20) {
    backToTopRef.classList.remove('d_none');
  } else {
    backToTopRef.classList.add('d_none');
  }
}