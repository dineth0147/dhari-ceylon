/* ============================================================
   DHARI CEYLON WELLNESS — JavaScript
   Google Auth + Dynamic Packages + Admin Panel + Multi-Treatment
   ============================================================ */

// ---- Firebase Configuration ----
const firebaseConfig = {
  apiKey: "AIzaSyCrwh0tejBFbUI_JGtja4Lh9XtXeoCJlKM",
  authDomain: "dhariceylon.firebaseapp.com",
  projectId: "dhariceylon",
  storageBucket: "dhariceylon.firebasestorage.app",
  messagingSenderId: "401731210015",
  appId: "1:401731210015:web:56af2d3b6acdb97286fe2a",
  measurementId: "G-14DFVZZBKV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// ---- WhatsApp Config ----
const WHATSAPP_NUMBER = '94787327103';

// ---- Admin Config ----
const ADMIN_EMAILS = [
  'dinethsachinthagama@gmail.com', // Replace with your actual email
  'dinet.t23@gmail.com', // Pre-added for convenience
  'supunepa4@gmail.com',
  'dhariceylon111@gmail.com',
  'dhariceylon.official@gmail.com'
];

// ---- All available time slots ----
const ALL_TIME_SLOTS = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
];

// ---- Global State ----
let activeDateListener = null;
let currentUser = null;
let myBookingsListener = null;
let loadedPackages = []; // Local cache of treatments
let selectedTreatments = []; // User selected treatments
let packagesListener = null;
let activeBookingsAdminListener = null;
let cart = JSON.parse(localStorage.getItem('dhari_cart') || '[]');

// ---- Default packages for database seeding ----
const DEFAULT_PACKAGES = [
  {
    name: "Crown Awakening",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 45,
    description: "Sacred scalp and hair therapy to wake up your crown chakra.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop&q=80",
    tag: "Most Popular",
    isFeatured: true
  },
  {
    name: "Celestial Scalp Therapy",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 65,
    description: "Deep relaxation scalp treatment using celestial herbal infusions.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Shirodhara Serenity",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 85,
    description: "Traditional Shirodhara oil flow for deep nervous system soothing.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Shirodhara Ultimate Bliss",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 120,
    description: "A combination of head massage, Shirodhara, and custom herbal wraps.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Signature Body Reset",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 85,
    description: "Signature full-body reset with warm Ayurvedic oils.",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=400&fit=crop&q=80",
    tag: "Most Popular",
    isFeatured: true
  },
  {
    name: "Royal Ayurvedic Detox",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 120,
    description: "Complete full-body scrub, massage, and steam detox bath.",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Saraswati's Glow",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 110,
    description: "Royal skin glow ritual with saffron and sandalwood pastes.",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Grounding Ritual Tier 1",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 35,
    description: "Foot bath, massage, and herbal paste application.",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Grounding Ritual Tier 2",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 50,
    description: "Premium foot care with dynamic pressure-point reflexology.",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Kids Pedicure",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 25,
    description: "Gentle herbal soak and nail care tailored for kids.",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Surfer's Recovery",
    category: "Single Treatment",
    type: "Medical Care",
    price: 50,
    description: "Deep muscle relief targeted at shoulders, arms, and lower back.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80",
    tag: "Coastal Special",
    isFeatured: true
  },
  {
    name: "After-Sun Soother",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 45,
    description: "Cooling aloe vera and sandalwood wrap for sun-damaged skin.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Kativasthi (Back Pain)",
    category: "Single Treatment",
    type: "Medical Care",
    price: 65,
    description: "Retention of warm medicated oil on the lower back.",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Janu Vasthi (Knee)",
    category: "Single Treatment",
    type: "Medical Care",
    price: 65,
    description: "Retention of warm medicated oil over the knee joints.",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Trim & Detox Ritual",
    category: "Single Treatment",
    type: "Medical Care",
    price: 75,
    description: "Herbal powder massages (Udvarthanam) for cellulite reduction.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Herbal Glow Facial",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 55,
    description: "Facial massage and custom botanical clay mask.",
    image: "https://images.unsplash.com/photo-1552693673-1bf958298935?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "The Renewal Retreat",
    category: "Package",
    type: "Wellness Care",
    price: 299,
    duration: "3 Days",
    ideal: "Stressed professionals, weekend wellness seekers",
    includes: "Initial doctor consultation & Prakriti assessment\nDaily signature body treatments\nHerbal steam & detox therapies\nPersonalized herbal medicine course\nDietary & lifestyle guidance",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=800&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Holistic Metamorphosis",
    category: "Package",
    type: "Wellness Care",
    price: 549,
    duration: "5 Days",
    ideal: "Chronic pain seekers, luxury wellness guests, total health reset",
    includes: "Comprehensive medical consultation\nDaily customized treatment sequences\nShirodhara & specialized head therapies\nFull-body detox & rejuvenation program\nVasthi treatments (if prescribed)\nComplete herbal medicine course\nPost-program wellness plan",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=800&fit=crop&q=80",
    tag: "Most Transformative",
    isFeatured: true
  },
  {
    name: "Deep Tissue Massage",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 60,
    description: "Intense pressure therapy to release deep muscle tension and knots.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Herbal Body Scrub",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 40,
    description: "Exfoliating body scrub using natural Ayurvedic grains and herbs.",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Herbal Body Pack",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 45,
    description: "Therapeutic herbal paste wrap to nourish skin and detoxify tissues.",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Herbal Steam Bath",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 30,
    description: "Medicated herbal steam enclosure to open pores and flush toxins.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Akshi Tarpana (Eye Therapy)",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 50,
    description: "Pooling of warm medicated ghee over the eyes to soothe strain.",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Nasya Therapy",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 40,
    description: "Administration of herbal oils through nasal passages to clear sinuses.",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Pinda Swedha",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 55,
    description: "Fomentation using warm herbal bags filled with medicated rice.",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  },
  {
    name: "Cupping Therapy",
    category: "Single Treatment",
    type: "Wellness Care",
    price: 50,
    description: "Traditional suction cups to improve circulation and reduce pain.",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop&q=80",
    isFeatured: false
  }
];

/* ============================================================
   AUTHENTICATION — Google Sign-In
   ============================================================ */

function handleAuthClick() {
  if (currentUser) {
    auth.signOut();
  } else {
    auth.signInWithPopup(googleProvider).catch((error) => {
      console.error('Sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') return;

      if (error.code === 'auth/operation-not-allowed') {
        alert('Google Sign-In is not enabled yet.\n\nPlease go to Firebase Console → Authentication → Sign-in method → Enable Google.');
      } else if (error.code === 'auth/unauthorized-domain') {
        alert('This domain is not authorized for sign-in.\n\nIf testing locally, please use a local server (e.g. Live Server in VS Code) instead of opening the file directly.');
      } else {
        alert(`Sign-in failed: ${error.message}`);
      }
    });
  }
}

function clearCartSilently() {
  cart = [];
  localStorage.setItem('dhari_cart', JSON.stringify(cart));
  loadedPackages.forEach(pkg => {
    const btn = document.getElementById(`btn-cart-${pkg.id}`);
    if (btn) btn.textContent = 'Add';
  });
  updateCartUI();
}

auth.onAuthStateChanged((user) => {
  currentUser = user;

  // Clear cart silently every time auth state changes (login/logout)
  clearCartSilently();

  updateAuthUI(user);
  updateBookingFormAuth(user);
  updateMyBookingsSection(user);
  checkAdminPermissions(user);

  // Re-render gallery to show/hide admin uploading controls dynamically
  renderGalleryUI();

  // Toggle My Bookings link and Cart Button visibility
  const myBookingsNavLink = document.getElementById('myBookingsNavLink');
  const myBookingsNavLinkMobile = document.getElementById('myBookingsNavLinkMobile');
  const floatingCartBtn = document.getElementById('floatingCartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');

  if (myBookingsNavLink && myBookingsNavLinkMobile) {
    if (user) {
      myBookingsNavLink.style.display = 'flex';
      myBookingsNavLinkMobile.style.display = 'block';
      if (floatingCartBtn) floatingCartBtn.style.display = 'flex';
    } else {
      myBookingsNavLink.style.display = 'none';
      myBookingsNavLinkMobile.style.display = 'none';
      if (floatingCartBtn) floatingCartBtn.style.display = 'none';

      // Close cart drawer if open
      if (cartDrawer && cartDrawer.classList.contains('active')) {
        cartDrawer.classList.remove('active');
        if (cartDrawerOverlay) cartDrawerOverlay.classList.remove('active');
      }

      // Redirect to home if logged out while viewing bookings
      if (window.location.hash === '#my-bookings') {
        window.location.hash = '#home';
      }
    }
  }
});

function updateAuthUI(user) {
  const desktopBtn = document.getElementById('authBtnDesktop');
  const mobileBtn = document.getElementById('authBtnMobile');

  if (!desktopBtn || !mobileBtn) return;

  if (user) {
    const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Account';
    const photoURL = user.photoURL || '';

    desktopBtn.innerHTML = `
      ${photoURL ? `<img class="auth-avatar" src="${photoURL}" alt="" referrerpolicy="no-referrer">` : ''}
      <span class="auth-btn-text">${firstName}</span>
      <span class="auth-signout-hint">Sign Out</span>
    `;
    desktopBtn.classList.add('signed-in');

    mobileBtn.innerHTML = `
      ${photoURL ? `<img class="auth-avatar" src="${photoURL}" alt="" referrerpolicy="no-referrer">` : ''}
      <span class="auth-btn-text">${user.displayName || 'Signed In'} — Sign Out</span>
    `;
    mobileBtn.classList.add('signed-in');
  } else {
    desktopBtn.innerHTML = `<span class="auth-btn-text">Sign In</span>`;
    desktopBtn.classList.remove('signed-in');

    mobileBtn.innerHTML = `<span class="auth-btn-text">Sign In with Google</span>`;
    mobileBtn.classList.remove('signed-in');
  }
}

function updateBookingFormAuth(user) {
  const authGate = document.getElementById('authGate');
  const formUserInfo = document.getElementById('formUserInfo');

  if (!authGate) return;

  if (user) {
    authGate.style.display = 'none';
    if (formUserInfo) {
      formUserInfo.style.display = 'flex';
      document.getElementById('formUserAvatar').src = user.photoURL || '';
      document.getElementById('formUserName').textContent = user.displayName || '';
      document.getElementById('formUserEmail').textContent = user.email || '';
    }

    const nameInput = document.getElementById('fullName');
    if (nameInput && !nameInput.value) {
      nameInput.value = user.displayName || '';
    }
  } else {
    authGate.style.display = 'flex';
    if (formUserInfo) {
      formUserInfo.style.display = 'none';
    }
  }
}

function updateMyBookingsSection(user) {
  const authView = document.getElementById('myBookingsAuth');
  const listView = document.getElementById('myBookingsList');
  const subtitle = document.getElementById('myBookingsSubtitle');

  if (!authView || !listView) return;

  if (myBookingsListener) {
    myBookingsListener();
    myBookingsListener = null;
  }

  if (user) {
    authView.style.display = 'none';
    listView.style.display = 'block';
    subtitle.textContent = 'View and manage your upcoming appointments.';
    loadMyBookings(user.uid);
  } else {
    authView.style.display = 'block';
    listView.style.display = 'none';
    subtitle.textContent = 'Sign in to view and manage your upcoming appointments.';
  }
}

function checkAdminPermissions(user) {
  const adminNavLink = document.getElementById('adminNavLink');
  const adminNavLinkMobile = document.getElementById('adminNavLinkMobile');
  const adminPanelSection = document.getElementById('admin-panel');

  if (!adminNavLink || !adminNavLinkMobile) return;

  if (user && ADMIN_EMAILS.includes(user.email)) {
    adminNavLink.style.display = 'flex';
    adminNavLinkMobile.style.display = 'block';
    adminPanelSection.style.display = 'block';
    loadAdminBookings(); // Load all active customer bookings
  } else {
    adminNavLink.style.display = 'none';
    adminNavLinkMobile.style.display = 'none';
    adminPanelSection.style.display = 'none';

    // Stop listening to customer bookings if not admin
    if (activeBookingsAdminListener) {
      activeBookingsAdminListener();
      activeBookingsAdminListener = null;
    }
  }
}


/* ============================================================
   MY BOOKINGS — Load & Cancel (Fixing index issue by JS sorting)
   ============================================================ */

function loadMyBookings(userId) {
  const cardsContainer = document.getElementById('myBookingsCards');
  const emptyState = document.getElementById('myBookingsEmpty');

  // Removed .orderBy() to avoid needing a composite index. We sort in JS.
  myBookingsListener = db.collection('bookings')
    .where('userId', '==', userId)
    .onSnapshot((snapshot) => {
      cardsContainer.innerHTML = '';

      const today = new Date().toISOString().split('T')[0];
      let upcomingBookings = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.date >= today) {
          upcomingBookings.push({ id: doc.id, ...data });
        }
      });

      // Sort bookings chronologically by date and then time
      upcomingBookings.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });

      if (upcomingBookings.length === 0) {
        emptyState.style.display = 'block';
      } else {
        emptyState.style.display = 'none';
        upcomingBookings.forEach(booking => {
          cardsContainer.appendChild(createBookingCard(booking));
        });
      }
    }, (error) => {
      console.error('My bookings listener error:', error);
      cardsContainer.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Unable to load bookings. Please try again.</p>';
    });
}

function createBookingCard(booking) {
  const card = document.createElement('div');
  card.className = 'booking-card animate-on-scroll visible';

  const timeLabel = ALL_TIME_SLOTS.find(s => s.value === booking.time)?.label || booking.time;
  const dateFormatted = formatDate(booking.date);

  // Render multiple treatments if it is an array
  let treatmentsHtml = '';
  if (booking.treatments && Array.isArray(booking.treatments)) {
    treatmentsHtml = booking.treatments.map(t => `<div class="booking-card-treatment-item">🌿 ${t.name} ($${t.price})</div>`).join('');
  } else {
    treatmentsHtml = `<div class="booking-card-treatment-item">🌿 ${booking.treatmentLabel || booking.treatment}</div>`;
  }

  card.innerHTML = `
    <div class="booking-card-header">
      <div class="booking-card-treatments-list">${treatmentsHtml}</div>
      <div class="booking-card-status">Confirmed</div>
    </div>
    <div class="booking-card-details">
      <div class="booking-card-detail">
        <span class="booking-card-icon">📅</span>
        <span>${dateFormatted}</span>
      </div>
      <div class="booking-card-detail">
        <span class="booking-card-icon">🕐</span>
        <span>${timeLabel}</span>
      </div>
      ${booking.phone ? `<div class="booking-card-detail"><span class="booking-card-icon">📱</span><span>${booking.phone}</span></div>` : ''}
    </div>
    <div class="booking-card-actions">
      <button class="btn-cancel" onclick="cancelBooking('${booking.id}', '${booking.treatmentLabel || 'Treatments'}', '${dateFormatted}', '${timeLabel}')">
        Cancel Booking
      </button>
    </div>
  `;

  return card;
}

async function cancelBooking(bookingId, treatment, date, time) {
  const confirmed = confirm(
    `Are you sure you want to cancel your session on ${date} at ${time}?\n\n` +
    `This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    await db.collection('bookings').doc(bookingId).delete();
    alert('Booking cancelled successfully!');
  } catch (error) {
    console.error('Cancel booking error:', error);
    alert('Failed to cancel booking: ' + error.message);
  }
}


/* ============================================================
   DYNAMIC PACKAGES SYSTEM
   ============================================================ */

/**
 * Initializes package system, seeds database if empty, and syncs UI.
 */
function initPackagesSystem() {
  packagesListener = db.collection('packages')
    .onSnapshot(async (snapshot) => {
      if (snapshot.empty) {
        console.log('No treatments found. Seeding Firestore with default packages...');
        await seedDefaultPackages();
        return; // The next snapshot trigger will render
      }

      loadedPackages = [];
      snapshot.forEach(doc => {
        loadedPackages.push({ id: doc.id, ...doc.data() });
      });

      // Sort locally by category then name
      loadedPackages.sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.name.localeCompare(b.name);
      });

      renderTreatmentsUI();
      renderBookingFormDropdowns();
      renderAdminDashboard();
    }, (error) => {
      console.error('Firestore packages listener error:', error);
    });
}

/**
 * Seeds Firestore with DEFAULT_PACKAGES list.
 */
async function seedDefaultPackages() {
  const batch = db.batch();
  DEFAULT_PACKAGES.forEach(pkg => {
    const docRef = db.collection('packages').doc();
    batch.set(docRef, pkg);
  });
  return batch.commit();
}

/**
 * Render treatments dynamic grid and multi-day dynamic grid.
 */
function renderTreatmentsUI() {
  const wellnessGrid = document.getElementById('wellnessGrid');
  const medicalGrid = document.getElementById('medicalGrid');
  const journeyGrid = document.getElementById('journeyGrid');
  const medicalJourneyGrid = document.getElementById('medicalJourneyGrid');

  // Fallback category type mappings for existing packages without a type field
  const getPackageType = (pkg) => {
    if (pkg.type) return pkg.type;
    const medicalCats = ["Targeted Pain Relief", "Surfer & Local Recovery", "Weight Reduction & Toning"];
    return medicalCats.includes(pkg.category) ? "Medical Care" : "Wellness Care";
  };

  // Helper to render high-contrast discounted pricing
  const getPriceHTML = (pkg) => {
    if (pkg.discount > 0) {
      const discountedPrice = pkg.price * (1 - pkg.discount / 100);
      const formattedPrice = discountedPrice.toFixed(2).replace(/\.00$/, '');
      return `<span style="text-decoration: line-through; opacity: 0.55; font-size: 0.88em; margin-right: 0.4rem; font-weight: normal;">$${pkg.price}</span><strong>$${formattedPrice}</strong>`;
    }
    return `<strong>$${pkg.price}</strong>`;
  };

  if (wellnessGrid) {
    wellnessGrid.innerHTML = '';
    const wellnessPkgs = loadedPackages.filter(p => p.category !== 'Package' && getPackageType(p) === 'Wellness Care');

    if (wellnessPkgs.length === 0) {
      wellnessGrid.innerHTML = '<p class="no-data-msg">No wellness care treatments available.</p>';
    } else {
      wellnessPkgs.forEach((pkg) => {
        const card = document.createElement('div');
        const isFeatured = !!pkg.isFeatured;
        card.className = `treatment-card ${isFeatured ? 'treatment-card-premium' : ''} animate-on-scroll visible`;
        
        const isInCart = cart.some(item => item.id === pkg.id);

        card.innerHTML = `
          ${isFeatured ? `<div class="journey-premium-badge">${pkg.tag || 'Most Popular'}</div>` : ''}
          ${pkg.discount > 0 ? `<div class="discount-percent-badge">${pkg.discount}% OFF</div>` : ''}
          <div class="treatment-card-image" style="background-image: url('${pkg.image}')"></div>
          <div class="treatment-card-content">
            ${(!isFeatured && pkg.tag) ? `<div class="treatment-card-tag">${pkg.tag}</div>` : ''}
            <h3>${pkg.name}</h3>
            <p>${pkg.description}</p>
            <div class="treatment-card-price" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem;">
              <span>Price: ${getPriceHTML(pkg)}</span>
              <button class="btn btn-gold btn-sm" onclick="toggleCartItem('${pkg.id}')" id="btn-cart-${pkg.id}">
                ${isInCart ? 'Remove' : 'Add'}
              </button>
            </div>
          </div>
        `;
        wellnessGrid.appendChild(card);
      });
    }
  }

  if (medicalGrid) {
    medicalGrid.innerHTML = '';
    const medicalPkgs = loadedPackages.filter(p => p.category !== 'Package' && getPackageType(p) === 'Medical Care');

    if (medicalPkgs.length === 0) {
      medicalGrid.innerHTML = '<p class="no-data-msg">No medical care treatments available.</p>';
    } else {
      medicalPkgs.forEach((pkg) => {
        const card = document.createElement('div');
        const isFeatured = !!pkg.isFeatured;
        card.className = `treatment-card ${isFeatured ? 'treatment-card-premium' : ''} animate-on-scroll visible`;
        
        const isInCart = cart.some(item => item.id === pkg.id);

        card.innerHTML = `
          ${isFeatured ? `<div class="journey-premium-badge">${pkg.tag || 'Featured'}</div>` : ''}
          ${pkg.discount > 0 ? `<div class="discount-percent-badge">${pkg.discount}% OFF</div>` : ''}
          <div class="treatment-card-content" style="display: flex; flex-direction: column; height: 100%; justify-content: space-between; min-height: 200px;">
            <div>
              ${(!isFeatured && pkg.tag) ? `<div class="treatment-card-tag">${pkg.tag}</div>` : ''}
              <h3>${pkg.name}</h3>
              <p>${pkg.description}</p>
            </div>
            <div class="treatment-card-price" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 1rem;">
              <span>Price: ${getPriceHTML(pkg)}</span>
              <button class="btn btn-gold btn-sm" onclick="toggleCartItem('${pkg.id}')" id="btn-cart-${pkg.id}">
                ${isInCart ? 'Remove' : 'Add'}
              </button>
            </div>
          </div>
        `;
        medicalGrid.appendChild(card);
      });
    }
  }

  // Wellness Packages (journeyGrid)
  if (journeyGrid) {
    journeyGrid.innerHTML = '';
    const wellnessMultiDayPkgs = loadedPackages.filter(p => p.category === 'Package' && getPackageType(p) === 'Wellness Care');

    if (wellnessMultiDayPkgs.length === 0) {
      journeyGrid.innerHTML = '<p class="no-data-msg">No wellness care packages available.</p>';
    } else {
      wellnessMultiDayPkgs.forEach(pkg => {
        const card = document.createElement('div');
        const isPremium = pkg.isFeatured;
        card.className = `journey-card ${isPremium ? 'journey-card-premium' : ''} animate-on-scroll visible`;

        const includesItems = pkg.includes ? pkg.includes.split('\n').filter(i => i.trim() !== '') : [];
        const includesHtml = includesItems.map(i => `<li>${i}</li>`).join('');
        const isInCart = cart.some(item => item.id === pkg.id);

        card.innerHTML = `
          ${pkg.tag ? `<div class="journey-premium-badge">${pkg.tag}</div>` : ''}
          ${pkg.discount > 0 ? `<div class="discount-percent-badge" style="top: 1.5rem; right: 2rem;">${pkg.discount}% OFF</div>` : ''}
          ${pkg.image ? `<div class="journey-card-image" style="background-image: url('${pkg.image}'); height: 220px; background-size: cover; background-position: center; border-radius: var(--radius-md); margin-bottom: 1.5rem;"></div>` : ''}
          <div class="journey-duration">${pkg.duration || 'Retreat'}</div>
          <h3 class="journey-title">${pkg.name}</h3>
          <p class="journey-desc">${pkg.description}</p>
          ${includesHtml ? `<ul class="journey-includes">${includesHtml}</ul>` : ''}
          ${pkg.ideal ? `<div class="journey-ideal"><strong>Ideal for:</strong> ${pkg.ideal}</div>` : ''}
          <div class="journey-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 1rem;">
            <span class="journey-price">From ${getPriceHTML(pkg)}</span>
            <button class="btn btn-gold btn-sm" onclick="toggleCartItem('${pkg.id}')" id="btn-cart-${pkg.id}">
              ${isInCart ? 'Remove' : 'Add'}
            </button>
          </div>
        `;
        journeyGrid.appendChild(card);
      });
    }
  }

  // Medical Packages (medicalJourneyGrid)
  if (medicalJourneyGrid) {
    medicalJourneyGrid.innerHTML = '';
    const medicalMultiDayPkgs = loadedPackages.filter(p => p.category === 'Package' && getPackageType(p) === 'Medical Care');

    if (medicalMultiDayPkgs.length === 0) {
      medicalJourneyGrid.innerHTML = '<p class="no-data-msg">No medical care packages available.</p>';
    } else {
      medicalMultiDayPkgs.forEach(pkg => {
        const card = document.createElement('div');
        const isPremium = pkg.isFeatured;
        card.className = `journey-card ${isPremium ? 'journey-card-premium' : ''} animate-on-scroll visible`;

        const includesItems = pkg.includes ? pkg.includes.split('\n').filter(i => i.trim() !== '') : [];
        const includesHtml = includesItems.map(i => `<li>${i}</li>`).join('');
        const isInCart = cart.some(item => item.id === pkg.id);

        card.innerHTML = `
          ${pkg.tag ? `<div class="journey-premium-badge">${pkg.tag}</div>` : ''}
          ${pkg.discount > 0 ? `<div class="discount-percent-badge" style="top: 1.5rem; right: 2rem;">${pkg.discount}% OFF</div>` : ''}
          <div class="journey-duration">${pkg.duration || 'Retreat'}</div>
          <h3 class="journey-title">${pkg.name}</h3>
          <p class="journey-desc">${pkg.description}</p>
          ${includesHtml ? `<ul class="journey-includes">${includesHtml}</ul>` : ''}
          ${pkg.ideal ? `<div class="journey-ideal"><strong>Ideal for:</strong> ${pkg.ideal}</div>` : ''}
          <div class="journey-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 1rem;">
            <span class="journey-price">From ${getPriceHTML(pkg)}</span>
            <button class="btn btn-gold btn-sm" onclick="toggleCartItem('${pkg.id}')" id="btn-cart-${pkg.id}">
              ${isInCart ? 'Remove' : 'Add'}
            </button>
          </div>
        `;
        medicalJourneyGrid.appendChild(card);
      });
    }
  }
}

/**
 * Dynamically build the checklist inside the booking dropdown.
 */
function renderBookingFormDropdowns() {
  const dropdownContainer = document.getElementById('multiSelectDropdown');
  if (!dropdownContainer) return;

  dropdownContainer.innerHTML = '';

  // Group packages by category
  const categories = {};
  loadedPackages.forEach(pkg => {
    if (!categories[pkg.category]) {
      categories[pkg.category] = [];
    }
    categories[pkg.category].push(pkg);
  });

  for (const catName in categories) {
    const catGroup = document.createElement('div');
    catGroup.className = 'dropdown-category-group';
    catGroup.innerHTML = `<div class="dropdown-category-title">${catName}</div>`;

    categories[catName].forEach(pkg => {
      const optionRow = document.createElement('div');
      optionRow.className = 'dropdown-option-row';

      const isChecked = selectedTreatments.some(t => t.id === pkg.id);
      const discountedPrice = pkg.discount > 0 ? pkg.price * (1 - pkg.discount / 100) : pkg.price;
      const formattedPrice = discountedPrice.toFixed(2).replace(/\.00$/, '');

      optionRow.innerHTML = `
        <label class="dropdown-checkbox-label">
          <input type="checkbox" id="chk-${pkg.id}" ${isChecked ? 'checked' : ''} onchange="handleTreatmentToggle('${pkg.id}', '${pkg.name.replace(/'/g, "\\'")}', ${discountedPrice}, this.checked)">
          <span class="option-text">
            ${pkg.name} 
            <span class="option-price">
              ${pkg.discount > 0 ? `<span style="text-decoration: line-through; opacity: 0.55; margin-right: 4px;">$${pkg.price}</span>` : ''}
              $${formattedPrice}
              ${pkg.discount > 0 ? `<span style="font-size: 0.75rem; color: var(--gold-dark); margin-left: 4px; font-weight: bold;">(${pkg.discount}% OFF)</span>` : ''}
            </span>
          </span>
        </label>
      `;
      catGroup.appendChild(optionRow);
    });

    dropdownContainer.appendChild(catGroup);
  }
}


/* ============================================================
   MULTI-SELECT DROPDOWN INTERACTION
   ============================================================ */

function toggleMultiSelectDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('multiSelectDropdown');
  const input = document.getElementById('multiSelectInput');
  if (!dropdown || !input) return;

  const isHidden = dropdown.style.display === 'none';
  dropdown.style.display = isHidden ? 'block' : 'none';

  if (isHidden) {
    input.classList.add('active');
  } else {
    input.classList.remove('active');
  }
}

// Close dropdown on click outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('multiSelectDropdown');
  const input = document.getElementById('multiSelectInput');
  if (dropdown && !dropdown.contains(e.target) && !input.contains(e.target)) {
    dropdown.style.display = 'none';
    input.classList.remove('active');
  }
});

function handleTreatmentToggle(pkgId, pkgName, pkgPrice, checked) {
  const pkg = loadedPackages.find(p => p.id === pkgId);
  const cat = pkg ? pkg.category : 'General';

  if (checked) {
    if (!cart.some(item => item.id === pkgId)) {
      cart.push({ id: pkgId, name: pkgName, price: pkgPrice, category: cat });
    }
  } else {
    cart = cart.filter(item => item.id !== pkgId);
  }

  // Persist cart
  localStorage.setItem('dhari_cart', JSON.stringify(cart));

  // Sync grid card buttons
  const btn = document.getElementById(`btn-cart-${pkgId}`);
  if (btn) btn.textContent = checked ? 'Remove' : 'Add';

  updateCartUI();
}

function removeTreatmentChip(e, pkgId) {
  if (e) e.stopPropagation();

  // Uncheck in dropdown
  const checkbox = document.getElementById(`chk-${pkgId}`);
  if (checkbox) checkbox.checked = false;

  // Remove from cart
  cart = cart.filter(item => item.id !== pkgId);
  localStorage.setItem('dhari_cart', JSON.stringify(cart));

  // Sync grid card buttons
  const btn = document.getElementById(`btn-cart-${pkgId}`);
  if (btn) btn.textContent = 'Add';

  updateCartUI();
}

function updateSelectedChips() {
  const chipsContainer = document.getElementById('selectedChips');
  const hiddenInput = document.getElementById('selectedTreatmentsHidden');

  if (!chipsContainer || !hiddenInput) return;

  chipsContainer.innerHTML = '';

  if (selectedTreatments.length === 0) {
    chipsContainer.innerHTML = '<span class="placeholder-text">Choose treatment(s)...</span>';
    hiddenInput.value = '';
  } else {
    selectedTreatments.forEach(t => {
      const chip = document.createElement('span');
      chip.className = 'treatment-chip';
      chip.innerHTML = `
        ${t.name}
        <span class="chip-remove" onclick="removeTreatmentChip(event, '${t.id}')">×</span>
      `;
      chipsContainer.appendChild(chip);
    });

    // Populate value to satisfy HTML5 required validation
    hiddenInput.value = JSON.stringify(selectedTreatments);
  }

  updateBookingButton();
}

function updateBookingButton() {
  const submitBtn = document.getElementById('bookingSubmitBtn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  if (!btnText) return;

  if (selectedTreatments.length === 0) {
    btnText.textContent = 'Book via WhatsApp';
  } else {
    const total = selectedTreatments.reduce((sum, t) => sum + Number(t.price), 0);
    btnText.textContent = `Book ${selectedTreatments.length} Session${selectedTreatments.length > 1 ? 's' : ''} ($${total}) via WhatsApp`;
  }
}


/* ============================================================
   ADMIN DASHBOARD ACTIONS
   ============================================================ */

function renderAdminDashboard() {
  const tableBody = document.getElementById('adminPackagesTableBody');
  const countLabel = document.getElementById('totalPackagesCount');

  if (!tableBody) return;

  tableBody.innerHTML = '';
  countLabel.textContent = loadedPackages.length;

  // Reset checkboxes states
  const masterCheckbox = document.getElementById('selectAllPackages');
  if (masterCheckbox) masterCheckbox.checked = false;
  const btnDelete = document.getElementById('btnDeleteSelected');
  if (btnDelete) btnDelete.style.display = 'none';

  if (loadedPackages.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No packages loaded.</td></tr>';
    return;
  }

  loadedPackages.forEach(pkg => {
    const tr = document.createElement('tr');
    const typeLabel = pkg.type || (["Targeted Pain Relief", "Surfer & Local Recovery", "Weight Reduction & Toning"].includes(pkg.category) ? "Medical Care" : "Wellness Care");
    
    const priceDisplay = pkg.discount > 0 
      ? `<strong>$${(pkg.price * (1 - pkg.discount / 100)).toFixed(2).replace(/\.00$/, '')}</strong> <span style="text-decoration: line-through; opacity: 0.5; font-size: 0.85em; font-weight: normal; margin-left: 0.25rem;">$${pkg.price}</span> <span class="badge" style="background: var(--gold-dark); font-size: 0.7rem; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-left: 0.25rem;">-${pkg.discount}%</span>` 
      : `<strong>$${pkg.price}</strong>`;

    tr.innerHTML = `
      <td style="text-align: center;"><input type="checkbox" class="pkg-row-select" value="${pkg.id}" onchange="handleRowCheckboxChange()" style="transform: scale(1.2); cursor: pointer;"></td>
      <td><strong>${pkg.name}</strong></td>
      <td><span class="admin-table-category" style="background:var(--sand-dark); font-weight:600; color:var(--green-deep);">${typeLabel}</span></td>
      <td><span class="admin-table-category">${pkg.category}</span></td>
      <td>${priceDisplay}</td>
      <td>${pkg.isFeatured ? '⭐ Yes' : 'No'}</td>
      <td class="admin-table-actions">
        <button class="btn-edit" onclick="editPackage('${pkg.id}')">Edit</button>
        <button class="btn-delete" onclick="deletePackage('${pkg.id}', '${pkg.name.replace(/'/g, "\\'")}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function showAddPackageForm() {
  document.getElementById('packageFormCard').style.display = 'block';
  document.getElementById('formActionTitle').textContent = 'Add New Package';
  document.getElementById('adminPackageForm').reset();
  document.getElementById('packageFormId').value = '';
  toggleCategorySpecificFields();

  // Scroll to form
  document.getElementById('packageFormCard').scrollIntoView({ behavior: 'smooth' });
}

function hidePackageForm() {
  document.getElementById('packageFormCard').style.display = 'none';
  document.getElementById('adminPackageForm').reset();
  document.getElementById('packageFormId').value = '';
}

function toggleCategorySpecificFields() {
  const category = document.getElementById('pkgCategory').value;
  const type = document.getElementById('pkgType').value;
  const multidayFields = document.getElementById('multidayFields');
  const normalDescGroup = document.getElementById('normalDescGroup');
  const imageGroup = document.getElementById('imageGroup');

  const descTextarea = document.getElementById('pkgDesc');
  const durationInput = document.getElementById('pkgDuration');
  const idealInput = document.getElementById('pkgIdeal');
  const includesTextarea = document.getElementById('pkgIncludes');
  const imageInput = document.getElementById('pkgImage');

  if (category === 'Package') {
    multidayFields.style.display = 'block';
    normalDescGroup.style.display = 'block'; // Description is still used as summary

    // Add required dynamic attributes
    durationInput.setAttribute('required', 'true');
    idealInput.setAttribute('required', 'true');
    includesTextarea.setAttribute('required', 'true');
    descTextarea.setAttribute('required', 'true');
  } else {
    multidayFields.style.display = 'none';

    // Remove required dynamic attributes
    durationInput.removeAttribute('required');
    idealInput.removeAttribute('required');
    includesTextarea.removeAttribute('required');
    descTextarea.setAttribute('required', 'true');
  }

  // Medical Care items do not have/require images
  if (type === 'Medical Care') {
    if (imageGroup) imageGroup.style.display = 'none';
    if (imageInput) imageInput.removeAttribute('required');
  } else {
    if (imageGroup) imageGroup.style.display = 'block';
    if (imageInput) imageInput.setAttribute('required', 'true');
  }
}

function editPackage(pkgId) {
  const pkg = loadedPackages.find(p => p.id === pkgId);
  if (!pkg) return;

  document.getElementById('packageFormCard').style.display = 'block';
  document.getElementById('formActionTitle').textContent = 'Edit Package';

  document.getElementById('packageFormId').value = pkg.id;
  document.getElementById('pkgName').value = pkg.name;
  document.getElementById('pkgCategory').value = pkg.category;
  
  const fallbackType = ["Targeted Pain Relief", "Surfer & Local Recovery", "Weight Reduction & Toning"].includes(pkg.category) ? "Medical Care" : "Wellness Care";
  document.getElementById('pkgType').value = pkg.type || fallbackType;

  document.getElementById('pkgPrice').value = pkg.price;
  document.getElementById('pkgDiscount').value = pkg.discount || '';
  document.getElementById('pkgTag').value = pkg.tag || '';
  document.getElementById('pkgImage').value = pkg.image || '';
  document.getElementById('pkgDesc').value = pkg.description;
  document.getElementById('pkgIsFeatured').checked = !!pkg.isFeatured;

  toggleCategorySpecificFields();

  if (pkg.category === 'Package') {
    document.getElementById('pkgDuration').value = pkg.duration || '';
    document.getElementById('pkgIdeal').value = pkg.ideal || '';
    document.getElementById('pkgIncludes').value = pkg.includes || '';
  }

  // Scroll to form
  document.getElementById('packageFormCard').scrollIntoView({ behavior: 'smooth' });
}

async function handlePackageSubmit(e) {
  e.preventDefault();
  if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email)) {
    alert('Unauthorized write access.');
    return;
  }

  const id = document.getElementById('packageFormId').value;
  const category = document.getElementById('pkgCategory').value;
  const type = document.getElementById('pkgType').value;

  const packageData = {
    name: document.getElementById('pkgName').value,
    category: category,
    type: type,
    price: Number(document.getElementById('pkgPrice').value),
    discount: Number(document.getElementById('pkgDiscount').value) || 0,
    tag: document.getElementById('pkgTag').value,
    image: type === 'Medical Care' ? '' : document.getElementById('pkgImage').value,
    description: document.getElementById('pkgDesc').value,
    isFeatured: document.getElementById('pkgIsFeatured').checked
  };

  if (category === 'Package') {
    packageData.duration = document.getElementById('pkgDuration').value;
    packageData.ideal = document.getElementById('pkgIdeal').value;
    packageData.includes = document.getElementById('pkgIncludes').value;
  }

  try {
    if (id) {
      // Edit
      await db.collection('packages').doc(id).update(packageData);
      alert('Package updated successfully!');
    } else {
      // Create new
      await db.collection('packages').add(packageData);
      alert('Package added successfully!');
    }
    hidePackageForm();
  } catch (error) {
    console.error('Error saving package:', error);
    alert(`Failed to save package: ${error.message || error}\n\nPlease check if your Firestore security rules allow writes to the 'packages' collection.`);
  }
}

async function deletePackage(pkgId, pkgName) {
  const confirmed = confirm(`Are you sure you want to delete the package "${pkgName}"?`);
  if (!confirmed) return;

  try {
    await db.collection('packages').doc(pkgId).delete();
    alert('Package deleted successfully.');
  } catch (error) {
    console.error('Error deleting package:', error);
    alert('Failed to delete package. Please try again.');
  }
}

function toggleSelectAllPackages(isChecked) {
  const rowCheckboxes = document.querySelectorAll('.pkg-row-select');
  rowCheckboxes.forEach(cb => {
    cb.checked = isChecked;
  });
  handleRowCheckboxChange();
}

function handleRowCheckboxChange() {
  const rowCheckboxes = document.querySelectorAll('.pkg-row-select');
  const checkedBoxes = Array.from(rowCheckboxes).filter(cb => cb.checked);
  
  const btnDelete = document.getElementById('btnDeleteSelected');
  if (!btnDelete) return;

  if (checkedBoxes.length > 0) {
    btnDelete.style.display = 'block';
    btnDelete.textContent = `Delete Selected (${checkedBoxes.length})`;
  } else {
    btnDelete.style.display = 'none';
  }
}

async function deleteSelectedPackages() {
  const rowCheckboxes = document.querySelectorAll('.pkg-row-select');
  const checkedBoxes = Array.from(rowCheckboxes).filter(cb => cb.checked);
  const idsToDelete = checkedBoxes.map(cb => cb.value);

  if (idsToDelete.length === 0) return;

  const confirmed = confirm(`Are you sure you want to delete the ${idsToDelete.length} selected package(s)?`);
  if (!confirmed) return;

  try {
    const btnDelete = document.getElementById('btnDeleteSelected');
    if (btnDelete) {
      btnDelete.disabled = true;
      btnDelete.textContent = 'Deleting...';
    }

    const batch = db.batch();
    idsToDelete.forEach(id => {
      const ref = db.collection('packages').doc(id);
      batch.delete(ref);
    });

    await batch.commit();
    alert(`Successfully deleted ${idsToDelete.length} package(s).`);
  } catch (error) {
    console.error('Error during bulk deletion:', error);
    alert('An error occurred while deleting packages. Please try again.');
  } finally {
    const btnDelete = document.getElementById('btnDeleteSelected');
    if (btnDelete) btnDelete.disabled = false;
  }
}


/* ============================================================
   ADMIN ACTIVE BOOKINGS LISTENER
   ============================================================ */

function loadAdminBookings() {
  const tableBody = document.getElementById('adminBookingsTableBody');
  if (!tableBody) return;

  if (activeBookingsAdminListener) {
    activeBookingsAdminListener();
    activeBookingsAdminListener = null;
  }

  const today = new Date().toISOString().split('T')[0];

  tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading customer bookings...</td></tr>';

  activeBookingsAdminListener = db.collection('bookings')
    .onSnapshot((snapshot) => {
      tableBody.innerHTML = '';
      const bookings = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.date >= today) {
          bookings.push({ id: doc.id, ...data });
        }
      });

      // Sort bookings chronologically (date then time)
      bookings.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });

      if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No active customer bookings found.</td></tr>';
        return;
      }

      bookings.forEach(booking => {
        const tr = document.createElement('tr');
        
        let treatmentsLabel = '';
        if (booking.treatments && Array.isArray(booking.treatments)) {
          treatmentsLabel = booking.treatments.map(t => `${t.name} ($${t.price})`).join(', ');
        } else {
          treatmentsLabel = booking.treatmentLabel || booking.treatment;
        }

        const dateFormatted = formatDate(booking.date);
        const timeLabel = ALL_TIME_SLOTS.find(s => s.value === booking.time)?.label || booking.time;

        const customerName = booking.fullName || booking.userName || 'Guest';
        const contactInfo = `
          <div>👤 ${customerName}</div>
          ${booking.userEmail ? `<div style="font-size:0.75rem;color:var(--text-muted)">✉️ ${booking.userEmail}</div>` : ''}
          ${booking.phone ? `<div style="font-size:0.75rem;color:var(--text-muted)">📱 ${booking.phone}</div>` : ''}
        `;

        tr.innerHTML = `
          <td><strong>${customerName}</strong></td>
          <td>${contactInfo}</td>
          <td><span style="font-size:0.85rem;">${treatmentsLabel}</span></td>
          <td>
            <div>📅 ${dateFormatted}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);">🕐 ${timeLabel}</div>
          </td>
          <td>
            <button class="btn-delete" onclick="cancelBookingByAdmin('${booking.id}', '${customerName.replace(/'/g, "\\'")}', '${dateFormatted}', '${timeLabel}')">
              Cancel Booking
            </button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }, (error) => {
      console.error('Error fetching admin bookings:', error);
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--terracotta);">Failed to load bookings. Please check rules.</td></tr>';
    });
}

async function cancelBookingByAdmin(bookingId, customerName, date, time) {
  const confirmed = confirm(
    `Are you sure you want to cancel the booking for:\n\n` +
    `👤 Customer: ${customerName}\n` +
    `📅 Date: ${date}\n` +
    `🕐 Time: ${time}\n\n` +
    `This will immediately release the time slot for other users.`
  );

  if (!confirmed) return;

  try {
    await db.collection('bookings').doc(bookingId).delete();
    alert('Booking cancelled successfully and slot released!');
  } catch (error) {
    console.error('Error deleting booking by admin:', error);
    alert(`Failed to cancel booking: ${error.message}`);
  }
}


/* ============================================================
   TREATMENT CART ACTIONS
   ============================================================ */

function toggleCartItem(pkgId) {
  if (!currentUser) {
    alert('Please sign in to proceed with booking/adding treatments.');
    handleAuthClick();
    return;
  }

  const pkg = loadedPackages.find(p => p.id === pkgId);
  if (!pkg) return;

  const itemIndex = cart.findIndex(item => item.id === pkgId);

  if (itemIndex > -1) {
    // Already in cart - remove it
    cart.splice(itemIndex, 1);
  } else {
    // Add to cart
    const discountedPrice = pkg.discount > 0 ? pkg.price * (1 - pkg.discount / 100) : pkg.price;
    const finalPrice = Number(discountedPrice.toFixed(2).replace(/\.00$/, ''));

    cart.push({
      id: pkg.id,
      name: pkg.name,
      price: finalPrice,
      category: pkg.category
    });

    // Automatically slide-open cart drawer
    const drawer = document.getElementById('cartDrawer');
    if (drawer && !drawer.classList.contains('active')) {
      toggleCartDrawer();
    }
  }

  // Persist cart
  localStorage.setItem('dhari_cart', JSON.stringify(cart));

  // Sync button text on grid cards
  const btn = document.getElementById(`btn-cart-${pkgId}`);
  if (btn) {
    btn.textContent = cart.some(item => item.id === pkgId) ? 'Remove' : 'Add';
  }

  updateCartUI();
}

function toggleCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartDrawerOverlay');
  if (!drawer || !overlay) return;

  const isActive = drawer.classList.contains('active');
  if (isActive) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
  } else {
    drawer.classList.add('active');
    overlay.classList.add('active');
  }
}

function updateCartUI() {
  const itemsContainer = document.getElementById('cartDrawerItems');
  const totalSumLabel = document.getElementById('cartTotalSum');
  const floatingBtn = document.getElementById('floatingCartBtn');
  const badge = document.getElementById('floatingCartBadge');

  if (!itemsContainer || !totalSumLabel || !floatingBtn || !badge) return;

  // Update badge and display status
  badge.textContent = cart.length;
  if (cart.length > 0) {
    floatingBtn.style.display = 'flex';
  } else {
    floatingBtn.style.display = 'none';
    
    // Also close drawer if it is empty and open
    const drawer = document.getElementById('cartDrawer');
    if (drawer && drawer.classList.contains('active')) {
      toggleCartDrawer();
    }
  }

  itemsContainer.innerHTML = '';
  let sum = 0;

  cart.forEach(item => {
    sum += Number(item.price);
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-category">${item.category}</span>
        <span class="cart-item-price">$${item.price}</span>
      </div>
      <button class="cart-item-remove" onclick="toggleCartItem('${item.id}')">×</button>
    `;
    itemsContainer.appendChild(div);
  });

  totalSumLabel.textContent = `$${sum}`;

  // Sync the dropdown menu selections inside the booking form
  selectedTreatments = [...cart];
  updateSelectedChips();
  
  // Update checkbox checks in dropdown
  document.querySelectorAll('#multiSelectDropdown input[type="checkbox"]').forEach(checkbox => {
    const pkgId = checkbox.id.replace('chk-', '');
    checkbox.checked = cart.some(item => item.id === pkgId);
  });
}

function handleCartCheckout() {
  if (cart.length === 0) {
    alert('Your cart is empty. Please add some treatments first!');
    return;
  }

  toggleCartDrawer(); // Close cart drawer

  if (!currentUser) {
    alert('Please sign in to proceed with your booking.');
    handleAuthClick(); // Pop up Google Login
    return;
  }

  // Redirect to booking page
  window.location.hash = '#booking';
}

function clearCart() {
  const confirmClear = confirm('Are you sure you want to empty your cart?');
  if (!confirmClear) return;

  cart = [];
  localStorage.setItem('dhari_cart', JSON.stringify(cart));

  // Reset grid card buttons
  loadedPackages.forEach(pkg => {
    const btn = document.getElementById(`btn-cart-${pkg.id}`);
    if (btn) btn.textContent = 'Add';
  });

  updateCartUI();
}


/* ============================================================
   MAIN DOM READY & EVENT LISTENERS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Initialize packages from DB
  initPackagesSystem();

  // Initialize gallery system
  initGallerySystem();

  // Initialize cart status from localStorage
  updateCartUI();

  // ---- Header Scroll Effect & Back to Top ----
  const header = document.getElementById('header');
  const backToTopBtn = document.getElementById('backToTop');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    // Header effect
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Back to top button visibility
    if (backToTopBtn) {
      if (currentScroll > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }
    
    lastScroll = currentScroll;
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // ---- Mobile Menu Toggle ----
  const mobileToggle = document.getElementById('mobileToggle');
  const navMobile = document.getElementById('navMobile');

  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navMobile.classList.toggle('active');
  });

  // Close mobile menu on link click
  document.querySelectorAll('.nav-mobile-link, .nav-mobile-cta').forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      navMobile.classList.remove('active');
    });
  });


  // ---- SPA ROUTING SYSTEM ----
  function navigate() {
    const hash = window.location.hash || '#home';
    
    // Map hashes to view container IDs
    const routes = {
      '#home': 'view-home',
      '#about': 'view-about',
      '#difference': 'view-about',
      '#why-us': 'view-about',
      '#wellness-care': 'view-wellness-care',
      '#wellness-treatments': 'view-wellness-care',
      '#journey': 'view-wellness-care',
      '#medical-care': 'view-medical-care',
      '#medical-treatments': 'view-medical-care',
      '#medical-journey': 'view-medical-care',
      '#booking': 'view-booking',
      '#my-bookings': 'view-my-bookings',
      '#admin-panel': 'view-admin-panel',
      '#contact': 'view-contact',
      '#faq': 'view-contact',
      '#gallery': 'view-gallery'
    };

    const targetViewId = routes[hash];
    if (!targetViewId) return; // Ignore unknown hashes

    // Hide all spa-views, show target view
    document.querySelectorAll('.spa-view').forEach(view => {
      view.style.display = 'none';
      view.classList.remove('active');
    });

    const activeView = document.getElementById(targetViewId);
    if (activeView) {
      activeView.style.display = 'block';
      // Small delay to trigger CSS transitions
      setTimeout(() => {
        activeView.classList.add('active');
      }, 20);
    }

    // Highlight active links in navigation
    document.querySelectorAll('.nav-link, .nav-mobile-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      
      // Highlight parent link if on a sub-anchor
      const isParentMatch = href === hash || 
        (hash === '#difference' && href === '#about') || 
        (hash === '#journey' && href === '#wellness-care') ||
        (hash === '#wellness-treatments' && href === '#wellness-care') ||
        (hash === '#medical-treatments' && href === '#medical-care') ||
        (hash === '#medical-journey' && href === '#medical-care') ||
        (hash === '#faq' && href === '#contact');

      if (isParentMatch) {
        link.classList.add('active');
      }
    });

    // Handle sub-anchor scroll, otherwise scroll to top
    const isSubAnchor = ['#difference', '#why-us', '#journey', '#faq', '#wellness-treatments', '#medical-treatments', '#medical-journey'].includes(hash);
    if (isSubAnchor) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        const headerHeight = header.offsetHeight;
        const targetPos = element.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  // Attach event listeners for routing
  window.addEventListener('hashchange', navigate);
  // Trigger initial routing check
  navigate();


  // ---- Scroll Reveal Animations ----
  const animateElements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  animateElements.forEach((el, index) => {
    const parent = el.parentElement;
    const siblings = parent.querySelectorAll('.animate-on-scroll');
    if (siblings.length > 1) {
      const siblingIndex = Array.from(siblings).indexOf(el);
      el.dataset.delay = siblingIndex * 100;
    }
    observer.observe(el);
  });


  // ---- Booking Form Setup ----
  const bookingForm = document.getElementById('bookingForm');
  const dateInput = document.getElementById('date');

  // Set min date to today
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);
  }

  // ---- Date Change → Load Available Slots ----
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      const selectedDate = dateInput.value;
      if (selectedDate) {
        loadAvailableSlots(selectedDate);
      } else {
        resetTimeSlots();
      }
    });
  }

  // ---- Form Submission → WhatsApp + Firestore ----
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!currentUser) {
        handleAuthClick();
        return;
      }

      if (selectedTreatments.length === 0) {
        alert('Please select at least one treatment package.');
        return;
      }

      const submitBtn = document.getElementById('bookingSubmitBtn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoader = submitBtn.querySelector('.btn-loader');

      btnText.style.display = 'none';
      btnLoader.style.display = 'inline';
      submitBtn.disabled = true;

      const formData = {
        treatments: selectedTreatments,
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        timeLabel: document.getElementById('time').options[document.getElementById('time').selectedIndex].text,
        requests: document.getElementById('requests').value,
      };

      try {
        // Save to Firestore with treatments array and user ID
        await db.collection('bookings').add({
          userId: currentUser.uid,
          userName: currentUser.displayName || formData.fullName,
          userEmail: currentUser.email || '',
          treatments: formData.treatments,
          fullName: formData.fullName,
          phone: formData.phone,
          date: formData.date,
          time: formData.time,
          requests: formData.requests,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // WhatsApp message composition
        const message = buildWhatsAppMessage(formData);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        // Show modal
        const modalSlotInfo = document.getElementById('modalSlotInfo');
        modalSlotInfo.textContent = `📅 ${formatDate(formData.date)} at ${formData.timeLabel}`;
        document.getElementById('successModal').classList.add('active');

        // Reset
        bookingForm.reset();
        selectedTreatments = [];
        updateSelectedChips();
        // Reset checkable elements in dropdown
        document.querySelectorAll('#multiSelectDropdown input[type="checkbox"]').forEach(chk => {
          chk.checked = false;
        });

        if (currentUser.displayName) {
          document.getElementById('fullName').value = currentUser.displayName;
        }
        resetTimeSlots();

      } catch (error) {
        console.error('Booking error:', error);
        alert('There was an issue submitting your booking. Please try again.');
      } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
      }
    });
  }


  // ---- Active Nav Link Highlight ----
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });


  // ---- Parallax-like subtle effect on hero ----
  const heroPattern = document.querySelector('.hero-bg-pattern');
  if (heroPattern) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroPattern.style.transform = `translateY(${scrolled * 0.15}px)`;
      }
    });
  }

});


/* ============================================================
   SLOT MANAGEMENT — Firestore Real-time
   ============================================================ */

function loadAvailableSlots(dateStr) {
  const timeSelect = document.getElementById('time');
  const formGroup = timeSelect.closest('.form-group');

  timeSelect.innerHTML = '<option value="">Loading available slots...</option>';
  timeSelect.disabled = true;
  formGroup.classList.add('loading');

  if (activeDateListener) {
    activeDateListener();
    activeDateListener = null;
  }

  activeDateListener = db.collection('bookings')
    .where('date', '==', dateStr)
    .onSnapshot((snapshot) => {
      const bookedSlots = new Set();
      snapshot.forEach(doc => {
        bookedSlots.add(doc.data().time);
      });
      updateTimeSlotsDropdown(bookedSlots);
      formGroup.classList.remove('loading');
    }, (error) => {
      console.error('Firestore listener error:', error);
      updateTimeSlotsDropdown(new Set());
      formGroup.classList.remove('loading');
    });
}

function updateTimeSlotsDropdown(bookedSlots) {
  const timeSelect = document.getElementById('time');
  const availableCount = ALL_TIME_SLOTS.filter(slot => !bookedSlots.has(slot.value)).length;

  timeSelect.innerHTML = '';
  timeSelect.disabled = false;

  if (availableCount === 0) {
    timeSelect.innerHTML = '<option value="">All slots booked for this date</option>';
    timeSelect.disabled = true;
    timeSelect.closest('.form-group').classList.add('no-slots');
  } else {
    timeSelect.closest('.form-group').classList.remove('no-slots');
    timeSelect.innerHTML = '<option value="">Select a time slot...</option>';

    ALL_TIME_SLOTS.forEach(slot => {
      const option = document.createElement('option');
      option.value = slot.value;

      if (bookedSlots.has(slot.value)) {
        option.textContent = `${slot.label}  —  🔒 Booked`;
        option.disabled = true;
        option.classList.add('slot-booked');
      } else {
        option.textContent = slot.label;
      }

      timeSelect.appendChild(option);
    });
  }
}

function resetTimeSlots() {
  const timeSelect = document.getElementById('time');
  if (!timeSelect) return;

  if (activeDateListener) {
    activeDateListener();
    activeDateListener = null;
  }

  timeSelect.disabled = false;
  timeSelect.closest('.form-group').classList.remove('no-slots', 'loading');
  timeSelect.innerHTML = `
    <option value="">Select a time slot...</option>
    ${ALL_TIME_SLOTS.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
  `;
}


/* ============================================================
   WHATSAPP MESSAGE BUILDER (Multi-treatment support)
   ============================================================ */

function buildWhatsAppMessage(data) {
  const dateFormatted = formatDate(data.date);

  let message = `🌿 *NEW BOOKING — Dhari Ceylon Wellness*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `🧖 *Treatment Package(s):*\n`;
  let totalCost = 0;
  data.treatments.forEach(t => {
    message += `  • ${t.name} ($${t.price})\n`;
    totalCost += Number(t.price);
  });
  message += `\n💵 *Total Price:* $${totalCost}\n\n`;

  message += `👤 *Name:* ${data.fullName}\n`;
  if (currentUser && currentUser.email) {
    message += `📧 *Email:* ${currentUser.email}\n`;
  }
  if (data.phone) {
    message += `📱 *Phone:* ${data.phone}\n`;
  }
  message += `\n📅 *Date:* ${dateFormatted}\n`;
  message += `🕐 *Time:* ${data.timeLabel}\n`;
  if (data.requests) {
    message += `\n📝 *Special Requests:*\n${data.requests}\n`;
  }
  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  message += `_Sent from dhariceylon.com_`;

  return message;
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}


/* ============================================================
   FAQ TOGGLE
   ============================================================ */
function toggleFaq(button) {
  const item = button.closest('.faq-item');
  const isActive = item.classList.contains('active');

  document.querySelectorAll('.faq-item').forEach(faq => {
    faq.classList.remove('active');
  });

  if (!isActive) {
    item.classList.add('active');
  }
}


/* ============================================================
   MODAL
   ============================================================ */
function closeModal() {
  document.getElementById('successModal').classList.remove('active');
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'successModal') {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});


/* ============================================================
   THEME COLOR SWITCHER INTERACTIVE PREVIEW
   ============================================================ */
function setThemeColor(theme) {
  const root = document.documentElement;
  const hero = document.getElementById('hero');
  const ctaFinal = document.querySelector('.cta-final');
  
  // Reset active button class
  document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-theme-${theme}`);
  if (activeBtn) activeBtn.classList.add('active');
  
  let deep, rgb, medium, gradHero, gradCta;
  
  switch(theme) {
    case 'original':
      deep = '#1A4D2E'; rgb = '26, 77, 46'; medium = '#2D6A4F';
      gradHero = 'linear-gradient(165deg, #1A4D2E 0%, #163D27 40%, #0F2E1C 100%)';
      gradCta = 'linear-gradient(165deg, #1A4D2E 0%, #163D27 50%, #0F2E1C 100%)';
      break;
    case 'emerald':
      deep = '#0A2E26'; rgb = '10, 46, 38'; medium = '#114B3E';
      gradHero = 'linear-gradient(165deg, #0A2E26 0%, #071F1A 50%, #03100D 100%)';
      gradCta = 'linear-gradient(165deg, #0A2E26 0%, #071F1A 50%, #03100D 100%)';
      break;
    case 'terracotta':
      deep = '#3A231E'; rgb = '58, 35, 30'; medium = '#5A372F';
      gradHero = 'linear-gradient(165deg, #3A231E 0%, #291815 50%, #170E0C 100%)';
      gradCta = 'linear-gradient(165deg, #3A231E 0%, #291815 50%, #170E0C 100%)';
      break;
    case 'slate':
      deep = '#1C1F1E'; rgb = '28, 31, 30'; medium = '#2E3331';
      gradHero = 'linear-gradient(165deg, #1C1F1E 0%, #131514 50%, #0B0C0B 100%)';
      gradCta = 'linear-gradient(165deg, #1C1F1E 0%, #131514 50%, #0B0C0B 100%)';
      break;
    // Rich / Luxurious Colors
    case 'plum':
      deep = '#33142A'; rgb = '51, 20, 42'; medium = '#4A1E3D';
      gradHero = 'linear-gradient(165deg, #33142A 0%, #1F0C19 50%, #0F060C 100%)';
      gradCta = 'linear-gradient(165deg, #33142A 0%, #1F0C19 50%, #0F060C 100%)';
      break;
    case 'navy':
      deep = '#0D1F2D'; rgb = '13, 31, 45'; medium = '#173347';
      gradHero = 'linear-gradient(165deg, #0D1F2D 0%, #08131B 50%, #03080B 100%)';
      gradCta = 'linear-gradient(165deg, #0D1F2D 0%, #08131B 50%, #03080B 100%)';
      break;
    case 'amber':
      deep = '#4E2612'; rgb = '78, 38, 18'; medium = '#6D371E';
      gradHero = 'linear-gradient(165deg, #4E2612 0%, #30170A 50%, #170B05 100%)';
      gradCta = 'linear-gradient(165deg, #4E2612 0%, #30170A 50%, #170B05 100%)';
      break;
    case 'bronze':
      deep = '#3A3A1C'; rgb = '58, 58, 28'; medium = '#54542B';
      gradHero = 'linear-gradient(165deg, #3A3A1C 0%, #242411 50%, #121208 100%)';
      gradCta = 'linear-gradient(165deg, #3A3A1C 0%, #242411 50%, #121208 100%)';
      break;
    case 'burgundy':
      deep = '#3D1016'; rgb = '61, 16, 22'; medium = '#591B22';
      gradHero = 'linear-gradient(165deg, #3D1016 0%, #260A0D 50%, #130506 100%)';
      gradCta = 'linear-gradient(165deg, #3D1016 0%, #260A0D 50%, #130506 100%)';
      break;
    // Calm / Serene Colors
    case 'lavender':
      deep = '#2E2A3A'; rgb = '46, 42, 58'; medium = '#443E54';
      gradHero = 'linear-gradient(165deg, #2E2A3A 0%, #1C1A24 50%, #0E0D12 100%)';
      gradCta = 'linear-gradient(165deg, #2E2A3A 0%, #1C1A24 50%, #0E0D12 100%)';
      break;
    case 'clay':
      deep = '#453128'; rgb = '69, 49, 40'; medium = '#5E453A';
      gradHero = 'linear-gradient(165deg, #453128 0%, #2A1E18 50%, #150F0C 100%)';
      gradCta = 'linear-gradient(165deg, #453128 0%, #2A1E18 50%, #150F0C 100%)';
      break;
    case 'tealsage':
      deep = '#1B3333'; rgb = '27, 51, 51'; medium = '#2A4B4B';
      gradHero = 'linear-gradient(165deg, #1B3333 0%, #102020 50%, #081010 100%)';
      gradCta = 'linear-gradient(165deg, #1B3333 0%, #102020 50%, #081010 100%)';
      break;
    case 'espresso':
      deep = '#261E1A'; rgb = '38, 30, 26'; medium = '#3D322C';
      gradHero = 'linear-gradient(165deg, #261E1A 0%, #171210 50%, #0B0908 100%)';
      gradCta = 'linear-gradient(165deg, #261E1A 0%, #171210 50%, #0B0908 100%)';
      break;
    case 'mintsage':
      deep = '#23382F'; rgb = '35, 56, 47'; medium = '#345245';
      gradHero = 'linear-gradient(165deg, #23382F 0%, #16241E 50%, #0B120F 100%)';
      gradCta = 'linear-gradient(165deg, #23382F 0%, #16241E 50%, #0B120F 100%)';
      break;
    // Light & Soothing Tones
    case 'linen':
      deep = '#4E3629'; rgb = '78, 54, 41'; medium = '#6E503F';
      gradHero = 'linear-gradient(165deg, #FAF5F0 0%, #F0E6D8 50%, #E6D8C4 100%)';
      gradCta = 'linear-gradient(165deg, #FAF5F0 0%, #F0E6D8 50%, #E6D8C4 100%)';
      break;
    case 'mint':
      deep = '#1B4332'; rgb = '27, 67, 50'; medium = '#2D6A4F';
      gradHero = 'linear-gradient(165deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)';
      gradCta = 'linear-gradient(165deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)';
      break;
    case 'rose':
      deep = '#5A2229'; rgb = '90, 34, 41'; medium = '#78353E';
      gradHero = 'linear-gradient(165deg, #FFF0F2 0%, #F8D7DA 50%, #F5C6CB 100%)';
      gradCta = 'linear-gradient(165deg, #FFF0F2 0%, #F8D7DA 50%, #F5C6CB 100%)';
      break;
    case 'sky':
      deep = '#1A237E'; rgb = '26, 35, 126'; medium = '#283593';
      gradHero = 'linear-gradient(165deg, #E8EAF6 0%, #C5CAE9 50%, #9FA8DA 100%)';
      gradCta = 'linear-gradient(165deg, #E8EAF6 0%, #C5CAE9 50%, #9FA8DA 100%)';
      break;
    case 'ivory':
      deep = '#3E2723'; rgb = '62, 39, 35'; medium = '#4E342E';
      gradHero = 'linear-gradient(165deg, #FFFFF7 0%, #F7F5DE 50%, #EFECC0 100%)';
      gradCta = 'linear-gradient(165deg, #FFFFF7 0%, #F7F5DE 50%, #EFECC0 100%)';
      break;
    default:
      return;
  }

  // Toggle light-theme styling on document root
  const isLightTheme = ['linen', 'mint', 'rose', 'sky', 'ivory'].includes(theme);
  if (isLightTheme) {
    document.documentElement.classList.add('light-theme');
  } else {
    document.documentElement.classList.remove('light-theme');
  }
  
  root.style.setProperty('--green-deep', deep);
  root.style.setProperty('--green-deep-rgb', rgb);
  root.style.setProperty('--green-medium', medium);
  if (hero) hero.style.background = gradHero;
  if (ctaFinal) ctaFinal.style.background = gradCta;
}

/* ============================================================
   DYNAMIC GALLERY SYSTEM
   ============================================================ */
let galleryListener = null;
let loadedGalleryItems = [];

function initGallerySystem() {
  galleryListener = db.collection('gallery')
    .onSnapshot((snapshot) => {
      loadedGalleryItems = [];
      snapshot.forEach(doc => {
        loadedGalleryItems.push({ id: doc.id, ...doc.data() });
      });

      // Sort gallery items by createdAt desc
      loadedGalleryItems.sort((a, b) => {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });

      renderGalleryUI();
    }, (error) => {
      console.error('Gallery snapshot listener error:', error);
    });
}

function getGoogleDriveFileId(url) {
  if (!url) return null;
  
  // Try matching /file/d/FILE_ID/
  const dMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch) return dMatch[1];
  
  // Try matching ?id=FILE_ID or &id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  
  // Fallback to matching any 25+ character hash containing alphanumeric, dashes, and underscores
  const genericMatch = url.match(/([a-zA-Z0-9_-]{25,})/);
  return genericMatch ? genericMatch[1] : null;
}

function parseGoogleDriveUrl(url, type) {
  if (!url) return url;
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const fileId = getGoogleDriveFileId(url);
    if (fileId) {
      // Both images and videos on Google Drive must use the preview endpoint inside an iframe
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }
  return url;
}

function getEmbedUrl(url) {
  if (!url) return '';
  // YouTube RegExp
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const ytMatch = url.match(ytRegExp);
  if (ytMatch && ytMatch[2].length === 11) {
    return `https://www.youtube.com/embed/${ytMatch[2]}?autoplay=0&rel=0`;
  }
  // Vimeo RegExp
  const vimeoRegExp = /vimeo\.com\/(?:video\/)?([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegExp);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0`;
  }
  // Google Drive Preview (both images and videos)
  if (url.includes('drive.google.com') && url.includes('/preview')) {
    return url;
  }
  return '';
}

function renderGalleryUI() {
  const grid = document.getElementById('galleryGrid');
  const uploadFormCard = document.getElementById('adminGalleryUpload');
  if (!grid) return;

  grid.innerHTML = '';

  // Show/Hide Admin upload dashboard inline based on current user state
  const isUserAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);
  if (uploadFormCard) {
    uploadFormCard.style.display = isUserAdmin ? 'block' : 'none';
  }

  if (loadedGalleryItems.length === 0) {
    grid.innerHTML = '<p class="no-data-msg" style="grid-column: 1/-1; text-align: center; color:var(--text-muted);">No media files added to the sanctuary gallery yet.</p>';
    return;
  }

  loadedGalleryItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-item animate-on-scroll visible';

    // Resolve Google Drive links to preview links
    const resolvedUrl = parseGoogleDriveUrl(item.url, item.type);
    const isGoogleDriveEmbed = resolvedUrl.includes('drive.google.com') && resolvedUrl.includes('/preview');

    let mediaHtml = '';
    if (item.type === 'video' || isGoogleDriveEmbed) {
      const embedUrl = getEmbedUrl(resolvedUrl);
      if (embedUrl) {
        mediaHtml = `
          <iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"></iframe>
        `;
      } else {
        mediaHtml = `
          <video autoplay loop muted playsinline controls style="width:100%; height:100%; object-fit:cover;" src="${resolvedUrl}">
            Your browser does not support the video tag.
          </video>
        `;
      }
    } else {
      mediaHtml = `<img src="${resolvedUrl}" alt="${item.caption || 'Gallery Image'}" style="width:100%; height:100%; object-fit:cover;">`;
    }

    const captionHtml = item.caption ? `
      <div class="gallery-item-caption">
        <p>${item.caption}</p>
      </div>
    ` : '';

    card.innerHTML = `
      <div class="gallery-media-wrapper">
        ${mediaHtml}
        ${isUserAdmin ? `<button class="gallery-delete-btn" onclick="deleteGalleryItem('${item.id}', '${(item.caption || 'Media File').replace(/'/g, "\\'")}')">Delete</button>` : ''}
      </div>
      ${captionHtml}
    `;

    grid.appendChild(card);
  });
}

async function handleGalleryUpload(e) {
  e.preventDefault();
  if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email)) {
    alert('Unauthorized write access.');
    return;
  }

  const url = document.getElementById('galleryUrl').value;
  const type = document.getElementById('galleryType').value;
  const caption = document.getElementById('galleryCaption').value;

  try {
    await db.collection('gallery').add({
      url: url,
      type: type,
      caption: caption,
      createdAt: new Date().toISOString()
    });
    alert('Media uploaded to gallery successfully!');
    document.getElementById('galleryUploadForm').reset();
  } catch (error) {
    console.error('Gallery upload error:', error);
    alert('Failed to upload gallery media: ' + error.message);
  }
}

async function deleteGalleryItem(itemId, caption) {
  if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email)) {
    alert('Unauthorized write access.');
    return;
  }

  const confirmed = confirm(`Are you sure you want to delete "${caption}" from the gallery?`);
  if (!confirmed) return;

  try {
    await db.collection('gallery').doc(itemId).delete();
    alert('Media deleted successfully.');
  } catch (error) {
    console.error('Gallery delete error:', error);
    alert('Failed to delete media: ' + error.message);
  }
}

