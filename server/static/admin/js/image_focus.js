(function () {
    var FORMAT_PRESETS = {
        portrait: { width: 200, height: 350 },
        landscape: { width: 320, height: 180 }
    };

    function clamp(value) {
        return Math.max(0, Math.min(100, Math.round(value)));
    }

    function applyFormat(preview, formatName) {
        var preset = FORMAT_PRESETS[formatName] || FORMAT_PRESETS.portrait;
        preview.dataset.targetWidth = String(preset.width);
        preview.dataset.targetHeight = String(preset.height);
        preview.dataset.frameFormat = formatName;
        preview.classList.toggle("image-focus-preview--landscape", formatName === "landscape");
    }

    function updateMarker(preview) {
        var image = preview.querySelector("img");
        var marker = preview.querySelector(".image-focus-marker");

        if (!image || !marker || !image.naturalWidth || !image.naturalHeight || !image.clientWidth || !image.clientHeight) {
            return;
        }

        var focusX = clamp(Number(preview.dataset.focusX || 50));
        var focusY = clamp(Number(preview.dataset.focusY || 50));
        var targetWidth = Number(preview.dataset.targetWidth || 200);
        var targetHeight = Number(preview.dataset.targetHeight || 350);
        var targetAspect = targetWidth / targetHeight;

        var sourceWidth = image.naturalWidth;
        var sourceHeight = image.naturalHeight;
        var sourceAspect = sourceWidth / sourceHeight;
        var visibleWidth = sourceWidth;
        var visibleHeight = sourceHeight;

        if (sourceAspect > targetAspect) {
            visibleWidth = sourceHeight * targetAspect;
        } else {
            visibleHeight = sourceWidth / targetAspect;
        }

        var cropLeft = (sourceWidth - visibleWidth) * (focusX / 100);
        var cropTop = (sourceHeight - visibleHeight) * (focusY / 100);

        marker.style.width = image.clientWidth * (visibleWidth / sourceWidth) + "px";
        marker.style.height = image.clientHeight * (visibleHeight / sourceHeight) + "px";
        marker.style.left = image.clientWidth * (cropLeft / sourceWidth) + "px";
        marker.style.top = image.clientHeight * (cropTop / sourceHeight) + "px";
    }

    function setPreview(preview, x, y) {
        preview.dataset.focusX = String(x);
        preview.dataset.focusY = String(y);
        updateMarker(preview);
    }

    function initFormatControls(preview) {
        var controls = preview.parentNode.querySelector(".image-focus-controls");

        if (!controls) {
            return;
        }

        controls.querySelectorAll('input[name="image-focus-format"]').forEach(function (input) {
            input.addEventListener("change", function () {
                if (input.checked) {
                    applyFormat(preview, input.value);
                    updateMarker(preview);
                }
            });
        });

        var checkedInput = controls.querySelector('input[name="image-focus-format"]:checked');
        applyFormat(preview, checkedInput ? checkedInput.value : "portrait");
    }

    function initPreview(preview) {
        var inputX = document.getElementById("id_focus_x");
        var inputY = document.getElementById("id_focus_y");
        var image = preview.querySelector("img");

        if (!inputX || !inputY) {
            return;
        }

        initFormatControls(preview);

        function syncFromInputs() {
            setPreview(
                preview,
                clamp(Number(inputX.value || preview.dataset.focusX || 50)),
                clamp(Number(inputY.value || preview.dataset.focusY || 50))
            );
        }

        inputX.addEventListener("input", syncFromInputs);
        inputY.addEventListener("input", syncFromInputs);
        window.addEventListener("resize", syncFromInputs);

        if (image) {
            if (image.complete) {
                syncFromInputs();
            } else {
                image.addEventListener("load", syncFromInputs);
            }
        } else {
            syncFromInputs();
        }

        preview.addEventListener("click", function (event) {
            var rect = image ? image.getBoundingClientRect() : preview.getBoundingClientRect();
            var x = clamp(((event.clientX - rect.left) / rect.width) * 100);
            var y = clamp(((event.clientY - rect.top) / rect.height) * 100);

            inputX.value = String(x);
            inputY.value = String(y);
            setPreview(preview, x, y);
        });
    }

    function ensureControls(preview) {
        var existingControls = preview.parentNode.querySelector(".image-focus-controls");

        if (existingControls) {
            return existingControls;
        }

        var controls = document.createElement("div");
        controls.className = "image-focus-controls";
        controls.innerHTML =
            '<span class="image-focus-controls__label">Формат кадра:</span>' +
            '<label class="image-focus-controls__option">' +
            '  <input type="radio" name="image-focus-format" value="portrait" checked>' +
            '  <span>Вертикальная карточка</span>' +
            "</label>" +
            '<label class="image-focus-controls__option">' +
            '  <input type="radio" name="image-focus-format" value="landscape">' +
            '  <span>Горизонтальная карточка</span>' +
            "</label>";

        preview.parentNode.insertBefore(controls, preview);
        return controls;
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
            preview.dataset.targetWidth = "200";
            preview.dataset.targetHeight = "350";
            preview.innerHTML = '<img alt="" /><span class="image-focus-marker"></span>';
            input.parentNode.appendChild(preview);
            ensureControls(preview);
            initPreview(preview);
        } else {
            ensureControls(preview);
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
