import React from 'react';
import { FaCheck } from 'react-icons/fa';

const CheckoutSteps = ({ step1, step2, step3 }) => {

    // Helper function to get status colors and text based on completion
    const getStepStyles = (isCompleted) => {
        if (isCompleted) {
            // Completed state: Use primary color for background, dark text for active steps (for better contrast against the background gradient)
            return {
                iconBg: 'bg-primary-500 text-white',
                text: 'text-[var(--text-main)] font-bold',
                divider: 'border-primary-500'
            };
        } else {
            // Inactive state: Use theme variables for visibility in light mode
            return {
                iconBg: 'bg-[var(--input-bg)] border-2 border-[var(--input-border)] text-[var(--text-muted)]',
                text: 'text-[var(--text-muted)]',
                divider: 'border-[var(--input-border)]'
            };
        }
    };

    const step1Styles = getStepStyles(step1);
    const step2Styles = getStepStyles(step2);
    const step3Styles = getStepStyles(step3);

    return (
        // Added max-w-4xl for better centering
        <div className="flex justify-between items-center w-full my-8 max-w-4xl mx-auto">
            
            {/* Step 1: Login */}
            <div className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${step1Styles.iconBg}`}>
                    <FaCheck size={14} />
                </div>
                <p className={`ml-3 font-semibold transition-colors duration-300 ${step1Styles.text}`}>Login</p>
            </div>

            {/* Connector 1 */}
            {/* The divider style relies on the *next* step's completion status */}
            <div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${step2Styles.divider}`}></div>

            {/* Step 2: Shipping */}
            <div className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${step2Styles.iconBg}`}>
                    <FaCheck size={14} />
                </div>
                <p className={`ml-3 font-semibold transition-colors duration-300 ${step2Styles.text}`}>Shipping</p>
            </div>

            {/* Connector 2 */}
            <div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${step3Styles.divider}`}></div>

            {/* Step 3: Summary */}
            <div className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${step3Styles.iconBg}`}>
                    <FaCheck size={14} />
                </div>
                <p className={`ml-3 font-semibold transition-colors duration-300 ${step3Styles.text}`}>Summary</p>
            </div>
        </div>
    );
};

export default CheckoutSteps;