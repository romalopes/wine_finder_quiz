import { useRef, useState } from "react";
import { imagesApi } from "../services/api";

// Interactive image management used by the wine, review and article forms.
// When `imageableId` is present it uploads/removes images immediately via
// the API; otherwise it only collects selected files and reports them through
// `onFilesChange` so the parent can attach them on create.
function ImageManager({
  imageableType,
  images = [],
  imageIds = [],
  imageableId,
  onFilesChange,
  onImagesChange,
}) {
  const [pending, setPending] = useState([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  async function handleFiles(files) {
    const list = Array.from(files || []);
    if (list.length === 0) return;

    if (imageableId) {
      setBusy(true);
      try {
        await imagesApi.upload(imageableType, imageableId, list);
        onImagesChange && onImagesChange();
      } catch (err) {
        alert(err.message || "Failed to upload image");
      } finally {
        setBusy(false);
      }
    } else {
      const next = [...pending, ...list];
      setPending(next);
      onFilesChange && onFilesChange(next);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleRemove(index, id) {
    setBusy(true);
    try {
      if (imageableId && id) {
        await imagesApi.destroy(imageableType, imageableId, id);
        onImagesChange && onImagesChange();
      } else {
        const next = pending.filter((_, i) => i !== index);
        setPending(next);
        onFilesChange && onFilesChange(next);
      }
    } catch (err) {
      alert(err.message || "Failed to remove image");
    } finally {
      setBusy(false);
    }
  }

  const currentImages = images.map((src, i) => ({
    src,
    id: imageIds?.[i],
  }));

  return (
    <div className="image-manager">
      <div className="image-manager__list">
        {currentImages.map((img, i) => (
          <div key={i} className="image-manager__item">
            <img src={img.src} alt={`attachment ${i + 1}`} />
            <button
              type="button"
              className="image-manager__remove"
              onClick={() => handleRemove(i, img.id)}
              title="Remove image"
              disabled={busy}
            >
              &times;
            </button>
          </div>
        ))}
        {pending.map((file, i) => (
          <div key={`p${i}`} className="image-manager__item image-manager__item--pending">
            <img src={URL.createObjectURL(file)} alt={`new ${i + 1}`} />
            <button
              type="button"
              className="image-manager__remove"
              onClick={() => handleRemove(i)}
              title="Remove image"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

export default ImageManager;