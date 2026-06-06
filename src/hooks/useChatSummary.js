// src/hooks/useChatSummary.js
import { useState, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant";

const useChatSummary = (conversationId) => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!conversationId) return;

    setIsLoading(true);
    setError(null);
    setSummary(null);
    setIsModalOpen(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/ai-summary/conversation/${conversationId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setSummary(response.data.summary);
      } else {
        setError(response.data.error || "Failed to generate summary.");
      }
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSummary(null);
      setError(null);
    }, 300);
  }, []);

  return { summary, isLoading, error, isModalOpen, fetchSummary, closeModal };
};

export default useChatSummary;
