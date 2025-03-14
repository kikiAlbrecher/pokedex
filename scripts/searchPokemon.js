/**
 * Searches for Pokémon based on the input term and filters the list accordingly.
 */
function searchPokemon() {
    let searchTerm = getSearchTerm();

    if (searchTerm.length >= 3) {
        toggleLoadMoreButton(true);
        let filteredPokemons = filterPokemonsBySearchTerm(searchTerm);
        renderFilteredPokemons(filteredPokemons);
    } else {
        allFilteredPokemons = [];
        displayedFilteredPokemonIndex = filterRestriction;
        renderPokemons();
        toggleLoadMoreButton(false);
    }
}

/**
 * Retrieves the current search term from the search input field.
 * 
 * @returns {string} The current search term.
 */
function getSearchTerm() {
    return window.innerWidth > 820 ? document.getElementById('search_input_desktop').value : document.getElementById('search_input_mobile').value;
}

/**
 * Filters the current list of Pokémon based on the search term.
 * 
 * @param {string} searchTerm - The term to filter Pokémon by.
 * @returns {Array} A list of Pokémon that match the search term.
 */
function filterPokemonsBySearchTerm(searchTerm) {
    let searchTermLow = searchTerm.toLowerCase();
    filteredPokemons = [];

    currentPokemons.forEach(pokemon => {
        if (pokemon.pokeName.toLowerCase().includes(searchTermLow) &&
            !filteredPokemons.find(existingPokemon => existingPokemon.pokeName === pokemon.pokeName)) {
            filteredPokemons.push(pokemon);
        }
    });
    return filteredPokemons;
}

/**
 * Renders a list of filtered Pokémon to the webpage.
 * 
 * @param {Array} filteredPokemons - The list of filtered Pokémon to display.
 */
function renderFilteredPokemons(filteredPokemons) {
    let filteredPokemonsRef = document.getElementById('pokemon');
    filteredPokemonsRef.innerHTML = '';
    allFilteredPokemons = filteredPokemons;

    if (filteredPokemons.length === 0) {
        filteredPokemonsRef.innerHTML = getNoFoundTemplate();
    } else if (filteredPokemons.length <= filterRestriction) {
        filteredPokemons.forEach((pokemon, i) => {
            filteredPokemonsRef.innerHTML += getPokemonCardsTemplate(pokemon, i);
        });
    } else {
        filteredPokemons.slice(0, filterRestriction).forEach((pokemon, i) => {
            filteredPokemonsRef.innerHTML += getPokemonCardsTemplate(pokemon, i);
            filteredPokemonsRef.innerHTML += getMoreResultsTemplate();
        });
    }
}

/**
 * Displays more Pokémon from the filtered list when the "Load More" button is clicked.
 */
function showMoreFilteredPokemons() {
    const nextChargeOfFilteredPokemons = allFilteredPokemons.slice(displayedFilteredPokemonIndex, displayedFilteredPokemonIndex + filterRestriction);
    let filteredPokemonsRef = document.getElementById('pokemon');

    nextChargeOfFilteredPokemons.forEach((pokemon, i) => {
        filteredPokemonsRef.innerHTML += getPokemonCardsTemplate(pokemon, i + displayedFilteredPokemonIndex);
    });

    displayedFilteredPokemonIndex += filterRestriction;

    if (displayedFilteredPokemonIndex >= allFilteredPokemons.length) {
        document.getElementById('show_more_search_results').classList.add('d_none');
        document.getElementById('more_results_infotext').classList.add('d_none');
    }
}