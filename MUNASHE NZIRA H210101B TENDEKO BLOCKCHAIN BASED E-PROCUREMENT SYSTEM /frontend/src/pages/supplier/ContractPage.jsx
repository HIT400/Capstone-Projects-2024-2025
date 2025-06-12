import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/both/Header";
import Footer from "../../components/public/Footer";
import PaymentsHistory from "../../components/public/PaymentsComponent";
import axios from "axios";
import {
  formatMoney,
  UpdatingClock,
  formatDateTime,
} from "../../utils/helpers";

export const Awards = ({ awards }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Details of the decision");

  return (
    <div className="p-4 border rounded">
      {/* Main Offer Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="mb-2 md:mb-0">
          <div>ФОП Доронін Ю.О.</div>
          <div className="text-gray-600">#3158621106 (UA-EDR)</div>
        </div>
        <div className="text-right">
          <div>Final offer:</div>
          <div className="text-secondary text-xl">3 330,00 USD</div>
          <div className="bg-secondary text-white px-2 py-1 rounded text-sm mt-1">
            Winner
          </div>
        </div>
      </div>

      {/* Dropdown Toggle */}
      <div className="mt-4">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="text-secondary hover:underline focus:outline-none"
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
                  ? "border-b-2 border-secondary text-secondary"
                  : "text-gray-500"
              }`}
            >
              Details of the decision
            </button>
            <button
              onClick={() => setActiveTab("Offer details")}
              className={`pb-2 focus:outline-none ${
                activeTab === "Offer details"
                  ? "border-b-2 border-secondary text-secondary"
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
                <strong>Winner</strong>
              </h5>
              <p>12 February 2025 : 21:54</p>
            </div>
          )}
          {activeTab === "Offer details" && (
            <section>
              <h2 className="font-medium text-lg mb-6">Customer information</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="text-gray-600">Name:</div>
                <div className="col-span-2 break-words">
                  КУ "Центр надання соціальних послуг Попельнастівської
                  сільської ради Олександрійського району Кіровоградської
                  області"
                </div>

                <div className="text-gray-600">EDRPOU code:</div>
                <div className="col-span-2">43970360</div>

                <div className="text-gray-600">Location:</div>
                <div className="col-span-2">
                  28062, Україна, Кіровоградська область, Олександрійський
                  район, село Попельнасте, вул Соборна, 3
                </div>

                <div className="text-gray-600">Category:</div>
                <div className="col-span-2">
                  Legal person providing the needs of the state or territorial
                  community
                </div>

                <div className="text-gray-600">Contact person:</div>
                <div className="col-span-2">
                  <div>Клочко Катерина Вячеславівна</div>
                  <div>+380505616384</div>
                  <div className="text-secondary break-all">
                    klochko319308@gmail.com
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

const SupplierContractPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("details");
  const [contract, setContract] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/contracts/${id}`,
          {
            withCredentials: true,
          }
        );

        setContract(response.data);
      } catch (err) {
        console.error("Error fetching contract:", err.response || err);
        setError(
          err.response?.data?.message || "Failed to fetch contract data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const mainTabs = [
    { id: "details", label: "Contract details" },
    { id: "specifications", label: "Specifications" },
    { id: "changes", label: "Changes to the contract" },
    { id: "payments", label: "Payments" },
  ];

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

  if (!contract) {
    return (
      <>
        <Header />
        <div className="text-center py-8">No Contract Data Available</div>
        <Footer />
      </>
    );
  }

  const isBiddingOpen = () => {
    const endDate = new Date(contract?.tender.closing_date);
    const now = new Date();
    return contract?.tender?.status === "active" && now < endDate;
  };

  return (
    <>
      <Header user_type="supplier" />
      <div className="bg-gray-50">
        <div className="bg-gray-50 ">
          <div className="max-w-6xl mx-auto p-4 md:p-6">
            {/* Page Header Section */}
            <div className="flex flex-col md:flex-row justify-between mb-6 space-y-2 md:space-y-0">
              <span className="text-gray-600">Contract information</span>
              <UpdatingClock />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start mb-8 py-6">
              {/* Title Section */}
              <div className="flex flex-col mb-6 md:mb-0">
                <h1 className="text-lg md:text-xl font-normal mb-2">
                  {contract?.tender?.title}
                </h1>
                <div className="flex flex-col md:flex-row items-start md:items-center text-sm text-gray-600 mb-4">
                  <span>
                    <h1>
                      {contract?.blockchain_transaction_ref ||
                        "ttest-r876545fedghurbeder"}{" "}
                      •
                    </h1>
                  </span>
                  <span className="text-gray-400 md:ml-1 break-all">
                    {contract?.id}
                  </span>
                </div>
              </div>

              {/* Value Section */}
              <div className="flex flex-col items-start md:items-end md:w-1/3 ml-4 md:ml-0 pr-6">
                <div className="text-gray-500 text-sm mb-1">Cost</div>
                <div className="text-secondary text-3xl font-medium">
                  {formatMoney(contract?.contract_value)}
                </div>
                <div className="text-gray-500 text-sm">
                  {contract?.tender?.value_currency}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-12">
              <div className="h-2 bg-gray-200 rounded-full w-full">
                <div className="h-2 bg-secondary rounded-full w-1/3"></div>
              </div>
              <div className="absolute -top-6 left-0 md:left-8 text-sm">
                Pending
              </div>
              <div className="absolute -top-6 right-0 md:right-8 text-sm">
                Completed
              </div>
            </div>
          </div>
        </div>

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
                        ? "border-b-2 border-secondary text-secondary"
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
                {/* Basic Information Section */}
                <section>
                  <h2 className="font-medium text-lg mb-6">
                    Information about the contract
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="text-gray-600">Contract number:</div>
                    <div className="col-span-2 break-words">{contract?.id}</div>

                    <div className="text-gray-600">Date Signed:</div>
                    <div className="col-span-2">
                      {formatDateTime(contract?.contract_date)}
                    </div>

                    <div className="text-gray-600">
                      Period of validity of the contract:
                    </div>
                    <div className="col-span-2">
                      {formatDateTime(contract?.tender?.date_created)}{" "}
                      {formatDateTime(contract?.tender?.closing_date)}
                    </div>
                  </div>
                </section>

                {/* Buyer Information Section */}
                <section>
                  <h2 className="font-medium text-lg mb-6">
                    Buyer information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="text-gray-600">Name:</div>
                    <div className="col-span-2 break-words">
                      {contract?.tender?.procuring_entity?.user?.name}
                    </div>

                    <div className="text-gray-600">
                      Organization identifier:
                    </div>
                    <div className="col-span-2">
                      {contract?.tender?.procuring_entity.id}
                    </div>

                    <div className="text-gray-600">Location:</div>
                    <div className="col-span-2">
                      {contract?.tender?.procuring_entity?.user?.address_street}{" "}
                      {contract?.tender?.procuring_entity?.user?.address_region}{" "}
                      {
                        contract?.tender?.procuring_entity?.user
                          ?.address_country
                      }
                    </div>

                    <div className="text-gray-600">Category:</div>
                    <div className="col-span-2">
                      Legal person providing the needs of the state or
                      territorial community
                    </div>
                    <div className="text-gray-600">Website:</div>
                    <div className="col-span-2 text-secondary">
                      <a> stabnashiamunashe.tech</a>
                    </div>
                  </div>
                </section>

                {/* Supplier Information Section */}
                <section>
                  <h2 className="font-medium text-lg mb-6">
                    Supplier information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="text-gray-600">Name:</div>
                    <div className="col-span-2 break-words">
                      {contract?.supplier?.legal_name}
                    </div>

                    <div className="text-gray-600">
                      Organization identifier:
                    </div>
                    <div className="col-span-2">{contract?.supplier?.id}</div>

                    <div className="text-gray-600">Location:</div>
                    <div className="col-span-2">
                      {contract?.supplier?.user?.address_street}{" "}
                      {contract?.supplier?.user?.address_region}{" "}
                      {contract?.supplier?.user?.address_country}
                    </div>

                    <div className="text-gray-600">Category:</div>
                    <div className="col-span-2">
                      Legal person providing the needs of the state or
                      territorial community
                    </div>
                    <div className="text-gray-600">Website:</div>
                    <div className="col-span-2 text-secondary">
                      <a> stabnashiamunashe.tech</a>
                    </div>
                  </div>
                </section>

                {/* Documentation Section */}
                {/* <section>
                  <h2 className="font-medium text-lg mb-6">Documentation</h2>
                  {documents.length > 0 ? (
                    <ul className="space-y-2">
                      {documents.map((doc, index) => {
                        const isImage = doc.type.startsWith("image/");
                        return (
                          <li
                            key={`doc-${doc.name}-${index}`}
                            className="text-sm mb-4 flex items-center gap-3"
                          >
                            {isImage ? (
                              <img
                                src={URL.createObjectURL(doc)}
                                alt={doc.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-600 rounded">
                                📄
                              </div>
                            )}
                            <span className="text-primary">{doc.name}</span>
                            <button
                              onClick={() => handleRemoveDocument(doc.name)}
                              className="ml-auto text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No documents uploaded.
                    </p>
                  )}
                </section> */}

                <section>
                  <h2 className="font-medium text-lg mb-6">Documentation</h2>
                  <div className="text-sm mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-600 rounded">
                      📄
                    </div>
                    <span className="text-primary">Contract.pdf</span>
                  </div>
                  <div className="text-sm mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-600 rounded">
                      📄
                    </div>
                    <span className="text-primary">Invoice.pdf</span>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "specifications" && (
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
                    {contract?.tender?.items?.map((item, index) => (
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
                        <td className="py-4">{item.delivery_address_region}</td>
                        <td className="py-4">{item.delivery_address_street}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "payments" && (
              <PaymentsHistory contract={contract ? contract : {}} />
            )}

            {activeTab === "changes" && (
              <div className="space-y-12">
                <h2 className="font-medium text-lg mb-6">
                  No changes at the moment
                </h2>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SupplierContractPage;
