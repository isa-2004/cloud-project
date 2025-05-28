document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("drop-area");
  const fileName = document.getElementById("fileName");
  const imageInput = document.getElementById("imageInput");
  const chooseBtn = document.getElementById("chooseBtn");
  const uploadBtn = document.getElementById("uploadBtn");
  const progressBar = document.getElementById("progressBar");
  const result = document.getElementById("result");
  const resultLink = document.getElementById("resultLink");
  const resultImage = document.getElementById("resultImage");

  let selectedFile = null;

  // Open file picker
  chooseBtn.addEventListener("click", () => imageInput.click());

  // File selected via picker
  imageInput.addEventListener("change", () => {
    if (imageInput.files.length) {
      selectedFile = imageInput.files[0];
      fileName.textContent = selectedFile.name;
    }
  });

  // Drag events
  ["dragenter", "dragover"].forEach(evt =>
    dropArea.addEventListener(evt, e => {
      e.preventDefault();
      dropArea.classList.add("dragover");
    })
  );
  ["dragleave", "drop"].forEach(evt =>
    dropArea.addEventListener(evt, e => {
      e.preventDefault();
      dropArea.classList.remove("dragover");
    })
  );

  // Handle drop
  dropArea.addEventListener("drop", e => {
    if (e.dataTransfer.files.length) {
      selectedFile = e.dataTransfer.files[0];
      imageInput.files = e.dataTransfer.files;
      fileName.textContent = selectedFile.name;
    }
  });

  // Upload logic
  uploadBtn.addEventListener("click", () => {
    if (!selectedFile) {
      return alert("Please choose an image first.");
    }
    const formData = new FormData();
    formData.append("image", selectedFile);

    progressBar.style.display = "block";
    progressBar.value = 0;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://cloud-project-xqa2.onrender.com/upload");

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) {
        progressBar.value = (e.loaded / e.total) * 100;
      }
    };

    xhr.onload = () => {
      progressBar.style.display = "none";
      if (xhr.status === 200) {
        const resp = JSON.parse(xhr.responseText);
        result.style.display = "block";
        resultLink.href = resp.url;
        resultLink.textContent = resp.url;
        resultImage.src = resp.url;
      } else {
        alert("Upload failed: " + xhr.responseText);
      }
    };

    xhr.onerror = () => {
      progressBar.style.display = "none";
      alert("Upload failed. Network error.");
    };

    xhr.send(formData);
  });
});
