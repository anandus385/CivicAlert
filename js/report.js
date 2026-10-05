// =======================================
// Firebase Imports
// =======================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// =======================================
// Global Variables
// =======================================

let currentUser = null;

let latitude = null;
let longitude = null;

// =======================================
// Check Login
// =======================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        currentUser = user;

    } else {

        alert("Please login first.");

        window.location.href = "login.html";

    }

});
// =======================================
// AI Image Classification
// =======================================

console.log("tmImage =", window.tmImage);

const MODEL_URL = "./my_model/";

let model;
let maxPredictions;

async function initModel() {

    try {

        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);

        maxPredictions = model.getTotalClasses();

        console.log("✅ AI Model Loaded Successfully");

    } catch (error) {

        console.error("❌ Failed to load AI model");
        console.error(error);

    }

}

initModel();

const imageInput = document.getElementById("image");
const predictionResult = document.getElementById("predictionResult");

imageInput.addEventListener("change", async (event) => {

    if (!model) {

        alert("AI model is still loading. Please wait a few seconds.");

        return;

    }

    const file = event.target.files[0];

    if (!file) return;

    const img = new Image();

    // IMPORTANT: This uses the browser's URL object
    img.src = window.URL.createObjectURL(file);

    img.onload = async () => {

        try {

            const predictions = await model.predict(img);

            let highest = predictions[0];

            predictions.forEach(pred => {

                if (pred.probability > highest.probability) {

                    highest = pred;

                }

            });

            predictionResult.innerHTML = `
                🤖 AI Prediction:
                <b>${highest.className}</b>
                (${(highest.probability * 100).toFixed(2)}%)
            `;

            document.getElementById("category").value =
                highest.className;

            console.log(predictions);

        }

        catch (error) {

            console.error("Prediction Error:", error);

        }

    };

});
// =======================================
// Detect Current Location
// =======================================

const locationBtn = document.getElementById("locationBtn");

locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported by your browser.");

        return;

    }

    locationBtn.innerHTML = "Detecting Location...";

    navigator.geolocation.getCurrentPosition(

        (position) => {

            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            document.getElementById("location").value =
                latitude.toFixed(6) + ", " + longitude.toFixed(6);

            locationBtn.innerHTML = "✅ Location Detected";

        },

        (error) => {

            console.error(error);

            alert("Unable to fetch location.");

            locationBtn.innerHTML = "📍 Detect Location";

        }

    );

});

// =======================================
// Submit Complaint
// =======================================

const reportForm = document.getElementById("reportForm");

reportForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!currentUser) {

        alert("Please login first.");

        return;

    }

    if (latitude === null || longitude === null) {

        alert("Please detect your location before submitting.");

        return;

    }

    try {

        const title = document.getElementById("title").value;

        const category = document.getElementById("category").value;

        const description = document.getElementById("description").value;

        const location = document.getElementById("location").value;

        const imageInput = document.getElementById("image");

        let imageName = "";

        if (imageInput.files.length > 0) {

            imageName = imageInput.files[0].name;

        }

        await addDoc(collection(db, "complaints"), {

            userId: currentUser.uid,

            userEmail: currentUser.email,

            title: title,

            category: category,

            description: description,

            location: location,

            latitude: latitude,

            longitude: longitude,

            imageName: imageName,

            status: "Pending",

            createdAt: serverTimestamp()

        });

        alert("Complaint Submitted Successfully!");

        reportForm.reset();

        latitude = null;
        longitude = null;

        locationBtn.innerHTML = "📍 Detect Location";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});