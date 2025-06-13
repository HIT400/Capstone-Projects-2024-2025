import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  ArrowRight,
  Building2,
  Users,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/both/Header";
import Footer from "../../components/public/Footer";

const NavigationTabs = () => {
  return (
    <nav className="border-b mb-6 overflow-x-auto">
      <div className="flex gap-4 sm:gap-8 whitespace-nowrap">
        {["Procurements", "Contracts", "Plans", "Frameworks", "Products"].map(
          (tab) => (
            <a
              key={tab}
              href="#"
              className={`pb-4 ${
                tab === "Procurements"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-600"
              }`}
            >
              {tab}
            </a>
          )
        )}
      </div>
    </nav>
  );
};

const SearchBar = () => {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Procurement subject, CPV code, purchase ID, organization identifier"
        className="w-full p-3 pr-10 border rounded-lg"
      />
      <Search
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        size={20}
      />
    </div>
  );
};

const FilterButtons = () => {
  const filters = [
    "Buyer",
    "Bidder",
    "Procuring entity",
    "CPV",
    "Stage",
    "Procurement type",
    "Region",
    "All filters ›",
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
      {filters.map((filter) => (
        <button
          key={filter}
          className="px-4 py-2 rounded-full bg-gray-100 text-sm hover:bg-gray-200 text-gray-700"
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

const Banner = () => {
  return (
    <div className="bg-primary text-white rounded-lg mb-8 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center">
        <div className="p-6 sm:p-8 flex-1">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">
            Discover possibilities of fully transparent e-procurement system
          </h2>
          <button className="mt-4 bg-white text-primary px-6 py-2 rounded-full inline-flex items-center">
            Learn more
            <ArrowRight className="ml-2" size={18} />
          </button>
        </div>
        <div className="w-full md:w-1/3">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTayzHjcMBj4LbA6aTUMPD9CFOOncs8fUHVzQ&s"
            alt="Kiev cityscape"
            className="w-full h-40 md:h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

const NewcomerSection = () => {
  const categories = [
    { icon: <FileText size={24} />, title: "Business" },
    { icon: <Building2 size={24} />, title: "Buyers" },
    { icon: <Users size={24} />, title: "Civil society" },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold mb-4">
        Newcomer to public procurement? Learn about the first steps
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map(({ icon, title }) => (
          <a
            key={title}
            href="#"
            className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <span className="text-secondary mr-3">{icon}</span>
            <span className="text-secondary">{title}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8000/categories")
      .then((response) => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading categories...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Procurement categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {categories.map((category) => (
          <React.Fragment key={category.id}>
            <button
              onClick={() =>
                setSelectedCategoryId(
                  selectedCategoryId === category.id ? null : category.id
                )
              }
              className={`p-4 border rounded-lg hover:bg-gray-50 flex items-center text-left w-full ${
                selectedCategoryId === category.id ? "bg-gray-50" : ""
              }`}
            >
              <span className="text-secondary mr-3">
                <FileText size={24} />
              </span>
              <span className="text-secondary">{category.name}</span>
            </button>

            {selectedCategoryId === category.id && (
              <div className="col-span-full">
                <CategoryDetail
                  category={category}
                  onBack={() => setSelectedCategoryId(null)}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const CategoryDetail = ({ category, onBack }) => {
  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-semibold mb-6">
        All procurements in the category {category.name}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
        {category.subcategories.map((subcat) => (
          <Link
            key={subcat.id}
            to={`/suppliers/tenders/${subcat.id}`}
            className="flex items-center text-tertiary hover:underline py-2"
          >
            <ChevronRight className="mr-2 flex-shrink-0" size={16} />
            <span>{subcat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const SupplierMainContent = () => {
  return (
    <>
      <Header user_type="supplier" />
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <NavigationTabs />
          <SearchBar />
          <FilterButtons />
          <Banner />
          <NewcomerSection />
          <CategoryGrid />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SupplierMainContent;
