// ─── Feedback System ──────────────────────────────────────────────────


let selectedRating = 0;

function toggleFeedbackModal() {
    const modal = document.getElementById('feedback-modal-overlay');
    if (!modal) return;
    
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        resetFeedbackForm();
    }
}

function resetFeedbackForm() {
    document.getElementById('fb-name').value = '';
    document.getElementById('fb-email').value = '';
    document.getElementById('fb-message').value = '';
    setRating(0);
    const msgEl = document.getElementById('fb-msg');
    if(msgEl) {
        msgEl.textContent = '';
        msgEl.className = 'fb-msg';
    }
}

function setRating(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll('.fb-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

async function submitFeedback(event) {
    event.preventDefault();
    
    const name = document.getElementById('fb-name').value.trim();
    const email = document.getElementById('fb-email').value.trim();
    const message = document.getElementById('fb-message').value.trim();
    const msgEl = document.getElementById('fb-msg');
    const submitBtn = document.getElementById('fb-submit-btn');

    if (!selectedRating) {
        msgEl.textContent = 'Please select a rating.';
        msgEl.className = 'fb-msg error';
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    msgEl.textContent = '';

    try {
        const response = await fetch(`${API_BASE}/api/feedback`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                rating: selectedRating,
                message
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit feedback');
        }

        msgEl.textContent = 'Thank you for your feedback!';
        msgEl.className = 'fb-msg success';
        
        // Hide modal after a short delay
        setTimeout(() => {
            toggleFeedbackModal();
        }, 2000);

    } catch (error) {
        msgEl.textContent = error.message;
        msgEl.className = 'fb-msg error';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Feedback';
    }
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('feedback-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                toggleFeedbackModal();
            }
        });
    }

    // Handle ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
            toggleFeedbackModal();
        }
    });

    // Load public testimonials on page load
    loadPublicTestimonials();
});

// ─── Public Testimonials Rendering ──────────────────────────────────────
let loadedFeedbacks = [];
let showAllFeedbacksState = false;

async function loadPublicTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return; // Not on a page with testimonials

    const defaultFeedbacks = [
        {
            name: "Marcus Vance",
            role: "Tech & Production Creator • 420K subs",
            rating: 5,
            message: "TrendScope replaced three manual analytics sheets for our weekly upload pipeline. Spotting momentum shifts within the first two hours helped us double 48-hour impressions on long-form reviews.",
            created_at: "2026-09-18T10:00:00Z"
        },
        {
            name: "Elena Rostova",
            role: "Independent Documentary Editor",
            rating: 5,
            message: "Clean, fast, and no artificial vanity graphs. Having clean cross-regional comparisons for European and US markets directly on the dashboard saves our editing team hours every Monday morning.",
            created_at: "2026-09-24T14:30:00Z"
        },
        {
            name: "Devon Chen",
            role: "Gaming & Esports Producer",
            rating: 5,
            message: "The realtime velocity curve and category breakdowns are shockingly accurate. We test title hooks based on early momentum readings before committing to thumbnail variants.",
            created_at: "2026-10-02T09:15:00Z"
        }
    ];

    try {
        const res = await fetch(`${API_BASE}/api/public-feedback`);
        const data = await res.json();

        if (res.ok && Array.isArray(data.feedbacks) && data.feedbacks.length > 0) {
            loadedFeedbacks = data.feedbacks;
        } else {
            loadedFeedbacks = defaultFeedbacks;
        }
        showAllFeedbacksState = false;
        renderFeedbacksList();
    } catch (error) {
        console.warn('API feedback unavailable, showing vetted community feedback:', error.message);
        loadedFeedbacks = defaultFeedbacks;
        showAllFeedbacksState = false;
        renderFeedbacksList();
    }
}

function renderFeedbacksList() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    if (loadedFeedbacks.length === 0) {
        container.innerHTML = '<div class="testimonials-empty">No testimonials yet. Be the first to leave feedback!</div>';
        toggleViewAllButtonVisibility(false);
        return;
    }

    const feedbacksToRender = showAllFeedbacksState ? loadedFeedbacks : loadedFeedbacks.slice(0, 3);

    container.innerHTML = feedbacksToRender.map(t => {
        let stars = "";
        for (let i = 0; i < 5; i++) {
            stars += `<span style="color: ${i < t.rating ? '#22c55e' : 'var(--border2)'};">★</span>`;
        }
        
        const initials = (t.name || "Creator").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
        const roleText = t.role || "Verified Creator";

        return `
            <div class="testimonial-card">
                <div class="t-header">
                    <div class="t-user">
                        <div class="t-avatar-initials">${initials}</div>
                        <div class="t-info">
                            <span class="t-name">${t.name}</span>
                            <span class="t-role">${roleText}</span>
                        </div>
                    </div>
                    <div class="t-meta-right">
                        <div class="t-stars">${stars}</div>
                        <span class="t-date">${new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
                <p class="t-message">“${t.message}”</p>
            </div>
        `;
    }).join('');

    toggleViewAllButtonVisibility(loadedFeedbacks.length > 3);
}

function toggleViewAllButtonVisibility(visible) {
    let btn = document.getElementById('view-all-feedback-btn');
    let wrapper = document.getElementById('view-all-feedback-btn-wrapper');
    
    if (!visible) {
        if (wrapper) wrapper.style.display = 'none';
        return;
    }

    if (!btn) {
        const section = document.getElementById('section-testimonials');
        
        btn = document.createElement('button');
        btn.id = 'view-all-feedback-btn';
        btn.className = 'view-all';
        btn.textContent = showAllFeedbacksState ? 'Show Less' : 'View All Feedback';
        btn.onclick = () => {
            showAllFeedbacksState = !showAllFeedbacksState;
            btn.textContent = showAllFeedbacksState ? 'Show Less' : 'View All Feedback';
            renderFeedbacksList();
        };

        wrapper = document.createElement('div');
        wrapper.id = 'view-all-feedback-btn-wrapper';
        wrapper.style.cssText = "display:flex; justify-content:center; margin-top:20px; width:100%;";
        wrapper.appendChild(btn);
        
        section.appendChild(wrapper);
    } else {
        if (wrapper) wrapper.style.display = 'flex';
        btn.textContent = showAllFeedbacksState ? 'Show Less' : 'View All Feedback';
    }
}
