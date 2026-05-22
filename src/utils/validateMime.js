/**
 * =========================================================================
 * MIME TYPE VALIDATION UTILITY
 * =========================================================================
 * PURPOSE: Validates file MIME types to prevent malicious uploads.
 * Checks both file extension and actual MIME type for defense-in-depth.
 */

/**
 * Allowed MIME types for task file submissions (documents + images)
 */
const TASK_SUBMISSION_MIMES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
]);

/**
 * Allowed MIME types for avatar images only
 */
const AVATAR_MIMES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
]);

/**
 * Safe file extensions for task submissions
 */
const TASK_SUBMISSION_EXTENSIONS = new Set([
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'txt', 'jpg', 'jpeg', 'png', 'gif', 'webp'
]);

/**
 * Safe file extensions for avatars
 */
const AVATAR_EXTENSIONS = new Set([
    'jpg', 'jpeg', 'png', 'gif', 'webp'
]);

/**
 * Extract file extension from filename (case-insensitive)
 * @param {string} filename - The filename
 * @returns {string} - Lowercase extension without dot
 */
const getFileExtension = (filename) => {
    if (!filename) return '';
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return ext;
};

/**
 * Validate file MIME type and extension for task submissions
 * @param {File} file - The file object from input element
 * @returns {object} - { valid: boolean, error: string|null }
 */
export const validateTaskSubmissionFile = (file) => {
    if (!file) {
        return { valid: false, error: 'No file selected.' };
    }

    const extension = getFileExtension(file.name);
    const mimeType = file.type;

    // Check extension
    if (!TASK_SUBMISSION_EXTENSIONS.has(extension)) {
        return { valid: false, error: `File extension '.${extension}' not allowed. Use: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, or images (JPG, PNG, GIF, WEBP).` };
    }

    // Check MIME type (if provided by browser)
    if (mimeType && !TASK_SUBMISSION_MIMES.has(mimeType)) {
        return { valid: false, error: `File type '${mimeType}' not allowed. Please upload a document or image file.` };
    }

    // File size limit: 50MB
    const maxSizeBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return { valid: false, error: 'File size exceeds 50MB limit.' };
    }

    return { valid: true, error: null };
};

/**
 * Validate file MIME type and extension for avatar images
 * @param {File} file - The file object from input element
 * @returns {object} - { valid: boolean, error: string|null }
 */
export const validateAvatarFile = (file) => {
    if (!file) {
        return { valid: false, error: 'No file selected.' };
    }

    const extension = getFileExtension(file.name);
    const mimeType = file.type;

    // Check extension
    if (!AVATAR_EXTENSIONS.has(extension)) {
        return { valid: false, error: `File extension '.${extension}' not allowed. Use: JPG, JPEG, PNG, GIF, or WEBP.` };
    }

    // Check MIME type (if provided by browser)
    if (mimeType && !AVATAR_MIMES.has(mimeType)) {
        return { valid: false, error: `File type '${mimeType}' is not an image. Please upload JPG, PNG, GIF, or WEBP.` };
    }

    // File size limit: 5MB for avatars
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return { valid: false, error: 'Avatar file size exceeds 5MB limit.' };
    }

    return { valid: true, error: null };
};
