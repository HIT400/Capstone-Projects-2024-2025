import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Header from "../../components/both/Header";
import Footer from "../../components/public/Footer";
import {
  AlertCircle,
  FileText,
  Upload,
  CheckCircle,
  Trash2,
  Clock,
  DollarSign,
  Loader,
  Edit2,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import { formatMoney, formatNumber, formatDateTime } from "../../utils/helpers";
import ReportPrazViolationModal from "../../components/both/ReportPrazViolationModal";

const BidSubmissionForm = ({ tender, isOpen, userAuthorizedCategories }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [documents, setDocuments] = useState([]);
  const [existingBid, setExistingBid] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bidItems, setBidItems] = useState(
    tender.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unit_name: item.unit_name,
      unit_price: "",
      total_price: "",
    }))
  );

  const isAuthorized = userAuthorizedCategories.some(
    (category) => category.id === tender.category.id
  );

  useEffect(() => {
    const fetchExistingBid = async () => {
      try {
        const token = Cookies.get("p_at");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:8000/bids/tender/${tender.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.status === 200) {
          const bid = response.data;
          setExistingBid(bid);
          setBidAmount(bid.bid_amount.toString());
          setDocuments(bid.documents || []);

          setBidItems(
            tender.items.map((tenderItem) => {
              const existingItem = bid.bid_items.find(
                (bidItem) => bidItem.item_id === tenderItem.id
              );
              return {
                id: tenderItem.id,
                description: tenderItem.description,
                quantity: tenderItem.quantity,
                unit_name: tenderItem.unitName,
                unit_price: existingItem
                  ? existingItem.unit_price.toString()
                  : "",
                total_price: existingItem ? existingItem.total_price : "",
              };
            })
          );
        }
      } catch (error) {
        console.error("Error fetching existing bid:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingBid();
  }, [tender.id]);

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setDocuments((prev) => [...prev, ...newFiles]);
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemPrice = (index, unitPrice) => {
    const updatedItems = [...bidItems];
    const numberUnitPrice = parseFloat(unitPrice) || 0;

    updatedItems[index] = {
      ...updatedItems[index],
      unit_price: unitPrice,
      total_price: numberUnitPrice * updatedItems[index].quantity,
    };
    setBidItems(updatedItems);

    const total = updatedItems.reduce(
      (sum, item) => sum + (parseFloat(item.total_price) || 0),
      0
    );
    setBidAmount(total.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = Cookies.get("p_at");

      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const bidData = {
        bid_amount: parseFloat(bidAmount),
        tender_id: tender.id,
        documents,
        bid_items: bidItems.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit_name: item.unit_name,
          unit_price: parseFloat(item.unit_price),
          total_price: item.total_price,
        })),
      };

      const url = existingBid
        ? `http://localhost:8000/bids/${existingBid.id}`
        : "http://localhost:8000/bids";

      const method = existingBid ? "put" : "post";

      const response = await axios[method](url, bidData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201 || response.status === 200) {
        setToastMessage(
          existingBid
            ? "Bid updated successfully!"
            : "Bid submitted successfully!"
        );
        setShowToast(true);
        setIsEditing(false);
        if (!existingBid) {
          setExistingBid(response.data);
        }
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      setToastMessage("Something went wrong. Could not submit bid!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader className="animate-spin" size={24} />
        <span className="ml-2">Loading bid information...</span>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center text-yellow-800">
          <Clock className="mr-2" size={20} />
          <span>This tender is closed for new bids</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center text-red-800">
          <AlertCircle className="mr-2" size={20} />
          <span>
            You are not authorized to bid in this category. You need to apply
            with the{" "}
            <a
              href="https://www.praz.gov.zw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary italic"
            >
              procurement regulatory authority of zimbabwe
            </a>{" "}
            to update your authorization. If you believe this is an error,
            please contact the PRAZ team for assistance.
          </span>
        </div>
      </div>
    );
  }

  if (existingBid && !isEditing) {
    return (
      <div className="border rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium">Your Submitted Bid</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center text-primary hover:text-primary-dark"
          >
            <Edit2 size={16} className="mr-1" />
            Edit Bid
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-4">Bid Items</h4>
            <div className="space-y-4">
              {bidItems.map((item, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-gray-600">
                        Quantity: {item.quantity} {item.unit_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        Unit Price: {tender.valueCurrency}{" "}
                        {formatNumber(item.unit_price)}
                      </div>
                      <div className="font-medium">
                        Total: {tender.valueCurrency}{" "}
                        {formatNumber(item.total_price)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Total Bid Amount</h4>
            <div className="text-2xl text-green-600">
              {tender.valueCurrency} {formatNumber(bidAmount)}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Submitted Documents</h4>
            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc, index) => (
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

          {existingBid.is_winning_bid && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center text-green-800">
                <Award className="mr-2" size={20} />
                <span>Your bid has been selected as the winning bid!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 mb-8">
      <h3 className="text-xl font-medium mb-6">
        {existingBid ? "Edit Your Bid" : "Submit Your Bid"}
      </h3>

      {/* Bid Items */}
      <div className="mb-6">
        <h4 className="font-medium mb-4">Item Pricing</h4>
        <div className="space-y-4">
          {bidItems.map((item, index) => (
            <div key={index} className="border rounded p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="font-medium">{item.description}</div>
                  <div className="text-sm text-gray-600">
                    Quantity: {item.quantity} {item.unit_name}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Unit Price ({tender.valueCurrency})
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="number"
                      className="w-full pl-8 pr-4 py-2 border rounded-lg"
                      value={item.unit_price}
                      onChange={(e) => updateItemPrice(index, e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Total: {tender.valueCurrency}{" "}
                    {formatNumber(item.total_price)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Bid Amount */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Total Bid Amount</h4>
        <div className="text-2xl text-green-600">
          {tender.valueCurrency} {formatNumber(bidAmount)}
        </div>
        {parseFloat(bidAmount) > tender.valueAmount && (
          <div className="mt-2 text-red-600 flex items-center">
            <AlertCircle size={16} className="mr-1" />
            Bid amount exceeds the tender's expected value
          </div>
        )}
      </div>

      {/* Document Upload */}
      <div className="mb-6">
        <h4 className="font-medium mb-4">Required Documents</h4>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Upload className="mx-auto mb-2" size={24} />
          <div className="mb-2">Drag and drop files or</div>
          <label className="cursor-pointer text-primary hover:underline">
            Browse files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <div className="flex items-center">
                  <FileText size={16} className="mr-2" />
                  <span>{doc.name}</span>
                </div>
                <button
                  onClick={() => removeDocument(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        {isEditing && (
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark"
        >
          {existingBid ? "Update Bid" : "Submit Bid"}
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center">
          {toastMessage.includes("success") ? (
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

export const ProcurementConditions = ({ tender }) => {
  const [isOpen, setIsOpen] = useState(false);

  const conditions = [
    { label: "Minimum number of bids", value: "1" },
    { label: "Preliminary qualification of participants", value: "No" },
    {
      label: "Sequential procedure for consideration of proposals",
      value: "Yes",
    },
    { label: "Electronic auction", value: "No" },
    { label: "The bid price is limited to the expected value", value: "Yes" },
    {
      label: "The currency of the bid is determined by the procurement",
      value: "Yes",
    },
    { label: "Appeal of the tender documentation", value: "No" },
    { label: "Selection with pre-qualified participants", value: "No" },
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
              to={`/suppliers/contract/${contract_id}`}
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
const SupplierTenderPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("details");
  const [tender, setTender] = useState(null);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allowedCategories, setAllowedCategories] = useState([]);
  const [error, setError] = useState(null);
  const [isPrazModalOpen, setIsPrazModalOpen] = useState(false);

  useEffect(() => {
    console.log("Tender Updated to: ", tender);
    console.log("Allowed Categories: ", allowedCategories);
  }, [tender, allowedCategories]);

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
        const [tenderResponse, categoriesResponse] = await axios.all([
          axios.get(`http://localhost:8000/tenders/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:8000/suppliers/categories/allowed`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTender(tenderResponse.data.tender);
        setVerified(tenderResponse.data.verified);
        setAllowedCategories(categoriesResponse.data);
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
    { id: "questions", label: "Questions and requirements)" },
    { id: "complaints", label: "Complaints" },
    { id: "bids", label: "Bids" },
    { id: "monitoring", label: "Monitoring" },
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
        <Header user_type="supplier" />
        <div className="text-center py-8">Loading tender details...</div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header user_type="supplier" />
        <div className="text-center py-8 text-red-500">Error: {error}</div>
        <Footer />
      </>
    );
  }

  if (!tender) {
    return (
      <>
        <Header user_type="supplier" />
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
      <Header user_type="supplier" />
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
              <div className="space-y-12">
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

                {/* Add Bid Submission Form */}

                {tender && (
                  <BidSubmissionForm
                    tender={tender}
                    isOpen={isBiddingOpen()}
                    userAuthorizedCategories={allowedCategories}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SupplierTenderPage;
