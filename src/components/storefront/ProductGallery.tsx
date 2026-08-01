"use client";

import { useState, useMemo } from "react";
import ProductImagePreview, { getProductGalleryImages } from "./ProductImagePreview";

interface ProductGalleryProps {
  mainImage: string;
  productName: string;
  slug: string;
}

export default function ProductGallery({
  mainImage,
  productName,
  slug,
}: ProductGalleryProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Use the shared gallery config from ProductImagePreview
  const images = useMemo(
    () => getProductGalleryImages(mainImage, productName, slug),
    [mainImage, productName, slug]
  );

  const openPreview = (index: number) => {
    setActiveIndex(index);
    setPreviewOpen(true);
  };

  return (
    <>
      <div>
        {/* Main image - clickable */}
        <button
          onClick={() => openPreview(0)}
          className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xl relative overflow-hidden group cursor-zoom-in"
          aria-label="Bild vergrößern"
        >
          <img
            src={mainImage}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Zoom icon overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 shadow-lg">
              <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {images.slice(0, 10).map((image, index) => (
              <button
                key={index}
                onClick={() => openPreview(index)}
                className={`aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-200 hover:border-gray-900 ${
                  index === activeIndex && !previewOpen
                    ? "border-gray-900"
                    : "border-transparent"
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide thumbnail if image fails to load
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </button>
            ))}
            {images.length > 10 && (
              <button
                onClick={() => openPreview(0)}
                className="aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-gray-900 transition-all duration-200 flex items-center justify-center text-gray-500 text-sm font-medium"
              >
                +{images.length - 10}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Full-screen preview */}
      {previewOpen && (
        <ProductImagePreview
          images={images}
          initialIndex={activeIndex}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}
