# Subdiva 🟢🔵🟣
> A modern, zero-dependency remaster of the iconic viral subdivision game *Koalas to the Max*.

Remember stumbling upon *Koalas to the Max* through sides like *wwwdotcom.com* or *The Useless Web* out of boredom back in the 2010s? 

The original was made Vadim Ogievetsky, but years of modern browser security updates, strict cross-origin policies (CORS), and deprecated backend servers rendered external image links unusable on modern web browsers.

**Subdiva** brings og feeling back with a modern rewrite. Drop in any image andd it will be transformed into an interactive, splitting canvas of circles.

## Disclaimer

This is my first Frontend and using Tailwind CSS, so excuse the somewhat rough desgin

---

## ✨ Features

- **Zero Backend / 100% Client-Side:** Everything runs locally inside your browser No server dependencies, no API keys, and no broken proxy servers.
Therefore can be run by anyone
-  **Smart Square Cropping:** Drop in any high-resolution image of any ratio or size. It automatically center-crops and optimizes the image to a $512 \times 512$ color matrix.
- **May Support Mobile?** Pointer and swipe simulation theorettilcy included, but not tested yet (will change this once i did)
- 🏆 **Completion Detection & Reset:** Detects when you have subdivided the cricles down to the smallest $4\text{px}$ dots (Total 16,384 dots, with a margin of -50 dots, can be adjusted to your liking in script.js function checkWin() )
- 🎯 **Modern UI:** Built using **D3.js (v7)** and styled with **Tailwind CSS**.

---

## 🕹️ How It Works

1. **Pixel Matrixing:** When an image is dropped into the canvas, an offscreen HTML5 `<canvas>` center-crops the image and extracts it's RGBA values.
2. **Quadtree Subdivision:** The board starts as a single circle with the acrage color of the entire picture
3. **Dynamic D3 Spawning:** When your cursor (and mabye finger) touches a circle a circle larger than $4\text{px}$, it splits into 4 smaller circles. Each new child circle samples the average color of its parent and animates outward from its parent's origin.
4. **The Reveal:** The board holds up to $16,384$ individual circles, reconstructing the original picture.

---

## 🚀 Getting Started

No build steps, node modules, or bundlers required!

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/subdiva.git
   cd subdiva
   ```

2. Open `index.html` in any modern web browser:
   - Double click `index.html`, or
   - Serve it via VS Code's **Live Server** extension, or
   - Use Python's built-in local server:
     ```bash
     python3 -m http.server 8000
     ```

3. Drag & drop an image, or click the upload area to select one from your computer.


## 💡 Acknowledgements & Credit

- Inspired by **Vadim Ogievetsky**'s [*Koalas to the Max*](https://www.koalastothemax.com/).
- Uses [D3.js](https://d3js.org/) and [Tailwind CSS](https://tailwindcss.com/).