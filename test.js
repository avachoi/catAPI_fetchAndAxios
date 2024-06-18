import * as Carousel from "./Carousel.js";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
	"live_cIoPnv2pDRZEcj8AlRSHtCN4zXyxnXYqYzWT0U4TQheEIQNSGdmvL7hAs0Fi74ys";

let selectedBreed = "";

async function initialLoad() {
	try {
		const response = await fetch("https://api.thecatapi.com/v1/breeds");
		const breeds = await response.json();
		breedSelect.innerHTML = "";

		breeds.forEach((breed) => {
			const option = document.createElement("option");
			option.value = breed.id;
			option.textContent = breed.name;
			breedSelect.appendChild(option);
		});

		if (breeds.length > 0) {
			loadBreed(breeds[0].id);
		}
	} catch (error) {
		console.error("Failed to load breeds:", error);
	}
}

async function loadBreed(id) {
	try {
		const [imageResponse, breedResponse] = await Promise.all([
			fetch(
				`https://api.thecatapi.com/v1/images/search?limit=10&breed_ids=${id}&api_key=${API_KEY}`
			),
			fetch(`https://api.thecatapi.com/v1/breeds/${id}`),
		]);

		const breedImages = await imageResponse.json();
		const breedInfo = await breedResponse.json();

		// Clear previous content
		Carousel.clear();
		infoDump.innerHTML = "";

		// Create carousel elements for each image
		breedImages.forEach((img) => {
			const element = Carousel.createCarouselItem(img.url, img.id, img.id);
			Carousel.appendCarousel(element);
		});

		// Create informational section
		const infoContent = `
            <h2>${breedInfo.name}</h2>
            <p>${breedInfo.description}</p>
            <p><strong>Temperament:</strong> ${breedInfo.temperament}</p>
            <p><strong>Origin:</strong> ${breedInfo.origin}</p>
            <p><strong>Life Span:</strong> ${breedInfo.life_span} years</p>
            <p><strong>Weight:</strong> ${breedInfo.weight.metric} kg</p>
        `;
		infoDump.innerHTML = infoContent;

		// Start carousel after adding items
		Carousel.start();
	} catch (error) {
		console.error("Failed to load breed information:", error);
	}
}

breedSelect.addEventListener("change", (event) => {
	const selectedBreedId = event.target.value;
	loadBreed(selectedBreedId);
});

getFavouritesBtn.addEventListener("click", () => loadBreed(selectedBreed));

document.addEventListener("DOMContentLoaded", initialLoad);

export async function favourite(imgId) {
	// Your code here for favouriting an image
}
