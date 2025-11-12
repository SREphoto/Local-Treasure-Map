import React, { useState, useCallback } from 'react';
import { generateListingDetails } from '../services/geminiService';
import { SparklesIcon, UploadIcon, CheckCircleIcon } from './Icons';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const COMMON_CATEGORIES = [
    'Furniture', 'Electronics', 'Clothing', 'Home Goods', 'Books', 'Toys & Games', 'Sports & Outdoors', 'Antiques', 'Collectibles'
];


export const ListingForm: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [title, setTitle] = useState('Example: Vintage Leather Chair');
    const [description, setDescription] = useState('Example: Well-loved vintage leather chair, perfect for a reading nook. Some minor scuffs consistent with age, adding to its character.');
    const [price, setPrice] = useState('150');
    const [category, setCategory] = useState('Furniture');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPublished, setIsPublished] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            // Reset form and clear defaults for a new listing
            setIsPublished(false);
            setIsEditing(false);
            setTitle('');
            setDescription('');
            setPrice('');
            setCategory('');
            setError(null);
        }
    };

    const handleGenerateDetails = useCallback(async () => {
        if (!imageFile) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const base64Image = await fileToBase64(imageFile);
            const details = await generateListingDetails(base64Image, imageFile.type);
            setTitle(details.title);
            setDescription(details.description);
            setPrice(details.price.toString());
            setCategory(details.category);
        } catch (err) {
            console.error(err);
            setError('Failed to generate details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [imageFile]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsPublished(true);
        setIsEditing(false); // Exit editing mode on save
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md animate-fade-in">
             <h2 className="text-2xl font-bold text-gray-800 mb-4">
                 {isPublished ? 'Your Live Listing' : 'Create a New Listing'}
             </h2>
             {isPublished && !isEditing && (
                 <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md flex items-center justify-between" role="alert">
                    <div className="flex items-center">
                        <CheckCircleIcon />
                        <p className="ml-3 font-bold">Success! Your item is live.</p>
                    </div>
                    <button
                        onClick={handleEdit}
                        className="bg-green-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-700 text-sm"
                    >
                        Edit Listing
                    </button>
                 </div>
             )}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">Item Photo</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Item preview" className="mx-auto h-48 w-auto rounded-md object-cover"/>
                            ) : (
                                <>
                                    <UploadIcon />
                                    <p className="text-sm text-gray-600">
                                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                            Upload a file
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </>
                            )}
                             <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>
                     <button
                        onClick={handleGenerateDetails}
                        disabled={!imageFile || isLoading || (isPublished && !isEditing)}
                        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                     >
                         {isLoading ? 'Generating...' : <><SparklesIcon /> Generate with AI</>}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-4 gap-y-5">
                     <div className="col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100" required disabled={isPublished && !isEditing} />
                    </div>
                    
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <input list="categories" type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100" required disabled={isPublished && !isEditing} />
                        <datalist id="categories">
                            {COMMON_CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                        </datalist>
                    </div>

                     <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
                        <input type="number" id="price" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100" required disabled={isPublished && !isEditing} />
                    </div>

                     <div className="col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100" required disabled={isPublished && !isEditing} />
                    </div>
                    
                    {(!isPublished || isEditing) && (
                         <div className="col-span-2">
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                {isPublished ? 'Update Listing' : 'Publish Listing'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
