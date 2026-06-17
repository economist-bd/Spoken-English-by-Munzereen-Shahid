const cacheName = 'book-v1';
const assets = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './book.pdf', // বইটি অবশ্যই ক্যাশ করতে হবে
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'
];

// ইন্সটল ইভেন্ট (ফাইলগুলো ক্যাশ মেমোরিতে সেভ করা)
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('caching files');
            return cache.addAll(assets);
        })
    );
});

// এক্টিভেট ইভেন্ট
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => {
                if(key !== cacheName) return caches.delete(key);
            }));
        })
    );
});

// ফেচ ইভেন্ট (ইন্টারনেট না থাকলে ক্যাশ থেকে ফাইল দেওয়া)
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(res => {
            return res || fetch(e.request);
        })
    );
});
