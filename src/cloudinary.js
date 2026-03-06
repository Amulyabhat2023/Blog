import axios from "axios";

const CLOUD_NAME = "dnrs2ehxi";
const UPLOAD_PRESET = "blog_upload";

export async function uploadToCloudinary(file) {

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    formData
  );

  return {
    url: res.data.secure_url,
    type: res.data.resource_type
  };
}