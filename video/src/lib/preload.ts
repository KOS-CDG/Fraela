import { useEffect, useRef, useState } from "react";
import { useDelayRender } from "remotion";

// Remotion waits for <Img> elements, but not for CSS background images.
// Photos used as backgrounds are decoded here first, and the frame waits for them.
export const usePreloadedImages = (urls: string[]) => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Decoding background photos"));
  // Holding the decoded images keeps the browser from discarding them.
  const images = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    images.current = urls.map((url) => {
      const image = new Image();
      image.src = url;
      return image;
    });
    Promise.all(images.current.map((image) => image.decode()))
      .then(() => continueRender(handle))
      .catch((error) => cancelRender(error));
    // The list of photos is fixed for the life of a scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
