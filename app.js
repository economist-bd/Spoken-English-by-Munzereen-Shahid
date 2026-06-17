const url = 'book.pdf'; 

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumPending = null;

const scale = 2.0, // রেজোলিউশন ভালো করার জন্য স্কেল বাড়ালাম
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d'),
    bookContainer = document.querySelector('#book-page');

// পেজ রেন্ডার ফাংশন
const renderPage = num => {
    pageIsRendering = true;

    pdfDoc.getPage(num).then(page => {
        // ক্যানভাস সাইজ মোবাইল স্ক্রিন অনুযায়ী সেট করা
        const viewport = page.getViewport({ scale: window.innerWidth < 600 ? 0.6 : 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport
        };
        
        const renderTask = page.render(renderCtx);

        renderTask.promise.then(() => {
            pageIsRendering = false;
            // এনিমেশন ক্লাস সরিয়ে ফেলা যাতে পেজ আবার সোজা হয়
            bookContainer.classList.remove('flip-next');
            
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });

        document.querySelector('#page-num').textContent = `${num} / ${pdfDoc.numPages}`;
    });
};

const queueRenderPage = num => {
    if (pageIsRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
};

// --- নতুন টাচ কন্ট্রোল লজিক ---

const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) return;

    // ১. পাতা ঘোরার এনিমেশন শুরু
    bookContainer.classList.add('flip-next');

    // ২. এনিমেশনের মাঝপথে পেজ পরিবর্তন (৩০০ মিলিসেকন্ড পর)
    setTimeout(() => {
        pageNum++;
        // পেজ লোড হলে রেন্ডার ফাংশনই ক্লাস রিমুভ করবে
        queueRenderPage(pageNum);
    }, 250);
};

const showPrevPage = () => {
    if (pageNum <= 1) return;

    // পেছনের এনিমেশন আসলে দরকার নেই, শুধু পেজ লোড হবে
    // কিন্তু ভিজ্যুয়াল ফিডব্যাক হিসেবে একটু অপাসিটি কমানো যেতে পারে
    canvas.style.opacity = '0.5';
    
    setTimeout(() => {
        pageNum--;
        queueRenderPage(pageNum);
        canvas.style.opacity = '1';
    }, 200);
};

// পিডিএফ লোড
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    renderPage(pageNum);
});

// টাচ ইভেন্ট লিসেনার
document.querySelector('#touch-right').addEventListener('click', showNextPage);
document.querySelector('#touch-left').addEventListener('click', showPrevPage);

// মোবাইল সোয়াইপ সাপোর্ট (Optional: আঙুল ঘষে পাতা উল্টানো)
let touchStartX = 0;
let touchEndX = 0;

document.body.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.body.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) showNextPage(); // বামে সোয়াইপ = পরের পেজ
    if (touchEndX > touchStartX + 50) showPrevPage(); // ডানে সোয়াইপ = আগের পেজ
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
    });
}