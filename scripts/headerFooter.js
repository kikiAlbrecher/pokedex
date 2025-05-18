/**
 * Asynchronously includes HTML content into elements with the attribute `w3-include-html`.
 * It fetches the content from the specified file and inserts it into the element.
 * If the file is not found, an error message will be displayed in the element.
 */
async function includeHTML() {
    return new Promise((resolve) => {
        var z, i, elmnt, file, xhttp;
        z = document.getElementsByTagName("*");
        for (i = 0; i < z.length; i++) {
            elmnt = z[i];
            file = elmnt.getAttribute("w3-include-html");
            if (file) {
                xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) { elmnt.innerHTML = this.responseText; }
                        if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                        elmnt.removeAttribute("w3-include-html");
                        includeHTML().then(resolve);
                    }
                };
                xhttp.open("GET", file, true);
                xhttp.send();
                return;
            }
        }
        resolve();
    });
}

/**
 * Toggles the visibility of the responsive menu.
 * This function adds or removes the `resp_menu_closed` class to the menu element with the id `resp_menu`.
 */
function toggleRespMenu() {
    document.getElementById('resp_menu').classList.toggle('resp_menu_closed');
}