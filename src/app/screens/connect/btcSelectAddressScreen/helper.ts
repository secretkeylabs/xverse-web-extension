export interface WebManifest {
  icons?: { src: string; sizes?: string }[];
}

export async function getAppIconFromWebManifest(url: string): Promise<string> {
  try {
    // Validate URL format
    if (!/^https?:\/\/.*/.test(url)) {
      throw new Error('Invalid URL format');
    }

    // Fetch the web manifest
    const response = await fetch(`${url}/manifest.json`);

    // Check for successful response
    if (!response.ok) {
      throw new Error(`Failed to fetch web manifest. Status: ${response.status}`);
    }

    const manifest: WebManifest = await response.json();
    // Ensure the manifest contains the 'icons' property
    if (!manifest.icons || !Array.isArray(manifest.icons)) {
      throw new Error('Web manifest is missing the icons property');
    }

    // Extract the app icons' URLs
    const icons = manifest.icons.filter((icon) => icon.sizes === '48x48');

    return `${url}${icons[0].src}`;
  } catch (error: any) {
    if (error.message.includes('Failed to fetch web manifest')) {
      const response = await fetch(`${url}/manifest.webmanifest`);
      if (!response.ok) {
        return '';
      }
      const manifest: WebManifest = await response.json();
      // Ensure the manifest contains the 'icons' property
      if (!manifest.icons || !Array.isArray(manifest.icons)) {
        throw new Error('Web manifest is missing the icons property');
      }

      // Extract the app icons' URLs
      const icons = manifest.icons.filter((icon) => icon.sizes === '48x48');
      console.log('🚀 ~ file: helper.ts:44 ~ getAppIconFromWebManifest ~ icons:', icons);

      return `${url}/${icons[0].src}`;
    }
    return '';
  }
}
