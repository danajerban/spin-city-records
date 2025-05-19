import NextError from "next/error";
import { Collection } from "~/utils/types";
import { api } from "~/utils/api";
import SplideCarousel from "~/components/Home/Splide";
import MusicSection from "~/components/Home/MusicSection";
import Layout from "~/components/Layout/Layout";
import { serif } from "~/utils/fonts";
import Head from "next/head";

export default function Home() {
  //Data Fetching
  const recentlyAddedId = "cljmx6n8c0000ua3czgt95ysp";
  const newReleasesId = "cmauprcnt0002hx9rn5qyji1q";

  const {
    data: recentlyAddedQueryData,
    error: recentlyAddedQueryError,
    isLoading: recentlyAddedQueryIsLoading,
    isError: recentlyAddedQueryIsError,
  } = api.collections.getById.useQuery({ id: recentlyAddedId });

  const {
    data: newReleasesQueryData,
    error: newReleasesQueryError,
    isLoading: newReleasesQueryIsLoading,
    isError: newReleasesQueryIsError,
  } = api.collections.getById.useQuery({ id: newReleasesId });

  // Error Handling
  if (recentlyAddedQueryIsError || newReleasesQueryIsError) {
    return (
      <NextError
        title={
          recentlyAddedQueryError?.message || newReleasesQueryError?.message
        }
        statusCode={
          recentlyAddedQueryError?.data?.httpStatus ??
          newReleasesQueryError?.data?.httpStatus ??
          500
        }
      />
    );
  }

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
  };

  const recentlyAddedCollection = transformCollection(recentlyAddedQueryData);
  const newReleasesCollection = transformCollection(newReleasesQueryData);

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
          collection={recentlyAddedCollection}
          loading={recentlyAddedQueryIsLoading}
        />
        <div className="my-8 w-5/6 border-b border-gray-600" />
        <MusicSection
          title={"NEW RELEASES"}
          collection={newReleasesCollection}
          loading={newReleasesQueryIsLoading}
        />
        <div className="my-8 w-5/6 border-b border-gray-600" />
        <MusicSection
          title={"BEST SELLERS"}
          collection={recentlyAddedCollection}
          loading={recentlyAddedQueryIsLoading}
        />
        <div className="my-4" />
      </section>
    </Layout>
  );
}
