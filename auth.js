import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    orderBy,
    doc,        
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import firebaseConfig from "./firebase-config.js";

// --- ফায়ারবেস ইনিশিয়ালাইজেশন ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ১. Authentication Functions ---
window.handleSignUp = () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-pass').value;
    if(!email || !password) { alert("Please fill all fields"); return; }
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => { alert("Account created!"); window.location.href = "index.html"; })
        .catch((error) => alert(error.message));
};

window.handleLogin = () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;
    if(!email || !password) { alert("Enter email and password"); return; }
    signInWithEmailAndPassword(auth, email, password)
        .then(() => { alert("Login Successful!"); window.location.href = "index.html"; })
        .catch(() => alert("Invalid credentials"));
};

window.handleAdminLogin = () => {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-pass').value;
    if (email === "admin@foodiehub.com" && password === "admin12345") {
        window.location.href = "admin-ds.html"; 
    } else { alert("Access Denied!"); }
};

// --- ২. Order Details Modal ---
window.showOrderDetails = (orderStr) => {
    const order = JSON.parse(decodeURIComponent(orderStr));
    let modal = document.getElementById('detailsModal');
    if(!modal) {
        modal = document.createElement('div');
        modal.id = 'detailsModal';
        modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; justify-content:center; align-items:center; z-index:1000;";
        document.body.appendChild(modal);
    }

    let itemsHTML = "";
    if(order.type === "Table Booking") {
        itemsHTML = `<p><strong>Booking Info:</strong> ${order.total}</p>`;
    } else {
        (order.items || []).forEach(item => {
            itemsHTML += `
                <div style="display:flex; align-items:center; border-bottom:1px solid #eee; padding:10px 0;">
                    <img src="${item.img || 'img/logo1.png'}" style="width:40px; height:40px; border-radius:5px; margin-right:10px;">
                    <div>
                        <p style="margin:0; font-weight:bold;">${item.name}</p>
                        <p style="margin:0; font-size:12px;">৳${item.price} x ${item.qty || 1}</p>
                    </div>
                </div>`;
        });
    }

    modal.innerHTML = `
        <div style="background:white; padding:25px; border-radius:12px; width:90%; max-width:450px; position:relative;">
            <i class="fa-solid fa-xmark" onclick="document.getElementById('detailsModal').style.display='none'" style="position:absolute; top:15px; right:15px; cursor:pointer;"></i>
            <h3>Order Details</h3>
            <div style="font-size:14px;">
                <p><strong>Type:</strong> ${order.type}</p>
                <p><strong>Customer:</strong> ${order.fname} ${order.lname}</p>
                <p><strong>Phone:</strong> ${order.phone}</p>
                <p><strong>Address:</strong> ${order.address || 'N/A'}</p>
                <hr>
                ${itemsHTML}
                <p style="text-align:right; font-weight:bold;">Total: ${order.total || 'N/A'}</p>
            </div>
        </div>
    `;
    modal.style.display = "flex";
};

// --- ৩. Database Actions ---
window.confirmOrder = async (orderId) => {
    try {
        await updateDoc(doc(db, "orders", orderId), { status: "Confirmed" });
        alert("Order Confirmed!");
    } catch (e) { alert("Error: " + e.message); }
};

window.deleteItem = async (id) => {
    if(confirm("Delete this order?")) await deleteDoc(doc(db, "orders", id));
};

// --- ৪. Product Management (Fixed Input Logic) ---
let currentEditId = null;

window.openModal = (type, dataStr = null) => {
    const modal = document.getElementById('productModal');
    if(!modal) return;
    modal.style.display = "flex";

    if (type === 'edit' && dataStr) {
        const data = JSON.parse(decodeURIComponent(dataStr));
        currentEditId = data.id;
        document.getElementById('modalTitle').innerText = "Edit Product";
        document.getElementById('m-name').value = data.name;
        document.getElementById('m-price').value = data.price;
        document.getElementById('m-offer').value = data.offer || 0;
        document.getElementById('m-img').value = data.img; 
        document.getElementById('saveBtn').innerText = "Update Product";
    } else {
        currentEditId = null;
        document.getElementById('modalTitle').innerText = "Add New Product";
        document.getElementById('saveBtn').innerText = "Submit Product";
        document.getElementById('m-name').value = "";
        document.getElementById('m-price').value = "";
        document.getElementById('m-offer').value = "0";
        document.getElementById('m-img').value = "";
    }
};

window.closeModal = () => { document.getElementById('productModal').style.display = "none"; };

// প্রোডাক্ট সেভ করার মেইন ফাংশন (Fix: সরাসরি ইনপুট রিড করা হচ্ছে)
const saveOrUpdateProduct = async () => {
    const nameInput = document.getElementById('m-name');
    const priceInput = document.getElementById('m-price');
    const offerInput = document.getElementById('m-offer');
    const imgInput = document.getElementById('m-img');

    if(!nameInput.value || !priceInput.value || !imgInput.value) { 
        alert("Please fill all fields!"); 
        return; 
    }

    const productData = { 
        name: nameInput.value, 
        price: parseFloat(priceInput.value), 
        offer: parseInt(offerInput.value) || 0, 
        img: imgInput.value, 
        updatedAt: new Date().getTime() 
    };

    try {
        if (currentEditId) { 
            await updateDoc(doc(db, "products", currentEditId), productData); 
            alert("Product Updated Successfully!"); 
        } else { 
            productData.createdAt = new Date().getTime(); 
            await addDoc(collection(db, "products"), productData); 
            alert("New Product Added Successfully!"); 
        }
        closeModal();
    } catch (error) { 
        console.error("Firebase Error:", error);
        alert("Input failed: " + error.message); 
    }
};

// বাটন ক্লিক ইভেন্ট লিসেনার (Fix: নিশ্চিত করা হয়েছে যেন এটি কাজ করে)
document.addEventListener('click', (e) => { 
    if (e.target && e.target.id === 'saveBtn') {
        e.preventDefault();
        saveOrUpdateProduct();
    }
});

window.deleteProduct = async (id) => { if(confirm("Are you sure?")) await deleteDoc(doc(db, "products", id)); };

// --- ৫. মাস্টার রিয়েল-টাইম লিসেনার (Dashboard Stats) ---
const loadDashboardData = () => {
    const liveTable = document.getElementById('live-order-table-body');
    const bookingTable = document.getElementById('booking-table-body');
    const productTable = document.getElementById('product-list-body');
    
    const elements = {
        orderTotal: document.getElementById('total-orders-count'),
        orderDone: document.getElementById('completed-orders-count'),
        orderProc: document.getElementById('in-process-count'),
        bookTotal: document.getElementById('total-bookings-count'),
        bookDone: document.getElementById('confirmed-bookings-count'),
        bookPend: document.getElementById('pending-bookings-count'),
        revTotal: document.getElementById('total-revenue-val'),
        revDone: document.getElementById('completed-amount'),
        revProc: document.getElementById('in-process-amount')
    };

    onSnapshot(query(collection(db, "orders"), orderBy("orderTime", "desc")), (snapshot) => {
        if(liveTable) liveTable.innerHTML = "";
        if(bookingTable) bookingTable.innerHTML = "";

        let stats = { o: { total: 0, c: 0, p: 0 }, b: { total: 0, c: 0, p: 0 }, r: { total: 0, c: 0, p: 0 } };

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            const dataJSON = encodeURIComponent(JSON.stringify(data));
            const isConfirmed = data.status === "Confirmed";
            const priceVal = parseFloat(data.total?.toString().replace(/[^\d.]/g, '') || 0);

            if (data.type === "Food Order") {
                stats.o.total++;
                stats.r.total += priceVal;
                if (isConfirmed) { stats.o.c++; stats.r.c += priceVal; }
                else { stats.o.p++; stats.r.p += priceVal; }

                if (liveTable) {
                    liveTable.innerHTML += `
                        <tr>
                            <td>#${id.substring(0, 5).toUpperCase()}</td>
                            <td onclick="window.showOrderDetails('${dataJSON}')" style="cursor:pointer; color:#3498db;">${data.fname}</td>
                            <td>${data.address || 'N/A'}</td>
                            <td>${data.orderTime}</td>
                            <td><span class="status ${isConfirmed ? 'green' : 'orange'}">${data.status}</span></td>
                            <td>
                                ${!isConfirmed ? `<button onclick="window.confirmOrder('${id}')" style="background:#2ecc71; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Confirm</button>` : ''}
                                <i class="fa-solid fa-trash" onclick="window.deleteItem('${id}')" style="color:#e74c3c; cursor:pointer; margin-left:10px;"></i>
                            </td>
                        </tr>`;
                }
            } else if (data.type === "Table Booking") {
                stats.b.total++;
                if (isConfirmed) stats.b.c++; else stats.b.p++;
                if (bookingTable) {
                    bookingTable.innerHTML += `<tr><td>#${id.substring(0, 5).toUpperCase()}</td><td>${data.fname}</td><td>Booking</td><td>${data.orderTime}</td><td><span class="status ${isConfirmed ? 'green' : 'orange'}">${data.status}</span></td></tr>`;
                }
            }
        });

        if(elements.orderTotal) elements.orderTotal.innerText = stats.o.total;
        if(elements.orderDone) elements.orderDone.innerText = stats.o.c;
        if(elements.orderProc) elements.orderProc.innerText = stats.o.p;
        if(elements.revTotal) elements.revTotal.innerText = `$ ${stats.r.total.toFixed(2)}`;
        if(elements.revDone) elements.revDone.innerText = `$ ${stats.r.c.toFixed(2)}`;
        if(elements.revProc) elements.revProc.innerText = `$ ${stats.r.p.toFixed(2)}`;
    });

    if (productTable) {
        onSnapshot(query(collection(db, "products"), orderBy("updatedAt", "desc")), (snapshot) => {
            productTable.innerHTML = "";
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const id = docSnap.id;
                const pDataJSON = encodeURIComponent(JSON.stringify({id, ...data}));
                productTable.innerHTML += `
                    <tr>
                        <td>#${id.substring(0, 5)}</td>
                        <td><img src="${data.img}" style="width:40px; height:40px; border-radius:5px;"></td>
                        <td><b>${data.name}</b></td>
                        <td>৳${data.price}</td>
                        <td>
                            <i class="fa-solid fa-pen-to-square" onclick="window.openModal('edit', '${pDataJSON}')" style="color:blue; cursor:pointer; margin-right: 10px;"></i>
                            <i class="fa-solid fa-trash" onclick="window.deleteProduct('${id}')" style="color:red; cursor:pointer;"></i>
                        </td>
                    </tr>`;
            });
        });
    }
};

// --- ৬. Sale Analytics & Chart ---
let salesChart;

const setupChart = (weeklyData) => {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (salesChart) salesChart.destroy();

    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
                label: 'Revenue',
                data: weeklyData,
                backgroundColor: '#6ebf8a', 
                borderRadius: 4,
                barThickness: 35
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f5f5f5' },
                    ticks: { stepSize: 20 }
                },
                x: { grid: { display: false } }
            }
        }
    });
};

const loadSaleAnalytics = () => {
    const ui = {
        total: document.getElementById('total-sale-amount'),
        daily: document.getElementById('total-orders-money'),
        comp: document.getElementById('completed-money'),
        proc: document.getElementById('process-money'),
        chartT: document.getElementById('chart-total-amount')
    };

    const selectedYear = document.getElementById('yearFilter')?.value || "2026";
    const selectedMonth = document.getElementById('monthFilter')?.value || "March";

    onSnapshot(query(collection(db, "orders"), orderBy("orderTime", "desc")), (snapshot) => {
        let overAll = 0, dayTotal = 0, compTotal = 0, procTotal = 0;
        let weeklyStats = [0, 0, 0, 0, 0, 0, 0];
        const todayStr = new Date().toISOString().split('T')[0];

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const amount = parseFloat(data.total?.toString().replace(/[^\d.]/g, '') || 0);
            const isConfirmed = data.status === "Confirmed";
            
            const orderDate = new Date(data.orderTime);
            const orderYear = orderDate.getFullYear().toString();
            const orderMonth = orderDate.toLocaleString('default', { month: 'long' });

            if (orderYear === selectedYear && (selectedMonth === "" || orderMonth === selectedMonth)) {
                overAll += amount;
                if (data.orderTime?.includes(todayStr)) dayTotal += amount;
                if (isConfirmed) compTotal += amount; else procTotal += amount;

                if (!isNaN(orderDate.getDay())) {
                    weeklyStats[orderDate.getDay()] += amount;
                }
            }
        });

        if (ui.total) ui.total.innerText = `$ ${overAll.toFixed(2)}`;
        if (ui.daily) ui.daily.innerText = `$ ${dayTotal.toFixed(2)}`;
        if (ui.comp) ui.comp.innerText = `$ ${compTotal.toFixed(2)}`;
        if (ui.proc) ui.proc.innerText = `$ ${procTotal.toFixed(2)}`;
        if (ui.chartT) ui.chartT.innerText = `$ ${overAll.toFixed(2)}`;
        
        setupChart(weeklyStats);
    });
};

document.addEventListener('change', (e) => {
    if (e.target.id === 'yearFilter' || e.target.id === 'monthFilter') {
        loadSaleAnalytics();
    }
});

// --- ৭. Checkout: Place Order Function ---
window.placeOrder = async (customerData) => {
    const cart = JSON.parse(localStorage.getItem('foodCart')) || [];
    const booking = JSON.parse(localStorage.getItem('tempBooking'));
    
    let orderPayload = {
        ...customerData,
        orderTime: new Date().toLocaleString('en-US'),
        status: "Pending",
        createdAt: new Date().getTime()
    };

    try {
        if (booking) {
            orderPayload.type = "Table Booking";
            orderPayload.bookingDetails = booking;
            orderPayload.total = "FREE";
        } else if (cart.length > 0) {
            orderPayload.type = "Food Order";
            orderPayload.items = cart;
            const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.qty || 1)), 0);
            orderPayload.total = `$ ${total.toFixed(2)}`;
        } else {
            throw new Error("Cart is empty!");
        }

        await addDoc(collection(db, "orders"), orderPayload);
        return true;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

// Initialization on Load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    loadSaleAnalytics();
});