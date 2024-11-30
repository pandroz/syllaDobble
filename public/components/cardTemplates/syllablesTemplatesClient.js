// WIP: To add events to the image inputs
const imageInput = document.getElementById('image-input');
const previewContainer = document.getElementById('image-preview-container');

imageInput.addEventListener('change', function (event) {
    // Clear previous previews
    previewContainer.innerHTML = '';

    // Convert FileList to Array and process each file
    Array.from(this.files).forEach(file => {
        // Check if file is an image
        if (!file.type.startsWith('image/')) return;

        // Create FileReader to read the image
        const reader = new FileReader();

        reader.onload = function (e) {
            // Create wrapper for each image
            const wrapper = document.createElement('div');
            wrapper.className = 'preview-wrapper';

            // Create image element
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';

            // Create remove button
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '×';
            removeBtn.className = 'remove-image';
            removeBtn.onclick = () => wrapper.remove();

            // Assemble preview
            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            previewContainer.appendChild(wrapper);
        };

        // Read the image file
        reader.readAsDataURL(file);
    });
});
