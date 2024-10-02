"use client";

import { Avatar } from "@/components/catalyst/avatar";
import { Heading } from "@/components/catalyst/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/catalyst/table";
import { gql, useQuery } from "@apollo/client";

export default function ConsultantsAndEngineers() {
  const GET_CONSULTANTS = gql`
    query GetConsultants {
      consultantsAndEngineers {
        slug
        name
        position
        photoUrl
        omniUrl
      }
    }
  `;
  const { loading, error, data } = useQuery(GET_CONSULTANTS, { ssr: true });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Consultants & Engineers</Heading>
      </div>

      <Table className="[--gutter:theme(spacing.6)] sm:[--gutter:theme(spacing.8)]">
        <TableHead>
          <TableRow>
            <TableHeader>Consultant</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.consultantsAndEngineers.map((w: any) => (
            <TableRow href={w.omniUrl}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Avatar src={w.photoUrl} className="size-12" />
                  <div>
                    <div className="font-medium">{w.name}</div>
                    <div className="text-zinc-500">
                      {w.position.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {data.consultantsAndEngineers.map((w: any) => {
            <TableRow>
              <TableCell>
                {w.name}
                {/* <div className="flex items-center gap-4">
                  <Avatar src={w.photoUrl} className="size-12" />
                  <div>
                    <div className="font-medium">{w.name}</div>
                    <div className="text-zinc-500">
                      <a href="#" className="hover:text-zinc-700">
                        {w.position}
                      </a>
                    </div>
                  </div>
                </div> */}
              </TableCell>
            </TableRow>;
          })}
        </TableBody>
      </Table>
    </>
  );
}

// import { Grid } from "@/components/catalyst/grid";
// import { Card } from "@/components/catalyst/card";
// import { Avatar } from "@/components/catalyst/avatar";
// import { Text } from "@/components/catalyst/text";
// import { gql } from "@apollo/client";
// import { getClient } from "@/lib/client";

// const GET_CONSULTANTS = gql`
//   query GetConsultants {
//     consultantsAndEngineers {
//       slug
//       name
//       position
//       photoUrl
//     }
//   }
// `;

// async function getConsultants() {
//   const client = getClient();
//   const { data } = await client.query({ query: GET_CONSULTANTS });
//   return data.consultantsAndEngineers;
// }

// export default async function Consultants() {
//   const consultants = await getConsultants();

//   return (
//     <>
//       <Heading>Consultants & Engineers</Heading>
//       <Grid columns={{ initial: "1", sm: "2", md: "3", lg: "4" }} gap="5">
//         {consultants.map((consultant) => (
//           <Card key={consultant.slug}>
//             <Avatar
//               src={consultant.photoUrl}
//               fallback={consultant.name.charAt(0)}
//               size="9"
//             />
//             <Text as="h3" weight="semibold">
//               {consultant.name}
//             </Text>
//             <Text>{consultant.position}</Text>
//           </Card>
//         ))}
//       </Grid>
//     </>
//   );
// }
