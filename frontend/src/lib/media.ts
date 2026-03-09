export function captureSnapshot(
  video: HTMLVideoElement,
  label: string,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Could not get canvas context"));

    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Failed to create image snapshot"));
      resolve(new File([blob], `${label}_face.png`, { type: "image/png" }));
    }, "image/png");
  });
}

export function stopRecorderAndGetFile(
  recorder: MediaRecorder,
  chunks: Blob[],
  label: string,
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (recorder.state === "inactive") {
      // Already stopped — just assemble what we have
      return assembleFile(chunks, label, resolve, reject);
    }

    // Set onstop first, THEN stop, so we never miss the event
    recorder.onstop = () => {
      assembleFile(chunks, label, resolve, reject);
      recorder.onstop = null;
    };

    recorder.stop();
  });
}

function assembleFile(
  chunks: Blob[],
  label: string,
  resolve: (f: File) => void,
  reject: (e: Error) => void,
) {
  if (chunks.length === 0) {
    return reject(new Error("Recorded video is empty — no chunks captured"));
  }

  // Use the mimeType from the first chunk if available, fall back to webm
  const mimeType = chunks[0].type || "video/webm";
  const ext = mimeType.includes("mp4") ? "mp4" : "webm";
  const blob = new Blob(chunks, { type: mimeType });

  if (blob.size === 0) {
    return reject(new Error("Recorded video blob is zero bytes"));
  }

  resolve(new File([blob], `${label}_video.${ext}`, { type: mimeType }));
}
