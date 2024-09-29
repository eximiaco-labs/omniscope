import { Heading } from "@/components/catalyst/heading";

export default function Consultants() {
  return (
    <Heading>Consultants & Engineers</Heading>
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