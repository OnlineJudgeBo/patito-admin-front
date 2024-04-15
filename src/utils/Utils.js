// utils.js

/**
 * Attempts to parse a JSON string and returns an object or an empty array on failure.
 * @param {string} input - The JSON string to parse.
 * @return {Object|Array} - Parsed JSON object or empty array if parsing fails.
 */
export const parseJSON = input => {
    try {
        return JSON.parse(input);
    } catch (e) {
        return [];
    }
};

