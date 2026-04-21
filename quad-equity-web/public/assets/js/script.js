// ====== Header Fixed On Scroll ====== //
window.addEventListener("scroll", function () {
    const header = document.querySelector(".header-section");

    if (window.scrollY >= 5) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
});

var swiper = new Swiper(".hero-slider", {
    effect: "fade",
    fadeEffect: {
        crossFade: true
    },
    loop: true,
    autoplay: {
        delay: 2000,
        disableOnInteraction: false,
    },
    speed: 1000,
});
const btn = document.getElementById("scrollBtn");
const content = document.getElementById("bannerContent");

btn.addEventListener("click", function () {
    if (!content.classList.contains("active")) {
        content.classList.add("active");
        content.style.height = content.scrollHeight + "px";
    } else {
        content.style.height = "0px";
        content.classList.remove("active");
    }

    content.scrollIntoView({ behavior: "smooth" });
});