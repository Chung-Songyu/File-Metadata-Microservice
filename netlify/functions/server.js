//// Import modules/packages/files
const express = require('express');
const app = express();
const path = require('path');
const fs = require("fs/promises");
const multer = require("multer");

//// Listen is needed or Node.js will just exit silently i.e. app shut down
// (Netlify deployment) - Not required
/*const listener = app.listen(3000, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});*/

//// Serve static files
app.use(express.static('public'));

//// Routing
// (Netlify deployment) - Not required.
// (Netlify deployment) Netlify > Projects > csy-file-met-data > Project overview > Project configuration (continued..)
// (Netlify deployment) (..continued) > Developer settings > Build settings > Publish directory > value set to "public"
// (Netlify deployment) index.html is hence served from "public" directory/folder (by default)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

//// Create "uploads" folder if it doesn't exist
// (Netlify deployment) - Not used. Uploaded file will be temporarily stored in memory instead of saved to disk
/*const folder = path.join(__dirname, "uploads");
async function createFolder() {
    try {
        await fs.mkdir(folder);
        console.log("'uploads' folder created.");

    } catch (err) {
        // "uploads" folder already exist
        if (err.code == "EEXIST") {
            console.log("'uploads' folder already exist.");
        }
    }
}
createFolder();*/

//// Save uploaded file to "uploads" folder
// File name datetime prefix e.g. 20261231235959
const prefix = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Singapore" }).replace(/[- :]/g, "");

// Create multer instance with defined configuration
const upload = multer({
    // (SAVE file on disk)
    /*storage: multer.diskStorage({
        // File save location. cb = callback
        destination: function (req, file, cb) {
            cb(null, "uploads/")
        },
        // File name e.g. 20261231235959 Test png
        filename: function (req, file, cb) {
            cb(null, prefix + " " + file.originalname)
        }
    }),*/

    // (Netlify deployment) - (DO NOT SAVE file on disk)
    storage: multer.memoryStorage(),

    limits: {
        // 5 MB per file
        fileSize: 5 * 1024 * 1024,
        // Maximum 1 file per request
        files: 1
    },
    fileFilter: (req, file, cb) => {
        // Restrict allowed file types
        if (file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG/PNG/PDF files are allowed."));
        }
    }
});

//// Enable indented JSON
app.set("json spaces", 4);

//// Endpoint for file upload
app.post('/api/fileanalyse', (req, res, next) => {
    // Try to save uploaded file
    upload.single("upfile")(req, res, err => {
        // Errors arising from multer limits
        if (err instanceof multer.MulterError) {
            // File size error (> 5MB)
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    error_code: err.code,
                    error: "File size must not exceed 5 MB."
                });
            }

            // File count error (> 1 file)
            if (err.code === "LIMIT_FILE_COUNT") {
                return res.status(400).json({
                    success: false,
                    error_code: err.code,
                    error: "Only 1 file may be uploaded."
                });
            }
        }

        // Errors arising from multer fileFilter + any other errors
        if (err) {
            return res.status(400).json({
                success: false,
                error: err.message
            });
        }

        // Return file metadata in JSON response
        res.json({
            "name": req.file.originalname,
            "type": req.file.mimetype,
            "size": req.file.size
        });
    })
});

//// Error page
// (Netlify deployment) - Handled in netlify.toml
/*app.use((req, res) => {
     res.status(404).sendFile(path.join(__dirname, "public/html/error.html"));
});*/

//// (Netlify deployment) - Export the wrapped app handler
const serverless = require('serverless-http');
export const handler = serverless(app);