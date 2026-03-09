"use client";
import React, { useState } from 'react';

const Home = () => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const DUMMY_UPLOAD_API = "https://jsonplaceholder.typicode.com/posts"; // Using a public dummy POST endpoint
    // Using a dummy text file GET endpoint for testing download
    const DUMMY_RECEIVE_API = "https://raw.githubusercontent.com/w3c/web-platform-tests/master/tools/pytest.ini";

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(DUMMY_UPLOAD_API, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error("Upload failed");
            setIsUploaded(true);
            alert("File uploaded successfully! You can now download the compressed version.");
        } catch (error) {
            console.error(error);
            alert("Error uploading file: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(DUMMY_RECEIVE_API);
            if (!response.ok) throw new Error("Failed to download file");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'compressed.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Clean up the object URL after download
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error(error);
            alert("Error downloading file: " + error.message);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 to-black text-white">
            <div className="bg-gray-800/50 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-700/50 text-center">
                <h1 className="text-4xl font-extrabold mb-8 text-white">
                    Compress TXT file
                </h1>

                {/* Upload Section */}
                <div className="space-y-5 mb-8">
                    <div className="text-left">
                        <label className="block text-gray-300 text-sm mb-2 font-semibold">Select File</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".txt"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-400
                                file:mr-4 file:py-3 file:px-6
                                file:rounded-xl file:border-0
                                file:text-sm file:font-bold
                                file:bg-blue-600 file:text-white
                                hover:file:bg-blue-500 file:cursor-pointer transition-all
                                bg-gray-900/50 outline-none rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !file}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] ${isUploading || !file
                            ? 'bg-gray-600 cursor-not-allowed opacity-70'
                            : 'bg-blue-600 hover:bg-blue-500 cursor-pointer'
                            }`}
                    >
                        {isUploading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Uploading...
                            </span>
                        ) : 'Send to Backend'}
                    </button>
                </div>

                <div className="flex items-center gap-4 my-8">
                    <div className="h-px bg-gray-700 flex-1"></div>
                    <span className="text-gray-500 font-medium text-sm">RECEIVE DATA</span>
                    <div className="h-px bg-gray-700 flex-1"></div>
                </div>

                {/* Download Section */}
                <div className="space-y-5">
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading || !isUploaded}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${isDownloading || !isUploaded
                            ? 'bg-gray-600 cursor-not-allowed opacity-70'
                            : 'bg-green-600 hover:bg-green-500 cursor-pointer'
                            }`}
                    >
                        {isDownloading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Downloading...
                            </span>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Compressed File
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;