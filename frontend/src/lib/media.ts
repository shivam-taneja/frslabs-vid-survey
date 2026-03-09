export function captureSnapshot(
  video: HTMLVideoElement,
  label: string,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Could not get canvas context"));

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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
    recorder.onstop = () => {
      try {
        const blob = new Blob(chunks, { type: "video/webm" });
        if (blob.size === 0) {
          return reject(new Error("Recorded video is empty"));
        }
        resolve(
          new File([blob], `${label}_video.webm`, { type: "video/webm" }),
        );
      } catch (err) {
        reject(err);
      }
    };

    recorder.stop();
  });
}
