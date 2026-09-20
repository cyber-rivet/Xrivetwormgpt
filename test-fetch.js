const https = require('https');
https.get('https://www.myinstants.com/media/sounds/abe-saale-sound.mp3', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'audio/mpeg'
  }
}, (res) => {
  console.log(res.statusCode);
});
