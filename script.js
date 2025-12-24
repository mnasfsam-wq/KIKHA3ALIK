// 1. قاعدة بيانات الكوبونات (تعدلها من هنا)
const myCoupons = {
    "MOSSLIM-10K": 10000,
    "LIKES-FREE-2025": 5000,
    "START-500": 500
};

// 2. اعتراض طلبات الـ fetch لجعل الكود يعمل بدون سيرفر (للمعاينة على GitHub)
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
    const urlStr = typeof url === 'string' ? url : url.toString();

    // فحص الكوبون
    if (urlStr.includes('/check-coupon')) {
        const params = new URLSearchParams(urlStr.split('?')[1]);
        const code = params.get('code');
        if (myCoupons[code]) {
            return { json: async () => ({ valid: true, likes: myCoupons[code] }) };
        }
        return { json: async () => ({ valid: false, message: "كود غير صالح!" }) };
    }

    // إرسال اللايكات (محاكاة النجاح)
    if (urlStr.includes('/likes') || urlStr.includes('/info')) {
        return { 
            json: async () => ({ 
                success: true, 
                message: "تم إرسال اللايكات بنجاح إلى حسابك!",
                player: { nickname: "Mosslim Gamer", liked: 999, region: "ME", level: 65 }
            }) 
        };
    }
    return originalFetch(url, options);
};

// 3. منطق التفاعل مع الواجهة
const couponInput = document.getElementById('coupon');
const couponFeedback = document.getElementById('couponFeedback');

couponInput.addEventListener('input', async function() {
    const code = this.value.trim();
    if (code.length < 4) return;

    const res = await fetch(`/check-coupon?code=${encodeURIComponent(code)}`);
    const data = await res.json();

    couponFeedback.classList.remove('hidden');
    if (data.valid) {
        this.style.borderColor = "#22c55e";
        couponFeedback.innerHTML = `<span class="text-green-400">كوبون مفعّل: تم إضافة ${data.likes} لايك!</span>`;
    } else {
        this.style.borderColor = "#ef4444";
        couponFeedback.innerHTML = `<span class="text-red-400">${data.message}</span>`;
    }
});

document.getElementById('likesForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const resultArea = document.getElementById('resultArea');
    const statusHeader = document.getElementById('statusHeader');
    const responseText = document.getElementById('responseText');

    resultArea.classList.remove('hidden');
    statusHeader.innerHTML = "جاري المعالجة...";
    
    // محاكاة وقت الإرسال
    setTimeout(async () => {
        const res = await fetch('/likes');
        const data = await res.json();
        statusHeader.innerHTML = "✅ اكتملت العملية";
        responseText.textContent = data.message;
        Swal.fire('تم بنجاح!', 'تم إرسال اللايكات إلى حسابك', 'success');
    }, 2000);
});
