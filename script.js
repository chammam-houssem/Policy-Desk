/**
 * =================================================================================
 * Reusable Charting Module (Optimized)
 * Author: Houssem Chammam
 * =================================================================================
 * This module provides a function to create charts from CSV files.
 * It's designed to be flexible and reusable across different pages.
 * Optimized for Chart.js 4.5.0 with performance improvements and better error handling.
 */

// Enhanced color palette for better accessibility and consistency
const ChartColorPalette = {
    colors: ['#06B6D4', '#FCD34D','#84CC16', '#2563eb', '#8B5CF6', '#dbeafe', '#06B6D4', '#84CC16'],    
    get: function(index, alpha = 1) {
        const color = this.colors[index % this.colors.length];
        if (alpha === 1) return color;
        
        // Convert hex to rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
};

// Expose the charting functions to the global window object
window.charting = {
    chartInstances: {},
    
    /**
     * Creates and renders a Chart.js chart from a CSV file.
     * @param {object} config - The configuration object for the chart.
     * @param {string} config.canvasId - The ID of the <canvas> element.
     * @param {string} config.csvPath - The path to the CSV data file.
     * @param {string} config.chartType - The type of chart (e.g., 'bar', 'doughnut', 'line'). Use null for mixed charts.
     * @param {function} config.dataProcessor - A function to process the raw CSV data.
     * @param {object} config.chartOptions - The Chart.js options object.
     * @param {boolean} config.enablePerformanceMode - Enable optimizations for large datasets.
     * @param {array} config.requiredFields - Array of required CSV field names.
     */
    createChartFromCSV: function({ 
        canvasId, 
        csvPath, 
        chartType, 
        dataProcessor, 
        chartOptions = {},
        enablePerformanceMode = false,
        requiredFields = []
    }) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Chart Error: Canvas with ID '${canvasId}' not found.`);
            return;
        }

        const chartWrapper = canvas.parentElement;

        // Show loading state
        this.showLoader(chartWrapper);

        // Destroy any existing chart instance
        this.destroyChart(canvasId);

        // Fetch and parse CSV data
        Papa.parse(csvPath, {
            download: true,
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
                this.removeLoader(chartWrapper);
                
                if (results.errors.length > 0) {
                    this.handleChartError(chartWrapper, canvas, `CSV parsing failed: ${results.errors[0].message}`);
                    return;
                }

                try {
                    // Validate data if required fields specified
                    if (requiredFields.length > 0) {
                        this.validateData(results.data, requiredFields);
                    }

                    // Process data
                    const chartData = dataProcessor(results.data);
                    
                    // Apply performance optimizations if enabled
                    const finalOptions = this.applyOptimizations(chartOptions, enablePerformanceMode, results.data.length);
                    
                    // Create chart
                    const ctx = canvas.getContext('2d');
                    this.chartInstances[canvasId] = new Chart(ctx, {
                        type: chartType, // null for mixed charts
                        data: chartData,
                        options: finalOptions
                    });
                    
                } catch (error) {
                    this.handleChartError(chartWrapper, canvas, `Chart creation failed: ${error.message}`);
                }
            },
            error: (error) => {
                this.removeLoader(chartWrapper);
                this.handleChartError(chartWrapper, canvas, `Could not load CSV file: ${csvPath}`);
            }
        });
    },

    // Validate CSV data structure
    validateData: function(data, requiredFields) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('CSV data is empty or invalid');
        }
        
        const firstRow = data[0];
        for (const field of requiredFields) {
            if (!(field in firstRow)) {
                throw new Error(`Required field '${field}' not found in CSV data`);
            }
        }
    },

    // Apply performance optimizations
    applyOptimizations: function(options, enablePerformanceMode, dataLength) {
        const optimizedOptions = { ...options };
        
        if (enablePerformanceMode || dataLength > 1000) {
            // Disable animations for large datasets
            optimizedOptions.animation = false;
            
            // Enable data decimation for line charts with many points
            if (dataLength > 2000) {
                optimizedOptions.plugins = optimizedOptions.plugins || {};
                optimizedOptions.plugins.decimation = {
                    enabled: true,
                    algorithm: 'lttb',
                    samples: 1000
                };
            }
        }
        
        // Ensure responsive defaults
        optimizedOptions.responsive = optimizedOptions.responsive !== false;
        optimizedOptions.maintainAspectRatio = optimizedOptions.maintainAspectRatio !== true;
        
        return optimizedOptions;
    },

    // Show loading indicator
    showLoader: function(wrapper) {
        if (!wrapper) return;
        
        const loaderHTML = `
            <div class="chart-loader" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.8); z-index: 10;">
                <div style="text-align: center; color: #007bff;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 32px; margin-bottom: 12px;"></i>
                    <p>Loading chart data...</p>
                </div>
            </div>
        `;
        wrapper.style.position = 'relative';
        wrapper.insertAdjacentHTML('beforeend', loaderHTML);
    },

    // Remove loading indicator
    removeLoader: function(wrapper) {
        const loader = wrapper ? wrapper.querySelector('.chart-loader') : null;
        if (loader) {
            loader.remove();
        }
    },

    // Handle chart errors
    handleChartError: function(wrapper, canvas, message) {
        console.error('Chart Error:', message);
        
        if (wrapper) {
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
    },

    // Destroy chart instance
    destroyChart: function(canvasId) {
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
            delete this.chartInstances[canvasId];
        }
    },

    // Get chart instance
    getChart: function(canvasId) {
        return this.chartInstances[canvasId] || null;
    },

    // Destroy all chart instances
    destroyAll: function() {
        Object.keys(this.chartInstances).forEach(canvasId => {
            this.destroyChart(canvasId);
        });
    }
};

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
    const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
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

    // --- Copy email to clipboard with toast ---
    function showToast(message, durationMs = 3000) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Remove any existing toasts before showing a new one
        container.querySelectorAll('.toast-message').forEach(el => el.remove());

        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        container.appendChild(toast);

        // Trigger show animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Start fade after duration
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 400);
        }, durationMs);
    }

    document.addEventListener('click', function(e) {
        const mailtoLink = e.target.closest('a[href^="mailto:"]');
        if (!mailtoLink) return;

        e.preventDefault();
        const href = mailtoLink.getAttribute('href') || '';
        const match = href.match(/^mailto:([^?]+)/i);
        const email = match ? decodeURIComponent(match[1]) : (mailtoLink.textContent || '').trim();

        const copyWithFallback = () => {
            const textarea = document.createElement('textarea');
            textarea.value = email;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                document.execCommand('copy');
                showToast('Email copied');
            } catch (err) {
                showToast('Unable to copy email');
            } finally {
                textarea.remove();
            }
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(email)
                .then(() => showToast('Email copied'))
                .catch(() => copyWithFallback());
        } else {
            copyWithFallback();
        }
    });
});

// Popup control removed

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

