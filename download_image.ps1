$imageUrl = "https://storage.googleapis.com/chat-gemini-android-app/2026/02/24/18/17/31/320498/original_image.png"
$iconPath = "assets/icon.png"
$splashPath = "assets/splash.png"

Invoke-WebRequest -Uri $imageUrl -OutFile $iconPath
Copy-Item -Path $iconPath -Destination $splashPath
