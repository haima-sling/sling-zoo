const crypto = require('crypto');
const moment = require('moment');

// Generate random string
const generateRandomString = (length = 10) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

// Generate unique ID
const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}${timestamp}-${randomPart}`.toUpperCase();
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date
const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

// Calculate age
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Calculate date difference
const calculateDateDifference = (startDate, endDate, unit = 'days') => {
  const start = moment(startDate);
  const end = moment(endDate);
  return end.diff(start, unit);
};

// Paginate array
const paginateArray = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: array.length,
      pages: Math.ceil(array.length / limit)
    }
  };
};

// Calculate percentage
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

// Round to decimal places
const roundToDecimals = (number, decimals = 2) => {
  return Number(Math.round(number + 'e' + decimals) + 'e-' + decimals);
};

// Generate QR code data
const generateQRCodeData = (data) => {
  return Buffer.from(JSON.stringify(data)).toString('base64');
};

// Parse QR code data
const parseQRCodeData = (encodedData) => {
  try {
    return JSON.parse(Buffer.from(encodedData, 'base64').toString());
  } catch (error) {
    return null;
  }
};

// Sanitize string
const sanitizeString = (str) => {
  return str.replace(/[^\w\s-]/gi, '').trim();
};

// Generate slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Capitalize first letter
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Capitalize words
const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

// Truncate string
const truncateString = (str, length = 50, suffix = '...') => {
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

// Merge objects
const mergeObjects = (...objects) => {
  return Object.assign({}, ...objects);
};

// Remove duplicates from array
const removeDuplicates = (array) => {
  return [...new Set(array)];
};

// Group array by key
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// Sort array of objects
const sortByKey = (array, key, order = 'asc') => {
  return array.sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    }
    return a[key] < b[key] ? 1 : -1;
  });
};

// Filter array by multiple conditions
const filterByConditions = (array, conditions) => {
  return array.filter(item => {
    return Object.keys(conditions).every(key => {
      return item[key] === conditions[key];
    });
  });
};

// Calculate average
const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

// Calculate sum
const calculateSum = (numbers) => {
  return numbers.reduce((acc, num) => acc + num, 0);
};

// Calculate median
const calculateMedian = (numbers) => {
  if (numbers.length === 0) return 0;
  const sorted = numbers.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
};

// Generate random number
const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Check if value is between range
const isBetween = (value, min, max) => {
  return value >= min && value <= max;
};

// Format phone number
const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};

// Validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate URL
const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Convert bytes to human readable format
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Sleep/delay function
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry function
const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await sleep(delay);
    }
  }
};

// Generate random color
const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

// Check if date is weekend
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

// Get days in month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Add days to date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Get date range
const getDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= new Date(endDate)) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};

module.exports = {
  generateRandomString,
  generateUniqueId,
  formatCurrency,
  formatDate,
  calculateAge,
  calculateDateDifference,
  paginateArray,
  calculatePercentage,
  roundToDecimals,
  generateQRCodeData,
  parseQRCodeData,
  sanitizeString,
  generateSlug,
  capitalizeFirstLetter,
  capitalizeWords,
  truncateString,
  deepClone,
  isEmptyObject,
  mergeObjects,
  removeDuplicates,
  groupBy,
  sortByKey,
  filterByConditions,
  calculateAverage,
  calculateSum,
  calculateMedian,
  generateRandomNumber,
  isBetween,
  formatPhoneNumber,
  isValidEmail,
  isValidURL,
  formatBytes,
  sleep,
  retry,
  generateRandomColor,
  isWeekend,
  getDaysInMonth,
  addDays,
  getDateRange
};
