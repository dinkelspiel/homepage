"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, type ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent } from "~/components/ui/dialog";

const ImageWheel = ({
  images,
  children,
}: {
  images: { src: string; alt: string }[];
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setImage(image > 0 ? image - 1 : image);
      } else if (event.key === "ArrowRight") {
        setImage(image < images.length - 1 ? image + 1 : image);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [image, images.length]);

  return (
    <>
      <button onClick={() => setOpen(true)}>{children}</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={
            "h-fit max-h-[80vh] w-fit max-w-[90vw] overflow-clip rounded-lg border-0 bg-transparent p-0"
          }
        >
          <Image
            src={images[image]!.src}
            alt={images[image]!.alt}
            width={3000}
            height={3000}
            className="h-fit max-h-[80vh] w-fit max-w-[90vw]"
          />
          {image > 0 && (
            <Button
              onClick={() => setImage(image > 0 ? image - 1 : image)}
              variant={"outline"}
              className="absolute left-4 top-1/2 -translate-y-1/2"
            >
              <ChevronLeft />
              <div className="sr-only">Go Left</div>
            </Button>
          )}
          {image < images.length - 1 && (
            <Button
              onClick={() =>
                setImage(image < images.length - 1 ? image + 1 : image)
              }
              variant={"outline"}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <ChevronRight />
              <div className="sr-only">Go Right</div>
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageWheel;
