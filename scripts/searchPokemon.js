let allPokemons = [];
let filteredPokemons = [];
let allFilteredPokemons = [];
const filterRestriction = 10;
let displayedFilteredPokemonIndex = filterRestriction;

/**
 * Fetches the complete list of all Pokémon from the API.
 * Data is paginated, and all pages are requested in sequence.
 */
async function fetchAllPokemonsData() {
    const totalPokemons = 1302;
    const LIMIT_ALL = 100;
    const numberOfRequests = Math.ceil(totalPokemons / LIMIT_ALL);

    for (let i = 0; i < numberOfRequests; i++) {
        const OFFSET_ALL = i * LIMIT_ALL;
        let response = await fetch(BASE_URL + POKE_URL + LIMIT_URL + LIMIT_ALL + '&offset=' + OFFSET_ALL);
        let data = await response.json();
        allPokemons = allPokemons.concat(data.results);
    }
}

/**
 * Triggers a Pokémon search based on user input.
 * Initiates data fetch and filtering when the input length is 3 characters or more.
 */
async function searchPokemon() {
    let searchTerm = getSearchTerm();
    const morePokemonsBtnRef = document.getElementById('button_regulation');

    if (searchTerm.length >= 3) {
        if (allPokemons.length === 0) await fetchAllPokemonsData();
        morePokemonsBtnRef.classList.add('d_none');

        try {
            await tryFilteredDetails(searchTerm);
        } catch (e) {
            handleError(e);
            renderFilteredPokemons([]);
        }
    } else searchTermTooShort();
}

/**
 * Attempts to fetch and render Pokémon that match the search term.
 *
 * @param {string} searchTerm - The search input entered by the user.
 */
async function tryFilteredDetails(searchTerm) {
    const filteredDetails = await filterPokemonsBySearchTerm(searchTerm);

    (!filteredDetails || filteredDetails.length === 0) ? renderFilteredPokemons([]) : renderFilteredPokemons(filteredDetails);
}

/**
 * Gets the search input value based on screen width (mobile or desktop).
 *
 * @returns {string} The user-entered search term.
 */
function getSearchTerm() {
    return window.innerWidth > 820 ? document.getElementById('search_input_desktop').value : document.getElementById('search_input_mobile').value;
}

/**
 * Filters the full Pokémon list for names matching the search term (case-insensitive).
 *
 * @param {string} searchTerm - The term to search for in Pokémon names.
 * @returns {Promise<Array>} A list of processed matching Pokémon.
 */
async function filterPokemonsBySearchTerm(searchTerm) {
    let searchTermLow = searchTerm.toLowerCase();

    filteredPokemons = allPokemons.filter(pokemon => pokemon.name.toLowerCase().includes(searchTermLow));
    return await getFilteredPokemonsDetails(filteredPokemons);
}

/**
 * Fetches and processes the details for each filtered Pokémon.
 *
 * @param {Array} filteredPokemons - A list of Pokémon objects filtered by name.
 * @returns {Promise<Array>} A promise that resolves to a list of detailed Pokémon objects.
 */
async function getFilteredPokemonsDetails(filteredPokemons) {
    let filteredDetails = [];
    await spinnerAdd();

    try {
        for (let i = 0; i < filteredPokemons.length; i++) {
            const pokeDetails = await fetchPokemonDetails(filteredPokemons[i].url);
            let processed = await processPokemonDetails(pokeDetails);
            filteredDetails.push(processed);
        }
        return filteredDetails;
    } catch (e) {
        handleError(e);
        return [];
    } finally {
        showLoadingSpinner(false);
    }
}

/**
 * Adds a spinner overlay and delays briefly to improve perceived loading UX.
 */
async function spinnerAdd() {
    spinnerRef = document.getElementById('loading_spinner');

    showLoadingSpinner(true);
    spinnerRef.classList.add('spinner_overlay');
    await new Promise(resolve => setTimeout(resolve, 50));
}

/**
 * Renders the list of filtered Pokémon to the DOM.
 * Displays a fallback message if no Pokémon are found.
 *
 * @param {Array} filteredDetails - An array of processed filtered Pokémon.
 */
function renderFilteredPokemons(filteredDetails) {
    let filteredPokemonsRef = document.getElementById('pokemon');
    filteredPokemonsRef.innerHTML = '';
    allFilteredPokemons = filteredDetails;

    if (filteredDetails.length === 0) filteredPokemonsRef.innerHTML = getNoFoundTemplate();
    else if (filteredDetails.length <= filterRestriction) {
        filteredDetails.forEach((pokemon, i) => {
            filteredPokemonsRef.innerHTML += getPokemonCardsTemplate(pokemon, i, 'filtered');
        });
    }
    else {
        filteredDetails.slice(0, filterRestriction).forEach((pokemon, i) => {
            filteredPokemonsRef.innerHTML += getPokemonCardsTemplate(pokemon, i, 'filtered');
        });
        filteredPokemonsRef.innerHTML += getMoreResultsTemplate();
    }
}

/**
 * Handles the scenario when the search term is too short to evoke the searching process.
 * Resets state and re-renders default Pokémons.
 */
function searchTermTooShort() {
    const morePokemonsBtnRef = document.getElementById('button_regulation');

    filteredPokemons = [];
    allFilteredPokemons = [];
    displayedFilteredPokemonIndex = filterRestriction;

    renderPokemons();
    morePokemonsBtnRef.classList.remove('d_none');
}

/**
 * Shows additional filtered Pokémon results when the user requests more.
 * Appends new Pokémon cards to the end of the current list and handles end-of-results logic.
 */
function showMoreFilteredPokemons() {
    const nextChargeOfFilteredPokemons = allFilteredPokemons.slice(displayedFilteredPokemonIndex, displayedFilteredPokemonIndex + filterRestriction);
    const filteredPokemonsRef = document.getElementById('pokemon');

    nextChargeOfFilteredPokemons.forEach((pokemon, i) => {
        filteredPokemonsRef.innerHTML += getPokemonCardsTemplate(pokemon, i + displayedFilteredPokemonIndex, 'filtered');
    });

    filteredPokemonsRef.appendChild(document.getElementById('more_search_results'));

    displayedFilteredPokemonIndex += filterRestriction;

    if (displayedFilteredPokemonIndex >= allFilteredPokemons.length) noMoreSearchResults();
}

/**
 * Hides the 'show more results' button and its text when no further search results are available.
 */
function noMoreSearchResults() {
    const moreResultsBtn = document.getElementById('show_more_search_results');
    const moreResultsText = document.getElementById('more_results_infotext');

    if (moreResultsBtn) moreResultsBtn.classList.add('d_none');
    if (moreResultsText) moreResultsText.classList.add('d_none');
}

/**
 * Renders the overlay for a selected Pokémon.
 *
 * @param {number} i - The index of the Pokémon to display.
 * @param {string} [source='current'] - The source list of the Pokémon ('current' or 'filtered').
 */
function renderOverlay(i, source = 'current') {
    updatePokemonOverlay(i, source);
}

/**
 * Updates the Pokémon overlay with detailed information about the selected Pokémon.
 *
 * @param {number} i - The index of the Pokémon in the source array.
 * @param {string} [source='current'] - The data source to use ('current' or 'filtered').
 */
function updatePokemonOverlay(i, source = 'current') {
    const overlay = document.getElementById('pokemon_overlay');

    overlay.innerHTML = getPokemonOverlay(i, source);
}