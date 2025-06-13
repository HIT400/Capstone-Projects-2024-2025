import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Header from "../../components/both/Header";
import Footer from "../../components/public/Footer";
import {
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Award,
  AlertCircle,
  CheckCircle,
  Loader,
  Send,
  UploadCloud,
} from "lucide-react";
import { formatMoney, formatDateTime } from "../../utils/helpers";
import PaymentsHistory from "../../components/public/PaymentsComponent";
import paypalLogo from "../../assets/payments/paypal.png";
import ecocashLogo from "../../assets/payments/EcoCash.png";
import { ReactComponent as PayNowIcon } from "../../assets/payments/PayNow.svg";
import ReportPrazViolationModal from "../../components/both/ReportPrazViolationModal";

const formatNumber = (value) => {
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  const num = parseFloat(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

const AllBidsList = ({ tender_id, currency }) => {
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const fetchAllBidsForTender = async () => {
      try {
        const token = Cookies.get("p_at");

        if (!token) {
          console.error("No authentication token found.");
          return;
        }

        const response = await axios.get(
          `http://localhost:8000/bids/tender/all/${tender_id}`,
          {
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBids(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllBidsForTender();
  }, [tender_id]);

  if (!bids.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        No bids submitted yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bids.map((bid) => (
        <div key={bid.id} className="border rounded-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {bid.supplier?.company_name || "Anonymous Supplier"}
            </h3>
            {bid.is_winning_bid && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                <Award className="mr-1" size={16} />
                Winning Bid
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Bid Items</h4>
              <div className="space-y-4">
                {bid.bid_items.map((item, index) => (
                  <div key={index} className="border rounded p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-gray-600">
                          Quantity: {bid.bid_items.quantity}{" "}
                          {bid.bid_items.unit_name}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Unit Price: {currency}{" "}
                          {formatNumber(bid.bid_items.unit_price)}
                        </div>
                        <div className="font-medium">
                          Total: {currency}{" "}
                          {formatNumber(bid.bid_items.total_price)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Total Bid Amount</h4>
              <div className="text-xl text-green-600">
                {currency} {formatNumber(bid.bid_amount)}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Submitted Documents</h4>
              {bid.documents.length > 0 ? (
                <div className="space-y-2">
                  {bid.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-50 p-2 rounded"
                    >
                      <FileText size={16} className="mr-2" />
                      <span>{doc.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No documents attached</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ProcurementConditions = ({ tender }) => {
  const [isOpen, setIsOpen] = useState(false);

  const conditions = [
    { label: "Minimum number of bids", value: "1" },
    {
      label: "Preliminary qualification of participants",
      value:
        "Have clearance to bid the category in which this tender belongs to",
    },
    {
      label: "Sequential procedure for consideration of proposals",
      value: "Yes",
    },
    { label: "Electronic auction", value: "Yes" },
    { label: "The bid price is limited to the expected value", value: "No" },
    {
      label: "The currency of the bid is determined by the procurement",
      value: "Yes",
    },
    { label: "Appeal of the tender documentation", value: "No" },
    { label: "Selection with pre-qualified participants", value: "Yes" },
    { label: "Contesting the results of determining the winner", value: "No" },
    { label: "Appeal against cancellation of purchase", value: "No" },
    { label: "Limited access", value: "No" },
    { label: "Expected value YES/NO", value: "" },
    { label: "The duration of appealing the qualification results", value: "" },
    {
      label:
        "The number of days between the final date for contesting the terms and the deadline for submitting proposals",
      value: "",
    },
    {
      label: "Duration of the appeal against the cancellation of the purchase",
      value: "",
    },
    {
      label: "The number of days to provide explanations for the request",
      value: "",
    },
    { label: "Qualification duration", value: "" },
    { label: "Appeal of the qualification results", value: "" },
    {
      label: "The duration of contesting the results of determining the winner",
      value: "",
    },
  ];

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 border rounded hover:bg-gray-50 transition-colors duration-150"
      >
        <span className="font-medium">
          Additional conditions of procurement
        </span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 p-4 space-y-4 bg-white">
          {conditions.map((condition, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2  last:border-b-0"
            >
              <div className="text-gray-600">{condition.label}:</div>
              <div>{condition.value || "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Awards = ({ award, bid, currency, contract_id }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Details of the decision");

  return (
    <div className="p-4 border rounded">
      {/* Main Offer Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="mb-2 md:mb-0">
          <div>{award?.supplier?.legal_name}</div>
          <div className="text-gray-600">
            <Link
              to={`/procurers/contract/${contract_id}`}
              className="text-blue-500"
            >
              {contract_id}
            </Link>
          </div>
        </div>
        <div className="text-right">
          <div>Final offer:</div>
          <div className="text-primary text-xl">
            {bid.bid_amount} {currency}
          </div>
          <div className="bg-primary text-white px-2 py-1 rounded text-sm mt-1">
            Winner
          </div>
        </div>
      </div>

      {/* Dropdown Toggle */}
      <div className="mt-4">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="text-primary hover:underline focus:outline-none"
        >
          {isDropdownOpen ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {/* Dropdown Content */}
      {isDropdownOpen && (
        <div className="mt-4 border-t pt-4">
          {/* Tabs Navigation */}
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab("Details of the decision")}
              className={`mr-4 pb-2 focus:outline-none ${
                activeTab === "Details of the decision"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500"
              }`}
            >
              Details of the decision
            </button>
            <button
              onClick={() => setActiveTab("Offer details")}
              className={`pb-2 focus:outline-none ${
                activeTab === "Offer details"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500"
              }`}
            >
              Offer details
            </button>
          </div>

          {/* Tabs Content */}
          {activeTab === "Details of the decision" && (
            <div>
              {/* Replace the content below with what’s shown in the first screenshot */}
              <h5>
                <strong>Winner awarded at:</strong>
              </h5>
              <p> {formatDateTime(award?.award_date)}</p>
            </div>
          )}
          {activeTab === "Offer details" && (
            <section>
              <h2 className="font-medium text-lg mb-6">Customer information</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="text-gray-600">Name:</div>
                <div className="col-span-2 break-words">
                  {award?.supplier?.legal_name}
                </div>

                <div className="text-gray-600">Vendor Number:</div>
                <div className="col-span-2">
                  {award?.supplier?.vendor_number}
                </div>

                <div className="text-gray-600">Tax Clearance:</div>
                <div className="col-span-2">
                  {award?.supplier?.tax_clearance_number}
                </div>

                <div className="text-gray-600">Location:</div>
                <div className="col-span-2">
                  {award?.supplier?.user?.address_street},{" "}
                  {award?.supplier?.user?.address_region},{" "}
                  {award?.supplier?.user?.address_country}
                </div>

                <div className="text-gray-600">Contact person:</div>
                <div className="col-span-2">
                  <div>{award?.supplier?.user?.name}</div>
                  <div>
                    {award?.supplier?.user?.contact_telephone ||
                      "+380505616384"}{" "}
                  </div>
                  <div className="text-primary break-all">
                    {award?.supplier?.user?.email}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

const PaymentInitiationSection = ({ tender }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("paypal");
  const [receiptFile, setReceiptFile] = useState(null);
  const [ecocashNumber, setEcocashNumber] = useState("");
  const [paynowReference, setPaynowReference] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get("paymentId");
    const PayerID = urlParams.get("PayerID");

    if (paymentId && PayerID) {
      executePayment(paymentId, PayerID);
    }
  }, []);

  const executePayment = async (paymentId, PayerID) => {
    setIsProcessing(true);
    try {
      const token = Cookies.get("p_at");
      const response = await axios.get(
        `http://localhost:8000/payments/paypal/execute-payment?paymentId=${paymentId}&PayerID=${PayerID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setToastMessage("Payment completed successfully!");
        setShowToast(true);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    } catch (error) {
      setToastMessage("Failed to complete payment. Please try again.");
      setShowToast(true);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const token = Cookies.get("p_at");

      if (selectedPaymentMethod === "paypal") {
        const response = await axios.post(
          `http://localhost:8000/payments/paypal/create-payment`,
          {
            amount: parseFloat(paymentAmount),
            currency: tender.value_currency,
            contract_id: tender.contracts[0].id,
            // contract_id: tender.contract.id,
            tender_id: tender.id,
            description: paymentDescription,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.approval_url) {
          localStorage.setItem(
            "pendingPayment",
            JSON.stringify({
              tender_id: tender.id,
              supplier_id: tender.awards[0].supplier_id,
              amount: parseFloat(paymentAmount),
            })
          );
          window.location.href = response.data.approval_url;
        }
      } else if (selectedPaymentMethod === "paynow") {
        // Handle PayNow payment
        const response = await axios.post(
          `http://localhost:8000/payments/paynow/create`,
          {
            tender_id: tender.id,
            supplier_id: tender.awards[0].supplier_id,
            amount: parseFloat(paymentAmount),
            currency: tender.value_currency,
            reference: paynowReference,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 201) {
          setToastMessage("PayNow payment processed successfully!");
          setShowToast(true);
          setPaymentAmount("");
          setPaynowReference("");
        }
      } else if (selectedPaymentMethod === "ecocash") {
        // Handle EcoCash payment
        const response = await axios.post(
          `http://localhost:8000/payments/ecocash/create`,
          {
            tender_id: tender.id,
            supplier_id: tender.awards[0].supplier_id,
            amount: parseFloat(paymentAmount),
            currency: tender.value_currency,
            phone_number: ecocashNumber,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 201) {
          setToastMessage(
            "EcoCash payment initiated successfully! Check your phone to confirm."
          );
          setShowToast(true);
          setPaymentAmount("");
          setEcocashNumber("");
        }
      } else if (selectedPaymentMethod === "manual") {
        // Handle manual payment with receipt upload
        const formData = new FormData();
        formData.append("tender_id", tender.id);
        formData.append("supplier_id", tender.awards[0].supplier_id);
        formData.append("amount", parseFloat(paymentAmount));
        formData.append("currency", tender.value_currency);
        formData.append("receipt", receiptFile);

        const response = await axios.post(
          `http://localhost:8000/payments/manual/create`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 201) {
          setToastMessage("Manual payment recorded successfully!");
          setShowToast(true);
          setPaymentAmount("");
          setReceiptFile(null);
        }
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      setToastMessage("Failed to process payment. Please try again.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentCancel = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("cancel") === "true") {
      setToastMessage("Payment was cancelled.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  useEffect(() => {
    handlePaymentCancel();
  }, []);

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  return (
    <div className="border rounded-lg p-6 mb-8">
      <h3 className="text-xl font-medium mb-6">Initiate Payment to Supplier</h3>

      {tender?.awards?.[0]?.supplier ? (
        <div className="space-y-6">
          {/* Supplier Details */}
          {tender.awards[0].supplier.bank_details ? (
            <div>
              <h4 className="font-medium mb-4">Supplier Banking Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">
                    Bank Name
                  </label>
                  <div className="font-medium">
                    {tender.awards[0].supplier.bank_details.bank_name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">
                    Account Number
                  </label>
                  <div className="font-medium">
                    {tender.awards[0].supplier.bank_details.account_number}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">
                    Account Holder
                  </label>
                  <div className="font-medium">
                    {tender.awards[0].supplier.bank_details.account_name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">
                    SWIFT/BIC Code
                  </label>
                  <div className="font-medium">
                    {tender.awards[0].supplier.bank_details.swift_code}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-medium mb-4">Supplier PayPal Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">
                    PayPal Email
                  </label>
                  <div className="font-medium">
                    supplier_dummy_paypal@example.com
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">
                    Account Status
                  </label>
                  <div className="font-medium">Verified</div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block font-medium mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* <button
                type="button"
                onClick={() => setSelectedPaymentMethod("paypal")}
                className={`p-3 border rounded-lg flex flex-col items-center justify-center ${
                  selectedPaymentMethod === "paypal"
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <img src={paypalLogo} alt="PayPal" className="w-8 h-8 mb-2" />
                <span>PayPal</span>
              </button> */}

              <button
                type="button"
                onClick={() => setSelectedPaymentMethod("paypal")}
                className={`p-3 border rounded-lg flex items-center justify-center ${
                  selectedPaymentMethod === "paypal"
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <img src={paypalLogo} alt="PayPal" className="w-24 h-24" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedPaymentMethod("paynow")}
                className={`p-3 border rounded-lg flex flex-col items-center justify-center ${
                  selectedPaymentMethod === "paynow"
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <PayNowIcon className="w-24 h-24" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedPaymentMethod("ecocash")}
                className={`p-3 border rounded-lg flex flex-col items-center justify-center ${
                  selectedPaymentMethod === "ecocash"
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <img src={ecocashLogo} alt="EcoCash" className="w-24 h-24" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedPaymentMethod("manual")}
                className={`p-3 border rounded-lg flex flex-col items-center justify-center ${
                  selectedPaymentMethod === "manual"
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <UploadCloud className="mb-2" size={24} />
                <span>Manual/Receipt</span>
              </button>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePaymentSubmit}>
            <div className="mb-6">
              <label className="block font-medium mb-2">
                Payment Amount ({tender.value_currency})
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                required
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-2">
                Payment Description
              </label>
              <textarea
                className="w-full p-2 border rounded-lg"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
                placeholder="Enter payment description"
                required
                rows="4"
              />
            </div>

            {/* PayNow specific fields */}
            {selectedPaymentMethod === "paynow" && (
              <div className="mb-6">
                <label className="block font-medium mb-2">
                  PayNow Reference Number
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={paynowReference}
                  onChange={(e) => setPaynowReference(e.target.value)}
                  placeholder="Enter PayNow reference"
                  required
                />
              </div>
            )}

            {/* EcoCash specific fields */}
            {selectedPaymentMethod === "ecocash" && (
              <div className="mb-6">
                <label className="block font-medium mb-2">
                  EcoCash Mobile Number
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={ecocashNumber}
                  onChange={(e) => setEcocashNumber(e.target.value)}
                  placeholder="Enter EcoCash number (e.g., +263 7X XXX XXXX)"
                  required
                />
              </div>
            )}

            {/* Manual payment with receipt upload */}
            {selectedPaymentMethod === "manual" && (
              <div className="mb-6">
                <label className="block font-medium mb-2">
                  Upload Payment Receipt
                </label>
                <input
                  type="file"
                  className="w-full p-2 border rounded-lg"
                  onChange={handleFileChange}
                  accept="image/*, application/pdf"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload proof of payment (PDF, JPG, PNG)
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2" size={20} />
                  {selectedPaymentMethod === "paypal" && "Pay with PayPal"}
                  {selectedPaymentMethod === "paynow" &&
                    "Submit PayNow Payment"}
                  {selectedPaymentMethod === "ecocash" && "Pay with EcoCash"}
                  {selectedPaymentMethod === "manual" && "Upload Receipt"}
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center text-yellow-800">
            <AlertCircle className="mr-2" size={20} />
            <span>Supplier details not available</span>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center z-50">
          {toastMessage.includes("success") ||
          toastMessage.includes("completed") ||
          toastMessage.includes("processed") ? (
            <CheckCircle className="text-green-500 mr-2" size={20} />
          ) : (
            <AlertCircle className="text-red-500 mr-2" size={20} />
          )}
          {toastMessage}
        </div>
      )}
    </div>
  );
};

const ProcurerTenderPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("details");
  const [tender, setTender] = useState(null);
  const [verified, setVerified] = useState(false);
  const [isCreatingProcurer, setIsCreatingProcurer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrazModalOpen, setIsPrazModalOpen] = useState(false);

  useEffect(() => {
    const fetchTender = async () => {
      if (!id) return;

      const token = Cookies.get("p_at");

      if (!token) {
        setError("Token not found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8000/tenders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTender(response.data.tender);
        setVerified(response.data.verified);
        setIsCreatingProcurer(response.data.for_requesting_entity);
      } catch (err) {
        setError("Failed to fetch tender data");
      } finally {
        setLoading(false);
      }
    };

    fetchTender();
  }, [id]);

  const mainTabs = [
    { id: "details", label: "Procurement details" },
    { id: "lots", label: `Lots (${(tender?.items || []).length})` },
    { id: "questions", label: "Questions and requirements (0)" },
    { id: "payments", label: "Payments" },
    { id: "complaints", label: "Complaints" },
    { id: "monitoring", label: "Monitoring" },
    { id: "bids", label: `Bids (${(tender?.bids || []).length})` },
    { id: "agreements", label: "Agreements and Contracts" },
  ];

  const isBiddingOpen = () => {
    const endDate = new Date(tender.closing_date);
    const now = new Date();
    return tender.status === "active" && now < endDate;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="text-center py-8">Loading tender details...</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="text-center py-8 text-red-500">Error: {error}</div>
        <Footer />
      </>
    );
  }

  if (!tender) {
    return (
      <>
        <Header />
        <div className="text-center py-8">No tender data available</div>
        <Footer />
      </>
    );
  }

  function formatDateTime(dateString) {
    const date = new Date(dateString);

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };

    return date.toLocaleString(undefined, options);
  }

  return (
    <>
      <Header user_type="procurer" />
      <div className="bg-gray-50 mb-4">
        {/* ... (your existing header section) */}

        <div className="bg-gray-50 pb-8">
          <div className="max-w-6xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between mb-6 space-y-2 md:space-y-0">
              <span className="text-gray-600">Purchase information</span>
              <span className="text-primary break-words">
                Procurement plan UA-P-2025-02-10-002197-a
              </span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start mb-8 py-6">
              {/* Title Section */}
              <div className="flex flex-col mb-6 md:mb-0">
                <h1 className="text-lg md:text-xl font-normal mb-2">
                  {tender.title}
                </h1>
                <div className="flex flex-col md:flex-row items-start md:items-center text-sm text-gray-600 mb-4">
                  <span>UA-2025-02-10-001827-a •</span>
                  <span className="text-gray-400 md:ml-1 break-all">
                    {tender.id}
                  </span>
                </div>

                <div className="inline-block bg-blue-50 text-sm p-2 py-3 rounded">
                  Procurement without using an electronic system
                </div>
              </div>

              {/* Value Section */}
              <div className="flex flex-col items-start md:items-end md:w-1/3 ml-4 md:ml-0 pr-6">
                <div className="text-gray-500 text-sm mb-1">Expected value</div>
                <div className="text-green-600 text-2xl font-medium">
                  {formatMoney(tender.value_amount)}
                </div>
                <div className="text-gray-500 text-sm">
                  {tender.value_currency}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-12">
              <div className="h-2 bg-gray-200 rounded-full w-full">
                <div className="h-2 bg-primary rounded-full w-1/3"></div>
              </div>
              <div className="absolute -top-6 left-0 md:left-8 text-sm">
                Contracting
              </div>
              <div className="absolute -top-6 right-0 md:right-8 text-sm">
                Completed
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex flex-col md:flex-row items-start md:items-center text-sm mb-4">
                  <span>Electronic digital signature superimposed.</span>
                  <a
                    href="#"
                    className={`md:ml-1 italic ${
                      verified ? "text-primary" : "text-red-500"
                    }`}
                  >
                    {verified ? "verified" : "unverified"}
                  </a>
                  {/* <a href="#" className="text-primary md:ml-1 italic">
                    Verify
                  </a> */}
                </div>
                <div className="text-gray-500 text-sm italic">
                  What should a potential supplier pay attention to?
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm mb-2">Contact person</div>
                <div>{tender.procuring_entity.contact_name}</div>
                <div>{tender.procuring_entity.contact_telephone}</div>
                <div className="text-primary break-all">
                  {tender.procuring_entity.contact_email}
                </div>
              </div>
              <div className="flex-1">
                <button
                  onClick={() => setIsPrazModalOpen(true)}
                  className="w-full md:w-auto bg-white border border-primary text-primary px-4 py-2 rounded flex items-center justify-center"
                >
                  Inform PRAZ about violations
                  <span className="ml-2">ℹ️</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <ReportPrazViolationModal
          tenderId={tender?.id}
          isOpen={isPrazModalOpen}
          onClose={() => setIsPrazModalOpen(false)}
        />

        {/* White Background Content Section */}
        <div className="bg-white py-3">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            {/* Main Tabs */}
            <div className="border-b mb-6 overflow-x-auto">
              <div className="flex gap-4 md:gap-8 text-sm w-max min-w-full">
                {mainTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`pb-4 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-b-2 border-primary text-primary"
                        : "text-gray-600"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "details" && (
              <div className="space-y-12">
                {/* Customer Information Section */}
                <section>
                  <h2 className="font-medium text-lg mb-6">
                    Customer information
                  </h2>
                  <div className="text-sm italic mb-4">
                    How to choose a customer for potential suppliers
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="text-gray-600">Name:</div>
                    <div className="col-span-2 break-words">
                      {tender?.procuring_entity?.user?.name}
                    </div>

                    <div className="text-gray-600">BP Number:</div>
                    <div className="col-span-2">43970360</div>

                    <div className="text-gray-600">Location:</div>
                    <div className="col-span-2">
                      {tender?.procuring_entity?.user?.address_street},{" "}
                      {tender.procuring_entity.user.address_region},{" "}
                      {tender.procuring_entity.user.address_country}
                    </div>

                    <div className="text-gray-600">Category:</div>
                    <div className="col-span-2">
                      Legal person providing the needs of the state or
                      territorial community
                    </div>

                    <div className="text-gray-600">Contact person:</div>
                    <div className="col-span-2">
                      <div>
                        {tender?.procuring_entity?.contact_name ||
                          "Public Service Commission"}
                      </div>
                      <div>{tender.procuring_entity.contact_telephone}</div>
                      <div className="text-primary break-all">
                        {tender.procuring_entity.contact_email}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Purchase Information Section */}
                <section>
                  <h2 className="font-medium text-lg mb-6">
                    Purchase information
                  </h2>
                  <div className="text-sm italic mb-4">
                    Guide to the timing of the auction
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="text-gray-600">Expected cost:</div>
                    <div className="col-span-2">
                      {formatMoney(tender?.value_amount)}{" "}
                      {tender?.value_currency}
                    </div>
                  </div>

                  <ProcurementConditions tender={tender} />

                  {/* <div className="mt-6">
                    <div className="flex justify-between items-center p-4 border rounded cursor-pointer">
                      <span>Additional conditions of procurement</span>
                      <span>▼</span>
                    </div>
                  </div> */}
                </section>

                {/* Tender Documentation Section */}
                <section>
                  <h2 className="font-medium text-lg mb-6">
                    Tender documentation
                  </h2>
                  <div className="text-sm italic mb-4">
                    How a bidder can influence the quality of tender documents
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      <div className="text-gray-600">
                        Type of subject of purchase:
                      </div>
                      <div className="col-span-2">goods</div>

                      <div className="text-gray-600">
                        Classifier and its corresponding code:
                      </div>
                      <div className="col-span-2">
                        15110000-2 — {tender.title}
                      </div>
                    </div>

                    <div className="overflow-x-auto py-4">
                      <table className="w-full mt-6 min-w-[600px]">
                        <thead>
                          <tr className="text-left">
                            <th className="pb-2">Item Name</th>
                            <th className="pb-2">Classifier and Code</th>
                            <th className="pb-2">Quantity</th>
                            <th className="pb-2">Unit Name</th>
                            <th className="pb-2">Delivery Date</th>
                            <th className="pb-2">Country</th>
                            <th className="pb-2">Region</th>
                            <th className="pb-2">Street Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tender.items.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="py-4">{item.description}</td>
                              <td className="py-4">{item.classification_id}</td>
                              <td className="py-4">{item.quantity}</td>
                              <td className="py-4">{item.unit_name}</td>
                              <td className="py-4">
                                {formatDateTime(item.delivery_date_end)}
                              </td>
                              <td className="py-4">
                                {item.delivery_address_country}
                              </td>
                              <td className="py-4">
                                {item.delivery_address_region}
                              </td>
                              <td className="py-4">
                                {item.delivery_address_street}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="py-4">
                      <h3 className="font-medium mb-4">
                        Proposal disclosure protocol
                      </h3>
                      <div className="space-y-2">
                        {tender.documents.map((document, index) => (
                          <div key={index}>
                            <a
                              href={document.url}
                              className="text-primary break-all"
                            >
                              📄 {document.name}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="py-4">
                      <div className="text-gray-600">Date of publication</div>
                      <div>10 February 2025</div>
                    </div>

                    {tender?.awards &&
                      tender.awards.map((award) => {
                        const bid = tender.bids.find(
                          (bid) => bid.id === award.bid_id
                        );

                        return (
                          <Awards
                            key={award.id}
                            award={award}
                            bid={bid}
                            currency={tender.value_currency}
                            contract_id={tender.contracts[0].id}
                          />
                        );
                      })}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "lots" && (
              <div className="space-y-12">
                <div className="overflow-x-auto py-4">
                  <table className="w-full mt-6 min-w-[600px]">
                    <thead>
                      <tr className="text-left">
                        <th className="pb-2">Item Name</th>
                        <th className="pb-2">Classifier and Code</th>
                        <th className="pb-2">Quantity</th>
                        <th className="pb-2">Unit Name</th>
                        <th className="pb-2">Delivery Date</th>
                        <th className="pb-2">Country</th>
                        <th className="pb-2">Region</th>
                        <th className="pb-2">Street Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tender.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="py-4">{item.description}</td>
                          <td className="py-4">{item.classification_id}</td>
                          <td className="py-4">{item.quantity}</td>
                          <td className="py-4">{item.unit_name}</td>
                          <td className="py-4">
                            {formatDateTime(item.delivery_date_end)}
                          </td>
                          <td className="py-4">
                            {item.delivery_address_country}
                          </td>
                          <td className="py-4">
                            {item.delivery_address_region}
                          </td>
                          <td className="py-4">
                            {item.delivery_address_street}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "agreements" && (
              <div className="space-y-12">
                {tender?.awards && tender.awards[0] && (
                  <Awards
                    award={tender.awards[0]}
                    bid={tender.bids.find(
                      (bid) => bid.id === tender.awards[0].bid_id
                    )}
                    contract_id={tender.contracts[0].id}
                  />
                )}
              </div>
            )}

            {activeTab === "bids" && (
              <>
                {isBiddingOpen() && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center text-blue-800">
                      <Clock className="mr-2" size={20} />
                      <span>
                        Bid submission deadline:{" "}
                        {formatDateTime(new Date(tender.closing_date))}
                      </span>
                    </div>
                  </div>
                )}
                <div className="space-y-12">
                  <AllBidsList
                    tender_id={tender.id}
                    currency={tender.value_currency}
                  />
                </div>
              </>
            )}

            {activeTab === "payments" && (
              <div className="space-y-12">
                {/* 
                { isCreatingProcurer && (

                  { Array.isArray(tender?.awards) &&
                  tender.awards.length > 0 &&
                  tender.awards[0]?.supplier && (
                    <PaymentInitiationSection tender={tender} />
                  )}


                ) } */}

                {Array.isArray(tender?.awards) &&
                  tender.awards.length > 0 &&
                  tender.awards[0]?.supplier && (
                    <PaymentInitiationSection tender={tender} />
                  )}

                <h2 className="font-medium text-lg mb-6">Payment History</h2>

                <PaymentsHistory contract={tender?.contracts[0]} />
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProcurerTenderPage;
