fetch("https://matthewsenvironmental.i4connected.cloud/identity/connect/token", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,sr;q=0.8,sh;q=0.7,bs;q=0.6",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "origin": "http://localhost:81030",
    "sec-fetch-site": "cross-site",
    "Referer": "http://localhost:8100/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": "grant_type=refresh_token&client_secret=0be0470165fa49ca9631a2babc0a73d4&client_id=matthews.web&redirect_uri=http%3A%2F%2Flocalhost%3A8100%2Fauthorizationcallback&refresh_token=AFE3ED9D91E8C69508091D496DD5F68347458AEDCB7436A0E4A68D34F958A38B",
  "method": "POST"
}).then(response => {
  if (response.ok) {
    response.json().then(data => console.log(data));
  } else {
    // throw new Error('Network response was not ok: ' + response.statusText);
    console.log('error');
    console.log(response.statusText);
    response.text().then(text => console.log(text));
  }
})
