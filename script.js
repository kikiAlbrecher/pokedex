const BASE_URL = "https://pokeapi.co/api/v2/";
const POKE_URL = "pokemon";
const EVOLUTION_URL = "evolution-chain";
const LIMIT_URL = "?limit=";
let LIMIT = 20;
let OFFSET = 0;
let currentPokemons = [];
let i = 0;

/**
 * Initializes the application by loading HTML fragments and fetching Pokémon data.
 */
async function init() {
  await includeHTML();
  getPokemons();
}

/**
 * Fetches a list of Pokémon from the API and processes their details.
 * Displays a loading spinner during the fetch operation.
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
 * Fetches Pokémon data from the Pokémon API.
 * 
 * @returns {Promise<Object>} A promise that resolves to an object containing basic Pokémon data.
 */
async function fetchPokemonsData() {
  let response = await fetch(BASE_URL + POKE_URL + LIMIT_URL + LIMIT + "&offset=" + OFFSET);
  let responseAsJson = await response.json();

  return responseAsJson;
}

/**
 * Fetches detailed data for a single Pokémon from the given URL.
 *
 * @param {string} url - The URL pointing to a specific Pokémon's data.
 * @returns {Promise<Object>} A promise that resolves to detailed Pokémon data.
 */
async function fetchPokemonDetails(url) {
  let detailResponse = await fetch(url);
  let pokeDetails = await detailResponse.json();

  return pokeDetails;
}

/**
 * Processes the fetched Pokémon details and formats them into a usable object.
 *
 * @param {Object} pokeDetails - Raw details object for a Pokémon.
 * @returns {Promise<Object>} A promise that resolves to a processed Pokémon object.
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
 * Handles errors that could occur during the data fetching process.
 * 
 * @param {Error} e - The error that occurred.
 */
function handleError(e) {
  let errorMessageRef = document.getElementById('error_message');
  let morePokemonsBtnRef = document.getElementById('button_regulation');

  errorMessageRef.classList.remove('d_none');
  errorMessageRef.innerHTML = getErrorMessage(e);
  currentPokemons = [];
  morePokemonsBtnRef.classList.add('d_none');
}

/**
 * Fetches the evolution chain data for a given Pokémon.
 *
 * @param {Object} pokeDetails - Pokémon details containing a species reference.
 * @returns {Promise<Object|null>} Evolution chain object or null if not available.
 */
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

/**
 * Retrieves an image URL for a given Pokémon name.
 *
 * @param {string} name - The name of the Pokémon.
 * @returns {Promise<string>} A promise that resolves to the Pokémon image URL.
 */
async function getImageFromName(name) {
  let data = await fetch(BASE_URL + POKE_URL + '/' + name).then(res => res.json());

  return data.sprites.other?.dream_world?.front_default ||
    data.sprites.other?.['official-artwork']?.front_default ||
    data.sprites.front_default ||
    '';
}

/**
 * Ensures a safe image URL is returned (returns empty string if falsy).
 *
 * @param {string|null|undefined} url - The image URL to sanitize.
 * @returns {string} A safe image URL string.
 */
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

/**
 * Renders all Pokémon cards to the website by using the given template 'getPokemonCardsTemplate()'.
 */
function renderPokemons() {
  let pokemonRef = document.getElementById('pokemon');
  pokemonRef.innerHTML = '';

  currentPokemons.forEach((pokemon, i) => {
    pokemonRef.innerHTML += getPokemonCardsTemplate(pokemon, i, 'current');
  });
  document.getElementById('load_more_btn').classList.remove('d_none');
}

/**
 * Opens or closes the grey overlay and renders the overlay content.
 *
 * @param {number} i - Index of the Pokémon to display.
 * @param {string} [source='current'] - The source list ('current' or 'filtered').
 */
function toggleGreyOverlay(i, source = 'current') {
  const greyOverlayRef = document.getElementById('grey_overlay');
  const pokemon = source === 'filtered' ? allFilteredPokemons[i] : currentPokemons[i];

  if (!pokemon) return;

  greyOverlayRef.classList.toggle('d_none');
  renderOverlay(i, source);
  handleScrollbar();
}

/**
 * Toggles the body's scrollbar when the overlay is shown or hidden.
 */
function handleScrollbar() {
  const greyOverlayRef = document.getElementById('grey_overlay');

  greyOverlayRef.classList.contains('d_none') ?
    document.body.classList.remove('overlay_active') : document.body.classList.add('overlay_active');
}

/**
 * Adds the Pokémon overlay to the DOM.
 * 
 * @param {Event} event - The event triggered by the overlay button click.
 */
function addOverlay(event) {
  const overlayRef = document.getElementById('pokemon_overlay');

  overlayRef.classList.remove('d_none');
  event.stopPropagation();
}

/**
 * Removes the grey overlay from the DOM.
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

/**
 * Renders the previous Pokémon in the overlay.
 *
 * @param {number} i - Current index.
 * @param {string} [source='current'] - Data source to use ('current' or 'filtered').
 */
function onePokeBack(i, source = 'current') {
  let list = source === 'filtered' ? allFilteredPokemons : currentPokemons;
  let newIndex = i > 0 ? i - 1 : list.length - 1;

  renderOverlay(newIndex, source);
}

/**
 * Renders the next Pokémon in the overlay.
 *
 * @param {number} i - Current index.
 * @param {string} [source='current'] - Data source to use ('current' or 'filtered').
 */
function onePokeForward(i, source = 'current') {
  let list = source === 'filtered' ? allFilteredPokemons : currentPokemons;
  let newIndex = i < list.length - 1 ? i + 1 : 0;

  renderOverlay(newIndex, source);
}

/**
 * Loads more Pokémon data by incrementing the offset and fetching new data.
 * They are appended to the current list.
 */
function loadMorePokes() {
  showLoadingSpinner(true);
  OFFSET += LIMIT;
  getPokemons();
}

/**
 * Toggles the visibility of the 'Load More' button.
 * 
 * @param {boolean} show - Whether to show or hide the button.
 */
function toggleLoadMoreButton(show) {
  const loadMoreButton = document.getElementById('load_more_btn');

  show ? loadMoreButton.classList.add('d_none') : loadMoreButton.classList.remove('d_none');
}