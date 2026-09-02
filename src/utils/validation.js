/**
 * Standard Validation & Sanitization Utilities for MP School Management System
 */

// Strip HTML tags and script injection
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  return text.replace(/<[^>]*>?/gm, '').trim();
};

/**
 * Validates a human name (student, father, mother, staff)
 * - Allows alphabets, spaces, dots, and hyphens
 * - Rejects numbers, HTML, scripts, and special symbols
 */
export const validateName = (name, fieldName = 'Name', required = true) => {
  if (!name || !name.trim()) {
    return required ? `${fieldName} is required` : null;
  }
  const clean = name.trim();
  if (clean.length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }
  if (clean.length > 70) {
    return `${fieldName} cannot exceed 70 characters`;
  }
  // Check for HTML/script tags
  if (/[<>{}]/.test(clean)) {
    return `${fieldName} cannot contain HTML or script characters`;
  }
  // Allow letters, spaces, dots, hyphens (e.g. "Dr. R. K. Sharma", "Mary-Jane")
  const nameRegex = /^[a-zA-Z\u0900-\u097F\s.'-]+$/;
  if (!nameRegex.test(clean)) {
    return `${fieldName} can only contain letters, dots, and spaces (no numbers or symbols)`;
  }
  return null;
};

/**
 * Validates 10-digit Indian mobile number
 * Starts with 6, 7, 8, or 9
 */
export const validatePhone = (phone, fieldName = 'Phone number', required = true) => {
  if (!phone || !phone.trim()) {
    return required ? `${fieldName} is required` : null;
  }
  const clean = phone.trim().replace(/[\s-+]/g, '');
  // Standard Indian 10-digit mobile
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(clean)) {
    return `${fieldName} must be a valid 10-digit mobile number starting with 6, 7, 8, or 9`;
  }
  return null;
};

/**
 * Validates email format
 */
export const validateEmail = (email, fieldName = 'Email', required = false) => {
  if (!email || !email.trim()) {
    return required ? `${fieldName} is required` : null;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return `Please enter a valid ${fieldName.toLowerCase()} (e.g. user@example.com)`;
  }
  return null;
};

/**
 * Validates MP Samagra ID (strictly 9 digits)
 */
export const validateSamagraId = (samagraId, required = false) => {
  if (!samagraId || !samagraId.trim()) {
    return required ? 'Samagra ID is required' : null;
  }
  const clean = samagraId.trim();
  if (!/^\d{9}$/.test(clean)) {
    return 'Samagra ID must be exactly 9 digits';
  }
  return null;
};

/**
 * Validates Roll Number (positive integer)
 */
export const validateRollNo = (rollNo, required = true) => {
  if (!rollNo || !String(rollNo).trim()) {
    return required ? 'Roll Number is required' : null;
  }
  const num = Number(rollNo);
  if (!Number.isInteger(num) || num <= 0 || num > 9999) {
    return 'Roll number must be a valid positive number between 1 and 9999';
  }
  return null;
};

/**
 * Validates Admission Number
 */
export const validateAdmissionNo = (admNo, required = true) => {
  if (!admNo || !admNo.trim()) {
    return required ? 'Admission number is required' : null;
  }
  const clean = admNo.trim();
  if (clean.length < 2 || clean.length > 25) {
    return 'Admission number must be between 2 and 25 characters';
  }
  if (/[<>{}]/.test(clean)) {
    return 'Admission number cannot contain special characters';
  }
  return null;
};

/**
 * Validates Date of Birth (cannot be future, must be realistic age)
 */
export const validateDob = (dob, fieldName = 'Date of birth', required = false) => {
  if (!dob) {
    return required ? `${fieldName} is required` : null;
  }
  const date = new Date(dob);
  if (isNaN(date.getTime())) {
    return `Please select a valid ${fieldName.toLowerCase()}`;
  }
  const now = new Date();
  if (date > now) {
    return `${fieldName} cannot be in the future`;
  }
  const minDate = new Date(1950, 0, 1);
  if (date < minDate) {
    return `${fieldName} cannot be before 1950`;
  }
  return null;
};
