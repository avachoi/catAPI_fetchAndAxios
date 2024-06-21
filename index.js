import * as Carousel from "./Carousel.js";
import axios from "axios";

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

// Set default Axios configuration
axios.defaults.headers.common["x-api-key"] = API_KEY;
axios.defaults.baseURL = "https://api.thecatapi.com/v1";

let selectedBreed = "";

function updateProgress(event) {
	if (event.lengthComputable) {
		const percentComplete = (event.loaded / event.total) * 100;
		progressBar.style.width = percentComplete + "%";
	}
}

async function initialLoad() {
	try {
		const response = await axios.get("/breeds", {
			onDownloadProgress: updateProgress,
		});
		const breeds = response.data;
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
		console.error("Error loading breeds:", error);
	}
}

async function loadBreed(id) {
	try {
		const [imageResponse, infoResponse] = await Promise.all([
			axios.get(`/images/search?limit=10&breed_ids=${id}`),
			axios.get(`/breeds/${id}`),
		]);

		const breedImages = imageResponse.data;
		const breedInfo = infoResponse.data;
		Carousel.clear();
		breedImages.forEach((img) => {
			const element = Carousel.createCarouselItem(img.url, img.id, img.id);
			Carousel.appendCarousel(element);
		});

		const infoContent = `
            <h2>${breedInfo.name}</h2>
            <p>${breedInfo.description}</p>
            <p>Life span: ${breedInfo.life_span}</p>
            <p>Energy level: ${breedInfo.energy_level}</p>
            <p>Learn more: <a href="${breedInfo.wikipedia_url}" target="_blank">click here</a></p>
        `;
		infoDump.innerHTML = infoContent;
		Carousel.start();
	} catch (error) {
		console.error("Error loading breed:", error);
	}
}

breedSelect.addEventListener("change", (event) => {
	const selectedBreedId = event.target.value;
	loadBreed(selectedBreedId);
});

getFavouritesBtn.addEventListener("click", () => loadBreed(selectedBreed));

axios.interceptors.request.use(
	(request) => {
		document.body.style.cursor = "progress";
		console.log(`Starting request to ${request.url}`);
		request.metadata = { startTime: new Date().getTime() };
		progressBar.style.width = "0%";
		return request;
	},
	(error) => {
		document.body.style.cursor = "default";
		return Promise.reject(error);
	}
);

axios.interceptors.response.use(
	(response) => {
		document.body.style.cursor = "default";
		const endTime = new Date().getTime();
		const duration = endTime - response.config.metadata.startTime;
		console.log(`Request to ${response.config.url} completed in ${duration}ms`);
		return response;
	},
	(error) => {
		document.body.style.cursor = "default";
		return Promise.reject(error);
	}
);

export async function favourite(imgId) {
	try {
		const response = await axios.get("/favourites", {
			headers: {
				"Content-Type": "application/json",
			},
		});

		const favorites = response.data;
		let currentFavorite = favorites.find(
			(favorite) => favorite.image_id === imgId
		);

		if (currentFavorite) {
			await axios.delete(`/favourites/${currentFavorite.id}`, {
				headers: {
					"Content-Type": "application/json",
				},
			});
		} else {
			const requestBody = {
				image_id: imgId,
				sub_id: "my-user-1234",
			};

			await axios.post(`/favourites`, requestBody, {
				headers: {
					"Content-Type": "application/json",
				},
			});
		}
	} catch (error) {
		console.error("Error handling favourite:", error);
	}
}

async function getFavourites() {
	try {
		const response = await axios.get("/favourites");
		const favourites = response.data;
		Carousel.clear();
		favourites.forEach((fav) => {
			const element = Carousel.createCarouselItem(
				fav.image.url,
				fav.id,
				fav.image_id
			);
			Carousel.appendCarousel(element);
		});
		Carousel.start();
	} catch (error) {
		console.error("Error loading favourites:", error);
	}
}

getFavouritesBtn.addEventListener("click", getFavourites);

document.addEventListener("DOMContentLoaded", initialLoad);
