export function calculateOptimalImageSize(
  originalWidth,
  originalHeight,
  maxWidth,
  maxHeight,
  reductionFactor
) {
  const originalAspectRatio = originalWidth / originalHeight;
  const maxAspectRatio = maxWidth / maxHeight;

  let newWidth, newHeight;

  if (originalAspectRatio > maxAspectRatio) {
    // רוחב התמונה המקורי גדול ביחס לרוחב המסך
    newWidth = maxWidth;
    newHeight = maxWidth / originalAspectRatio;
  } else {
    // גובה התמונה המקורי גדול ביחס לגובה המסך
    newHeight = maxHeight;
    newWidth = maxHeight * originalAspectRatio;
  }

  if (newHeight > originalHeight) {
    console.log("here");

    newWidth *= reductionFactor;
    newHeight *= reductionFactor;
  }

  return { width: newWidth, height: newHeight };
}
