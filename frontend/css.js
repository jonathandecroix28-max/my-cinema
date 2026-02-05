const displayForm = document.querySelector("section[data-display]")
const createButton = document.createElement("button");
createButton.id = "toggle";
createButton.ariaLabel = "Afficher";

document.body.appendChild(createButton);
const btn = document.getElementById("toggle");
btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (displayForm.style.display !== "none") {
        createButton.textContent = "Afficher";
        displayForm.style.display = "none";
    } else {
        createButton.textContent = "Cacher";
        displayForm.style.display = "block";

    }
})