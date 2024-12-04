

export function uploadImage(imageInput) {
    let imgId = imageInput.id;
    let elemPrevId = document.getElementById('cont' + _.replace(imgId, 'img', ''));
    let spanPrev = document.getElementById('prev' + _.replace(imgId, 'img', ''));
    let imgPrev = document.getElementById('prevImg' + _.replace(imgId, 'img', ''));

    _.each(imageInput.files, file => {
        // Check if file is an image
        if (!file.type.startsWith('image/')) return;

        // Create FileReader to read the image
        const reader = new FileReader();

        reader.onload = function (e) {
            // Create wrapper for each image
            let wrapper = document.createElement('div');
            wrapper.className = 'preview-wrapper';
            wrapper.id = 'wrapper' + _.upperFirst(imgId);

            // Create image element
            const img = document.createElement('img');
            img.id = 'prev' + _.upperFirst(imgId);
            img.src = e.target.result;
            img.className = 'card-image';

            // Create remove button
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            removeBtn.id = 'remove' + _.upperFirst(imgId);
            removeBtn.className = 'remove-image';
            removeBtn.onclick = () => {
                img.remove();
                removeBtn.remove();
                wrapper.remove();
                spanPrev.classList.remove('hidden');
                imgPrev.classList.remove('hidden');
            };

            // Assemble preview
            wrapper.appendChild(removeBtn);
            wrapper.appendChild(img);
            elemPrevId.appendChild(wrapper);
            spanPrev.classList.add('hidden');
            spanPrev.textContent = '';
            imgPrev.classList.add('hidden');
            imgPrev.src = '';

            // console.log('imgFile: ', img.src);

            // Clear input
            imageInput.value = '';
        };

        // Read the image file
        reader.readAsDataURL(file);
    });

}



// imageInput.addEventListener('change', function (event) {
//     // Clear previous previews
//     previewContainer.innerHTML = '';

//     // Convert FileList to Array and process each file
    
// });
