let allPokemons = [];
let filteredPokemons = [];
let allFilteredPokemons = [];
const filterRestriction = 10;
let displayedFilteredPokemonIndex = filterRestriction;

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

async function tryFilteredDetails(searchTerm) {
    const filteredDetails = await filterPokemonsBySearchTerm(searchTerm);

    (!filteredDetails || filteredDetails.length === 0) ? renderFilteredPokemons([]) : renderFilteredPokemons(filteredDetails);
}

function getSearchTerm() {
    return window.innerWidth > 820 ? document.getElementById('search_input_desktop').value : document.getElementById('search_input_mobile').value;
}

async function filterPokemonsBySearchTerm(searchTerm) {
    let searchTermLow = searchTerm.toLowerCase();
    filteredPokemons = allPokemons.filter(pokemon => pokemon.name.toLowerCase().includes(searchTermLow));
    return await getFilteredPokemonsDetails(filteredPokemons);
}

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

async function spinnerAdd() {
    spinnerRef = document.getElementById('loading_spinner');

    showLoadingSpinner(true);
    spinnerRef.classList.add('spinner_overlay');
    await new Promise(resolve => setTimeout(resolve, 50));
}

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

function searchTermTooShort() {
    const morePokemonsBtnRef = document.getElementById('button_regulation');

    filteredPokemons = [];
    allFilteredPokemons = [];
    displayedFilteredPokemonIndex = filterRestriction;

    renderPokemons();
    morePokemonsBtnRef.classList.remove('d_none');
}

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

function noMoreSearchResults() {
    const moreResultsBtn = document.getElementById('show_more_search_results');
    const moreResultsText = document.getElementById('more_results_infotext');

    if (moreResultsBtn) moreResultsBtn.classList.add('d_none');
    if (moreResultsText) moreResultsText.classList.add('d_none');
}

/**
 * Renders the overlay for a selected Pokémon.
 * 
 * @param {number} i - The index of the selected Pokémon.
 */
function renderOverlay(i, source = 'current') {
    updatePokemonOverlay(i, source);
}

/**
 * Updates the Pokémon overlay with the selected Pokémon's details.
 * 
 * @param {number} i - The index of the selected Pokémon.
 */
function updatePokemonOverlay(i, source = 'current') {
    const overlay = document.getElementById('pokemon_overlay');

    overlay.innerHTML = getPokemonOverlay(i, source);
}