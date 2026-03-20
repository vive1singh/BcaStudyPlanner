'use strict';

/* ============================================================
   0. LOGIN GUARD
============================================================ */
(function loginGuard() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page !== 'login.html' && localStorage.getItem('bca_logged_in') !== 'true') {
    location.href = 'login.html';
  }
})();

/* ============================================================
   0B. SEMESTER INIT
============================================================ */
(function initSemester() {
  const sem = localStorage.getItem('bca_semester') || '4';

  document.querySelectorAll('.current-sem-label').forEach(el => {
    el.textContent = 'Semester ' + sem;
  });

  document.querySelectorAll('.semester-card').forEach(card => {
    const cardSem = card.dataset.sem;
    if (!cardSem) return;

    if (cardSem === sem) {
      card.style.borderColor = 'rgba(255,204,51,0.65)';
      card.style.boxShadow = '0 0 0 3px rgba(255,204,51,0.15)';
    } else if (parseInt(cardSem) < parseInt(sem)) {
      card.style.opacity = '0.50';
    } else {
      card.style.opacity = '0.28';
    }
  });

  const isSubjectPage = !!document.querySelector('.sem-subjects');

  if (!isSubjectPage) {
    document.querySelectorAll('.timetable tbody tr').forEach(row => {
      const semCell = row.querySelector('td:first-child');
      if (!semCell) return;
      const rowSem = semCell.textContent.replace('S', '').trim();
      if (rowSem && rowSem !== sem) row.style.display = 'none';
    });
  }

  const heroSub = document.querySelector('.hero-subtitle');
  if (heroSub && !heroSub.dataset.semSet) {
    heroSub.dataset.semSet = '1';
    heroSub.innerHTML += ' <span class="hero-accent">· Semester ' + sem + '</span>';
  }

  const pageHeroTitle = document.querySelector('.page-hero-inner h1');
  if (pageHeroTitle && !pageHeroTitle.dataset.semSet) {
    pageHeroTitle.dataset.semSet = '1';
    pageHeroTitle.innerHTML += ' <span class="sem-badge-inline">· S' + sem + '</span>';
  }
})();

/* ============================================================
   1. THEME TOGGLE
============================================================ */
const themeBtn = document.getElementById('themeToggle');

(function initTheme() {
  const saved = localStorage.getItem('bca_theme');
  if (saved === 'dark') applyDark(false);
  else applyLight(false);
})();

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.contains('dark-mode') ? applyLight(true) : applyDark(true);
  });
}

function applyDark(save) {
  document.body.classList.remove('light-mode');
  document.body.classList.add('dark-mode');
  if (save) localStorage.setItem('bca_theme', 'dark');
  if (themeBtn) themeBtn.textContent = 'Light Mode';
}

function applyLight(save) {
  document.body.classList.remove('dark-mode');
  document.body.classList.add('light-mode');
  if (save) localStorage.setItem('bca_theme', 'light');
  if (themeBtn) themeBtn.textContent = 'Aurora Dark';
}

/* ============================================================
   2. SCROLL PROGRESS BAR
============================================================ */
const progressFill = document.querySelector('.scroll-progress-fill');

if (progressFill) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressFill.style.width = scrolled + '%';
  });
}

/* ============================================================
   3. ACTIVE NAV LINK
============================================================ */
document.querySelectorAll('.nav-link').forEach(link => {
  link.classList.remove('active');
  const linkPath = link.getAttribute('href');
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  if (linkPath === currentFile) link.classList.add('active');
});

/* ============================================================
   4. CALENDAR — Study Day Toggle
============================================================ */
const calDays = document.querySelectorAll('.cal-table td.day');

if (calDays.length) {
  calDays.forEach(cell => {
    const date = cell.dataset.date;
    if (date && localStorage.getItem('study_' + date) === '1') {
      cell.classList.add('study');
    }
  });

  calDays.forEach(cell => {
    cell.addEventListener('click', () => {
      if (cell.classList.contains('exam') || cell.classList.contains('holiday')) return;

      cell.classList.toggle('study');
      const date = cell.dataset.date;

      if (cell.classList.contains('study')) {
        localStorage.setItem('study_' + date, '1');
        showToast('📚 Study day marked!', 'green');
      } else {
        localStorage.removeItem('study_' + date);
        showToast('Unmarked', 'yellow');
      }

      updateStudyCount();
    });
  });

  updateStudyCount();
}

function updateStudyCount() {
  const countEl = document.getElementById('studyDayCount');
  if (!countEl) return;
  countEl.textContent = document.querySelectorAll('.cal-table td.day.study').length;
}

/* ============================================================
   5. NOTES PAGE
============================================================ */
const textarea = document.getElementById('noteTextarea');
const wordCountEl = document.getElementById('wordCount');
const charCountEl = document.getElementById('charCount');
const lineCountEl = document.getElementById('lineCount');
const saveStatus = document.getElementById('saveStatus');
const noteWords = document.getElementById('noteWords');
const noteChars = document.getElementById('noteChars');
const noteLines = document.getElementById('noteLines');

if (textarea) {
  const savedNote = localStorage.getItem('bca_note');
  if (savedNote) {
    textarea.value = savedNote;
    updateNoteStats();
  }

  let saveTimer;

  textarea.addEventListener('input', () => {
    updateNoteStats();
    clearTimeout(saveTimer);
    if (saveStatus) saveStatus.textContent = 'Saving…';

    saveTimer = setTimeout(() => {
      localStorage.setItem('bca_note', textarea.value);
      if (saveStatus) saveStatus.textContent = 'Saved ✓';
    }, 800);
  });

  textarea.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
    }
  });
}

function updateNoteStats() {
  if (!textarea) return;

  const text = textarea.value;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;
  const lines = text === '' ? 1 : text.split('\n').length;

  if (wordCountEl) wordCountEl.textContent = words + ' words';
  if (charCountEl) charCountEl.textContent = chars + ' chars';
  if (lineCountEl) lineCountEl.textContent = lines + ' lines';
  if (noteWords) noteWords.textContent = words;
  if (noteChars) noteChars.textContent = chars;
  if (noteLines) noteLines.textContent = lines;
}

document.querySelectorAll('.qtag').forEach(tag => {
  tag.addEventListener('click', () => {
    if (!textarea) return;
    const insert = ' #' + tag.textContent.trim();
    const pos = textarea.selectionStart;
    textarea.value = textarea.value.slice(0, pos) + insert + textarea.value.slice(pos);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = pos + insert.length;
    textarea.dispatchEvent(new Event('input'));
  });
});

const btnClear = document.getElementById('btnClear');
const btnCopy = document.getElementById('btnCopy');
const btnDownload = document.getElementById('btnDownload');

if (btnClear) {
  btnClear.addEventListener('click', () => {
    if (!textarea) return;
    if (confirm('Clear all notes? This cannot be undone.')) {
      textarea.value = '';
      localStorage.removeItem('bca_note');
      textarea.dispatchEvent(new Event('input'));
      if (saveStatus) saveStatus.textContent = 'Cleared';
      showToast('Notes cleared', 'red');
    }
  });
}

if (btnCopy) {
  btnCopy.addEventListener('click', () => {
    if (!textarea || textarea.value.trim() === '') {
      showToast('Nothing to copy!', 'yellow');
      return;
    }

    navigator.clipboard.writeText(textarea.value).then(() => {
      btnCopy.textContent = 'Copied!';
      showToast('📋 Copied!', 'green');
      setTimeout(() => {
        btnCopy.textContent = 'Copy';
      }, 1800);
    });
  });
}

if (btnDownload) {
  btnDownload.addEventListener('click', () => {
    if (!textarea || textarea.value.trim() === '') {
      showToast('Nothing to download!', 'yellow');
      return;
    }

    const blob = new Blob([textarea.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toLocaleDateString('en-IN').replace(/\//g, '-');
    a.href = url;
    a.download = 'BCA_Notes_' + date + '.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Notes downloaded!', 'green');
  });
}

/* ============================================================
   6. SUBJECTS PAGE — SEM TABS + SGPA
============================================================ */
const semTabBtns = document.querySelectorAll('.sem-tab-btn');

if (semTabBtns.length) {
  const savedSem = localStorage.getItem('bca_semester') || '1';

  function switchSemPanel(sem) {
    document.querySelectorAll('.sem-subjects').forEach(panel => {
      panel.classList.add('hidden');
    });

    const target = document.getElementById('sem-panel-' + sem);
    if (target) target.classList.remove('hidden');

    semTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sem === sem);
    });
  }

  switchSemPanel(savedSem);

  semTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchSemPanel(btn.dataset.sem);
    });
  });
}

const calcBtn = document.getElementById('calcGpa');
const gpaResult = document.getElementById('gpaResult');
const gpaGrade = document.getElementById('gpaGrade');

if (calcBtn) {
  calcBtn.addEventListener('click', () => {
    const visiblePanel = document.querySelector('.sem-subjects:not(.hidden)');
    if (!visiblePanel) return;

    const rows = visiblePanel.querySelectorAll('.subject-row');
    let totalPoints = 0;
    let totalCredits = 0;

    rows.forEach(row => {
      const gradeEl = row.querySelector('.grade-select');
      const creditEl = row.querySelector('.credit-input');
      if (!gradeEl || !creditEl) return;

      const grade = parseFloat(gradeEl.value) || 0;
      const credits = parseFloat(creditEl.value) || 0;

      if (credits > 0) {
        totalPoints += grade * credits;
        totalCredits += credits;
      }
    });

    const sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

    if (gpaResult) {
      gpaResult.textContent = sgpa;
      gpaResult.style.color =
        sgpa >= 9 ? '#00ffaa' :
        sgpa >= 7.5 ? '#a78bff' :
        sgpa >= 6 ? '#ffcc33' :
        sgpa >= 5 ? '#ff7a33' : '#ff6384';
    }

    if (gpaGrade) {
      gpaGrade.textContent =
        sgpa >= 9 ? 'Outstanding 🏆' :
        sgpa >= 8 ? 'Excellent ⭐' :
        sgpa >= 7 ? 'Very Good 👍' :
        sgpa >= 6 ? 'Good 📘' :
        sgpa >= 5 ? 'Average 📝' : 'Need to improve 💪';
    }

    localStorage.setItem('bca_sgpa', sgpa);
    showToast('SGPA: ' + sgpa, 'green');
  });
}

/* ============================================================
   7. COUNTDOWN TIMERS
============================================================ */
function updateCountdowns() {
  document.querySelectorAll('[data-exam-date]').forEach(el => {
    const examDate = new Date(el.dataset.examDate);
    const diff = examDate - new Date();

    if (isNaN(diff)) {
      el.textContent = 'Invalid date';
      return;
    }

    if (diff <= 0) {
      el.textContent = '🔴 Exam Today / Over';
      el.style.color = '#ff6384';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    el.textContent =
      days > 0 ? days + 'd ' + hours + 'h left' :
      hours > 0 ? hours + 'h ' + mins + 'm left' :
      mins + 'm left';

    el.style.color = days <= 1 ? '#ff6384' : days <= 5 ? '#ffcc33' : '#00ffaa';
  });
}

if (document.querySelector('[data-exam-date]')) {
  updateCountdowns();
  setInterval(updateCountdowns, 30000);
}

/* ============================================================
   8. PROGRESS BARS
============================================================ */
window.addEventListener('load', () => {
  document.querySelectorAll('.progress-fill').forEach(bar => {
    const target = bar.dataset.width || '0%';
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.transition = 'width 0.8s ease';
      bar.style.width = target;
    }, 300);
  });
});

/* ============================================================
   9. STUDY STREAK
============================================================ */
const streakEl = document.getElementById('streakCount');
const streakDisplay = document.getElementById('streakDisplay');

if (streakEl || streakDisplay) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const lastStudy = localStorage.getItem('bca_last_study');
  let streak = parseInt(localStorage.getItem('bca_streak')) || 0;

  if (lastStudy !== today) {
    streak = lastStudy === yesterday ? streak + 1 : 1;
    localStorage.setItem('bca_streak', streak);
    localStorage.setItem('bca_last_study', today);
  }

  if (streakEl) streakEl.textContent = streak;
  if (streakDisplay) streakDisplay.textContent = streak;

  const dashGpaDisplay = document.getElementById('dashGpaDisplay');
  if (dashGpaDisplay) {
    const saved = localStorage.getItem('bca_sgpa');
    if (saved) dashGpaDisplay.textContent = saved;
  }
}

/* ============================================================
   10. TIMETABLE ROW HIGHLIGHT
============================================================ */
document.querySelectorAll('.timetable tbody tr').forEach(row => {
  row.addEventListener('click', () => {
    document.querySelectorAll('.timetable tbody tr').forEach(r => {
      r.classList.remove('row-selected');
    });
    row.classList.add('row-selected');
  });
});

/* ============================================================
   11. SMOOTH SCROLL
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================================
   12. LOGIN PAGE
============================================================ */
const loginBtn = document.getElementById('loginBtn');

if (loginBtn) {
  if (localStorage.getItem('bca_logged_in') === 'true') {
    location.href = 'BcaStudyPlanner.html';
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') loginBtn.click();
  });

  loginBtn.addEventListener('click', () => {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const sem = document.getElementById('semSelect').value;
    const errEl = document.getElementById('loginError');

    errEl.textContent = '';

    if (!user || !pass) {
      errEl.textContent = '⚠️ Please fill in all fields.';
      return;
    }

    if (user === 'vivek' && pass === 'bca2026') {
      localStorage.clear();
      localStorage.setItem('bca_logged_in', 'true');
      localStorage.setItem('bca_semester', sem);
      loginBtn.textContent = 'Starting fresh…';
      loginBtn.disabled = true;
      setTimeout(() => {
        location.href = 'BcaStudyPlanner.html';
      }, 700);
    } else {
      errEl.textContent = '❌ Wrong username or password.';
      document.getElementById('password').value = '';
      document.getElementById('password').focus();
    }
  });
}

/* ============================================================
   13. LOGOUT
============================================================ */
const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('bca_logged_in');
    location.href = 'login.html';
  });
}

/* ============================================================
   14. TOAST
============================================================ */
function showToast(msg, type = 'green') {
  const existing = document.querySelector('.bca-toast');
  if (existing) existing.remove();

  const colors = {
    green: { bg: 'rgba(0,255,170,0.12)', border: 'rgba(0,255,170,0.4)', color: '#00ffaa' },
    yellow: { bg: 'rgba(255,204,51,0.12)', border: 'rgba(255,204,51,0.4)', color: '#ffcc33' },
    red: { bg: 'rgba(255,99,132,0.12)', border: 'rgba(255,99,132,0.4)', color: '#ff6384' }
  };

  const c = colors[type] || colors.green;

  const toast = document.createElement('div');
  toast.className = 'bca-toast';
  toast.textContent = msg;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '20px',
    zIndex: '9999',
    padding: '10px 18px',
    borderRadius: '999px',
    border: '1px solid ' + c.border,
    background: c.bg,
    color: c.color,
    fontSize: '0.8rem',
    fontFamily: '"Poppins", sans-serif',
    fontWeight: '500',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    opacity: '0',
    transform: 'translateY(12px)',
    transition: 'opacity 0.25s ease, transform 0.25s ease'
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
