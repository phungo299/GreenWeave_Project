/**
 * FlipGallery - Hiệu ứng gallery dạng flip
 * Dựa trên mẫu code từ Chris Bolson
 */

export default function initFlipGallery(containerId, images) {
    // Preload tất cả hình ảnh trước khi khởi tạo gallery
    const preloadImages = (images) => {
        return new Promise((resolve) => {
            let loadedCount = 0;
            const totalImages = images.length;
            
            // Kiểm tra nếu ảnh đã được preload trong head
            const preloadedUrls = Array.from(document.querySelectorAll('link[rel="preload"][as="image"]'))
                .map(link => link.href);
                
            // Tạo các phần tử Image để preload
            images.forEach((img) => {
                // Kiểm tra xem hình ảnh đã preload trong head chưa
                if (preloadedUrls.some(url => url.includes(img.url))) {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                    return;
                }
                
                const image = new Image();
                
                // Đặt onload trước khi gán src để tránh racing condition
                image.onload = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                };
                
                image.onerror = () => {
                    loadedCount++;
                    console.error(`Không thể tải hình ảnh: ${img.url}`);
                    if (loadedCount === totalImages) {
                        resolve();
                    }
                };
                
                // Thêm timestamp để tránh cache
                image.src = `${img.url}${img.url.includes('?') ? '&' : '?'}t=${Date.now()}`;
            });
            
            // Nếu không có hình ảnh nào, vẫn phải resolve promise
            if (totalImages === 0) {
                resolve();
            }
            
            // Fallback nếu lâu quá 5 giây vẫn chưa load xong
            setTimeout(() => {
                if (loadedCount < totalImages) {
                    console.warn('Timeout khi preload hình ảnh, tiếp tục với phần đã tải');
                    resolve();
                }
            }, 5000);
        });
    };

    const FLIP_SPEED = 750;
    let flipTiming = {
        duration: FLIP_SPEED,
        iterations: 1
    };

    // flip xuống
    const flipAnimationTop = [
        { transform: "rotateX(0)" },
        { transform: "rotateX(-90deg)" },
        { transform: "rotateX(-90deg)" }
    ];
    
    const flipAnimationBottom = [
        { transform: "rotateX(90deg)" },
        { transform: "rotateX(90deg)" },
        { transform: "rotateX(0)" }
    ];

    // flip lên
    const flipAnimationTopReverse = [
        { transform: "rotateX(-90deg)" },
        { transform: "rotateX(-90deg)" },
        { transform: "rotateX(0)" }
    ];
    
    const flipAnimationBottomReverse = [
        { transform: "rotateX(0)" },
        { transform: "rotateX(90deg)" },
        { transform: "rotateX(90deg)" }
    ];

    // selectors
    const flipGallery = document.getElementById(containerId);
    
    if (!flipGallery) {
        console.error(`Không tìm thấy element với id ${containerId}`);
        return;
    }
    
    const flipUnite = flipGallery.querySelectorAll(".unite");
    let currentIndex = 0;
    let autoFlipInterval = null;
    let isInitialized = false;

    // cập nhật gallery
    function updateGallery(currentIndex, isReverse = false) {
        // xác định hướng
        const topAnimation = isReverse ? flipAnimationTopReverse : flipAnimationTop;
        const bottomAnimation = isReverse ? flipAnimationBottomReverse : flipAnimationBottom;

        // animation flip
        flipGallery.querySelector(".overlay-top").animate(topAnimation, flipTiming);
        flipGallery.querySelector(".overlay-bottom").animate(bottomAnimation, flipTiming);

        // ẩn title
        flipGallery.style.setProperty("--title-y", "-1rem");
        flipGallery.style.setProperty("--title-opacity", 0);
        flipGallery.setAttribute("data-title", "");

        // Cập nhật hình ảnh
        flipUnite.forEach((el, idx) => {
            let delay;
            if (isReverse) {
                delay = idx === 1 || idx === 2 ? 0 : FLIP_SPEED - 200;
            } else {
                delay = idx === 1 || idx === 2 ? FLIP_SPEED - 200 : 0;
            }

            setTimeout(() => setActiveImage(el, currentIndex), delay);
        });

        // cập nhật và hiển thị title mới
        setTimeout(() => setImageTitle(currentIndex), FLIP_SPEED * 0.5);
    }

    // thiết lập hình ảnh hiện tại
    function setActiveImage(el, index) {
        el.style.backgroundImage = `url("${images[index].url}")`;
    }

    // thiết lập tiêu đề hình ảnh và hiển thị
    function setImageTitle(index) {
        flipGallery.setAttribute("data-title", images[index].title);
        flipGallery.style.setProperty("--title-y", "0");
        flipGallery.style.setProperty("--title-opacity", 1);
    }

    // cập nhật chỉ số hình ảnh và flip gallery
    function updateIndex(increment) {
        const newIndex = Number(increment);
        const isReverse = newIndex < 0;
        currentIndex = (currentIndex + newIndex + images.length) % images.length;
        updateGallery(currentIndex, isReverse);
    }

    // khởi tạo hình ảnh đầu tiên (không có animation)
    function defineFirstImg() {
        flipUnite.forEach((el) => {
            setActiveImage(el, currentIndex);
        });
        setImageTitle(currentIndex);
    }

    // thiết lập sự kiện cho nút điều hướng
    function setupNavButtons() {
        const galleryNavButtons = document.querySelectorAll(`#${containerId} + .gallery-nav [data-gallery-nav]`);
        galleryNavButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                updateIndex(btn.dataset.galleryNav);
                
                // Reset auto flip khi người dùng nhấn nút
                if (autoFlipInterval) {
                    clearInterval(autoFlipInterval);
                    startAutoFlip();
                }
            });
        });
    }

    // bắt đầu tự động flip
    function startAutoFlip(interval = 5000) {
        autoFlipInterval = setInterval(() => {
            updateIndex(1);
        }, interval);
    }

    // khởi tạo sau khi đã preload hình ảnh
    function initialize() {
        if (isInitialized) return;
        
        // Thêm class loading và xóa sau khi tải xong
        flipGallery.classList.add('gallery-loading');
        
        preloadImages(images).then(() => {
            flipGallery.classList.remove('gallery-loading');
            defineFirstImg();
            setupNavButtons();
            startAutoFlip();
            isInitialized = true;
        });
    }

    // Bắt đầu khởi tạo
    initialize();

    // dọn dẹp khi component unmount
    return function cleanup() {
        if (autoFlipInterval) {
            clearInterval(autoFlipInterval);
        }
    };
} 