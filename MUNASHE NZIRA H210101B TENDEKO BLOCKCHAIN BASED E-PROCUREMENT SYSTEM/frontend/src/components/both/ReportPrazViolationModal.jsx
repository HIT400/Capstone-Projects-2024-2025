import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Loader, X, Info } from "lucide-react";

const ReportPrazViolationModal = ({
  tenderId,
  isOpen,
  onClose,
  tenderData,
}) => {
  const [violationTitle, setViolationTitle] = useState("");
  const [violationDescription, setViolationDescription] = useState("");
  const [violationStatus, setViolationStatus] = useState("high");
  const [violationDate, setViolationDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      const today = new Date().toISOString().split("T")[0];
      setViolationDate(today);

      // Auto-populate title if tender data is available
      if (tenderData?.tender) {
        setViolationTitle(
          `Potential irregularity in tender: ${tenderData.tender.title}`
        );
      } else {
        setViolationTitle("");
      }

      setViolationDescription("");
      setViolationStatus("high");
    }
  }, [isOpen, tenderData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = Cookies.get("p_at");
      await axios.post(
        "http://localhost:8000/violations",
        {
          tender: tenderId,
          title: violationTitle,
          description: violationDescription,
          status: violationStatus,
          date: violationDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onClose();
    } catch (error) {
      console.error("Error submitting violation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Report Potential Violation to PRAZ
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {tenderData?.tender && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2 text-blue-800">
                Tender Information
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Title:</span>{" "}
                  {tenderData.tender.title}
                </div>
                <div>
                  <span className="text-gray-600">Value:</span>{" "}
                  {tenderData.tender.value_currency}{" "}
                  {tenderData.tender.value_amount.toLocaleString()}
                </div>
                <div>
                  <span className="text-gray-600">Entity:</span>{" "}
                  {tenderData.tender.procuring_entity?.user?.name || "N/A"}
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>{" "}
                  {tenderData.tender.status}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Title</label>
                <div className="flex items-center text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Be specific and concise</span>
                </div>
              </div>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-lg"
                value={violationTitle}
                onChange={(e) => setViolationTitle(e.target.value)}
                placeholder="E.g., Bid rigging suspected in tender evaluation"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Description</label>
                <div className="flex items-center text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Include specific details and observations</span>
                </div>
              </div>
              <textarea
                required
                className="w-full p-2 border rounded-lg"
                rows="4"
                value={violationDescription}
                onChange={(e) => setViolationDescription(e.target.value)}
                placeholder="Describe what you observed, including dates, names, and specific actions that may constitute a violation..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                  Severity Status
                </label>
                <div className="flex items-center text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Indicates priority level for investigation</span>
                </div>
              </div>
              <select
                required
                className="w-full p-2 border rounded-lg"
                value={violationStatus}
                onChange={(e) => setViolationStatus(e.target.value)}
              >
                <option value="high">High - Immediate action required</option>
                <option value="medium">
                  Medium - Requires attention within 7 days
                </option>
                <option value="low">
                  Low - Requires review within 30 days
                </option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                  Date Detected
                </label>
                <div className="flex items-center text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  <span>When the potential violation was first noticed</span>
                </div>
              </div>
              <input
                type="date"
                required
                className="w-full p-2 border rounded-lg"
                value={violationDate}
                onChange={(e) => setViolationDate(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin mr-2" size={20} />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportPrazViolationModal;
