// frontend/src/pages/TryOnScreen.jsx
import React from 'react';
import Message from '../components/Message'; // Make sure this component is imported correctly

const TryOnScreen = () => {
    return (
        <div className="container mx-auto p-4 text-white">
            <h2 className="text-3xl font-bold text-center my-8">Virtual Try-On Studio</h2>
            
            <div className="w-full max-w-4xl mx-auto mt-8 p-6 border rounded-2xl shadow-md bg-[#1A202C]">
                <Message variant="info">
                    The Virtual Try-On Studio is a premium AI feature that has been disabled to prevent service charges. The underlying code and logic are complete and can be re-enabled at any time by connecting to a paid cloud AI service.
                </Message>
            </div>
        </div>
    );
};

export default TryOnScreen;
