document.addEventListener('DOMContentLoaded', () => {
    const monthDisplay = document.getElementById('current-month-display');
    const calendarDays = document.getElementById('calendar-days');
    const displayDate = document.getElementById('res-date');
    const displayTime = document.getElementById('res-time');
    const bookNowBtn = document.querySelector('.btn-book');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');

    // আজকের তারিখ নির্ধারণ (২০ মার্চ ২০২৬)
    let today = new Date(); 
    today.setHours(0, 0, 0, 0);

    let viewDate = new Date(today.getFullYear(), today.getMonth(), 1); 

    const months = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];

    function renderCalendar() {
        if(!calendarDays) return; // এরর হ্যান্ডলিং
        calendarDays.innerHTML = "";
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        if(monthDisplay) monthDisplay.innerText = `${months[month]} ${year}`;

        // ১. ক্যালেন্ডার হেডার তৈরি (Mo-Su)
        const daysHeader = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
        daysHeader.forEach(day => {
            const span = document.createElement('span');
            span.innerText = day;
            span.style.fontWeight = "bold";
            calendarDays.appendChild(span);
        });

        // ২. মাসের প্রথম দিন কোন বারে শুরু হয়েছে
        let firstDay = new Date(year, month, 1).getDay();
        let shift = firstDay === 0 ? 6 : firstDay - 1; 

        // ৩. ফাঁকা ঘর পূরণ
        for (let x = 0; x < shift; x++) {
            calendarDays.appendChild(document.createElement('span'));
        }

        // ৪. তারিখগুলো রেন্ডার করা
        const lastDay = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= lastDay; i++) {
            const dateSpan = document.createElement('span');
            dateSpan.innerText = i;
            
            let checkDate = new Date(year, month, i);

            // অতীত তারিখ ব্লক করার লজিক
            if (checkDate < today) {
                dateSpan.classList.add('disabled');
                dateSpan.style.color = "#ccc";
                dateSpan.style.cursor = "not-allowed";
            } else {
                dateSpan.style.cursor = "pointer";
                dateSpan.addEventListener('click', () => {
                    document.querySelector('.calendar-grid span.active')?.classList.remove('active');
                    dateSpan.classList.add('active');
                    
                    // Scheduling বক্সে আপডেট
                    const formattedDate = `${i.toString().padStart(2, '0')}.${(month + 1).toString().padStart(2, '0')}.${year}`;
                    if(displayDate) displayDate.innerText = formattedDate;
                });

                // আজকের দিনটি অটো হাইলাইট করা (ঐচ্ছিক)
                if(checkDate.getTime() === today.getTime()){
                    dateSpan.style.border = "1px solid #6a8e4e";
                }
            }
            calendarDays.appendChild(dateSpan);
        }

        // ৫. অতীত মাসে যাওয়ার বাটন ডিজেবল করা
        if (prevBtn) {
            if (viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth()) {
                prevBtn.style.visibility = "hidden";
            } else {
                prevBtn.style.visibility = "visible";
            }
        }
    }

    // মাস পরিবর্তন
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            viewDate.setMonth(viewDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            viewDate.setMonth(viewDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // টাইম স্লট নির্বাচন
    document.querySelectorAll('.slot input').forEach(slot => {
        slot.addEventListener('change', (e) => {
            document.querySelector('.slot.selected')?.classList.remove('selected');
            e.target.parentElement.classList.add('selected');
            if(displayTime) displayTime.innerText = e.target.nextElementSibling.innerText;
        });
    });

    // বুক নাও বাটন ও পেমেন্ট মডাল
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', () => {
            if (displayDate && displayDate.innerText === "Select Date") {
                alert("Please select a date from the calendar first!");
                return;
            }
            
            const modal = document.createElement('div');
            modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:9999;";
            modal.innerHTML = `
                <div style="background:#fff; padding:30px; border-radius:15px; text-align:center; max-width:400px; width:90%;">
                    <h3 style="color:#6a8e4e;">Secure Payment</h3>
                    <p>Booking for: <b>${displayDate ? displayDate.innerText : ''}</b> at <b>${displayTime ? displayTime.innerText : ''}</b></p>
                    <img src="img/pay.png" style="width:100%; margin:20px 0;" alt="Payment Methods">
                    <button id="close-modal" style="background:#4caf50; color:#fff; border:none; padding:12px 25px; border-radius:30px; cursor:pointer; font-weight:bold; width:100%;">Confirm & Pay Now</button>
                </div>
            `;
            document.body.appendChild(modal);
            document.getElementById('close-modal').onclick = () => modal.remove();
        });
    }

    renderCalendar();
});

// === Foodie Hub Core Logic ===

// ১. সংশোধিত addToCart ফাংশন (যাতে সব পেজে কাজ করে)
window.addToCart = function(item, price, img) {
    let pName, pPrice, pImg;

    // যদি অবজেক্ট আকারে ডেটা আসে (যেমন index বা offers পেজ থেকে)
    if (typeof item === 'object' && item !== null) {
        pName = item.name;
        pPrice = parseFloat(item.price);
        pImg = item.img;
    } else {
        // যদি মেনু পেজ থেকে ৩টি আলাদা প্যারামিটার আসে
        pName = item;
        pPrice = parseFloat(price);
        pImg = img;
    }

    if (!pName) return;

    let cart = JSON.parse(localStorage.getItem('foodCart')) || [];
    const existingItem = cart.find(i => i.name === pName);
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ name: pName, price: pPrice, img: pImg, qty: 1 });
    }
    
    localStorage.setItem('foodCart', JSON.stringify(cart));
    updateCartBadge();
    alert(pName + " has been added to your cart!");
};

// ২. আপডেট কার্ট ব্যাজ
function updateCartBadge() {
    let cart = JSON.parse(localStorage.getItem('foodCart')) || [];
    const badge = document.getElementById('cart-count');
    
    if (badge) {
        if (cart.length > 0) {
            badge.innerText = cart.length;
            badge.style.display = "inline-block";
        } else {
            badge.style.display = "none";
        }
    }
}

// ৩. কার্ট আইটেম প্রদর্শন
function displayCartItems() {
    const displayArea = document.getElementById('cart-items-display');
    if (!displayArea) return;

    let cart = JSON.parse(localStorage.getItem('foodCart')) || [];
    displayArea.innerHTML = "";

    if (cart.length === 0) {
        displayArea.innerHTML = `<div style="padding: 40px; text-align: center;"><h3>Your cart is currently empty!</h3></div>`;
        updateTotals(0);
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = (item.price * item.qty).toFixed(2);
        displayArea.innerHTML += `
            <div class="cart-item">
                <div class="product-info">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="product-details">
                        <h4>${item.name}</h4>
                        <p class="p-id">#ID-${index + 50124}</p>
                    </div>
                </div>
                <div class="product-price">$${item.price.toFixed(2)}</div>
                <div class="product-qty">
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                    <span class="qty-value">${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                </div>
                <div class="product-total">$${itemTotal}</div>
                <button class="remove-item" onclick="deleteItem(${index})"><i class="fa-solid fa-xmark"></i></button>
            </div>`;
    });
    calculateTotal(cart);
}

function updateQty(index, change) {
    let cart = JSON.parse(localStorage.getItem('foodCart'));
    cart[index].qty += change;
    if (cart[index].qty < 1) cart[index].qty = 1;
    localStorage.setItem('foodCart', JSON.stringify(cart));
    displayCartItems();
}

function deleteItem(index) {
    let cart = JSON.parse(localStorage.getItem('foodCart'));
    cart.splice(index, 1);
    localStorage.setItem('foodCart', JSON.stringify(cart));
    displayCartItems();
    updateCartBadge();
}

function calculateTotal(cart) {
    let total = 0;
    cart.forEach(item => { total += item.price * item.qty; });
    updateTotals(total);
}

function updateTotals(amount) {
    const formatted = `$${amount.toFixed(2)}`;
    const subtotalEl = document.getElementById('subtotal-val');
    const totalEl = document.getElementById('total-val');
    const btnTotalEl = document.getElementById('btn-total');
    if (subtotalEl) subtotalEl.innerText = formatted;
    if (totalEl) totalEl.innerText = formatted;
    if (btnTotalEl) btnTotalEl.innerText = formatted;
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    displayCartItems();
    
    // চেকআউট বাটন লজিক
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            const totalValEl = document.getElementById('total-val');
            if (totalValEl) {
                localStorage.setItem('orderTotal', totalValEl.innerText);
                window.location.href = "checkout.html";
            }
        };
    }
});

// --- Firebase Storage ও Firestore (আপনার আগের লজিক) ---
const storage = typeof getStorage !== 'undefined' ? getStorage(app) : null;
let currentEditId = null;

window.openModal = (type, dataStr = null) => {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    modal.style.display = "flex";
    if (type === 'edit' && dataStr) {
        const data = JSON.parse(decodeURIComponent(dataStr));
        currentEditId = data.id;
        document.getElementById('modalTitle').innerText = "Edit Product";
        document.getElementById('m-name').value = data.name;
        document.getElementById('m-price').value = data.price;
        document.getElementById('m-offer').value = data.offer || 0;
        document.getElementById('m-about').value = data.about || "";
        document.getElementById('m-img-old-url').value = data.img; 
        document.getElementById('saveBtn').innerText = "Update Product";
    } else {
        currentEditId = null;
        document.getElementById('modalTitle').innerText = "Add New Product";
        document.getElementById('saveBtn').innerText = "Submit Product";
        document.getElementById('m-name').value = ""; document.getElementById('m-price').value = "";
        document.getElementById('m-offer').value = "0"; document.getElementById('m-about').value = "";
    }
};

window.closeModal = () => {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = "none";
};

const saveOrUpdateProduct = async () => {
    const name = document.getElementById('m-name').value;
    const price = document.getElementById('m-price').value;
    const offer = document.getElementById('m-offer').value;
    const about = document.getElementById('m-about').value;
    const imageFile = document.getElementById('m-img-file').files[0];
    const statusEl = document.getElementById('upload-status');
    const oldImageUrl = document.getElementById('m-img-old-url')?.value;

    if (!name || !price) { alert("Please fill name and price!"); return; }
    if (!imageFile && !currentEditId) { alert("Please select an image file!"); return; }

    let finalImageUrl = oldImageUrl || "";
    try {
        const saveBtn = document.getElementById('saveBtn');
        if(saveBtn) saveBtn.disabled = true;
        if (imageFile && storage) {
            const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            finalImageUrl = await getDownloadURL(snapshot.ref);
        }
        const productData = { name, price: parseFloat(price), offer: parseInt(offer) || 0, about, img: finalImageUrl, updatedAt: new Date().getTime() };
        if (currentEditId) {
            await updateDoc(doc(db, "products", currentEditId), productData);
            alert("Product Updated!");
        } else {
            productData.createdAt = new Date().getTime();
            await addDoc(collection(db, "products"), productData);
            alert("Product Added Successfully!");
        }
        if(saveBtn) saveBtn.disabled = false; closeModal();
    } catch (error) { alert("Error: " + error.message); if(document.getElementById('saveBtn')) document.getElementById('saveBtn').disabled = false; }
};

document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'saveBtn') saveOrUpdateProduct();
});

const renderProducts = () => {
    const listBody = document.getElementById('product-list-body');
    if (!listBody) return;
    const q = query(collection(db, "products"), orderBy("updatedAt", "desc"));
    onSnapshot(q, (snapshot) => {
        listBody.innerHTML = "";
        snapshot.forEach((snapshotDoc) => {
            const data = snapshotDoc.data();
            const id = snapshotDoc.id;
            const dataJSON = encodeURIComponent(JSON.stringify({ id, ...data }));
            listBody.innerHTML += `<tr><td>#${id.substring(0, 5)}</td><td><img src="${data.img}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;"></td><td><b>${data.name}</b></td><td>৳${data.price}</td><td>${data.offer}%</td><td><i class="fa-solid fa-pen" onclick="openModal('edit', '${dataJSON}')" style="cursor:pointer;color:blue;margin-right:10px;"></i><i class="fa-solid fa-trash" onclick="deleteProduct('${id}')" style="cursor:pointer;color:red;"></i></td></tr>`;
        });
    });
};

window.deleteProduct = async (id) => {
    if (confirm("Delete this product?")) await deleteDoc(doc(db, "products", id));
};

renderProducts();

document.getElementById('search-input').addEventListener('keyup', function() {
    let filter = this.value.toLowerCase(); 
    let products = document.querySelectorAll('.pro'); 

    products.forEach(product => {
        let name = product.querySelector('h5') ? product.querySelector('h5').innerText.toLowerCase() : "";
        let category = product.querySelector('span') ? product.querySelector('span').innerText.toLowerCase() : "";
        
        if (name.includes(filter) || category.includes(filter)) {
            product.style.display = ""; 
        } else {
            product.style.display = "none"; 
        }
    });
});


