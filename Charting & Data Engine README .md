# Charting Engine & Data Visualization: README


## Overview

This repository enables flexible, dynamic chart creation in your personal website using Chart.js, PapaParse, and a custom, reusable JavaScript module.

Charts are generated directly from CSV files, using logic you define per chart in your HTML files.

## 1. Core Functionality (script.js)
All chart logic is handled by a single, generic module in script.js:

What It Does
Loads and parses CSV files with PapaParse

Allows you to define how to process data for each chart

Renders any Chart.js chart type (bar, line, doughnut, etc.)

Handles errors and displays loading states

Main Function:

window.charting.createChartFromCSV({
    canvasId,         // The <canvas> id for the chart
    csvPath,          // Path to the CSV file
    chartType,        // Chart.js chart type (e.g. 'bar', 'doughnut')
    dataProcessor,    // Function to shape raw CSV data for Chart.js
    chartOptions      // Chart.js configuration options
});

### How It Works:
Loads CSV at csvPath and parses to a JS array of objects (one per row).

Calls your dataProcessor with this parsed data, expecting a return value in Chart.js format:
{ labels: [...], datasets: [...] }

Creates a Chart.js chart of the specified chartType with your data/options.

Shows loading spinner and errors in the chart container as needed.

Example Skeleton:

window.charting.createChartFromCSV({
    canvasId: 'exampleChart',
    csvPath: './data.csv',
    chartType: 'bar',
    dataProcessor: function(data) {
        // Your logic here!
        return { labels: [], datasets: [] };
    },
    chartOptions: { responsive: true }
});

## 2. How Articles Use the Engine
Every time you want a chart in an article (e.g., article3.html), you:

Add a <canvas id="..."></canvas> in the page

Call window.charting.createChartFromCSV with your configuration, including a dataProcessor function written for that chart

## What Is dataProcessor?
A function that takes the parsed CSV rows as an array of JS objects and returns the structure that Chart.js expects

You define grouping, filtering, and labeling logic here, for each chart

## 3. Examples

### A. Doughnut Chart: Capacity by Plant Type

<script>
window.charting.createChartFromCSV({
    canvasId: 'capacityChart',
    csvPath: '../Data/STEG Data.csv',
    chartType: 'doughnut',
    dataProcessor: function(data) {
        // Group capacity by type
        const plantTypes = {};
        data.forEach(row => {
            const type = row['Type of Plant'];
            const capacity = row['Actual Capacity (MW)'];
            if (type && capacity > 0) {
                plantTypes[type] = (plantTypes[type] || 0) + capacity;
            }
        });
        return {
            labels: Object.keys(plantTypes),
            datasets: [{
                data: Object.values(plantTypes),
                backgroundColor: ['#2196F3', '#4CAF50', '#FF9800']
            }]
        };
    },
    chartOptions: { responsive: true }
});
</script>

### B. Bar Chart: Retirement Timeline

<script>
window.charting.createChartFromCSV({
    canvasId: 'retirementChart',
    csvPath: '../Data/STEG Data.csv',
    chartType: 'bar',
    dataProcessor: function(data) {
        // Sum up capacity per retirement year
        const byYear = {};
        data.forEach(row => {
            const year = row['Retirement Year'];
            const capacity = row['Actual Capacity (MW)'];
            if (year && capacity > 0) {
                byYear[year] = (byYear[year] || 0) + capacity;
            }
        });
        return {
            labels: Object.keys(byYear),
            datasets: [{
                label: 'Retired Capacity',
                data: Object.values(byYear),
                backgroundColor: '#E74C3C'
            }]
        };
    },
    chartOptions: { responsive: true }
});
</script>

### C. Advanced Example:

Grouped by Year and Plant Type (e.g. capacity lost in 2025, 2030, by TG/CC/TV):

<script>
window.charting.createChartFromCSV({
    canvasId: 'retirementGroupedChart',
    csvPath: '../Data/STEG Data.csv',
    chartType: 'bar',
    dataProcessor: function(data) {
        const years = [2025, 2030];
        const types = ['TG', 'CC', 'TV'];
        const grouped = {};
        years.forEach(year => grouped[year] = { TG: 0, CC: 0, TV: 0 });
        data.forEach(row => {
            const year = +row['Retirement Year'];
            const type = row['Type of Plant'];
            const capacity = +row['Actual Capacity (MW)'];
            if (years.includes(year) && types.includes(type) && capacity > 0) {
                grouped[year][type] += capacity;
            }
        });
        return {
            labels: years.map(String),
            datasets: types.map((type, i) => ({
                label: type,
                data: years.map(year => grouped[year][type]),
                backgroundColor: ['#2196F3', '#4CAF50', '#FF9800'][i]
            }))
        };
    },
    chartOptions: { responsive: true, plugins: { legend: { position: 'top' }} }
});
</script>

## 4. FAQ / How it Works

What does "parsed" mean?
PapaParse reads the raw CSV file and converts it into an array of JS objects, one per row, where object keys are column names.
This is the "parsed" data that you work with in dataProcessor.

Where do I define chart logic?
All data grouping, filtering, and formatting is done in the dataProcessor function, which you write for each chart, per page.

Can I use different chart types or variables?
Yes—just set the chartType and write your dataProcessor to shape the CSV data as you wish.

Can I have multiple charts per page?
Yes—just add multiple canvases and call window.charting.createChartFromCSV for each.

What if my data changes or I want a new view?
You do not touch script.js—just change the logic in your page’s chart config.

## 5. Quick Reference
Reusable engine in script.js
(handles CSV loading, chart creation, error display)

Chart setup in diffrent HTML pages
(you define what to show, how to group, what chart type, and options)

All data wrangling in dataProcessor
(gets parsed CSV rows as input, returns Chart.js-ready object)

## 6. Minimal Example

<canvas id="myChart"></canvas>
<script>
window.charting.createChartFromCSV({
    canvasId: 'myChart',
    csvPath: './data.csv',
    chartType: 'line',
    dataProcessor: function(data) {
        // Example: plot value per year
        const byYear = {};
        data.forEach(row => {
            byYear[row.Year] = (byYear[row.Year] || 0) + row.Value;
        });
        return {
            labels: Object.keys(byYear),
            datasets: [{ label: 'Value', data: Object.values(byYear) }]
        };
    },
    chartOptions: { responsive: true }
});
</script>

## 7. More Complicated example:

Suppose you want: Mixed Bar+Line Chart 
Bars: Number of plants retiring per year
Line: Total lost capacity per year

Your dataProcessor might look like:

<script>
dataProcessor: function(data) {
    const yearCounts = {};
    const yearCapacity = {};
    data.forEach(row => {
        const year = row['Retirement Year'];
        const capacity = +row['Actual Capacity (MW)'];
        if (year && capacity > 0) {
            yearCounts[year] = (yearCounts[year] || 0) + 1;
            yearCapacity[year] = (yearCapacity[year] || 0) + capacity;
        }
    });
    const years = Object.keys(yearCounts).sort();

    return {
        labels: years,
        datasets: [
            {
                type: 'bar',
                label: 'Plants Retiring',
                data: years.map(y => yearCounts[y]),
                backgroundColor: '#2196F3',
                yAxisID: 'y'
            },
            {
                type: 'line',
                label: 'Lost Capacity (MW)',
                data: years.map(y => yearCapacity[y]),
                borderColor: '#E74C3C',
                backgroundColor: 'rgba(231,76,60,0.2)',
                fill: false,
                yAxisID: 'y1'
            }
        ]
    };
}
</script>

In your chart config:

<script>
window.charting.createChartFromCSV({
    canvasId: 'mixedChart',
    csvPath: '../Data/STEG Data.csv',
    chartType: 'bar', // Base type (required, but ignored if per-dataset types are set)
    dataProcessor: /* as above */,
    chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' }},
        scales: {
            y: {
                type: 'linear',
                position: 'left',
                title: { display: true, text: 'Plants Retiring' }
            },
            y1: {
                type: 'linear',
                position: 'right',
                title: { display: true, text: 'Lost Capacity (MW)' },
                grid: { drawOnChartArea: false } // Prevents gridlines from overlapping
            }
        }
    }
});
</script>

This setup allows you to generate charts from CSV data, with any grouping/logic you need, simply by configuring the HTML/JS per page.
All the “engine” logic (loading, rendering, error handling) is already handled for you by script.js.