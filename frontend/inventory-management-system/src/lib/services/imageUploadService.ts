// Image Upload Service
// This service handles image uploads and can be extended to support cloud storage

export interface ImageUploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
}

export class ImageUploadService {
  private static instance: ImageUploadService;

  public static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService();
    }
    return ImageUploadService.instance;
  }

  /**
   * Upload image file and return a URL
   * Currently converts to base64, but can be extended to upload to cloud storage
   */
  async uploadImage(file: File): Promise<ImageUploadResult> {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('File must be an image'));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('File size must be less than 5MB'));
        return;
      }

      const reader = new FileReader();

      reader.onload = e => {
        const result = e.target?.result as string;
        if (result) {
          resolve({
            url: result,
            width: 0, // Could be extracted from image metadata
            height: 0, // Could be extracted from image metadata
          });
        } else {
          reject(new Error('Failed to read file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload image to cloud storage (placeholder for future implementation)
   * This would integrate with services like Cloudinary, AWS S3, etc.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadToCloud(_file: File): Promise<ImageUploadResult> {
    // Cloud upload implementation would go here
    // Example with Cloudinary:
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('upload_preset', 'your_upload_preset');
    //
    // const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
    //   method: 'POST',
    //   body: formData,
    // });
    //
    // const data = await response.json();
    // return {
    //   url: data.secure_url,
    //   publicId: data.public_id,
    //   width: data.width,
    //   height: data.height,
    // };

    throw new Error('Cloud upload not implemented yet');
  }

  /**
   * Delete image from cloud storage (placeholder for future implementation)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteFromCloud(_publicId: string): Promise<void> {
    // Cloud deletion implementation would go here
    // Example with Cloudinary:
    // await fetch(`https://api.cloudinary.com/v1_1/your_cloud_name/image/destroy`, {
    //   method: 'POST',
    //   body: JSON.stringify({ public_id: publicId }),
    //   headers: { 'Content-Type': 'application/json' },
    // });

    throw new Error('Cloud deletion not implemented yet');
  }

  /**
   * Get image dimensions from file
   */
  getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  /**
   * Resize image to specified dimensions
   */
  resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and resize
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          blob => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

export const imageUploadService = ImageUploadService.getInstance();
