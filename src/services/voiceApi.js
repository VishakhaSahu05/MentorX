import axios from "axios";
import { BASE_URL } from "../utils/constant";

export const uploadVoice = async (blob) => {
  const formData = new FormData();
  formData.append("voice", blob); // 🔥 name = "voice"

  const res = await axios.post(
    `${BASE_URL}/upload/voice`, // ✅ NO /api
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    }
  );

  return res.data;
};
