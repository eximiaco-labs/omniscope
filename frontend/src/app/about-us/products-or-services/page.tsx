"use client";

import { Heading } from "@/components/catalyst/heading";
import { gql, useQuery } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GET_OFFERS = gql`
  query GetOffers {
    offers {
      slug
      name
      coverImageUrl
    }
  }
`;

export default function ProductsOrServices() {
  const { loading, error, data } = useQuery(GET_OFFERS, { ssr: true });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const OfferCard = ({ offer }: { offer: any }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Link 
        href={`products-or-services/${offer.slug}`} 
        className="block transition-all duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className={`h-full ${isHovered ? 'shadow-lg scale-105' : 'shadow'} transition-all duration-300`}>
          <CardContent className="flex flex-col items-center p-4">
            <div className="w-full h-48 relative mb-2">
              <Image
                src={offer.coverImageUrl}
                alt={`${offer.name} cover`}
                layout="fill"
                objectFit="cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <CardHeader className="p-0 mt-2">
              <CardTitle className={`text-center text-sm ${isHovered ? 'font-semibold' : ''} transition-all duration-300`}>
                {offer.name}
              </CardTitle>
            </CardHeader>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Products and Services</Heading>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.offers.map((offer: any) => (
            <OfferCard key={offer.slug} offer={offer} />
          ))}
        </div>
      </div>
    </>
  );
}