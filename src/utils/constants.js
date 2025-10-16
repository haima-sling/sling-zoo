// Application Constants

// User Roles
const USER_ROLES = {
  ADMIN: 'admin',
  VETERINARIAN: 'veterinarian',
  ANIMAL_CARE: 'animal_care',
  MAINTENANCE: 'maintenance',
  VISITOR_SERVICES: 'visitor_services',
  MANAGER: 'manager',
  SECURITY: 'security',
  EDUCATION: 'education',
  CONSERVATION: 'conservation',
  RESEARCH: 'research',
  STAFF: 'staff',
  VISITOR: 'visitor'
};

// Animal Status
const ANIMAL_STATUS = {
  ACTIVE: 'active',
  QUARANTINE: 'quarantine',
  MEDICAL_TREATMENT: 'medical_treatment',
  BREEDING: 'breeding',
  RETIRED: 'retired',
  DECEASED: 'deceased'
};

// Animal Gender
const ANIMAL_GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown'
};

// Animal Origin
const ANIMAL_ORIGIN = {
  WILD: 'wild',
  CAPTIVE_BRED: 'captive_bred',
  RESCUE: 'rescue',
  TRANSFER: 'transfer',
  DONATION: 'donation'
};

// Conservation Status
const CONSERVATION_STATUS = {
  LEAST_CONCERN: 'least_concern',
  NEAR_THREATENED: 'near_threatened',
  VULNERABLE: 'vulnerable',
  ENDANGERED: 'endangered',
  CRITICALLY_ENDANGERED: 'critically_endangered',
  EXTINCT_IN_WILD: 'extinct_in_wild',
  EXTINCT: 'extinct'
};

// Exhibit Types
const EXHIBIT_TYPES = {
  INDOOR: 'indoor',
  OUTDOOR: 'outdoor',
  AQUATIC: 'aquatic',
  AVIARY: 'aviary',
  NOCTURNAL: 'nocturnal',
  INTERACTIVE: 'interactive',
  EDUCATIONAL: 'educational'
};

// Exhibit Themes
const EXHIBIT_THEMES = {
  AFRICAN_SAVANNA: 'african_savanna',
  TROPICAL_RAINFOREST: 'tropical_rainforest',
  ARCTIC_TUNDRA: 'arctic_tundra',
  DESERT: 'desert',
  OCEAN: 'ocean',
  FOREST: 'forest',
  GRASSLAND: 'grassland',
  WETLAND: 'wetland',
  MOUNTAIN: 'mountain',
  URBAN: 'urban'
};

// Exhibit Status
const EXHIBIT_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  MAINTENANCE: 'maintenance',
  RENOVATION: 'renovation',
  EMERGENCY: 'emergency'
};

// Ticket Types
const TICKET_TYPES = {
  ADULT: 'adult',
  CHILD: 'child',
  SENIOR: 'senior',
  STUDENT: 'student',
  GROUP: 'group',
  ANNUAL_PASS: 'annual_pass',
  VIP: 'vip'
};

// Payment Methods
const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  ONLINE: 'online',
  VOUCHER: 'voucher',
  COMPLIMENTARY: 'complimentary'
};

// Health Record Types
const HEALTH_RECORD_TYPES = {
  CHECKUP: 'checkup',
  VACCINATION: 'vaccination',
  TREATMENT: 'treatment',
  SURGERY: 'surgery',
  EMERGENCY: 'emergency',
  FOLLOW_UP: 'follow_up'
};

// Health Record Status
const HEALTH_RECORD_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PENDING_FOLLOWUP: 'pending_followup'
};

// Report Types
const REPORT_TYPES = {
  HEALTH: 'health',
  VISITOR: 'visitor',
  FINANCIAL: 'financial',
  EXHIBIT: 'exhibit',
  STAFF: 'staff',
  OPERATIONAL: 'operational',
  CUSTOM: 'custom'
};

// Report Periods
const REPORT_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom'
};

// Report Status
const REPORT_STATUS = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// Maintenance Types
const MAINTENANCE_TYPES = {
  ROUTINE: 'routine',
  REPAIR: 'repair',
  CLEANING: 'cleaning',
  INSPECTION: 'inspection',
  UPGRADE: 'upgrade',
  EMERGENCY: 'emergency'
};

// Days of Week
const DAYS_OF_WEEK = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday'
};

// Shift Types
const SHIFT_TYPES = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  NIGHT: 'night',
  FULL_DAY: 'full_day'
};

// Training Status
const TRAINING_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Membership Types
const MEMBERSHIP_TYPES = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  FAMILY: 'family',
  CORPORATE: 'corporate',
  LIFETIME: 'lifetime'
};

// VIP Levels
const VIP_LEVELS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum'
};

// Visitor Sources
const VISITOR_SOURCES = {
  WEBSITE: 'website',
  WALK_IN: 'walk_in',
  REFERRAL: 'referral',
  SOCIAL_MEDIA: 'social_media',
  ADVERTISEMENT: 'advertisement',
  OTHER: 'other'
};

// Communication Methods
const COMMUNICATION_METHODS = {
  EMAIL: 'email',
  SMS: 'sms',
  PHONE: 'phone',
  MAIL: 'mail'
};

// Gender Options
const GENDER_OPTIONS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say'
};

// Notification Types
const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  SYSTEM_ALERT: 'system_alert',
  MAINTENANCE: 'maintenance',
  HEALTH_CHECK: 'health_check',
  FEEDING_REMINDER: 'feeding_reminder',
  VISITOR_NOTIFICATION: 'visitor_notification'
};

// Notification Priorities
const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Cache Keys
const CACHE_KEYS = {
  DASHBOARD_OVERVIEW: 'dashboard:overview',
  ANIMAL_STATS: 'stats:animals',
  VISITOR_STATS: 'stats:visitors',
  EXHIBIT_STATS: 'stats:exhibits',
  TICKET_STATS: 'stats:tickets',
  REVENUE_TRENDS: 'trends:revenue',
  VISITOR_TRENDS: 'trends:visitors'
};

// Cache TTL (in seconds)
const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  EXTRA_LONG: 86400 // 24 hours
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// File Upload
const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Date Formats
const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  US: 'MM/DD/YYYY',
  EU: 'DD/MM/YYYY',
  FULL: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss'
};

// Regex Patterns
const REGEX_PATTERNS = {
  EMAIL: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  MICROCHIP_ID: /^[A-Z0-9]{15}$/,
  TICKET_ID: /^TKT-\d{13}-[a-z0-9]{9}$/
};

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access to this resource is forbidden',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'An internal server error occurred',
  DATABASE_ERROR: 'Database operation failed',
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT: 'Request timeout'
};

// Success Messages
const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGIN: 'Login successful',
  LOGOUT: 'Logout successful',
  REGISTERED: 'Registration successful'
};

module.exports = {
  USER_ROLES,
  ANIMAL_STATUS,
  ANIMAL_GENDER,
  ANIMAL_ORIGIN,
  CONSERVATION_STATUS,
  EXHIBIT_TYPES,
  EXHIBIT_THEMES,
  EXHIBIT_STATUS,
  TICKET_TYPES,
  PAYMENT_METHODS,
  HEALTH_RECORD_TYPES,
  HEALTH_RECORD_STATUS,
  REPORT_TYPES,
  REPORT_PERIODS,
  REPORT_STATUS,
  MAINTENANCE_TYPES,
  DAYS_OF_WEEK,
  SHIFT_TYPES,
  TRAINING_STATUS,
  MEMBERSHIP_TYPES,
  VIP_LEVELS,
  VISITOR_SOURCES,
  COMMUNICATION_METHODS,
  GENDER_OPTIONS,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  HTTP_STATUS,
  CACHE_KEYS,
  CACHE_TTL,
  PAGINATION,
  FILE_UPLOAD,
  DATE_FORMATS,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
