import NextError from "next/error";
import { Collection } from "~/utils/types";
import { api } from "~/utils/api";
import SplideCarousel from "~/components/Home/Splide";
import MusicSection from "~/components/Home/MusicSection";
import Layout from "~/components/Layout/Layout";
import { serif } from "~/utils/fonts";
import { useState, useEffect } from "react";
import Head from "next/head";

export default function Home() {
  // Staggered loading state to avoid connection limit issues
  const [loadNewReleases, setLoadNewReleases] = useState(false);

  //Data Fetching
  const recentlyAddedId = "cljmx6n8c0000ua3czgt95ysp";
  const newReleasesId = "cmauprcnt0002hx9rn5qyji1q";

  const {
    data: recentlyAddedQueryData,
    error: recentlyAddedQueryError,
    isLoading: recentlyAddedQueryIsLoading,
    isError: recentlyAddedQueryIsError,
  } = api.collections.getById.useQuery(
    { id: recentlyAddedId },
    {
      retry: 2,
      retryDelay: 2000,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error("Error fetching recently added collection:", error);
      },
    }
  );

  // Only fetch new releases after recently added is loaded or failed
  const {
    data: newReleasesQueryData,
    error: newReleasesQueryError,
    isLoading: newReleasesQueryIsLoading,
    isError: newReleasesQueryIsError,
  } = api.collections.getById.useQuery(
    { id: newReleasesId },
    {
      retry: 2,
      retryDelay: 2000,
      refetchOnWindowFocus: false,
      enabled: loadNewReleases, // Only run this query when enabled
      onError: (error) => {
        console.error("Error fetching new releases collection:", error);
      },
    }
  );

  // Stagger loading to avoid connection limits
  useEffect(() => {
    if (!recentlyAddedQueryIsLoading && !loadNewReleases) {
      // Wait a short delay before loading the second collection
      const timer = setTimeout(() => {
        setLoadNewReleases(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [recentlyAddedQueryIsLoading, loadNewReleases]);

  // Default empty collection when data is undefined
  const defaultCollection: Collection = {
    id: "",
    name: "",
    userId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    albums: [],
  };

  // Transform the Prisma result to match our Collection type
  const transformCollection = (
    data: typeof recentlyAddedQueryData
  ): Collection => {
    if (!data) return defaultCollection;

    try {
      return {
        id: data.id,
        name: data.name,
        userId: data.userId ?? "",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        albums: data.albums.map((album) => ({
          id: album.id,
          name: album.name,
          label: album.label,
          artwork: album.artwork,
          year: album.year,
          artistId: album.artistId,
          createdAt: album.createdAt,
          updatedAt: album.updatedAt,
          artist: {
            id: album.artist.id,
            name: album.artist.name,
            bio: album.artist.bio,
            artwork: album.artist.artwork,
            createdAt: album.artist.createdAt,
            updatedAt: album.artist.updatedAt,
            albums: [],
          },
          listings: album.listings.map((listing) => ({
            id: listing.id,
            price: listing.price,
            currency: listing.currency,
            weight: listing.weight,
            format: listing.format,
            description: listing.description,
            condition: listing.condition,
            speed: listing.speed,
            stripeProduct: listing.stripeProduct,
            stripePrice: listing.stripePrice,
            stripeId: listing.stripeId,
            albumId: listing.albumId,
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
            orderId: listing.orderId,
          })),
          Collection: [],
        })),
      };
    } catch (error) {
      console.error("Error transforming collection data:", error);
      return defaultCollection;
    }
  };

  const recentlyAddedCollection = transformCollection(recentlyAddedQueryData);
  const newReleasesCollection = transformCollection(newReleasesQueryData);

  // Show loading state for the entire page if recently added is loading
  // (we'll show individual loading for new releases)
  if (recentlyAddedQueryIsLoading) {
    return (
      <Layout>
        <SplideCarousel />
        <section className="mx-auto flex w-full flex-col items-center justify-center overflow-hidden">
          <h1
            className={`mt-8 w-full text-center text-2xl text-white sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl ${serif.className}`}
          >
            SHOP MUSIC
          </h1>
          <div className="my-8 w-5/6 border-b border-gray-600" />
          <MusicSection
            title={"RECENTLY ADDED"}
            collection={defaultCollection}
            loading={true}
          />
          <div className="my-8 w-5/6 border-b border-gray-600" />
          <MusicSection
            title={"NEW RELEASES"}
            collection={defaultCollection}
            loading={true}
          />
          <div className="my-8 w-5/6 border-b border-gray-600" />
          <MusicSection
            title={"BEST SELLERS"}
            collection={defaultCollection}
            loading={true}
          />
          <div className="my-4" />
        </section>
      </Layout>
    );
  }

  // Handle 404 errors (collection not found) by showing empty sections
  const isNotFound = (error: typeof recentlyAddedQueryError) => {
    return error?.data?.code === "NOT_FOUND";
  };

  // For 500 errors, we still want to show the UI rather than crashing
  const hasError = (error: typeof recentlyAddedQueryError) => {
    return error && error.data?.code !== "NOT_FOUND";
  };

  const recentlyAddedNotFound = isNotFound(recentlyAddedQueryError);
  const newReleasesNotFound = isNotFound(newReleasesQueryError);
  const recentlyAddedHasError = hasError(recentlyAddedQueryError);
  const newReleasesHasError = hasError(newReleasesQueryError);

  // Show error message for server errors (but not 404s)
  // Only show the error page if recently added has a critical error
  if (recentlyAddedHasError) {
    return (
      <NextError
        title={recentlyAddedQueryError?.message || "Unknown error"}
        statusCode={recentlyAddedQueryError?.data?.httpStatus ?? 500}
      />
    );
  }

  return (
    <Layout>
      <SplideCarousel />
      <section className="mx-auto flex w-full flex-col items-center justify-center overflow-hidden">
        <h1
          className={`mt-8 w-full text-center text-2xl text-white sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl ${serif.className}`}
        >
          SHOP MUSIC
        </h1>
        <div className="my-8 w-5/6 border-b border-gray-600" />
        <MusicSection
          title={"RECENTLY ADDED"}
          collection={
            recentlyAddedNotFound || recentlyAddedHasError
              ? defaultCollection
              : recentlyAddedCollection
          }
          loading={recentlyAddedQueryIsLoading}
        />
        <div className="my-8 w-5/6 border-b border-gray-600" />
        <MusicSection
          title={"NEW RELEASES"}
          collection={
            !loadNewReleases || newReleasesNotFound || newReleasesHasError
              ? defaultCollection
              : newReleasesCollection
          }
          loading={!loadNewReleases || newReleasesQueryIsLoading}
        />
        <div className="my-8 w-5/6 border-b border-gray-600" />
        <MusicSection
          title={"BEST SELLERS"}
          collection={
            recentlyAddedNotFound || recentlyAddedHasError
              ? defaultCollection
              : recentlyAddedCollection
          }
          loading={recentlyAddedQueryIsLoading}
        />
        <div className="my-4" />
      </section>
    </Layout>
  );
}
