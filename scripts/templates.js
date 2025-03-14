/**
 * Returns an error message template.
 * This template can be displayed when there is an issue with loading the page.
 * 
 * @returns {string} A string of HTML representing the error message.
 */
function getErrorMessage() {
    return `
        <h4>A problem occured. Please reload the website.</h4>
    `;
}

/**
 * Generates a Pokémon card template with information about the Pokémon.
 * The template includes the Pokémon's ID, name, image, and types.
 * 
 * @param {Object} pokemon - The Pokémon data object.
 * @param {number} i - The index of the Pokémon.
 * @returns {string} The HTML template string for the Pokémon card.
 */
function getPokemonCardsTemplate(pokemon, i) {
    let typeCollection = (pokemon.pokeType || '').split(' ');
    let typeImages = typeCollection.map(type => {
        return `
            <img class="pokemon_type ${type}" src="assets/icons/${type}.svg" alt="${type}">
        `;
    }).join('');

    return `
        <div class="pokemon_card display_flex_column" onclick="toggleGreyOverlay(${i})">
            <div class="poke_id_name display_flex_row space-between_center">
                <h4>#${pokemon.pokeId}</h4>
                <h4>${pokemon.pokeName}</h4>
            </div>
            <div class="pokemon_img_area ${typeCollection[0]} display_flex_row center_center">
                <img class="pokemon_img" src="${pokemon.pokeImg}" alt="${pokemon.pokeName}">
            </div>
            <div class="pokemon_attributes display_flex_row center_center">
                ${typeImages}
            </div>
        </div>
    `;
}

/**
 * Returns the template for showing more results in a Pokémon search.
 * 
 * @returns {string} The HTML template string for the "show more results" section.
 */
function getMoreResultsTemplate() {
    return `
        <div class="more_search_results display_flex_column center_center" id="more_search_results">
            <p class="more_results_info" id="more_results_infotext">
                Only ${filterRestriction} pokémons are shown. Further results are available.
            </p>
            <button class="btn" id="show_more_search_results" onclick="showMoreFilteredPokemons()">
                show more results
            </button>
        </div>
    `;
}

/**
 * Returns a template for when no Pokémon are found in the search.
 * 
 * @returns {string} The HTML template string for the "no Pokémon found" message.
 */
function getNoFoundTemplate() {
    return `
        <div>No Pokémon found.</div>
    `;
}

/**
 * Generates the overlay template for a specific Pokémon.
 * This template includes the Pokémon's stats, abilities, moves, and evolutionary chain (if available).
 * 
 * @param {number} i - The index of the Pokémon in the currentPokemons array.
 * @returns {string} The HTML template string for the Pokémon overlay.
 */
function getPokemonOverlay(i) {
    let typeCollection = currentPokemons[i].pokeType.split(' ');
    let typeImages = typeCollection.map(type => {
        return `
            <img class="pokemon_type ${type}" src="assets/icons/${type}.svg" alt="${type}">
        `;
    }).join('');
    let move = currentPokemons[i].moves.split(' ');
    let evolution = evolutionChains.find(chain =>
        normalizePokemonName(chain.evoChainStarter) === normalizePokemonName(currentPokemons[i].pokeName) ||
        normalizePokemonName(chain.evoTo1) === normalizePokemonName(currentPokemons[i].pokeName) ||
        normalizePokemonName(chain.evoTo2) === normalizePokemonName(currentPokemons[i].pokeName)
    );

    return `
        <div class="overlay_content display_flex_column">
            <div class="overlay_headline display_flex_row space-between_center">
                <h2>#${currentPokemons[i].pokeId}</h2>
                <h2>${currentPokemons[i].pokeName}</h2>
                <button class="btn_small" onclick="removeGreyOverlay(event)">
                    <img src="assets/icons/close.png" title="close" alt="close">
                </button>
            </div>
            <img class="pokemon_img_in_overlay ${typeCollection[0]}" src="${currentPokemons[i].pokeImg}" alt="${currentPokemons[i].pokeName}">
            <div class="type_with_change_btn display_flex_row space-between_center" id="sequence_attributes">
                <button class="btn_small" id="previous_poke" onclick="onePokeBack(${[i]})">
                    <img src="assets/icons/backward.png" title="previous" alt="back">
                </button>
                <div class="pokemon_attributes display_flex_row center_center">
                    ${typeImages}
                </div>
                <button class="btn_small" id="next_poke" onclick="onePokeForward(${[i]})">
                    <img src="assets/icons/forward.png" title="next" alt="forward">
                </button>
            </div>

            <div class="tabs_container">
                <div class="tabs_header display_flex_row space-around_center">
                    <button class="tab_button active" onclick="switchTab(event, 'main')"><h3>main</h3></button>
                    <button class="tab_button" onclick="switchTab(event, 'stats')"><h3>stats</h3></button>
                    <button class="tab_button" onclick="switchTab(event, 'evo')"><h3>evo chain</h3></button>
                </div>
        
                <div class="tab_content">
                    <div id="main" class="tab_panel active">
                        <h3 class="h3_variant">Main Info</h3>
                        <div class="display_flex_column">
                            <div class="main_infos display_flex_row">
                                <h5 class="headline_width">Height: </h5><h5>${currentPokemons[i].pokeHeight} m</h5>
                            </div>
                            <div class="main_infos display_flex_row">
                                <h5 class="headline_width">Weight: </h5><h5>${currentPokemons[i].pokeWeight} kg</h5>
                            </div>
                            <div class="main_infos display_flex_row">
                                <h5 class="headline_width">Base Experience: </h5><h5>${currentPokemons[i].baseExperience}</h5>
                            </div>
                            <div class="main_infos display_flex_row">
                                <h5 class="headline_width">Abilities: </h5><h5>${currentPokemons[i].abilities}</h5>
                            </div>
                            <div class="main_infos display_flex_row">
                                <h5 class="headline_width">3 Moves: </h5>
                                <ul class="moves_list">
                                    <li><h5>${move[0]}</h5></li>
                                    <li><h5>${move[1]}</h5></li>
                                    <li><h5>${move[2]}</h5></li> 
                                </ul>
                            </div>
                        </div>
                    </div>    
                    <div id="stats" class="tab_panel">
                        <h3 class="h3_variant">Stats</h3>
                        <div class="stats_values display_flex_row">
                            <h5 class="headline_width">HP: ${currentPokemons[i].pokeStats[0].base_stat}</h5>
                            <div class="stats_representation display_flex_row center_center">
                                <span>0</span>
                                <div class="progress_bar_container">
                                    <div class="progress_bar" style="width: ${(currentPokemons[i].pokeStats[0].base_stat / 250) * 100}%;"></div>
                                </div>
                                <span>250</span>
                            </div>
                        </div>
                        <div class="stats_values display_flex_row">
                            <h5 class="headline_width">Attack: ${currentPokemons[i].pokeStats[1].base_stat}</h5>
                            <div class="stats_representation display_flex_row center_center">
                                <span>0</span>
                                <div class="progress_bar_container">
                                    <div class="progress_bar" style="width: ${(currentPokemons[i].pokeStats[1].base_stat / 134) * 100}%;"></div>
                                </div>
                                <span>134</span>
                            </div>
                        </div>
                        <div class="stats_values display_flex_row">
                            <h5 class="headline_width">Defense: ${currentPokemons[i].pokeStats[2].base_stat}</h5>
                            <div class="stats_representation display_flex_row center_center">
                                <span>0</span>
                                <div class="progress_bar_container">
                                    <div class="progress_bar" style="width: ${(currentPokemons[i].pokeStats[2].base_stat / 180) * 100}%;"></div>
                                </div>
                                <span>180</span>
                            </div>
                        </div>
                        <div class="stats_values display_flex_row">
                            <h5 class="headline_width">Special attack: ${currentPokemons[i].pokeStats[3].base_stat}</h5>
                            <div class="stats_representation display_flex_row center_center">
                                <span>0</span>
                                <div class="progress_bar_container">
                                    <div class="progress_bar" style="width: ${(currentPokemons[i].pokeStats[3].base_stat / 154) * 100}%;"></div>
                                </div>
                                <span>154</span>
                            </div>
                        </div>
                        <div class="stats_values display_flex_row">
                            <h5 class="headline_width">Special defense: ${currentPokemons[i].pokeStats[4].base_stat}</h5>
                            <div class="stats_representation display_flex_row center_center">
                                <span>0</span>
                                <div class="progress_bar_container">
                                    <div class="progress_bar" style="width: ${(currentPokemons[i].pokeStats[4].base_stat / 125) * 100}%;"></div>
                                </div>
                                <span>125</span>
                            </div>
                        </div>
                        <div class="stats_values display_flex_row">
                            <h5 class="headline_width">Speed: ${currentPokemons[i].pokeStats[5].base_stat}</h5>
                            <div class="stats_representation display_flex_row center_center">
                                <span>0</span>
                                <div class="progress_bar_container">
                                    <div class="progress_bar" style="width: ${(currentPokemons[i].pokeStats[5].base_stat / 150) * 100}%;"></div>
                                </div>
                                <span>150</span>
                            </div>
                        </div>
                        <div class="stats_values display_flex_row">
                            <h5 class="headline_width">Base value: ${currentPokemons[i].pokeStats[0].base_stat + currentPokemons[i].pokeStats[1].base_stat + currentPokemons[i].pokeStats[2].base_stat + currentPokemons[i].pokeStats[3].base_stat + currentPokemons[i].pokeStats[4].base_stat + currentPokemons[i].pokeStats[5].base_stat}</h5>
                            <div class="stats_representation display_flex_row center_center">
                                <span>0</span>
                                <div class="progress_bar_container">
                                    <div class="progress_bar" style="width: ${((currentPokemons[i].pokeStats[0].base_stat + currentPokemons[i].pokeStats[1].base_stat + currentPokemons[i].pokeStats[2].base_stat + currentPokemons[i].pokeStats[3].base_stat + currentPokemons[i].pokeStats[4].base_stat + currentPokemons[i].pokeStats[5].base_stat) / 993) * 100}%;"></div>
                                </div>
                                <span>993</span>
                            </div>
                        </div>
                    </div>
                    <div id="evo" class="tab_panel">
                        <h3 class="h3_variant">Evo Chain</h3>
                        <div class="display_flex_column">
                            <div class="evo_chain_images display_flex_row space-around_center">
                                ${evolution ? `
                                    <div class="evo_chain_poke display_flex_column center_center">
                                        ${evolution.evoChainStarter ? `<img class="evo_img evo_img_small" src="${getPokemonImage(evolution.evoChainStarter)}" alt="${evolution.evoChainStarter}">` : ``}
                                        ${evolution.evoChainStarter ? `<p>${evolution.evoChainStarter}</p>` : ``}
                                    </div>
                                    <p>>></p>
                                    <div class="evo_chain_poke display_flex_column center_center">
                                        ${evolution.evoTo1 ? `<img class="evo_img evo_img_medium" src="${getPokemonImage(evolution.evoTo1)}" alt="${evolution.evoTo1}">` : ``}
                                        ${evolution.evoTo1 ? `<p>${evolution.evoTo1}</p>` : ``}
                                    </div>
                                    <p>>></p>
                                    <div class="evo_chain_poke display_flex_column center_center">
                                        ${evolution.evoTo2 ? `<img class="evo_img" src="${getPokemonImage(evolution.evoTo2)}" alt="${evolution.evoTo2}">` : ``}
                                        ${evolution.evoTo2 ? `<p>${evolution.evoTo2}</p>` : ``}
                                    </div>
                                ` : 'No evolution available'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}