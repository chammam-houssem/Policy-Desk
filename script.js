/**
 * =================================================================================
 * Reusable Charting Module
 * Author: Houssem Chammam
 * =================================================================================
 * This module provides a function to create charts from CSV files.
 * It's designed to be flexible and reusable across different pages.
 */

// Expose the charting functions to the global window object
// so they can be called from inline scripts in HTML files.
window.charting = {
  /**
   * Creates and renders a Chart.js chart from a CSV file.
   * @param {object} config - The configuration object for the chart.
   * @param {string} config.canvasId - The ID of the <canvas> element.
   * @param {string} config.csvPath - The path to the CSV data file.
   * @param {string} config.chartType - The type of chart (e.g., 'bar', 'doughnut', 'line').
   * @param {function} config.dataProcessor - A function to process the raw CSV data into a format Chart.js understands. It receives the parsed data and should return an object with { labels: [], datasets: [] }.
   * @param {object} config.chartOptions - The Chart.js options object for styling and configuration.
   */
  createChartFromCSV: function({ canvasId, csvPath, chartType, dataProcessor, chartOptions }) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
          console.error(`Chart Error: Canvas with ID '${canvasId}' not found.`);
          return;
      }

      const chartWrapper = canvas.parentElement;

      // --- 1. Show Loading State ---
      if (chartWrapper) {
          // Preserve the canvas element while showing loader
          const loaderHTML = `
              <div class="chart-loader" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.8); z-index: 10;">
                  <div style="text-align: center; color: #007bff;">
                      <i class="fas fa-spinner fa-spin" style="font-size: 32px; margin-bottom: 12px;"></i>
                      <p>Loading chart data...</p>
                  </div>
              </div>
          `;
          chartWrapper.style.position = 'relative';
          chartWrapper.insertAdjacentHTML('beforeend', loaderHTML);
      }

      // Destroy any old chart instance attached to the canvas
      if (window.chartInstances && window.chartInstances[canvasId]) {
          window.chartInstances[canvasId].destroy();
      }
      if (!window.chartInstances) {
          window.chartInstances = {};
      }

      // --- 2. Fetch and Parse CSV Data ---
      Papa.parse(csvPath, {
          download: true,
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
              removeLoader(chartWrapper);
              if (results.errors.length) {
                  handleChartError(chartWrapper, canvas, `CSV Parsing Error: ${results.errors[0].message}`);
                  return;
              }

              // --- 3. Process Data & Create Chart ---
              try {
                  const chartData = dataProcessor(results.data);
                  const ctx = canvas.getContext('2d');
                  window.chartInstances[canvasId] = new Chart(ctx, {
                      type: chartType,
                      data: chartData,
                      options: chartOptions
                  });
              } catch (e) {
                  handleChartError(chartWrapper, canvas, `Data Processing Error: ${e.message}`);
              }
          },
          error: (error) => {
              removeLoader(chartWrapper);
              handleChartError(chartWrapper, canvas, `Could not load CSV file from '${csvPath}'.`);
          }
      });
  }
};

function removeLoader(wrapper) {
  const loader = wrapper ? wrapper.querySelector('.chart-loader') : null;
  if (loader) {
      loader.remove();
  }
}

function handleChartError(wrapper, canvas, message) {
  console.error(message);
  if (wrapper) {
      // Hide the canvas and show an error message in the wrapper
      canvas.style.display = 'none';
      wrapper.innerHTML += `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6c757d; text-align: center;">
              <div>
                  <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5; color: #ffc107;"></i>
                  <p><strong>Unable to load chart data</strong></p>
                  <p style="font-size: 12px;">${message}</p>
              </div>
          </div>
      `;
  }
}


/**
* =================================================================================
* General Site Functionality
* Author: Houssem Chammam
* =================================================================================
* This section contains all the general UI and interaction logic for the site.
*/
document.addEventListener('DOMContentLoaded', function() {
  // --- Scroll Restoration ---
  if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
  }

  // --- Tab Functionality with Accessibility ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  function switchTab(targetTab) {
      tabButtons.forEach(btn => {
          const isActive = btn.getAttribute('data-tab') === targetTab;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-selected', isActive);
          btn.setAttribute('tabindex', isActive ? '0' : '-1');
      });
      tabContents.forEach(content => {
          content.classList.toggle('active', content.id === targetTab);
      });

      if (history.pushState) {
          history.pushState(null, null, `#${targetTab}`);
      } else {
          location.hash = `#${targetTab}`;
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
  }

  tabButtons.forEach(button => {
      button.addEventListener('click', function(e) {
          const targetTab = this.getAttribute('data-tab');
          if (targetTab) {
              e.preventDefault();
              switchTab(targetTab);
          }
      });
      // Set initial ARIA attributes
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', button.getAttribute('data-tab'));
  });

  tabContents.forEach(content => {
      content.setAttribute('role', 'tabpanel');
      content.setAttribute('aria-labelledby', `tab-${content.id}`);
  });

  function handleInitialHash() {
      const hash = window.location.hash.substring(1);
      if (hash && document.getElementById(hash)) {
          switchTab(hash);
      } else if (tabButtons.length > 0 && !document.querySelector('.tab-btn.active')) {
          const firstTab = tabButtons[0].getAttribute('data-tab');
          if (firstTab) {
              switchTab(firstTab);
          }
      }
  }

  window.addEventListener('popstate', handleInitialHash);
  handleInitialHash();

  // --- Smooth Scrolling for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          const href = this.getAttribute('href');
          // Ignore if it's just a hash for tabs
          if (href === '#' || this.hasAttribute('data-tab')) return;
          
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
      });
  });

  // --- Enhanced Share Functionality for Articles ---
  document.querySelectorAll('.article-share .share-btn').forEach(button => {
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

  // --- Blog Tab Typewriter Effect ---
  const tabText = document.getElementById('policy-desk-tab-text');
  if (tabText) {
      const fullText = "The Policy Desk";
      let current = "";
      let i = 0;
      tabText.style.opacity = 0;
      function typeWriter() {
          if (i === 0) tabText.style.opacity = 1;
          if (i < fullText.length) {
              current += fullText.charAt(i);
              tabText.textContent = current;
              i++;
              setTimeout(typeWriter, 60);
          }
      }
      setTimeout(typeWriter, 400);
  }

  // --- Reading Progress Indicator ---
  const articleBody = document.querySelector('.article-body');
  if (articleBody) {
      const progressBar = document.createElement('div');
      progressBar.className = 'reading-progress';
      progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
      document.body.appendChild(progressBar);
      
      function updateProgress() {
          const articleTop = articleBody.offsetTop;
          const articleHeight = articleBody.offsetHeight;
          const scrollTop = window.pageYOffset;
          const progress = Math.max(0, Math.min(100, (scrollTop - articleTop) / (articleHeight - window.innerHeight) * 100));
          progressBar.querySelector('.reading-progress-bar').style.width = progress + '%';
      }
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
  }
});

// --- Popup Control Functions (globally available) ---
function openPopup() {
  const popup = document.getElementById('popup-bg');
  if (popup) {
      popup.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
  }
}

function closePopup() {
  const popup = document.getElementById('popup-bg');
  if (popup) {
      popup.classList.add('hidden');
      document.body.style.overflow = '';
  }
}

// --- Loading Animation & Scroll Animations ---
window.addEventListener('load', function() {
  document.body.classList.add('loaded');
  window.scrollTo(0, 0);

  const elements = document.querySelectorAll('.tab-content');
  function handleScrollAnimations() {
      elements.forEach(element => {
          const elementTop = element.getBoundingClientRect().top;
          if (elementTop < window.innerHeight - 150) {
              element.classList.add('animate-in');
          }
      });
  }
  window.addEventListener('scroll', handleScrollAnimations, { passive: true });
  handleScrollAnimations(); // Run once on load
});
