import * as config from '../config.js';

function createNewDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    const formattedDate = `[${day}-${month}-${year} - ${hours}:${minutes}:${seconds}:${milliseconds}]`;

    return formattedDate;
};

function error(primaryMessage, errorObject = null) {
    let fullLogMessage = `${createNewDate()} [ERROR] ${primaryMessage}`;

    if (errorObject && errorObject instanceof Error) {
        fullLogMessage += `\n--- ERROR DETAILS ---`;
        fullLogMessage += `\nMessage: ${errorObject.message}`; // This will be "Received one or more errors"

        // Check for and log nested errors (common in validation libraries)
        if (errorObject.errors && Array.isArray(errorObject.errors)) {
            fullLogMessage += `\n--- SPECIFIC VALIDATION ISSUES ---`;
            errorObject.errors.forEach((nestedErrorArray, index) => {
                // The 'errors' property seems to be an array of arrays/tuples: [propertyName, ErrorObject]
                // Or it could be an array of error objects directly. Adjust based on your console.dir output.
                // From your log, it looks like: [ ['iconURL', CombinedErrorObject] ]
                if (Array.isArray(nestedErrorArray) && nestedErrorArray.length === 2) {
                    const propertyName = nestedErrorArray[0];
                    const actualError = nestedErrorArray[1];
                    fullLogMessage += `\nIssue ${index + 1} (Property: ${propertyName}): ${actualError.message || String(actualError)}`;
                    if (actualError.errors && Array.isArray(actualError.errors)) { // If CombinedError itself has sub-errors
                        actualError.errors.forEach((subError, subIndex) => {
                            fullLogMessage += `\n  Sub-issue ${subIndex + 1}: ${subError.message || String(subError)}`;
                            if (subError.given !== undefined) {
                                fullLogMessage += ` (Given: "${subError.given}")`;
                            }
                        });
                    }
                } else { // Fallback if the structure is just an array of error objects
                    fullLogMessage += `\nIssue ${index + 1}: ${nestedErrorArray.message || String(nestedErrorArray)}`;
                }
            });
        }

        if (errorObject.stack) {
            fullLogMessage += `\nStack:\n${errorObject.stack}`; // Log the main stack trace
        }
        if (errorObject.cause) {
            fullLogMessage += `\nCause: ${errorObject.cause instanceof Error ? errorObject.cause.stack || errorObject.cause.message : String(errorObject.cause)}`;
        }
        fullLogMessage += '\n---------------------';
    } else if (errorObject) {
        fullLogMessage += `\n--- ADDITIONAL INFO ---\n${String(errorObject)}\n---------------------`;
    }
    console.error(fullLogMessage);
}

function log(message) {
    console.log(`${createNewDate()} [LOG] ${message}`);
};

function success(message) {
    console.log(`${createNewDate()} [SUCCESS] ${message}`);
};

function warning(message) {
    console.warn(`${createNewDate()} [WARNING] ${message}`);
};

function debug(message) {
    if (config.debugMode) {
        console.debug(`${createNewDate()} [DEBUG] ${message}`);
    }
};

export const loggerError = error;
export const loggerLog = log;
export const loggerSuccess = success;
export const loggerWarning = warning;
export const loggerDebug = debug;