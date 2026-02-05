# Video Clips Management Guide

The video mixer now loads clips **dynamically** from `public/clips.json`. You can add, remove, or update clips by editing this single file.

## 📁 Files

- **`public/clips.json`** - Main clips configuration (edit this to add/remove clips)
- **`CloudFlare Clips.txt`** - Source file with all clip data in text format

## 🎬 How to Add New Clips

### Method 1: Edit clips.json Directly (Recommended)

1. Open `public/clips.json`
2. Add a new object to the `clips` array:

```json
{
  "id": "clip-37",
  "title": "Clip 37",
  "folder": "ratio-3-1",
  "hlsUrl": "https://customer-da4812z845ijzly5.cloudflarestream.com/YOUR_VIDEO_ID/manifest/video.m3u8",
  "videoId": "YOUR_VIDEO_ID"
}
```

3. Save the file
4. Reload the page in your browser

### Method 2: Update CloudFlare Clips.txt and Re-parse

1. Add new clips to `CloudFlare Clips.txt` in this format:

```
Title: Clip 37
Folder: Ratio 3:1
HLS: https://customer-da4812z845ijzly5.cloudflarestream.com/YOUR_VIDEO_ID/manifest/video.m3u8
```

2. Run the parser script:

```bash
cd video-mixer
node -e "
const fs = require('fs');
const data = fs.readFileSync('CloudFlare Clips.txt', 'utf8');
const lines = data.split('\n');
const clips = [];
let currentClip = {};

for (let line of lines) {
  line = line.trim();
  if (!line) {
    if (currentClip.title) clips.push(currentClip);
    currentClip = {};
    continue;
  }

  if (line.startsWith('Title:')) {
    currentClip.title = line.replace('Title:', '').trim();
  } else if (line.startsWith('Folder:')) {
    const folder = line.replace('Folder:', '').trim();
    currentClip.folder = folder === 'Ratio 3:1' ? 'ratio-3-1' : 'ratio-4-1';
  } else if (line.startsWith('HLS:')) {
    let url = line.replace('HLS:', '').trim();
    url = url.replace('hhttps://', 'https://');
    currentClip.hlsUrl = url;
    const match = url.match(/cloudflarestream\.com\/([^\/]+)\/manifest/);
    if (match) {
      currentClip.videoId = match[1];
      currentClip.id = 'clip-' + (clips.length + 1);
    }
  }
}
if (currentClip.title) clips.push(currentClip);

const output = {
  '_description': 'Video Clips Configuration',
  'version': '1.0.0',
  'customerid': 'customer-da4812z845ijzly5',
  'count': clips.length,
  'clips': clips
};

fs.writeFileSync('public/clips.json', JSON.stringify(output, null, 2));
console.log('✓ Generated clips.json with ' + clips.length + ' clips');
"
```

3. Reload the page

## 📊 Current Clips

As of now, you have **36 clips** loaded:
- **30 clips** in Ratio 3:1 folder
- **6 clips** in Ratio 4:1 folder

## 🔧 Folder System

Clips are organized into folders based on aspect ratio:

- **`ratio-3-1`** - For videos with 3:1 aspect ratio
- **`ratio-4-1`** - For videos with 4:1 aspect ratio
- **`all`** - Virtual folder showing all clips

## 🎯 Getting Video IDs from Cloudflare

1. Go to your Cloudflare Stream dashboard
2. Find your video
3. The video ID is in the URL: `cloudflarestream.com/YOUR_VIDEO_ID/manifest/video.m3u8`
4. Copy the ID (the part between `cloudflarestream.com/` and `/manifest`)

## ⚠️ Important Notes

- **Clip IDs must be unique** - Use sequential numbering: `clip-1`, `clip-2`, etc.
- **HLS URLs** must be valid Cloudflare Stream URLs
- **Folder names** must be exactly `ratio-3-1` or `ratio-4-1`
- **Changes require page reload** - The app caches clips after first load
- **Thumbnails** are auto-generated from video IDs

## 🐛 Troubleshooting

### Clips not showing up?

1. Check `public/clips.json` exists and is valid JSON
2. Open browser console (F12) and look for errors
3. Verify the HLS URL is correct (test it in VLC or browser)
4. Make sure the video ID matches the one in the URL
5. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

### Invalid JSON error?

- Check for missing commas between objects
- Check for trailing commas (not allowed in JSON)
- Verify all strings are in double quotes
- Use a JSON validator: https://jsonlint.com

## 🚀 Example: Adding a New Clip

Let's say you uploaded a new video with ID `abc123def456` to Cloudflare Stream.

1. Open `public/clips.json`
2. Add this to the `clips` array:

```json
{
  "id": "clip-37",
  "title": "My New Clip",
  "folder": "ratio-3-1",
  "hlsUrl": "https://customer-da4812z845ijzly5.cloudflarestream.com/abc123def456/manifest/video.m3u8",
  "videoId": "abc123def456"
}
```

3. Update the `count` field at the top: `"count": 37`
4. Save and reload the page

Done! Your new clip will appear in the library.
