import { GetServerSidePropsContext } from "next";
import { PublicationData } from "~/components/book-card";
import { prisma } from "~/server/db";

export default function PublicationDetail(props: { publication : PublicationData}) {
    const {publication} = props;
    return (
        <div className="text-black text-[30px]">
            {publication?.book?.title}
        </div>
    )
} 

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const pubId = ctx.params?.id as string;
    const pubFound = await prisma.bookPublication.findUnique({
      where: { id: pubId ? pubId : "" },
      include: {
        book: true,
        images: true,
      }
    });
    const parsedDatePub = {
        ...pubFound,
        createdAt: JSON.parse(JSON.stringify(pubFound?.createdAt)),
        updatedAt: JSON.parse(JSON.stringify(pubFound?.updatedAt))
    }
    return {
      props: {
        publication: parsedDatePub,
      },
    };
  }