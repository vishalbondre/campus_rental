const BACKEND = 'http://localhost:8080/api';

export function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;   // already absolute
    return `${BACKEND}${path}`;                 // prepend backend base
}