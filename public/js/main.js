//// Form Validation - File Upload (File Size)
const uploadedFile = document.getElementById("upfile");
// File size limit - 5 MB
const maxSize = 5 * 1024 * 1024;

uploadedFile.addEventListener("change", () => {
    // Clear error message
    uploadedFile.setCustomValidity("");

    if (uploadedFile.files.length == 1 && uploadedFile.files[0].size > maxSize) {
        // Set error message (make use of existing HTML validation UI)
        uploadedFile.setCustomValidity("File size must not exceed 5 MB.");
        // Display error message upon user selection of file (as opposed to upon form submission)
        uploadedFile.reportValidity();
    }
});