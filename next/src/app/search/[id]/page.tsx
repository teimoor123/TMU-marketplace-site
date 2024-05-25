"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase/config";
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  query,
  where,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import Link from "next/link";
import dynamic from "next/dynamic";

// Import search section without server side rendering
const SearchSectionNoSSR = dynamic(
  () => import("@/components/navbar/search").then((mod) => mod.SearchSection),
  {
    ssr: false,
  }
);

export default function SearchResults({ params }: { params: { id: string } }) {
  // States for search query
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDocs, setFilteredDocs] = useState<
    QueryDocumentSnapshot<DocumentData, DocumentData>[]
  >([]);

  // Fetch listings collection from firestore
  const [listings, loading, error] = useCollection(collection(db, "listings"), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  useEffect(() => {
    if (searchQuery == "") {
      // set initial query from params if empty
      setSearchQuery(params.id);
    }
    if (listings) {
      console.log(
        "Listings loaded:",
        listings.docs.map((doc) => doc.data())
      ); // Log loaded listings data
      const filtered = listings.docs.filter((doc) => {
        const listing = doc.data();
        // Log each listing name and search query for comparison
        console.log(
          "Comparing listing:",
          listing.name.toLowerCase(),
          "with query:",
          searchQuery.toLowerCase()
        );
        return listing.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      console.log(
        "Filtered results:",
        filtered.map((doc) => doc.data())
      ); // Log filtered listings
      setFilteredDocs(filtered);
    }
  }, [listings, searchQuery]);

  // This handles the search input from the SearchBar component
  const handleSearch = (query: string) => {
    console.log("Search initiated for query:", query);
    setSearchQuery(query);
  };

  // Log error if exists
  if (error) console.log("Error loading listings:", error);

  return (
    <div className="flex flex-col min-h-screen">
      <SearchSectionNoSSR onSearch={handleSearch} />
      <div className="container mx-auto p-4">
        {loading && <p>Loading listings...</p>}
        {error && <p>Error loading listings: {error.message}</p>}
        {!loading && filteredDocs.length === 0 && (
          <p>No results found for &quot;{searchQuery}&quot;</p>
        )}
        {filteredDocs.map((doc) => {
          const listing = doc.data();
          return (
            <Link
              href={`/posting/${doc.id}`}
              key={doc.id}
              className="flex gap-2 hover:opacity-80 my-2"
            >
              <img
                className="w-[200px] h-[200px] rounded-xl object-cover"
                src={listing.image}
                alt="Listing image"
              />
              <div className="flex flex-col">
                <div className="font-bold text-lg">{listing.name}</div>
                <div className="capitalize">{listing.posterName}</div>
                <div className="capitalize">
                  {listing.date?.toDate().toISOString().split("T")[0]}
                </div>
                <div className="opacity-80 pt-4">{listing.description}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
