const BASE_URL = "https://pokeapi.co/api/v2/";
const POKE_URL = "pokemon";
const EVOLUTION_URL = "evolution-chain";
const LIMIT_URL = "?limit=";
let LIMIT = 20;
let OFFSET = 0;
let currentPokemons = [];
let i = 0;

/**
 * Initializes the application by fetching Pokémon data and evolution chains.
 */
async function init() {
  await includeHTML();
  getPokemons();
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
      let pokeDetails = await fetchPokemonDetails(responseAsJson.results[index].url);
      let processedPoke = await processPokemonDetails(pokeDetails);
      currentPokemons.push(processedPoke);
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
async function processPokemonDetails(pokeDetails) {
  let pokeName = pokeDetails.name;
  let pokeId = pokeDetails.id;
  let pokeImg = pokeDetails.sprites.other.dream_world.front_default || pokeDetails.sprites.front_default || '';
  let pokeType = pokeDetails.types.map(typeInfo => typeInfo.type.name).join(' ');
  let pokeHeight = pokeDetails.height;
  let pokeWeight = pokeDetails.weight;
  let baseExperience = pokeDetails.base_experience;
  let abilities = pokeDetails.abilities.map(ableTo => ableTo.ability.name).join(', ');
  let moves = pokeDetails.moves.slice(0, 3).map(firstMoves => firstMoves.move.name).join(', ');
  let pokeStats = pokeDetails.stats;
  let evolution = await getEvoChains(pokeDetails);

  return {
    pokeName, pokeId, pokeImg, pokeType, pokeHeight, pokeWeight, baseExperience, abilities, moves, pokeStats, evolution
  };
}

/**
 * Handles errors that occur during the data fetching process.
 * 
 * @param {Error} e - The error that occurred.
 */
function handleError(e) {
  let errorMessageRef = document.getElementById('error_message');
  let morePokemonsBtnRef = document.getElementById('button_regulation');

  document.getElementById('error_message').classList.remove('d_none');
  errorMessageRef.innerHTML = getErrorMessage(e);
  currentPokemons = [];
  morePokemonsBtnRef.classList.add('d_none');
}

async function getEvoChains(pokeDetails) {
  try {
    let speciesData = await fetch(pokeDetails.species.url).then(res => res.json());
    if (!speciesData.evolution_chain?.url) return null;

    let evoDetails = await fetch(speciesData.evolution_chain.url).then(res => res.json());
    let evoChainStarter = evoDetails.chain.species.name;
    let evoChainStarterImg = await getImageFromName(evoChainStarter);
    let evoTo1 = evoDetails.chain.evolves_to[0]?.species?.name;
    let evoTo1Img = evoTo1 ? await getImageFromName(evoTo1) : null;
    let evoTo2 = evoDetails.chain.evolves_to[0]?.evolves_to[0]?.species?.name;
    let evoTo2Img = evoTo2 ? await getImageFromName(evoTo2) : null;

    return { evoChainStarter, evoChainStarterImg, evoTo1, evoTo1Img, evoTo2, evoTo2Img };
  } catch (e) {
    return null;
  }
}

async function getImageFromName(name) {
  let data = await fetch(BASE_URL + POKE_URL + '/' + name).then(res => res.json());

  return data.sprites.other?.dream_world?.front_default ||
    data.sprites.other?.['official-artwork']?.front_default ||
    data.sprites.front_default ||
    '';
}

function sanitizeImageUrl(url) {
  return url || '';
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

function renderPokemons() {
  let pokemonRef = document.getElementById('pokemon');
  pokemonRef.innerHTML = '';

  currentPokemons.forEach((pokemon, i) => {
    pokemonRef.innerHTML += getPokemonCardsTemplate(pokemon, i, 'current');
  });
  document.getElementById('load_more_btn').classList.remove('d_none');
}

function toggleGreyOverlay(i, source = 'current') {
  let greyOverlayRef = document.getElementById('grey_overlay');
  const pokemon = source === 'filtered' ? allFilteredPokemons[i] : currentPokemons[i];

  if (!pokemon) return;

  greyOverlayRef.classList.toggle('d_none');
  renderOverlay(i, source);
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
 * Adds the Pokémon overlay to the screen.
 * 
 * @param {Event} event - The event triggered by the overlay button click.
 */
function addOverlay(event) {
  const overlayRef = document.getElementById('pokemon_overlay');

  overlayRef.classList.remove('d_none');
  event.stopPropagation();
}

/**
 * Removes the grey overlay from the screen.
 * 
 * @param {Event} event - The event triggered by clicking outside the overlay.
 */
function removeGreyOverlay(event) {
  const greyOverlayRef = document.getElementById('grey_overlay');

  greyOverlayRef.classList.add('d_none');
  event.stopPropagation();
  handleScrollbar();
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

function onePokeBack(i, source = 'current') {
  let list = source === 'filtered' ? allFilteredPokemons : currentPokemons;
  let newIndex = i > 0 ? i - 1 : list.length - 1;

  renderOverlay(newIndex, source);
}

function onePokeForward(i, source = 'current') {
  let list = source === 'filtered' ? allFilteredPokemons : currentPokemons;
  let newIndex = i < list.length - 1 ? i + 1 : 0;

  renderOverlay(newIndex, source);
}

/**
 * Loads more Pokémon data by incrementing the offset and fetching new data.
 */
function loadMorePokes() {
  showLoadingSpinner(true);
  OFFSET += LIMIT;
  getPokemons();
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