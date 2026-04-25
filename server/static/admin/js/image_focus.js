(function () {
    function clamp(value) {
        return Math.max(0, Math.min(100, Math.round(value)));
    }

    function setPreview(preview, x, y) {
        var image = preview.querySelector("img");
        var marker = preview.querySelector(".image-focus-marker");

        preview.dataset.focusX = String(x);
        preview.dataset.focusY = String(y);

        if (image) {
            image.style.objectPosition = x + "% " + y + "%";
        }

        if (marker) {
            marker.style.left = x + "%";
            marker.style.top = y + "%";
        }
    }

    function initPreview(preview) {
        var inputX = document.getElementById("id_focus_x");
        var inputY = document.getElementById("id_focus_y");

        if (!inputX || !inputY) {
            return;
        }

        function syncFromInputs() {
            setPreview(
                preview,
                clamp(Number(inputX.value || preview.dataset.focusX || 50)),
                clamp(Number(inputY.value || preview.dataset.focusY || 50))
            );
        }

        syncFromInputs();

        inputX.addEventListener("input", syncFromInputs);
        inputY.addEventListener("input", syncFromInputs);

        preview.addEventListener("click", function (event) {
            var rect = preview.getBoundingClientRect();
            var x = clamp(((event.clientX - rect.left) / rect.width) * 100);
            var y = clamp(((event.clientY - rect.top) / rect.height) * 100);

            inputX.value = String(x);
            inputY.value = String(y);
            setPreview(preview, x, y);
        });
    }

    function createPreviewForFileInput(input) {
        var file = input.files && input.files[0];

        if (!file || !file.type || !file.type.match(/^image\//)) {
            return;
        }

        var preview = document.querySelector(".image-focus-preview");

        if (!preview) {
            preview = document.createElement("div");
            preview.className = "image-focus-preview image-focus-preview-live";
            preview.innerHTML = '<img alt="" /><span class="image-focus-marker"></span>';
            input.parentNode.appendChild(preview);
            initPreview(preview);
        }

        var image = preview.querySelector("img");
        image.src = URL.createObjectURL(file);
        setPreview(
            preview,
            clamp(Number(document.getElementById("id_focus_x").value || 50)),
            clamp(Number(document.getElementById("id_focus_y").value || 50))
        );
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".image-focus-preview").forEach(initPreview);

        var fileInput = document.getElementById("id_image");
        if (fileInput) {
            fileInput.addEventListener("change", function () {
                createPreviewForFileInput(fileInput);
            });
        }
    });
})();
