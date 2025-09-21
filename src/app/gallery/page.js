'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function GalleryPage() {
    const [images, setImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isAdmin, setIsAdmin] = useState(false); // New state for admin check
    const [isFullScreen, setIsFullScreen] = useState(false); // New state for fullscreen image view
    const [selectedImage, setSelectedImage] = useState(""); // State to hold the currently selected image

    // Fetch gallery images and check for admin status
    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const response = await fetch("/api/gallery");
                const data = await response.json();
                setImages(data[0]?.images || []); // Adjusted to access the images inside the first object
            } catch (error) {
                console.error("Error fetching gallery images:", error);
                setError("Не удалось загрузить изображения.");
            }
        };
    
        const checkAdmin = async () => {
            try {
                const adminPassword = localStorage.getItem('AdminPas');
                const response = await fetch('/api/checkAdmin', {
                    headers: { 'x-admin-password': adminPassword },
                });
    
                const data = await response.json();
                setIsAdmin(data.isAdmin);
            } catch (error) {
                console.error('Ошибка проверки администратора:', error);
            }
        };
    
        fetchGallery();
        checkAdmin();
    }, []); // Ensures the gallery is always fetched on component mount

    const uploadImages = async (files) => {
        const urls = [];
        const formData = new FormData();
        setLoading(true);

        for (const file of files) {
            formData.append("file", file);
            formData.append("upload_preset", "my_preset");

            try {
                const response = await fetch("https://api.cloudinary.com/v1_1/dzbuo2vqt/image/upload", {
                    method: "POST",
                    body: formData,
                });
                const result = await response.json();
                urls.push(result.secure_url);
            } catch (error) {
                console.error("Error uploading image:", error);
                setError("Ошибка при загрузке изображений.");
            }
        }

        setLoading(false);

        // Now send the Cloudinary URLs to the server to be saved in gallery.json
        try {
            await fetch("/api/gallery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls })
            });
            setImages((prevImages) => [...prevImages, ...urls]);
        } catch (error) {
            console.error("Error saving image URLs:", error);
            setError("Ошибка при сохранении изображений.");
        }

        return urls;
    };

    const handleUpload = async () => {
        if (!selectedFiles) return;
        setError("");

        try {
            await uploadImages(selectedFiles);
        } catch (error) {
            setError("Ошибка загрузки изображений.");
        }
    };

    const handleDelete = async (imageUrl) => {
        try {
            await fetch("/api/gallery", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageUrl }),
            });
            setImages(images.filter((url) => url !== imageUrl));
        } catch (error) {
            console.error("Error deleting image:", error);
            setError("Ошибка удаления изображения.");
        }
    };

    const openFullScreen = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsFullScreen(true);
    };

    const closeFullScreen = () => {
        setIsFullScreen(false);
        setSelectedImage("");
    };

    return (
        <>
    <Navbar />

    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Gallery</h1>
        {error && <p className="text-red-700 mb-2">{error}</p>}

        {isAdmin && (
            <div className="mb-4">
                <input
                    type="file"
                    multiple
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="mb-2"
                />
                <button
                    className="bg-blue-500 text-white px-4 py-2 mt-2 disabled:opacity-50"
                    onClick={handleUpload}
                    disabled={loading}
                >
                    {loading ? "Uploading..." : "Upload Images"}
                </button>
            </div>
        )}

        {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {images.map((imageUrl, index) => (
                    <div key={index} className="relative">
                        <img
                            src={imageUrl}
                            alt={`Image ${index}`}
                            className="w-full h-48 object-cover rounded-lg cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105"
                            onClick={() => openFullScreen(imageUrl)} // Open fullscreen on click
                        />
                        {isAdmin && (
                            <button
                                className="absolute top-2 right-2 bg-red-700 text-white px-2 py-1 text-sm rounded-full"
                                onClick={() => handleDelete(imageUrl)}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-gray-500 mt-4">Галерея пуста.</p>
        )}

        {isFullScreen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                <div className="relative">
                    <img
                        src={selectedImage}
                        alt="Fullscreen"
                        className="max-w-full max-h-full object-contain"
                    />
                    <button
                        className="absolute top-2 right-2 text-[50px] bg-black bg-opacity-50 p-2 "
                        onClick={closeFullScreen}
                    >
                        ✕
                    </button>
                </div>
            </div>
        )}
    </div>

    <Footer />
</>

    );
}
