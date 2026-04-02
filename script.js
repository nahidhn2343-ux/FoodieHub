document.addEventListener("DOMContentLoaded", function() {
    const bar = document.getElementById('bar');
    const close = document.getElementById('close');
    const nav = document.getElementById('navbar');

    // মেনু ওপেন করার লজিক
    if (bar) {
        bar.onclick = function() {
            nav.classList.add('active');
        };
    }

    // মেনু ক্লোজ করার লজিক
    if (close) {
        close.onclick = function() {
            nav.classList.remove('active');
        };
    }
});