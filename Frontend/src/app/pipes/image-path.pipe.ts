import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imagePath',
  standalone: true,
})
export class ImagePathPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    const fallback = '/assets/images/placeholder.svg';

    if (!value) return fallback;

    // already absolute URL
    if (/^https?:\/\//i.test(value)) return value;

    // already an absolute path under /assets or /images
    if (value.startsWith('/assets/') || value.startsWith('/images/')) return value;

    // starts with a slash but not assets -> prefix /assets
    if (value.startsWith('/')) return `/assets${value}`;

    // otherwise assume it's a filename stored under assets/images
    return `/assets/images/${value}`;
  }
}
