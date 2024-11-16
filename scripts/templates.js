function getErrorMessage() {
    return `
        <h3>Ein Problem ist aufgetreten. Bitte lade die Seite neu.</h3>
    `;
}

function getPokemonCardsTemplate(pokemon) {
    return `
                    <div class="pokemon_card display_flex_column" onclick="openOverlay()">
                        <div class="poke_id_name display_flex_row space-between_center">
                            <h5>#${pokemon.pokeId}</h5>
                            <h5>${pokemon.pokeName}</h5>
                        </div>
                        <img class="pokemon_img" src="${pokemon.pokeImg}" alt="${pokemon.pokeName}" />
                        <div class="pokemon_attributes display_flex_row center_center">
                            <img class="pokemon_type btn_small">${pokemon.pokeType}</img>
                        </div>
                    </div>
    `;
}

