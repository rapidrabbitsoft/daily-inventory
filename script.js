// Constants
const inventoryData = [
  ["Selfish and Self-Seeking", "Interest in Others"],
  ["Dishonest", "Honest"],
  ["Frightened", "Courage"],
  ["Inconsiderate", "Considerate"],
  ["Prideful", "humility-Seek God's Will"],
  ["Greedy", "Giving and Sharing"],
  ["Lustful", "Doing for Others"],
  ["Anger", "Calm"],
  ["Envy", "Grateful"],
  ["Sloth", "Take Action"],
  ["Gluttony", "Moderation"],
  ["Impatient", "Patience"],
  ["Intolerant", "Tolerance"],
  ["Resentment", "Forgiveness"],
  ["Hate", "Love & Concern for Others"],
  ["Harmful Acts", "Good Deeds"],
  ["Self-Pity", "Self-Forgiveness"],
  ["Self-Justification", "Humility-Seek Good's Will"],
  ["Self-Importance", "Modesty"],
  ["Self-Condemnation", "Self-Forgiveness"],
  ["Suspicion", "Trust"],
  ["Doubt", "Faith"],
  ["HOW DO YOU FEEL?", "HOW YOU FEEL?"],
  ["Restless, Irritable, Guilt, Shame, Discontent", "Peaceful, Serene, Loving, Content"]
];

// State
let currentDate = dayjs().format('YYYY-MM-DD');
// Get timezone from browser's Intl API first, then fallback to Day.js guess
const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const userTimezone = browserTimezone || dayjs.tz.guess();

// Helper Functions
function formatDateForDisplay(date) {
    return dayjs.tz(date, userTimezone).format('MMMM D, YYYY');
}

function getTodayInUserTimezone() {
    return dayjs().tz(userTimezone).format('YYYY-MM-DD');
}

function isDateInPast(date) {
    return dayjs.tz(date, userTimezone).isBefore(dayjs().tz(userTimezone), 'day') || 
           dayjs.tz(date, userTimezone).isSame(dayjs().tz(userTimezone), 'day');
}

// Chart instances
const dailyChart = new Chart(document.getElementById('daily-chart'), {
  type: 'pie',
  data: {
    labels: ['Self-Will', 'God\'s Will'],
    datasets: [{ 
      data: [0, 1], 
      backgroundColor: ['#ffe69c', '#a3cfbb'],
      borderWidth: 1,
      borderColor: '#000',
      hoverOffset: 0
    }]
  },
  options: { 
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    cutout: '0%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      tooltip: {
        enabled: true
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  }
});

const averageChart = new Chart(document.getElementById('average-chart'), {
  type: 'pie',
  data: {
    labels: ['Avg Self-Will', 'Avg God\'s Will'],
    datasets: [{ 
      data: [0, 1], 
      backgroundColor: ['#ffe69c', '#a3cfbb'],
      borderWidth: 1,
      borderColor: '#000',
      hoverOffset: 0
    }]
  },
  options: { 
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    cutout: '0%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      tooltip: {
        enabled: true
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  }
});

// Core Functions
function setDate(date) {
  currentDate = date;
  $('#date-display').val(formatDateForDisplay(currentDate));
  $('#timezone-display').text(`Timezone: ${userTimezone}`);
  loadTable();
  loadFromLocalStorage();
  updateCharts();
}

function adjustDate(offset) {
  const newDate = dayjs.tz(currentDate, userTimezone)
      .add(offset, 'day')
      .format('YYYY-MM-DD');
  if (isDateInPast(newDate)) {
    setDate(newDate);
  }
}

function getCurrentSelections() {
  const selections = [];
  $('#inventory-table tr').each(function() {
    const index = $(this).data('index');
    if (index === undefined) return;
    if ($(this).find('.left').hasClass('selected-left')) {
      selections.push(0);
    } else if ($(this).find('.right').hasClass('selected-right')) {
      selections.push(1);
    } else {
      selections.push(null);
    }
  });
  return selections;
}

function loadTable() {
  const $tbody = $('#inventory-table');
  $tbody.empty();
  
  // Add header row
  $tbody.append(`
    <tr class="alert-primary">
      <th>PERSONALITY CHARACTERISTICS OF SELF-WILL</th>
      <th class="alert-primary fw-bold">OR</th>
      <th>PERSONALITY CHARACTERISTICS OF GOD'S WILL</th>
    </tr>
  `);

  // Add data rows
  inventoryData.forEach((pair, index) => {
    if (pair[0] === "HOW DO YOU FEEL?") {
      $tbody.append(`<tr class="alert-primary fw-bold" data-index="${index}"><td>${pair[0]}</td><td class="alert-primary fw-bold"></td><td>${pair[1]}</td></tr>`);
      return;
    }
    const row = $(`
      <tr data-index="${index}">
        <td class="clickable left">${pair[0]}</td>
        <td class="alert-primary fw-bold">OR</td>
        <td class="clickable right">${pair[1]}</td>
      </tr>
    `);
    $tbody.append(row);
  });
  updateRemainingFields();
}

function updateRemainingFields() {
  const selections = getCurrentSelections();
  const totalFields = inventoryData.length - 1;
  const filledFields = selections.filter(v => v !== null).length;
  const remainingFields = totalFields - filledFields;
  
  const topAlertHtml = remainingFields === 0 
      ? `<div class="alert text-center mb-3" role="alert" style="background-color: #a3cfbb; border-color: #a3cfbb; color: #000;">Daily inventory is complete for ${currentDate}</div>`
      : `<div class="alert alert-info text-center mb-3" role="alert">Answers Remaining: <span id="fields-left">${remainingFields}</span></div>`;
  
  const bottomAlertHtml = remainingFields === 0 
      ? `<div class="alert text-center mt-0" role="alert" style="background-color: #a3cfbb; border-color: #a3cfbb; color: #000;">Daily inventory is complete for ${currentDate}</div>`
      : `<div class="alert alert-info text-center mt-0" role="alert">Answers Remaining: <span id="fields-left">${remainingFields}</span></div>`;
  
  $('#remaining-fields').html(topAlertHtml);
  $('#remaining-fields-bottom').html(bottomAlertHtml);
}

function updateCharts() {
  const selections = getCurrentSelections();
  const leftCount = selections.filter(v => v === 0).length;
  const rightCount = selections.filter(v => v === 1).length;

  dailyChart.data.datasets[0].data = [leftCount, rightCount];
  dailyChart.update();

  const allData = JSON.parse(localStorage.getItem('dailyInventory') || '[]');
  let totalLeft = 0, totalRight = 0, totalDays = 0;
  allData.forEach(obj => {
    const key = Object.keys(obj)[0];
    const arr = obj[key];
    totalLeft += arr.filter(v => v === 0).length;
    totalRight += arr.filter(v => v === 1).length;
    totalDays++;
  });
  averageChart.data.datasets[0].data = [
    totalDays ? totalLeft / totalDays : 0,
    totalDays ? totalRight / totalDays : 0
  ];
  averageChart.update();
}

// Local Storage Functions
function saveToLocalStorage() {
  const allData = JSON.parse(localStorage.getItem('dailyInventory') || '[]');
  const currentData = getCurrentSelections();
  const updated = allData.filter(obj => !obj[currentDate]);
  updated.push({ [currentDate]: currentData });
  localStorage.setItem('dailyInventory', JSON.stringify(updated));
  updateExportButton();
}

function loadFromLocalStorage() {
  const allData = JSON.parse(localStorage.getItem('dailyInventory') || '[]');
  const entry = allData.find(obj => obj[currentDate]);
  if (entry) {
    const data = entry[currentDate];
    $('#inventory-table tr').each(function() {
      const index = $(this).data('index');
      if (index === undefined) return;
      const value = data[index];
      if (value === 0) {
        $(this).find('.left').addClass('selected-left');
        $(this).find('.right').removeClass('selected-right');
      } else if (value === 1) {
        $(this).find('.right').addClass('selected-right');
        $(this).find('.left').removeClass('selected-left');
      }
    });
    updateRemainingFields();
  }
}

function updateExportButton() {
  const data = localStorage.getItem('dailyInventory');
  const hasData = data && JSON.parse(data).length > 0;
  $('#export-btn').prop('disabled', !hasData);
}

// Event Handlers
$(document).ready(function() {
  // Date picker initialization
  $('#date-display').datepicker({
    dateFormat: 'yy-mm-dd',
    maxDate: new Date(),
    onSelect: function(dateText) {
      setDate(dateText);
    }
  });

  // Navigation buttons
  $('#prev-date').on('click', () => adjustDate(-1));
  $('#next-date').on('click', () => adjustDate(1));

  // Table cell clicks
  $(document).on('click', '.clickable.left', function() {
    $(this).addClass('selected-left').siblings('.right').removeClass('selected-right');
    saveToLocalStorage();
    updateCharts();
    updateRemainingFields();
  });

  $(document).on('click', '.clickable.right', function() {
    $(this).addClass('selected-right').siblings('.left').removeClass('selected-left');
    saveToLocalStorage();
    updateCharts();
    updateRemainingFields();
  });

  // Export/Import
  $('#export-btn').on('click', () => {
    const data = localStorage.getItem('dailyInventory');
    if (!data || JSON.parse(data).length === 0) return;
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily-inventory-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  $('#import-file').on('change', function() {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) {
          localStorage.setItem('dailyInventory', JSON.stringify(data));
          alert('Data imported successfully!');
          setDate(currentDate);
        } else {
          throw new Error('Invalid format');
        }
      } catch {
        alert('Invalid file.');
      }
    };
    reader.readAsText(file);
  });

  // Reset functionality
  $('#reset-btn').on('click', function() {
    $('#reset-modal').modal('show');
  });

  $('#confirm-reset').on('click', function() {
    localStorage.removeItem('dailyInventory');
    currentDate = new Date().toISOString().split('T')[0];
    setDate(currentDate);
    $('#reset-modal').modal('hide');
  });

  // Initialize with today's date in user's timezone
  currentDate = getTodayInUserTimezone();
  setDate(currentDate);
  updateExportButton();
});
