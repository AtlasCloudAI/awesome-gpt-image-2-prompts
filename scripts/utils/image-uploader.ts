import fetch from 'node-fetch';
import type { Media } from './cms-client.js';

const CMS_HOST = process.env.CMS_HOST;
const CMS_API_KEY = process.env.CMS_API_KEY;

/**
 * Upload image to CMS
 * @param imageUrl Original image URL
 * @returns CMS media object
 */
export async function uploadImageToCMS(imageUrl: string): Promise<Media> {
  try {
    // Download image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1].split('?')[0] || 'image.jpg';

    // Create FormData
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: contentType });
    formData.append('file', blob, filename);

    // Upload to CMS
    const uploadResponse = await fetch(`${CMS_HOST}/api/media`, {
      method: 'POST',
      headers: {
        'Authorization': `users API-Key ${CMS_API_KEY}`,
      },
      body: formData as any,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload image: ${uploadResponse.statusText} - ${errorText}`);
    }

    const data = await uploadResponse.json() as { doc: Media };
    const media = data.doc;
     
    return media;
  } catch (error) {
    console.error('Error uploading image to CMS:', error);
    // If upload fails, throw error instead of returning original URL
    // The caller should handle the error
    throw error;
  }
}
