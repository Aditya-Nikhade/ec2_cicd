import { useState } from 'react';
import toast from 'react-hot-toast';

const useFileUpload = () => {
    const [uploading, setUploading] = useState(false);

    const uploadFile = async (file) => {
        if (!file) return null;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem("chat-user")).token}`
                },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to upload file');
            }

            toast.success('File uploaded successfully');
            return data.fileUrl;
        } catch (error) {
            toast.error(error.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    return { uploadFile, uploading };
};

export default useFileUpload; 