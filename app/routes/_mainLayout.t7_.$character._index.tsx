import { Table, Link as RadixLink, Heading } from "@radix-ui/themes";
import type { HeadersFunction } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { Link, useMatches } from "@remix-run/react";
import { ContentContainer } from "~/components/ContentContainer";
import type { TableId } from "~/types/TableId";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { commandToUrlSegment } from "~/utils/moveUtils";

import type { RouteHandle } from "~/types/RouteHandle";
import type { CharacterFrameData } from "~/types/CharacterFrameData";

const tableIdToDisplayName: Record<TableId, string> = {
  frames_normal: "Standard",
  frames_tenhit: "10 hit",
  frames_throws: "Throws",
};

export const headers: HeadersFunction = (args) => ({
  "Cache-Control": "public, max-age=300, s-maxage=300",
  "X-Td-Cachecontext": args.loaderHeaders.get("X-Td-Cachecontext") || "none",
});

export const meta: MetaFunction = ({ data, params, matches }) => {
  const frameData = matches.find(
    (m) => (m.handle as RouteHandle)?.type === "frameData"
  )?.data;
  if (!frameData) {
    return [
      {
        title: "TekkenDocs - Uknown character",
      },
      {
        description: `There is no character with the ID of ${params.character}.`,
      },
    ];
  }
  const { characterName } = frameData as CharacterFrameData;
  const characterId = characterName.toLocaleLowerCase();
  const characterTitle =
    characterName[0].toUpperCase() + characterName.substring(1);
  const title = `${characterTitle} Tekken 7 Frame Data | TekkenDocs`;
  const description = `Frame data for ${characterTitle} in Tekken 7`;

  return [
    { title },
    { description },
    { property: "og:title", content: title },
    { property: "description", content: description },
    { property: "og:description", content: description },
    { property: "og:image", content: `/t7/avatars/${characterTitle}.jpg` },
    {
      tagName: "link",
      rel: "canonical",
      href: "https://tekkendocs.com/t7/" + characterId,
    },
  ];
};

export default function Index() {
  const matches = useMatches();
  const frameData = matches.find(
    (m) => (m.handle as RouteHandle)?.type === "frameData"
  )?.data;
  if (!frameData) {
    return <div>Could not load data</div>;
  }
  const { tables, editUrl, characterName } = frameData as CharacterFrameData;
  if (tables.length === 0) {
    return <div>Invalid or no data</div>;
  }
  return (
    <>
      <ContentContainer enableTopPadding>
        <div className="flex justify-between items-center">
          <Heading as="h1" my="2" className="capitalize">
            {characterName}
          </Heading>
          <a
            className="flex items-center gap-2"
            style={{ color: "var(--accent-a11" }}
            target="blank"
            href={editUrl}
          >
            <Pencil1Icon />
            Edit
          </a>
        </div>
      </ContentContainer>
      <ContentContainer disableXPadding>
        {tables.map((table) => {
          const columnNums = (table.headers || table.rows[0]).map(
            (_, index) => index
          );
          return (
            <section key={table.name} className="mt-8">
              <ContentContainer>
                <Heading as="h2" mb="4" size="4">
                  {tableIdToDisplayName[table.name]}
                </Heading>
              </ContentContainer>
              <Table.Root variant="surface" style={{ width: "100%" }}>
                {table.headers && (
                  <Table.Header>
                    <Table.Row>
                      {table.headers.map((h) => (
                        <Table.ColumnHeaderCell key={h}>
                          {h}
                        </Table.ColumnHeaderCell>
                      ))}
                    </Table.Row>
                  </Table.Header>
                )}
                <Table.Body>
                  {table.rows.map((row, i) => {
                    return (
                      <Table.Row key={row[0]}>
                        {columnNums.map((j) => {
                          const cell = row[j] || "";
                          if (j === 0 && table.name === "frames_normal") {
                            //this is a command, so make it link
                            return (
                              <Table.Cell key={j}>
                                <RadixLink asChild>
                                  <Link
                                    className="text-[#ab6400]"
                                    style={{ textDecoration: "none" }}
                                    to={commandToUrlSegment(cell)}
                                  >
                                    {cell}
                                  </Link>
                                </RadixLink>
                              </Table.Cell>
                            );
                          }
                          return <Table.Cell key={j}>{cell}</Table.Cell>;
                        })}
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </section>
          );
        })}
      </ContentContainer>
    </>
  );
}
