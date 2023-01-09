// Example code from react-popper-tooltip

import React from "react";

const Icons = ({ src, alt }: { src: string, alt: string }) => (
  <img
    style={{
      objectFit: "contain",
    }}
    src={src}
    alt={alt}
  />
);

export default Icons;
