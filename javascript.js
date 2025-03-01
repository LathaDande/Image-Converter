// Image Converter Logic

const formats = [

    { name: 'JPEG', type: 'jpeg' },

    { name: 'PNG', type: 'png' },

    { name: 'GIF', type: 'gif' },

    { name: 'BMP', type: 'bmp' },

    { name: 'WEBP', type: 'webp' },

    { name: 'TIFF', type: 'tiff' }

];


let selectedFormat = null;


function createFormatButtons() {

    const grid = document.getElementById('formatGrid');

    formats.forEach(format => {

        const btn = document.createElement('div');

        btn.className = 'format-btn';

        btn.innerHTML = `

<div class="format-content">

<h3>${format.name}</h3>

<p>.${format.type}</p>

</div>

`;

        btn.addEventListener('click', () => {

            document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('selected'));

            btn.classList.add('selected');

            selectedFormat = format.type;

        });

        grid.appendChild(btn);

    });

}


async function convertImage(file) {

    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = async function (e) {

            const img = new Image();

            img.src = e.target.result;


            img.onload = function () {

                const canvas = document.createElement('canvas');

                canvas.width = img.width;

                canvas.height = img.height;

                const ctx = canvas.getContext('2d');

                ctx.drawImage(img, 0, 0);


                canvas.toBlob(blob => {

                    resolve(new File([blob], `converted.${selectedFormat}`, {

                        type: `image/${selectedFormat}`

                    }));

                }, `image/${selectedFormat}`);

            };

        };

        reader.readAsDataURL(file);

    });

}


async function startConversion() {

    const fileInput = document.getElementById('imageInput');


    if (!fileInput.files[0]) {

        alert('Please select an image first!');

        return;

    }

    if (!selectedFormat) {

        alert('Please select output format!');

        return;

    }


    try {

        const convertedFile = await convertImage(fileInput.files[0]);

        const url = URL.createObjectURL(convertedFile);


        const a = document.createElement('a');

        a.href = url;

        a.download = `converted.${selectedFormat}`;

        a.click();

        URL.revokeObjectURL(url);


    } catch (error) {

        alert('Conversion failed. Please try another format.');

    }

}


// Image Compressor Logic

function calculateQuality(targetSize, originalSize) {

    let quality = 0.9;

    let iterations = 0;

    const maxIterations = 10;


    while (iterations < maxIterations) {

        const calculatedSize = originalSize * quality;

        if (calculatedSize <= targetSize * 1024) break;

        quality -= 0.1;

        iterations++;

    }

    return Math.max(quality, 0.1);

}


async function compressImage(file, targetKB) {

    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = function (e) {

            const img = new Image();

            img.src = e.target.result;


            img.onload = function () {

                const canvas = document.createElement('canvas');

                canvas.width = img.width;

                canvas.height = img.height;

                const ctx = canvas.getContext('2d');

                ctx.drawImage(img, 0, 0);


                const quality = calculateQuality(targetKB, file.size);


                canvas.toBlob(blob => {

                    resolve(new File([blob], `compressed_${targetKB}kb.jpg`, {

                        type: 'image/jpeg'

                    }));

                }, 'image/jpeg', quality);

            };

        };

        reader.readAsDataURL(file);

    });

}


async function startCompression() {

    const fileInput = document.getElementById('compressInput');

    const targetKB = parseInt(document.getElementById('sizeSlider').value);


    if (!fileInput.files[0]) {

        alert('Please select an image first!');

        return;

    }


    try {

        const compressedFile = await compressImage(fileInput.files[0], targetKB);

        const url = URL.createObjectURL(compressedFile);


        const a = document.createElement('a');

        a.href = url;

        a.download = `compressed_${targetKB}kb.jpg`;

        a.click();

        URL.revokeObjectURL(url);


    } catch (error) {

        alert('Compression failed. Please try again.');

    }

}


// Tab System

function showTab(tabName) {

    ['converter', 'compressor', 'about'].forEach(tab => {

        document.getElementById(tab).style.display = tab === tabName ? 'block' : 'none';

    });

}


// Initialize

window.onload = () => {

    createFormatButtons();

    document.getElementById('sizeSlider').addEventListener('input', function () {

        document.getElementById('sizeValue').textContent = this.value;

    });


    // Drag and drop for both tools

    const initDragDrop = (container, inputId) => {

        const zone = document.querySelector(container);

        zone.ondragover = (e) => {

            e.preventDefault();

            zone.style.backgroundColor = '#f0f4ff';

        };

        zone.ondrop = (e) => {

            e.preventDefault();

            document.querySelector(inputId).files = e.dataTransfer.files;

            zone.style.backgroundColor = '';

        };

    };


    initDragDrop('#converter', '#imageInput');

    initDragDrop('#compressor', '#compressInput');

};