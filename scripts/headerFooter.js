/**
 * Asynchronously includes HTML content into elements with the attribute `w3-include-html`.
 * It fetches the content from the specified file and inserts it into the element.
 * If the file is not found, an error message will be displayed in the element.
 */
async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        let file = element.getAttribute("w3-include-html");
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
}

/**
 * Toggles the visibility of the responsive menu.
 * This function adds or removes the `resp_menu_closed` class to the menu element with the id `resp_menu`.
 */
function toggleRespMenu() {
    document.getElementById('resp_menu').classList.toggle('resp_menu_closed');
}
