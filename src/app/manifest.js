export default function manifest() {
  return {
    name: 'PG Owner SaaS',
    short_name: 'PG Owner',
    description: 'Comprehensive PG & Hostel Management SaaS Platform',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F5F3EE',
    theme_color: '#16213E',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
