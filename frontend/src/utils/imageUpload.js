// 🖼️ Helper para subir imágenes desde el navegador sin backend de storage.
// Redimensiona/comprime en el canvas antes de convertir a base64,
// así el documento que viaja al backend no explota de tamaño.

export function compressImage(file, { maxWidth = 800, maxHeight = 800, quality = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      return reject(new Error("El archivo debe ser una imagen"));
    }

    if (file.size > 8 * 1024 * 1024) {
      return reject(new Error("La imagen es muy pesada (máximo 8MB)"));
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}
