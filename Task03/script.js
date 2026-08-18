/* =====================================================
   DRAG & DROP FILE UPLOADER
===================================================== */

// Get HTML Elements
const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const chooseBtn = document.getElementById("chooseBtn");

const previewContainer = document.getElementById("previewContainer");
const emptyPreview = document.getElementById("emptyPreview");
const removePreview = document.getElementById("removePreview");

const errorMessage = document.getElementById("errorMessage");

const fileName = document.getElementById("fileName");
const fileType = document.getElementById("fileType");
const fileSize = document.getElementById("fileSize");

const uploadBtn = document.getElementById("uploadBtn");
const progressFill = document.getElementById("progressFill");
const progressPercentage = document.getElementById("progressPercentage");
const uploadStatus = document.getElementById("uploadStatus");

const imageGallery = document.getElementById("imageGallery");
const emptyGallery = document.getElementById("emptyGallery");
const clearAllBtn = document.getElementById("clearAllBtn");


// Currently selected file
let selectedFile = null;

// Uploaded image data
let uploadedImages = JSON.parse(
    localStorage.getItem("uploadedImages")
) || [];


// Allowed image types
const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif"
];


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    displayUploadedImages();

});


/* =====================================================
   CHOOSE FILE BUTTON
===================================================== */

chooseBtn.addEventListener("click", () => {

    fileInput.click();

});


/* =====================================================
   FILE INPUT CHANGE
===================================================== */

fileInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (file) {
        handleFile(file);
    }

});


/* =====================================================
   DRAG EVENTS
===================================================== */

dropArea.addEventListener("dragover", (event) => {

    event.preventDefault();

    dropArea.classList.add("drag-active");

});


dropArea.addEventListener("dragleave", () => {

    dropArea.classList.remove("drag-active");

});


dropArea.addEventListener("drop", (event) => {

    event.preventDefault();

    dropArea.classList.remove("drag-active");

    const file = event.dataTransfer.files[0];

    if (file) {
        handleFile(file);
    }

});


/* =====================================================
   HANDLE FILE
===================================================== */

function handleFile(file) {

    // Hide previous error
    hideError();


    // Check file type
    if (!allowedTypes.includes(file.type)) {

        showError(
            "Invalid file! Only JPG, PNG and GIF images are allowed."
        );

        resetFileInput();

        return;
    }


    // Store selected file
    selectedFile = file;


    // Show file information
    showFileDetails(file);


    // Show image preview
    showPreview(file);


    // Reset progress
    resetProgress();


    // Update status
    updateStatus(
        "✓",
        "Image selected. Ready to upload."
    );


    // Enable upload button
    uploadBtn.disabled = false;

}


/* =====================================================
   FILE DETAILS
===================================================== */

function showFileDetails(file) {

    fileName.textContent = file.name;

    fileType.textContent = file.type;

    fileSize.textContent = formatFileSize(file.size);

}


/* =====================================================
   FORMAT FILE SIZE
===================================================== */

function formatFileSize(bytes) {

    if (bytes === 0) {
        return "0 Bytes";
    }

    const sizes = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];

    const i = Math.floor(
        Math.log(bytes) / Math.log(1024)
    );

    return (
        Math.round(
            (bytes / Math.pow(1024, i)) * 100
        ) / 100
    ) + " " + sizes[i];

}


/* =====================================================
   IMAGE PREVIEW
===================================================== */

function showPreview(file) {

    const reader = new FileReader();


    reader.onload = (event) => {

        previewContainer.innerHTML = "";

        const image = document.createElement("img");

        image.src = event.target.result;

        image.alt = "Selected image preview";

        previewContainer.appendChild(image);

        removePreview.style.display = "flex";

    };


    reader.readAsDataURL(file);

}


/* =====================================================
   REMOVE SELECTED PREVIEW
===================================================== */

removePreview.addEventListener("click", () => {

    selectedFile = null;

    previewContainer.innerHTML = "";

    previewContainer.appendChild(emptyPreview);

    emptyPreview.style.display = "block";

    removePreview.style.display = "none";

    fileName.textContent = "--";
    fileType.textContent = "--";
    fileSize.textContent = "--";

    resetProgress();

    updateStatus(
        "✓",
        "Please select an image to upload."
    );

    uploadBtn.disabled = true;

    resetFileInput();

});


/* =====================================================
   UPLOAD BUTTON
===================================================== */

uploadBtn.addEventListener("click", () => {

    if (!selectedFile) {

        showError(
            "Please select an image before uploading."
        );

        return;
    }


    // Start simulated upload
    simulateUpload();

});


/* =====================================================
   SIMULATE UPLOAD PROGRESS
===================================================== */

function simulateUpload() {

    let progress = 0;

    uploadBtn.disabled = true;

    updateStatus(
        "⏳",
        "Uploading your image..."
    );


    const uploadInterval = setInterval(() => {

        progress += 10;


        // Update progress bar
        progressFill.style.width = progress + "%";

        progressPercentage.textContent =
            progress + "%";


        // Upload completed
        if (progress >= 100) {

            clearInterval(uploadInterval);

            saveImageToLocalStorage();

        }

    }, 250);

}


/* =====================================================
   SAVE IMAGE TO LOCAL STORAGE
===================================================== */

function saveImageToLocalStorage() {

    if (!selectedFile) {
        return;
    }


    const reader = new FileReader();


    reader.onload = (event) => {

        const imageData = {
            id: Date.now(),
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            image: event.target.result,
            date: new Date().toLocaleString()
        };


        // Add new image
        uploadedImages.unshift(imageData);


        try {

            localStorage.setItem(
                "uploadedImages",
                JSON.stringify(uploadedImages)
            );


            // Display images
            displayUploadedImages();


            updateStatus(
                "✓",
                "Upload completed successfully!"
            );


            uploadBtn.disabled = false;


            // Clear selected file
            selectedFile = null;

            resetFileInput();

        } catch (error) {

            // LocalStorage storage limit reached
            updateStatus(
                "⚠️",
                "Image is too large to save in localStorage."
            );

            uploadBtn.disabled = false;

        }

    };


    reader.readAsDataURL(selectedFile);

}


/* =====================================================
   DISPLAY UPLOADED IMAGES
===================================================== */

function displayUploadedImages() {

    imageGallery.innerHTML = "";


    // No uploaded images
    if (uploadedImages.length === 0) {

        imageGallery.appendChild(emptyGallery);

        return;
    }


    uploadedImages.forEach((imageData) => {

        // Create image card
        const imageCard = document.createElement("div");

        imageCard.className = "image-card";


        // Image
        const image = document.createElement("img");

        image.src = imageData.image;

        image.alt = imageData.name;


        // Delete button
        const deleteButton =
            document.createElement("button");

        deleteButton.className = "delete-image";

        deleteButton.innerHTML = "✕";

        deleteButton.title = "Delete image";


        deleteButton.addEventListener(
            "click",
            () => {
                deleteImage(imageData.id);
            }
        );


        // Information
        const info = document.createElement("div");

        info.className = "image-card-info";


        const name = document.createElement("p");

        name.textContent = imageData.name;


        const date = document.createElement("p");

        date.textContent = imageData.date;


        info.appendChild(name);

        info.appendChild(date);


        // Add everything to card
        imageCard.appendChild(image);

        imageCard.appendChild(deleteButton);

        imageCard.appendChild(info);


        // Add card to gallery
        imageGallery.appendChild(imageCard);

    });

}


/* =====================================================
   DELETE SINGLE IMAGE
===================================================== */

function deleteImage(id) {

    uploadedImages = uploadedImages.filter(
        (image) => image.id !== id
    );


    localStorage.setItem(
        "uploadedImages",
        JSON.stringify(uploadedImages)
    );


    displayUploadedImages();

}


/* =====================================================
   CLEAR ALL IMAGES
===================================================== */

clearAllBtn.addEventListener("click", () => {

    if (uploadedImages.length === 0) {

        return;
    }


    const confirmClear = confirm(
        "Are you sure you want to delete all uploaded images?"
    );


    if (confirmClear) {

        uploadedImages = [];

        localStorage.removeItem(
            "uploadedImages"
        );

        displayUploadedImages();

    }

});


/* =====================================================
   RESET PROGRESS
===================================================== */

function resetProgress() {

    progressFill.style.width = "0%";

    progressPercentage.textContent = "0%";

}


/* =====================================================
   UPDATE STATUS
===================================================== */

function updateStatus(icon, message) {

    uploadStatus.innerHTML = `
        <span>${icon}</span>
        <p>${message}</p>
    `;

}


/* =====================================================
   SHOW ERROR
===================================================== */

function showError(message) {

    errorMessage.textContent = "⚠️ " + message;

    errorMessage.classList.add("show");

}


/* =====================================================
   HIDE ERROR
===================================================== */

function hideError() {

    errorMessage.classList.remove("show");

}


/* =====================================================
   RESET FILE INPUT
===================================================== */

function resetFileInput() {

    fileInput.value = "";

}


/* =====================================================
   AUTO HIDE ERROR
===================================================== */

setInterval(() => {

    if (errorMessage.classList.contains("show")) {

        errorMessage.classList.remove("show");

    }

}, 5000);