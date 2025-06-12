import React, { useState, useEffect } from "react";
import Header from "../../components/both/Header";
import Footer from "../../components/public/Footer";
import Toast from "../../components/public/Toast";
import Cookies from "js-cookie";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "../../components/public/Cards";
import { useNavigate } from "react-router-dom";
import { formatText } from "../../utils/helpers";

const BasicInfoCard = ({
  formData,
  handleChange,
  enumOptions,
  renderSelect,
  categories = [],
}) => {
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);

  useEffect(() => {
    if (!Array.isArray(categories)) return;

    const selectedCategory = categories.find(
      (cat) => cat?.id === Number(formData.procurement_category_id)
    );
    setFilteredSubcategories(selectedCategory?.subcategories || []);
  }, [formData.procurement_category_id, categories]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Basic Tender Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Tender Title</label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Expected Value</label>
              <input
                type="number"
                name="expected_value"
                value={formData.expected_value || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Currency</label>
              <select
                name="currency"
                value={formData.currency || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Currency</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="UAH">UAH</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category & Subcategory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Category</label>
            <select
              name="procurement_category_id"
              value={formData.procurement_category_id || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select Category</option>
              {Array.isArray(categories) &&
                categories.map((cat) =>
                  cat?.id && cat?.name ? (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ) : null
                )}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Subcategory</label>
            <select
              name="procurement_subcategory_id"
              value={formData.procurement_subcategory_id || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={!formData.procurement_category_id}
              required
            >
              <option value="">Select Subcategory</option>
              {Array.isArray(filteredSubcategories) &&
                filteredSubcategories.map((sub) =>
                  sub?.id && sub?.name ? (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ) : null
                )}
            </select>
          </div>
        </div>

        {/* Procurement Method & Tender Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSelect(
            "procurement_method",
            enumOptions?.procurement_methods || [],
            "Procurement Method"
          )}
          {renderSelect(
            "tender_status",
            enumOptions?.tender_statuses || [],
            "Tender Status"
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function StatusInfoCard({ formData, enumOptions, renderSelect }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Status Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSelect(
            "award_status",
            enumOptions.award_statuses,
            "Award Status"
          )}
          {renderSelect(
            "contract_status",
            enumOptions.contract_statuses,
            "Contract Status"
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerInfoCard({ formData, handleChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Customer Name</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">EDRPOU Code</label>
            <input
              type="text"
              name="edrpou_code"
              value={formData.edrpou_code}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Contact Person</label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ItemsInfoCard({ formData, setFormData }) {
  const addItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      description: "",
      unit: {
        name: "",
        code: "",
      },
      quantity: "",
      classification: {
        description: "",
        scheme: "TNWEW",
        id: "",
      },
      delivery_date: {
        end_date: "",
      },
      delivery_address: {
        street_address: "",
        region: "",
        postal_code: "",
        country_name: "Україна",
      },
    };

    setFormData({
      ...formData,
      items: [...(formData.items || []), newItem],
    });
  };

  const removeItem = (itemId) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== itemId),
    });
  };

  const updateItem = (itemId, field, value, subfield = null) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) => {
        if (item.id === itemId) {
          if (subfield) {
            return {
              ...item,
              [field]: {
                ...item[field],
                [subfield]: value,
              },
            };
          }
          return {
            ...item,
            [field]: value,
          };
        }
        return item;
      }),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Items Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* List of Items */}
        {formData.items?.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, "description", e.target.value)
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Unit Name</label>
                  <input
                    type="text"
                    value={item.unit.name}
                    onChange={(e) =>
                      updateItem(item.id, "unit", e.target.value, "name")
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Unit Code</label>
                  <input
                    type="text"
                    value={item.unit.code}
                    onChange={(e) =>
                      updateItem(item.id, "unit", e.target.value, "code")
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Quantity and Classification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, "quantity", e.target.value)
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Classification</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={item.classification.id}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "classification",
                        e.target.value,
                        "id"
                      )
                    }
                    placeholder="ID"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <input
                    type="text"
                    value={item.classification.description}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "classification",
                        e.target.value,
                        "description"
                      )
                    }
                    placeholder="Description"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Delivery Date</label>
                <input
                  type="date"
                  value={
                    item.delivery_date?.end_date
                      ? item.delivery_date.end_date.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    updateItem(item.id, "delivery_date", {
                      end_date: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Delivery Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={item.delivery_address.street_address}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "delivery_address",
                        e.target.value,
                        "street_address"
                      )
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Postal Code</label>
                  <input
                    type="text"
                    value={item.delivery_address.postal_code}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "delivery_address",
                        e.target.value,
                        "postal_code"
                      )
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Region</label>
                  <input
                    type="text"
                    value={item.delivery_address.region}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "delivery_address",
                        e.target.value,
                        "region"
                      )
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Country</label>
                  <input
                    type="text"
                    value={item.delivery_address.country_name}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "delivery_address",
                        e.target.value,
                        "country_name"
                      )
                    }
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="text-red-500 hover:text-red-700 mt-4"
            >
              Remove Item
            </button>
          </div>
        ))}

        {/* Add Item Button */}
        <button
          type="button"
          onClick={addItem}
          className="w-full bg-primary text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Add New Item
        </button>
      </CardContent>
    </Card>
  );
}

function DocumentInfoCard({
  documents,
  setDocuments,
  document_type,
  setDocumentType,
  confidentiality,
  setConfidentiality,
  enumOptions,
}) {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments((prevDocuments) => [...prevDocuments, ...files]);
  };

  const handleRemoveDocument = (fileName) => {
    setDocuments(documents.filter((doc) => doc.name !== fileName));
  };

  const renderSelect = (name, options, value, setValue, label) => (
    <div className="space-y-2">
      <label className="text-sm text-gray-600">{label}</label>
      <select
        name={name}
        value={value || ""}
        onChange={(e) => setValue(e.target.value)}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
        required
      >
        <option value="">Select {label}</option>
        {Array.isArray(options) &&
          options.map((option, index) => (
            <option key={`${name}-${option}-${index}`} value={option}>
              {option}
            </option>
          ))}
      </select>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Document Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSelect(
            "document_type",
            enumOptions.document_types,
            document_type,
            setDocumentType,
            "Document Type"
          )}
          {renderSelect(
            "confidentiality",
            enumOptions.confidentiality_types,
            confidentiality,
            setConfidentiality,
            "Confidentiality"
          )}
        </div>

        {/* Custom File Upload Button */}
        <div>
          <label className="block text-sm text-gray-600">
            Attach Documents
          </label>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-tertiary mt-2"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Files
          </button>
        </div>

        {documents.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-lg">Uploaded Documents</h3>
            <ul className="mt-2 space-y-2">
              {documents.map((doc, index) => {
                const isImage = doc.type.startsWith("image/");
                return (
                  <li
                    key={`doc-${doc.name}-${index}`}
                    className="flex items-center gap-3"
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DatesInfoCard({ formData, handleChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Important Dates</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Tender Start Date</label>
            <input
              type="datetime-local"
              name="tender_start_date"
              value={formData.tender_start_date}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">
              Closing Date and Time
            </label>
            <input
              type="datetime-local"
              name="closing_date"
              value={formData.closing_date}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Delivery Date</label>
            <input
              type="datetime-local"
              name="delivery_date"
              value={formData.delivery_date}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const TenderRegistrationForm = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");
  const navigate = useNavigate();

  // const [formData, setFormData] = useState({
  //   title: "Construction Materials",
  //   expected_value: "156000",
  //   currency: "USD",
  //   procurement_method: "selective",
  //   customer_name: "BuildCorp Ltd",
  //   edrpou_code: "BC7890XZ",
  //   location: "45 Samora Machel Ave, Harare, Zimbabwe",
  //   contact_person: "Tendai Moyo",
  //   phone_number: "0772113456",
  //   email: "tendaim@buildcorp.com",
  //   delivery_date: "",
  //   quantity: "45000",
  //   procurement_category_id: "",
  //   procurement_subcategory_id: "",
  //   unit: "ton",
  //   classifier_code: "",
  //   delivery_location: "",
  //   document_type: "Tender Invitation",
  //   tender_status: "active",
  //   confidentiality: "Public",
  //   award_status: "pending",
  //   contract_status: "active",
  //   tender_start_date: "2025-05-01",
  //   closing_date: "",
  //   items: [
  //     {
  //       id: "d9f34e1a-7af0-4f29-bd63-7ec5c340a111",
  //       description: "Cement 42.5R",
  //       unit: {
  //         name: "Bag",
  //         code: "cem425R",
  //       },
  //       quantity: "20000",
  //       classification: {
  //         description: "Cement for construction",
  //         scheme: "ДК021",
  //         id: "44111200-5",
  //       },
  //       delivery_date: {
  //         end_date: "2025-06-15",
  //       },
  //       delivery_address: {
  //         street_address: "Lot 5, Borrowdale Road, Harare",
  //         region: "Harare",
  //         postal_code: "00000",
  //         country_name: "Zimbabwe",
  //       },
  //     },
  //     {
  //       id: "1c6e9a50-4f42-430c-9dfd-8b08743f88cc",
  //       description: "Steel Reinforcement Bars",
  //       unit: {
  //         name: "Ton",
  //         code: "steelRB500",
  //       },
  //       quantity: "500",
  //       classification: {
  //         description: "Steel bars for reinforcement",
  //         scheme: "ДК021",
  //         id: "44112000-8",
  //       },
  //       delivery_date: {
  //         end_date: "2025-06-20",
  //       },
  //       delivery_address: {
  //         street_address: "Industrial Zone, Harare South",
  //         region: "Harare",
  //         postal_code: "00000",
  //         country_name: "Zimbabwe",
  //       },
  //     },
  //     {
  //       id: "f23db6e1-2c19-4746-80a2-3b0d97d7c1ef",
  //       description: "Concrete Blocks 400x200x200mm",
  //       unit: {
  //         name: "Block",
  //         code: "concreteB400",
  //       },
  //       quantity: "10000",
  //       classification: {
  //         description: "Concrete blocks for building",
  //         scheme: "ДК021",
  //         id: "44114100-3",
  //       },
  //       delivery_date: {
  //         end_date: "2025-06-25",
  //       },
  //       delivery_address: {
  //         street_address: "Cnr 2nd & Kwame Nkrumah, Harare",
  //         region: "Harare",
  //         postal_code: "00000",
  //         country_name: "Zimbabwe",
  //       },
  //     },
  //     {
  //       id: "b0e8e0a4-8a7d-4b44-9d7f-5f947f60752e",
  //       description: "River Sand",
  //       unit: {
  //         name: "Cubic Meter",
  //         code: "sandRM3",
  //       },
  //       quantity: "3000",
  //       classification: {
  //         description: "Natural river sand for construction",
  //         scheme: "ДК021",
  //         id: "44113120-6",
  //       },
  //       delivery_date: {
  //         end_date: "2025-06-30",
  //       },
  //       delivery_address: {
  //         street_address: "Site 18, Mabvuku-Tafara, Harare",
  //         region: "Harare",
  //         postal_code: "00000",
  //         country_name: "Zimbabwe",
  //       },
  //     },
  //   ],
  // });

  const [formData, setFormData] = useState({
    title: "Government Office Furnishings",
    expected_value: "189500",
    currency: "USD",
    procurement_method: "selective",
    customer_name: "Public Works Department",
    edrpou_code: "PWD-FURN2024",
    location: "Government Complex, Harare",
    contact_person: "Farai Muponda",
    phone_number: "0773344556",
    award_status: "pending",
    contract_status: "active",
    email: "fmuponda@pwd.gov.zw",
    procurement_category_id: "3",
    procurement_subcategory_id: "11",
    unit: "item",
    tender_status: "active",
    confidentiality: "Private",
    document_type: "Tender Notice",
    classifier_code: "39120000-6",
    tender_start_date: "2025-05-08T07:54",
    closing_date: "2025-07-15T07:55",
    delivery_date: "2026-01-07T07:55",
    items: [
      {
        id: "e5f6g7h8-5678-9101-1121-314151617181",
        description: "Ergonomic Office Chairs",
        unit: { name: "Piece", code: "CHAIR-ERG02" },
        quantity: "500",
        classification: {
          description: "Office seating furniture",
          scheme: "CPV",
          id: "39121000-3",
        },
        delivery_date: { end_date: "2025-09-15" },
        delivery_address: {
          street_address: "New Government Complex, Harare",
          region: "Harare",
          postal_code: "00263",
          country_name: "Zimbabwe",
        },
      },
      {
        id: "f6g7h8i9-6789-1011-1213-141516171819",
        description: "Modular Workstations",
        unit: { name: "Set", code: "WORK-MOD01" },
        quantity: "200",
        classification: {
          description: "Office furniture systems",
          scheme: "CPV",
          id: "39122000-0",
        },
        delivery_date: { end_date: "2025-09-30" },
        delivery_address: {
          street_address: "Provincial Offices, Masvingo",
          region: "Masvingo",
          postal_code: "00263",
          country_name: "Zimbabwe",
        },
      },
    ],
  });

  // const [formData, setFormData] = useState({
  //   title: "IT Infrastructure Upgrade",
  //   expected_value: "875000",
  //   currency: "USD",
  //   procurement_method: "open",
  //   customer_name: "TechSolutions Africa",
  //   edrpou_code: "TSA2024IT",
  //   location: "12 Nelson Mandela Ave, Harare, Zimbabwe",
  //   contact_person: "Sarah Chikomba",
  //   phone_number: "0775123456",
  //   email: "sarahc@techsolutions.africa",
  //   procurement_category_id: "4",
  //   procurement_subcategory_id: "103",
  //   unit: "unit",
  //   award_status: "pending",
  //   classifier_code: "30200000-1",
  //   document_type: "Tender Notice",
  //   tender_status: "active",
  //   confidentiality: "Public",
  //   contract_status: "active",
  //   items: [
  //     {
  //       id: "a1b2c3d4-1234-5678-9101-112131415161",
  //       description: "High-Performance Laptops",
  //       unit: { name: "Unit", code: "LT-HP24" },
  //       quantity: "150",
  //       classification: {
  //         description: "Enterprise-grade computing devices",
  //         scheme: "UNSPSC",
  //         id: "43211505",
  //       },
  //       delivery_date: { end_date: "2025-07-15" },
  //       delivery_address: {
  //         street_address: "Tech Park Zone 4, Harare",
  //         region: "Harare",
  //         postal_code: "00263",
  //         country_name: "Zimbabwe",
  //       },
  //     },
  //     {
  //       id: "b2c3d4e5-2345-6789-1011-121314151617",
  //       description: "Network Storage Solutions",
  //       unit: { name: "Rack Unit", code: "NAS-48U" },
  //       quantity: "20",
  //       classification: {
  //         description: "Enterprise storage systems",
  //         scheme: "UNSPSC",
  //         id: "43211601",
  //       },
  //       delivery_date: { end_date: "2025-07-30" },
  //       delivery_address: {
  //         street_address: "Data Center Complex, Mt. Pleasant",
  //         region: "Harare",
  //         postal_code: "00263",
  //         country_name: "Zimbabwe",
  //       },
  //     },
  //   ],
  //   tender_start_date: "2025-05-08T07:54",
  //   closing_date: "2025-07-15T07:55",
  //   delivery_date: "2026-01-07T07:55",
  // });

  const [enumOptions, setEnumOptions] = useState({
    document_types: [],
    tender_statuses: [],
    confidentiality_types: [],
    procurement_methods: [],
    award_statuses: [],
    contract_statuses: [],
    user_roles: [],
  });

  const [procurementCategories, setprocurementCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnumOptions = async () => {
      try {
        const [
          document_types,
          tender_statuses,
          confidentiality_types,
          procurement_methods,
          award_statuses,
          contract_statuses,
          user_roles,
          procurement_cats,
        ] = await Promise.all([
          axios.get("http://localhost:8000/enums/document-type"),
          axios.get("http://localhost:8000/enums/tender-status"),
          axios.get("http://localhost:8000/enums/confidentiality"),
          axios.get("http://localhost:8000/enums/procurement-method"),
          axios.get("http://localhost:8000/enums/award_status"),
          axios.get("http://localhost:8000/enums/contract_status"),
          axios.get("http://localhost:8000/enums/user-role"),
          axios.get("http://localhost:8000/categories"),
        ]);

        const transformToValueLabel = (data) =>
          data.map((item) => {
            // Ensure capitalization for document types (for form components)
            const label =
              typeof item === "string"
                ? item.charAt(0).toUpperCase() +
                  item.slice(1).toLowerCase().replace(/_/g, " ")
                : item.value.charAt(0).toUpperCase() +
                  item.value.slice(1).toLowerCase().replace(/_/g, " ");

            return {
              value: item.value || item,
              label,
            };
          });

        setEnumOptions({
          document_types: document_types.data.map((item) =>
            formatText(item.value)
          ),
          confidentiality_types: confidentiality_types.data.map((item) =>
            formatText(item.value)
          ),

          tender_statuses: transformToValueLabel(tender_statuses.data),
          procurement_methods: transformToValueLabel(procurement_methods.data),
          award_statuses: transformToValueLabel(award_statuses.data),
          contract_statuses: transformToValueLabel(contract_statuses.data),
          user_roles: transformToValueLabel(user_roles.data),
        });

        setprocurementCategories(procurement_cats.data);
      } catch (error) {
        console.error("Error fetching enum options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnumOptions();
  }, []);

  useEffect(() => {
    console.log(" FormData:", formData);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tenderData = new FormData();
    tenderData.append("tender_in", JSON.stringify(formData));

    documents.forEach((file) => {
      tenderData.append("documents", file);
    });

    try {
      const token = Cookies.get("p_at");

      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      const response = await axios.post(
        "http://localhost:8000/tenders/",
        tenderData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setToastMessage("Tender created successfully!");
      setToastType("success");
      setShowToast(true);
      setTimeout(() => {
        navigate(`/procurers/tender/${response.data.tender_id}`);
      }, 2000);
    } catch (error) {
      setToastMessage("Could not create tender, please try again.");
      setToastType("error");
    } finally {
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading form options...</div>
      </div>
    );
  }

  const renderSelect = (name, options, label) => (
    <div className="space-y-2">
      <label className="text-sm text-gray-600">{label}</label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
        required
      >
        <option value="">Select {label}</option>
        {options.map((option, index) => (
          <option key={`${name}-${option.value}-${index}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      {showToast && <Toast message={toastMessage} type={toastType} />}

      <Header user_type="procurer" />
      <div className="bg-gray-50 min-h-screen pb-8">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between mb-6 space-y-2 md:space-y-0">
            <span className="text-gray-600">New Tender Registration</span>
            <span className="text-primary break-words">Registration Form</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Tender Information */}
            <BasicInfoCard
              formData={formData}
              handleChange={handleChange}
              enumOptions={enumOptions}
              renderSelect={renderSelect}
              categories={procurementCategories}
            />

            {/* Items Section */}
            <ItemsInfoCard formData={formData} setFormData={setFormData} />

            {/* Documents Section */}
            <DocumentInfoCard
              documents={documents}
              setDocuments={setDocuments}
              document_type={formData.document_type}
              setDocumentType={(value) =>
                setFormData({ ...formData, document_type: value })
              }
              confidentiality={formData.confidentiality}
              setConfidentiality={(value) =>
                setFormData({ ...formData, confidentiality: value })
              }
              enumOptions={enumOptions}
            />

            <DatesInfoCard formData={formData} handleChange={handleChange} />

            <StatusInfoCard
              formData={formData}
              enumOptions={enumOptions}
              renderSelect={renderSelect}
            />

            <CustomerInfoCard formData={formData} handleChange={handleChange} />

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                className="w-full bg-primary text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Submit Tender
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TenderRegistrationForm;
