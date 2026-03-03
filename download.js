const fs = require('fs');
const https = require('https');

const file1 = fs.createWriteStream("assets/icon.png");
const file2 = fs.createWriteStream("assets/splash.png");

https.get("https://storage.googleapis.com/chat-gemini-android-app/2026/02/24/18/17/31/320498/original_image.png", function (response) {
    response.pipe(file1);
    response.pipe(file2);
});
