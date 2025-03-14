const BASE_URL = "https://pokeapi.co/api/v2/";
const POKE_URL = "pokemon";
const EVOLUTION_URL = "evolution-chain";
const LIMIT_URL = "?limit=";
let LIMIT = 20;
let OFFSET = 0;
let currentPokemons = [];
let evolutionChains = [];
let filteredPokemons = [];
let allFilteredPokemons = [];
let i = 0;
const filterRestriction = 10;
let displayedFilteredPokemonIndex = filterRestriction;

/**
 * Initializes the application by fetching Pokémon data and evolution chains.
 */
function init() {
  getPokemons();
  getEvoChains();
}

/**
 * Fetches the Pokémon data and processes each Pokémon.
 * Displays a loading spinner while fetching and processes the Pokémon details.
 */
async function getPokemons() {
  showLoadingSpinner(true);
  try {
    const responseAsJson = await fetchPokemonsData();
    for (let index = 0; index < responseAsJson.results.length; index++) {
      const pokeDetails = await fetchPokemonDetails(responseAsJson.results[index].url);
      processPokemonDetails(pokeDetails);
    }
    renderPokemons();
  } catch (e) {
    handleError(e);
  } finally {
    showLoadingSpinner(false);
  }
}

/**
 * Fetches Pokémon data from the API.
 * 
 * @returns {Promise<Object>} A promise that resolves to the Pokémon data in JSON format.
 */
async function fetchPokemonsData() {
  let response = await fetch(BASE_URL + POKE_URL + LIMIT_URL + LIMIT + "&offset=" + OFFSET);
  let responseAsJson = await response.json();
  return responseAsJson;
}

/**
 * Fetches details of a specific Pokémon from the API.
 * 
 * @param {string} url - The URL of the Pokémon's details.
 * @returns {Promise<Object>} A promise that resolves to the Pokémon details in JSON format.
 */
async function fetchPokemonDetails(url) {
  let detailResponse = await fetch(url);
  let pokeDetails = await detailResponse.json();
  return pokeDetails;
}

/**
 * Processes the details of a Pokémon and stores the data in the currentPokemons array.
 * 
 * @param {Object} pokeDetails - The details of the Pokémon to process.
 */
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

  pushPokeToArr(pokeName, pokeId, pokeImg, pokeType, pokeHeight, pokeWeight, baseExperience, abilities, moves, pokeStats);
}

/**
 * Handles errors that occur during the data fetching process.
 * 
 * @param {Error} e - The error that occurred.
 */
function handleError(e) {
  let errorMessageRef = document.getElementById('error_message');

  document.getElementById('error_message').classList.remove('d_none');
  errorMessageRef.innerHTML = getErrorMessage(e);
  currentPokemons = [];
  document.getElementById('button_regulation').classList.add('d_none');
}

/**
 * Fetches evolution chains data from the API and processes the details.
 */
async function getEvoChains() {
  try {
    let response = await fetch(BASE_URL + EVOLUTION_URL + LIMIT_URL + LIMIT + "&offset=" + OFFSET);
    let responseAsJson2 = await response.json();
    for (let index = 0; index < responseAsJson2.results.length; index++) {
      const evoUrl = responseAsJson2.results[index].url;
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

/**
 * Toggles the loading spinner visibility.
 * 
 * @param {boolean} show - Whether to show the loading spinner.
 */
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

/**
 * Pushes a Pokémon's data to the currentPokemons array.
 * 
 * @param {string} pokeName - The name of the Pokémon.
 * @param {number} pokeId - The ID of the Pokémon.
 * @param {string} pokeImg - The image URL of the Pokémon.
 * @param {string} pokeType - The types of the Pokémon.
 * @param {number} pokeHeight - The height of the Pokémon.
 * @param {number} pokeWeight - The weight of the Pokémon.
 * @param {number} baseExperience - The base experience of the Pokémon.
 * @param {string} abilities - The abilities of the Pokémon.
 * @param {string} moves - The first 3 moves of the Pokémon.
 * @param {Array} pokeStats - The stats of the Pokémon.
 */
function pushPokeToArr(pokeName, pokeId, pokeImg, pokeType, pokeHeight, pokeWeight, baseExperience, abilities, moves, pokeStats) {
  currentPokemons.push({ pokeName, pokeId, pokeImg, pokeType, pokeHeight, pokeWeight, baseExperience, abilities, moves, pokeStats });
}

/**
 * Pushes evolution chain details to the evolutionChains array.
 * 
 * @param {string} evoChainStarter - The starting Pokémon of the evolution chain.
 * @param {string} evoTo1 - The first evolution in the chain.
 * @param {string} evoTo2 - The second evolution in the chain.
 */
function pushEvoToArr(evoChainStarter, evoTo1, evoTo2) {
  evolutionChains.push({ evoChainStarter, evoTo1, evoTo2 });
}

/**
 * Renders the list of Pokémon to the webpage.
 */
function renderPokemons() {
  let pokemonRef = document.getElementById('pokemon');
  pokemonRef.innerHTML = "";

  currentPokemons.forEach((pokemon, i) => {
    pokemonRef.innerHTML += getPokemonCardsTemplate(pokemon, i);
  });
  document.getElementById('load_more_btn').classList.remove('d_none');
}

/**
 * Toggles the visibility of a grey overlay when a Pokémon card is clicked.
 * 
 * @param {number} i - The index of the selected Pokémon.
 */
function toggleGreyOverlay(i) {
  let greyOverlayRef = document.getElementById('grey_overlay');
  greyOverlayRef.classList.toggle('d_none');
  renderOverlay(i);
  handleScrollbar();
}

/**
 * Retrieves the currently selected Pokémon based on the index.
 * 
 * @param {number} i - The index of the selected Pokémon.
 * @returns {number} The index of the selected Pokémon in the list.
 */
function getSelectedPokemon(i) {
  let selectedPokemon = null;

  if (allFilteredPokemons.length !== 0) {
    selectedPokemon = allFilteredPokemons[i];
    let currentPokemonIndex = currentPokemons.findIndex(pokemon => pokemon.pokeId === selectedPokemon.pokeId);

    if (currentPokemonIndex !== -1) {
      i = currentPokemonIndex;
    }
  }
  return i;
}

/**
 * Updates the Pokémon overlay with the selected Pokémon's details.
 * 
 * @param {number} i - The index of the selected Pokémon.
 */
function updatePokemonOverlay(i) {
  let pokemonOverlayRef = document.getElementById('pokemon_overlay');
  pokemonOverlayRef.innerHTML = '';

  pokemonOverlayRef.innerHTML = getPokemonOverlay(i);

  if (allFilteredPokemons.length !== 0) {
    changeOverlayLayout();
  }
}

/**
 * Renders the overlay for a selected Pokémon.
 * 
 * @param {number} i - The index of the selected Pokémon.
 */
function renderOverlay(i) {
  i = getSelectedPokemon(i);
  updatePokemonOverlay(i);
}

/**
 * Changes the layout of the overlay by adjusting certain UI elements.
 */
function changeOverlayLayout() {
  document.getElementById('previous_poke').classList.add('d_none');
  document.getElementById('next_poke').classList.add('d_none');
  document.getElementById('sequence_attributes').classList.remove('space-between_center');
  document.getElementById('sequence_attributes').classList.add('center_center');
}

/**
 * Adds the Pokémon overlay to the screen.
 * 
 * @param {Event} event - The event triggered by the overlay button click.
 */
function addOverlay(event) {
  let overlayRef = document.getElementById('pokemon_overlay');
  overlayRef.classList.remove('d_none');
  event.stopPropagation();
}

/**
 * Removes the grey overlay from the screen.
 * 
 * @param {Event} event - The event triggered by clicking outside the overlay.
 */
function removeGreyOverlay(event) {
  let greyOverlayRef = document.getElementById('grey_overlay');
  greyOverlayRef.classList.add('d_none');
  event.stopPropagation();
  handleScrollbar();
}

/**
 * Handles the visibility of the scrollbar when the grey overlay is active.
 */
function handleScrollbar() {
  let greyOverlayRef = document.getElementById('grey_overlay');
  greyOverlayRef.classList.contains('d_none') ?
    document.body.classList.remove('overlay_active') : document.body.classList.add('overlay_active');
}

/**
 * Switches between different tabs on the page.
 * 
 * @param {Event} event - The event triggered by clicking a tab button.
 * @param {string} tabName - The name of the tab to display.
 */
function switchTab(event, tabName) {
  const tabs = document.querySelectorAll('.tab_button');
  tabs.forEach(tab => tab.classList.remove('active'));

  const panels = document.querySelectorAll('.tab_panel');
  panels.forEach(panel => panel.classList.remove('active'));

  event.currentTarget.classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

/**
 * Navigates to the previous Pokémon in the overlay.
 * 
 * @param {number} i - The index of the current Pokémon.
 */
function onePokeBack(i) {
  let x = (i - 1);
  if (i > 0) {
    renderOverlay(x);
  } else {
    x = currentPokemons.length - 1;
    renderOverlay(x);
  }
}

/**
 * Navigates to the next Pokémon in the overlay.
 * 
 * @param {number} i - The index of the current Pokémon.
 */
function onePokeForward(i) {
  let y = (i + 1);
  if (i < currentPokemons.length - 1) {
    renderOverlay(y);
  } else {
    y = 0;
    renderOverlay(y);
  }
}

/**
 * Retrieves the image URL of a Pokémon by name.
 * 
 * @param {string} pokeName - The name of the Pokémon.
 * @returns {string} The image URL of the Pokémon.
 */
function getPokemonImage(pokeName) {
  let pokemon = currentPokemons.find(poke => normalizePokemonName(poke.pokeName) === normalizePokemonName(pokeName));
  return pokemon ? pokemon.pokeImg : ``;
}

/**
 * Normalizes the Pokémon name by converting it to lowercase and removing extra spaces.
 * 
 * @param {string} pokeName - The name of the Pokémon.
 * @returns {string} The normalized Pokémon name.
 */
function normalizePokemonName(pokeName) {
  if (pokeName) {
    return pokeName.split(' ')[0].toLowerCase();
  }
  return ``;
}

/**
 * Loads more Pokémon data by incrementing the offset and fetching new data.
 */
function loadMorePokes() {
  showLoadingSpinner(true);
  OFFSET += LIMIT;
  getPokemons();
  getEvoChains();
}

/**
 * Toggles the visibility of the "Load More" button.
 * 
 * @param {boolean} show - Whether to show or hide the button.
 */
function toggleLoadMoreButton(show) {
  const loadMoreButton = document.getElementById('load_more_btn');
  show ? loadMoreButton.classList.add('d_none') : loadMoreButton.classList.remove('d_none');
}