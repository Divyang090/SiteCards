// VendorsPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../Components/AuthContext";
import { BASE_URL } from "../Configuration/Config";
import {
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  TagIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [expandedVendor, setExpandedVendor] = useState(null);
  const { authFetch } = useAuth();

  // Extract all unique tags
  const allTags = React.useMemo(() => {
    const tagsSet = new Set();
    vendors.forEach(vendor => {
      if (Array.isArray(vendor.tags)) {
        vendor.tags
          .filter(tag => tag && tag !== "null")
          .forEach(tag => tagsSet.add(tag.trim()));
      }
    });
    return ["all", ...Array.from(tagsSet).sort()];
  }, [vendors]);

  const fetchVendors = async () => {
    try {
      const res = await authFetch(`${BASE_URL}/vendors/vendors`);

      if (!res.ok) throw new Error("Failed to fetch vendors");

      const data = await res.json();
      setVendors(data.vendors || []);
      setFilteredVendors(data.vendors || []);
    } catch (error) {
      console.error("Fetch Vendors Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter vendors based on search and tag selection
  useEffect(() => {
    let result = vendors;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(vendor => {
        const companyName = (vendor.company_name || "").toLowerCase();
        const contactPerson = (vendor.contact_person || "").toLowerCase();
        const email = (vendor.vendor_email || "").toLowerCase();
        const tags = Array.isArray(vendor.tags) ? vendor.tags.map(tag => tag.toLowerCase()) : [];

        return (
          companyName.includes(term) ||
          contactPerson.includes(term) ||
          email.includes(term) ||
          tags.some(tag => tag.includes(term))
        );
      });
    }

    // Apply tag filter
    if (selectedTag !== "all") {
      result = result.filter(vendor => {
        const tags = Array.isArray(vendor.tags)
          ? vendor.tags.map(tag => tag && tag.trim())
          : [];
        return tags.includes(selectedTag);
      });
    }

    setFilteredVendors(result);
  }, [vendors, searchTerm, selectedTag]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const toggleVendorExpansion = (vendorId) => {
    setExpandedVendor(expandedVendor === vendorId ? null : vendorId);
  };

  return (
    <div className=" bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary dark:from-theme-bg-primary dark:to-theme-bg-secondary py-8 px-4 md:px-10">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold theme-text-primary mb-3">
            Vendor Directory
          </h1>
          <p className="text-lg theme-text-secondary max-w-3xl mx-auto">
            Find and connect with our trusted network of vendors and partners
          </p>
        </div>

        {/* Controls Section */}
        <div className="mb-8 theme-bg-primary rounded-2xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search vendors by name, contact, or tag..."
                className="w-full pl-10 pr-4 py-3 border border-blue-500 rounded-xl theme-bg-secondary theme-text-secondary focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Tag Filter */}
            <div className="flex items-center gap-3">
              <FunnelIcon className="h-5 w-5 text-gray-500" />
              <select
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag === "all" ? "All Vendors" : `#${tag}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Showing <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredVendors.length}</span> of <span className="font-semibold">{vendors.length}</span> vendors
            </span>
            {selectedTag !== "all" && (
              <button
                onClick={() => setSelectedTag("all")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition flex items-center gap-1"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading vendors...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredVendors.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-6">
              <BuildingOfficeIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No vendors found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
              {searchTerm || selectedTag !== "all"
                ? "Try adjusting your search or filter to find what you're looking for."
                : "No vendors are currently available in the directory."}
            </p>
            {(searchTerm || selectedTag !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedTag("all");
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Vendors List */}
        {!loading && filteredVendors.length > 0 && (
          <div className="space-y-4">
            {filteredVendors.map((vendor) => {
              const companyName = vendor.company_name;
              const contactPerson = vendor.contact_person;
              const email = vendor.vendor_email;
              const phone = vendor.contact_number;
              const address = vendor.address;
              const website = vendor.website;

              const tags = Array.isArray(vendor.tags)
                ? vendor.tags.filter((t) => t && t !== "null").map(tag => tag.trim())
                : [];

              const isExpanded = expandedVendor === vendor.vendor_id;

              return (
                <div
                  key={vendor.vendor_id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  {/* Vendor Summary */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleVendorExpansion(vendor.vendor_id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Company Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl flex items-center justify-center">
                              <BuildingOfficeIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>

                          {/* Company Info */}
                          <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                              {companyName}
                            </h2>
                            
                            {contactPerson && contactPerson !== "null" && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
                                <UserIcon className="h-4 w-4" />
                                <span className="text-sm">{contactPerson}</span>
                              </div>
                            )}

                            {/* Tags */}
                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {tags.slice(0, 3).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {tags.length > 3 && (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    +{tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact Info & Expand Button */}
                      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start md:items-end lg:items-start gap-4">
                        <div className="flex flex-col gap-2">
                          {phone && phone !== "null" && (
                            <a
                              href={`tel:${phone}`}
                              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm whitespace-nowrap"
                            >
                              <PhoneIcon className="h-4 w-4" />
                              {phone}
                            </a>
                          )}
                          {email && email !== "null" && (
                            <a
                              href={`mailto:${email}`}
                              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm truncate"
                              title={email}
                            >
                              <EnvelopeIcon className="h-4 w-4" />
                              <span className="truncate max-w-[200px]">{email}</span>
                            </a>
                          )}
                        </div>

                        {/* Expand Button */}
                        <button
                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition ml-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVendorExpansion(vendor.vendor_id);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-6 animate-slideDown">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Details */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            Contact Information
                          </h3>
                          <div className="space-y-3">
                            {contactPerson && contactPerson !== "null" && (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                  <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Contact Person</p>
                                  <p className="font-medium text-gray-900 dark:text-white">{contactPerson}</p>
                                </div>
                              </div>
                            )}
                            
                            {phone && phone !== "null" && (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                  <PhoneIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                  <a href={`tel:${phone}`} className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition">
                                    {phone}
                                  </a>
                                </div>
                              </div>
                            )}
                            
                            {email && email !== "null" && (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                  <EnvelopeIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                  <a href={`mailto:${email}`} className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition truncate block">
                                    {email}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <TagIcon className="h-5 w-5" />
                            Additional Details
                          </h3>
                          <div className="space-y-3">
                            {address && address !== "null" && (
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                  <MapPinIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                                  <p className="font-medium text-gray-900 dark:text-white">{address}</p>
                                </div>
                              </div>
                            )}
                            
                            {website && website !== "null" && (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                  <GlobeAltIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                                  <a 
                                    href={website.startsWith('http') ? website : `https://${website}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition truncate block"
                                  >
                                    {website.replace(/^https?:\/\//, '')}
                                  </a>
                                </div>
                              </div>
                            )}
                            
                            {tags.length > 0 && (
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                  <TagIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tags & Categories</p>
                                  <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, idx) => (
                                      <span
                                        key={idx}
                                        className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
                        {phone && phone !== "null" && (
                          <a
                            href={`tel:${phone}`}
                            className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium flex items-center gap-2"
                          >
                            <PhoneIcon className="h-4 w-4" />
                            Call Vendor
                          </a>
                        )}
                        {email && email !== "null" && (
                          <a
                            href={`mailto:${email}`}
                            className="px-5 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium flex items-center gap-2"
                          >
                            <EnvelopeIcon className="h-4 w-4" />
                            Send Email
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VendorsPage;