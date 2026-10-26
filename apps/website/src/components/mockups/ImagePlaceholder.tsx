import { classes } from "@/utils/classes";

// Neutral, clearly labelled box for images that don't exist yet
const ImagePlaceholder = ({
  label = "Image placeholder",
  className,
}: {
  label?: string;
  className?: string;
}) => (
  <div
    role="img"
    aria-label={label}
    className={classes(
      "flex items-center justify-center rounded-xl border-2 border-dashed border-alveus-green-300 bg-alveus-green-100 p-4 text-center text-sm text-alveus-green-700",
      className,
    )}
  >
    {label}
  </div>
);

export default ImagePlaceholder;
