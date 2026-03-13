"use client";
import React, { useState } from 'react';

const Home = () => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadLink, setDownloadLink] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [metadata, setMetadata] = useState(null);

    const UPLOAD_API = "http://localhost:5000/api/file/upload";
    const RECEIVE_API = "http://localhost:5000/api/file/get";

    const formatBytes = (bytes, decimals = 2) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setDownloadLink("");
            setIsCopied(false);
            setIsUploaded(false);
            setMetadata(null);
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
            const response = await fetch(UPLOAD_API, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error("Upload failed");
            const data = await response.json();
            setDownloadLink(data.downloadLink);
            setMetadata(data.metadata);
            setIsUploaded(true);
            alert("File uploaded successfully! You can now copy the compressed file link.");
        } catch (error) {
            console.error(error);
            alert("Error uploading file: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCopyLink = async () => {
        let linkToCopy = downloadLink;

        if (!linkToCopy) {
            setIsDownloading(true);
            try {
                const response = await fetch(RECEIVE_API);
                if (!response.ok) throw new Error("Failed to fetch link");
                const data = await response.json();
                linkToCopy = data.downloadLink;
                setDownloadLink(linkToCopy);
                setMetadata(data.metadata);
            } catch (error) {
                console.error(error);
                alert("Error fetching link: " + error.message);
                setIsDownloading(false);
                return;
            } finally {
                setIsDownloading(false);
            }
        }

        try {
            await navigator.clipboard.writeText(linkToCopy);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert("Failed to copy link to clipboard");
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
                    <span className="text-gray-500 font-medium text-sm">RECEIVE LINK</span>
                    <div className="h-px bg-gray-700 flex-1"></div>
                </div>

                {/* Copy Link Section */}
                <div className="space-y-5">
                    <button
                        onClick={handleCopyLink}
                        disabled={isDownloading || !isUploaded}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 ${isDownloading || !isUploaded
                            ? 'bg-gray-600 cursor-not-allowed opacity-70'
                            : isCopied ? 'bg-green-600' : 'bg-green-600 hover:bg-green-500 cursor-pointer'
                            }`}
                    >
                        {isDownloading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Fetching Link...
                            </span>
                        ) : isCopied ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Link Copied!
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 022-2h2a2 2 0 022 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                Copy Compressed Link
                            </>
                        )}
                    </button>
                    {downloadLink && (
                        <p className="text-xs text-gray-500 mt-2 break-all overflow-hidden text-ellipsis max-h-12">
                            {downloadLink}
                        </p>
                    )}

                    {metadata && (
                        <div className="mt-8 p-6 bg-gray-900/60 rounded-2xl border border-gray-700/50 text-left space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Compression Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Original Size</p>
                                    <p className="text-lg font-semibold text-white">{formatBytes(metadata.originalSize)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Compressed Size</p>
                                    <p className="text-lg font-semibold text-green-400">{formatBytes(metadata.compressedSize)}</p>
                                </div>
                            </div>
                            <div className="pt-2">
                                <div className="flex justify-between items-end mb-1">
                                    <p className="text-xs text-gray-500">Reduction</p>
                                    <p className="text-xl font-black text-blue-500">{metadata.compressionPercentage}%</p>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                                        style={{ width: `${metadata.compressionPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-700/50">
                                <p className="text-xs text-gray-500 mb-1">Link Expires On</p>
                                <p className="text-sm font-medium text-amber-400">
                                    {new Date(metadata.expiresAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;