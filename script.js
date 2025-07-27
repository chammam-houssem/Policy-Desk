// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    // Disable automatic scroll restoration across navigations
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Function to switch tabs
    function switchTab(targetTab) {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button
        const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Show corresponding content
        const activeContent = document.getElementById(targetTab);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        // Update URL hash without scrolling
        if (history.pushState) {
            history.pushState(null, null, `#${targetTab}`);
        } else {
            location.hash = `#${targetTab}`;
        }

        // Smooth scroll the main content area and window to the top
        const mainContentArea = document.querySelector('.main-content-area');
        if (mainContentArea) {
            mainContentArea.scrollTo({ top: 0, behavior: 'auto' });
        }
        window.scrollTo({ top: 0, behavior: 'auto' });
    }

    // Add click event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Handle initial page load with hash
    function handleInitialHash() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            switchTab(hash);
        } else {
            // Default to overview tab
            switchTab('overview');
        }
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        handleInitialHash();
    });

    // Initialize on page load
    handleInitialHash();

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Share functionality
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const url = window.location.href;
            const title = document.title;
            const platform = this.classList.contains('linkedin') ? 'linkedin' :
                           this.classList.contains('twitter') ? 'twitter' :
                           this.classList.contains('facebook') ? 'facebook' : '';

            let shareUrl = '';
            
            switch(platform) {
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                    break;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });

    // Add keyboard navigation for tabs
    document.addEventListener('keydown', function(e) {
        if (e.target.classList.contains('tab-btn')) {
            const currentIndex = Array.from(tabButtons).indexOf(e.target);
            let newIndex = currentIndex;

            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    newIndex = currentIndex > 0 ? currentIndex - 1 : tabButtons.length - 1;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    newIndex = currentIndex < tabButtons.length - 1 ? currentIndex + 1 : 0;
                    break;
                case 'Home':
                    e.preventDefault();
                    newIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    newIndex = tabButtons.length - 1;
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    e.target.click();
                    return;
            }

            if (newIndex !== currentIndex) {
                tabButtons[newIndex].focus();
            }
        }
    });

    // Add ARIA attributes for accessibility
    tabButtons.forEach((button, index) => {
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', button.classList.contains('active'));
        button.setAttribute('tabindex', button.classList.contains('active') ? '0' : '-1');
        button.setAttribute('id', `tab-${button.getAttribute('data-tab')}`);
        button.setAttribute('aria-controls', button.getAttribute('data-tab'));
    });

    tabContents.forEach(content => {
        content.setAttribute('role', 'tabpanel');
        content.setAttribute('aria-labelledby', `tab-${content.id}`);
    });

    // Update ARIA attributes when tabs change
    const originalSwitchTab = switchTab;
    switchTab = function(targetTab) {
        originalSwitchTab(targetTab);
        
        tabButtons.forEach(button => {
            const isActive = button.getAttribute('data-tab') === targetTab;
            button.setAttribute('aria-selected', isActive);
            button.setAttribute('tabindex', isActive ? '0' : '-1');
        });
    };
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    // Ensure page starts at the top even when using anchors
    const mainContentArea = document.querySelector('.main-content-area');
    if (mainContentArea) {
        mainContentArea.scrollTop = 0;
    }
    window.scrollTo(0, 0);
});

// Add scroll-based animations
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.tab-content');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate-in');
        }
    });
}

window.addEventListener('scroll', handleScrollAnimations);
handleScrollAnimations(); // Run once on load

// Popup Control Functions
function openPopup() {
  document.getElementById('popup-bg').classList.remove('hidden');
  // Prevent background scroll
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  document.getElementById('popup-bg').classList.add('hidden');
  // Restore scroll
  document.body.style.overflow = '';
}

// --- Custom JS from GDP.html ---
// Tab Navigation Functionality
function showSection(sectionId) {
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(`content-${sectionId}`).classList.add('active');

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.getElementById(`nav-${sectionId}`).classList.add('active');
}
window.showSection = showSection;
// Blog tab typewriter effect
// (No duplicate logic for typewriter effect)
document.addEventListener("DOMContentLoaded", function() {
  const tabText = document.getElementById('policy-desk-tab-text');
  const blogColon = document.getElementById('blog-colon');
  const fullText = "The Policy Desk";
  let current = "";
  let i = 0;

  tabText.style.opacity = 0;

  function typeWriter() {
    if (i === 0) {
      tabText.style.opacity = 1;
    }
    if (i < fullText.length) {
      current += fullText.charAt(i);
      tabText.textContent = current;
      i++;
      setTimeout(typeWriter, 60);
    } else {
      blogColon.style.display = '';
    }
  }
  setTimeout(typeWriter, 400);
});

// Chart.js & Top 30 Chart Logic
// (Full code from GDP.html follows)
// Top 30 GDP data
const top30Data = {
  '1995': {
    labels: [
      "United States", "Japan", "Germany", "France", "United Kingdom", "Italy", "China", "Brazil", "Canada", "Spain",
      "South Korea", "Australia", "Mexico", "Netherlands", "Russia", "India", "Switzerland", "Belgium", "Argentina", "Sweden",
      "Austria", "Turkey", "Norway", "Denmark", "Saudi Arabia", "Poland", "Thailand", "Finland", "South Africa", "Indonesia"
    ],
    values: [
      7639, 5450, 2592, 1542, 1278, 1181, 736, 764, 617, 599,
      559, 377, 393, 354, 395, 375, 318, 249, 281, 238,
      217, 170, 142, 142, 162, 131, 163, 119, 136, 222
    ],
    color: "#A2D2FF"
  },
  '2024': {
    labels: [
      "United States", "China", "Japan", "Germany", "India", "United Kingdom", "France", "Italy", "Brazil", "Canada",
      "Russia", "South Korea", "Australia", "Spain", "Mexico", "Indonesia", "Turkey", "Netherlands", "Saudi Arabia", "Switzerland",
      "Argentina", "Poland", "Sweden", "Belgium", "Thailand", "Ireland", "Israel", "Austria", "Norway", "United Arab Emirates"
    ],
    values: [
      28779, 18540, 4334, 4629, 4112, 3532, 3131, 2265, 2173, 2146,
      2062, 1733, 1701, 1579, 1557, 1461, 1340, 1124, 1099, 983,
      641, 846, 723, 636, 632, 627, 610, 536, 525, 521
    ],
    color: "#FDCB6E"
  }
};
// --------- Add for Grouped GDP Share Chart (Top 30 in 2024) ---------
const shareCountries2024 = [
  "United States", "China", "Japan", "Germany", "India", "United Kingdom", "France", "Italy", "Brazil", "Canada",
  "Australia", "Russian Federation", "Spain", "Mexico", "Turkiye", "Indonesia", "Heavily indebted poor countries (HIPC)",
  "Netherlands", "Switzerland", "Poland", "Sweden", "Argentina", "Nigeria", "Belgium", "Iran, Islamic Rep.", "Ireland",
  "Thailand", "Philippines", "Norway", "Malaysia"
];
const share1995 = [
  28.68, 4.81, 9.78, 6.75, 1.54, 4.95, 4.52, 4.32, 2.76, 2.47,
  1.83, 1.86, 2.07, 1.87, 0.87, 0.98, 0.69, 1.35, 1.22, 0.57,
  0.80, 0.90, 0.40, 0.82, 0.56, 0.27, 0.55, 0.31, 0.66, 0.30
];
const share2024 = [
  24.58, 20.04, 4.99, 3.99, 3.77, 3.55, 2.93, 2.20, 2.20, 1.99,
  1.81, 1.75, 1.54, 1.46, 1.40, 1.34, 1.04, 1.00, 0.88, 0.71,
  0.63, 0.63, 0.62, 0.58, 0.57, 0.53, 0.51, 0.49, 0.48, 0.46
];
// Build rank lookup tables
const rank1995 = {};
top30Data['1995'].labels.forEach((country, i) => rank1995[country] = i + 1);
const rank2024 = {};
top30Data['2024'].labels.forEach((country, i) => rank2024[country] = i + 1);
// Track current year for coloring logic
let currentYear = '1995';
let top30Chart;
function getLabelColor(context) {
  // Only color special for 2024 view
  if (currentYear === '2024') {
    const country = context.tick.label;
    // Check both years have the country (otherwise default)
    if (rank1995[country] && rank2024[country]) {
      if (rank2024[country] < rank1995[country]) return '#27ae60'; // green (moved up)
      if (rank2024[country] > rank1995[country]) return '#c0392b'; // red (fell down)
    }
  }
  return '#3d405b'; // default
}
function initTop30Chart() {
  const ctx = document.getElementById('top30Chart').getContext('2d');
  top30Chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top30Data['1995'].labels,
      datasets: [{
        label: 'GDP in 1995 (B USD)',
        data: top30Data['1995'].values,
        backgroundColor: top30Data['1995'].color,
        maxBarThickness: 22,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: { display: false, text: 'Top 30 Economies by GDP' }
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 60,
            minRotation: 60,
            color: getLabelColor,
            font: { size: 12 }
          }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#3d405b', font: { size: 12 } }
        }
      }
    }
  });
}
function showTop30Chart(year) {
  currentYear = year;
  const data = top30Data[year];
  top30Chart.data.labels = data.labels;
  top30Chart.data.datasets[0].data = data.values;
  top30Chart.data.datasets[0].label = `GDP in ${year} (B USD)`;
  top30Chart.data.datasets[0].backgroundColor = data.color;
  // Must update tick coloring logic on change
  top30Chart.options.scales.x.ticks.color = getLabelColor;
  top30Chart.update();
  document.getElementById('btn-1995').classList.toggle('active', year === '1995');
  document.getElementById('btn-2024').classList.toggle('active', year === '2024');
}
let gdpShareChart;
function initGDPShareChart() {
  const ctx = document.getElementById('gdpShareChart').getContext('2d');
  gdpShareChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: shareCountries2024,
      datasets: [
        {
          label: 'Share in 2024 (%)',
          data: share2024,
          backgroundColor: "#FDCB6E",
          maxBarThickness: 22,
        },
        {
          label: 'Share in 1995 (%)',
          data: share1995,
          backgroundColor: "#A2D2FF",
          maxBarThickness: 22,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: {
          display: true,
          text: 'Top 30 Economies in 2024: Share of Global GDP (Compare 1995 & 2024)'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y}%`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#3d405b', font: { size: 11 }, maxRotation: 60, minRotation: 60 },
          stacked: false
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Share of Global GDP (%)', color: '#3d405b' },
          ticks: { color: '#3d405b', font: { size: 12 } }
        }
      }
    }
  });
}
// Ensure chart is initialized on load, and default to 1995
window.onload = function() {
  initTop30Chart();
  showTop30Chart('1995');
  initGDPShareChart();
};

// Add at the end of your existing script.js

// Enhanced share functionality for articles
document.addEventListener('DOMContentLoaded', function() {
  // Article share buttons
  const articleShareButtons = document.querySelectorAll('.article-share .share-btn');
  
  articleShareButtons.forEach(button => {
      button.addEventListener('click', function(e) {
          e.preventDefault();
          
          const url = window.location.href;
          const title = document.querySelector('.article-title')?.textContent || document.title;
          const description = document.querySelector('.article-subtitle')?.textContent || '';
          
          let shareUrl = '';
          
          if (this.classList.contains('linkedin')) {
              shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
          } else if (this.classList.contains('twitter')) {
              shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title + ' - ' + description)}`;
          } else if (this.classList.contains('facebook')) {
              shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title + ' - ' + description)}`;
          }
          
          if (shareUrl) {
              window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
          }
      });
  });
  
  // Smooth scroll for article navigation
  const articleNavLinks = document.querySelectorAll('.article-navigation .nav-link');
  articleNavLinks.forEach(link => {
      link.addEventListener('click', function(e) {
          // Add a subtle loading effect
          this.style.opacity = '0.7';
          setTimeout(() => {
              this.style.opacity = '1';
          }, 150);
      });
  });
  
  // Reading progress indicator (optional)
  function createReadingProgress() {
      const article = document.querySelector('.article-body');
      if (!article) return;
      
      const progressBar = document.createElement('div');
      progressBar.className = 'reading-progress';
      progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
      document.body.appendChild(progressBar);
      
      function updateProgress() {
          const articleTop = article.offsetTop;
          const articleHeight = article.offsetHeight;
          const scrollTop = window.pageYOffset;
          const windowHeight = window.innerHeight;
          
          const progress = Math.max(0, Math.min(100, 
              ((scrollTop - articleTop + windowHeight * 0.3) / articleHeight) * 100
          ));
          
          progressBar.querySelector('.reading-progress-bar').style.width = progress + '%';
      }
      
      window.addEventListener('scroll', updateProgress);
      updateProgress();
  }
  
  // Initialize reading progress if on article page
  if (document.querySelector('.article-content')) {
      createReadingProgress();
  }
});

// Enhanced error handling for CSV loading
function handleCSVError(error) {
  console.error('Error loading CSV data:', error);
  
  // Show fallback message in chart containers
  const chartContainers = document.querySelectorAll('.chart-container');
  chartContainers.forEach(container => {
      const wrapper = container.querySelector('.chart-wrapper');
      if (wrapper) {
          wrapper.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6c757d; text-align: center;">
                  <div>
                      <i class="fas fa-chart-bar" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                      <p>Chart data temporarily unavailable</p>
                      <p style="font-size: 12px;">Please check the CSV file location</p>
                  </div>
              </div>
          `;
      }
  });
}

// Add loading states for charts
document.addEventListener('DOMContentLoaded', function() {
  const chartWrappers = document.querySelectorAll('.chart-wrapper');
  chartWrappers.forEach(wrapper => {
      wrapper.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #007bff;">
              <div style="text-align: center;">
                  <i class="fas fa-spinner fa-spin" style="font-size: 32px; margin-bottom: 12px;"></i>
                  <p>Loading chart data...</p>
              </div>
          </div>
      `;
  });
});